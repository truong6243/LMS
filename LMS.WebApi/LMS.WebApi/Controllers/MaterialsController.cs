using LMS.WebApi.DAL;
using LMS.WebApi.Models;
using LMS.WebApi.Security;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Http;

namespace LMS.WebApi.Controllers
{
    [RoutePrefix("api/materials")]
    [Authorize] // yêu cầu phải đăng nhập bằng JWT
    public class MaterialsController : ApiController
    {
        // GET /api/materials/published?skip=0&take=20
        [HttpGet, Route("published")]
        [AllowAnonymous] // công khai, ai cũng xem được
        public IHttpActionResult Published(int skip = 0, int take = 20)
        {
            var list = new List<MaterialListItem>();
            using (var cn = DatabaseHelper.Open())
            using (var cmd = DatabaseHelper.Sql(cn, @"
                SELECT MaterialId, Title, Slug, Status, UpdatedAt
                FROM lms.Materials
                WHERE Status=3
                ORDER BY UpdatedAt DESC
                OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY"))
            {
                cmd.Parameters.AddWithValue("@skip", skip);
                cmd.Parameters.AddWithValue("@take", take);
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        list.Add(new MaterialListItem
                        {
                            MaterialId = (int)r["MaterialId"],
                            Title = r["Title"].ToString(),
                            Slug = r["Slug"] as string,
                            Status = (short)r["Status"],
                            UpdatedAt = (System.DateTime)r["UpdatedAt"]
                        });
                    }
                }
            }
            return Ok(new { ok = true, data = list });
        }

        // GET /api/materials/manage
        [HttpGet, Route("manage")]
        [RequireAction("MATERIAL_MANAGE")]
        public IHttpActionResult Manage()
        {
            // Ví dụ: chỉ hiển thị học liệu mà người dùng có quyền chỉnh sửa
            var list = new List<MaterialListItem>();
            using (var cn = DatabaseHelper.Open())
            using (var cmd = DatabaseHelper.Sql(cn, @"
                SELECT m.MaterialId, m.Title, m.Status, m.UpdatedAt
                FROM lms.Materials m
                INNER JOIN lms.MaterialUserPerm p ON m.MaterialId = p.MaterialId
                WHERE p.UserId = @uid"))
            {
                cmd.Parameters.AddWithValue("@uid", Security.UserContext.CurrentUserId());
                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        list.Add(new MaterialListItem
                        {
                            MaterialId = (int)r["MaterialId"],
                            Title = r["Title"].ToString(),
                            Status = (short)r["Status"],
                            UpdatedAt = (System.DateTime)r["UpdatedAt"]
                        });
                    }
                }
            }
            return Ok(new { ok = true, data = list });
        }

        // POST /api/materials/upload
        [HttpPost, Route("upload")]
        [RequireAction("MATERIAL_UPLOAD")]
        public IHttpActionResult Upload([FromBody] MaterialUploadRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Title))
                return BadRequest("Title is required");

            var userId = UserContext.CurrentUserId();
            if (userId <= 0)
                return Unauthorized();

            try
            {
                using (var cn = DatabaseHelper.Open())
                {
                    // Generate slug from title (tạo slug tiếng Việt chuẩn)
                    string slug = GenerateSlug(req.Title);
                    
                    // Tạo material mới với Status = 0 (Draft)
                    int materialId;
                    using (var cmd = DatabaseHelper.Sql(cn, @"
                        INSERT INTO lms.Materials (Title, Slug, OwnerUserId, Status, CreatedAt, UpdatedAt)
                        OUTPUT INSERTED.MaterialId
                        VALUES (@title, @slug, @ownerId, 0, SYSUTCDATETIME(), SYSUTCDATETIME())"))
                    {
                        cmd.Parameters.AddWithValue("@title", req.Title);
                        cmd.Parameters.AddWithValue("@slug", slug);
                        cmd.Parameters.AddWithValue("@ownerId", userId);
                        materialId = (int)cmd.ExecuteScalar();
                    }

                    // Nếu có fileUrl, lưu thông tin file
                    if (!string.IsNullOrEmpty(req.FileUrl))
                    {
                        using (var cmd = DatabaseHelper.Sql(cn, @"
                            UPDATE lms.Materials 
                            SET SourceFilePath = @path, 
                                SourceFileType = @type,
                                UpdatedAt = SYSUTCDATETIME()
                            WHERE MaterialId = @id"))
                        {
                            cmd.Parameters.AddWithValue("@id", materialId);
                            cmd.Parameters.AddWithValue("@path", req.FileUrl);
                            cmd.Parameters.AddWithValue("@type", req.FileName ?? ".docx");
                            cmd.ExecuteNonQuery();
                        }
                    }

                    return Ok(new { ok = true, materialId, slug, message = "Material uploaded successfully" });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET /api/materials/{id}
        [HttpGet, Route("{id:int}")]
        [AllowAnonymous]
        public IHttpActionResult GetById(int id)
        {
            using (var cn = DatabaseHelper.Open())
            using (var cmd = DatabaseHelper.Sql(cn, @"
                SELECT MaterialId, Title, Slug, Status, HtmlContent, 
                       SourceFilePath, SourceFileType, 
                       CreatedAt, UpdatedAt, OwnerUserId
                FROM lms.Materials
                WHERE MaterialId = @id"))
            {
                cmd.Parameters.AddWithValue("@id", id);
                using (var r = cmd.ExecuteReader())
                {
                    if (!r.Read())
                        return NotFound();

                    return Ok(new { ok = true, data = new
                    {
                        materialId = (int)r["MaterialId"],
                        title = r["Title"].ToString(),
                        slug = r["Slug"] as string,
                        status = (short)r["Status"],
                        htmlContent = r["HtmlContent"] as string,
                        sourceFilePath = r["SourceFilePath"] as string,
                        sourceFileType = r["SourceFileType"] as string,
                        createdAt = (DateTime)r["CreatedAt"],
                        updatedAt = (DateTime)r["UpdatedAt"],
                        ownerUserId = (int)r["OwnerUserId"]
                    }});
                }
            }
        }

        // GET /api/materials/by-slug/{slug}
        [HttpGet, Route("by-slug/{slug}")]
        [AllowAnonymous]
        public IHttpActionResult GetBySlug(string slug)
        {
            using (var cn = DatabaseHelper.Open())
            using (var cmd = DatabaseHelper.Sql(cn, @"
                SELECT TOP 1 MaterialId, Title, Slug, Status, HtmlContent, 
                       SourceFilePath, SourceFileType, 
                       CreatedAt, UpdatedAt, OwnerUserId
                FROM lms.Materials
                WHERE Slug = @slug"))
            {
                cmd.Parameters.AddWithValue("@slug", slug);
                using (var r = cmd.ExecuteReader())
                {
                    if (!r.Read())
                        return NotFound();

                    return Ok(new { ok = true, data = new
                    {
                        materialId = (int)r["MaterialId"],
                        title = r["Title"].ToString(),
                        slug = r["Slug"] as string,
                        status = (short)r["Status"],
                        htmlContent = r["HtmlContent"] as string,
                        sourceFilePath = r["SourceFilePath"] as string,
                        sourceFileType = r["SourceFileType"] as string,
                        createdAt = (DateTime)r["CreatedAt"],
                        updatedAt = (DateTime)r["UpdatedAt"],
                        ownerUserId = (int)r["OwnerUserId"]
                    }});
                }
            }
        }

        // DELETE /api/materials/{id}
        [HttpDelete, Route("{id:int}")]
        [RequireAction("MATERIAL_DELETE")]
        public IHttpActionResult Delete(int id)
        {
            using (var cn = DatabaseHelper.Open())
            using (var cmd = DatabaseHelper.Sql(cn, "DELETE FROM lms.Materials WHERE MaterialId = @id"))
            {
                cmd.Parameters.AddWithValue("@id", id);
                int rows = cmd.ExecuteNonQuery();
                if (rows == 0)
                    return NotFound();

                return Ok(new { ok = true, message = "Deleted material " + id });
            }
        }

        // Helper function: Generate slug from Vietnamese title
        private string GenerateSlug(string title)
        {
            if (string.IsNullOrEmpty(title)) return "";

            // Convert to lowercase
            string slug = title.ToLower().Trim();

            // Remove diacritics (Vietnamese)
            slug = RemoveDiacritics(slug);

            // Replace spaces and special chars with dash
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", "-");
            slug = Regex.Replace(slug, @"-+", "-");

            return slug.Trim('-');
        }

        private string RemoveDiacritics(string text)
        {
            if (string.IsNullOrEmpty(text)) return text;

            string[] vietnamese = { "àáạảãâầấậẩẫăằắặẳẵ", "èéẹẻẽêềếệểễ", 
                                    "ìíịỉĩ", "òóọỏõôồốộổỗơờớợởỡ", 
                                    "ùúụủũưừứựửữ", "ỳýỵỷỹ", "đ" };
            string[] replacement = { "a", "e", "i", "o", "u", "y", "d" };

            for (int i = 0; i < vietnamese.Length; i++)
            {
                foreach (char c in vietnamese[i])
                {
                    text = text.Replace(c, replacement[i][0]);
                }
            }

            return text;
        }
    }
}

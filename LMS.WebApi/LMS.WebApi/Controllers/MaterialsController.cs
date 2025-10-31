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
        // GET /api/materials - Lấy tất cả materials (với filter)
        [HttpGet, Route("")]
        public IHttpActionResult GetAll(int? status = null, int skip = 0, int take = 50)
        {
            var userId = UserContext.CurrentUserId();
            var list = new List<object>();
            
            using (var cn = DatabaseHelper.Open())
            {
                string sql = @"
                    SELECT m.MaterialId, m.Title, m.Slug, m.Status, m.CreatedAt, m.UpdatedAt, m.OwnerUserId,
                           m.RejectReason, m.ReviewedBy, m.ReviewedAt,
                           u.Username AS OwnerUsername, u.FullName AS OwnerFullName,
                           r.Username AS ReviewerUsername, r.FullName AS ReviewerFullName
                    FROM lms.Materials m
                    LEFT JOIN lms.Users u ON m.OwnerUserId = u.UserId
                    LEFT JOIN lms.Users r ON m.ReviewedBy = r.UserId
                    WHERE 1=1";
                
                // Filter by status if provided
                if (status.HasValue)
                {
                    sql += " AND m.Status = @status";
                }
                
                sql += @" ORDER BY m.UpdatedAt DESC
                         OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY";
                
                using (var cmd = DatabaseHelper.Sql(cn, sql))
                {
                    if (status.HasValue)
                        cmd.Parameters.AddWithValue("@status", status.Value);
                    cmd.Parameters.AddWithValue("@skip", skip);
                    cmd.Parameters.AddWithValue("@take", take);
                    
                    using (var r = cmd.ExecuteReader())
                    {
                        while (r.Read())
                        {
                            list.Add(new
                            {
                                materialId = (int)r["MaterialId"],
                                title = r["Title"].ToString(),
                                slug = r["Slug"] != DBNull.Value ? r["Slug"].ToString() : null,
                                status = (short)r["Status"],
                                createdAt = (DateTime)r["CreatedAt"],
                                updatedAt = (DateTime)r["UpdatedAt"],
                                ownerUserId = (int)r["OwnerUserId"],
                                ownerUsername = r["OwnerUsername"] != DBNull.Value ? r["OwnerUsername"].ToString() : null,
                                ownerFullName = r["OwnerFullName"] != DBNull.Value ? r["OwnerFullName"].ToString() : null,
                                rejectReason = r["RejectReason"] != DBNull.Value ? r["RejectReason"].ToString() : null,
                                reviewedBy = r["ReviewedBy"] != DBNull.Value ? (int?)r["ReviewedBy"] : null,
                                reviewedAt = r["ReviewedAt"] != DBNull.Value ? (DateTime?)r["ReviewedAt"] : null,
                                reviewerUsername = r["ReviewerUsername"] != DBNull.Value ? r["ReviewerUsername"].ToString() : null,
                                reviewerFullName = r["ReviewerFullName"] != DBNull.Value ? r["ReviewerFullName"].ToString() : null
                            });
                        }
                    }
                }
            }
            
            return Ok(new { ok = true, data = list });
        }

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

        // PUT /api/materials/{id} - Update material
        [HttpPut, Route("{id:int}")]
        [RequireAction("MATERIAL_EDIT")]
        public IHttpActionResult Update(int id, [FromBody] MaterialUpdateRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Title))
                return BadRequest("Title is required");

            try
            {
                using (var cn = DatabaseHelper.Open())
                {
                    // Generate new slug if title changed
                    string slug = GenerateSlug(req.Title);
                    
                    using (var cmd = DatabaseHelper.Sql(cn, @"
                        UPDATE lms.Materials 
                        SET Title = @title,
                            Slug = @slug,
                            HtmlContent = @htmlContent,
                            UpdatedAt = SYSUTCDATETIME()
                        WHERE MaterialId = @id"))
                    {
                        cmd.Parameters.AddWithValue("@id", id);
                        cmd.Parameters.AddWithValue("@title", req.Title);
                        cmd.Parameters.AddWithValue("@slug", slug);
                        cmd.Parameters.AddWithValue("@htmlContent", (object)req.HtmlContent ?? DBNull.Value);
                        
                        int rows = cmd.ExecuteNonQuery();
                        if (rows == 0)
                            return NotFound();
                    }
                    
                    return Ok(new { ok = true, message = "Material updated successfully" });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST /api/materials/{id}/submit - Submit for review (Draft -> Pending)
        [HttpPost, Route("{id:int}/submit")]
        public IHttpActionResult Submit(int id)
        {
            try
            {
                using (var cn = DatabaseHelper.Open())
                {
                    using (var cmd = DatabaseHelper.Sql(cn, @"
                        UPDATE lms.Materials 
                        SET Status = 2, UpdatedAt = SYSUTCDATETIME()
                        WHERE MaterialId = @id AND (Status = 0 OR Status = 1)"))
                    {
                        cmd.Parameters.AddWithValue("@id", id);
                        int rows = cmd.ExecuteNonQuery();
                        if (rows == 0)
                            return BadRequest("Material not found or not in Draft status");
                    }
                    
                    return Ok(new { ok = true, message = "Material submitted for review" });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST /api/materials/{id}/approve - Approve material (Pending -> Published)
        [HttpPost, Route("{id:int}/approve")]
        [RequireAction("MATERIAL_APPROVE")]
        public IHttpActionResult Approve(int id)
        {
            var currentUserId = UserContext.CurrentUserId();
            
            try
            {
                using (var cn = DatabaseHelper.Open())
                {
                    using (var cmd = DatabaseHelper.Sql(cn, @"
                        UPDATE lms.Materials 
                        SET Status = 3, 
                            UpdatedAt = SYSUTCDATETIME(),
                            ReviewedBy = @reviewerId,
                            ReviewedAt = SYSUTCDATETIME(),
                            RejectReason = NULL
                        WHERE MaterialId = @id AND Status = 2"))
                    {
                        cmd.Parameters.AddWithValue("@id", id);
                        cmd.Parameters.AddWithValue("@reviewerId", currentUserId);
                        int rows = cmd.ExecuteNonQuery();
                        if (rows == 0)
                            return BadRequest("Material not found or not in Pending status");
                    }
                    
                    return Ok(new { ok = true, message = "Material approved and published" });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST /api/materials/{id}/reject - Reject material (Pending -> Draft)
        [HttpPost, Route("{id:int}/reject")]
        [RequireAction("MATERIAL_APPROVE")]
        public IHttpActionResult Reject(int id, [FromBody] RejectRequest req)
        {
            var currentUserId = UserContext.CurrentUserId();
            
            try
            {
                using (var cn = DatabaseHelper.Open())
                {
                    using (var cmd = DatabaseHelper.Sql(cn, @"
                        UPDATE lms.Materials 
                        SET Status = 0, 
                            UpdatedAt = SYSUTCDATETIME(),
                            ReviewedBy = @reviewerId,
                            ReviewedAt = SYSUTCDATETIME(),
                            RejectReason = @reason
                        WHERE MaterialId = @id AND Status = 2"))
                    {
                        cmd.Parameters.AddWithValue("@id", id);
                        cmd.Parameters.AddWithValue("@reviewerId", currentUserId);
                        
                        string reason = null;
                        if (req != null && req.Reason != null)
                            reason = req.Reason;
                        cmd.Parameters.AddWithValue("@reason", (object)reason ?? DBNull.Value);
                        
                        int rows = cmd.ExecuteNonQuery();
                        if (rows == 0)
                            return BadRequest("Material not found or not in Pending status");
                    }
                    
                    return Ok(new { ok = true, message = "Material rejected" });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
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

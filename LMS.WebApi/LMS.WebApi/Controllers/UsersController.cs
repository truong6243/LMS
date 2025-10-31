using LMS.WebApi.Security;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LMS.WebApi.Controllers
{
    [RoutePrefix("api/users")]
    [Authorize]
    public class UsersController : ApiController
    {
        private readonly string _cs = ConfigurationManager.ConnectionStrings["LmsDb"].ConnectionString;

        // GET /api/users - Lấy danh sách tất cả người dùng
        [HttpGet, Route("")]
        public HttpResponseMessage GetAll()
        {
            System.Diagnostics.Debug.WriteLine("=== Getting all users ===");

            try
            {
                var users = new List<object>();

                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();
                    using (var cmd = new SqlCommand(@"
                        SELECT 
                            u.UserId, 
                            u.Username, 
                            u.Email, 
                            u.FullName, 
                            u.Status,
                            u.CreatedAt,
                            u.UpdatedAt
                        FROM lms.Users u
                        ORDER BY u.CreatedAt DESC", cn))
                    {
                        cmd.CommandTimeout = 30;

                        using (var r = cmd.ExecuteReader())
                        {
                            while (r.Read())
                            {
                                users.Add(new
                                {
                                    userId = (int)r["UserId"],
                                    username = r["Username"].ToString(),
                                    email = r["Email"] != DBNull.Value ? r["Email"].ToString() : null,
                                    fullName = r["FullName"] != DBNull.Value ? r["FullName"].ToString() : null,
                                    status = (byte)r["Status"],
                                    createdAt = (DateTime)r["CreatedAt"],
                                    updatedAt = (DateTime)r["UpdatedAt"]
                                });
                            }
                        }
                    }
                }

                System.Diagnostics.Debug.WriteLine(string.Format("Found {0} users", users.Count));
                return Request.CreateResponse(HttpStatusCode.OK, new { ok = true, data = users });
            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("SQL Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "Database error occurred" });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }

        // GET /api/users/{id} - Lấy thông tin một người dùng
        [HttpGet, Route("{id:int}")]
        public HttpResponseMessage GetById(int id)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("=== Getting user {0} ===", id));

            try
            {
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();
                    using (var cmd = new SqlCommand(@"
                        SELECT 
                            u.UserId, 
                            u.Username, 
                            u.Email, 
                            u.FullName, 
                            u.Status,
                            u.CreatedAt,
                            u.UpdatedAt
                        FROM lms.Users u
                        WHERE u.UserId = @id", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@id", id);

                        using (var r = cmd.ExecuteReader())
                        {
                            if (!r.Read())
                            {
                                return Request.CreateResponse(HttpStatusCode.NotFound, 
                                    new { ok = false, message = "User not found" });
                            }

                            var user = new
                            {
                                userId = (int)r["UserId"],
                                username = r["Username"].ToString(),
                                email = r["Email"] != DBNull.Value ? r["Email"].ToString() : null,
                                fullName = r["FullName"] != DBNull.Value ? r["FullName"].ToString() : null,
                                status = (byte)r["Status"],
                                createdAt = (DateTime)r["CreatedAt"],
                                updatedAt = (DateTime)r["UpdatedAt"]
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, new { ok = true, data = user });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }

        // POST /api/users - Tạo người dùng mới
        [HttpPost, Route("")]
        public HttpResponseMessage Create([FromBody] CreateUserRequest req)
        {
            System.Diagnostics.Debug.WriteLine("=== Creating new user ===");

            if (req == null || string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, 
                    new { ok = false, message = "Username and password are required" });
            }

            try
            {
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();

                    // Kiểm tra username đã tồn tại chưa
                    using (var cmdCheck = new SqlCommand("SELECT COUNT(*) FROM lms.Users WHERE Username = @username", cn))
                    {
                        cmdCheck.CommandTimeout = 30;
                        cmdCheck.Parameters.AddWithValue("@username", req.Username);
                        int count = (int)cmdCheck.ExecuteScalar();
                        if (count > 0)
                        {
                            return Request.CreateResponse(HttpStatusCode.BadRequest, 
                                new { ok = false, message = "Username already exists" });
                        }
                    }

                    // Tạo password hash
                    var salt = PasswordHasher.NewSalt();
                    var hash = PasswordHasher.Hash(req.Password, salt);

                    // Insert user mới
                    using (var cmd = new SqlCommand(@"
                        INSERT INTO lms.Users (Username, PasswordHash, PasswordSalt, PasswordHash2, Email, FullName, Status, CreatedAt, UpdatedAt)
                        VALUES (@username, '', @salt, @hash, @email, @fullName, @status, GETDATE(), GETDATE());
                        SELECT CAST(SCOPE_IDENTITY() AS INT);", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@username", req.Username);
                        cmd.Parameters.Add("@salt", SqlDbType.VarBinary, 16).Value = salt;
                        cmd.Parameters.Add("@hash", SqlDbType.VarBinary, 32).Value = hash;
                        cmd.Parameters.AddWithValue("@email", (object)req.Email ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@fullName", (object)req.FullName ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@status", req.Status ?? 1);

                        int newUserId = (int)cmd.ExecuteScalar();

                        System.Diagnostics.Debug.WriteLine(string.Format("User created with ID: {0}", newUserId));
                        return Request.CreateResponse(HttpStatusCode.Created, 
                            new { ok = true, data = new { userId = newUserId } });
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }

        // PUT /api/users/{id} - Cập nhật người dùng
        [HttpPut, Route("{id:int}")]
        public HttpResponseMessage Update(int id, [FromBody] UpdateUserRequest req)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("=== Updating user {0} ===", id));

            if (req == null)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, 
                    new { ok = false, message = "Invalid request" });
            }

            try
            {
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();

                    using (var cmd = new SqlCommand(@"
                        UPDATE lms.Users 
                        SET Email = @email,
                            FullName = @fullName,
                            Status = @status,
                            UpdatedAt = GETDATE()
                        WHERE UserId = @id", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@id", id);
                        cmd.Parameters.AddWithValue("@email", (object)req.Email ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@fullName", (object)req.FullName ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@status", req.Status ?? 1);

                        int affected = cmd.ExecuteNonQuery();
                        
                        if (affected == 0)
                        {
                            return Request.CreateResponse(HttpStatusCode.NotFound, 
                                new { ok = false, message = "User not found" });
                        }

                        System.Diagnostics.Debug.WriteLine("User updated successfully");
                        return Request.CreateResponse(HttpStatusCode.OK, 
                            new { ok = true, message = "User updated successfully" });
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }

        // DELETE /api/users/{id} - Xóa người dùng (soft delete)
        [HttpDelete, Route("{id:int}")]
        public HttpResponseMessage Delete(int id)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("=== Deleting user {0} ===", id));

            try
            {
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();

                    // Soft delete: Set status = 0
                    using (var cmd = new SqlCommand(@"
                        UPDATE lms.Users 
                        SET Status = 0,
                            UpdatedAt = GETDATE()
                        WHERE UserId = @id", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@id", id);

                        int affected = cmd.ExecuteNonQuery();
                        
                        if (affected == 0)
                        {
                            return Request.CreateResponse(HttpStatusCode.NotFound, 
                                new { ok = false, message = "User not found" });
                        }

                        System.Diagnostics.Debug.WriteLine("User deleted successfully");
                        return Request.CreateResponse(HttpStatusCode.OK, 
                            new { ok = true, message = "User deleted successfully" });
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }

        // GET /api/users/{id}/roles - Lấy danh sách vai trò của user
        [HttpGet, Route("{id:int}/roles")]
        public HttpResponseMessage GetUserRoles(int id)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("=== Getting roles for user {0} ===", id));

            try
            {
                var roles = new List<object>();

                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();
                    using (var cmd = new SqlCommand(@"
                        SELECT 
                            r.RoleId,
                            r.RoleCode,
                            r.RoleName
                        FROM lms.UserRoles ur
                        INNER JOIN lms.Roles r ON ur.RoleId = r.RoleId
                        WHERE ur.UserId = @userId
                        ORDER BY r.RoleName", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@userId", id);

                        using (var r = cmd.ExecuteReader())
                        {
                            while (r.Read())
                            {
                                roles.Add(new
                                {
                                    roleId = (int)r["RoleId"],
                                    roleCode = r["RoleCode"].ToString(),
                                    roleName = r["RoleName"].ToString()
                                });
                            }
                        }
                    }
                }

                return Request.CreateResponse(HttpStatusCode.OK, new { ok = true, data = roles });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }

        // POST /api/users/{id}/roles - Gán vai trò cho user
        [HttpPost, Route("{id:int}/roles")]
        public HttpResponseMessage AssignRole(int id, [FromBody] AssignRoleRequest req)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("=== Assigning role to user {0} ===", id));

            if (req == null || req.RoleId <= 0)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, 
                    new { ok = false, message = "RoleId is required" });
            }

            try
            {
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();

                    // Kiểm tra đã gán chưa
                    using (var cmdCheck = new SqlCommand(
                        "SELECT COUNT(*) FROM lms.UserRoles WHERE UserId = @userId AND RoleId = @roleId", cn))
                    {
                        cmdCheck.CommandTimeout = 30;
                        cmdCheck.Parameters.AddWithValue("@userId", id);
                        cmdCheck.Parameters.AddWithValue("@roleId", req.RoleId);
                        
                        int count = (int)cmdCheck.ExecuteScalar();
                        if (count > 0)
                        {
                            return Request.CreateResponse(HttpStatusCode.BadRequest, 
                                new { ok = false, message = "Role already assigned to this user" });
                        }
                    }

                    // Gán vai trò
                    using (var cmd = new SqlCommand(@"
                        INSERT INTO lms.UserRoles (UserId, RoleId)
                        VALUES (@userId, @roleId)", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@userId", id);
                        cmd.Parameters.AddWithValue("@roleId", req.RoleId);
                        cmd.ExecuteNonQuery();

                        System.Diagnostics.Debug.WriteLine("Role assigned successfully");
                        return Request.CreateResponse(HttpStatusCode.OK, 
                            new { ok = true, message = "Role assigned successfully" });
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }

        // DELETE /api/users/{id}/roles/{roleId} - Xóa vai trò của user
        [HttpDelete, Route("{id:int}/roles/{roleId:int}")]
        public HttpResponseMessage RemoveRole(int id, int roleId)
        {
            System.Diagnostics.Debug.WriteLine(string.Format("=== Removing role {0} from user {1} ===", roleId, id));

            try
            {
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();

                    using (var cmd = new SqlCommand(@"
                        DELETE FROM lms.UserRoles 
                        WHERE UserId = @userId AND RoleId = @roleId", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@userId", id);
                        cmd.Parameters.AddWithValue("@roleId", roleId);

                        int affected = cmd.ExecuteNonQuery();
                        
                        if (affected == 0)
                        {
                            return Request.CreateResponse(HttpStatusCode.NotFound, 
                                new { ok = false, message = "Role assignment not found" });
                        }

                        System.Diagnostics.Debug.WriteLine("Role removed successfully");
                        return Request.CreateResponse(HttpStatusCode.OK, 
                            new { ok = true, message = "Role removed successfully" });
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }
    }

    // Request models
    public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string FullName { get; set; }
        public byte? Status { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public byte? Status { get; set; }
    }

    public class AssignRoleRequest
    {
        public int RoleId { get; set; }
    }
}

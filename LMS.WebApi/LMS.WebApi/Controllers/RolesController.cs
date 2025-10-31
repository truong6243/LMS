using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace LMS.WebApi.Controllers
{
    [RoutePrefix("api/roles")]
    [Authorize]
    public class RolesController : ApiController
    {
        private readonly string _cs = ConfigurationManager.ConnectionStrings["LmsDb"].ConnectionString;

        // GET /api/roles - Lấy danh sách tất cả vai trò
        [HttpGet, Route("")]
        public HttpResponseMessage GetAll()
        {
            System.Diagnostics.Debug.WriteLine("=== Getting all roles ===");

            try
            {
                var roles = new List<object>();

                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();
                    using (var cmd = new SqlCommand(@"
                        SELECT 
                            RoleId, 
                            RoleCode, 
                            RoleName
                        FROM lms.Roles
                        WHERE Status = 1
                        ORDER BY RoleName", cn))
                    {
                        cmd.CommandTimeout = 30;

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

                System.Diagnostics.Debug.WriteLine(string.Format("Found {0} roles", roles.Count));
                return Request.CreateResponse(HttpStatusCode.OK, new { ok = true, data = roles });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return Request.CreateResponse(HttpStatusCode.InternalServerError, 
                    new { ok = false, message = "An error occurred" });
            }
        }
    }
}

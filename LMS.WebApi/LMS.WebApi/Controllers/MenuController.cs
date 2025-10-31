using LMS.WebApi.DAL;
using LMS.WebApi.Models;
using LMS.WebApi.Security;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web.Http;

namespace LMS.WebApi.Controllers
{
    [RoutePrefix("api/menu")]
    [Authorize]
    public class MenuController : ApiController
    {
        // GET /api/menu/my
        [HttpGet, Route("my")]
        public IHttpActionResult My()
        {
            System.Diagnostics.Debug.WriteLine("=== Loading menu for user ===");
            
            var uid = UserContext.CurrentUserId(); // Hàm lấy user ID hiện tại
            System.Diagnostics.Debug.WriteLine(string.Format("User ID: {0}", uid));
            
            var list = new List<MenuItem>();

            try
            {
                using (var cn = DatabaseHelper.Open())
                {
                    System.Diagnostics.Debug.WriteLine("Đang lấy danh sách Actions là menu...");
                    
                    using (var cmd = DatabaseHelper.Sql(cn, @"
                        SELECT ActionId, ActionCode, ActionName, Path, ParentId, SortOrder, Icon
                        FROM lms.Actions
                        WHERE IsMenu = 1
                        ORDER BY ISNULL(ParentId, 0), SortOrder"))
                    {
                        cmd.CommandTimeout = 30;

                        using (var r = cmd.ExecuteReader())
                        {
                            System.Diagnostics.Debug.WriteLine("Bắt đầu đọc dữ liệu từ SqlDataReader...");
                            while (r.Read())
                            {
                                list.Add(new MenuItem
                                {
                                    ActionId = (int)r["ActionId"],
                                    ActionCode = r["ActionCode"].ToString(),
                                    ActionName = r["ActionName"].ToString(),
                                    Path = r["Path"] != System.DBNull.Value ? r["Path"].ToString() : null,
                                    ParentId = r["ParentId"] != System.DBNull.Value ? (int?)r["ParentId"] : null,
                                    SortOrder = (int)r["SortOrder"],
                                    Icon = r["Icon"] != System.DBNull.Value ? r["Icon"].ToString() : null
                                });
                            }
                            System.Diagnostics.Debug.WriteLine(string.Format("Đã đọc {0} menu items.", list.Count));
                        }
                    }
                }

                System.Diagnostics.Debug.WriteLine(string.Format("Menu items loaded: {0}", list.Count));
                return Ok(new { ok = true, data = list });
            }
            catch (SqlException ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("SQL Error: {0}", ex.Message));
                return InternalServerError(ex);
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                return InternalServerError(ex);
            }
        }
    }
}

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
            var uid = UserContext.CurrentUserId(); // Hàm lấy user ID hiện tại
            var list = new List<MenuItem>();

            using (var cn = DatabaseHelper.Open())
            using (var cmd = DatabaseHelper.Sql(cn, @"
                SELECT ActionId, ActionCode, ActionName, Path, MenuGroup, ParentId, SortOrder, Icon
                FROM lms.v_MenuByUser
                WHERE UserId=@uid
                ORDER BY 
                    CASE WHEN MenuGroup='ROOT' THEN 0 ELSE 1 END,
                    ISNULL(ParentId,0),
                    SortOrder"))
            {
                cmd.Parameters.AddWithValue("@uid", uid);

                using (var r = cmd.ExecuteReader())
                {
                    while (r.Read())
                    {
                        list.Add(new MenuItem
                        {
                            ActionId = (int)r["ActionId"],
                            ActionCode = r["ActionCode"].ToString(),
                            ActionName = r["ActionName"].ToString(),
                            Path = r["Path"] as string,
                            MenuGroup = r["MenuGroup"] as string,
                            ParentId = r["ParentId"] as int?,
                            SortOrder = (int)r["SortOrder"],
                            Icon = r["Icon"] as string
                        });
                    }
                }
            }

            return Ok(new { ok = true, data = list });
        }
    }
}

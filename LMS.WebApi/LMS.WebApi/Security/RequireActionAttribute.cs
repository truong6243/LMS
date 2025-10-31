// /Security/RequireActionAttribute.cs
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace LMS.WebApi.Security
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public sealed class RequireActionAttribute : AuthorizeAttribute
    {
        private readonly string _actionCode;
        private readonly string _cs = ConfigurationManager.ConnectionStrings["LmsDb"].ConnectionString;

        public RequireActionAttribute(string actionCode)
        {
            _actionCode = actionCode;
        }

        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            // đã đăng nhập?
            if (!base.IsAuthorized(actionContext)) return false;

            var userId = UserContext.CurrentUserId();
            if (userId <= 0) return false;

            using (var cn = new SqlConnection(_cs))
            using (var cmd = new SqlCommand("SELECT lms.fn_UserHasAction(@uid, @ac)", cn))
            {
                cmd.Parameters.Add("@uid", SqlDbType.Int).Value = userId;
                cmd.Parameters.Add("@ac", SqlDbType.NVarChar, 100).Value = _actionCode;
                cn.Open();
                var ok = Convert.ToInt32(cmd.ExecuteScalar()); // 1 hoặc 0
                return ok == 1;
            }
        }

        protected override void HandleUnauthorizedRequest(HttpActionContext actionContext)
        {
            actionContext.Response = actionContext.Request
                .CreateResponse(HttpStatusCode.Forbidden, new { ok = false, message = "Permission denied: " + _actionCode });
        }
    }
}

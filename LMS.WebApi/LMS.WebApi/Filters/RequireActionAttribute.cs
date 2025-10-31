using LMS.WebApi.DAL;
using LMS.WebApi.Security;
using System;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace LMS.WebApi.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class RequireActionAttribute : ActionFilterAttribute
    {
        private readonly string _code;
        public RequireActionAttribute(string code) { _code = code; }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            var userId = UserContext.CurrentUserId();
            if (userId <= 0) 
            { 
                actionContext.Response = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Unauthorized); 
                return; 
            }

            using (var cn = DatabaseHelper.Open())
            using (var cmd = DatabaseHelper.Sql(cn, "SELECT lms.fn_UserHasAction(@u,@c)"))
            {
                cmd.Parameters.AddWithValue("@u", userId);
                cmd.Parameters.AddWithValue("@c", _code);
                var ok = Convert.ToInt32(cmd.ExecuteScalar()) == 1;
                if (!ok) 
                { 
                    actionContext.Response = new System.Net.Http.HttpResponseMessage(System.Net.HttpStatusCode.Forbidden); 
                    return; 
                }
            }
            base.OnActionExecuting(actionContext);
        }
    }
}

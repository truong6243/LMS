using System.Web.Http;
using LMS.WebApi.Security;
using System.Web.Http.Cors;

namespace LMS.WebApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // CORS: Chỉ cho phép frontend origin, KHÔNG dùng credentials (token-based)
            var cors = new EnableCorsAttribute("http://localhost:5173", "*", "*");
            config.EnableCors(cors);

            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            
            // JWT handler
            config.MessageHandlers.Add(new JwtAuthHandler());
        }
    }
}

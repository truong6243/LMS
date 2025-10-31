using System.Web.Http;
using LMS.WebApi.Security;
using System.Web.Http.Cors;

namespace LMS.WebApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // CORS: Cho phép cả 2 ports của frontend (5173 và 5174)
            var cors = new EnableCorsAttribute("http://localhost:5173,http://localhost:5174", "*", "*");
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

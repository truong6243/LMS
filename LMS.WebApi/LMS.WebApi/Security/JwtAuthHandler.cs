using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace LMS.WebApi.Security
{
    public class JwtAuthHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var auth = request.Headers.Authorization;
            if (auth != null && auth.Scheme == "Bearer" && !string.IsNullOrEmpty(auth.Parameter))
            {
                var principal = JwtService.Validate(auth.Parameter);
                if (principal != null)
                {
                    Thread.CurrentPrincipal = principal;
                    if (System.Web.HttpContext.Current != null)
                        System.Web.HttpContext.Current.User = principal;
                }
                else
                {
                    var resp = request.CreateResponse(HttpStatusCode.Unauthorized);
                    return Task.FromResult(resp);
                }
            }
            return base.SendAsync(request, cancellationToken);
        }
    }
}

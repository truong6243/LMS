using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace LMS.WebApi.Security
{
    public class PreflightRequestsHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            if (request.Method == HttpMethod.Options)
            {
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:5173");
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.Headers.Add("Access-Control-Allow-Credentials", "true");
                return Task.FromResult(response);
            }
            return base.SendAsync(request, cancellationToken);
        }
    }
}


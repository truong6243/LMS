using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace LMS.WebApi.Security
{
    public class CorsHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            // Xử lý preflight OPTIONS request
            if (request.Method == HttpMethod.Options)
            {
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                AddCorsHeaders(response);
                var tcs = new TaskCompletionSource<HttpResponseMessage>();
                tcs.SetResult(response);
                return tcs.Task;
            }
            
            var task = base.SendAsync(request, cancellationToken);
            
            // Thêm CORS headers cho mọi response
            return task.ContinueWith(t =>
            {
                var response = t.Result;
                AddCorsHeaders(response);
                return response;
            }, cancellationToken);
        }

        private void AddCorsHeaders(HttpResponseMessage response)
        {
            // Thêm CORS headers nếu chưa có
            if (!response.Headers.Contains("Access-Control-Allow-Origin"))
                response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:5173");
            
            if (!response.Headers.Contains("Access-Control-Allow-Credentials"))
                response.Headers.Add("Access-Control-Allow-Credentials", "true");
            
            if (!response.Headers.Contains("Access-Control-Allow-Methods"))
                response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            
            if (!response.Headers.Contains("Access-Control-Allow-Headers"))
                response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
            
            if (!response.Headers.Contains("Access-Control-Expose-Headers"))
                response.Headers.Add("Access-Control-Expose-Headers", "Set-Cookie");
        }
    }
}


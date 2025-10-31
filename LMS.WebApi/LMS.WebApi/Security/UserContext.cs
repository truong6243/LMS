using System;
using System.Security.Claims;
using System.Threading;
using System.Web;

namespace LMS.WebApi.Security
{
    public static class UserContext
    {
        public static int CurrentUserId()
        {
            ClaimsPrincipal principal = Thread.CurrentPrincipal as ClaimsPrincipal;
            if (principal == null && HttpContext.Current != null)
                principal = HttpContext.Current.User as ClaimsPrincipal;

            if (principal == null || principal.Identity == null || !principal.Identity.IsAuthenticated)
                return 0;

            var claim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                return 0;

            int userId;
            if (int.TryParse(claim.Value, out userId))
                return userId;

            return 0;
        }
    }
}

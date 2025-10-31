using System;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Web.Script.Serialization;

namespace LMS.WebApi.Security
{
    public static class JwtService
    {
        private static readonly byte[] Secret = Encoding.UTF8.GetBytes("super-long-secret-change-me");

        private static string Sign(string data)
        {
            using (var hmac = new HMACSHA256(Secret))
            {
                var bytes = Encoding.UTF8.GetBytes(data);
                return Base64Url.Encode(hmac.ComputeHash(bytes));
            }
        }

        private static long ToUnixSeconds(DateTime date)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return (long)(date.ToUniversalTime() - epoch).TotalSeconds;
        }

        public static string CreateToken(int userId, string username, TimeSpan lifetime)
        {
            var ser = new JavaScriptSerializer();
            var now = ToUnixSeconds(DateTime.UtcNow);
            var exp = now + (long)lifetime.TotalSeconds;

            var header = ser.Serialize(new { alg = "HS256", typ = "JWT" });
            var payload = ser.Serialize(new { sub = userId, name = username, iat = now, exp = exp });

            var headerB64 = Base64Url.Encode(Encoding.UTF8.GetBytes(header));
            var payloadB64 = Base64Url.Encode(Encoding.UTF8.GetBytes(payload));

            var toSign = headerB64 + "." + payloadB64;
            var sig = Sign(toSign);
            return toSign + "." + sig;
        }

        public static ClaimsPrincipal Validate(string token)
        {
            if (string.IsNullOrEmpty(token)) return null;
            var parts = token.Split('.');
            if (parts.Length != 3) return null;

            var toSign = parts[0] + "." + parts[1];
            var expected = Sign(toSign);
            if (!TimingSafeEquals(parts[2], expected)) return null;

            var payloadJson = Encoding.UTF8.GetString(Base64Url.Decode(parts[1]));
            var ser = new JavaScriptSerializer();
            dynamic payload = ser.DeserializeObject(payloadJson);

            long exp = payload.ContainsKey("exp") ? Convert.ToInt64(payload["exp"]) : 0;
            if (exp < ToUnixSeconds(DateTime.UtcNow)) return null;

            int userId = Convert.ToInt32(payload["sub"]);
            string name = (string)payload["name"];

            var id = new ClaimsIdentity("JWT");
            id.AddClaim(new Claim(ClaimTypes.NameIdentifier, userId.ToString()));
            id.AddClaim(new Claim(ClaimTypes.Name, name));
            return new ClaimsPrincipal(id);
        }

        private static bool TimingSafeEquals(string a, string b)
        {
            if (a == null || b == null || a.Length != b.Length) return false;
            int diff = 0;
            for (int i = 0; i < a.Length; i++) diff |= a[i] ^ b[i];
            return diff == 0;
        }
    }
}

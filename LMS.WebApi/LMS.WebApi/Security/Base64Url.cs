using System;

namespace LMS.WebApi.Security
{
    public static class Base64Url
    {
        public static string Encode(byte[] arg)
        {
            var s = Convert.ToBase64String(arg);
            s = s.Split('=')[0];
            s = s.Replace('+', '-').Replace('/', '_');
            return s;
        }

        public static byte[] Decode(string s)
        {
            s = s.Replace('-', '+').Replace('_', '/');
            switch (s.Length % 4)
            {
                case 0: break;
                case 2: s += "=="; break;
                case 3: s += "="; break;
                default: throw new FormatException("Invalid base64url");
            }
            return Convert.FromBase64String(s);
        }
    }
}

using System;
using System.Security.Cryptography;

namespace LMS.WebApi.Security
{
    public static class PasswordHasher
    {
        // .NET 4.5.1 friendly
        public static byte[] NewSalt(int size = 16)
        {
            var salt = new byte[size];
            using (var rng = new RNGCryptoServiceProvider()) rng.GetBytes(salt);
            return salt;
        }

        public static byte[] Hash(string password, byte[] salt, int iter = 10000, int len = 32)
        {
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iter))
                return pbkdf2.GetBytes(len);
        }

        public static bool Verify(string password, byte[] salt, byte[] expected)
        {
            var h = Hash(password, salt);
            if (h.Length != expected.Length) return false;
            var diff = 0;
            for (int i = 0; i < h.Length; i++) diff |= h[i] ^ expected[i];
            return diff == 0;
        }
    }
}

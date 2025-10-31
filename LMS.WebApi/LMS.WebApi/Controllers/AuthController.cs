using LMS.WebApi.Security;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Web.Http;

namespace LMS.WebApi.Controllers
{
    [RoutePrefix("api/auth")]
    public class AuthController : ApiController
    {
        private readonly string _cs =
            ConfigurationManager.ConnectionStrings["LmsDb"].ConnectionString;

        [AllowAnonymous]
        [HttpPost, Route("login")]
        public HttpResponseMessage Login([FromBody] LoginRequest req)
        {
            System.Diagnostics.Debug.WriteLine("=== Login attempt started ===");
            
            if (req == null || string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            {
                System.Diagnostics.Debug.WriteLine("Missing credentials");
                return Request.CreateResponse(HttpStatusCode.BadRequest, new { ok = false, message = "Missing credentials" });
            }

            System.Diagnostics.Debug.WriteLine(string.Format("Attempting login for user: {0}", req.Username));

            try
            {
                System.Diagnostics.Debug.WriteLine("Opening database connection...");
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();
                    System.Diagnostics.Debug.WriteLine("Database connection opened successfully");

                    int userId;
                    string username, fullName;

                    System.Diagnostics.Debug.WriteLine("Querying user from database...");
                    using (var cmd = new SqlCommand(@"
                        SELECT TOP 1 UserId, Username, FullName, PasswordSalt, PasswordHash2, LegacyPassword
                        FROM lms.Users
                        WHERE Username=@u AND Status=1", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@u", req.Username);

                        using (var r = cmd.ExecuteReader())
                        {
                            if (!r.Read())
                            {
                                System.Diagnostics.Debug.WriteLine("User not found or inactive");
                                return Request.CreateResponse(HttpStatusCode.Unauthorized, new { ok = false, message = "Invalid credentials" });
                            }

                            System.Diagnostics.Debug.WriteLine("User found, verifying password...");

                            userId = (int)r["UserId"];
                            username = (string)r["Username"];
                            fullName = r["FullName"] == DBNull.Value ? username : (string)r["FullName"];

                            bool hasNewHash = !(r["PasswordSalt"] is DBNull) && !(r["PasswordHash2"] is DBNull);

                            if (hasNewHash)
                            {
                                System.Diagnostics.Debug.WriteLine("Using new PBKDF2 password hash");
                                var salt = (byte[])r["PasswordSalt"];
                                var hash = (byte[])r["PasswordHash2"];
                                if (!PasswordHasher.Verify(req.Password, salt, hash))
                                {
                                    System.Diagnostics.Debug.WriteLine("Password verification failed");
                                    return Request.CreateResponse(HttpStatusCode.Unauthorized, new { ok = false, message = "Invalid credentials" });
                                }
                                System.Diagnostics.Debug.WriteLine("Password verified successfully");
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine("Using legacy password");
                                var legacy = r["LegacyPassword"] as string;
                                if (string.IsNullOrEmpty(legacy) || !string.Equals(legacy, req.Password, StringComparison.Ordinal))
                                {
                                    System.Diagnostics.Debug.WriteLine("Legacy password verification failed");
                                    return Request.CreateResponse(HttpStatusCode.Unauthorized, new { ok = false, message = "Invalid credentials" });
                                }

                                System.Diagnostics.Debug.WriteLine("Legacy password verified, upgrading to PBKDF2...");
                                r.Close();

                                var salt = PasswordHasher.NewSalt();
                                var hash = PasswordHasher.Hash(req.Password, salt);

                                using (var up = new SqlCommand(@"
                                    UPDATE lms.Users
                                    SET PasswordSalt=@s, PasswordHash2=@h
                                    WHERE UserId=@id", cn))
                                {
                                    up.CommandTimeout = 30;
                                    up.Parameters.Add("@s", SqlDbType.VarBinary, 16).Value = salt;
                                    up.Parameters.Add("@h", SqlDbType.VarBinary, 32).Value = hash;
                                    up.Parameters.Add("@id", SqlDbType.Int).Value = userId;
                                    up.ExecuteNonQuery();
                                }
                            }
                        }
                    }

                    System.Diagnostics.Debug.WriteLine("Creating JWT token...");
                    string accessToken = JwtService.CreateToken(userId, username, TimeSpan.FromMinutes(15));
                    System.Diagnostics.Debug.WriteLine("JWT token created");

                    System.Diagnostics.Debug.WriteLine("Generating refresh token...");
                    using (var rng = new RNGCryptoServiceProvider())
                    {
                        byte[] buf = new byte[32];
                        rng.GetBytes(buf);
                        string refresh = Convert.ToBase64String(buf);

                        System.Diagnostics.Debug.WriteLine("Saving refresh token to database...");
                        using (var cmd2 = new SqlCommand(@"
                            INSERT INTO lms.AuthRefreshTokens (UserId, Token, ExpireAt)
                            VALUES (@uid, @t, DATEADD(DAY,7,GETDATE()))", cn))
                        {
                            cmd2.CommandTimeout = 30;
                            cmd2.Parameters.Add("@uid", SqlDbType.Int).Value = userId;
                            cmd2.Parameters.Add("@t", SqlDbType.NVarChar, 200).Value = refresh;
                            cmd2.ExecuteNonQuery();
                        }

                        System.Diagnostics.Debug.WriteLine("Login successful!");
                        return Request.CreateResponse(HttpStatusCode.OK, new
                        {
                            ok = true,
                            accessToken,
                            refreshToken = refresh,
                            user = new { userId, username, fullName },
                            expiresIn = 900
                        });
                    }
                }
            }
            catch (SqlException ex)
            {
                // Log the SQL error details
                System.Diagnostics.Debug.WriteLine(string.Format("SQL Error {0}: {1}", ex.Number, ex.Message));
                System.Diagnostics.Debug.WriteLine(string.Format("Stack trace: {0}", ex.StackTrace));
                
                if (ex.Number == -2)
                {
                    return Request.CreateResponse(HttpStatusCode.GatewayTimeout,
                        new { ok = false, message = "Database connection timeout. Please try again." });
                }
                if (ex.Number == 208) // Invalid object name
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError,
                        new { ok = false, message = "Database schema error. Please check database setup." });
                }
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { ok = false, message = string.Format("A database error occurred ({0}). Please try again later.", ex.Number) });
            }
            catch (Exception ex)
            {
                // Log the error details
                System.Diagnostics.Debug.WriteLine(string.Format("Error: {0}", ex.Message));
                System.Diagnostics.Debug.WriteLine(string.Format("Stack trace: {0}", ex.StackTrace));
                
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { ok = false, message = "An unexpected error occurred. Please try again later." });
            }
        }

        [AllowAnonymous]
        [HttpPost, Route("refresh")]
        public HttpResponseMessage Refresh([FromBody] RefreshRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.RefreshToken))
                return Request.CreateResponse(HttpStatusCode.BadRequest, new { ok = false, message = "No refresh token" });

            string refresh = req.RefreshToken;

            try
            {
                using (var cn = new SqlConnection(_cs))
                {
                    cn.Open();
                    using (var cmd = new SqlCommand(@"
                        SELECT TOP 1 UserId, ExpireAt, IsRevoked
                        FROM lms.AuthRefreshTokens
                        WHERE Token=@t", cn))
                    {
                        cmd.CommandTimeout = 30;
                        cmd.Parameters.AddWithValue("@t", refresh);
                        using (var r = cmd.ExecuteReader())
                        {
                            if (!r.Read())
                                return Request.CreateResponse(HttpStatusCode.Unauthorized);

                            var exp = (DateTime)r["ExpireAt"];
                            bool revoked = (bool)r["IsRevoked"];
                            if (revoked || exp < DateTime.UtcNow)
                                return Request.CreateResponse(HttpStatusCode.Unauthorized);

                            int userId = (int)r["UserId"];
                            r.Close();

                            using (var cmdU = new SqlCommand("SELECT Username FROM lms.Users WHERE UserId=@id", cn))
                            {
                                cmdU.CommandTimeout = 30;
                                cmdU.Parameters.AddWithValue("@id", userId);
                                string username = (string)cmdU.ExecuteScalar();
                                string newToken = JwtService.CreateToken(userId, username, TimeSpan.FromMinutes(15));
                                return Request.CreateResponse(HttpStatusCode.OK, new { ok = true, accessToken = newToken, expiresIn = 900 });
                            }
                        }
                    }
                }
            }
            catch (SqlException ex)
            {
                if (ex.Number == -2)
                {
                    return Request.CreateResponse(HttpStatusCode.GatewayTimeout,
                        new { ok = false, message = "Database connection timeout. Please try again." });
                }
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { ok = false, message = "A database error occurred. Please try again later." });
            }
            catch (Exception)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { ok = false, message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost, Route("logout")]
        public HttpResponseMessage Logout()
        {
            return Request.CreateResponse(HttpStatusCode.OK, new { ok = true, message = "Logged out" });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class RefreshRequest
    {
        public string RefreshToken { get; set; }
    }

    public enum SameSiteMode { None = 0, Lax = 1, Strict = 2 }
}

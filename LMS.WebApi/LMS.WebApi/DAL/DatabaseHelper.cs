using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace LMS.WebApi.DAL
{
    public static class DatabaseHelper
    {
        public static SqlConnection Open()
        {
            var cs = ConfigurationManager.ConnectionStrings["LmsDb"].ConnectionString;
            var cn = new SqlConnection(cs);
            cn.Open();
            return cn;
        }
        public static SqlCommand Proc(SqlConnection cn, string name)
        {
            var cmd = new SqlCommand(name, cn);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 60;
            return cmd;
        }
        public static SqlCommand Sql(SqlConnection cn, string text)
        {
            var cmd = new SqlCommand(text, cn);
            cmd.CommandType = CommandType.Text;
            cmd.CommandTimeout = 60;
            return cmd;
        }
    }
}

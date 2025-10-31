namespace LMS.WebApi.Models
{
    public class MaterialUpdateRequest
    {
        public string Title { get; set; }
        public string HtmlContent { get; set; }
    }

    public class RejectRequest
    {
        public string Reason { get; set; }
    }
}

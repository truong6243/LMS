namespace LMS.WebApi.Models
{
    public class MaterialUploadRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public int? SectionId { get; set; } // nếu có phân loại theo Section/Chương
    }
}

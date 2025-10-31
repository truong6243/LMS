namespace LMS.WebApi.Models
{
    public class MenuItem
    {
        public int ActionId { get; set; }
        public string ActionCode { get; set; }
        public string ActionName { get; set; }
        public string Path { get; set; }
        public string MenuGroup { get; set; }
        public int? ParentId { get; set; }
        public int SortOrder { get; set; }
        public string Icon { get; set; }
    }
}

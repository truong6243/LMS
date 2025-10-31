using System;

namespace LMS.WebApi.Models
{
    public class MaterialListItem
    {
        public int MaterialId { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public short Status { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

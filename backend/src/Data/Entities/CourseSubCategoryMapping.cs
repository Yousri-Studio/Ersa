namespace ErsaTraining.API.Data.Entities;

/// <summary>
/// Junction table for many-to-many relationship between Course and CourseSubCategory
/// </summary>
public class CourseSubCategoryMapping
{
    public Guid CourseId { get; set; }
    public virtual Course Course { get; set; } = null!;

    public Guid SubCategoryId { get; set; }
    public virtual CourseSubCategory SubCategory { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


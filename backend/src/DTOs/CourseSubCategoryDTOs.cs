using System;
using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.DTOs;

public class CourseSubCategoryDto
{
    public Guid Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCourseSubCategoryRequest
{
    [Required]
    [MaxLength(255)]
    public string TitleAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string TitleEn { get; set; } = string.Empty;

    public int DisplayOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;
}

public class UpdateCourseSubCategoryRequest : CreateCourseSubCategoryRequest
{
}


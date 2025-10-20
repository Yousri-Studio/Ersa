using System;
using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.DTOs;

public class CourseCategoryDto
{
    public Guid Id { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? SubtitleAr { get; set; }
    public string? SubtitleEn { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCourseCategoryRequest
{
    [Required]
    [MaxLength(255)]
    public string TitleAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string TitleEn { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? SubtitleAr { get; set; }

    [MaxLength(500)]
    public string? SubtitleEn { get; set; }

    public int DisplayOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;
}

public class UpdateCourseCategoryRequest : CreateCourseCategoryRequest
{
}


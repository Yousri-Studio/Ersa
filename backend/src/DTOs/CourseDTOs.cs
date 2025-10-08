using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.DTOs;

public class CourseListDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public LocalizedText Title { get; set; } = new();
    public LocalizedText Summary { get; set; } = new();
    public LocalizedText Description { get; set; } = new();
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public CourseType Type { get; set; }
    public CourseLevel Level { get; set; }
    public Guid? CategoryId { get; set; }
    public CourseCategoryDto? Category { get; set; }
    public List<CourseSubCategoryDto> SubCategories { get; set; } = new();
    public string? VideoUrl { get; set; }
    public LocalizedText Duration { get; set; } = new();
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public LocalizedText SessionsNotes { get; set; } = new();
    public LocalizedText InstructorName { get; set; } = new();
    public List<InstructorDto> Instructors { get; set; } = new();
    public byte[]? Photo { get; set; }
    public string? Tags { get; set; }
    public LocalizedText InstructorsBio { get; set; } = new();
    public LocalizedText CourseTopics { get; set; } = new();
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CourseDetailDto : CourseListDto
{
    public List<SessionDto> Sessions { get; set; } = new();
    public List<AttachmentDto> Attachments { get; set; } = new();
}

public class SessionDto
{
    public Guid Id { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public int? Capacity { get; set; }
    public int? AvailableSpots { get; set; }
}

public class AttachmentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public AttachmentType Type { get; set; }
}

public class CreateCourseRequest
{
    [Required]
    [MaxLength(255)]
    public string Slug { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "SAR";

    [Required]
    public CourseType Type { get; set; }

    public CourseLevel Level { get; set; } = CourseLevel.Biginner;

    public Guid? CategoryId { get; set; }

    public List<Guid> SubCategoryIds { get; set; } = new();

    [MaxLength(1000)]
    public string? VideoUrl { get; set; }

    [MaxLength(50)]
    public string? DurationEn { get; set; }
    
    [MaxLength(50)]
    public string? DurationAr { get; set; }
    
    public DateTime? From { get; set; }
    
    public DateTime? To { get; set; }
    
    [MaxLength(150)]
    public string? SessionsNotesEn { get; set; }
    
    [MaxLength(150)]
    public string? SessionsNotesAr { get; set; }

    [Required]
    [MaxLength(255)]
    public string InstructorNameAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string InstructorNameEn { get; set; } = string.Empty;
    
    public List<Guid> InstructorIds { get; set; } = new();

    [Required]
    [MaxLength(500)]
    public string TitleAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string TitleEn { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? SummaryAr { get; set; }

    [MaxLength(2000)]
    public string? SummaryEn { get; set; }

    [MaxLength(5000)]
    public string? DescriptionAr { get; set; }

    [MaxLength(5000)]
    public string? DescriptionEn { get; set; }

    public byte[]? Photo { get; set; }

    [MaxLength(2000)]
    public string? Tags { get; set; }

    [MaxLength(2500)]
    public string? InstructorsBioAr { get; set; }

    [MaxLength(2500)]
    public string? InstructorsBioEn { get; set; }

    public string? CourseTopicsAr { get; set; }

    public string? CourseTopicsEn { get; set; }
}

public class UpdateCourseRequest : CreateCourseRequest
{
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
}

public class CreateSessionRequest
{
    [Required]
    public Guid CourseId { get; set; }

    [Required]
    public DateTime StartAt { get; set; }

    [Required]
    public DateTime EndAt { get; set; }

    [MaxLength(500)]
    public string? TeamsLink { get; set; }

    [Range(1, int.MaxValue)]
    public int? Capacity { get; set; }
}

public class LocalizedText
{
    public string Ar { get; set; } = string.Empty;
    public string En { get; set; } = string.Empty;
}
using System.ComponentModel.DataAnnotations;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.DTOs;

public class CourseListDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public LocalizedText Title { get; set; } = new();
    public LocalizedText Summary { get; set; } = new();
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public CourseType Type { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
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
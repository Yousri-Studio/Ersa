using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.DTOs;

public class InstructorDto
{
    public Guid Id { get; set; }
    public LocalizedText InstructorName { get; set; } = new();
    public LocalizedText InstructorBio { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AdminInstructorDto
{
    public Guid Id { get; set; }
    public string InstructorNameEn { get; set; } = string.Empty;
    public string InstructorNameAr { get; set; } = string.Empty;
    public string? InstructorBioEn { get; set; }
    public string? InstructorBioAr { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<Guid> CourseIds { get; set; } = new();
}

public class InstructorDetailDto : InstructorDto
{
    public List<CourseListDto> Courses { get; set; } = new();
}

public class CreateInstructorRequest
{
    [Required]
    [MaxLength(255)]
    public string InstructorNameEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string InstructorNameAr { get; set; } = string.Empty;

    [MaxLength(2500)]
    public string? InstructorBioEn { get; set; }

    [MaxLength(2500)]
    public string? InstructorBioAr { get; set; }
    
    public List<Guid> CourseIds { get; set; } = new();
}

public class UpdateInstructorRequest : CreateInstructorRequest
{
}


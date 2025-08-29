using System.ComponentModel.DataAnnotations;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.DTOs;

public class EnrollmentDto
{
    public Guid EnrollmentId { get; set; }
    public CourseListDto Course { get; set; } = null!;
    public SessionDto? Session { get; set; }
    public EnrollmentStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; }
    public List<SecureLinkDto> SecureLinks { get; set; } = new();
}

public class SecureLinkDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastDownloadedAt { get; set; }
    public int DownloadCount { get; set; }
}

public class SendLiveDetailsRequest
{
    [Required]
    [RegularExpression("^(ar|en)$")]
    public string Locale { get; set; } = "en";
}

public class DeliverMaterialsRequest
{
    [Required]
    public List<Guid> AttachmentIds { get; set; } = new();
}
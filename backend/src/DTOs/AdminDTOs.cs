using ErsaTraining.API.Data.Entities;
using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.DTOs;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalCourses { get; set; }
    public int ActiveCourses { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<UserSummaryDto> RecentUsers { get; set; } = new();
    public List<OrderSummaryDto> RecentOrders { get; set; } = new();
    public List<UserGeographicDto> UserGeographics { get; set; } = new();
}

public class UserGeographicDto
{
    public string Country { get; set; } = string.Empty;
    public int Users { get; set; }
    public double[] Coordinates { get; set; } = new double[2]; // [longitude, latitude]
}

public class UserSummaryDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserStatus Status { get; set; }
}

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserStatusRequest
{
    [Required]
    [RegularExpression("^(PendingEmailVerification|Active|Inactive|Suspended)$", ErrorMessage = "Status must be one of: PendingEmailVerification, Active, Inactive, Suspended")]
    public string Status { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? AdminNotes { get; set; }
}

public class UpdateAdminRoleRequest
{
    public bool IsAdmin { get; set; }
    public bool IsSuperAdmin { get; set; }
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class AdminCourseDto
{
    public Guid Id { get; set; }
    public string? Slug { get; set; }
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? SummaryAr { get; set; }
    public string? SummaryEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public decimal Price { get; set; }
    public string? Currency { get; set; }
    public int? Type { get; set; }
    public int? Level { get; set; }
    public Guid? CategoryId { get; set; }
    public CourseCategoryDto? Category { get; set; }
    public List<CourseSubCategoryDto> SubCategories { get; set; } = new();
    public string? VideoUrl { get; set; }
    public string? DurationEn { get; set; }
    public string? DurationAr { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? SessionsNotesEn { get; set; }
    public string? SessionsNotesAr { get; set; }
    public string? InstructorNameAr { get; set; }
    public string? InstructorNameEn { get; set; }
    public List<AdminInstructorDto> Instructors { get; set; } = new();
    public byte[]? Photo { get; set; }
    public string? Tags { get; set; }
    public string? InstructorsBioAr { get; set; }
    public string? InstructorsBioEn { get; set; }
    public string? CourseTopicsAr { get; set; }
    public string? CourseTopicsEn { get; set; }
    public bool IsActive { get; set; }
    public bool? IsFeatured { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AdminOrderDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CourseNames { get; set; } = string.Empty;
    public string CourseType { get; set; } = string.Empty;
}

public class AdminOrderDetailDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Customer Information
    public AdminOrderCustomerDto Customer { get; set; } = new();
    
    // Order Items
    public List<AdminOrderItemDto> Items { get; set; } = new();
    
    // Payments
    public List<AdminOrderPaymentDto> Payments { get; set; } = new();
}

public class AdminOrderCustomerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string Locale { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AdminOrderItemDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid? SessionId { get; set; }
    public string CourseTitleEn { get; set; } = string.Empty;
    public string CourseTitleAr { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public int Qty { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AdminOrderPaymentDto
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string? ProviderRef { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? CapturedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateUserRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Locale { get; set; } = "en";
    public bool? IsAdmin { get; set; }
    public bool? IsSuperAdmin { get; set; }
}

public class AdminCreateCourseRequest
{
    public string Slug { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? SummaryAr { get; set; }
    public string? SummaryEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "SAR";
    public int? Type { get; set; }
    public int? Level { get; set; }
    public Guid? CategoryId { get; set; }
    public List<Guid> SubCategoryIds { get; set; } = new();
    public List<Guid> InstructorIds { get; set; } = new();
    public string? VideoUrl { get; set; }
    public string? DurationEn { get; set; }
    public string? DurationAr { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? SessionsNotesEn { get; set; }
    public string? SessionsNotesAr { get; set; }
    public string InstructorNameAr { get; set; } = string.Empty;
    public string InstructorNameEn { get; set; } = string.Empty;
    public string? Photo { get; set; }
    public string? Tags { get; set; }
    public string? InstructorsBioAr { get; set; }
    public string? InstructorsBioEn { get; set; }
    public string? CourseTopicsAr { get; set; }
    public string? CourseTopicsEn { get; set; }
    public bool IsActive { get; set; } = true;
    public bool? IsFeatured { get; set; }
}

public class AdminUpdateCourseRequest
{
    public string Slug { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? SummaryAr { get; set; }
    public string? SummaryEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "SAR";
    public int? Type { get; set; }
    public int? Level { get; set; }
    public Guid? CategoryId { get; set; }
    public List<Guid> SubCategoryIds { get; set; } = new();
    public List<Guid> InstructorIds { get; set; } = new();
    public string? VideoUrl { get; set; }
    public string? DurationEn { get; set; }
    public string? DurationAr { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public string? SessionsNotesEn { get; set; }
    public string? SessionsNotesAr { get; set; }
    public string InstructorNameAr { get; set; } = string.Empty;
    public string InstructorNameEn { get; set; } = string.Empty;
    public string? Photo { get; set; }
    public string? Tags { get; set; }
    public string? InstructorsBioAr { get; set; }
    public string? InstructorsBioEn { get; set; }
    public string? CourseTopicsAr { get; set; }
    public string? CourseTopicsEn { get; set; }
    public bool IsActive { get; set; }
    public bool? IsFeatured { get; set; }
}

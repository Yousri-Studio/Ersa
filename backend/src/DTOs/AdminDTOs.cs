using ErsaTraining.API.Data.Entities;

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
    public UserStatus Status { get; set; }
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
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
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
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}

public class AdminUpdateCourseRequest
{
    public string TitleAr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
}

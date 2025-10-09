using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using ErsaTraining.API.Services;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        ErsaTrainingDbContext context,
        UserManager<User> userManager,
        ILogger<AdminController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    private async Task<bool> IsAdminOrSuperAdmin()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return false;
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user != null && (user.IsAdmin || user.IsSuperAdmin);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
    }

    private bool IsSuperAdmin()
    {
        return User.IsInRole("SuperAdmin");
    }

    [HttpGet("dashboard-stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        try
        {
            var totalUsers = await _context.Users.Where(u => u.Status != UserStatus.Inactive && !u.IsSuperAdmin&& !u.IsAdmin).CountAsync();
            var activeUsers = await _context.Users.CountAsync(u => u.Status == UserStatus.Active);
            var totalCourses = await _context.Courses.CountAsync();
            var activeCourses = await _context.Courses.CountAsync(c => c.IsActive);
            var totalOrders = await _context.Orders.CountAsync();
            var totalRevenue = (decimal)await _context.Orders
                .Where(o => o.Status == OrderStatus.Paid || o.Status == OrderStatus.Processed || o.Status == OrderStatus.UnderProcess )
                .SumAsync(o => (double)o.Amount);

            var recentUsers = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Take(5)
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email ?? string.Empty,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .Select(o => new OrderSummaryDto
                {
                    Id = o.Id,
                    UserName = o.User.FullName,
                    TotalAmount = o.Amount,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync();

            // Simplified user geographic distribution - skip for now to avoid errors
            var userGeographics = new List<UserGeographicDto>();

            return Ok(new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                TotalCourses = totalCourses,
                ActiveCourses = activeCourses,
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                RecentUsers = recentUsers,
                RecentOrders = recentOrders,
                UserGeographics = userGeographics
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, new { error = "Internal server error", details = ex.Message });
        }
    }

    [HttpGet("users")]
    public async Task<ActionResult<PagedResult<UserDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] UserStatus? status = null)
    {
        try
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => 
                    u.FullName.Contains(search) || 
                    u.Email!.Contains(search) ||
                    u.Phone!.Contains(search));
            }

            if (status.HasValue)
            {
                query = query.Where(u => u.Status == status.Value);
            }

            var totalCount = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email!,
                    Phone = u.Phone,
                    Locale = u.Locale,
                    CreatedAt = u.CreatedAt,
                    IsAdmin = u.IsAdmin,
                    IsSuperAdmin = u.IsSuperAdmin,
                    LastLoginAt = u.LastLoginAt,
                    Status = u.Status.ToString()
                })
                .ToListAsync();

            return Ok(new PagedResult<UserDto>
            {
                Items = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("users/{userId}/status")]
    public async Task<ActionResult> UpdateUserStatus(Guid userId, [FromBody] UpdateUserStatusRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            // Only super admin can modify admin users
            if ((user.IsAdmin || user.IsSuperAdmin) && !IsSuperAdmin())
            {
                return StatusCode(403, new { error = "Insufficient permissions to modify admin users" });
            }

            // Parse the status string to enum
            if (!Enum.TryParse<UserStatus>(request.Status, true, out var userStatus))
            {
                return BadRequest(new { error = $"Invalid status value: {request.Status}. Valid values are: PendingEmailVerification, Active, Inactive, Suspended" });
            }

            user.Status = userStatus;
            user.AdminNotes = request.AdminNotes;
            user.UpdatedAt = DateTime.UtcNow;

            // Check if user has proper Identity fields set (SecurityStamp, etc.)
            if (string.IsNullOrEmpty(user.SecurityStamp))
            {
                // For users created without UserManager, we need to fix their Identity fields
                user.SecurityStamp = Guid.NewGuid().ToString();
                user.ConcurrencyStamp = Guid.NewGuid().ToString();
                
                if (string.IsNullOrEmpty(user.UserName))
                {
                    user.UserName = user.Email;
                }
                
                if (string.IsNullOrEmpty(user.NormalizedUserName))
                {
                    user.NormalizedUserName = user.Email?.ToUpperInvariant();
                }
                
                if (string.IsNullOrEmpty(user.NormalizedEmail))
                {
                    user.NormalizedEmail = user.Email?.ToUpperInvariant();
                }
            }
            
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { error = "Failed to update user", details = errors });
            }

            return Ok(new { message = "User status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user status for user {UserId}", userId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("users/{userId}/admin-role")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult> UpdateAdminRole(Guid userId, [FromBody] UpdateAdminRoleRequest request)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            user.IsAdmin = request.IsAdmin;
            user.IsSuperAdmin = request.IsSuperAdmin;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "Admin role updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating admin role");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("courses")]
    public async Task<ActionResult<PagedResult<AdminCourseDto>>> GetCourses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            var query = _context.Courses
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .AsSplitQuery()
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c => 
                    c.TitleAr.Contains(search) || 
                    c.TitleEn.Contains(search) ||
                    c.DescriptionAr!.Contains(search) ||
                    c.DescriptionEn!.Contains(search));
            }

            if (isActive.HasValue)
            {
                query = query.Where(c => c.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            var courses = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new AdminCourseDto
                {
                    Id = c.Id,
                    Slug = c.Slug,
                    TitleAr = c.TitleAr,
                    TitleEn = c.TitleEn,
                    SummaryAr = c.SummaryAr,
                    SummaryEn = c.SummaryEn,
                    DescriptionAr = c.DescriptionAr,
                    DescriptionEn = c.DescriptionEn,
                    Price = c.Price,
                    Currency = c.Currency,
                    Type = (int)c.Type,
                    Level = (int)c.Level,
                    CategoryId = c.CategoryId,
                    Category = c.Category != null ? new CourseCategoryDto
                    {
                        Id = c.Category.Id,
                        TitleAr = c.Category.TitleAr,
                        TitleEn = c.Category.TitleEn,
                        DisplayOrder = c.Category.DisplayOrder,
                        IsActive = c.Category.IsActive,
                        CreatedAt = c.Category.CreatedAt,
                        UpdatedAt = c.Category.UpdatedAt
                    } : null,
                    SubCategories = c.CourseSubCategoryMappings.Select(m => new CourseSubCategoryDto
                    {
                        Id = m.SubCategory.Id,
                        TitleAr = m.SubCategory.TitleAr,
                        TitleEn = m.SubCategory.TitleEn,
                        DisplayOrder = m.SubCategory.DisplayOrder,
                        IsActive = m.SubCategory.IsActive,
                        CreatedAt = m.SubCategory.CreatedAt,
                        UpdatedAt = m.SubCategory.UpdatedAt
                    }).ToList(),
                    VideoUrl = c.VideoUrl,
                    DurationEn = c.DurationEn,
                    DurationAr = c.DurationAr,
                    InstructorNameAr = c.InstructorNameAr,
                    InstructorNameEn = c.InstructorNameEn,
                    Photo = c.Photo,
                    Tags = c.Tags,
                    InstructorsBioAr = c.InstructorsBioAr,
                    InstructorsBioEn = c.InstructorsBioEn,
                    CourseTopicsAr = c.CourseTopicsAr,
                    CourseTopicsEn = c.CourseTopicsEn,
                    IsActive = c.IsActive,
                    IsFeatured = c.IsFeatured,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            return Ok(new PagedResult<AdminCourseDto>
            {
                Items = courses,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting courses");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("orders")]
    [AllowAnonymous] // Temporary for testing
    public async Task<ActionResult<PagedResult<AdminOrderDto>>> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] OrderStatus? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var query = _context.Orders
                .Include(o => o.User)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(o => o.Status == status.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= toDate.Value);
            }

            var totalCount = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new AdminOrderDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    UserName = o.User.FullName,
                    TotalAmount = o.Amount,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt
                })
                .ToListAsync();

            return Ok(new PagedResult<AdminOrderDto>
            {
                Items = orders,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting orders");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("orders/{orderId}/status")]
    public async Task<ActionResult> UpdateOrderStatus(Guid orderId, [FromBody] UpdateOrderStatusRequest request)
    {
        try
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound(new { error = "Order not found" });
            }

            order.Status = request.Status;
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order status");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("orders/{orderId}")]
    [AllowAnonymous] // Temporary for testing
    public async Task<ActionResult<AdminOrderDetailDto>> GetOrderDetail(Guid orderId)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return NotFound(new { error = "Order not found" });
            }

            var orderDetail = new AdminOrderDetailDto
            {
                Id = order.Id,
                UserId = order.UserId,
                Amount = order.Amount,
                Currency = order.Currency,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Customer = new AdminOrderCustomerDto
                {
                    Id = order.User.Id,
                    FullName = order.User.FullName,
                    Email = order.User.Email ?? string.Empty,
                    Phone = order.User.Phone,
                    Country = order.User.Country,
                    Locale = order.User.Locale,
                    CreatedAt = order.User.CreatedAt
                },
                Items = order.OrderItems.Select(oi => new AdminOrderItemDto
                {
                    Id = oi.Id,
                    CourseId = oi.CourseId,
                    SessionId = oi.SessionId,
                    CourseTitleEn = oi.CourseTitleEn,
                    CourseTitleAr = oi.CourseTitleAr,
                    Price = oi.Price,
                    Currency = oi.Currency,
                    Qty = oi.Qty,
                    CreatedAt = oi.CreatedAt
                }).ToList(),
                Payments = order.Payments.Select(p => new AdminOrderPaymentDto
                {
                    Id = p.Id,
                    Provider = p.Provider,
                    ProviderRef = p.ProviderRef,
                    Status = p.Status,
                    CapturedAt = p.CapturedAt,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList()
            };

            return Ok(orderDetail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting order detail for order {OrderId}", orderId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("orders/{orderId}/invoice")]
    [AllowAnonymous] // Temporary for testing
    public async Task<ActionResult<InvoiceDto>> GenerateInvoice(Guid orderId)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                return NotFound(new { error = "Order not found" });
            }

            // Generate invoice number
            var invoiceNumber = $"INV-{order.Id.ToString().Substring(0, 8).ToUpper()}";

            var invoice = new InvoiceDto
            {
                Id = order.Id,
                InvoiceNumber = invoiceNumber,
                OrderId = order.Id,
                Amount = order.Amount,
                Currency = order.Currency,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                Customer = new InvoiceCustomerDto
                {
                    Id = order.User.Id,
                    FullName = order.User.FullName,
                    Email = order.User.Email ?? string.Empty,
                    Phone = order.User.Phone,
                    Country = order.User.Country,
                    Locale = order.User.Locale,
                    CreatedAt = order.User.CreatedAt
                },
                Items = order.OrderItems.Select(oi => new InvoiceItemDto
                {
                    Id = oi.Id,
                    CourseId = oi.CourseId,
                    SessionId = oi.SessionId,
                    CourseTitleEn = oi.CourseTitleEn,
                    CourseTitleAr = oi.CourseTitleAr,
                    Price = oi.Price,
                    Currency = oi.Currency,
                    Qty = oi.Qty,
                    CreatedAt = oi.CreatedAt
                }).ToList(),
                Payments = order.Payments.Select(p => new InvoicePaymentDto
                {
                    Id = p.Id,
                    Provider = p.Provider,
                    ProviderRef = p.ProviderRef,
                    Status = p.Status,
                    CapturedAt = p.CapturedAt,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                }).ToList()
            };

            return Ok(invoice);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating invoice for order {OrderId}", orderId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private static double[] GetCountryCoordinates(string country)
    {
        // Dictionary of country coordinates [longitude, latitude]
        var coordinates = new Dictionary<string, double[]>
        {
            { "Saudi Arabia", new double[] { 45.0792, 23.8859 } },
            { "Egypt", new double[] { 30.8025, 26.8206 } },
            { "United States", new double[] { -95.7129, 37.0902 } },
            { "United Kingdom", new double[] { -0.1278, 51.5074 } },
            { "Canada", new double[] { -106.3468, 56.1304 } },
            { "Australia", new double[] { 133.7751, -25.2744 } },
            { "Germany", new double[] { 10.4515, 51.1657 } },
            { "France", new double[] { 2.2137, 46.2276 } },
            { "Italy", new double[] { 12.5674, 41.8719 } },
            { "Spain", new double[] { -3.7492, 40.4637 } },
            { "Netherlands", new double[] { 5.2913, 52.1326 } },
            { "Belgium", new double[] { 4.3517, 50.8503 } },
            { "Switzerland", new double[] { 8.2275, 46.8182 } },
            { "Austria", new double[] { 14.5501, 47.5162 } },
            { "Sweden", new double[] { 18.6435, 60.1282 } },
            { "Norway", new double[] { 8.4689, 60.4720 } },
            { "Denmark", new double[] { 9.5018, 56.2639 } },
            { "Finland", new double[] { 25.7482, 61.9241 } },
            { "Poland", new double[] { 19.1451, 51.9194 } },
            { "Czech Republic", new double[] { 15.4726, 49.8175 } },
            { "Hungary", new double[] { 19.5033, 47.1625 } },
            { "Slovakia", new double[] { 19.6990, 48.6690 } },
            { "Slovenia", new double[] { 14.9955, 46.0569 } },
            { "Croatia", new double[] { 15.2000, 45.1000 } },
            { "Serbia", new double[] { 21.0059, 44.0165 } },
            { "Bosnia and Herzegovina", new double[] { 17.6791, 43.9159 } },
            { "Montenegro", new double[] { 19.3744, 42.7087 } },
            { "Albania", new double[] { 20.1683, 41.1533 } },
            { "North Macedonia", new double[] { 21.7453, 41.6086 } },
            { "Kosovo", new double[] { 20.9029, 42.6026 } },
            { "Bulgaria", new double[] { 25.4858, 42.7339 } },
            { "Romania", new double[] { 24.9668, 45.9432 } },
            { "Moldova", new double[] { 28.3699, 47.4116 } },
            { "Ukraine", new double[] { 31.1656, 48.3794 } },
            { "Belarus", new double[] { 27.9534, 53.7098 } },
            { "Lithuania", new double[] { 23.8813, 55.1694 } },
            { "Latvia", new double[] { 24.6032, 56.8796 } },
            { "Estonia", new double[] { 25.0136, 58.5953 } },
            { "Russia", new double[] { 105.3188, 61.5240 } },
            { "Kazakhstan", new double[] { 66.9237, 48.0196 } },
            { "Uzbekistan", new double[] { 64.5853, 41.3775 } },
            { "Turkmenistan", new double[] { 59.5563, 38.9697 } },
            { "Kyrgyzstan", new double[] { 74.7661, 41.2044 } },
            { "Tajikistan", new double[] { 71.2761, 38.5358 } },
            { "Afghanistan", new double[] { 67.7100, 33.9391 } },
            { "Pakistan", new double[] { 69.3451, 30.3753 } },
            { "India", new double[] { 78.9629, 20.5937 } },
            { "Nepal", new double[] { 84.1240, 28.3949 } },
            { "Bhutan", new double[] { 90.5116, 27.5142 } },
            { "Bangladesh", new double[] { 90.3563, 23.6850 } },
            { "Sri Lanka", new double[] { 80.7718, 7.8731 } },
            { "Maldives", new double[] { 73.2207, 3.2028 } },
            { "China", new double[] { 104.1954, 35.8617 } },
            { "Mongolia", new double[] { 103.8467, 46.8625 } },
            { "Japan", new double[] { 138.2529, 36.2048 } },
            { "South Korea", new double[] { 127.7669, 35.9078 } },
            { "North Korea", new double[] { 127.5101, 40.3399 } },
            { "Taiwan", new double[] { 121.5654, 23.6978 } },
            { "Hong Kong", new double[] { 114.1694, 22.3193 } },
            { "Macau", new double[] { 113.5439, 22.1987 } },
            { "Vietnam", new double[] { 108.2772, 14.0583 } },
            { "Laos", new double[] { 102.4955, 19.8563 } },
            { "Cambodia", new double[] { 104.9909, 12.5657 } },
            { "Thailand", new double[] { 101.0188, 15.8700 } },
            { "Myanmar", new double[] { 95.9562, 21.9162 } },
            { "Malaysia", new double[] { 101.6869, 4.2105 } },
            { "Singapore", new double[] { 103.8198, 1.3521 } },
            { "Indonesia", new double[] { 113.9213, -0.7893 } },
            { "Philippines", new double[] { 121.7740, 12.8797 } },
            { "Brunei", new double[] { 114.7277, 4.5353 } },
            { "East Timor", new double[] { 125.7275, -8.8742 } },
            { "Papua New Guinea", new double[] { 143.9555, -6.3150 } },
            { "Fiji", new double[] { 178.0650, -17.7134 } },
            { "New Zealand", new double[] { 174.8860, -40.9006 } },
            { "Brazil", new double[] { -51.9253, -14.2350 } },
            { "Argentina", new double[] { -63.6167, -38.4161 } },
            { "Chile", new double[] { -71.5430, -35.6751 } },
            { "Peru", new double[] { -75.0152, -9.1900 } },
            { "Colombia", new double[] { -74.2973, 4.5709 } },
            { "Venezuela", new double[] { -66.5897, 6.4238 } },
            { "Ecuador", new double[] { -78.1834, -1.8312 } },
            { "Bolivia", new double[] { -63.5887, -16.2902 } },
            { "Paraguay", new double[] { -58.4438, -23.4425 } },
            { "Uruguay", new double[] { -55.7658, -32.5228 } },
            { "Guyana", new double[] { -58.9302, 4.8604 } },
            { "Suriname", new double[] { -56.0278, 3.9193 } },
            { "French Guiana", new double[] { -53.1258, 3.9339 } },
            { "Mexico", new double[] { -102.5528, 23.6345 } },
            { "Guatemala", new double[] { -90.2308, 15.7835 } },
            { "Belize", new double[] { -88.4976, 17.1899 } },
            { "El Salvador", new double[] { -88.8965, 13.7942 } },
            { "Honduras", new double[] { -86.2419, 15.1999 } },
            { "Nicaragua", new double[] { -85.2072, 12.8654 } },
            { "Costa Rica", new double[] { -83.7534, 9.9281 } },
            { "Panama", new double[] { -80.7821, 8.5380 } },
            { "Cuba", new double[] { -77.7812, 21.5218 } },
            { "Jamaica", new double[] { -77.2975, 18.1096 } },
            { "Haiti", new double[] { -72.2852, 18.9712 } },
            { "Dominican Republic", new double[] { -70.1627, 18.7357 } },
            { "Puerto Rico", new double[] { -66.5901, 18.2208 } },
            { "Bahamas", new double[] { -77.3963, 25.0343 } },
            { "Barbados", new double[] { -59.6132, 13.1939 } },
            { "Trinidad and Tobago", new double[] { -61.2225, 10.6598 } },
            { "Grenada", new double[] { -61.6790, 12.1165 } },
            { "Saint Vincent and the Grenadines", new double[] { -61.2872, 12.9843 } },
            { "Saint Lucia", new double[] { -60.9789, 13.9094 } },
            { "Dominica", new double[] { -61.3709, 15.4150 } },
            { "Antigua and Barbuda", new double[] { -61.7964, 17.0608 } },
            { "Saint Kitts and Nevis", new double[] { -62.7829, 17.3578 } },
            { "South Africa", new double[] { 24.9916, -30.5595 } },
            { "Nigeria", new double[] { 7.3986, 9.0820 } },
            { "Kenya", new double[] { 37.9062, -0.0236 } },
            { "Ethiopia", new double[] { 40.4897, 9.1450 } },
            { "Tanzania", new double[] { 34.8888, -6.3690 } },
            { "Uganda", new double[] { 32.2903, 1.3733 } },
            { "Ghana", new double[] { -1.0232, 7.9465 } },
            { "Morocco", new double[] { -7.0926, 31.7917 } },
            { "Algeria", new double[] { 1.6596, 28.0339 } },
            { "Tunisia", new double[] { 9.5375, 33.8869 } },
            { "Libya", new double[] { 17.2283, 26.3351 } },
            { "Sudan", new double[] { 30.2176, 12.8628 } },
            { "South Sudan", new double[] { 31.3070, 6.8770 } },
            { "Chad", new double[] { 18.7322, 15.4542 } },
            { "Niger", new double[] { 8.0817, 17.6078 } },
            { "Mali", new double[] { -3.9962, 17.5707 } },
            { "Burkina Faso", new double[] { -1.5616, 12.2383 } },
            { "Senegal", new double[] { -14.4524, 14.4974 } },
            { "Guinea", new double[] { -9.6966, 9.9456 } },
            { "Guinea-Bissau", new double[] { -15.1804, 11.8037 } },
            { "Sierra Leone", new double[] { -11.7799, 8.4606 } },
            { "Liberia", new double[] { -9.4295, 6.4281 } },
            { "Ivory Coast", new double[] { -5.5471, 7.5400 } },
            { "Togo", new double[] { 0.8248, 8.6195 } },
            { "Benin", new double[] { 2.3158, 9.3077 } },
            { "Cameroon", new double[] { 12.3547, 7.3697 } },
            { "Central African Republic", new double[] { 20.9394, 6.6111 } },
            { "Equatorial Guinea", new double[] { 10.2679, 1.6508 } },
            { "Gabon", new double[] { 11.6094, -0.8037 } },
            { "Republic of the Congo", new double[] { 15.8277, -0.2280 } },
            { "Democratic Republic of the Congo", new double[] { 21.7587, -4.0383 } },
            { "Angola", new double[] { 17.8739, -11.2027 } },
            { "Zambia", new double[] { 27.8493, -13.1339 } },
            { "Zimbabwe", new double[] { 29.1549, -19.0154 } },
            { "Botswana", new double[] { 24.6849, -22.3285 } },
            { "Namibia", new double[] { 18.4904, -22.9576 } },
            { "Lesotho", new double[] { 28.2336, -29.6099 } },
            { "Eswatini", new double[] { 31.4659, -26.5225 } },
            { "Madagascar", new double[] { 46.8691, -18.7669 } },
            { "Mauritius", new double[] { 57.5522, -20.3484 } },
            { "Seychelles", new double[] { 55.4915, -4.6796 } },
            { "Comoros", new double[] { 43.3333, -11.6455 } },
            { "Mayotte", new double[] { 45.1662, -12.8275 } },
            { "Reunion", new double[] { 55.5364, -21.1151 } },
            { "Djibouti", new double[] { 42.5903, 11.8251 } },
            { "Somalia", new double[] { 46.1996, 5.1521 } },
            { "Eritrea", new double[] { 39.7823, 15.1794 } },
            { "Yemen", new double[] { 48.5164, 15.5527 } },
            { "Oman", new double[] { 55.9233, 21.4735 } },
            { "United Arab Emirates", new double[] { 53.8478, 23.4241 } },
            { "Qatar", new double[] { 51.1839, 25.3548 } },
            { "Bahrain", new double[] { 50.5577, 26.0665 } },
            { "Kuwait", new double[] { 47.4818, 29.3117 } },
            { "Iraq", new double[] { 43.6793, 33.2232 } },
            { "Syria", new double[] { 38.9968, 34.8021 } },
            { "Lebanon", new double[] { 35.8623, 33.8547 } },
            { "Jordan", new double[] { 36.2384, 30.5852 } },
            { "Israel", new double[] { 34.8516, 31.0461 } },
            { "Palestine", new double[] { 35.3027, 31.9522 } },
            { "Iran", new double[] { 53.6880, 32.4279 } },
            { "Turkey", new double[] { 35.2433, 38.9637 } },
            { "Cyprus", new double[] { 33.4299, 35.1264 } },
            { "Greece", new double[] { 21.8243, 39.0742 } }
        };

        return coordinates.TryGetValue(country, out var coords) ? coords : new double[] { 0, 0 };
    }

    [HttpPost("users")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email, // UserName is required for Identity
                Phone = request.Phone,
                Locale = request.Locale,
                IsAdmin = request.IsAdmin ?? false,
                IsSuperAdmin = request.IsSuperAdmin ?? false,
                Status = UserStatus.Active,
                EmailConfirmed = true, // Since admin is creating the user
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Use UserManager to create the user properly with all Identity fields
            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { error = "Failed to create user", details = errors });
            }

            var userDto = new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                Locale = user.Locale,
                CreatedAt = user.CreatedAt,
                IsAdmin = user.IsAdmin,
                IsSuperAdmin = user.IsSuperAdmin,
                LastLoginAt = user.LastLoginAt,
                Status = user.Status.ToString()
            };

            return Ok(userDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return BadRequest(new { error = $"Failed to create user: {ex.Message}" });
        }
    }

    [HttpPost("courses")]
    public async Task<ActionResult<AdminCourseDto>> CreateCourse([FromBody] AdminCreateCourseRequest request)
    {
        try
        {
            // Validate CategoryId if provided
            if (request.CategoryId.HasValue)
            {
                var categoryExists = await _context.CourseCategories.AnyAsync(c => c.Id == request.CategoryId.Value);
                if (!categoryExists)
                {
                    return BadRequest(new { error = "Invalid category ID" });
                }
            }

            // Validate SubCategoryIds if provided
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                var existingSubCategoryIds = await _context.CourseSubCategories
                    .Where(sc => request.SubCategoryIds.Contains(sc.Id))
                    .Select(sc => sc.Id)
                    .ToListAsync();

                if (existingSubCategoryIds.Count != request.SubCategoryIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid subcategory IDs" });
                }
            }

            var course = new Course
            {
                Id = Guid.NewGuid(),
                Slug = request.Slug,
                TitleAr = request.TitleAr,
                TitleEn = request.TitleEn,
                SummaryAr = request.SummaryAr,
                SummaryEn = request.SummaryEn,
                DescriptionAr = request.DescriptionAr,
                DescriptionEn = request.DescriptionEn,
                Price = request.Price,
                Currency = request.Currency,
                Type = (CourseType)(request.Type ?? 1),
                Level = (CourseLevel)(request.Level ?? 1),
                CategoryId = request.CategoryId,
                VideoUrl = request.VideoUrl,
                DurationEn = request.DurationEn,
                DurationAr = request.DurationAr,
                From = request.From,
                To = request.To,
                SessionsNotesEn = request.SessionsNotesEn,
                SessionsNotesAr = request.SessionsNotesAr,
                InstructorNameAr = request.InstructorNameAr,
                InstructorNameEn = request.InstructorNameEn,
                Photo = !string.IsNullOrEmpty(request.Photo) ? Convert.FromBase64String(request.Photo) : null,
                Tags = request.Tags,
                InstructorsBioAr = request.InstructorsBioAr,
                InstructorsBioEn = request.InstructorsBioEn,
                CourseTopicsAr = request.CourseTopicsAr,
                CourseTopicsEn = request.CourseTopicsEn,
                IsActive = request.IsActive,
                IsFeatured = request.IsFeatured ?? false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            // Add subcategory mappings
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                foreach (var subCategoryId in request.SubCategoryIds)
                {
                    var mapping = new CourseSubCategoryMapping
                    {
                        CourseId = course.Id,
                        SubCategoryId = subCategoryId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.CourseSubCategoryMappings.Add(mapping);
                }
                await _context.SaveChangesAsync();
            }

            // Reload course with related data
            var createdCourse = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .FirstOrDefaultAsync(c => c.Id == course.Id);

            var courseDto = new AdminCourseDto
            {
                Id = createdCourse!.Id,
                Slug = createdCourse.Slug,
                TitleAr = createdCourse.TitleAr,
                TitleEn = createdCourse.TitleEn,
                SummaryAr = createdCourse.SummaryAr,
                SummaryEn = createdCourse.SummaryEn,
                DescriptionAr = createdCourse.DescriptionAr,
                DescriptionEn = createdCourse.DescriptionEn,
                Price = createdCourse.Price,
                Currency = createdCourse.Currency,
                Type = (int)createdCourse.Type,
                Level = (int)createdCourse.Level,
                CategoryId = createdCourse.CategoryId,
                Category = createdCourse.Category != null ? new CourseCategoryDto
                {
                    Id = createdCourse.Category.Id,
                    TitleAr = createdCourse.Category.TitleAr,
                    TitleEn = createdCourse.Category.TitleEn,
                    DisplayOrder = createdCourse.Category.DisplayOrder,
                    IsActive = createdCourse.Category.IsActive,
                    CreatedAt = createdCourse.Category.CreatedAt,
                    UpdatedAt = createdCourse.Category.UpdatedAt
                } : null,
                SubCategories = createdCourse.CourseSubCategoryMappings.Select(m => new CourseSubCategoryDto
                {
                    Id = m.SubCategory.Id,
                    TitleAr = m.SubCategory.TitleAr,
                    TitleEn = m.SubCategory.TitleEn,
                    DisplayOrder = m.SubCategory.DisplayOrder,
                    IsActive = m.SubCategory.IsActive,
                    CreatedAt = m.SubCategory.CreatedAt,
                    UpdatedAt = m.SubCategory.UpdatedAt
                }).ToList(),
                VideoUrl = createdCourse.VideoUrl,
                DurationEn = createdCourse.DurationEn,
                DurationAr = createdCourse.DurationAr,
                From = createdCourse.From,
                To = createdCourse.To,
                SessionsNotesEn = createdCourse.SessionsNotesEn,
                SessionsNotesAr = createdCourse.SessionsNotesAr,
                InstructorNameAr = createdCourse.InstructorNameAr,
                InstructorNameEn = createdCourse.InstructorNameEn,
                Photo = createdCourse.Photo,
                Tags = createdCourse.Tags,
                InstructorsBioAr = createdCourse.InstructorsBioAr,
                InstructorsBioEn = createdCourse.InstructorsBioEn,
                CourseTopicsAr = createdCourse.CourseTopicsAr,
                CourseTopicsEn = createdCourse.CourseTopicsEn,
                IsActive = createdCourse.IsActive,
                IsFeatured = createdCourse.IsFeatured,
                CreatedAt = createdCourse.CreatedAt,
                UpdatedAt = createdCourse.UpdatedAt
            };

            return Ok(courseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            return BadRequest(new { error = $"Failed to create course: {ex.Message}" });
        }
    }

    [HttpPut("courses/{courseId}")]
    public async Task<ActionResult<AdminCourseDto>> UpdateCourse(Guid courseId, [FromBody] AdminUpdateCourseRequest request)
    {
        try
        {
            var course = await _context.Courses
                .Include(c => c.CourseSubCategoryMappings)
                .FirstOrDefaultAsync(c => c.Id == courseId);
            
            if (course == null)
            {
                return NotFound(new { error = "Course not found" });
            }

            // Validate CategoryId if provided
            if (request.CategoryId.HasValue)
            {
                var categoryExists = await _context.CourseCategories.AnyAsync(c => c.Id == request.CategoryId.Value);
                if (!categoryExists)
                {
                    return BadRequest(new { error = "Invalid category ID" });
                }
            }

            // Validate SubCategoryIds if provided
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                var existingSubCategoryIds = await _context.CourseSubCategories
                    .Where(sc => request.SubCategoryIds.Contains(sc.Id))
                    .Select(sc => sc.Id)
                    .ToListAsync();

                if (existingSubCategoryIds.Count != request.SubCategoryIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid subcategory IDs" });
                }
            }

            course.Slug = request.Slug;
            course.TitleAr = request.TitleAr;
            course.TitleEn = request.TitleEn;
            course.SummaryAr = request.SummaryAr;
            course.SummaryEn = request.SummaryEn;
            course.DescriptionAr = request.DescriptionAr;
            course.DescriptionEn = request.DescriptionEn;
            course.Price = request.Price;
            course.Currency = request.Currency;
            course.Type = (CourseType)(request.Type ?? 1);
            course.Level = (CourseLevel)(request.Level ?? 1);
            course.CategoryId = request.CategoryId;
            course.VideoUrl = request.VideoUrl;
            course.DurationEn = request.DurationEn;
            course.DurationAr = request.DurationAr;
            course.From = request.From;
            course.To = request.To;
            course.SessionsNotesEn = request.SessionsNotesEn;
            course.SessionsNotesAr = request.SessionsNotesAr;
            
            // Debug logging
            _logger.LogInformation($"Updating course {courseId} with From: {request.From}, To: {request.To}, SessionsNotesEn: {request.SessionsNotesEn}, SessionsNotesAr: {request.SessionsNotesAr}");
            course.InstructorNameAr = request.InstructorNameAr;
            course.InstructorNameEn = request.InstructorNameEn;
            course.Photo = !string.IsNullOrEmpty(request.Photo) ? Convert.FromBase64String(request.Photo) : null;
            course.Tags = request.Tags;
            course.InstructorsBioAr = request.InstructorsBioAr;
            course.InstructorsBioEn = request.InstructorsBioEn;
            course.CourseTopicsAr = request.CourseTopicsAr;
            course.CourseTopicsEn = request.CourseTopicsEn;
            course.IsActive = request.IsActive;
            course.IsFeatured = request.IsFeatured ?? false;
            course.UpdatedAt = DateTime.UtcNow;

            // Update subcategory mappings
            // Remove existing mappings
            _context.CourseSubCategoryMappings.RemoveRange(course.CourseSubCategoryMappings);
            
            // Add new mappings
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                foreach (var subCategoryId in request.SubCategoryIds)
                {
                    var mapping = new CourseSubCategoryMapping
                    {
                        CourseId = course.Id,
                        SubCategoryId = subCategoryId,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.CourseSubCategoryMappings.Add(mapping);
                }
            }

            await _context.SaveChangesAsync();
            
            // Debug logging after save
            _logger.LogInformation($"Course {courseId} saved successfully. From: {course.From}, To: {course.To}, SessionsNotesEn: {course.SessionsNotesEn}, SessionsNotesAr: {course.SessionsNotesAr}");

            // Reload course with related data
            var updatedCourse = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            var courseDto = new AdminCourseDto
            {
                Id = updatedCourse!.Id,
                Slug = updatedCourse.Slug,
                TitleAr = updatedCourse.TitleAr,
                TitleEn = updatedCourse.TitleEn,
                SummaryAr = updatedCourse.SummaryAr,
                SummaryEn = updatedCourse.SummaryEn,
                DescriptionAr = updatedCourse.DescriptionAr,
                DescriptionEn = updatedCourse.DescriptionEn,
                Price = updatedCourse.Price,
                Currency = updatedCourse.Currency,
                Type = (int)updatedCourse.Type,
                Level = (int)updatedCourse.Level,
                CategoryId = updatedCourse.CategoryId,
                Category = updatedCourse.Category != null ? new CourseCategoryDto
                {
                    Id = updatedCourse.Category.Id,
                    TitleAr = updatedCourse.Category.TitleAr,
                    TitleEn = updatedCourse.Category.TitleEn,
                    DisplayOrder = updatedCourse.Category.DisplayOrder,
                    IsActive = updatedCourse.Category.IsActive,
                    CreatedAt = updatedCourse.Category.CreatedAt,
                    UpdatedAt = updatedCourse.Category.UpdatedAt
                } : null,
                SubCategories = updatedCourse.CourseSubCategoryMappings.Select(m => new CourseSubCategoryDto
                {
                    Id = m.SubCategory.Id,
                    TitleAr = m.SubCategory.TitleAr,
                    TitleEn = m.SubCategory.TitleEn,
                    DisplayOrder = m.SubCategory.DisplayOrder,
                    IsActive = m.SubCategory.IsActive,
                    CreatedAt = m.SubCategory.CreatedAt,
                    UpdatedAt = m.SubCategory.UpdatedAt
                }).ToList(),
                VideoUrl = updatedCourse.VideoUrl,
                DurationEn = updatedCourse.DurationEn,
                DurationAr = updatedCourse.DurationAr,
                From = updatedCourse.From,
                To = updatedCourse.To,
                SessionsNotesEn = updatedCourse.SessionsNotesEn,
                SessionsNotesAr = updatedCourse.SessionsNotesAr,
                InstructorNameAr = updatedCourse.InstructorNameAr,
                InstructorNameEn = updatedCourse.InstructorNameEn,
                Photo = updatedCourse.Photo,
                Tags = updatedCourse.Tags,
                InstructorsBioAr = updatedCourse.InstructorsBioAr,
                InstructorsBioEn = updatedCourse.InstructorsBioEn,
                CourseTopicsAr = updatedCourse.CourseTopicsAr,
                CourseTopicsEn = updatedCourse.CourseTopicsEn,
                IsActive = updatedCourse.IsActive,
                IsFeatured = updatedCourse.IsFeatured,
                CreatedAt = updatedCourse.CreatedAt,
                UpdatedAt = updatedCourse.UpdatedAt
            };

            return Ok(courseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course");
            return BadRequest(new { error = $"Failed to update course: {ex.Message}" });
        }
    }

    [HttpDelete("courses/{courseId}")]
    public async Task<ActionResult> DeleteCourse(Guid courseId)
    {
        if (!await IsAdminOrSuperAdmin())
        {
            return Forbid("Access denied. Admin or SuperAdmin role required.");
        }

        try
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok("Course deleted successfully");
        }
        catch (Exception ex)
        {
            return BadRequest($"Failed to delete course: {ex.Message}");
        }
    }

    // ===================================================================
    // COURSE CATEGORIES ENDPOINTS
    // ===================================================================

    [HttpGet("course-categories")]
    public async Task<ActionResult<IEnumerable<CourseCategoryDto>>> GetCourseCategories([FromQuery] bool activeOnly = false)
    {
        var query = _context.CourseCategories.AsQueryable();

        if (activeOnly)
        {
            query = query.Where(c => c.IsActive);
        }

        var categories = await query
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CourseCategoryDto
            {
                Id = c.Id,
                TitleAr = c.TitleAr,
                TitleEn = c.TitleEn,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("course-categories/{id}")]
    public async Task<ActionResult<CourseCategoryDto>> GetCourseCategory(Guid id)
    {
        var category = await _context.CourseCategories.FindAsync(id);

        if (category == null)
        {
            return NotFound($"Course category with ID {id} not found");
        }

        return Ok(new CourseCategoryDto
        {
            Id = category.Id,
            TitleAr = category.TitleAr,
            TitleEn = category.TitleEn,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        });
    }

    [HttpPost("course-categories")]
    public async Task<ActionResult<CourseCategoryDto>> CreateCourseCategory([FromBody] CreateCourseCategoryRequest request)
    {
        var category = new CourseCategory
        {
            Id = Guid.NewGuid(),
            TitleAr = request.TitleAr,
            TitleEn = request.TitleEn,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.CourseCategories.Add(category);
        await _context.SaveChangesAsync();

        var dto = new CourseCategoryDto
        {
            Id = category.Id,
            TitleAr = category.TitleAr,
            TitleEn = category.TitleEn,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };

        return CreatedAtAction(nameof(GetCourseCategory), new { id = category.Id }, dto);
    }

    [HttpPut("course-categories/{id}")]
    public async Task<ActionResult<CourseCategoryDto>> UpdateCourseCategory(Guid id, [FromBody] UpdateCourseCategoryRequest request)
    {
        var category = await _context.CourseCategories.FindAsync(id);

        if (category == null)
        {
            return NotFound($"Course category with ID {id} not found");
        }

        category.TitleAr = request.TitleAr;
        category.TitleEn = request.TitleEn;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new CourseCategoryDto
        {
            Id = category.Id,
            TitleAr = category.TitleAr,
            TitleEn = category.TitleEn,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        });
    }

    [HttpDelete("course-categories/{id}")]
    public async Task<IActionResult> DeleteCourseCategory(Guid id)
    {
        if (!await IsAdminOrSuperAdmin())
        {
            return Forbid("Access denied. Admin or SuperAdmin role required.");
        }

        var category = await _context.CourseCategories.FindAsync(id);

        if (category == null)
        {
            return NotFound($"Course category with ID {id} not found");
        }

        // Check if any courses are using this category
        var coursesCount = await _context.Courses.CountAsync(c => c.CategoryId == id);
        if (coursesCount > 0)
        {
            return BadRequest($"Cannot delete category. {coursesCount} course(s) are using this category.");
        }

        _context.CourseCategories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok("Course category deleted successfully");
    }

    // ===================================================================
    // COURSE SUBCATEGORIES ENDPOINTS
    // ===================================================================

    [HttpGet("course-subcategories")]
    public async Task<ActionResult<IEnumerable<CourseSubCategoryDto>>> GetCourseSubCategories([FromQuery] bool activeOnly = false)
    {
        var query = _context.CourseSubCategories.AsQueryable();

        if (activeOnly)
        {
            query = query.Where(c => c.IsActive);
        }

        var subCategories = await query
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CourseSubCategoryDto
            {
                Id = c.Id,
                TitleAr = c.TitleAr,
                TitleEn = c.TitleEn,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();

        return Ok(subCategories);
    }

    [HttpGet("course-subcategories/{id}")]
    public async Task<ActionResult<CourseSubCategoryDto>> GetCourseSubCategory(Guid id)
    {
        var subCategory = await _context.CourseSubCategories.FindAsync(id);

        if (subCategory == null)
        {
            return NotFound($"Course subcategory with ID {id} not found");
        }

        return Ok(new CourseSubCategoryDto
        {
            Id = subCategory.Id,
            TitleAr = subCategory.TitleAr,
            TitleEn = subCategory.TitleEn,
            DisplayOrder = subCategory.DisplayOrder,
            IsActive = subCategory.IsActive,
            CreatedAt = subCategory.CreatedAt,
            UpdatedAt = subCategory.UpdatedAt
        });
    }

    [HttpPost("course-subcategories")]
    public async Task<ActionResult<CourseSubCategoryDto>> CreateCourseSubCategory([FromBody] CreateCourseSubCategoryRequest request)
    {
        var subCategory = new CourseSubCategory
        {
            Id = Guid.NewGuid(),
            TitleAr = request.TitleAr,
            TitleEn = request.TitleEn,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.CourseSubCategories.Add(subCategory);
        await _context.SaveChangesAsync();

        var dto = new CourseSubCategoryDto
        {
            Id = subCategory.Id,
            TitleAr = subCategory.TitleAr,
            TitleEn = subCategory.TitleEn,
            DisplayOrder = subCategory.DisplayOrder,
            IsActive = subCategory.IsActive,
            CreatedAt = subCategory.CreatedAt,
            UpdatedAt = subCategory.UpdatedAt
        };

        return CreatedAtAction(nameof(GetCourseSubCategory), new { id = subCategory.Id }, dto);
    }

    [HttpPut("course-subcategories/{id}")]
    public async Task<ActionResult<CourseSubCategoryDto>> UpdateCourseSubCategory(Guid id, [FromBody] UpdateCourseSubCategoryRequest request)
    {
        var subCategory = await _context.CourseSubCategories.FindAsync(id);

        if (subCategory == null)
        {
            return NotFound($"Course subcategory with ID {id} not found");
        }

        subCategory.TitleAr = request.TitleAr;
        subCategory.TitleEn = request.TitleEn;
        subCategory.DisplayOrder = request.DisplayOrder;
        subCategory.IsActive = request.IsActive;
        subCategory.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new CourseSubCategoryDto
        {
            Id = subCategory.Id,
            TitleAr = subCategory.TitleAr,
            TitleEn = subCategory.TitleEn,
            DisplayOrder = subCategory.DisplayOrder,
            IsActive = subCategory.IsActive,
            CreatedAt = subCategory.CreatedAt,
            UpdatedAt = subCategory.UpdatedAt
        });
    }

    [HttpDelete("course-subcategories/{id}")]
    public async Task<IActionResult> DeleteCourseSubCategory(Guid id)
    {
        if (!await IsAdminOrSuperAdmin())
        {
            return Forbid("Access denied. Admin or SuperAdmin role required.");
        }

        var subCategory = await _context.CourseSubCategories.FindAsync(id);

        if (subCategory == null)
        {
            return NotFound($"Course subcategory with ID {id} not found");
        }

        // Check if any courses are using this subcategory
        var mappingsCount = await _context.CourseSubCategoryMappings.CountAsync(m => m.SubCategoryId == id);
        if (mappingsCount > 0)
        {
            return BadRequest($"Cannot delete subcategory. {mappingsCount} course(s) are using this subcategory.");
        }

        _context.CourseSubCategories.Remove(subCategory);
        await _context.SaveChangesAsync();

        return Ok("Course subcategory deleted successfully");
    }

    // ===================================================================
    // INSTRUCTORS ENDPOINTS
    // ===================================================================

    [HttpGet("instructors")]
    public async Task<ActionResult<IEnumerable<AdminInstructorDto>>> GetInstructors()
    {
        var instructors = await _context.Instructors
            .Include(i => i.CourseInstructors)
            .OrderBy(i => i.InstructorNameEn)
            .Select(i => new AdminInstructorDto
            {
                Id = i.Id,
                InstructorNameEn = i.InstructorNameEn,
                InstructorNameAr = i.InstructorNameAr,
                InstructorBioEn = i.InstructorBioEn ?? "",
                InstructorBioAr = i.InstructorBioAr ?? "",
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt,
                CourseIds = i.CourseInstructors.Select(ci => ci.CourseId).ToList()
            })
            .ToListAsync();

        return Ok(instructors);
    }

    [HttpGet("instructors/{id}")]
    public async Task<ActionResult<AdminInstructorDto>> GetInstructor(Guid id)
    {
        var instructor = await _context.Instructors
            .Include(i => i.CourseInstructors)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instructor == null)
        {
            return NotFound($"Instructor with ID {id} not found");
        }

        return Ok(new AdminInstructorDto
        {
            Id = instructor.Id,
            InstructorNameEn = instructor.InstructorNameEn,
            InstructorNameAr = instructor.InstructorNameAr,
            InstructorBioEn = instructor.InstructorBioEn ?? "",
            InstructorBioAr = instructor.InstructorBioAr ?? "",
            CreatedAt = instructor.CreatedAt,
            UpdatedAt = instructor.UpdatedAt,
            CourseIds = instructor.CourseInstructors.Select(ci => ci.CourseId).ToList()
        });
    }

    [HttpPost("instructors")]
    public async Task<ActionResult<AdminInstructorDto>> CreateInstructor([FromBody] CreateInstructorRequest request)
    {
        // Validate CourseIds if provided
        if (request.CourseIds != null && request.CourseIds.Any())
        {
            var validCourseIds = await _context.Courses
                .Where(c => request.CourseIds.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync();

            if (validCourseIds.Count != request.CourseIds.Count)
            {
                var invalidIds = request.CourseIds.Except(validCourseIds).ToList();
                _logger.LogWarning($"Invalid course IDs provided when creating instructor: {string.Join(", ", invalidIds)}");
                return BadRequest($"Invalid course IDs: {string.Join(", ", invalidIds)}. Please provide valid course GUIDs.");
            }
        }

        var instructor = new Instructor
        {
            Id = Guid.NewGuid(),
            InstructorNameEn = request.InstructorNameEn,
            InstructorNameAr = request.InstructorNameAr,
            InstructorBioEn = request.InstructorBioEn,
            InstructorBioAr = request.InstructorBioAr,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Instructors.Add(instructor);
        await _context.SaveChangesAsync();

        // Add course-instructor mappings
        if (request.CourseIds != null && request.CourseIds.Any())
        {
            var mappings = request.CourseIds.Select(courseId => new CourseInstructor
            {
                CourseId = courseId,
                InstructorId = instructor.Id,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.CourseInstructors.AddRange(mappings);
            await _context.SaveChangesAsync();
        }

        var dto = new AdminInstructorDto
        {
            Id = instructor.Id,
            InstructorNameEn = instructor.InstructorNameEn,
            InstructorNameAr = instructor.InstructorNameAr,
            InstructorBioEn = instructor.InstructorBioEn ?? "",
            InstructorBioAr = instructor.InstructorBioAr ?? "",
            CreatedAt = instructor.CreatedAt,
            UpdatedAt = instructor.UpdatedAt,
            CourseIds = request.CourseIds ?? new List<Guid>()
        };

        return CreatedAtAction(nameof(GetInstructor), new { id = instructor.Id }, dto);
    }

    [HttpPut("instructors/{id}")]
    public async Task<ActionResult<AdminInstructorDto>> UpdateInstructor(Guid id, [FromBody] UpdateInstructorRequest request)
    {
        var instructor = await _context.Instructors
            .Include(i => i.CourseInstructors)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instructor == null)
        {
            return NotFound($"Instructor with ID {id} not found");
        }

        // Validate CourseIds if provided
        if (request.CourseIds != null && request.CourseIds.Any())
        {
            var validCourseIds = await _context.Courses
                .Where(c => request.CourseIds.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync();

            if (validCourseIds.Count != request.CourseIds.Count)
            {
                var invalidIds = request.CourseIds.Except(validCourseIds).ToList();
                _logger.LogWarning($"Invalid course IDs provided for instructor {id}: {string.Join(", ", invalidIds)}");
                return BadRequest($"Invalid course IDs: {string.Join(", ", invalidIds)}. Please provide valid course GUIDs.");
            }
        }

        instructor.InstructorNameEn = request.InstructorNameEn;
        instructor.InstructorNameAr = request.InstructorNameAr;
        instructor.InstructorBioEn = request.InstructorBioEn;
        instructor.InstructorBioAr = request.InstructorBioAr;
        instructor.UpdatedAt = DateTime.UtcNow;

        // Update course-instructor mappings
        _context.CourseInstructors.RemoveRange(instructor.CourseInstructors);

        if (request.CourseIds != null && request.CourseIds.Any())
        {
            var mappings = request.CourseIds.Select(courseId => new CourseInstructor
            {
                CourseId = courseId,
                InstructorId = instructor.Id,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.CourseInstructors.AddRange(mappings);
        }

        await _context.SaveChangesAsync();

        return Ok(new AdminInstructorDto
        {
            Id = instructor.Id,
            InstructorNameEn = instructor.InstructorNameEn,
            InstructorNameAr = instructor.InstructorNameAr,
            InstructorBioEn = instructor.InstructorBioEn ?? "",
            InstructorBioAr = instructor.InstructorBioAr ?? "",
            CreatedAt = instructor.CreatedAt,
            UpdatedAt = instructor.UpdatedAt,
            CourseIds = request.CourseIds ?? new List<Guid>()
        });
    }

    [HttpDelete("instructors/{id}")]
    public async Task<IActionResult> DeleteInstructor(Guid id)
    {
        if (!await IsAdminOrSuperAdmin())
        {
            return Forbid("Access denied. Admin or SuperAdmin role required.");
        }

        var instructor = await _context.Instructors
            .Include(i => i.CourseInstructors)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instructor == null)
        {
            return NotFound($"Instructor with ID {id} not found");
        }

        // Remove all course-instructor relationships first
        if (instructor.CourseInstructors.Any())
        {
            _logger.LogInformation($"Removing {instructor.CourseInstructors.Count} course relationships for instructor {id}");
            _context.CourseInstructors.RemoveRange(instructor.CourseInstructors);
        }

        // Now remove the instructor
        _context.Instructors.Remove(instructor);
        await _context.SaveChangesAsync();

        _logger.LogInformation($"Successfully deleted instructor {id} ({instructor.InstructorNameEn})");
        return Ok(new { message = "Instructor deleted successfully" });
    }

}

using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ErsaTraining.API.Services;

/// <summary>
/// Provides services for managing bills.
/// </summary>
public class BillService : IBillService
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<BillService> _logger;

    public BillService(ErsaTrainingDbContext context, ILogger<BillService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Updates the status of a bill and its corresponding order.
    /// </summary>
    /// <param name="billId">The ID of the bill to update.</param>
    /// <param name="status">The new status of the bill.</param>
    /// <param name="paymentProvider">The payment provider used for the transaction.</param>
    /// <param name="providerTransactionId">The transaction ID from the payment provider.</param>
    public async Task UpdateBillStatusAsync(Guid billId, BillStatus status, string? paymentProvider, string? providerTransactionId)
    {
        var bill = await _context.Bills.Include(b => b.Order).FirstOrDefaultAsync(b => b.Id == billId);

        if (bill == null)
        {
            _logger.LogWarning("Bill with ID {BillId} not found.", billId);
            return;
        }

        bill.Status = status;
        bill.PaymentProvider = paymentProvider;
        bill.ProviderTransactionId = providerTransactionId;
        bill.UpdatedAt = DateTime.UtcNow;

        // Update the corresponding order's status
        switch (status)
        {
            case BillStatus.Paid:
                bill.Order.Status = OrderStatus.Paid;
                break;
            case BillStatus.Failed:
                bill.Order.Status = OrderStatus.Failed;
                break;
            case BillStatus.Expired:
                bill.Order.Status = OrderStatus.Expired;
                break;
        }
        bill.Order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}

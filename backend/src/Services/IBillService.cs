using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

/// <summary>
/// Defines the contract for a service that manages bills.
/// </summary>
public interface IBillService
{
    /// <summary>
    /// Updates the status of a bill.
    /// </summary>
    /// <param name="billId">The ID of the bill to update.</param>
    /// <param name="status">The new status of the bill.</param>
    /// <param name="paymentProvider">The payment provider used for the transaction.</param>
    /// <param name="providerTransactionId">The transaction ID from the payment provider.</param>
    Task UpdateBillStatusAsync(Guid billId, BillStatus status, string? paymentProvider, string? providerTransactionId);
}

using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public interface IEnrollmentService
{
    Task<List<Enrollment>> CreateEnrollmentsFromOrderAsync(Order order);
    Task<List<Enrollment>> GetUserEnrollmentsAsync(Guid userId);
    Task<bool> SendLiveDetailsAsync(Guid enrollmentId, string locale);
    Task<bool> DeliverMaterialsAsync(Guid enrollmentId, List<Guid> attachmentIds);
    Task<List<SecureLink>> CreateSecureLinksAsync(Enrollment enrollment, List<Attachment> attachments);
    Task<bool> RevokeSecureLinkAsync(Guid secureLinkId);
    Task ScheduleLiveRemindersAsync(Enrollment enrollment);
}
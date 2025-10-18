using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public interface ISecureLinkService
{
    Task<List<SecureLink>> CreateSecureLinksAsync(Guid enrollmentId, List<Guid> attachmentIds);
    Task<SecureLink?> GetSecureLinkByTokenAsync(string token);
    Task<bool> RevokeSecureLinkAsync(Guid linkId);
}


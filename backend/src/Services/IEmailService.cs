using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public interface IEmailService
{
    Task<bool> SendWelcomeEmailAsync(User user);
    Task<bool> SendEmailVerificationAsync(User user, string verificationToken);
    Task<bool> SendLiveDetailsEmailAsync(Enrollment enrollment, string locale);
    Task<bool> SendMaterialsDeliveryEmailAsync(Enrollment enrollment, List<SecureLink> secureLinks, string locale);
    Task<bool> SendLiveReminderEmailAsync(Enrollment enrollment, string locale, int hoursBeforeStart);
    Task ProcessWebhookAsync(string payload, string signature);
}

public class EmailTemplateData
{
    public Dictionary<string, string> Variables { get; set; } = new();
    
    public void AddVariable(string key, string value)
    {
        Variables[key] = value;
    }
}
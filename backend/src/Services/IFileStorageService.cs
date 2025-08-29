namespace ErsaTraining.API.Services;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<Stream?> DownloadFileAsync(string blobPath);
    Task<bool> DeleteFileAsync(string blobPath);
    Task<bool> FileExistsAsync(string blobPath);
    Task<long> GetFileSizeAsync(string blobPath);
}

public class FileUploadResult
{
    public bool Success { get; set; }
    public string? BlobPath { get; set; }
    public string? Error { get; set; }
    public long FileSize { get; set; }
}
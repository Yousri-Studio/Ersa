using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace ErsaTraining.API.Services;

public class FileStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileStorageService> _logger;
    private readonly string _containerName;

    public FileStorageService(
        BlobServiceClient blobServiceClient,
        IConfiguration configuration,
        ILogger<FileStorageService> logger)
    {
        _blobServiceClient = blobServiceClient;
        _configuration = configuration;
        _logger = logger;
        _containerName = _configuration["Storage:ContainerName"] ?? "course-materials";
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            // Generate unique blob name
            var blobName = $"{Guid.NewGuid()}/{fileName}";
            var blobClient = containerClient.GetBlobClient(blobName);

            // Upload with metadata
            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType
            };

            var metadata = new Dictionary<string, string>
            {
                ["original_filename"] = fileName,
                ["upload_date"] = DateTime.UtcNow.ToString("O")
            };

            await blobClient.UploadAsync(
                fileStream,
                new BlobUploadOptions
                {
                    HttpHeaders = blobHttpHeaders,
                    Metadata = metadata
                });

            return blobName;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file {FileName}", fileName);
            throw;
        }
    }

    public async Task<Stream?> DownloadFileAsync(string blobPath)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobPath);

            if (!await blobClient.ExistsAsync())
            {
                return null;
            }

            var response = await blobClient.DownloadStreamingAsync();
            return response.Value.Content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file {BlobPath}", blobPath);
            return null;
        }
    }

    public async Task<bool> DeleteFileAsync(string blobPath)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobPath);

            var response = await blobClient.DeleteIfExistsAsync();
            return response.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {BlobPath}", blobPath);
            return false;
        }
    }

    public async Task<bool> FileExistsAsync(string blobPath)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobPath);

            var response = await blobClient.ExistsAsync();
            return response.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking file existence {BlobPath}", blobPath);
            return false;
        }
    }

    public async Task<long> GetFileSizeAsync(string blobPath)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobPath);

            var properties = await blobClient.GetPropertiesAsync();
            return properties.Value.ContentLength;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting file size {BlobPath}", blobPath);
            return 0;
        }
    }
}

// Alternative local file storage implementation
public class LocalFileStorageService : IFileStorageService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<LocalFileStorageService> _logger;
    private readonly string _storagePath;

    public LocalFileStorageService(IConfiguration configuration, ILogger<LocalFileStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _storagePath = _configuration["Storage:LocalPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "storage");
        
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var blobPath = $"{Guid.NewGuid()}/{fileName}";
            var fullPath = Path.Combine(_storagePath, blobPath);
            var directory = Path.GetDirectoryName(fullPath);
            
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory!);
            }

            using var fileStreamOut = File.Create(fullPath);
            await fileStream.CopyToAsync(fileStreamOut);

            return blobPath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file {FileName} to local storage", fileName);
            throw;
        }
    }

    public async Task<Stream?> DownloadFileAsync(string blobPath)
    {
        try
        {
            var fullPath = Path.Combine(_storagePath, blobPath);
            
            if (!File.Exists(fullPath))
            {
                return null;
            }

            var fileBytes = await File.ReadAllBytesAsync(fullPath);
            return new MemoryStream(fileBytes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file {BlobPath} from local storage", blobPath);
            return null;
        }
    }

    public async Task<bool> DeleteFileAsync(string blobPath)
    {
        try
        {
            var fullPath = Path.Combine(_storagePath, blobPath);
            
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file {BlobPath} from local storage", blobPath);
            return false;
        }
    }

    public async Task<bool> FileExistsAsync(string blobPath)
    {
        try
        {
            var fullPath = Path.Combine(_storagePath, blobPath);
            return File.Exists(fullPath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking file existence {BlobPath} in local storage", blobPath);
            return false;
        }
    }

    public Task<long> GetFileSizeAsync(string blobPath)
    {
        try
        {
            var fullPath = Path.Combine(_storagePath, blobPath);
            
            if (File.Exists(fullPath))
            {
                var fileInfo = new FileInfo(fullPath);
                return Task.FromResult(fileInfo.Length);
            }

            return Task.FromResult(0L);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting file size {BlobPath} from local storage", blobPath);
            return Task.FromResult(0L);
        }
    }
}
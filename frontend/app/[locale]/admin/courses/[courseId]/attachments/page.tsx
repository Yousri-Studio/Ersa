'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { adminApi, AttachmentDto } from '@/lib/admin-api';
import toast from 'react-hot-toast';
import { useHydration } from '@/hooks/useHydration';

export default function CourseAttachmentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const [attachments, setAttachments] = useState<AttachmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated && courseId) {
      fetchAttachments();
    }
  }, [isHydrated, courseId]);

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getCourseAttachments(courseId);
      setAttachments(response.data);
    } catch (error: any) {
      toast.error('Failed to load attachments');
      console.error('Error fetching attachments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    try {
      setIsUploading(true);
      await adminApi.uploadCourseAttachment(courseId, file);
      toast.success('Attachment uploaded successfully');
      fetchAttachments();
      // Reset file input
      event.target.value = '';
    } catch (error: any) {
      toast.error('Failed to upload attachment');
      console.error('Error uploading attachment:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await adminApi.deleteCourseAttachment(attachmentId);
      toast.success('Attachment deleted successfully');
      fetchAttachments();
    } catch (error: any) {
      toast.error('Failed to delete attachment');
      console.error('Error deleting attachment:', error);
    }
  };

  const getAttachmentTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return 'PDF';
      case 2:
        return 'Video';
      case 3:
        return 'Document';
      default:
        return 'Unknown';
    }
  };

  const getAttachmentTypeIcon = (type: number) => {
    switch (type) {
      case 1:
        return 'file-alt'; // PDF
      case 2:
        return 'video'; // Video
      case 3:
        return 'file'; // Document
      default:
        return 'file';
    }
  };
  
  const getAttachmentTypeColor = (type: number) => {
    switch (type) {
      case 1:
        return 'text-red-600';
      case 2:
        return 'text-blue-600';
      case 3:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <Icon name="arrow-left" className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Course Attachments</h1>
          <p className="text-gray-600 mt-1">Manage course materials and attachments</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Attachment</h2>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>
          {isUploading && (
            <div className="flex items-center text-blue-600">
              <Icon name="spinner" className="animate-spin mr-2" />
              Uploading...
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: PDF, DOC, DOCX, MP4, AVI, MOV. Maximum file size: 50MB
        </p>
      </div>

      {/* Attachments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Attachments ({attachments.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="file-alt" className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload your first attachment to get started. This course can have multiple attachments.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Icon 
                      name={getAttachmentTypeIcon(attachment.type)} 
                      className={getAttachmentTypeColor(attachment.type)}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        attachment.type === 1 ? 'bg-red-100 text-red-800' :
                        attachment.type === 2 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getAttachmentTypeLabel(attachment.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="ml-4 p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete attachment"
                >
                  <Icon name="trash" className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


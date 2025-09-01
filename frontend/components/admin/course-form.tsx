'use client';

import { useState } from 'react';
import { AdminCreateCourseRequest, AdminUpdateCourseRequest } from '@/lib/admin-api';
import { FileUpload } from '@/components/ui/file-upload';

interface CourseFormProps {
  initialData?: Partial<AdminCreateCourseRequest>;
  onSubmit: (data: AdminCreateCourseRequest | AdminUpdateCourseRequest) => void;
  onCancel: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

export function CourseForm({ initialData, onSubmit, onCancel, isEdit = false, isLoading = false }: CourseFormProps) {
  const [formData, setFormData] = useState<AdminCreateCourseRequest>({
    slug: initialData?.slug || '',
    titleAr: initialData?.titleAr || '',
    titleEn: initialData?.titleEn || '',
    summaryAr: initialData?.summaryAr || '',
    summaryEn: initialData?.summaryEn || '',
    descriptionAr: initialData?.descriptionAr || '',
    descriptionEn: initialData?.descriptionEn || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'SAR',
    type: initialData?.type || 1, // Live by default
    level: initialData?.level || 1, // Beginner by default
    category: initialData?.category || 1, // Programming by default
    videoUrl: initialData?.videoUrl || '',
    duration: initialData?.duration || '',
    instructorName: initialData?.instructorName || '',
    photo: initialData?.photo || [],
    tags: initialData?.tags || '',
    instructorsBioAr: initialData?.instructorsBioAr || '',
    instructorsBioEn: initialData?.instructorsBioEn || '',
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof AdminCreateCourseRequest, value: string | number | boolean | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File | null, data: number[]) => {
    handleChange('photo', data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
        
        {/* Slug */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="course-slug (URL-friendly identifier)"
            required
          />
        </div>

        {/* Title Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (English) *</label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => handleChange('titleEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter English title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic) *</label>
            <input
              type="text"
              value={formData.titleAr}
              onChange={(e) => handleChange('titleAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Arabic title"
              required
            />
          </div>
        </div>

        {/* Summary Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary (English)</label>
            <textarea
              rows={2}
              value={formData.summaryEn}
              onChange={(e) => handleChange('summaryEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief course summary (max 2000 characters)"
              maxLength={2000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary (Arabic)</label>
            <textarea
              rows={2}
              value={formData.summaryAr}
              onChange={(e) => handleChange('summaryAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief course summary (max 2000 characters)"
              maxLength={2000}
            />
          </div>
        </div>

        {/* Description Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
            <textarea
              rows={4}
              value={formData.descriptionEn}
              onChange={(e) => handleChange('descriptionEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed course description (max 5000 characters)"
              maxLength={5000}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Arabic)</label>
            <textarea
              rows={4}
              value={formData.descriptionAr}
              onChange={(e) => handleChange('descriptionAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed course description (max 5000 characters)"
              maxLength={5000}
            />
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Course Details</h4>
        
        {/* Price, Currency, Type */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={1}>Live</option>
              <option value={2}>PDF</option>
            </select>
          </div>
        </div>

        {/* Level, Category, Duration */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={formData.level}
              onChange={(e) => handleChange('level', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Beginner</option>
              <option value={2}>Intermediate</option>
              <option value={3}>Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Programming</option>
              <option value={2}>Business</option>
              <option value={3}>Design</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 4 weeks, 20 hours"
              maxLength={50}
            />
          </div>
        </div>

        {/* Instructor Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name *</label>
          <input
            type="text"
            value={formData.instructorName}
            onChange={(e) => handleChange('instructorName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter instructor name"
            required
            maxLength={255}
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => handleChange('videoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Course preview video URL (max 1000 characters)"
            maxLength={1000}
          />
        </div>
      </div>

      {/* Media & Content */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Media & Content</h4>
        
        {/* Photo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Photo</label>
          <FileUpload
            value={formData.photo}
            onChange={handleFileUpload}
            accept="image/*"
            maxSize={5}
            placeholder="Upload course image or drag and drop"
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <textarea
            rows={2}
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Comma-separated tags (max 2000 characters)"
            maxLength={2000}
          />
          <p className="text-xs text-gray-500 mt-1">{(formData.tags || '').length}/2000 characters</p>
        </div>

        {/* Instructor Bio Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Bio (English)</label>
            <textarea
              rows={4}
              value={formData.instructorsBioEn}
              onChange={(e) => handleChange('instructorsBioEn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Instructor biography (max 2500 characters)"
              maxLength={2500}
            />
            <p className="text-xs text-gray-500 mt-1">{(formData.instructorsBioEn || '').length}/2500 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Bio (Arabic)</label>
            <textarea
              rows={4}
              value={formData.instructorsBioAr}
              onChange={(e) => handleChange('instructorsBioAr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Instructor biography (max 2500 characters)"
              maxLength={2500}
            />
            <p className="text-xs text-gray-500 mt-1">{(formData.instructorsBioAr || '').length}/2500 characters</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Settings</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.isActive.toString()}
              onChange={(e) => handleChange('isActive', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <select
              value={formData.isFeatured?.toString() || 'false'}
              onChange={(e) => handleChange('isFeatured', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2 text-sm font-medium text-white rounded-md ${
            isEdit 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : (isEdit ? 'Update Course' : 'Add Course')}
        </button>
      </div>
    </form>
  );
}

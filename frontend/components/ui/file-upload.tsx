'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/icon';

interface FileUploadProps {
  value?: number[] | string;
  onChange: (file: File | null, data: number[]) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
}

export function FileUpload({ 
  value, 
  onChange, 
  accept = "image/*", 
  maxSize = 5, 
  className = "",
  placeholder = "Click to upload or drag and drop"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>('');
  
  // Initialize preview from value if it's a string (URL) or number array (byte data)
  useEffect(() => {
    if (typeof value === 'string' && value) {
      setPreview(value);
    } else if (Array.isArray(value) && value.length > 0) {
      // Convert number array to base64 data URL for preview
      try {
        const base64String = btoa(new Uint8Array(value).reduce((acc, byte) => acc + String.fromCharCode(byte), ''));
        setPreview(`data:image/jpeg;base64,${base64String}`);
      } catch (error) {
        console.error('Error converting photo data for preview:', error);
        setPreview('');
      }
    } else {
      setPreview('');
    }
  }, [value]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Convert to ArrayBuffer for binary storage
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    onChange(file, Array.from(uint8Array));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange(null, []);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-32 object-cover rounded-md border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <Icon name="times" className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <Icon name="cloud-upload-alt" className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">{placeholder}</p>
          <p className="text-xs text-gray-400 mt-1">Max size: {maxSize}MB</p>
        </div>
      )}
    </div>
  );
}

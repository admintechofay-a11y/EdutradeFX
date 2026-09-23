'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress?: number;
}

interface FileUploadDropzoneProps {
  files: UploadedFileItem[];
  onFilesChange: (files: UploadedFileItem[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

export default function FileUploadDropzone({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  disabled = false,
  className,
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateAndAddFiles = (selectedFiles: FileList | File[]) => {
    setErrorMessage(null);
    const newFiles: UploadedFileItem[] = [];

    if (files.length + selectedFiles.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} files.`);
      return;
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate MIME type
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(
          `File "${file.name}" has an unsupported format. Allowed formats: PDF, PNG, JPG, WEBP.`
        );
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" exceeds the maximum allowed size of ${maxSizeMB}MB.`
        );
        return;
      }

      newFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 100,
      });
    }

    onFilesChange([...files, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('flex flex-col gap-3 text-left', className)}>
      {/* Dropzone Container: border: 2px dashed #CBD5E0, bg: #F8FAFC, border-radius: --radius-lg, hover: border-color --color-gold-primary, bg rgba(201,168,76,0.04) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#CBD5E0] bg-[#F8FAFC] p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-gold-primary bg-gold-primary/[0.06]'
            : 'hover:border-gold-primary hover:bg-gold-primary/[0.04]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-gold-primary shadow-sm mb-1">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="font-sans text-[15px] font-semibold text-text-primary">
          Drag files here or click to browse
        </p>

        {/* Accepted formats listed below in --color-text-secondary Inter 12px */}
        <p className="font-sans text-[12px] text-text-secondary">
          Accepted formats: PDF, PNG, JPG, WEBP (Max {maxSizeMB}MB per file, up to {maxFiles} files)
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-2.5 font-sans text-[12px] text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Attached Files List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <span className="font-sans text-[12px] font-semibold text-text-secondary">
            Attached Files ({files.length}/{maxFiles}):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((item) => {
              const isPdf = item.type === 'application/pdf';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-[#E2E8F0] bg-white p-2.5 font-sans text-[13px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="rounded-sm bg-off-white p-1.5 text-gold-primary shrink-0 border border-slate-200">
                      {isPdf ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-semibold text-text-primary">
                        {item.name}
                      </span>
                      <span className="font-sans text-[11px] text-text-secondary">
                        {formatFileSize(item.size)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="text-text-secondary hover:text-danger p-1 rounded-sm transition-colors"
                    aria-label={`Remove file ${item.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

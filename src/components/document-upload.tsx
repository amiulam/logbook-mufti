"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FileText, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_DOC_TYPES } from "@/lib/constant";

type DocumentUploadProps = {
  onDocumentChange: (file: File | null) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  required?: boolean;
  error?: string;
  className?: string;
};

export default function DocumentUpload({
  onDocumentChange,
  maxSize = 5,
  error,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
      alert(
        `File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ODT, ODS, ODP, RTF, ZIP`
      );
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onDocumentChange(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    onDocumentChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="size-4" />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <FileText className="size-4" />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return <FileText className="size-4" />;
    if (fileType.includes("powerpoint") || fileType.includes("presentation"))
      return <FileText className="size-4" />;
    if (fileType.includes("text") || fileType.includes("csv"))
      return <FileText className="size-4" />;
    if (fileType.includes("zip")) return <File className="size-4" />;
    return <FileText className="size-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          error && "border-red-500"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div className="space-y-2">
            <Upload className="mx-auto size-8 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                Drag and drop your document here, or{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT,
                CSV, ODT, ODS, ODP, RTF, ZIP (Max {maxSize}MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile.type)}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <Input
        ref={fileInputRef}
        id="document-upload"
        type="file"
        accept={ACCEPTED_DOC_TYPES.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />
    </>
  );
}

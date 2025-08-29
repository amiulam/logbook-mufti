"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ImageFile = {
  file: File;
  id: string;
  preview: string;
};

type ImageUploadProps = {
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  className?: string;
  required?: boolean;
  error?: string;
};

export default function ImageUpload({
  onImagesChange,
  maxImages = 5,
  className,
  required = false,
  error,
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagesChange = useCallback(
    (newImages: ImageFile[]) => {
      setImages(newImages);
      onImagesChange(newImages.map((img) => img.file));
    },
    [onImagesChange]
  );

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const newImages: ImageFile[] = [];

      Array.from(files).forEach((file) => {
        if (
          file.type.startsWith("image/") &&
          images.length + newImages.length < maxImages
        ) {
          const id = Math.random().toString(36).substr(2, 9);
          const preview = URL.createObjectURL(file);
          newImages.push({ file, id, preview });
        }
      });

      if (newImages.length > 0) {
        handleImagesChange([...images, ...newImages]);
      }
    },
    [images, maxImages, handleImagesChange]
  );

  const removeImage = useCallback(
    (id: string) => {
      const imageToRemove = images.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      const newImages = images.filter((img) => img.id !== id);
      handleImagesChange(newImages);
    },
    [images, handleImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        addImages(e.dataTransfer.files);
      }
    },
    [addImages]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.target.files) {
        addImages(e.target.files);
      }
    },
    [addImages]
  );

  const handleUploadClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-colors relative",
          {
            "border-primary bg-primary/5": isDragOver,
            "border-red-500 bg-red-50": error,
          }
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload
            className={cn("size-8 text-muted-foreground", {
              "text-red-500": error,
            })}
          />
          <div
            className={cn("text-sm text-muted-foreground", {
              "text-red-600": error,
            })}
          >
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </div>
          <div className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to 5MB each
          </div>
          <div className="text-xs text-muted-foreground">
            Max {maxImages} images
          </div>
          {required && (
            <div className="text-xs text-red-500 font-medium">
              * Field ini wajib diisi
            </div>
          )}
        </div>

        {/* File input untuk drag & drop area */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={images.length >= maxImages}
        />
      </Card>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <Card className="overflow-hidden">
                <Image
                  src={image.preview}
                  alt={image.file.name}
                  height={500}
                  width={500}
                  className="size-40 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {image.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </Card>

              {/* Remove Button */}
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(image.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          type="button"
          onClick={handleUploadClick}
          disabled={images.length >= maxImages}
          className="relative"
        >
          <ImageIcon className="size-4 mr-2" />
          {images.length >= maxImages
            ? "Max images reached"
            : "Add More Images"}
        </Button>
      </div>
    </div>
  );
}

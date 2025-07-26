import React, { useState, useCallback, useEffect, useRef } from "react";
import { FiImage, FiUpload, FiTrash2, FiX } from "react-icons/fi";

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const useImageUpload = ({ onUpload } = {}) => {
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState(null);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file && file instanceof File) {
        setFileName(file.name);
        // Clean up previous URL
        if (previewRef.current) {
          URL.revokeObjectURL(previewRef.current);
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        previewRef.current = url;
        onUpload?.(url);
      }
    },
    [onUpload],
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
};

const ImageUploadComponent = ({ onFileChange, currentFile, existingImageUrl }) => {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    onUpload: (url) => {
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        onFileChange({ target: { files: [file] } });
      }
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [currentFilePreview, setCurrentFilePreview] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const fakeEvent = {
          target: {
            files: [file],
          },
        };
        handleFileChange(fakeEvent);
        onFileChange(fakeEvent);
      }
    },
    [handleFileChange, onFileChange],
  );

  // Handle currentFile preview
  useEffect(() => {
    if (currentFile && currentFile instanceof File && !previewUrl) {
      try {
        const url = URL.createObjectURL(currentFile);
        setCurrentFilePreview(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error creating object URL:", error);
        setCurrentFilePreview(null);
      }
    } else if (!currentFile) {
      if (currentFilePreview) {
        URL.revokeObjectURL(currentFilePreview);
        setCurrentFilePreview(null);
      }
    }
  }, [currentFile, previewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentFilePreview) {
        URL.revokeObjectURL(currentFilePreview);
      }
    };
  }, [currentFilePreview]);

  const internalHandleFileChange = (e) => {
    handleFileChange(e);
    onFileChange(e);
  };

  const internalHandleRemove = () => {
    handleRemove();
    if (currentFilePreview) {
      URL.revokeObjectURL(currentFilePreview);
      setCurrentFilePreview(null);
    }
    // Reset the parent's currentFile
    onFileChange({ target: { files: [] } });
  };

  // Show existing image, preview, or current file preview
  const displayImageUrl = previewUrl || currentFilePreview || existingImageUrl;

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={internalHandleFileChange}
      />

      {!displayImageUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100",
            isDragging && "border-primary-scale-400 bg-yellow-50",
          )}
        >
          <div className="rounded-full bg-white p-3 shadow-sm">
            <FiImage className="h-6 w-6 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Click to select</p>
            <p className="text-xs text-gray-500">
              or drag and drop file here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WebP up to 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="group relative h-64 overflow-hidden rounded-lg border border-gray-200">
            <img
              src={displayImageUrl}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                console.error("Image load error:", e);
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={handleThumbnailClick}
                className="h-9 w-9 p-0 bg-white text-gray-700 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <FiUpload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={internalHandleRemove}
                className="h-9 w-9 p-0 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {fileName && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">{fileName}</span>
              <button
                onClick={internalHandleRemove}
                className="ml-auto rounded-full p-1 hover:bg-gray-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
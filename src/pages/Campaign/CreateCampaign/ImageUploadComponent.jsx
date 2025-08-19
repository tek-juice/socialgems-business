import React, { useState, useCallback, useEffect, useRef } from "react";
import { FiImage, FiUpload, FiTrash2, FiX, FiCrop, FiCheck } from "react-icons/fi";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

const ImageCropModal = ({ isOpen, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const imgRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    // Set aspect ratio to 1080:720 = 1.5
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1.5, // 1080/720 aspect ratio
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = useCallback(async (image, crop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas to exact 1080x720 dimensions
    canvas.width = 1080;
    canvas.height = 720;

    ctx.imageSmoothingQuality = 'high';

    // Calculate the source dimensions
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      1080,
      720
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve({ blob, url: croppedImageUrl });
        },
        'image/jpeg',
        0.95
      );
    });
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (completedCrop && imgRef.current) {
      try {
        const { blob, url } = await getCroppedImg(imgRef.current, completedCrop);
        onCropComplete(url, blob);
        onClose();
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  }, [completedCrop, getCroppedImg, onCropComplete, onClose]);

  if (!isOpen) return null;

  // Mobile Drawer
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-50 w-full bg-white rounded-t-xl max-h-[90vh] flex flex-col border-t border-gray-200">
          {/* Mobile Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-scale-400 rounded-lg flex items-center justify-center">
                  <FiCrop className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
                  <p className="text-xs text-gray-600">Adjust to 1080x720 format</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <FiImage className="w-3 h-3" />
                <span>Output: 1080 × 720 pixels</span>
              </div>
              <p className="text-xs text-gray-500">
                Drag corners to adjust crop area
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <div className="max-w-full overflow-hidden rounded-lg border border-gray-300">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1.5} // 1080/720 = 1.5
                  className="max-w-full h-auto"
                >
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="max-w-full h-auto block"
                    style={{ maxHeight: '300px' }}
                  />
                </ReactCrop>
              </div>
            </div>

            {completedCrop && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <FiCheck className="w-3 h-3" />
                  <span>
                    Ready to crop: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} 
                    → 1080 × 720
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop}
                className="flex-1 px-4 py-3 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <FiCheck className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Desktop Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-scale-400 rounded-lg flex items-center justify-center">
              <FiCrop className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
              <p className="text-xs text-gray-600">Adjust your image to 1080x720 format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Desktop Content */}
        <div className="p-6 bg-white overflow-auto max-h-[calc(90vh-140px)]">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <FiImage className="w-4 h-4" />
              <span>Output Resolution: 1080 × 720 pixels (HD Format)</span>
            </div>
            <p className="text-xs text-gray-500">
              Drag the corners to adjust the crop area. The final image will be optimized for screen display.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="max-w-full max-h-96 overflow-hidden rounded-lg border border-gray-300">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1.5} // 1080/720 = 1.5
                className="max-w-full h-auto"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full h-auto block"
                  style={{ maxHeight: '400px' }}
                />
              </ReactCrop>
            </div>
          </div>

          {completedCrop && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <FiCheck className="w-4 h-4" />
                <span>
                  Crop area selected: {Math.round(completedCrop.width)} × {Math.round(completedCrop.height)} 
                  → will be resized to 1080 × 720
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-scale-400 rounded-full"></div>
              <span>Perfect for social media posts and digital displays</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              disabled={!completedCrop}
              className="px-6 py-2 bg-primary-scale-400 text-black rounded-lg hover:bg-primary-scale-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium flex items-center gap-2 shadow-sm"
            >
              <FiCheck className="w-4 h-4" />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);

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
        showCropModal(file);
      }
    },
    [],
  );

  const showCropModal = (file) => {
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = (croppedUrl, croppedBlob) => {
    setCroppedImageUrl(croppedUrl);
    
    // Create a new File object from the cropped blob with proper naming
    const timestamp = new Date().getTime();
    const croppedFile = new File([croppedBlob], `cropped-image-${timestamp}.jpg`, {
      type: 'image/jpeg',
    });
    
    // Update parent with cropped file
    onFileChange({ target: { files: [croppedFile] } });
  };

  const closeCropModal = () => {
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc(null);
    setIsCropModalOpen(false);
  };

  // Handle currentFile preview
  useEffect(() => {
    if (currentFile && currentFile instanceof File && !previewUrl && !croppedImageUrl) {
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
  }, [currentFile, previewUrl, croppedImageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentFilePreview) {
        URL.revokeObjectURL(currentFilePreview);
      }
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl);
      }
    };
  }, [currentFilePreview, croppedImageUrl]);

  const internalHandleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      showCropModal(file);
    }
  };

  const internalHandleRemove = () => {
    handleRemove();
    if (currentFilePreview) {
      URL.revokeObjectURL(currentFilePreview);
      setCurrentFilePreview(null);
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
      setCroppedImageUrl(null);
    }
    // Reset the parent's currentFile
    onFileChange({ target: { files: [] } });
  };

  // Show existing image, cropped image, preview, or current file preview
  const displayImageUrl = croppedImageUrl || previewUrl || currentFilePreview || existingImageUrl;

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
            <p className="text-sm font-medium text-gray-700">Click to select image</p>
            <p className="text-xs text-gray-500">
              or drag and drop file here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WebP up to 5MB
            </p>
            <p className="text-xs text-primary-scale-600 mt-1 font-medium">
              Please Upload: 1080×720 format
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="group relative h-64 overflow-hidden rounded-lg border border-gray-200">
            <img
              src={displayImageUrl}
              alt="Campaign preview"
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
                className="h-10 w-10 bg-white text-gray-700 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
                title="Upload new image"
              >
                <FiUpload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={internalHandleRemove}
                className="h-10 w-10 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center transition-colors shadow-sm"
                title="Remove image"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Image info */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>1080×720 HD Format</span>
            </div>
            {fileName && (
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[200px]">{fileName}</span>
                <button
                  onClick={internalHandleRemove}
                  className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                  title="Remove image"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={closeCropModal}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};

export default ImageUploadComponent;
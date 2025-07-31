import { useRef } from 'react';
import { FiUpload, FiCamera, FiX, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';

const ImageUpload = ({ label, currentImage, onImageSelect, onImageRemove, loading }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size cannot exceed 5MB');
        return;
      }
      
      onImageSelect(file);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-secondary mb-2">
        {label}
      </label>
      
      <div className="relative">
        <div 
          className="w-full h-32 bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
          onClick={handleFileSelect}
        >
          {currentImage ? (
            <div className="relative w-full h-full">
              <img 
                src={typeof currentImage === 'string' ? currentImage : URL.createObjectURL(currentImage)}
                alt={label}
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <FiCamera className="w-6 h-6 text-white" />
              </div>
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <FiLoader className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <FiUpload className="w-8 h-8 text-primary/60 mx-auto mb-2" />
              <p className="text-xs text-secondary/60">Click to upload {label.toLowerCase()}</p>
              <p className="text-xs text-secondary/40 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>

        {currentImage && !loading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onImageRemove();
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <FiX className="w-3 h-3" />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
};

export default ImageUpload;
import { FiFile, FiX } from 'react-icons/fi';

const UploadProgress = ({ fileName, progress, onCancel }) => {
  return (
    <div className="px-4 py-2 border-t border-primary/10 bg-primary/5">
      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-primary/20">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center relative">
          <FiFile className="w-5 h-5 text-secondary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary/30"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                className="text-primary transition-all duration-300"
              />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate text-secondary">{fileName}</p>
          <p className="text-xs text-secondary/60">Uploading... {progress}%</p>
        </div>
        
        <button
          onClick={onCancel}
          className="p-1 hover:bg-secondary/10 rounded-full transition-colors"
        >
          <FiX className="w-4 h-4 text-secondary" />
        </button>
      </div>
    </div>
  );
};

export default UploadProgress;
import { FiX } from 'react-icons/fi';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "md" }) => {
  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl w-full ${widthClasses[maxWidth]} shadow-2xl max-h-[90vh] overflow-hidden animate-scale-in`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-110"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
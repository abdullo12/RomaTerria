import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isDarkMode?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, isDarkMode = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      <div className={`relative rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 hover:opacity-70 text-3xl font-bold z-10 transition-opacity ${
            isDarkMode ? 'text-gray-300' : 'text-gray-500'
          }`}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

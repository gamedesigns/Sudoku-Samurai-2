import React from 'react';
import { X } from 'lucide-react';
import { Theme } from '../types';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  theme: Theme;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, title, children, theme }) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className={`${theme.modal} rounded-2xl shadow-xl max-w-sm w-full border-2 p-6 animate-fade-in-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${theme.text}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${theme.button}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className={theme.text}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Modal;
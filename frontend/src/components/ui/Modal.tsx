import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-dark-700 border border-dark-500 rounded-2xl p-6 w-full max-w-md mx-4 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-dark-600 flex items-center justify-center text-gray-500 hover:text-white hover:bg-dark-500 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
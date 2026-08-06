import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Yes, Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        {/* Animated top rainbow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-t-3xl" />

        {/* Top Icon Badge */}
        <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center mt-2 ${
          variant === 'danger' 
            ? 'bg-red-50 dark:bg-red-950/40 text-red-500' 
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
        }`}>
          {variant === 'danger' ? <LogOut className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl py-5 font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-5 font-bold text-white shadow-lg transition-all ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

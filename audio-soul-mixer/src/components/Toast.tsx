import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgColor} border rounded-lg shadow-lg p-4`}
        >
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${iconColor}`}>
              {icon}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${textColor}`}>
                {message}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast; 
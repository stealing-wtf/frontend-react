import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Copy, ExternalLink } from 'lucide-react';

interface CustomNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  shareUrl?: string;
  type?: 'success' | 'error' | 'info';
}

const CustomNotification: React.FC<CustomNotificationProps> = ({
  isVisible,
  onClose,
  title,
  message,
  shareUrl,
  type = 'success'
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const copyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const openInNewTab = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <X className="w-6 h-6 text-red-400" />;
      default:
        return <CheckCircle className="w-6 h-6 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-green-400/40 shadow-green-500/20';
      case 'error':
        return 'border-red-400/40 shadow-red-500/20';
      default:
        return 'border-blue-400/40 shadow-blue-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-50 max-w-md w-full"
        >
          <div className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl ${getColorClasses()}`}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="flex items-start space-x-3">
              {getIcon()}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm">{title}</h3>
                <p className="text-white/70 text-sm mt-1">{message}</p>
                
                {shareUrl && (
                  <div className="mt-3 space-y-2">
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                      <p className="text-white/80 text-xs font-mono truncate">{shareUrl}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-accent/30 hover:bg-accent/40 backdrop-blur-sm text-accent text-xs rounded-lg transition-all duration-200 border border-accent/20"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copia URL</span>
                      </button>
                      
                      <button
                        onClick={openInNewTab}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs rounded-lg transition-all duration-200 border border-white/20"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Apri</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomNotification;
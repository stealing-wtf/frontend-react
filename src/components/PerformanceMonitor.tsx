import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { usePerformanceMonitor } from '../hooks/useOptimizedAnimation';

const PerformanceMonitor: React.FC = () => {
  const { fps, isLowPerformance } = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-black/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
      </motion.button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl min-w-[200px]"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} />
              <span className="font-semibold">Performance</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>FPS:</span>
                <span className={fps < 30 ? 'text-error-light' : fps < 50 ? 'text-warning-light' : 'text-success-light'}>
                  {fps}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={isLowPerformance ? 'text-error-light' : 'text-success-light'}>
                  {isLowPerformance ? 'Low' : 'Good'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className="text-accent">
                  {(performance as any).memory ? 
                    `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 
                    'N/A'
                  }
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className="text-silver">
                  {(navigator as any).connection?.effectiveType || 'Unknown'}
                </span>
              </div>
            </div>
            
            {isLowPerformance && (
              <div className="mt-3 p-2 bg-error/20 border border-error/30 rounded text-xs">
                <strong>Performance Warning:</strong> Animations may be reduced for better performance.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PerformanceMonitor;
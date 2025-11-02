import React from 'react';
import { motion } from 'framer-motion';
import { useLazyImage } from '../hooks/useOptimizedAnimation';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  style?: React.CSSProperties;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  width,
  height,
  objectFit = 'cover',
  style
}) => {
  const { ref, imageSrc, isLoaded, isError } = useLazyImage(src, placeholder);

  if (isError) {
    return (
      <div 
        ref={ref}
        className={`bg-muted flex items-center justify-center ${className}`}
        style={style}
      >
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-muted via-secondary to-muted animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Actual Image */}
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-${objectFit} transition-opacity duration-300`}
          style={{ 
            width, 
            height,
            opacity: isLoaded ? 1 : 0
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;
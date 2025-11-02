import { type Variants } from 'framer-motion';

// Reduced motion variants for accessibility
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Common animation variants
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: reduceMotion ? 0 : 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: reduceMotion ? 0.1 : 0.6,
      ease: "easeOut"
    }
  }
};

export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: reduceMotion ? 0.1 : 0.6,
      ease: "easeOut"
    }
  }
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: reduceMotion ? 1 : 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: reduceMotion ? 0.1 : 0.6,
      ease: "easeOut"
    }
  }
};

export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: reduceMotion ? 0 : -30 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: reduceMotion ? 0.1 : 0.6,
      ease: "easeOut"
    }
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: reduceMotion ? 0 : 30 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: reduceMotion ? 0.1 : 0.6,
      ease: "easeOut"
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: reduceMotion ? 0 : 0.1,
      delayChildren: reduceMotion ? 0 : 0.2
    }
  }
};

// Hover animations
export const hoverScale = {
  scale: reduceMotion ? 1 : 1.05,
  transition: { duration: 0.2 }
};

export const hoverLift = {
  y: reduceMotion ? 0 : -2,
  transition: { duration: 0.2 }
};

// Loading animation
export const pulse: Variants = {
  pulse: {
    scale: reduceMotion ? 1 : [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
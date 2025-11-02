import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  animate = true,
  hover = true,
}) => {
  const baseClasses = 'bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl';
  const classes = `${baseClasses} ${className}`;

  if (!animate) {
    return <div className={classes}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={hover ? { y: -5 } : undefined}
      className={classes}
    >
      {children}
    </motion.div>
  );
};

export default Card;
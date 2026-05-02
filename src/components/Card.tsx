import { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'purple' | 'green' | 'pink' | 'none';
}

export function Card({ children, className, glow = 'none' }: CardProps) {
  const glowClass = {
    purple: 'glow-purple',
    green: 'glow-green',
    pink: 'glow-pink',
    none: ''
  }[glow];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-6 shadow-2xl relative overflow-hidden",
        glowClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
}

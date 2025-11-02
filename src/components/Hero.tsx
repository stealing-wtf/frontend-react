import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Shield, Zap } from 'lucide-react';
import { useOptimizedAnimation, usePerformanceMonitor } from '../hooks/useOptimizedAnimation';
import { useResponsive } from '../hooks/useResponsive';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const { ref: heroRef, isVisible } = useOptimizedAnimation({ threshold: 0.2 });
  const { isLowPerformance } = usePerformanceMonitor();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-0"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      
      {/* Animated background elements - Reduced on low performance devices */}
      {!isLowPerformance && (
        <div className="absolute inset-0 opacity-30 gpu-accelerated">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
            animate={isVisible ? {
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            } : {}}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-silver/5 rounded-full blur-3xl"
            animate={isVisible ? {
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            } : {}}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      )}

      <div className="container-custom relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-none">
              <span className="text-white">blackfile</span>
              <span className="gradient-text">.xyz</span>
            </h1>
          </motion.div>

          {/* Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-2xl md:text-4xl lg:text-5xl text-white mb-6 font-light">
              The future of file sharing
            </p>
          </motion.div>

          {/* Supporting text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience lightning-fast uploads, military-grade security, and seamless collaboration. 
              Built for creators, professionals, and teams who demand excellence.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.button
              className="btn-primary group flex items-center gap-3 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
            >
              <Upload className="w-5 h-5" />
              Start Sharing
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            
            <motion.button
              className="btn-secondary text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { icon: Zap, text: "Lightning Fast" },
              { icon: Shield, text: "Ultra Secure" },
              { icon: Upload, text: "Easy Upload" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center gap-3 text-white/60"
                whileHover={{ scale: 1.05, color: "rgb(255 255 255)" }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-5 h-5" />
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - Hidden on mobile */}
      {!isMobile && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
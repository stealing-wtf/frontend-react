import { motion } from 'framer-motion';
import { 
  Upload, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Lock,
  Download,
  BarChart3,
  Smartphone
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Upload,
      title: "Instant Upload",
      description: "Drag, drop, and share in seconds. Our advanced compression ensures lightning-fast uploads without quality loss.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "End-to-end encryption with zero-knowledge architecture. Your files are protected with bank-level security.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: Zap,
      title: "Lightning Performance",
      description: "Global CDN network ensures instant access worldwide. Experience the fastest file sharing platform ever built.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time collaboration tools with advanced permissions. Work together seamlessly across any device.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access your files from anywhere in the world. Our distributed infrastructure ensures 99.99% uptime.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Zero data collection, no tracking, complete privacy. Your files belong to you and only you.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: Download,
      title: "Smart Downloads",
      description: "Intelligent download optimization with resume capability. Never lose progress on large file transfers.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed insights into your sharing patterns. Track engagement and optimize your workflow.",
      gradient: "from-accent/60 to-silver/60"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Native mobile experience with offline sync. Share and access files on any device, anywhere.",
      gradient: "from-accent/60 to-silver/60"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      <div className="container-custom relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Everything you need to share, collaborate, and manage your files with confidence
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <motion.div
                className="glass-card p-8 h-full relative overflow-hidden"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 relative z-10`}
                  whileHover={{ 
                    rotate: 5,
                    scale: 1.1,
                    transition: { duration: 0.2 }
                  }}
                >
                  <feature.icon className="w-full h-full text-white" />
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-center mt-20"
        >
          <motion.button
            className="btn-primary text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Features
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
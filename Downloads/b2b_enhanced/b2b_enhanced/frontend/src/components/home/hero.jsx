 import { motion } from 'motion/react';
import { CheckCircle, ArrowRight, TrendingUp, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router'; 

export function Hero() {
  const navigate = useNavigate();

  const stats = [
    { value: '90%+', label: 'RFQ-to-Quote' },
    { value: '5x', label: 'Conversion vs Marketplaces' },
    { value: '100+', label: 'Verified Factories' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-2">

      <button onClick={() => navigate('/login')} className="absolute z-50 top-5 right-5 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
        get started
      </button>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* India Map Overlay */}
      <div className="absolute right-0 top-1/4 w-1/3 h-1/2 opacity-[0.03]">
        <svg viewBox="0 0 200 300" className="w-full h-full">
          <path
            d="M 100 50 L 120 70 L 140 60 L 160 80 L 150 110 L 160 140 L 140 170 L 130 200 L 110 230 L 90 210 L 70 200 L 60 170 L 50 140 L 60 110 L 70 80 L 90 60 Z"
            className="fill-primary"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-success/10 rounded-full mb-8"
          >
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-success font-medium">Trusted by 100+ Export Manufacturers</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-text mb-6 leading-tight">
            Controlled Sourcing for<br />
            <span className="text-primary">Engineering Excellence</span>
          </h1>

          <p className="text-xl md:text-2xl text-text-muted mb-4 max-w-4xl mx-auto leading-relaxed">
            Verified Buyers, Matched Suppliers, Zero Noise.
          </p>

          <p className="text-lg md:text-xl text-text-muted/70 mb-10 max-w-3xl mx-auto">
            Post verified RFQs. Unlock premium leads. Convert faster.
          </p>

          {/* CTAs
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => navigate('/buyer-dashboard')}
              className="group px-8 py-4 bg-background text-primary border-2 border-primary rounded-lg
            font-semibold text-lg hover:bg-primary hover:text-white transition-all duration-300
            hover:scale-105 shadow-lg hover:shadow-primary/20 flex items-center space-x-2
            w-full sm:w-auto justify-center"
            >
              <span>Preview Buyer Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/supplier-dashboard')}
              className="group px-8 py-4 bg-success hover:bg-success/90 text-white rounded-lg
            font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg
            hover:shadow-success/20 flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>Preview Supplier Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div> */}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-lg
              hover:shadow-xl transition-shadow duration-300 border border-border"
              >
                <div className="flex items-center justify-center mb-2">
                  {index === 0 && <TrendingUp className="w-6 h-6 text-text-muted mr-2" />}
                  {index === 1 && <Zap className="w-6 h-6 text-text-muted mr-2" />}
                  {index === 2 && <Users className="w-6 h-6 text-text-muted mr-2" />}
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                </div>
                <div className="text-text-muted font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-5 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
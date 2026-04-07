import { motion } from 'motion/react';
import { XCircle, CheckCircle2, Mail, TrendingDown, Target, Award, Settings } from 'lucide-react';

export function Problem() {
  const chaos = [
    { icon: Mail, label: 'Flood of Unqualified Leads', color: 'text-red-500' },
    { icon: TrendingDown, label: 'Low Conversion Rates', color: 'text-red-500' },
    { icon: XCircle, label: 'No Verification Process', color: 'text-red-500' },
  ];

  const control = [
    { icon: CheckCircle2, label: 'Verified Buyers Only', color: 'text-[#10B981]' },
    { icon: Target, label: 'AI-Matched Capabilities', color: 'text-[#10B981]' },
    { icon: Award, label: 'Quality Score (SQI)', color: 'text-[#10B981]' },
  ];

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            From <span className="text-danger">Chaos</span> to <span className="text-success">Control</span>
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Traditional marketplaces create noise. ControlSource delivers precision.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Chaos Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-danger-soft rounded-2xl p-8 md:p-12 border-2 border-danger/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-danger/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <XCircle className="w-8 h-8 text-danger" />
                <h3 className="text-2xl font-bold text-text">Open Marketplaces</h3>
              </div>
              <div className="space-y-6">
                {chaos.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-4 bg-background/80 p-4 rounded-lg"
                  >
                    <item.icon className={`w-6 h-6 ${item.color} shrink-0 mt-1`} />
                    <div>
                      <p className="font-semibold text-text">{item.label}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {index === 0 && 'Wasting time on tire-kickers and non-serious buyers'}
                        {index === 1 && 'Less than 10% RFQ-to-order conversion'}
                        {index === 2 && 'Anyone can post, no quality control'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Control Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-success-soft rounded-2xl p-8 md:p-12 border-2 border-success/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-8 h-8 text-success" />
                <h3 className="text-2xl font-bold text-text">ControlSource</h3>
              </div>
              <div className="space-y-6">
                {control.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-4 bg-background/80 p-4 rounded-lg shadow-sm"
                  >
                    <item.icon className={`w-6 h-6 ${item.color} shrink-0 mt-1`} />
                    <div>
                      <p className="font-semibold text-text">{item.label}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {index === 0 && 'Business validation required - GST, export docs verified'}
                        {index === 1 && '90%+ success rate with smart matching algorithms'}
                        {index === 2 && 'Transparent supplier scoring based on capabilities'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import { Upload, Settings, Lock, MessageSquare, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload RFQ + Docs',
      subtitle: 'Instant Validation',
      description: 'Buyers upload technical drawings, specs, quantities, and timeline. Our system instantly validates requirements.',
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-primary/10',
      iconColor: 'text-text',
    },
    {
      number: '02',
      icon: Settings,
      title: 'AI + Admin Match',
      subtitle: 'Capability Scoring',
      description: 'Smart algorithms match your RFQ with suppliers who have proven capabilities, machines, and certifications (SQI Score).',
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-primary/10',
      iconColor: 'text-text',
    },
    {
      number: '03',
      icon: Lock,
      title: 'Unlock & Negotiate',
      subtitle: 'Seamless Communication',
      description: 'Suppliers pay to unlock leads, ensuring serious intent. Built-in chat for fast, transparent negotiations.',
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-primary/10',
      iconColor: 'text-text',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-surface relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-success/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Simple 3-Step Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            How <span className="text-primary">ControlSource</span> Works
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            From RFQ submission to successful deal closure - streamlined, verified, efficient.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-32 left-0 right-0 h-1 bg-linear-to-r from-primary/30 via-secondary/30 to-success/30 opacity-30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border h-full relative overflow-hidden"
              >
                {/* Step Number Background */}
                <div className="absolute top-0 right-0 text-8xl font-bold text-surface-2 -mr-4 -mt-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`relative z-10 w-16 h-16 ${step.iconBg} rounded-xl flex items-center justify-center mb-6 transform transition-transform duration-300 hover:rotate-6`}>
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-text mb-1">{step.title}</h3>
                    <p className="text-sm font-semibold text-text-muted">{step.subtitle}</p>
                  </div>
                  <p className="text-text-muted leading-relaxed">{step.description}</p>
                </div>

                <div className={`absolute inset-0 bg-linear-to-br ${step.color} opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
              </motion.div>

              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <MessageSquare className="w-6 h-6 text-success rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 bg-background rounded-2xl p-8 shadow-lg border border-border">
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-text mb-2">Ready to experience controlled sourcing?</h3>
              <p className="text-text-muted">Join hundreds of verified buyers and suppliers today.</p>
            </div>
            <button className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20 whitespace-nowrap">
              Get Started →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import { Check, Zap, Star, Crown } from 'lucide-react';

export function Pricing() {
  const tiers = [
    {
      name: 'Basic',
      price: '₹500',
      description: 'Perfect for testing the platform',
      icon: Zap,
      color: '',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      features: [
        'Unlock 1 lead per purchase',
        'Basic RFQ details',
        'Standard matching',
        'Email support',
        'Valid for 7 days',
      ],
      cta: 'Start with Basic',
      popular: false,
    },
    {
      name: 'Premium',
      price: '₹2,000',
      description: 'Best value for serious suppliers',
      icon: Star,
      color: '',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      features: [
        'Exclusive lead access',
        'Full technical specifications',
        'AI-powered capability matching',
        'Priority support & chat',
        'Valid for 30 days',
        'Early access to high-value RFQs',
      ],
      cta: 'Go Premium',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large-scale suppliers',
      icon: Crown,
      color: '',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      features: [
        'Unlimited lead access',
        'Dedicated account manager',
        'Custom matching algorithms',
        '24/7 priority support',
        'API integration',
        'White-label options',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-success/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-success/10 rounded-full mb-6">
            <Check className="w-5 h-5 text-success" />
            <span className="text-success font-semibold">Pay Per Unlock - No Subscriptions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Only pay for leads you unlock. No hidden fees, no monthly subscriptions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg shadow-primary/20">
                    Most Popular
                  </span>
                </div>
              )}
              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`bg-background rounded-2xl overflow-hidden shadow-lg border-2 ${tier.popular ? 'border-primary' : 'border-border'
                  } hover:shadow-2xl transition-all h-full`}
              >
                {/* Header */}
                <div className={`bg-linear-to-br ${tier.color} text-text p-8`}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                    <tier.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-sm opacity-90 mb-4">{tier.description}</p>
                  <div className="flex items-baseline space-x-2 text-primary">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    {tier.price !== 'Custom' && <span className="text-sm opacity-75 font-semibold">per unlock</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Check className={`w-5 h-5 ${tier.iconColor} shrink-0 mt-0.5`} />
                        <span className="text-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl ${tier.popular
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                        : 'bg-surface-2 text-text hover:bg-border'
                      }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-surface-2/10 rounded-2xl p-8 max-w-4xl mx-auto border border-primary/20"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-text mb-4">For Buyers: Always Free</h3>
            <p className="text-text-muted mb-6 text-lg">
              Buyers post RFQs at zero cost. Get verified quotes from quality suppliers. No subscription, no fees.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">$0</div>
                <div className="text-sm text-text-muted">RFQ Posting</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">$0</div>
                <div className="text-sm text-text-muted">Quote Review</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">$0</div>
                <div className="text-sm text-text-muted">Communication</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-text-muted">
            Have questions?{' '}
            <a href="#footer" className="text-primary font-semibold hover:text-primary-hover hover:underline">
              Contact our team
            </a>{' '}
            or read our{' '}
            <a href="#" className="text-primary font-semibold hover:text-primary-hover hover:underline">
              pricing FAQ
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'motion/react';
import { Shield, Award, Users, Quote } from 'lucide-react';

export function Trust() {
  const testimonials = [
    {
      name: 'Michael Chen',
      role: 'Procurement Manager',
      company: 'TechParts USA',
      text: 'ControlSource eliminated 90% of the noise. We only talk to verified, capable suppliers now. Our RFQ-to-PO cycle dropped from 6 weeks to 2.',
      avatar: 'MC',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Director',
      company: 'Precision Machining Ltd',
      text: 'Finally, a platform that respects our time. Every lead we unlock is real, with actual budgets and timelines. Our conversion rate tripled.',
      avatar: 'RK',
    },
    {
      name: 'Sarah Williams',
      role: 'Supply Chain Head',
      company: 'Aerospace Components GmbH',
      text: 'The SQI scoring gives us confidence. No more guessing about supplier capabilities. We save weeks in vendor validation.',
      avatar: 'SW',
    },
  ];

  const pilots = [
    { name: 'TechParts', logo: 'TP' },
    { name: 'Global Casting', logo: 'GC' },
    { name: 'Precision Works', logo: 'PW' },
    { name: 'Euro Manufacturing', logo: 'EM' },
    { name: 'Advanced Machining', logo: 'AM' },
    { name: 'Quality Forge', logo: 'QF' },
  ];

  return (
    <section className="py-20 md:py-32 bg-surface relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-success/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-success/10 rounded-full mb-6">
            <Shield className="w-5 h-5 text-success" />
            <span className="text-success font-semibold">Trusted & Verified</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Built on <span className="text-success">Trust</span> & <span className="text-primary">Transparency</span>
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Every participant is verified. Every transaction is governed. Zero tolerance for spam.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          <div className="bg-background rounded-xl p-8 shadow-lg border border-border text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Admin-Governed</h3>
            <p className="text-text-muted">
              Every buyer and supplier manually verified by our team. No bots, no spam.
            </p>
          </div>

          <div className="bg-background rounded-xl p-8 shadow-lg border border-border text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-success rounded-xl flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">SQI Scoring</h3>
            <p className="text-text-muted">
              Transparent supplier quality index based on certifications, machines, and track record.
            </p>
          </div>

          <div className="bg-background rounded-xl p-8 shadow-lg border border-border text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Quality-First</h3>
            <p className="text-text-muted">
              Suppliers pay to unlock, ensuring serious intent. Only quality leads, not quantity.
            </p>
          </div>
        </motion.div>

        {/* Pilot Companies */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-text text-center mb-8">Trusted by Industry Leaders</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {pilots.map((pilot, index) => (
              <motion.div
                key={pilot.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                className="bg-background rounded-lg p-6 shadow-md border border-border flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-surface-2 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl font-bold text-text-muted">{pilot.logo}</span>
                  </div>
                  <p className="text-xs text-text-muted font-medium">{pilot.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-text text-center mb-12">What Our Users Say</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-background rounded-xl p-8 shadow-lg border border-border hover:shadow-xl transition-shadow relative"
              >
                <Quote className="w-10 h-10 text-primary/20 absolute top-6 right-6" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-text">{testimonial.name}</p>
                      <p className="text-sm text-text-muted">{testimonial.role}</p>
                      <p className="text-xs text-text-muted font-semibold">{testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-text-muted leading-relaxed italic">"{testimonial.text}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

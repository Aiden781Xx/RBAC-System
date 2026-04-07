import { Mail, Phone, MapPin, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const links = {
    company: [
      { label: 'About Us', href: '#' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Trust & Safety', href: '#' },
      { label: 'Careers', href: '#' },
    ],
    buyers: [
      { label: 'Post RFQ', href: '#' },
      { label: 'Find Suppliers', href: '#' },
      { label: 'Buyer Guide', href: '#' },
      { label: 'Success Stories', href: '#' },
    ],
    suppliers: [
      { label: 'Join Platform', href: '#' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'SQI Score', href: '#' },
      { label: 'Resources', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Data Security', href: '#' },
    ],
  };

  return (
   <footer id="footer" className="bg-background text-text">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">

      {/* Brand Column */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <span className="text-3xl font-bold">
            Control<span className="text-primary">Source</span>
          </span>
          <p className="text-text-muted text-sm mt-4 font-semibold leading-relaxed">
            India's Export Sourcing Control Layer. Connecting verified international buyers
            with quality Indian manufacturers.
          </p>
        </div>
        <div className="space-y-3 font-semibold text-sm">
          <a href="mailto:hello@controlsource.in"
            className="flex items-center space-x-2 text-text-muted hover:text-primary transition-colors">
            <Mail className="w-4 h-4" />
            <span>hello@controlsource.in</span>
          </a>
          <a href="tel:+911234567890"
            className="flex items-center space-x-2 text-text-muted hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
            <span>+91 (123) 456-7890</span>
          </a>
          <div className="flex items-center space-x-2 text-text-muted">
            <MapPin className="w-4 h-4" />
            <span>Pune, Maharashtra, India</span>
          </div>
        </div>
      </div>

      {/* Links Columns */}
      <div>
        <h4 className="font-bold text-text mb-4">Company</h4>
        <ul className="space-y-2">
          {links.company.map((link) => (
            <li key={link.label}>
              <a href={link.href}
                className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-text mb-4">For Buyers</h4>
        <ul className="space-y-2">
          {links.buyers.map((link) => (
            <li key={link.label}>
              <a href={link.href}
                className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-text mb-4">For Suppliers</h4>
        <ul className="space-y-2">
          {links.suppliers.map((link) => (
            <li key={link.label}>
              <a href={link.href}
                className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-bold text-text mb-4">Legal</h4>
        <ul className="space-y-2">
          {links.legal.map((link) => (
            <li key={link.label}>
              <a href={link.href}
                className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Demo Pages */}
    <div className="mb-8">
      <h4 className="font-bold text-text mb-2">Pages you can tryout as Demo</h4>
      <div className="flex flex-wrap gap-3">
        <Link to="/login" className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">Login</Link>
        <Link to="/register" className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">Register</Link>
        <Link to="/admin" className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">Admin</Link>
        <Link to="/buyer" className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">Buyer</Link>
        <Link to="/supplier" className="text-text-muted font-semibold hover:text-primary transition-colors text-sm">Supplier</Link>
      </div>
    </div>

    {/* Newsletter Section */}
    <div className="border-t border-white/10 pt-8 mb-8">
      <div className="max-w-xl">
        <h4 className="font-bold text-text mb-2">Stay Updated</h4>
        <p className="text-text-muted text-sm mb-4">
          Get the latest sourcing insights and platform updates.
        </p>
        <div className="flex space-x-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-backgroud/10 border border-border rounded-lg
              text-text placeholder-text-muted/50 focus:outline-none focus:ring-2
              focus:ring-primary transition"
          />
          <button
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg
              font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/20">
            Subscribe
          </button>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <p className="text-text-muted text-sm">
        © 2026 ControlSource. All rights reserved. India's Export Sourcing Control Layer.
      </p>
      <div className="flex items-center space-x-4">
        <a href="#"
          className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center
            hover:text-primary transition-colors"
          aria-label="LinkedIn">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="#"
          className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center
            hover:text-primary transition-colors"
          aria-label="Twitter">
          <Twitter className="w-5 h-5" />
        </a>
        <a href="#"
          className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center
            hover:text-primary transition-colors"
          aria-label="YouTube">
          <Youtube className="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
</footer>
  );
}
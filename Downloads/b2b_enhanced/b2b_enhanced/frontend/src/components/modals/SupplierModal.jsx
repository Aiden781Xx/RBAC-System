import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Factory, 
  Mail, 
  MapPin, 
  Settings, 
  Award, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  ArrowRight, 
  TrendingUp 
} from 'lucide-react';

export default function SupplierModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [sqiScore, setSqiScore] = useState(0);
  const [formData, setFormData] = useState({
    factoryName: '',
    email: '',
    location: '',
    yearEstablished: '',
    totalEmployees: '',
    machines: '',
    certifications: [],
    exportExperience: '',
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const calculateSQI = () => {
    let score = 0;
    if (formData.factoryName) score += 10;
    if (formData.yearEstablished && parseInt(formData.yearEstablished) < 2015) score += 15;
    if (formData.totalEmployees && parseInt(formData.totalEmployees) > 50) score += 15;
    if (formData.machines) score += 20;
    score += formData.certifications.length * 10;
    if (formData.exportExperience === 'extensive') score += 20;
    setSqiScore(Math.min(score, 100));
  };

  const certOptions = ['ISO 9001', 'ISO 14001', 'CE', 'AS9100', 'IATF 16949'];

  // Close on ESC key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Supplier Onboarding</h2>
                <p className="text-sm text-green-100 mt-1">
                  Step {step} of {totalSteps} - Build your SQI profile and start receiving leads
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-white"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <Award className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">Build your Supplier Quality Index (SQI)</p>
                      <p className="text-sm text-green-700">Higher scores get priority access to premium leads</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Factory className="w-4 h-4 inline mr-2" />
                      Factory / Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.factoryName}
                      onChange={(e) => setFormData({ ...formData, factoryName: e.target.value })}
                      placeholder="e.g., Precision Engineering Works Pvt Ltd"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Business Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@factory.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Location (City, State) *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Pune, Maharashtra"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year Established *
                      </label>
                      <input
                        type="number"
                        value={formData.yearEstablished}
                        onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
                        placeholder="e.g., 2005"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Employees *
                    </label>
                    <select
                      value={formData.totalEmployees}
                      onChange={(e) => setFormData({ ...formData, totalEmployees: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="">Select range</option>
                      <option value="10">1-10</option>
                      <option value="25">11-25</option>
                      <option value="50">26-50</option>
                      <option value="100">51-100</option>
                      <option value="200">100+</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-900">Capabilities & Equipment</p>
                      <p className="text-sm text-blue-700">This helps us match you with the right RFQs</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Settings className="w-4 h-4 inline mr-2" />
                      Machine Capabilities *
                    </label>
                    <textarea
                      value={formData.machines}
                      onChange={(e) => setFormData({ ...formData, machines: e.target.value })}
                      placeholder="List your machines: CNC Mills, Lathes, EDM, Grinding, etc."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Award className="w-4 h-4 inline mr-2" />
                      Certifications (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {certOptions.map((cert) => (
                        <label
                          key={cert}
                          className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.certifications.includes(cert)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  certifications: [...formData.certifications, cert] 
                                });
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  certifications: formData.certifications.filter(c => c !== cert) 
                                });
                              }
                            }}
                            className="w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{cert}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Upload Certifications & Export Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-1">Upload certificates, export licenses, GST</p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB each</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Export Experience *
                    </label>
                    <select
                      value={formData.exportExperience}
                      onChange={(e) => setFormData({ ...formData, exportExperience: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="">Select your experience</option>
                      <option value="none">New to exports</option>
                      <option value="limited">Limited (1-2 years)</option>
                      <option value="moderate">Moderate (3-5 years)</option>
                      <option value="extensive">Extensive (5+ years)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onAnimationComplete={calculateSQI}
                  className="space-y-6"
                >
                  {/* SQI Score Display */}
                  <div className="bg-gradient-to-br from-blue-900 to-green-500 text-white rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    <div className="relative z-10">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Your Supplier Quality Index (SQI)</h3>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                        className="text-7xl font-bold my-6"
                      >
                        {sqiScore}
                      </motion.div>
                      <p className="text-green-100">
                        {sqiScore >= 80 && 'Excellent! Premium tier access'}
                        {sqiScore >= 60 && sqiScore < 80 && 'Good! Standard tier access'}
                        {sqiScore < 60 && 'Complete your profile for better matching'}
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                    <h4 className="font-semibold text-gray-900 mb-4">Score Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Company Information</span>
                        <span className="font-semibold text-gray-900">✓ Complete</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Certifications ({formData.certifications.length})</span>
                        <span className="font-semibold text-gray-900">+{formData.certifications.length * 10} pts</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Export Experience</span>
                        <span className="font-semibold text-gray-900">
                          {formData.exportExperience === 'extensive' ? '+20 pts' : '+10 pts'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unlock Leads CTA */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-yellow-900" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to unlock your first lead?</h3>
                        <p className="text-sm text-gray-700 mb-4">
                          Pay-per-lead model ensures you only pay for qualified opportunities. No monthly fees, no subscriptions.
                        </p>
                        <div className="flex items-center justify-between bg-white rounded-lg p-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Starting from</p>
                            <p className="text-2xl font-bold text-blue-900">₹500</p>
                            <p className="text-xs text-gray-600">per lead unlock</p>
                          </div>
                          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                            View Pricing
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* What's Next */}
                  <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <h3 className="text-lg font-bold text-gray-900">What happens next?</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                        <p>Admin reviews your profile and documents (24-48 hours)</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                        <p>Get access to your dashboard with available RFQs</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                        <p>Browse leads, unlock those matching your capabilities</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                        <p>Submit quotes and negotiate directly with verified buyers</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex justify-between items-center">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
              >
                ← Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => setStep(step + 1)}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-900 to-green-500 text-white rounded-lg font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Complete Registration</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
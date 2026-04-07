 import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FileText, MessageSquare, Clock, CheckCircle, Lock, DollarSign, TrendingUp, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export function DashboardPreviews() {
  const [activeTab, setActiveTab] = useState('buyer');

  const buyerRFQs = [
    { id: 1, title: 'CNC Aluminum Brackets', quotes: 5, status: 'Active', budget: '$15,000' },
    { id: 2, title: 'Stainless Steel Castings', quotes: 3, status: 'Review', budget: '$28,000' },
    { id: 3, title: 'Precision Gears - Batch 100', quotes: 8, status: 'Negotiating', budget: '$12,500' },
  ];

  const supplierLeads = [
    { id: 1, title: 'High-Volume CNC Parts', value: '₹2,500', location: 'USA', status: 'locked', match: 95 },
    { id: 2, title: 'Investment Castings Project', value: '₹1,500', location: 'Germany', status: 'locked', match: 88 },
    { id: 3, title: 'Precision Machining - Aerospace', value: '₹3,000', location: 'UK', status: 'locked', match: 92 },
  ];

  return (
    <section id="dashboards" className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Eye className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold">Dashboard Preview</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Your Command Center
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Real-time visibility into your sourcing pipeline or lead opportunities
          </p>
        </motion.div>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Selector - Minimal & Clean */}
          <Tabs.List className="flex justify-center space-x-2 mb-12 p-1 bg-white/5 w-fit mx-auto rounded-xl border border-white/10 backdrop-blur-md">
            <Tabs.Trigger
              value="buyer"
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${activeTab === 'buyer'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-surface-2 text-text-muted hover:bg-border hover:text-text'
                }`}
            >
              Buyer Portal
            </Tabs.Trigger>
            <Tabs.Trigger
              value="supplier"
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${activeTab === 'supplier'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-surface-2 text-text-muted hover:bg-border hover:text-text'
                }`}
            >
              Supplier Portal
            </Tabs.Trigger>
          </Tabs.List>

          {/* Buyer Dashboard */}
          <Tabs.Content value="buyer">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-surface rounded-2xl border-2 border-border overflow-hidden shadow-2xl"
            >
              {/* Dashboard Header */}
              <div className="bg-primary text-white p-6">
                <h3 className="text-2xl font-bold mb-2">Welcome back, John</h3>
                <p className="text-white/70">Here's your sourcing activity</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 p-6 border-b border-border">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-sm text-text-muted mb-1">Active RFQs</div>
                  <div className="text-3xl font-bold text-primary">3</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-sm text-text-muted mb-1">Total Quotes</div>
                  <div className="text-3xl font-bold text-success">16</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-sm text-text-muted mb-1">In Negotiation</div>
                  <div className="text-3xl font-bold text-warning">2</div>
                </div>
              </div>

              {/* RFQ List */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-text mb-4">Your RFQs</h4>
                <div className="space-y-3">
                  {buyerRFQs.map((rfq) => (
                    <div
                      key={rfq.id}
                      className="bg-background rounded-lg p-5 border border-border hover:border-primary transition-all hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <h5 className="font-semibold text-text">{rfq.title}</h5>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rfq.status === 'Active' ? 'bg-success-soft text-success' :
                                rfq.status === 'Review' ? 'bg-info-soft text-info' :
                                  'bg-warning-soft text-warning'
                              }`}>
                              {rfq.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-text-muted">
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{rfq.quotes} quotes received</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>Budget: {rfq.budget}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>2 days ago</span>
                            </span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors">
                          View Quotes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Preview */}
              <div className="bg-surface p-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-text">Recent Messages</h4>
                  <button className="text-sm text-primary font-semibold hover:text-primary-hover hover:underline">
                    View All
                  </button>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border flex items-center space-x-4">
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center text-white font-bold">
                    PW
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text">Precision Works Ltd</p>
                    <p className="text-sm text-text-muted">Can we discuss the tolerances for the aluminum brackets?</p>
                  </div>
                  <div className="text-xs text-text-muted">5m ago</div>
                </div>
              </div>
            </motion.div>
          </Tabs.Content>

          {/* Supplier Dashboard */}
          <Tabs.Content value="supplier">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-surface rounded-2xl border-2 border-border overflow-hidden shadow-2xl"
            >
              {/* Dashboard Header */}
              <div className="bg-primary text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Precision Engineering Works</h3>
                    <p className="text-white/70">Your supplier profile</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/70 mb-1">Your SQI Score</div>
                    <div className="text-4xl font-bold">85</div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 p-6 border-b border-border">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-sm text-text-muted mb-1">Available Leads</div>
                  <div className="text-3xl font-bold text-success">12</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-sm text-text-muted mb-1">Quotes Sent</div>
                  <div className="text-3xl font-bold text-primary">8</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-sm text-text-muted mb-1">Win Rate</div>
                  <div className="text-3xl font-bold text-success">62%</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-sm text-text-muted mb-1">This Month</div>
                  <div className="text-3xl font-bold text-accent">₹45k</div>
                </div>
              </div>

              {/* Available Leads */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-text mb-4 flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>Available Leads (Unlock to View)</span>
                </h4>
                <div className="space-y-3">
                  {supplierLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-background rounded-lg p-5 border-2 border-border hover:border-primary transition-all relative overflow-hidden group"
                    >
                      {/* Blurred Overlay */}
                      <div className="absolute inset-0 backdrop-blur-sm bg-background/60 z-10 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                        <div className="text-center">
                          <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                          <p className="font-semibold text-text">Unlock for {lead.value}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-2 h-2 rounded-full ${lead.match >= 90 ? 'bg-success' : 'bg-warning'
                              }`} />
                            <h5 className="font-semibold text-text">{lead.title}</h5>
                            <span className="px-3 py-1 bg-success-soft text-success rounded-full text-xs font-semibold">
                              {lead.match}% Match
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-text-muted">
                            <span>📍 {lead.location}</span>
                            <span>{lead.match}% Match Score</span>
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-all hover:scale-105 z-20 shadow-lg shadow-primary/20">
                          Unlock {lead.value}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-surface p-6 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-background rounded-lg p-4 text-left hover:shadow-md transition-shadow border border-border hover:border-success">
                    <CheckCircle className="w-6 h-6 text-success mb-2" />
                    <p className="font-semibold text-text">Update Profile</p>
                    <p className="text-sm text-text-muted">Improve your SQI score</p>
                  </button>
                  <button className="bg-background rounded-lg p-4 text-left hover:shadow-md transition-shadow border border-border hover:border-primary">
                    <MessageSquare className="w-6 h-6 text-primary mb-2" />
                    <p className="font-semibold text-text">Active Negotiations</p>
                    <p className="text-sm text-text-muted">3 ongoing chats</p>
                  </button>
                </div>
              </div>
            </motion.div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
}
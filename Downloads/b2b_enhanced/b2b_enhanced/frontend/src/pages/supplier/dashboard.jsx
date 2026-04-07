import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  Search, 
  Download, 
  TrendingUp,
  DollarSign,
  Bell,
  Menu,
  X,
  Lock,
  Unlock,
  Star,
  Award,
  FileText,
  Settings,
  CreditCard,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell 
} from 'recharts';

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data
  const stats = {
    sqi_score: 92,
    unlocked_leads: 8,
    revenue: 45000,
    repeat_rate: 75
  };

  const newLeads = [
    {
      id: 'RFQ-2024-015',
      snippet: '1000 CNC Machined Parts - Aluminum',
      category: 'CNC Machining',
      budget: '₹5-10L',
      match_score: 95,
      unlock_price: 2000,
      tier: 'Premium',
      deadline: '2024-02-20',
      buyer_rating: 4.8,
      repeat_buyer: true
    },
    {
      id: 'RFQ-2024-016',
      snippet: '500 Investment Casting Components',
      category: 'Casting',
      budget: '₹3-7L',
      match_score: 88,
      unlock_price: 1500,
      tier: 'Basic',
      deadline: '2024-02-18',
      buyer_rating: 4.5,
      repeat_buyer: false
    },
    {
      id: 'RFQ-2024-017',
      snippet: 'Sheet Metal Enclosures - Stainless Steel',
      category: 'Sheet Metal',
      budget: '₹8-15L',
      match_score: 92,
      unlock_price: 2500,
      tier: 'Exclusive',
      deadline: '2024-02-25',
      buyer_rating: 4.9,
      repeat_buyer: true
    },
    {
      id: 'RFQ-2024-018',
      snippet: '200 Forged Components - Carbon Steel',
      category: 'Forging',
      budget: '₹4-8L',
      match_score: 85,
      unlock_price: 1200,
      tier: 'Basic',
      deadline: '2024-02-22',
      buyer_rating: 4.3,
      repeat_buyer: false
    },
  ];

  const myQuotes = [
    {
      rfq_id: 'RFQ-2024-010',
      title: 'CNC Parts - High Precision',
      status: 'Quoted',
      quote_amount: '₹8,50,000',
      submitted: '2024-02-10',
      buyer_feedback: 'Under Review',
      potential_earnings: '₹8,50,000'
    },
    {
      rfq_id: 'RFQ-2024-008',
      title: 'Casting Components',
      status: 'Awarded',
      quote_amount: '₹6,20,000',
      submitted: '2024-02-05',
      buyer_feedback: 'Accepted - Great pricing',
      potential_earnings: '₹6,20,000'
    },
    {
      rfq_id: 'RFQ-2024-012',
      title: 'Sheet Metal Fabrication',
      status: 'Quoted',
      quote_amount: '₹12,00,000',
      submitted: '2024-02-11',
      buyer_feedback: 'Pending',
      potential_earnings: '₹12,00,000'
    },
  ];

  const ordersWon = [
    {
      order_id: 'ORD-2024-025',
      rfq_id: 'RFQ-2024-008',
      buyer: 'TechCorp Industries',
      amount: '₹6,20,000',
      status: 'In Production',
      delivery_date: '2024-03-10'
    },
    {
      order_id: 'ORD-2024-022',
      rfq_id: 'RFQ-2024-005',
      buyer: 'Apex Manufacturing',
      amount: '₹4,50,000',
      status: 'Shipped',
      delivery_date: '2024-02-28'
    },
  ];

  const winRateData = [
    { category: 'CNC', rate: 65 },
    { category: 'Casting', rate: 55 },
    { category: 'Sheet Metal', rate: 70 },
    { category: 'Forging', rate: 48 },
  ];

  const sqiBreakdown = [
    { name: 'Factory Verification', value: 30, max: 30, color: '#10B981' },
    { name: 'Machine Capabilities', value: 38, max: 40, color: '#1E3A8A' },
    { name: 'Certifications', value: 24, max: 30, color: '#3B82F6' },
  ];

  const revenueData = [
    { month: 'Oct', revenue: 28 },
    { month: 'Nov', revenue: 35 },
    { month: 'Dec', revenue: 32 },
    { month: 'Jan', revenue: 42 },
    { month: 'Feb', revenue: 45 },
  ];

  const handleUnlockLead = (lead) => {
    setSelectedLead(lead);
    setIsUnlockModalOpen(true);
  };

  const confirmUnlock = () => {
    setIsUnlockModalOpen(false);
    // Handle unlock logic
  };

  const filteredLeads = filterCategory === 'all' 
    ? newLeads 
    : newLeads.filter(lead => lead.category === filterCategory);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#F8FAFC] pt-20"
    >
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? '280px' : '0px' }}
          transition={{ duration: 0.3 }}
          className={`fixed left-0 top-20 bottom-0 bg-white border-r border-gray-200 overflow-hidden z-40 ${
            isSidebarOpen ? 'shadow-lg' : ''
          }`}
        >
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Filter Leads</h3>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="CNC Machining">CNC Machining</option>
                <option value="Casting">Casting</option>
                <option value="Sheet Metal">Sheet Metal</option>
                <option value="Forging">Forging</option>
              </select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quick Actions</h3>
              <nav className="space-y-1">
                <button className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <FileText className="w-4 h-4 inline mr-2" />
                  My Quotes
                </button>
                <button className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Profile & Machines
                </button>
                <button className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Payments
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="bg-[#FEF3C7] rounded-lg p-4 border border-[#F59E0B]">
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Boost Your SQI</h4>
                    <p className="text-xs text-gray-700 mb-2">Add export certifications for +10 points</p>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Upgrade Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden"
                  >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">Welcome, Precision Manufacturing Ltd</h1>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="hidden sm:flex items-center gap-2"
                      >
                        <Home className="w-4 h-4" />
                        Back to Home
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">Your factory dashboard for lead management</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#10B981] rounded-full"></span>
                  </Button>
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input 
                      placeholder="Search leads..." 
                      className="w-64 hidden md:block"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-[#10B981]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Your SQI Score</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.sqi_score}/100</p>
                        <button className="text-xs text-[#1E3A8A] hover:underline mt-1">
                          View tips to improve
                        </button>
                      </div>
                      <div className="w-12 h-12 bg-[#D1FAE5] rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-[#10B981]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#1E3A8A]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Unlocked Leads</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.unlocked_leads}</p>
                      </div>
                      <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                        <Unlock className="w-6 h-6 text-[#1E3A8A]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#3B82F6]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Revenue (This Month)</p>
                        <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}k</p>
                      </div>
                      <div className="w-12 h-12 bg-[#DBEAFE] rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-[#3B82F6]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#8B5CF6]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Repeat Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.repeat_rate}%</p>
                      </div>
                      <div className="w-12 h-12 bg-[#EDE9FE] rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-[#8B5CF6]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Tabs Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Tabs defaultValue="leads" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="bg-white">
                  <TabsTrigger value="leads">New Leads</TabsTrigger>
                  <TabsTrigger value="quotes">My Quotes</TabsTrigger>
                  <TabsTrigger value="orders">Orders Won</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>

              {/* New Leads Tab */}
              <TabsContent value="leads" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden">
                        {/* Tier Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge 
                            className={
                              lead.tier === 'Exclusive' ? 'bg-purple-100 text-purple-800' :
                              lead.tier === 'Premium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {lead.tier}
                          </Badge>
                        </div>

                        <CardContent className="p-6">
                          {/* Lead Header */}
                          <div className="mb-4">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Lock className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{lead.id}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {lead.category}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Blurred Preview */}
                          <div className="relative mb-4">
                            <div className="bg-gray-50 rounded-lg p-4 blur-sm select-none">
                              <p className="text-sm text-gray-600 mb-2">{lead.snippet}</p>
                              <p className="text-xs text-gray-400">
                                Quantity: ███ units • Material: ████████ • Tolerance: ±█.██mm
                              </p>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                                <p className="text-sm font-semibold text-gray-900">Unlock to view full details</p>
                              </div>
                            </div>
                          </div>

                          {/* Lead Info */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Budget Range:</span>
                              <span className="font-semibold text-gray-900">{lead.budget}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Match Score:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={lead.match_score} className="h-2 w-20" />
                                <span className="font-semibold text-[#10B981]">{lead.match_score}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Buyer Rating:</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{lead.buyer_rating}</span>
                                {lead.repeat_buyer && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Repeat Buyer
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Deadline:</span>
                              <span className="font-medium text-gray-900 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {lead.deadline}
                              </span>
                            </div>
                          </div>

                          {/* Unlock Button */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Unlock Price</p>
                              <p className="text-xl font-bold text-[#1E3A8A]">₹{lead.unlock_price.toLocaleString()}</p>
                            </div>
                            <Button
                              onClick={() => handleUnlockLead(lead)}
                              className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Unlock Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredLeads.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads available</h3>
                      <p className="text-gray-600">
                        Try adjusting your filters or check back later for new opportunities
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* My Quotes Tab */}
              <TabsContent value="quotes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Submitted Quotes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>RFQ ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Quote Amount</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Buyer Feedback</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {myQuotes.map((quote) => (
                            <TableRow key={quote.rfq_id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{quote.rfq_id}</TableCell>
                              <TableCell>{quote.title}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    quote.status === 'Awarded' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                  }
                                >
                                  {quote.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold text-[#1E3A8A]">{quote.quote_amount}</TableCell>
                              <TableCell>{quote.submitted}</TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">{quote.buyer_feedback}</span>
                              </TableCell>
                              <TableCell>
                                {quote.status === 'Quoted' ? (
                                  <Button variant="outline" size="sm">
                                    Edit Quote
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm">
                                    View Details
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Won Tab */}
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders Awarded to You</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>RFQ ID</TableHead>
                            <TableHead>Buyer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Delivery Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ordersWon.map((order) => (
                            <TableRow key={order.order_id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{order.order_id}</TableCell>
                              <TableCell>{order.rfq_id}</TableCell>
                              <TableCell className="font-semibold">{order.buyer}</TableCell>
                              <TableCell className="font-bold text-[#10B981]">{order.amount}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    order.status === 'Shipped' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.delivery_date}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm">
                                  Update Status
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Win Rate by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Win Rate by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={winRateData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="rate" fill="#1E3A8A" name="Win Rate %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* SQI Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>SQI Score Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sqiBreakdown.map((item, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{item.name}</span>
                              <span className="text-sm font-bold" style={{ color: item.color }}>
                                {item.value}/{item.max}
                              </span>
                            </div>
                            <Progress 
                              value={(item.value / item.max) * 100} 
                              className="h-3"
                              style={{ 
                                backgroundColor: '#E5E7EB',
                              }}
                            />
                          </div>
                        ))}

                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Improvement Tips</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">
                                Add ISO 9001 certification for +10 points
                              </span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">
                                Upload photos of new 5-axis CNC machine for +5 points
                              </span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">
                                Complete quality control documentation for +3 points
                              </span>
                            </li>
                          </ul>
                          <Button className="w-full mt-4 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                            Improve Your SQI
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue Trend */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Monthly Revenue (₹ in thousands)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹k)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Unlock Lead Modal */}
      <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unlock Lead</DialogTitle>
            <DialogDescription>
              Review lead details and confirm payment
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="bg-[#F8FAFC] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Lead Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">RFQ ID:</dt>
                    <dd className="font-medium text-gray-900">{selectedLead.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Category:</dt>
                    <dd className="font-medium text-gray-900">{selectedLead.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Budget:</dt>
                    <dd className="font-medium text-gray-900">{selectedLead.budget}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Match Score:</dt>
                    <dd className="font-medium text-[#10B981]">{selectedLead.match_score}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Tier:</dt>
                    <dd>
                      <Badge 
                        className={
                          selectedLead.tier === 'Exclusive' ? 'bg-purple-100 text-purple-800' :
                          selectedLead.tier === 'Premium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {selectedLead.tier}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 font-medium">Unlock Price:</span>
                  <span className="text-2xl font-bold text-[#1E3A8A]">
                    ₹{selectedLead.unlock_price.toLocaleString()}
                  </span>
                </div>

                <div className="bg-[#EFF6FF] rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">What you'll get:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Full RFQ specifications and technical drawings</li>
                        <li>• Direct contact with verified buyer</li>
                        <li>• Ability to submit competitive quote</li>
                        <li>• Chat access for clarifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Amount will be deducted from your wallet balance
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnlockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUnlock}
              className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Confirm & Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
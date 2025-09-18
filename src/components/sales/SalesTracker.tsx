import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, BarChart3, Edit, Search, Filter } from 'lucide-react';
import { User, SalesRecord, Product } from '../../types';
import { getProducts, saveSalesRecords } from '../../utils/storage';
import { formatDate } from '../../utils/dateUtils';
import { captureRealTimeData } from '../../utils/realTimeData';
import { SalesEntryManager } from './SalesEntryManager';
import { SalesAnalytics } from './SalesAnalytics';

interface SalesTrackerProps {
  users: User[];
  sales: SalesRecord[];
  currentUser: User;
  onSalesUpdate: (records: SalesRecord[]) => void;
}

export const SalesTracker: React.FC<SalesTrackerProps> = ({
  users,
  sales,
  currentUser,
  onSalesUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'entry' | 'manage' | 'analytics'>('entry');
  const [products] = useState<Product[]>(getProducts());
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    customer: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    customerAddress: '',
    category: 'Mobile',
    discount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid' as 'paid' | 'pending' | 'partial' | 'overdue',
    notes: '',
    leadSource: 'direct',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    followUpRequired: false,
    followUpDate: '',
    date: formatDate(new Date()),
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  const handleProductSelect = (product: Product) => {
    setFormData({
      ...formData,
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      category: product.category,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName || !formData.customer) {
      alert('Please fill in all required fields');
      return;
    }

    const totalAmount = (formData.quantity * formData.unitPrice) - formData.discount;

    const newSale: SalesRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      date: formData.date,
      productId: formData.productId,
      productName: formData.productName,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount,
      customer: formData.customer,
      category: formData.category,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      customerCompany: formData.customerCompany,
      customerAddress: formData.customerAddress,
      discount: formData.discount,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      notes: formData.notes,
      leadSource: formData.leadSource,
      priority: formData.priority,
      followUpRequired: formData.followUpRequired,
      followUpDate: formData.followUpDate,
      submittedAt: new Date().toISOString(),
      dealStage: 'closed-won',
      territory: currentUser.territory,
    };

    const updatedSales = [...sales, newSale];
    onSalesUpdate(updatedSales);
    saveSalesRecords(updatedSales);
    
    // Capture real-time sales data
    captureRealTimeData.salesEntry(newSale);

    // Reset form
    setFormData({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      customer: '',
      customerEmail: '',
      customerPhone: '',
      customerCompany: '',
      customerAddress: '',
      category: 'Mobile',
      discount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      notes: '',
      leadSource: 'direct',
      priority: 'medium',
      followUpRequired: false,
      followUpDate: '',
      date: formatDate(new Date()),
    });

    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
    successDiv.innerHTML = '✅ Sale recorded successfully!';
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  };

  const totalAmount = (formData.quantity * formData.unitPrice) - formData.discount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Sales Tracker</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('entry')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entry'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              New Sale
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit className="w-4 h-4 inline mr-2" />
              Manage Sales
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'entry' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Record New Sale</h3>
                <p className="text-gray-600">Complete CRM sales entry with customer details</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Product Selection */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Selection</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 input-field"
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          formData.productId === product.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <h5 className="font-medium text-gray-900">{product.name}</h5>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <p className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {formData.productId && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">
                        <strong>Selected:</strong> {formData.productName} - ₹{formData.unitPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Sale Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Sale Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        className="input-field"
                        placeholder="Enter customer name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        className="input-field"
                        placeholder="customer@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        className="input-field"
                        placeholder="+91 9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.customerCompany}
                        onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                        className="input-field"
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Customer address"
                    />
                  </div>
                </div>

                {/* Payment & CRM Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment & CRM Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="input-field"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Status
                      </label>
                      <select
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                        className="input-field"
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Source
                      </label>
                      <select
                        value={formData.leadSource}
                        onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                        className="input-field"
                      >
                        <option value="direct">Direct</option>
                        <option value="referral">Referral</option>
                        <option value="website">Website</option>
                        <option value="social_media">Social Media</option>
                        <option value="advertisement">Advertisement</option>
                        <option value="cold_call">Cold Call</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="input-field"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sale Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.followUpRequired}
                          onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Follow-up Required</span>
                      </label>
                    </div>
                  </div>

                  {formData.followUpRequired && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={formData.followUpDate}
                        onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                        className="input-field max-w-xs"
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Additional notes about the sale..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-lg"
                >
                  <Plus className="w-6 h-6" />
                  <span>Record Sale</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'manage' && (
            <SalesEntryManager
              sales={sales}
              users={users}
              currentUser={currentUser}
              onSalesUpdate={onSalesUpdate}
            />
          )}

          {activeTab === 'analytics' && (
            <SalesAnalytics
              sales={sales}
              users={users}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </div>
  );
};
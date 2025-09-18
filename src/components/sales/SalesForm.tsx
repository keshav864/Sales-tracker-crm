import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Search, Package, ShoppingCart } from 'lucide-react';
import { SalesRecord, User, Product } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getProducts } from '../../utils/storage';

interface SalesFormProps {
  currentUser: User;
  onSalesAdd: (sale: SalesRecord) => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({ currentUser, onSalesAdd }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    quantity: 1,
    customer: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    customerAddress: '',
    discount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid' as 'paid' | 'pending' | 'partial' | 'overdue',
    notes: '',
    leadSource: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    date: formatDate(new Date()),
  });

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    const totalAmount = (selectedProduct.price * formData.quantity) - formData.discount;
    
    const newSale: SalesRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      date: formData.date,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productCode: selectedProduct.id,
      quantity: formData.quantity,
      unitPrice: selectedProduct.price,
      totalAmount,
      customer: formData.customer,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      customerCompany: formData.customerCompany,
      customerAddress: formData.customerAddress,
      category: selectedProduct.category,
      discount: formData.discount,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      notes: formData.notes,
      leadSource: formData.leadSource,
      priority: formData.priority,
      submittedAt: new Date().toISOString(),
      dealStage: 'closed-won',
      commission: totalAmount * 0.05, // 5% commission
      territory: currentUser.territory,
    };

    onSalesAdd(newSale);
    
    // Reset form
    setSelectedProduct(null);
    setCurrentStep(1);
    setFormData({
      quantity: 1,
      customer: '',
      customerEmail: '',
      customerPhone: '',
      customerCompany: '',
      customerAddress: '',
      discount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      notes: '',
      leadSource: '',
      priority: 'medium',
      date: formatDate(new Date()),
    });
    setSearchTerm('');
  };

  const totalAmount = selectedProduct ? (selectedProduct.price * formData.quantity) - formData.discount : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">Sales Report Submission</h2>
        <p className="text-sm md:text-base text-gray-600">Complete CRM form for sales tracking and analysis</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-max px-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            currentStep === 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <Package className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Product</span>
          </div>
          <div className="w-4 md:w-8 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            currentStep === 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <DollarSign className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Customer</span>
          </div>
          <div className="w-4 md:w-8 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            currentStep === 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Details</span>
          </div>
          <div className="w-4 md:w-8 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            currentStep === 4 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            <Plus className="w-5 h-5" />
            <span className="font-medium text-sm md:text-base">Review</span>
          </div>
        </div>
      </div>

      {/* Step 1: Product Selection */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
          <div className="flex items-center mb-6">
            <Package className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Product Selection</h3>
          </div>

          {/* Search Products */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, category, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select Product *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="border border-gray-200 rounded-xl p-3 md:p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">{product.name}</h4>
                    <span className="text-sm md:text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Category: {product.category}</p>
                  <p className="text-xs md:text-sm text-gray-600">Model: {product.model}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Customer Information */}
      {currentStep === 2 && selectedProduct && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
          <div className="flex items-center mb-6">
            <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Customer Information</h3>
          </div>

          {/* Selected Product Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Selected Product</h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-blue-800">{selectedProduct.name}</p>
                <p className="text-xs md:text-sm text-blue-600">{selectedProduct.category} - {selectedProduct.model}</p>
              </div>
              <p className="text-lg md:text-xl font-bold text-blue-600">₹{selectedProduct.price.toLocaleString()}</p>
            </div>
          </div>

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
                Customer Email
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
                Customer Phone
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
                Company Name
              </label>
              <input
                type="text"
                value={formData.customerCompany}
                onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                className="input-field"
                placeholder="Company name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Address
              </label>
              <textarea
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Complete address"
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(1)}
              className="btn-secondary text-sm md:text-base px-4 md:px-6"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!formData.customer}
              className="btn-primary disabled:opacity-50 text-sm md:text-base px-4 md:px-6"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sale Details */}
      {currentStep === 3 && selectedProduct && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
          <div className="flex items-center mb-6">
            <ShoppingCart className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Sale Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Unit Price (₹)
              </label>
              <input
                type="number"
                value={selectedProduct.price}
                className="input-field bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0"
              />
            </div>

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
                <option value="">Select source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="advertisement">Advertisement</option>
                <option value="cold_call">Cold Call</option>
                <option value="walk_in">Walk-in</option>
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

            <div className="md:col-span-2">
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

          {/* Total Amount */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-base md:text-lg font-medium text-green-900">Total Amount:</span>
              <span className="text-2xl md:text-3xl font-bold text-green-600">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-xs md:text-sm text-green-700 mt-2">
              ({formData.quantity} × ₹{selectedProduct.price.toLocaleString()}) - ₹{formData.discount.toLocaleString()} discount
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(2)}
              className="btn-secondary text-sm md:text-base px-4 md:px-6"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="btn-primary text-sm md:text-base px-4 md:px-6"
            >
              Review & Submit
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && selectedProduct && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-8">
          <div className="flex items-center mb-6">
            <Plus className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">Review & Submit</h3>
          </div>

          <div className="space-y-6">
            {/* Product Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-4">Product Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Product</p>
                  <p className="font-medium text-blue-800">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Category</p>
                  <p className="font-medium text-blue-800">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Model</p>
                  <p className="font-medium text-blue-800">{selectedProduct.model}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Unit Price</p>
                  <p className="font-medium text-blue-800">₹{selectedProduct.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Customer Summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h4 className="font-semibold text-green-900 mb-4">Customer Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-600">Name</p>
                  <p className="font-medium text-green-800">{formData.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Email</p>
                  <p className="font-medium text-green-800">{formData.customerEmail || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Phone</p>
                  <p className="font-medium text-green-800">{formData.customerPhone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600">Company</p>
                  <p className="font-medium text-green-800">{formData.customerCompany || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Sale Summary */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h4 className="font-semibold text-purple-900 mb-4">Sale Summary</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-purple-600">Quantity</p>
                  <p className="font-medium text-purple-800">{formData.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600">Discount</p>
                  <p className="font-medium text-purple-800">₹{formData.discount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600">Payment Method</p>
                  <p className="font-medium text-purple-800 capitalize">{formData.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600">Payment Status</p>
                  <p className="font-medium text-purple-800 capitalize">{formData.paymentStatus}</p>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl p-6">
              <div className="flex justify-between items-center">
                <span className="text-lg md:text-xl font-medium">Final Total Amount:</span>
                <span className="text-2xl md:text-4xl font-bold">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-secondary text-sm md:text-base px-4 md:px-6"
              >
                Previous
              </button>
              <button
                type="submit"
                className="btn-success flex items-center space-x-2 px-4 md:px-8 py-2 md:py-3 text-sm md:text-lg"
              >
                <Plus className="w-6 h-6" />
                <span>Submit Sale</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
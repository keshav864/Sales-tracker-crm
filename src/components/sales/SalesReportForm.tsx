import React, { useState, useEffect } from 'react';
import { FileText, Upload, Calendar, DollarSign, User, Building, Phone, Mail, MapPin, CreditCard, Star, Clock, Package } from 'lucide-react';
import { SalesRecord, User as UserType, Product } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { getProducts } from '../../utils/storage';
import { captureRealTimeData } from '../../utils/realTimeData';
import { validateSalesRecord, sanitizeInput } from '../../utils/validation';

interface SalesReportFormProps {
  currentUser: UserType;
  onSalesAdd: (sale: SalesRecord) => void;
}

export const SalesReportForm: React.FC<SalesReportFormProps> = ({ currentUser, onSalesAdd }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    // Product Information
    productId: '',
    productName: '',
    productCode: '',
    category: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    
    // Customer Information
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    customerAddress: '',
    
    // Sale Details
    saleDate: formatDate(new Date()),
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    notes: '',
    
    // Lead Information
    leadSource: 'direct',
    followUpRequired: false,
    followUpDate: '',
    priority: 'medium',
    dealStage: 'closed-won',
    territory: currentUser.territory || 'North',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
    setFilteredProducts(loadedProducts);
  }, []);

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.category.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.model.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearch, products]);

  const handleProductSelect = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setFormData({
        ...formData,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productCode: selectedProduct.id,
        category: selectedProduct.category,
        unitPrice: selectedProduct.price,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        ...formData,
        productName: sanitizeInput(formData.productName),
        customerName: sanitizeInput(formData.customerName),
        customerEmail: sanitizeInput(formData.customerEmail),
        customerPhone: sanitizeInput(formData.customerPhone),
        customerCompany: sanitizeInput(formData.customerCompany),
        customerAddress: sanitizeInput(formData.customerAddress),
        notes: sanitizeInput(formData.notes),
      };

      // Validate the sales record
      const validation = validateSalesRecord({
        productName: sanitizedData.productName,
        customer: sanitizedData.customerName,
        quantity: sanitizedData.quantity,
        unitPrice: sanitizedData.unitPrice,
        customerEmail: sanitizedData.customerEmail,
        customerPhone: sanitizedData.customerPhone,
      });

      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        setIsSubmitting(false);
        return;
      }

      const totalAmount = (formData.quantity * formData.unitPrice) - formData.discount;
      const commission = totalAmount * 0.05; // 5% commission
      
      const newSale: SalesRecord = {
        id: Date.now().toString(),
        userId: currentUser.id,
        date: sanitizedData.saleDate,
        productId: sanitizedData.productId,
        productName: sanitizedData.productName,
        quantity: sanitizedData.quantity,
        unitPrice: sanitizedData.unitPrice,
        totalAmount,
        customer: sanitizedData.customerName,
        category: sanitizedData.category,
        // Extended properties for CRM
        customerEmail: sanitizedData.customerEmail,
        customerPhone: sanitizedData.customerPhone,
        customerCompany: sanitizedData.customerCompany,
        customerAddress: sanitizedData.customerAddress,
        productCode: sanitizedData.productCode,
        discount: sanitizedData.discount,
        paymentMethod: sanitizedData.paymentMethod,
        paymentStatus: sanitizedData.paymentStatus as any,
        notes: sanitizedData.notes,
        leadSource: sanitizedData.leadSource,
        followUpRequired: sanitizedData.followUpRequired,
        followUpDate: sanitizedData.followUpDate,
        priority: sanitizedData.priority as any,
        dealStage: sanitizedData.dealStage as any,
        territory: sanitizedData.territory,
        commission,
        submittedAt: new Date().toISOString(),
      };

      onSalesAdd(newSale);
      
      // Capture real-time sales entry
      captureRealTimeData.salesEntry(newSale);
      
      // Reset form
      setFormData({
        productId: '',
        productName: '',
        productCode: '',
        category: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerCompany: '',
        customerAddress: '',
        saleDate: formatDate(new Date()),
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        notes: '',
        leadSource: 'direct',
        followUpRequired: false,
        followUpDate: '',
        priority: 'medium',
        dealStage: 'closed-won',
        territory: currentUser.territory || 'North',
      });

      setCurrentStep(1);
      setProductSearch('');
      
      // Show success animation
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
      successDiv.innerHTML = '✅ Sales report submitted successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
      
    } catch (error) {
      alert('Error submitting sales report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = (formData.quantity * formData.unitPrice) - formData.discount;
  const commission = totalAmount * 0.05;

  const steps = [
    { id: 1, title: 'Product Selection', icon: Package },
    { id: 2, title: 'Customer Info', icon: User },
    { id: 3, title: 'Sale Details', icon: Calendar },
    { id: 4, title: 'Review & Submit', icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-slow">
          <FileText className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Sales Report Submission
        </h1>
        <p className="text-gray-600 text-lg">Complete CRM form for sales tracking and analysis</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-3 ${index !== steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : isActive 
                        ? 'bg-blue-500 text-white shadow-lg animate-pulse' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="hidden md:block">
                    <p className={`font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Product Selection */}
        {currentStep === 1 && (
          <div className="card animate-fadeIn">
            <div className="flex items-center mb-6">
              <Package className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Product Selection</h2>
            </div>
            
            {/* Product Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="input-field"
                placeholder="Search by product name, category, or model..."
              />
            </div>

            {/* Product Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Product *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      formData.productId === product.id
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <span className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Category: {product.category}</p>
                    <p className="text-sm text-gray-600">Model: {product.model}</p>
                  </div>
                ))}
              </div>
            </div>

            {formData.productId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {formData.productId && (
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{(formData.quantity * formData.unitPrice).toFixed(2)}</span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-semibold text-gray-900">After Discount:</span>
                    <span className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Customer Information */}
        {currentStep === 2 && (
          <div className="card animate-fadeIn">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Customer Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Full name"
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="input-field pl-10"
                    placeholder="customer@email.com"
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="input-field pl-10"
                    placeholder="+91 9876543210"
                   maxLength={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.customerCompany}
                    onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Company name"
                   maxLength={100}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <textarea
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    className="input-field pl-10"
                    rows={3}
                    placeholder="Customer address"
                   maxLength={500}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Sale Details */}
        {currentStep === 3 && (
          <div className="card animate-fadeIn">
            <div className="flex items-center mb-6">
              <Calendar className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Sale Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sale Date *
                </label>
                <input
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method *
                </label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="input-field pl-10"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Status *
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lead Source
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                  className="input-field"
                >
                  <option value="direct">Direct</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="email_campaign">Email Campaign</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="trade_show">Trade Show</option>
                  <option value="advertisement">Advertisement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="relative">
                  <Star className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-field pl-10"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Territory
                </label>
                <input
                  type="text"
                  value={formData.territory}
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                  className="input-field"
                  placeholder="Sales territory"
                 maxLength={1000}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-gray-700">Follow-up Required</span>
              </label>
              
              {formData.followUpRequired && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              )}
            </div>


          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes & Comments
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="Additional notes, customer feedback, or special instructions..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Card */}
            <div className="card bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 text-green-600 mr-3" />
                Sale Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-semibold">{formData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-semibold">{formData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-semibold">₹{formData.unitPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{(formData.quantity * formData.unitPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-semibold text-red-600">-₹{formData.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-900 font-bold">Total Amount:</span>
                    <span className="font-bold text-green-600">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission (5%):</span>
                    <span className="font-semibold text-blue-600">₹{commission.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentStep === 1}
          >
            Previous
          </button>

          <div className="flex space-x-4">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !formData.productId) {
                    alert('Please select a product first');
                    return;
                  }
                  setCurrentStep(Math.min(4, currentStep + 1));
                }}
                className="btn-primary"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-success flex items-center space-x-2 px-8"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Submit Sales Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
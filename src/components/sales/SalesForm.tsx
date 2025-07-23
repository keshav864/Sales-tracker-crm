import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { SalesRecord, User } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface SalesFormProps {
  currentUser: User;
  onSalesAdd: (sale: SalesRecord) => void;
}

export const SalesForm: React.FC<SalesFormProps> = ({ currentUser, onSalesAdd }) => {
  const [formData, setFormData] = useState({
    productName: '',
    quantity: 1,
    unitPrice: 0,
    customer: '',
    category: 'product',
    date: formatDate(new Date()),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSale: SalesRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      date: formData.date,
      productName: formData.productName,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount: formData.quantity * formData.unitPrice,
      customer: formData.customer,
      category: formData.category,
    };

    onSalesAdd(newSale);
    
    // Reset form
    setFormData({
      productName: '',
      quantity: 1,
      unitPrice: 0,
      customer: '',
      category: 'product',
      date: formatDate(new Date()),
    });
  };

  const totalAmount = formData.quantity * formData.unitPrice;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Record New Sale</h3>
        <p className="text-gray-600">Add a new sales transaction to track performance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Product/Service Name
            </label>
            <input
              id="productName"
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="input-field"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
              required
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="subscription">Subscription</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-2">
              Unit Price ($)
            </label>
            <input
              id="unitPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
              className="input-field"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <input
              id="customer"
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="input-field"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Sale Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
        >
          <Plus className="w-5 h-5" />
          <span>Add Sale Record</span>
        </button>
      </form>
    </div>
  );
};
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    id: String,
    name: String,
    priceRange: String,
    quantity: Number
  }],
  total: { type: String, required: true },
  timestamp: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true, default: 'COMPLETED' },
  status: { type: String, default: 'PROCESSING' },
  deliverySlot: { type: String, default: '' },
  address: { type: String, default: '' }
});

// Compound indexes for ultra-fast query performance (1 Lakh users)
orderSchema.index({ user: 1, timestamp: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ timestamp: -1 });

export const Order = mongoose.model('Order', orderSchema);

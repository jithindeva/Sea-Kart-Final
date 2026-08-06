import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  localName: { type: String, default: '' },
  priceRange: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  isOutOfStock: { type: Boolean, default: false }
});

export const Product = mongoose.model('Product', productSchema);

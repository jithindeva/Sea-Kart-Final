import mongoose from 'mongoose';
import { Product } from './src/models/Product';
import { products } from '../sea-kart/src/data/products';

const MONGO_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/seakart';

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  
  console.log('Clearing existing products...');
  await Product.deleteMany({});
  
  console.log('Seeding products...');
  for (const product of products) {
    const newProduct = new Product({
      id: product.id,
      name: product.name,
      localName: product.localName || '',
      priceRange: product.priceRange,
      image: product.image,
      category: product.category,
    });
    await newProduct.save();
  }

  console.log(`Seeded ${products.length} products successfully.`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    mongoose.disconnect();
  });

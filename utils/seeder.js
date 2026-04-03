// Removes existing data and populates default placeholder data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { products } from '../data/products.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config({ path: './backend/dev.env' });

connectDB();

const importData = async () => {
  try {
    // Clear existing products
    await Product.deleteMany();

    // --- TODO :- IMPORTANT: PASTE YOUR ADMIN USER ID HERE ---
    const adminUserId = '691f14a6213271c5e7e3d01c';

    const sampleProducts = products.map(product => {
      return { ...product, createdBy: adminUserId };
    });

    await Product.insertMany(sampleProducts);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('✅ Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Check for command line arguments to decide whether to import or destroy
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
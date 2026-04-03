// Test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bhakti-bhoomi';

const testConnection = async () => {
  console.log('🧪 Testing MongoDB Connection...\n');
  console.log('Connection String:', process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Ready State: ${conn.connection.readyState}`);
    
    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    console.error('Error Code:', error.code);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if MongoDB Atlas cluster is running and not paused');
    console.log('2. Verify your IP address is whitelisted (0.0.0.0/0 for testing)');
    console.log('3. Check username/password are correct and URL-encoded');
    console.log('4. Ensure the database user has read/write permissions');
    console.log('5. Try connecting from MongoDB Compass or mongosh');
    
    process.exit(1);
  }
};

testConnection();


const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    // console.log("Herereeererererere --- ", MONGODB_URI);
    // While seeding - paste URI below manually.
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('⚠️  Server will continue running without database connection');
    console.log('📋 Troubleshooting steps:');
    console.log('1. Check if MongoDB Atlas cluster is running');
    console.log('2. Verify your IP is whitelisted in MongoDB Atlas');
    console.log('3. Check if username/password are correct');
    console.log('4. Ensure the database name is correct');
    // Don't exit the process, let the server continue
  }
};

module.exports = connectDB;







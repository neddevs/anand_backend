const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bhakti-bhoomi');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Test database operations
const testDatabase = async () => {
  try {
    console.log('\n🔍 Testing Database Operations...\n');

    // 1. Count total users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

    // 2. Get all users (without passwords)
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    console.log('\n👥 All Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`   Last Login: ${user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log('');
    });

    // 3. Find users by role
    const adminUsers = await User.find({ role: 'admin' }).select('-password');
    console.log(`👑 Admin users: ${adminUsers.length}`);

    // 4. Find recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.find({ 
      createdAt: { $gte: sevenDaysAgo } 
    }).select('-password');
    console.log(`🆕 Recent registrations (last 7 days): ${recentUsers.length}`);

    // 5. Find users with verified emails
    const verifiedUsers = await User.find({ isEmailVerified: true }).select('-password');
    console.log(`✅ Verified users: ${verifiedUsers.length}`);

    // 6. Find locked accounts
    const lockedUsers = await User.find({ 
      lockUntil: { $gt: new Date() } 
    }).select('-password');
    console.log(`🔒 Locked accounts: ${lockedUsers.length}`);

    // 7. Get user statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
          adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          priestUsers: { $sum: { $cond: [{ $eq: ['$role', 'priest'] }, 1, 0] } }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('\n📈 User Statistics:');
      console.log(`   Total Users: ${stats[0].totalUsers}`);
      console.log(`   Active Users: ${stats[0].activeUsers}`);
      console.log(`   Verified Users: ${stats[0].verifiedUsers}`);
      console.log(`   Admin Users: ${stats[0].adminUsers}`);
      console.log(`   Priest Users: ${stats[0].priestUsers}`);
    }

    // 8. Test password validation (find a user and test password)
    const testUser = await User.findOne().select('+password');
    if (testUser) {
      console.log(`\n🔐 Testing password validation for: ${testUser.email}`);
      const isValidPassword = await testUser.comparePassword('test123');
      console.log(`   Password 'test123' is valid: ${isValidPassword ? 'Yes' : 'No'}`);
    }

    console.log('\n✅ Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test error:', error.message);
  }
};

// Test user creation
const createTestUser = async () => {
  try {
    console.log('\n🧪 Creating test user...');
    
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@bhaktibhoomi.com',
      password: 'TestPassword123',
      phone: '+919876543210',
      role: 'user',
      spiritualProfile: {
        interests: ['meditation', 'yoga', 'pooja'],
        experience: 'intermediate',
        favoriteDeities: ['Krishna', 'Shiva'],
        spiritualGoals: ['Inner peace', 'Self-realization']
      }
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.fullName}`);
    console.log(`   Role: ${testUser.role}`);

  } catch (error) {
    if (error.code === 11000) {
      console.log('ℹ️  Test user already exists');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createTestUser();
  await testDatabase();
  process.exit(0);
};

// Run the test
main().catch(console.error);

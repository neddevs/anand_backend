const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api';

// Test data
const testUser = {
  firstName: 'API',
  lastName: 'Test',
  email: 'apitest@bhaktibhoomi.com',
  password: 'ApiTest123',
  phone: '+919876543210'
};

const loginCredentials = {
  email: 'apitest@bhaktibhoomi.com',
  password: 'ApiTest123'
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('🔍 Testing Health Check...');
  const result = await apiCall('GET', '/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log(`   Message: ${result.data.message}`);
    console.log(`   Environment: ${result.data.environment}`);
  } else {
    console.log('❌ Health check failed:', result.error);
  }
  console.log('');
};

const testUserRegistration = async () => {
  console.log('🔍 Testing User Registration...');
  const result = await apiCall('POST', '/auth/register', testUser);
  
  if (result.success) {
    console.log('✅ User registration successful');
    console.log(`   User ID: ${result.data.data.user.id}`);
    console.log(`   Name: ${result.data.data.user.fullName}`);
    console.log(`   Email: ${result.data.data.user.email}`);
    console.log(`   Token: ${result.data.data.token.substring(0, 20)}...`);
    return result.data.data.token;
  } else {
    console.log('❌ User registration failed:', result.error);
    return null;
  }
  console.log('');
};

const testUserLogin = async () => {
  console.log('🔍 Testing User Login...');
  const result = await apiCall('POST', '/auth/login', loginCredentials);
  
  if (result.success) {
    console.log('✅ User login successful');
    console.log(`   User ID: ${result.data.data.user.id}`);
    console.log(`   Name: ${result.data.data.user.fullName}`);
    console.log(`   Last Login: ${result.data.data.user.lastLogin}`);
    console.log(`   Token: ${result.data.data.token.substring(0, 20)}...`);
    return result.data.data.token;
  } else {
    console.log('❌ User login failed:', result.error);
    return null;
  }
  console.log('');
};

const testGetCurrentUser = async (token) => {
  console.log('🔍 Testing Get Current User...');
  const result = await apiCall('GET', '/auth/me', null, token);
  
  if (result.success) {
    console.log('✅ Get current user successful');
    console.log(`   User ID: ${result.data.data.user.id}`);
    console.log(`   Name: ${result.data.data.user.fullName}`);
    console.log(`   Email: ${result.data.data.user.email}`);
    console.log(`   Role: ${result.data.data.user.role}`);
    console.log(`   Created: ${result.data.data.user.createdAt}`);
  } else {
    console.log('❌ Get current user failed:', result.error);
  }
  console.log('');
};

const testUpdateProfile = async (token) => {
  console.log('🔍 Testing Update Profile...');
  const updateData = {
    firstName: 'Updated',
    lastName: 'Name',
    phone: '+91-9999999999',
    spiritualProfile: {
      interests: ['meditation', 'yoga', 'scripture'],
      experience: 'advanced',
      favoriteDeities: ['Krishna', 'Rama', 'Shiva'],
      spiritualGoals: ['Moksha', 'Self-realization', 'Service to humanity']
    }
  };
  
  const result = await apiCall('PUT', '/auth/profile', updateData, token);
  
  if (result.success) {
    console.log('✅ Profile update successful');
    console.log(`   Updated Name: ${result.data.data.user.fullName}`);
    console.log(`   Updated Phone: ${result.data.data.user.phone}`);
    console.log(`   Spiritual Interests: ${result.data.data.user.spiritualProfile.interests.join(', ')}`);
    console.log(`   Experience Level: ${result.data.data.user.spiritualProfile.experience}`);
  } else {
    console.log('❌ Profile update failed:', result.error);
  }
  console.log('');
};

const testInvalidLogin = async () => {
  console.log('🔍 Testing Invalid Login...');
  const invalidCredentials = {
    email: 'apitest@bhaktibhoomi.com',
    password: 'WrongPassword'
  };
  
  const result = await apiCall('POST', '/auth/login', invalidCredentials);
  
  if (!result.success) {
    console.log('✅ Invalid login correctly rejected');
    console.log(`   Error: ${result.error}`);
  } else {
    console.log('❌ Invalid login should have been rejected');
  }
  console.log('');
};

const testProtectedRoute = async (token) => {
  console.log('🔍 Testing Protected Route Access...');
  
  // Test with valid token
  const result1 = await apiCall('GET', '/auth/me', null, token);
  if (result1.success) {
    console.log('✅ Protected route accessible with valid token');
  } else {
    console.log('❌ Protected route not accessible with valid token');
  }
  
  // Test without token
  const result2 = await apiCall('GET', '/auth/me');
  if (!result2.success) {
    console.log('✅ Protected route correctly blocked without token');
  } else {
    console.log('❌ Protected route should be blocked without token');
  }
  console.log('');
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting API Tests...\n');
  
  // Test health check
  await testHealthCheck();
  
  // Test user registration
  const registrationToken = await testUserRegistration();
  
  // Test user login
  const loginToken = await testUserLogin();
  
  // Use the token from login for further tests
  const token = loginToken || registrationToken;
  
  if (token) {
    // Test get current user
    await testGetCurrentUser(token);
    
    // Test update profile
    await testUpdateProfile(token);
    
    // Test protected route access
    await testProtectedRoute(token);
  }
  
  // Test invalid login
  await testInvalidLogin();
  
  console.log('✅ All API tests completed!');
};

// Run tests
runTests().catch(console.error);

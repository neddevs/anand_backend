const subscriptionPlans = {
  plus: {
    id: 'plan_plus',
    name: 'Bhakti Yoga - Plus',
    price: 499, // Price in INR
    durationMonths: 6,
  },
  premium: {
    id: 'plan_premium',
    name: 'Bhakti Yoga - Premium',
    price: 2499,
    durationMonths: null, // null means lifetime
  }
};

module.exports = subscriptionPlans;
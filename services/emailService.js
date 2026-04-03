const { Resend } = require('resend');

// Initialize Resend with your API key from the environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// This helper function creates your beautiful Pooja Booking email template.
// It remains completely unchanged.
function createBookingEmailContent({ bookingId, devoteeName, poojaType, temple, poojaDate, poojaTime, specialRequests }) {
  const templeNames = {
    'tirupati': 'Tirupati Balaji Temple, Andhra Pradesh',
    'varanasi': 'Kashi Vishwanath Temple, Varanasi',
    'jagannath': 'Jagannath Temple, Puri',
    'somnath': 'Somnath Temple, Gujarat',
    'golden-temple': 'Golden Temple, Amritsar',
    'meenakshi': 'Meenakshi Temple, Madurai',
    'rameshwaram': 'Ramanathaswamy Temple, Rameshwaram',
    'badrinath': 'Badrinath Temple, Uttarakhand',
    'kedarnath': 'Kedarnath Temple, Uttarakhand',
    'gangotri': 'Gangotri Temple, Uttarakhand',
    'yamunotri': 'Yamunotri Temple, Uttarakhand',
    'vaishno-devi': 'Vaishno Devi Temple, Jammu',
    'siddhivinayak': 'Siddhivinayak Temple, Mumbai',
    'shirdi': 'Shirdi Sai Baba Temple, Maharashtra',
    'sabarimala': 'Sabarimala Temple, Kerala',
    'bagalamukhi': 'Maa Bagalamukhi Temple, Haridwar',
    'kalighat': 'Kalighat Temple, Kolkata',
    'vindhyvasini': 'Maa Vindhyvasini',
    'loknath': 'Loknath Temple, Puri',
    'lingaraj': 'Lingaraj Temple, Bhubaneswar'
  };

  const templeName = templeNames[temple] || temple;
  const formattedDate = new Date(poojaDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = new Date(`2000-01-01T${poojaTime}`).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pooja Booking Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #8B4513;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .booking-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .booking-details h2 {
            color: #8B4513;
            margin-top: 0;
            font-size: 20px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: bold;
            color: #495057;
          }
          .detail-value {
            color: #212529;
          }
          .booking-id {
            background-color: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 5px;
            padding: 10px;
            text-align: center;
            margin: 20px 0;
          }
          .booking-id strong {
            color: #1976d2;
            font-size: 18px;
          }
          .next-steps {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .next-steps h3 {
            color: #856404;
            margin-top: 0;
          }
          .next-steps ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .next-steps li {
            margin: 8px 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .om-symbol {
            font-size: 24px;
            color: #8B4513;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🙏 Pooja Booking Confirmed</h1>
            <p>Your sacred ceremony has been successfully booked</p>
          </div>

          <div class="booking-id">
            <strong>Booking ID: ${bookingId}</strong>
          </div>

          <div class="booking-details">
            <h2>Booking Details</h2>
            <div class="detail-row">
              <span class="detail-label">Devotee Name:</span>
              <span class="detail-value">${devoteeName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pooja Type:</span>
              <span class="detail-value">${poojaType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Temple:</span>
              <span class="detail-value">${templeName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${formattedTime}</span>
            </div>
            ${specialRequests ? `
            <div class="detail-row">
              <span class="detail-label">Special Requests:</span>
              <span class="detail-value">${specialRequests}</span>
            </div>
            ` : ''}
          </div>

          <div class="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>You will receive a live streaming link 30 minutes before your pooja time</li>
              <li>Please join the live stream 5 minutes before the scheduled time</li>
              <li>Ensure you have a stable internet connection for the best experience</li>
              <li>You can participate in the pooja from the comfort of your home</li>
            </ul>
          </div>

          <div class="footer">
            <p>
              <span class="om-symbol">ॐ</span>
              May the divine blessings be with you
              <span class="om-symbol">ॐ</span>
            </p>
            <p>Thank you for choosing Anandmaya for your spiritual journey</p>
            <p>For any queries, please contact us at support@anandmaya.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
Pooja Booking Confirmation

Dear ${devoteeName},

Your pooja booking has been confirmed successfully!

Booking ID: ${bookingId}

Booking Details:
- Pooja Type: ${poojaType}
- Temple: ${templeName}
- Date: ${formattedDate}
- Time: ${formattedTime}
${specialRequests ? `- Special Requests: ${specialRequests}` : ''}

What's Next?
- You will receive a live streaming link 30 minutes before your pooja time
- Please join the live stream 5 minutes before the scheduled time
- Ensure you have a stable internet connection for the best experience
- You can participate in the pooja from the comfort of your home

May the divine blessings be with you!

Thank you for choosing Anandmaya for your spiritual journey.
For any queries, please contact us at support@anandmaya.com
    `;

  return { html, text };
}


class EmailService {
  async sendPoojaBookingConfirmation(bookingData) {
    try {
      const emailContent = createBookingEmailContent(bookingData);
      await resend.emails.send({
        from: `Anandmaya <${process.env.SENDER_EMAIL}>`,
        to: bookingData.email,
        subject: `Pooja Booking Confirmed - ${bookingData.bookingId}`,
        html: emailContent.html,
      });
      console.log(`✅ Confirmation email sent successfully to ${bookingData.email}`);
      return { success: true };
    } catch (error) {
      console.error('Resend email sending failed:', error);
      throw new Error('Failed to send confirmation email.');
    }
  }

  async sendAdminNotification(bookingData) {
    try {
      const { devoteeName, email, poojaType, temple, poojaDate, poojaTime } = bookingData;
      await resend.emails.send({
        from: `Anandmaya Notifier <${process.env.SENDER_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Pooja Booking - ${devoteeName}`,
        html: `
          <h2>New Pooja Booking Received</h2>
          <p><strong>Devotee:</strong> ${devoteeName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Pooja Type:</strong> ${poojaType}</p>
          <p><strong>Temple:</strong> ${temple}</p>
          <p><strong>Date & Time:</strong> ${new Date(poojaDate).toLocaleDateString()} at ${poojaTime}</p>
          <p>This booking has been successfully paid for.</p>
        `,
      });
      console.log(`✅ Admin notification sent successfully.`);
      return { success: true };
    } catch (error) {
      console.error('Resend admin notification failed:', error);
      return { success: false };
    }
  }

  async sendStoreOrderConfirmation(orderData) {
    try {
      const { user, orderItems, totalAmount, shippingAddress } = orderData;
      const itemsHtml = orderItems.map(item => `<tr><td>${item.name} (x${item.quantity})</td><td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('');
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h1 style="color: #8B4513;">🛍️ Thank You for Your Order!</h1>
          <p>Dear ${user.fullName || shippingAddress.name}, your order has been successfully placed.</p>
          
          <h3>Order Summary (ID: ${orderData._id})</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr style="border-top: 2px solid #ddd; font-weight: bold;">
              <td style="padding-top: 10px;">Total</td>
              <td style="text-align: right; padding-top: 10px;">₹${totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <h3 style="margin-top: 30px;">Shipping Address</h3>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            ${shippingAddress.address}<br>
            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
            ${shippingAddress.country}<br>
            Ph: ${shippingAddress.phoneNo}
          </p>

          <div style="text-align: center; margin-top: 30px; color: #777;">
            <p>We are now processing your order. You will receive another email once your items have been shipped.</p>
            <p>Thank you for shopping at Anandmaya.</p>
          </div>
        </div>
      `;
      await resend.emails.send({
        from: `Anandmaya Store <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Your Anandmaya Order is Confirmed (ID: ${orderData._id})`,
        html: html,
      });
      console.log(`✅ Store Order confirmation email sent successfully to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Resend store order email failed:', error);
      throw new Error('Failed to send store order confirmation email.');
    }
  }

  async sendStatusUpdateNotification(details) {
    try {
      const { email, userName, entityType, entityId, newStatus, entityName } = details;
      // Customize message based on the entity type and new status
      let statusMessage = `The status of your ${entityType} for "${entityName}" (ID: ${entityId}) has been updated to:`;
      
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h1 style="color: #8B4513;">🔔 Update on Your Anandmaya ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}</h1>
          <p>Dear ${userName},</p>
          <p>${statusMessage}</p>
          <div style="background: #e3f2fd; border-left: 5px solid #2196f3; padding: 15px; margin: 20px 0;">
            <p style="font-size: 1.5rem; font-weight: bold; margin: 0; text-transform: capitalize;">${newStatus}</p>
          </div>
          ${newStatus.toLowerCase() === 'shipped' ? '<p>Your items are on their way!</p>' : ''}
          ${newStatus.toLowerCase() === 'completed' ? '<p>We hope you had a blessed experience.</p>' : ''}
          <div style="text-align: center; margin-top: 30px; color: #777;">
            <p>Thank you for choosing Anandmaya.</p>
          </div>
        </div>
      `;
      await resend.emails.send({
        from: `Anandmaya Updates <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: `Update on your ${entityType}: ${entityId}`,
        html: html,
      });
      console.log(`✅ Status update email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Resend status update email failed:', error);
      throw new Error('Failed to send status update email.');
    }
  }

  async sendSubscriptionConfirmation(data) {
    try {
      const { user, plan } = data;
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h1 style="color: #8B4513;">Subscription Activated!</h1>
          <p>Dear ${user.fullName},</p>
          <p>Thank you for subscribing! Your <strong>${plan.name}</strong> plan is now active.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Plan:</strong> ${plan.name}</p>
            <p><strong>Access:</strong> ${plan.durationMonths ? `${plan.durationMonths} Months` : 'Lifetime'}</p>
            <p><strong>Amount Paid:</strong> ₹${plan.price}</p>
          </div>
          <div style="margin-top: 20px;">
            <p>You can now access all the exclusive content available under your plan. Dive into your spiritual journey by exploring our Bhakti Yoga courses.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bhakti-yoga" style="display: inline-block; padding: 12px 20px; background-color: #8B4513; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              Explore Courses
            </a>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #777;">
            <p>ॐ May your journey be enlightening ॐ</p>
            <p>Thank you for being a part of the Anandmaya community.</p>
          </div>
        </div>
      `;
      await resend.emails.send({
        from: `Anandmaya <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Your Bhakti Yoga Subscription is Active!`,
        html: html,
      });
      console.log(`✅ Subscription confirmation email sent successfully to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Resend subscription email sending failed:', error);
      // Not throwing an error here as the payment has already succeeded.
    }
  }

  async sendPasswordResetEmail(user, resetUrl) {
    try {
      const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
            <h1 style="color: #8B4513;">Password Reset Request</h1>
            <p>You are receiving this email because you (or someone else) have requested the reset of a password for your account.</p>
            <p>Please click on the button below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            <p style="margin-top: 20px;">This link will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          </div>
        `;
      await resend.emails.send({
        from: `Anandmaya Support <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: html,
      });
      console.log(`Password reset email sent successfully to ${user.email}`);
      return { success: true };
    } catch (error) {
      console.error('Resend password reset email failed:', error);
      throw new Error('Failed to send password reset email.');
    }
  }
}

module.exports = new EmailService();
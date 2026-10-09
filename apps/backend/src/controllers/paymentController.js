import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Transaction } from '../models/Transaction.js';

// Initialize Razorpay
// If env vars are missing, we fall back to a mock for development gracefully
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("WARNING: Razorpay keys not found in .env. Falling back to test keys for development.");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_123',
  });
};

export const createOrder = async (req, res, next) => {
  try {
    const { amount, type, referenceId } = req.body;
    
    if (!amount || !type) {
      return res.status(400).json({ success: false, message: 'Amount and type are required' });
    }

    const instance = getRazorpayInstance();

    const options = {
      amount: amount * 100, // Razorpay amount is in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    // Record the pending transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      referenceId,
      amount,
      razorpayOrderId: order.id,
      status: 'PENDING'
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_123',
        transactionId: transaction._id
      }
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_123';
    
    // Creating hmac object 
    let hmac = crypto.createHmac('sha256', secret);
    
    // Passing the data to be hashed
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    
    // Creating the hmac in the required format
    const generated_signature = hmac.digest('hex');
    
    if (razorpay_signature === generated_signature) {
      // Payment is successful
      await Transaction.findByIdAndUpdate(transactionId, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'SUCCESS'
      });

      // Here you could add specific logic based on transaction.type 
      // e.g., if type === 'CROWDFUNDING', update the project's raised amount.

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      await Transaction.findByIdAndUpdate(transactionId, {
        status: 'FAILED'
      });
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    next(error);
  }
};

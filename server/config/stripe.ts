import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
// Make sure STRIPE_SECRET_KEY is set in the environment
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Default success and cancel URLs
export const DEFAULT_SUCCESS_URL = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/payment/success`;
export const DEFAULT_CANCEL_URL = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/payment/cancel`;
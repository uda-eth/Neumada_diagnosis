import Stripe from 'stripe';
import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe with the secret key
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Create a Payment Intent
export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { amount, currency = 'usd', paymentMethodType = 'card' } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create a Payment Intent using Stripe API
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: [paymentMethodType],
      metadata: {
        // Add any additional metadata needed
        userId: req.user?.id ? req.user.id.toString() : ''
      }
    });

    // Return client secret and payment intent ID
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
}

// Create or retrieve Stripe customer for a user
export async function getOrCreateCustomer(userId: number) {
  try {
    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    
    if (!userResult.length) {
      throw new Error('User not found');
    }
    
    const user = userResult[0];
    
    // If user already has a Stripe customer ID, return it
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }
    
    // Otherwise, create a new Stripe customer
    const customer = await stripeClient.customers.create({
      email: user.email,
      name: user.fullName || user.username,
      metadata: {
        userId: user.id.toString()
      }
    });
    
    // Update user with Stripe customer ID
    await db.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, userId));
    
    return customer.id;
  } catch (error) {
    console.error('Error creating/retrieving Stripe customer:', error);
    throw error;
  }
}

// Create a subscription
export async function createSubscription(req: Request, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    
    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(userId);
    
    // Get payment method ID from the request
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }
    
    // Attach payment method to customer
    await stripeClient.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    
    // Set as default payment method
    await stripeClient.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Create the subscription
    // Replace "price_xxxx" with your actual price ID from Stripe dashboard
    const subscription = await stripeClient.subscriptions.create({
      customer: customerId,
      items: [{ price: 'price_premium_monthly' }], // This price ID needs to be created in Stripe dashboard
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Update user as premium in database
    await db.update(users)
      .set({ 
        isPremium: true,
        premiumSince: new Date(),
        stripeSubscriptionId: subscription.id
      })
      .where(eq(users.id, userId));
    
    res.status(200).json({
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get subscription details
export async function getSubscription(req: Request, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    
    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    
    if (!userResult.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult[0];
    
    // If user doesn't have a subscription, return null
    if (!user.stripeSubscriptionId) {
      return res.status(200).json({ 
        subscription: null,
        isPremium: false
      });
    }
    
    // Get subscription details from Stripe
    const subscription = await stripeClient.subscriptions.retrieve(user.stripeSubscriptionId);
    
    res.status(200).json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      },
      isPremium: user.isPremium || false
    });
  } catch (error: any) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: error.message });
  }
}

// Cancel a subscription
export async function cancelSubscription(req: Request, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    
    // Get user from database
    const userResult = await db.select().from(users).where(eq(users.id, userId));
    
    if (!userResult.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult[0];
    
    // If user doesn't have a subscription, return error
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    
    // Cancel subscription in Stripe (at period end)
    const subscription = await stripeClient.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
    
    res.status(200).json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
}

// Stripe webhook handler
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  
  if (!sig) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }
  
  try {
    // This would require setting up a webhook secret in Stripe dashboard
    // and setting STRIPE_WEBHOOK_SECRET as an environment variable
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
    
    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        // Handle subscription created
        break;
      case 'customer.subscription.updated':
        // Handle subscription updated
        break;
      case 'customer.subscription.deleted':
        // Handle subscription canceled or expired
        const subscription = event.data.object as Stripe.Subscription;
        const customerMetadata = subscription.customer as string;
        
        // Find user with this customer ID
        const userResult = await db.select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerMetadata));
        
        if (userResult.length) {
          // Update user as not premium
          await db.update(users)
            .set({ 
              isPremium: false,
              stripeSubscriptionId: null
            })
            .where(eq(users.id, userResult[0].id));
        }
        break;
      case 'payment_intent.succeeded':
        // Handle payment success
        break;
      case 'payment_intent.payment_failed':
        // Handle payment failure
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error);
    res.status(400).json({ error: error.message });
  }
}

// Create setup intent for saving card details
export async function createSetupIntent(req: Request, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;
    
    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(userId);
    
    // Create a setup intent with automatic payment methods
    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'on_session',
    });
    
    if (!setupIntent.client_secret) {
      throw new Error('Failed to generate client secret');
    }
    
    res.status(200).json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get publishable key
export async function getPublishableKey(req: Request, res: Response) {
  res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
}
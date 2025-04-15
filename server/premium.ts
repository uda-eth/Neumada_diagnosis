import { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import { db } from './db';
import { users, sessions, payments } from './db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from './middleware/auth.middleware';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Get premium status for the current user
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPremium = user.isPremium || false;
    
    // Get payment history if premium
    let subscription = null;
    if (isPremium) {
      const paymentRecord = await db.query.payments.findFirst({
        where: eq(payments.userId, userId),
        orderBy: (payments, { desc }) => [desc(payments.createdAt)],
      });
      
      if (paymentRecord?.stripeSubscriptionId) {
        try {
          subscription = await stripe.subscriptions.retrieve(paymentRecord.stripeSubscriptionId);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      }
    }

    return res.json({
      isPremium,
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000, // Convert to milliseconds
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null
    });
  } catch (error) {
    console.error('Error fetching premium status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a checkout session for premium subscription
router.post('/create-checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPremium) {
      return res.status(400).json({ message: 'User already has premium subscription' });
    }

    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ message: 'Price ID is required' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/premium?canceled=true`,
      client_reference_id: userId,
      customer_email: user.email,
      metadata: {
        userId: userId
      }
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify checkout session and update user's premium status
router.get('/verify-checkout', async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Retrieve the checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!checkoutSession || checkoutSession.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const userId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in checkout session' });
    }

    // Update user's premium status
    await db.update(users)
      .set({ isPremium: true })
      .where(eq(users.id, userId));

    // Store payment information
    await db.insert(payments).values({
      userId: userId,
      stripeCustomerId: checkoutSession.customer as string,
      stripeSubscriptionId: checkoutSession.subscription as string,
      stripeCheckoutSessionId: session_id,
      amount: checkoutSession.amount_total || 0,
      currency: checkoutSession.currency || 'usd',
      status: 'completed',
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error verifying checkout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const paymentRecord = await db.query.payments.findFirst({
      where: eq(payments.userId, userId),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    if (!paymentRecord?.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(paymentRecord.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
import { db } from "@db";
import { subscriptions, subscriptionPayments, users } from "@db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

/**
 * Records a payment for a subscription
 * @param subscriptionId The database ID of the subscription
 * @param userId The user ID
 * @param invoice The Stripe invoice object
 * @param paymentIntent The Stripe payment intent (if available)
 */
export async function recordSubscriptionPayment(
  subscriptionId: number,
  userId: number,
  invoice: Stripe.Invoice,
  paymentIntent?: Stripe.PaymentIntent | null
) {
  try {
    // Get payment details
    const amount = invoice.amount_paid;
    const currency = invoice.currency;
    const status = invoice.status;
    const stripeInvoiceId = invoice.id;
    const billingReason = invoice.billing_reason;
    const periodStart = new Date(invoice.period_start * 1000);
    const periodEnd = new Date(invoice.period_end * 1000);
    
    // Get payment method if available
    let paymentMethod = null;
    let receiptUrl = null;
    
    if (paymentIntent) {
      // Get last 4 digits of card if available
      const card = paymentIntent.charges?.data[0]?.payment_method_details?.card;
      if (card) {
        paymentMethod = `${card.brand}_${card.last4}`;
      }
      
      // Get receipt URL if available
      receiptUrl = paymentIntent.charges?.data[0]?.receipt_url || null;
    }
    
    // Insert payment record
    const [payment] = await db.insert(subscriptionPayments).values({
      subscriptionId,
      userId,
      stripeInvoiceId,
      stripePaymentIntentId: paymentIntent?.id,
      amount,
      currency,
      status,
      billingReason,
      periodStart,
      periodEnd,
      paymentMethod,
      receiptUrl,
    }).returning();
    
    console.log(`Recorded subscription payment for user ${userId}, amount: ${amount/100} ${currency}`);
    return payment;
  } catch (error) {
    console.error('Error recording subscription payment:', error);
    throw error;
  }
}

/**
 * Get payment history for a user
 * @param userId The user ID
 * @returns Array of payment records
 */
export async function getUserPaymentHistory(userId: number) {
  try {
    const payments = await db.query.subscriptionPayments.findMany({
      where: eq(subscriptionPayments.userId, userId),
      orderBy: (subscriptionPayments, { desc }) => [desc(subscriptionPayments.createdAt)],
    });
    
    return payments;
  } catch (error) {
    console.error('Error fetching user payment history:', error);
    throw error;
  }
}

/**
 * Get payment history for a subscription
 * @param subscriptionId The subscription ID
 * @returns Array of payment records
 */
export async function getSubscriptionPaymentHistory(subscriptionId: number) {
  try {
    const payments = await db.query.subscriptionPayments.findMany({
      where: eq(subscriptionPayments.subscriptionId, subscriptionId),
      orderBy: (subscriptionPayments, { desc }) => [desc(subscriptionPayments.createdAt)],
    });
    
    return payments;
  } catch (error) {
    console.error('Error fetching subscription payment history:', error);
    throw error;
  }
}

/**
 * Get subscription details with payment information
 * @param subscriptionId The subscription ID
 * @returns Subscription with payment history
 */
export async function getSubscriptionWithPayments(subscriptionId: number) {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.id, subscriptionId),
    });
    
    if (!subscription) {
      return null;
    }
    
    const payments = await getSubscriptionPaymentHistory(subscriptionId);
    
    return {
      ...subscription,
      payments,
    };
  } catch (error) {
    console.error('Error fetching subscription with payments:', error);
    throw error;
  }
}

/**
 * Check if a subscription is active
 * @param userId The user ID
 * @returns Boolean indicating if user has an active subscription
 */
export async function hasActiveSubscription(userId: number): Promise<boolean> {
  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: (subscriptions, { and, eq }) => and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, 'active')
      ),
    });
    
    return !!subscription;
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
}

/**
 * Get all recent payment stats (for admin dashboard)
 */
export async function getPaymentStats() {
  try {
    // Get total payment amount in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPayments = await db.query.subscriptionPayments.findMany({
      where: (subscriptionPayments, { gte }) => gte(subscriptionPayments.createdAt, thirtyDaysAgo),
    });
    
    // Calculate total revenue
    const totalRevenue = recentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Get count of active subscriptions
    const activeSubscriptionsCount = await db.query.subscriptions.findMany({
      where: eq(subscriptions.status, 'active'),
    }).then(subs => subs.length);
    
    // Get count of premium users
    const premiumUsersCount = await db.query.users.findMany({
      where: eq(users.isPremium, true),
    }).then(users => users.length);
    
    return {
      recentPaymentsCount: recentPayments.length,
      totalRevenue: totalRevenue / 100, // Convert cents to dollars
      activeSubscriptionsCount,
      premiumUsersCount,
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    throw error;
  }
} 
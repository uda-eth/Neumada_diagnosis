
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { fulfillCheckoutSession } from './checkout';

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function handleWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  try {
    // Parse and verify the webhook
    const event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        // Extract the session from the event
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Fulfill the order
        const fulfillmentResult = await fulfillCheckoutSession(session.id);
        console.log(`Fulfillment result for session ${session.id}:`, fulfillmentResult);
        
        break;
        
      case 'checkout.session.expired':
        // Handle expired checkout sessions if needed
        console.log('Checkout session expired:', event.data.object.id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    res.status(400).json({ error: error.message });
  }
}

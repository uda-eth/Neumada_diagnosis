
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { db } from '../db';
import { eventParticipants, users, events } from '../db/schema';
import { eq, and } from 'drizzle-orm';

// Initialize Stripe with the secret key
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Create a Checkout Session for purchasing event tickets
export async function createCheckoutSession(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { eventId, quantity = 1 } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Get the event details
    const eventResult = await db.select().from(events).where(eq(events.id, eventId));
    
    if (!eventResult.length) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult[0];
    
    // Ensure the event has a price and stripe product ID
    if (!event.price || !event.stripeProductId || !event.stripePriceId) {
      return res.status(400).json({ error: 'Event is not configured for payments' });
    }

    // Get or create a customer for the user
    const userResult = await db.select().from(users).where(eq(users.id, req.user.id));
    
    if (!userResult.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult[0];
    
    // Get or create a Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripeClient.customers.create({
        email: user.email,
        name: user.fullName || user.username,
        metadata: {
          userId: user.id.toString()
        }
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, req.user.id));
    }

    // Create a Checkout Session
    const session = await stripeClient.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: event.stripePriceId,
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/event/${eventId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/event/${eventId}`,
      metadata: {
        eventId: eventId.toString(),
        userId: req.user.id.toString(),
        quantity: quantity.toString(),
      },
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}

// Fulfill a Checkout Session
export async function fulfillCheckoutSession(sessionId: string): Promise<{ success: boolean, message: string }> {
  try {
    // Retrieve the checkout session with line items expanded
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    // Verify payment status
    if (session.payment_status === 'unpaid') {
      return { success: false, message: 'Payment not completed' };
    }

    // Extract metadata
    const eventId = parseInt(session.metadata?.eventId || '0');
    const userId = parseInt(session.metadata?.userId || '0');
    const quantity = parseInt(session.metadata?.quantity || '1');

    if (!eventId || !userId) {
      return { success: false, message: 'Missing event or user information' };
    }

    // Check if this session has already been fulfilled
    const existingParticipants = await db.select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId),
          eq(eventParticipants.paymentIntentId, session.payment_intent as string)
        )
      );

    if (existingParticipants.length > 0) {
      return { success: true, message: 'Order already fulfilled' };
    }

    // Generate a unique ticket code
    const ticketCode = `TICKET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Create participant record
    await db.insert(eventParticipants).values({
      eventId,
      userId,
      status: 'attending',
      ticketQuantity: quantity,
      purchaseDate: new Date(),
      ticketCode,
      paymentStatus: 'completed',
      paymentIntentId: session.payment_intent as string,
    });

    // Update event's attending count
    await db.update(events)
      .set({
        attendingCount: events.attendingCount + 1,
        availableTickets: events.availableTickets - quantity
      })
      .where(eq(events.id, eventId));

    return {
      success: true,
      message: 'Order fulfilled successfully'
    };
  } catch (error) {
    console.error('Error fulfilling checkout session:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error fulfilling order'
    };
  }
}

// Retrieve checkout session for verification
export async function getCheckoutSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    // If session is completed but not fulfilled, fulfill it now
    if (session.payment_status === 'paid') {
      const fulfillmentResult = await fulfillCheckoutSession(sessionId);
      
      return res.status(200).json({
        session,
        fulfillment: fulfillmentResult
      });
    }

    res.status(200).json({ session });
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}

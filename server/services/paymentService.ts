import { stripe, DEFAULT_SUCCESS_URL, DEFAULT_CANCEL_URL } from '../config/stripe';
import { db } from '../../db';
import { events, users, eventParticipants } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Creates a checkout session for an event ticket purchase
 */
export async function createCheckoutSession({
  eventId,
  userId,
  quantity = 1,
  successUrl,
  cancelUrl,
}: {
  eventId: number;
  userId: number;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
}) {
  try {
    // Get event from database
    const eventResult = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    // If event not found, throw error
    if (!eventResult) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Get user from database for metadata
    const userResult = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userResult) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // If event doesn't have a price, throw error
    if (!eventResult.price) {
      throw new Error('Event does not have a price');
    }

    // If event doesn't have Stripe product and price IDs, create them
    let productId = eventResult.stripeProductId;
    let priceId = eventResult.stripePriceId;

    if (!productId) {
      // Create a product in Stripe
      const product = await stripe.products.create({
        name: eventResult.title,
        description: eventResult.description || undefined,
        images: eventResult.image ? [eventResult.image] : undefined,
        metadata: {
          eventId: eventId.toString(),
        },
      });
      productId = product.id;

      // Update event with product ID
      await db
        .update(events)
        .set({ stripeProductId: productId })
        .where(eq(events.id, eventId));
    }

    if (!priceId) {
      // Create a price for the product
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(parseFloat(eventResult.price.toString()) * 100), // Convert to cents
        currency: 'usd',
      });
      priceId = price.id;

      // Update event with price ID
      await db
        .update(events)
        .set({ stripePriceId: priceId })
        .where(eq(events.id, eventId));
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${DEFAULT_SUCCESS_URL}?payment=success&eventId=${eventId}`,
      cancel_url: cancelUrl || `${DEFAULT_CANCEL_URL}?payment=canceled&eventId=${eventId}`,
      metadata: {
        eventId: eventId.toString(),
        userId: userId.toString(),
      },
      customer_email: userResult.email || undefined,
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Handles Stripe webhook events
 */
export async function handleStripeWebhook(event: any) {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { eventId, userId } = session.metadata;

        if (!eventId || !userId) {
          console.error('Missing metadata in checkout session');
          return;
        }

        // Record the ticket purchase in the database
        // Add user to event participants
        try {
          // You can create a tickets table or use event_participants
          // For now, we'll use the event_participants table with a "paid" status
          const result = await db.query.eventParticipants.findFirst({
            where: (fields, { and, eq }) => 
              and(
                eq(fields.eventId, parseInt(eventId)),
                eq(fields.userId, parseInt(userId))
              )
          });

          if (result) {
            // Update existing participation to paid
            await db
              .update(eventParticipants)
              .set({ status: 'paid' })
              .where(
                eq(eventParticipants.id, result.id)
              );
          } else {
            // Insert new participation with paid status
            await db.insert(eventParticipants).values({
              eventId: parseInt(eventId),
              userId: parseInt(userId),
              status: 'paid',
              createdAt: new Date(),
            });
          }

          console.log(`User ${userId} successfully purchased ticket for event ${eventId}`);
        } catch (error) {
          console.error('Error recording ticket purchase:', error);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}
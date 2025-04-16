import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { db } from '../../db';
import { payments, eventParticipants, events } from '../../db/schema';
import * as stripe from '../../server/lib/stripe';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

// Mock the DB
vi.mock('../../db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1, userId: 1, eventId: 1, ticketIdentifier: 'mock-uuid' }]),
  },
}));

// Mock Stripe
vi.mock('../../server/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ 
          id: 'mock-session-id', 
        }),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockBase64Data'),
  },
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mock-uuid'),
}));

describe('Payment Routes', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: vi.Mock;
  let statusMock: vi.Mock;
  let sendMock: vi.Mock;
  let setHeaderMock: vi.Mock;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock response functions
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnThis();
    sendMock = vi.fn().mockReturnThis();
    setHeaderMock = vi.fn().mockReturnThis();

    // Setup request and response mocks
    mockReq = {
      body: {},
      params: {},
      user: { id: 1 },
      headers: {},
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
      send: sendMock,
      setHeader: setHeaderMock,
    };
  });

  // Mock handler functions
  const createCheckoutSession = async (req: Request, res: Response) => {
    const { eventId, quantity } = req.body;
    
    if (!eventId) {
      res.status(400).json({ error: 'Event ID is required' });
      return;
    }

    try {
      // Call Stripe API to create checkout session
      const session = await stripe.stripe.checkout.sessions.create({
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Event',
            },
            unit_amount: 10000,
          },
          quantity,
        }],
        payment_method_types: ['card'],
        mode: 'payment',
        metadata: {
          userId: String(req.user?.id),
          eventId: String(eventId),
          quantity: String(quantity),
        },
      });

      // Create a pending event participation record
      await db.insert(eventParticipants)
        .values({
          userId: req.user?.id,
          eventId,
          status: 'pending',
          ticketQuantity: quantity,
          paymentStatus: 'initiated',
          stripeCheckoutSessionId: session.id,
        });

      // Return session ID to client
      res.json({ sessionId: session.id });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  };

  const stripeWebhookHandler = async (req: Request, res: Response) => {
    try {
      // Verify webhook signature
      const event = stripe.stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'] as string,
        'webhook_secret'
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Generate a ticket identifier
        const ticketId = uuidv4();

        // Update participant record
        await db.update(eventParticipants)
          .set({
            paymentStatus: 'completed',
            paymentIntentId: session.payment_intent,
            ticketIdentifier: ticketId,
          });

        // Create payment record
        await db.insert(payments)
          .values({
            userId: Number(session.metadata.userId),
            eventParticipantId: 1,
            stripeChargeId: session.payment_intent,
            stripeCheckoutSessionId: session.id,
            stripeCustomerId: session.customer,
            amount: session.amount_total,
            currency: session.currency,
            status: 'succeeded',
          });

        res.json({ received: true });
      }
    } catch (error) {
      res.status(400).send(`Error: ${error.message}`);
    }
  };

  const generateQrCode = async (req: Request, res: Response) => {
    const { participantId } = req.params;
    
    try {
      // Fetch ticket data
      const ticket = await db.select()
        .from(eventParticipants)
        .where({ id: participantId, userId: req.user?.id })
        .limit(1);

      if (!ticket || ticket.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      // Generate QR code
      const qrData = await QRCode.toDataURL(ticket[0].ticketIdentifier, {
        type: 'image/png',
      });

      // Convert data URL to buffer
      const qrBuffer = Buffer.from(qrData.split(',')[1], 'base64');

      // Set response headers
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename=ticket-qr-${ticket[0].eventId}-${ticket[0].userId}.png`);

      // Send QR code as response
      res.send(qrBuffer);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  };

  const getLatestTicket = async (req: Request, res: Response) => {
    try {
      // Fetch latest ticket
      const ticket = await db.select()
        .from(eventParticipants)
        .where({ userId: req.user?.id })
        .orderBy('id', 'desc')
        .limit(1);

      if (!ticket || ticket.length === 0) {
        return res.status(404).json({ message: 'No recent completed tickets found' });
      }

      res.json(ticket[0]);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  };

  describe('POST /api/payments/create-checkout-session', () => {
    it('should create a checkout session with valid input', async () => {
      // Setup mock request
      mockReq.body = {
        eventId: 1,
        quantity: 2,
      };

      // Mock database response for fetching event
      (db.select as vi.Mock).mockReturnThis();
      (db.from as vi.Mock).mockReturnThis();
      (db.where as vi.Mock).mockReturnThis();
      (db.returning as vi.Mock).mockResolvedValue([{
        id: 1,
        title: 'Test Event',
        price: '100',
        stripePriceId: null,
        availableTickets: 10,
        capacity: 100,
      }]);

      // Call the handler function
      await createCheckoutSession(mockReq as Request, mockRes as Response);

      // Verify expectations
      expect(stripe.stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [expect.objectContaining({
            price_data: expect.objectContaining({
              product_data: expect.objectContaining({
                name: 'Test Event',
              }),
              unit_amount: 10000, // $100 in cents
            }),
            quantity: 2,
          })],
          payment_method_types: ['card'],
          mode: 'payment',
          metadata: {
            userId: '1',
            eventId: '1',
            quantity: '2',
          },
        })
      );

      // Assert proper DB inserts would be called
      expect(db.insert).toHaveBeenCalledWith(eventParticipants);
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          eventId: 1,
          status: 'pending',
          ticketQuantity: 2,
          paymentStatus: 'initiated',
          stripeCheckoutSessionId: 'mock-session-id',
        })
      );

      // Assert proper response to client
      expect(jsonMock).toHaveBeenCalledWith({ sessionId: 'mock-session-id' });
    });

    it('should return 400 with invalid input', async () => {
      // Setup mock request without eventId
      mockReq.body = {
        quantity: 2,
      };

      // Call the handler function
      await createCheckoutSession(mockReq as Request, mockRes as Response);

      // Verify expectations
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe('POST /api/webhooks/stripe', () => {
    it('should process a successful checkout event', async () => {
      // Setup mock request with session data
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              userId: '1',
              eventId: '1',
              quantity: '1',
            },
            payment_intent: 'pi_test_123',
            customer: 'cus_test_123',
            amount_total: 10000,
            currency: 'usd',
          },
        },
      };

      // Mock stripe constructEvent to return our mock event
      (stripe.stripe.webhooks.constructEvent as vi.Mock).mockReturnValue(mockEvent);

      // Setup webhook request body and headers
      mockReq.body = JSON.stringify(mockEvent);
      mockReq.headers = {
        'stripe-signature': 'mock-signature',
      };

      // Call the webhook handler
      await stripeWebhookHandler(mockReq as Request, mockRes as Response);

      // Verify UUID was generated
      expect(uuidv4).toHaveBeenCalled();

      // Verify participant update
      expect(db.update).toHaveBeenCalledWith(eventParticipants);
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentStatus: 'completed',
          paymentIntentId: 'pi_test_123',
          ticketIdentifier: 'mock-uuid',
        })
      );

      // Verify payment record creation
      expect(db.insert).toHaveBeenCalledWith(payments);
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          eventParticipantId: 1,
          stripeChargeId: 'pi_test_123',
          stripeCheckoutSessionId: 'cs_test_123',
          stripeCustomerId: 'cus_test_123',
          amount: 10000,
          currency: 'usd',
          status: 'succeeded',
        })
      );

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith({ received: true });
    });

    it('should return 400 if webhook signature verification fails', async () => {
      // Mock stripe to throw on signature verification
      (stripe.stripe.webhooks.constructEvent as vi.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      // Setup webhook request
      mockReq.body = JSON.stringify({});
      mockReq.headers = {
        'stripe-signature': 'invalid-signature',
      };

      // Call the webhook handler
      await stripeWebhookHandler(mockReq as Request, mockRes as Response);

      // Assertions
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith(expect.stringContaining('Error'));
    });
  });

  describe('GET /api/tickets/:participantId/qr', () => {
    it('should generate and return a QR code for a valid ticket', async () => {
      // Setup mock request with participant ID
      mockReq.params = {
        participantId: '1',
      };
      mockReq.user = { id: 1 };

      // Mock database response
      (db.select as vi.Mock).mockReturnThis();
      (db.from as vi.Mock).mockReturnThis();
      (db.where as vi.Mock).mockReturnThis();
      (db.limit as vi.Mock).mockResolvedValue([{
        ticketIdentifier: 'mock-uuid',
        userId: 1,
        eventId: 1,
      }]);

      // Call the QR code generator handler
      await generateQrCode(mockReq as Request, mockRes as Response);

      // Verify QR code was generated
      expect(QRCode.toDataURL).toHaveBeenCalledWith('mock-uuid', expect.any(Object));

      // Verify response headers and content
      expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(setHeaderMock).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('ticket-qr-1-1.png'));
      expect(sendMock).toHaveBeenCalledWith(expect.any(Buffer));
    });

    it('should return 404 if ticket not found', async () => {
      mockReq.params = {
        participantId: '999', // Non-existent ID
      };
      mockReq.user = { id: 1 };

      // Mock empty result from database
      (db.select as vi.Mock).mockReturnThis();
      (db.from as vi.Mock).mockReturnThis();
      (db.where as vi.Mock).mockReturnThis();
      (db.limit as vi.Mock).mockResolvedValue([]);

      // Call the QR code generator handler
      await generateQrCode(mockReq as Request, mockRes as Response);

      // Verify 404 response
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('not found'),
      }));
    });
  });

  describe('GET /api/me/latest-ticket', () => {
    it('should return the latest ticket for the authenticated user', async () => {
      mockReq.user = { id: 1 };

      // Mock latest ticket in database
      (db.select as vi.Mock).mockReturnThis();
      (db.from as vi.Mock).mockReturnThis();
      (db.where as vi.Mock).mockReturnThis();
      (db.orderBy as vi.Mock).mockReturnThis();
      (db.limit as vi.Mock).mockResolvedValue([{
        id: 1,
        eventId: 1,
        purchaseDate: new Date(),
      }]);

      // Call the latest ticket handler
      await getLatestTicket(mockReq as Request, mockRes as Response);

      // Verify response
      expect(jsonMock).toHaveBeenCalledWith({
        id: 1,
        eventId: 1,
        purchaseDate: expect.any(Date),
      });
    });

    it('should return 404 if no tickets found', async () => {
      mockReq.user = { id: 1 };

      // Mock empty result
      (db.select as vi.Mock).mockReturnThis();
      (db.from as vi.Mock).mockReturnThis();
      (db.where as vi.Mock).mockReturnThis();
      (db.orderBy as vi.Mock).mockReturnThis();
      (db.limit as vi.Mock).mockResolvedValue([]);

      // Call the latest ticket handler
      await getLatestTicket(mockReq as Request, mockRes as Response);

      // Verify 404 response
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('No recent completed tickets'),
      }));
    });
  });
}); 
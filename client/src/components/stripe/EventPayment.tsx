import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Card } from '@/components/ui/card';
import StripeProvider from './StripeProvider';
import { Button } from '@/components/ui/button';
import { Loader2, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventPaymentProps {
  eventId: number;
  eventTitle: string;
  price: number;
  quantity?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventPayment({ 
  eventId, 
  eventTitle, 
  price, 
  quantity = 1, 
  onSuccess, 
  onCancel 
}: EventPaymentProps) {
  return (
    <StripeProvider>
      <EventPaymentContent 
        eventId={eventId}
        eventTitle={eventTitle}
        price={price}
        quantity={quantity}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </StripeProvider>
  );
}

function EventPaymentContent({ 
  eventId, 
  eventTitle, 
  price, 
  quantity, 
  onSuccess, 
  onCancel 
}: EventPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const totalAmount = price * quantity;

  useEffect(() => {
    // Create a payment intent when the component loads
    async function createPaymentIntent() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: totalAmount,
            currency: 'usd',
            metadata: {
              eventId: eventId.toString(),
              tickets: quantity.toString(),
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Payment processing failed');
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError(error instanceof Error ? error.message : 'Payment setup failed');
      } finally {
        setLoading(false);
      }
    }

    if (stripe && elements) {
      createPaymentIntent();
    }
  }, [stripe, elements, eventId, totalAmount, quantity]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm the payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || 'Payment validation failed');
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/events/' + eventId,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message || 'Payment confirmation failed');
      }

      // If we got here, payment was successful
      toast({
        title: "Payment Successful",
        description: `You've purchased ${quantity} ticket${quantity > 1 ? 's' : ''} for ${eventTitle}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payment system...</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Preparing secure checkout...</p>
        </div>
      </Card>
    );
  }

  if (error || !clientSecret) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>There was a problem setting up the payment system.</p>
          {error && <p className="text-sm">{error}</p>}
          <p className="mt-2">Please try again later or contact support.</p>
          <Button onClick={onCancel} className="mt-4">
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-medium mb-2">{eventTitle}</h3>
        <div className="text-sm text-muted-foreground mb-4">
          {quantity} ticket{quantity > 1 ? 's' : ''} × ${price.toFixed(2)} = ${totalAmount.toFixed(2)}
        </div>
        
        <PaymentElement className="mb-6" />
        
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        
        <div className="flex flex-col gap-2">
          <Button 
            type="submit" 
            disabled={processing || !stripe} 
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Ticket className="mr-2 h-4 w-4" />
                Pay ${totalAmount.toFixed(2)}
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Card } from '@/components/ui/card';
import CheckoutForm from './CheckoutForm';
import StripeProvider from './StripeProvider';
import { Loader2 } from 'lucide-react';

interface PremiumCheckoutProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Wrapper component that handles the Stripe initialization
export function PremiumCheckout({ onSuccess, onCancel }: PremiumCheckoutProps) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <Card className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
        <div className="text-center text-red-500">
          <p className="font-medium">Payment system error</p>
          <p className="text-sm mt-2">{error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => setError(null)}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <ErrorBoundary onError={(error) => setError(error)}>
      <StripeProvider>
        <PremiumCheckoutContent onSuccess={onSuccess} onCancel={onCancel} />
      </StripeProvider>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError: (error: Error) => void;
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

// Internal component that handles the checkout logic
function PremiumCheckoutContent({ onSuccess, onCancel }: PremiumCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    // Create a setup intent or payment intent
    async function createSetupIntent() {
      try {
        setLoading(true);
        
        // First, we create a setup intent to save the card
        const response = await fetch('/api/stripe/create-setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create setup intent');
        }

        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error('No client secret returned from the server');
        }
        
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating setup intent:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize payment system');
      } finally {
        setLoading(false);
      }
    }

    if (stripe && elements) {
      createSetupIntent();
    }
  }, [stripe, elements]);

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
          <p>Preparing secure payment form...</p>
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
        </div>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#7c3aed', // Purple
        colorBackground: '#1a1a1a',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
      },
    },
  };

  return (
    <Card className="p-6 bg-black/40 backdrop-blur-md border border-white/10">
      <h3 className="text-lg font-medium mb-4">Complete Your Premium Subscription</h3>
      <p className="text-gray-400 mb-6">
        You're one step away from unlocking premium benefits. Your card will be charged $29 monthly.
      </p>
      <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
    </Card>
  );
}
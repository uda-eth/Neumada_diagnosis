import { ReactNode, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// We will pass this as an environment variable in production
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface StripeProviderProps {
  children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verify the Stripe key is available
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('Stripe publishable key is missing');
      setError('Payment system configuration error');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading payment system...</div>;
  }

  if (error) {
    console.error('Stripe initialization error:', error);
    return <div>{children}</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
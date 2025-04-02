import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';

interface StripeProviderProps {
  children: React.ReactNode;
}

// We'll initialize stripePromise in the component itself after loading the publishable key
let stripePromise: Promise<Stripe | null> | null = null;

export default function StripeProvider({ children }: StripeProviderProps) {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null); // Added clientSecret state

  useEffect(() => {
    // Fetch publishable key from server
    async function fetchPublishableKey() {
      try {
        setLoading(true);
        const response = await fetch('/api/stripe/config');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load Stripe configuration');
        }

        if (!data.publishableKey) {
          throw new Error('No publishable key returned from server');
        }

        const { publishableKey } = data;

        if (!publishableKey) {
          throw new Error('Stripe publishable key is missing');
        }

        setPublishableKey(publishableKey);
        // Initialize stripePromise once we have the key
        stripePromise = loadStripe(publishableKey);
        // Create setup intent to get clientSecret
        const setupResponse = await fetch('/api/stripe/create-setup-intent');
        if (!setupResponse.ok) {
          throw new Error('Failed to create setup intent');
        }
        const { clientSecret } = await setupResponse.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error loading Stripe configuration:', error);
        setError(error instanceof Error ? error.message : 'Failed to load Stripe configuration');
      } finally {
        setLoading(false);
      }
    }

    fetchPublishableKey();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Loading payment system...</span>
      </div>
    );
  }

  if (error || !stripePromise || !clientSecret) { // Check for clientSecret
    return (
      <div className="text-center p-4 text-red-500">
        <p>There was a problem loading the payment system.</p>
        <p className="text-sm">{error}</p>
        <p className="mt-2">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}> {/* Pass clientSecret to options */}
      {children}
    </Elements>
  );
}
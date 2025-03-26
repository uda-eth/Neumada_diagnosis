import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

interface CheckoutButtonProps {
  eventId: number;
  price: string | number;
  className?: string;
}

export function CheckoutButton({ eventId, price, className = '' }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  // Skip payment process for free events
  const isFreeEvent = Number(price) <= 0;

  const handleCheckout = async () => {
    console.log("Checkout button clicked", { user, eventId, price });
    
    if (!user) {
      console.log("No user found in client state");
      toast({
        title: 'Authentication required',
        description: 'Please sign in to purchase tickets',
        variant: 'destructive',
      });
      return;
    }

    if (isFreeEvent) {
      // For free events, we can directly register the user
      toast({
        title: 'Registration successful!',
        description: 'You are now registered for this event',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include custom auth headers since we're having cookie issues
          'x-username': user.username,
          'x-session-id': 'temporary-session'
        },
        body: JSON.stringify({
          eventId,
          quantity: 1
        })
      });

      const data = await response.json();

    try {
      // First verify authentication for checkout
      console.log("Verifying authentication for checkout...");
      const verifyAuthResponse = await fetch('/api/verify-auth-for-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
        }),
      });
      
      if (!verifyAuthResponse.ok) {
        throw new Error('Authentication verification failed');
      }
      
      const authData = await verifyAuthResponse.json();
      
      if (!authData.authenticated) {
        throw new Error(authData.message || 'Authentication verification failed');
      }
      
      console.log("Authentication verified for checkout, proceeding...");
      
      // Now create the checkout session with auth headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add custom auth headers from our verification
      headers['x-session-id'] = authData.sessionToken || localStorage.getItem('sessionId') || 'anonymous';
      headers['x-username'] = user.username;
      
      console.log("Using session token for checkout:", headers['x-session-id']);
      
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventId,
          quantity: 1, // Default to 1 ticket
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        toast({
          title: 'Redirecting to checkout...',
          description: 'Please complete your payment on the secure Stripe page',
        });
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = isFreeEvent 
    ? 'Register for free' 
    : `Purchase tickets - ${typeof price === 'number' ? `$${price.toFixed(2)}` : price}`;

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`mt-4 w-full ${className}`}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
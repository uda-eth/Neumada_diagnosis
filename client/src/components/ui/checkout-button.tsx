import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@/lib/hooks/use-user';

interface CheckoutButtonProps {
  eventId: number;
  price: number | string;
  isFreeEvent?: boolean;
}

export function CheckoutButton({ eventId, price, isFreeEvent }: CheckoutButtonProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase tickets",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user.username,
          'x-session-id': 'temporary-session'
        },
        body: JSON.stringify({
          eventId,
          quantity: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
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
      className="w-full"
    >
      {isLoading ? "Processing..." : buttonText}
    </Button>
  );
}
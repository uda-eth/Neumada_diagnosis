
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StartCheckoutProps {
  eventId: number;
  eventTitle: string;
  price: number;
  quantity?: number;
  buttonText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function StartCheckout({
  eventId,
  eventTitle,
  price,
  quantity = 1,
  buttonText = 'Purchase Tickets',
  variant = 'default',
  className = ''
}: StartCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start checkout process');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'An error occurred during checkout',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}

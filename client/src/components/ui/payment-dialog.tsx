import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Calendar, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { format } from 'date-fns';

interface PaymentDialogProps {
  eventId: number;
  eventTitle: string;
  eventDate: Date;
  eventImage?: string;
  price: string | number;
  capacity?: number;
  children: React.ReactNode;
}

export function PaymentDialog({
  eventId,
  eventTitle,
  eventDate,
  eventImage,
  price,
  capacity,
  children,
}: PaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  // Skip payment process for free events
  const isFreeEvent = Number(price) <= 0;
  const formattedPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : price;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to purchase tickets',
        variant: 'destructive',
      });
      setIsOpen(false);
      return;
    }

    if (isFreeEvent) {
      // For free events, we can directly register the user
      toast({
        title: 'Registration successful!',
        description: 'You are now registered for this event',
      });
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Purchase Tickets</DialogTitle>
          <DialogDescription>
            Complete your purchase for {eventTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          {eventImage && (
            <div className="relative h-48 w-full overflow-hidden rounded-md">
              <img 
                src={eventImage} 
                alt={eventTitle} 
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">{eventTitle}</h3>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{format(new Date(eventDate), 'EEEE, MMMM d, yyyy, h:mm a')}</span>
              </div>
              
              {capacity && (
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{capacity} spots available</span>
                </div>
              )}
              
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>Transaction processed immediately</span>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
              <span>Ticket price</span>
              <span>{isFreeEvent ? 'Free' : formattedPrice}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>Total</span>
              <span>{isFreeEvent ? 'Free' : formattedPrice}</span>
            </div>
          </div>
          
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            className="w-full"
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
                {isFreeEvent ? 'Register for free' : `Pay ${formattedPrice}`}
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Secure checkout powered by Stripe.
            {!isFreeEvent && " Your payment information is encrypted and secure."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your payment...');
  const [ticketInfo, setTicketInfo] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID provided');
      return;
    }

    async function verifyCheckout() {
      try {
        const response = await fetch(`/api/stripe/checkout-session/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }
        
        const data = await response.json();
        
        if (data.session.payment_status === 'paid') {
          setStatus('success');
          setMessage('Payment successful! Your tickets have been reserved.');
          
          if (data.fulfillment) {
            if (data.fulfillment.success) {
              toast({
                title: "Booking confirmed!",
                description: "Your event tickets have been reserved",
                variant: "default",
              });
            } else {
              // If fulfillment failed, still show success but with a note
              toast({
                title: "Payment processed",
                description: "We're preparing your tickets. Check your email for confirmation.",
                variant: "default",
              });
            }
          }

          // Set ticket info from the session data
          setTicketInfo({
            eventId: data.session.metadata.eventId,
            quantity: data.session.metadata.quantity,
            amount: data.session.amount_total / 100, // Convert from cents
            currency: data.session.currency.toUpperCase(),
          });
        } else {
          setStatus('error');
          setMessage('Payment is pending or failed. Please contact support.');
        }
      } catch (error) {
        console.error('Error verifying checkout:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An error occurred');
      }
    }

    verifyCheckout();
  }, [sessionId, toast]);

  const handleViewTickets = () => {
    navigate(`/event/${eventId}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black/5 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Issue'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we confirm your payment...'}
            {status === 'success' && 'Your event tickets have been confirmed'}
            {status === 'error' && 'There was a problem with your payment'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              {ticketInfo && (
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg w-full">
                  <p className="font-medium">Order Summary</p>
                  <p>Tickets: {ticketInfo.quantity}</p>
                  <p>Total: {ticketInfo.currency} {ticketInfo.amount.toFixed(2)}</p>
                </div>
              )}
            </>
          )}
          
          {status === 'error' && (
            <XCircle className="h-16 w-16 text-destructive mb-4" />
          )}
          
          <p className="mt-2">{message}</p>
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          {status === 'success' && (
            <Button onClick={handleViewTickets} className="w-full">
              View My Tickets
            </Button>
          )}
          
          {status === 'error' && (
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Return to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

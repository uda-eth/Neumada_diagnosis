import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';

export function PremiumSuccessPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/premium-success');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { refetchUser } = useUser();
  
  // Get session_id from URL once on component mount
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutSessionId = urlParams.get('session_id');

  useEffect(() => {
    if (!checkoutSessionId) {
      setError('No checkout session ID provided');
      setLoading(false);
      return;
    }

    console.log('Verifying premium subscription for session ID:', checkoutSessionId);

    const verifyCheckout = async () => {
      try {
        const sessionId = localStorage.getItem('maly_session_id');
        const response = await fetch(`/api/premium/verify-checkout?session_id=${checkoutSessionId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(sessionId ? { 'x-session-id': sessionId } : {})
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to verify subscription');
        }
        
        const data = await response.json();
        console.log('Subscription verification response:', data);
        
        // Refresh user data to get updated premium status
        await refetchUser();
        
        setSuccess(true);
      } catch (error) {
        console.error('Subscription verification error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred verifying your subscription');
      } finally {
        setLoading(false);
      }
    };

    verifyCheckout();
  }, [checkoutSessionId, refetchUser]); // Only run when checkoutSessionId changes

  // Set up redirect timer after success state changes
  useEffect(() => {
    let redirectTimer: number;
    if (success) {
      console.log('Setting up redirect timer after successful verification');
      redirectTimer = window.setTimeout(() => {
        navigate('/premium');
      }, 5000);
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [success, navigate]);

  return (
    <div className="container max-w-md py-12">
      <Card className="border-green-600/20 bg-green-950/5">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Premium Subscription</CardTitle>
          <CardDescription className="text-center">
            {loading ? 'Verifying your subscription status' : 
              success ? 'Subscription activated successfully' : 'Subscription verification'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-green-500 mb-4" />
              <p className="text-muted-foreground">Verifying your subscription...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-red-500/15 p-3 mb-4">
                <div className="rounded-full bg-red-500/30 p-3">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Subscription Verification Failed</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-green-500/15 p-3 mb-4">
                <div className="rounded-full bg-green-500/30 p-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Thank You For Subscribing!</h3>
              <p className="text-muted-foreground mb-4">
                Your premium subscription has been activated successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to premium page in a few seconds...
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            variant={error ? "destructive" : "default"}
            onClick={() => navigate("/premium")}
          >
            {error ? "Try Again" : "Go to Premium Dashboard"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PremiumSuccessPage; 
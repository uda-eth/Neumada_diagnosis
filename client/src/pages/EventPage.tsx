import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare, UserPlus2, Star, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/translations";
import { z } from "zod";
import { useEffect, useState } from "react";
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install uuid: npm install uuid @types/uuid

// Define the Event type with all fields
const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  date: z.string().or(z.date()),
  category: z.string(),
  price: z.number().nullable(),
  image: z.string().nullable(),
  image_url: z.string().nullable(),
  attendingCount: z.number().nullable().default(0),
  interestedCount: z.number().nullable().default(0),
  creatorId: z.number().nullable(),
  creatorName: z.string().nullable(),
  creatorImage: z.string().nullable(),
  creatorUsername: z.string().nullable(), // Added creator username for profile linking
  tags: z.array(z.string()).nullable(),
});

type Event = z.infer<typeof EventSchema>;

// Define participation status types
type ParticipationStatus = 'attending' | 'interested' | 'not_attending';

// Type for attendee/interested user
interface EventUser {
  id: number;
  name: string;
  image: string;
  username?: string; // Add username field for profile routing
}

// Helper function to get first name
const getFirstName = (fullName: string) => fullName?.split(' ')[0] || '';

// Load Stripe instance outside component to avoid reloading
// Ensure VITE_STRIPE_PUBLISHABLE_KEY is set in your .env file
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("Stripe publishable key is not set in environment variables.");
      return Promise.resolve(null); // Return a promise that resolves to null
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default function EventPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [userStatus, setUserStatus] = useState<ParticipationStatus>('not_attending');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: event, isLoading, error: queryError } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error fetching event: ${response.status}`);
      }

      return response.json();
    },
  });

  // Fetch user's participation status for this event
  const { data: participationData } = useQuery({
    queryKey: [`/api/events/${id}/participation`, user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        const response = await fetch(`/api/events/${id}/participation/status`, {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 404) {
            return { status: 'not_attending' as ParticipationStatus };
          }
          throw new Error(`Error fetching participation status: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        console.error("Error fetching participation status:", error);
        return { status: 'not_attending' as ParticipationStatus };
      }
    },
    enabled: !!user, // Only run if user is logged in
  });

  // Update user participation status when data is fetched
  useEffect(() => {
    if (participationData) {
      setUserStatus(participationData.status || 'not_attending');
    }
  }, [participationData]);

  const participateMutation = useMutation({
    mutationFn: async (status: ParticipationStatus) => {
      const sessionId = localStorage.getItem('maly_session_id');
      const response = await fetch(`/api/events/${id}/participate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Session-ID": sessionId || ''
        },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to update participation status");

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update local state
      setUserStatus(variables);

      // Show success message
      const messages = {
        attending: "You are now attending this event!",
        interested: "You are now interested in this event",
        not_attending: "You are no longer participating in this event"
      };

      toast({
        title: "Success",
        description: messages[variables],
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/participation`, user?.id] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update participation status",
      });
    },
  });

  const handleParticipate = async (status: ParticipationStatus) => {
    const sessionId = localStorage.getItem('maly_session_id');

    if (!user || !sessionId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to participate in events",
        variant: "destructive"
      });
      setLocation('/auth');
      return;
    }

    try {
      await participateMutation.mutateAsync(status);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update participation status. Please try logging in again.",
      });
      setLocation('/auth');
    }
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('maly_session_id');
      localStorage.removeItem('maly_user_data');

      // Call server logout endpoint
      await logout();

      // Clear client-side state
      queryClient.clear();

      // Redirect to auth page
      setLocation("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect to auth even if logout fails
      setLocation("/auth");
    }
  };

  // Fix for the dependency array where setLocation was added incorrectly
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_cancelled') === 'true') {
      setError('Payment was cancelled. Please try again.');
    }
  }, [id]); // Remove setLocation from dependency array since it's not used

  const handlePurchase = async () => {
    if (!event || !event.id || !user) {
        toast({ title: "Error", description: "Event details or user information missing.", variant: "destructive" });
        return;
    }
    setError(null);
    setIsProcessing(true);

    try {
        // --- Generate temporary ticket data ---
        const temporaryTicketId = uuidv4();
        const ticketDataForLocalStorage = {
            tempId: temporaryTicketId,
            eventId: event.id,
            userId: user.id, // Assuming user object is available
            eventName: event.title, // Store some display data
            timestamp: Date.now() // Add a timestamp for potential cleanup
        };
        localStorage.setItem('temp_ticket_data', JSON.stringify(ticketDataForLocalStorage));
        console.log("Stored temporary ticket data:", ticketDataForLocalStorage);
        // ------------------------------------

        // 1. Create Checkout Session on the backend
        const response = await fetch('/api/payments/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include session ID for auth
                'x-session-id': localStorage.getItem('maly_session_id') || '' 
            },
            credentials: 'include',
            body: JSON.stringify({ eventId: event.id, quantity: 1 }), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            localStorage.removeItem('temp_ticket_data'); // Clear temp data on error
            throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const { sessionId } = await response.json();

        // 2. Redirect to Stripe Checkout
        const stripe = await getStripe(); 
        if (!stripe) {
            localStorage.removeItem('temp_ticket_data'); // Clear temp data on error
            throw new Error('Stripe.js failed to load or key is missing.');
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: sessionId,
        });

        if (stripeError) {
            console.error('Stripe redirection error:', stripeError);
            setError(stripeError.message || 'Failed to redirect to Stripe.');
            localStorage.removeItem('temp_ticket_data'); // Clear temp data on error
        }
        // If redirectToCheckout succeeds, the browser navigates away, 
        // so we don't need to clear localStorage here immediately.
    } catch (err: any) {
        console.error('Purchase error:', err);
        setError(err.message || 'An unexpected error occurred.');
        localStorage.removeItem('temp_ticket_data'); // Clear temp data on error
    } finally {
        setIsProcessing(false);
    }
  };

  if (isLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/60">
        Loading...
      </div>
    );
  }

  const isPrivateEvent = !event.price;
  const attendingCount = event.attendingCount || 0;
  const interestedCount = event.interestedCount || 0;

  // Use actual data if available, or a placeholder set
  const attendingUsers: EventUser[] = Array.from({ length: Math.min(attendingCount, 5) }, (_, i) => ({
    id: i,
    name: `User ${i + 1}`,
    image: `/attached_assets/profile-image-${i + 1}.jpg`
  }));

  const interestedUsers: EventUser[] = Array.from({ length: Math.min(interestedCount, 5) }, (_, i) => ({
    id: i + 10,
    name: `User ${i + 6}`,
    image: `/attached_assets/profile-image-${i + 6}.jpg`
  }));

  // Modified to support both username and ID-based profile navigation
const handleUserClick = (userIdOrUsername: number | string, username?: string) => {
  // If we have a username directly or as a second parameter, use that
  if (typeof userIdOrUsername === 'string') {
    setLocation(`/profile/${userIdOrUsername}`);
  } else if (username) {
    setLocation(`/profile/${username}`);
  } else {
    // For backward compatibility, try to fetch the username from the database
    // This can happen during the transition period or with mock data
    console.log(`Redirecting to user profile by ID: ${userIdOrUsername}`);
    setLocation(`/profile/${userIdOrUsername}`);
  }
};

  const handleViewAllUsers = (type: 'attending' | 'interested') => {
    setLocation(`/event/${id}/users?type=${type}`);
  };

  const handleParticipationChange = async (status: ParticipationStatus) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to participate in events",
      });
      setLocation('/auth');
      return;
    }

    // Get the current session ID
    const sessionId = localStorage.getItem('maly_session_id');

    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "Please try signing in again",
      });
      setLocation('/auth');
      return;
    }

    // Toggle status if already in that state
    const newStatus = userStatus === status ? 'not_attending' : status;

    try {
      await participateMutation.mutateAsync(newStatus);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update participation status. Please try again.",
      });
    }
  };

  // Update the canPurchase check to handle string prices
  const canPurchase = 
    event.price !== null && 
    (typeof event.price === 'string' 
      ? parseFloat(event.price) > 0 
      : typeof event.price === 'number' && event.price > 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/60"
            onClick={() => setLocation("/")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-sm font-medium">Back</h1>
        </div>
      </header>

      {/* Event Image */}
      {event.image && (
        <div className="container mx-auto px-4 mb-6">
          <div className="rounded-lg overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full object-contain max-h-[70vh]"
            />
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Attendees Section */}
        <div className="flex flex-col gap-6">
          {/* Attending Users */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60">
              Attending
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3" onClick={() => handleViewAllUsers('attending')} style={{cursor: 'pointer'}}>
                {attendingUsers.map((user) => (
                  <Avatar 
                    key={user.id} 
                    className="ring-2 ring-background w-12 h-12 border-2 border-black/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user.id);
                    }}
                  >
                    <AvatarImage 
                      src={user.image} 
                      alt={getFirstName(user.name)}
                      className="object-cover"
                    />
                    <AvatarFallback>{getFirstName(user.name)[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {attendingCount > 5 && (
                <Button 
                  variant="ghost" 
                  className="text-sm text-white/60 hover:text-white"
                  onClick={() => handleViewAllUsers('attending')}
                >
                  +{attendingCount - 5} more attending
                </Button>
              )}
            </div>
          </div>

          {/* Interested Users */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60">
              Interested
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3" onClick={() => handleViewAllUsers('interested')} style={{cursor: 'pointer'}}>
                {interestedUsers.map((user) => (
                  <Avatar 
                    key={user.id} 
                    className="ring-2 ring-background w-12 h-12 border-2 border-black/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user.id);
                    }}
                  >
                    <AvatarImage 
                      src={user.image} 
                      alt={getFirstName(user.name)}
                      className="object-cover"
                    />
                    <AvatarFallback>{getFirstName(user.name)[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {interestedCount > 5 && (
                <Button 
                  variant="ghost" 
                  className="text-sm text-white/60 hover:text-white"
                  onClick={() => handleViewAllUsers('interested')}
                >
                  +{interestedCount - 5} more interested
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Title and Meta */}
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="mt-2 text-white/60">
            <p>{format(new Date(event.date), "EEE, MMM d")}</p>
            <p className="mt-1">
              {format(new Date(event.date), "h:mm a")} -{" "}
              {format(new Date(event.date).setHours(new Date(event.date).getHours() + 2), "h:mm a")}
            </p>
            <p className="mt-1">{event.location}</p>
          </div>
        </div>

        {/* Price and Registration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-white/60">Price</p>
              <p className="text-xl font-semibold">
                {event.price ? `$${event.price}` : 'Free'}
              </p>
            </div>
            {event.price !== null && ((typeof event.price === 'string' ? parseFloat(event.price) > 0 : event.price > 0)) ? (
              <Button 
                className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white"
                onClick={() => setLocation(`/event/${event.id}/tickets`)}
              >
                Get Tickets
              </Button>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => handleParticipate('attending')}
                  disabled={participateMutation.isPending}
                >
                  {userStatus === 'attending' ? "I'm attending ✓" : "I'll be attending"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-white hover:bg-gray-800"
                  onClick={() => handleParticipate('interested')}
                  disabled={participateMutation.isPending}
                >
                  {userStatus === 'interested' ? "I'm interested ✓" : "I'm interested"}
                </Button>
                {userStatus !== 'not_attending' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => handleParticipate('not_attending')}
                    disabled={participateMutation.isPending}
                  >
                    Cancel Participation
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interested and Attending Buttons */}
        {user && user.id !== event.creatorId && (
          <div className="mt-6 flex gap-4">
            <Button
              variant={userStatus === 'interested' ? "default" : "outline"}
              className={`flex-1 ${userStatus === 'interested' ? 'bg-blue-700 hover:bg-blue-800' : ''}`}
              onClick={() => handleParticipationChange('interested')}
              disabled={participateMutation.isPending}
            >
              <Star className="h-4 w-4 mr-2" />
              {userStatus === 'interested' ? 'Interested ✓' : 'Interested'}
            </Button>
            <Button
              variant={userStatus === 'attending' ? "default" : "outline"}
              className={`flex-1 ${userStatus === 'attending' ? 'bg-green-700 hover:bg-green-800' : ''}`}
              onClick={() => handleParticipationChange('attending')}
              disabled={participateMutation.isPending}
            >
              <Users className="h-4 w-4 mr-2" />
              {userStatus === 'attending' ? 'Attending ✓' : 'Attending'}
            </Button>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">About this event</h2>
          <p className="text-white/80 whitespace-pre-wrap">
            {event.description}
          </p>
        </div>

        {/* Event Host */}
        {event.creatorId && (
          <div className="py-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar 
                  className="h-12 w-12"
                  onClick={() => handleUserClick(event.creatorUsername || event.creatorId as number)}
                  style={{cursor: 'pointer'}}
                >
                  <AvatarImage 
                    src={event.creatorImage || ''} 
                    alt={event.creatorName || "Event Host"}
                    className="object-cover"
                  />
                  <AvatarFallback>{(event.creatorName && getFirstName(event.creatorName)[0]) || "H"}</AvatarFallback>
                </Avatar>
                <div>
                  <div 
                    className="font-medium hover:underline cursor-pointer"
                    onClick={() => handleUserClick(event.creatorUsername || event.creatorId as number)}
                  >
                    {event.creatorName ? getFirstName(event.creatorName) : "Event Host"}
                  </div>
                  <div className="text-sm text-white/60">Event Organizer</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <UserPlus2 className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Display error message if exists */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Add Purchase Button */} 
        {canPurchase && (
          <div className="mt-4">
            <Button
              className="w-full mt-4 font-semibold"
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Purchase Ticket {event.price ? `($${typeof event.price === 'string' ? parseFloat(event.price).toFixed(2) : event.price.toFixed(2)})` : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {user && user.id !== event.creatorId && event.price && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-white/10">
          <div className="container mx-auto max-w-2xl">
            <Button
              className="w-full h-12"
              onClick={() => setLocation(`/event/${id}/tickets`)}
              disabled={participateMutation.isPending}
            >
              {isPrivateEvent ? "Request Access" : `Buy Tickets • $${typeof event.price === 'string' ? event.price : event.price?.toString()}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
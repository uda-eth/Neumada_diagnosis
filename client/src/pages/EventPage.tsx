import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare, UserPlus2, Star, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/translations";
import { z } from "zod";
import { useEffect, useState } from "react";

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
}

// Helper function to get first name
const getFirstName = (fullName: string) => fullName?.split(' ')[0] || '';

export default function EventPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [userStatus, setUserStatus] = useState<ParticipationStatus>('not_attending');

  const { data: event, isLoading } = useQuery<Event>({
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

  const handleUserClick = (userId: number) => {
    setLocation(`/profile/${userId}`);
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
              <p className="text-xl font-semibold">${event.price}</p>
            </div>
            {event.price > 0 ? (
              <Button 
                className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white"
                onClick={() => setLocation(`/event/${event.id}/register`)}
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
                  onClick={() => handleUserClick(event.creatorId as number)}
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
                    onClick={() => handleUserClick(event.creatorId as number)}
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
              {isPrivateEvent ? "Request Access" : `Buy Tickets • $${event.price}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
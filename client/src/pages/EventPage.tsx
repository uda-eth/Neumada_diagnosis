import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare, UserPlus2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/translations";
import { z } from "zod";

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

  const participateMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/events/${id}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update participation");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully updated participation status",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update participation status",
      });
    },
  });

  if (isLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white/60">
        Loading...
      </div>
    );
  }

  const isPrivateEvent = !event.price;
  const attendingCount = event.attendingCount || Math.floor(Math.random() * 30 + 5);
  const interestedCount = event.interestedCount || Math.floor(Math.random() * 50 + 10);

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
            <Button 
              className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white"
              onClick={() => setLocation(`/event/${event.id}/register`)}
            >
              Get Tickets
            </Button>
          </div>
        </div>

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
      {user && user.id !== event.creatorId && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg border-t border-white/10">
          <div className="container mx-auto max-w-2xl">
            <Button
              className="w-full h-12"
              onClick={() => participateMutation.mutate("attending")}
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
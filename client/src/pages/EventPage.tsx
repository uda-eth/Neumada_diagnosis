import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/lib/translations";
import type { Event } from "@db/schema";

export default function EventPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
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
  const interestedCount = event.interestedCount || Math.floor(Math.random() * 50 + 10);
  const interestedUsers = event.interestedUsers || Array.from({ length: Math.min(interestedCount, 5) }, (_, i) => ({
    id: i,
    name: `User ${i + 1}`,
    image: `/attached_assets/profile-image-${i + 1}.jpg`
  }));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
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
      </div>

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
        {/* Interested Users Section */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {event.category && (
              <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
                {event.category}
              </div>
            )}
            <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
              {interestedCount} interested
            </div>
          </div>

          {/* Interested Users Avatars - Prominently displayed */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {interestedUsers.slice(0, 5).map((user, index) => (
                <Avatar 
                  key={user.id} 
                  className="ring-2 ring-background w-12 h-12 border-2 border-black/40"
                >
                  <AvatarImage 
                    src={user.image} 
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            {interestedCount > 5 && (
              <span className="text-sm text-white/60">
                +{interestedCount - 5} more interested
              </span>
            )}
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
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={event.creatorImage} 
                    alt={event.creatorName || "Event Host"}
                    className="object-cover"
                  />
                  <AvatarFallback>{(event.creatorName || "H")[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{event.creatorName || "Event Host"}</div>
                  <div className="text-sm text-white/60">Event Organizer</div>
                </div>
              </div>
              <Button variant="outline" className="h-9">
                Follow
              </Button>
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
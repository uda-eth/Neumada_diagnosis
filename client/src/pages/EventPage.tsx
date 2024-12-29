import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Share2, Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Event } from "@db/schema";

export default function EventPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) throw new Error("Failed to fetch event");
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
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white/60">
        Loading...
      </div>
    );
  }

  const isPrivateEvent = event.price === undefined || event.price === null;
  const interestedCount = Math.floor(Math.random() * 50 + 10); // Placeholder for demo

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" className="text-white/60 hover:text-white">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Event Image */}
        {event.image && (
          <div className="aspect-[16/9] mb-8">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-8">
          {/* Title and Meta */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(new Date(event.date), "EEE, MMM d · h:mm a")}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {event.location}
              </div>
              {event.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {event.capacity} spots
                </div>
              )}
            </div>
          </div>

          {/* Price and Interested */}
          <div className="flex items-center justify-between py-4 border-y border-white/10">
            <div className="text-xl font-semibold">
              {isPrivateEvent ? "RSVP required" : `$${event.price} USD`}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <Avatar key={i} className="w-8 h-8 border-2 border-[#121212]">
                    <AvatarFallback className="bg-white/10">
                      {String.fromCharCode(65 + i)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-white/60">{interestedCount} interested</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Created By */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Created by</h2>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-white/10">
                  {event.creatorId?.toString()[0] || 'H'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Host Name</div>
                <div className="text-sm text-white/60">Event Organizer</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          {user && user.id !== event.creatorId && (
            <div className="flex gap-4 pt-4">
              <Button 
                className="flex-1 h-12"
                onClick={() => participateMutation.mutate("attending")}
                disabled={participateMutation.isPending}
              >
                {isPrivateEvent ? "Request Access" : `Buy Ticket • $${event.price}`}
              </Button>
              <Button
                variant="outline"
                className="px-8 h-12"
                onClick={() => participateMutation.mutate("interested")}
                disabled={participateMutation.isPending}
              >
                Interested
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
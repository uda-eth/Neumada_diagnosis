
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronLeft } from "lucide-react";

interface EventUser {
  id: number;
  name: string;
  image: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: string;
  image: string;
  capacity: number;
  price: string;
  attendingCount: number;
  interestedCount: number;
  attendingUsers: EventUser[];
  interestedUsers: EventUser[];
}

const getFirstName = (fullName: string) => fullName?.split(' ')[0] || '';

export default function OndaLindaFestivalPage() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Mock data for Onda Linda Festival
  const festival: Event = {
    id: 1009,
    title: "Surreal Festival",
    description: "Experience a surreal journey in the breathtaking Valle de Bravo. A two-day immersive festival that blends art, music, and nature in a unique mountain setting. Get your full pass now and be part of this extraordinary event that pushes the boundaries of reality and imagination.",
    date: new Date(2025, 4, 2),
    location: "Mexico City",
    category: "Festivals",
    image: "/attached_assets/baac6810-cef8-4632-a20d-08ae3d08f3fc.jpg",
    capacity: 500,
    price: "200",
    attendingCount: 162,
    interestedCount: 324,
    attendingUsers: [
      { id: 1009, name: "Alexander Reeves", image: "/attached_assets/Screenshot 2024-03-06 at 12.19.10 PM.png" },
      { id: 1010, name: "Maria Torres", image: "/attached_assets/profile-image-1.jpg" },
      { id: 1011, name: "James Chen", image: "/attached_assets/profile-image-2.jpg" },
      { id: 1012, name: "Sara Johnson", image: "/attached_assets/profile-image-3.jpg" },
      { id: 1013, name: "David Kim", image: "/attached_assets/profile-image-4.jpg" }
    ],
    interestedUsers: [
      { id: 1014, name: "Lisa Park", image: "/attached_assets/profile-image-5.jpg" },
      { id: 1015, name: "John Smith", image: "/attached_assets/profile-image-6.jpg" },
      { id: 1016, name: "Jane Doe", image: "/attached_assets/profile-image-7.jpg" },
      { id: 1017, name: "Peter Jones", image: "/attached_assets/profile-image-8.jpg" },
      { id: 1018, name: "Susan Brown", image: "/attached_assets/profile-image-9.jpg" }
    ]
  };

  const participateMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/events/${festival.id}/participate`, {
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

  const handleUserClick = (userId: number) => {
    setLocation(`/profile/${userId}`);
  };

  const handleViewAllUsers = (type: 'attending' | 'interested') => {
    setLocation(`/event/${festival.id}/users?type=${type}`);
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
      <div className="w-full h-64 md:h-96 relative">
        <img
          src={festival.image}
          alt={festival.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Event Title and Meta */}
        <div>
          <h1 className="text-2xl font-bold">{festival.title}</h1>
          <div className="mt-2 text-white/60">
            <p>{format(new Date(festival.date), "EEE, MMM d")}</p>
            <p className="mt-1">
              {format(new Date(festival.date), "h:mm a")} -{" "}
              {format(new Date(festival.date).setHours(new Date(festival.date).getHours() + 2), "h:mm a")}
            </p>
            <p className="mt-1">{festival.location}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">About this event</h2>
          <p className="text-white/80 whitespace-pre-wrap">
            {festival.description}
          </p>
        </div>

        {/* Price and Registration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-white/60">Price</p>
              <p className="text-xl font-semibold">${festival.price}</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white"
              onClick={() => setLocation(`/event/${festival.id}/register`)}
            >
              Get Tickets
            </Button>
          </div>
        </div>

        {/* Attendees Section */}
        <div className="flex flex-col gap-6">
          {/* Attending Users */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60">
              Attending
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3" onClick={() => handleViewAllUsers('attending')} style={{cursor: 'pointer'}}>
                {festival.attendingUsers.map((user) => (
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
              <Button 
                variant="ghost" 
                className="text-sm text-white/60 hover:text-white"
                onClick={() => handleViewAllUsers('attending')}
              >
                +{festival.attendingCount - festival.attendingUsers.length} more
              </Button>
            </div>
          </div>

          {/* Interested Users */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/60">
              Interested
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3" onClick={() => handleViewAllUsers('interested')} style={{cursor: 'pointer'}}>
                {festival.interestedUsers.map((user) => (
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
              <Button 
                variant="ghost" 
                className="text-sm text-white/60 hover:text-white"
                onClick={() => handleViewAllUsers('interested')}
              >
                +{festival.interestedCount - festival.interestedUsers.length} more
              </Button>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-4 pt-4">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={() => participateMutation.mutate("attending")}
          >
            I'll be attending
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-white hover:bg-gray-800"
            onClick={() => participateMutation.mutate("interested")}
          >
            I'm interested
          </Button>
        </div>
      </div>
    </div>
  );
}

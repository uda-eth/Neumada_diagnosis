import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Globe } from "lucide-react";
import { format } from "date-fns";
import type { User, Event } from "@db/schema";

export default function ProfilePage() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useUser();

  const { data: profile, isLoading: isLoadingProfile } = useQuery<User>({
    queryKey: [`/api/users/${username}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });

  const { data: userEvents, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: [`/api/users/${username}/events`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  if (isLoadingProfile || isLoadingEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            Back to Events
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={profile.profileImage} />
                    <AvatarFallback>
                      {profile.fullName?.[0] || profile.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{profile.fullName}</CardTitle>
                  <CardDescription>@{profile.username}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {profile.bio && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <div
                          key={interest}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Events</h2>
            <div className="grid gap-6">
              {userEvents?.map((event) => (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setLocation(`/event/${event.id}`)}
                >
                  <div className="grid md:grid-cols-3 gap-4">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-l-lg"
                      />
                    )}
                    <div className="md:col-span-2 p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.date), "PPP")}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {event.category}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Globe, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRecommendedEvents } from "@/hooks/use-recommended-events";

const categories = [
  "Networking",
  "Coworking",
  "Social",
  "Sports",
  "Cultural",
  "Tech",
  "Travel",
];

const locations = [
  "Bali",
  "Bangkok",
  "Barcelona",
  "Berlin",
  "Lisbon",
  "London",
  "Mexico City",
  "New York",
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedLocation, setSelectedLocation] = useState<string>();
  const { events, isLoading, createEvent } = useEvents(
    selectedCategory,
    selectedLocation
  );
  const { recommendedEvents, isLoading: isLoadingRecommended } = useRecommendedEvents();
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    category: "",
    image: "",
    capacity: 0,
  });

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        date: new Date(newEvent.date).toISOString(),
        capacity: newEvent.capacity || null
      };

      await createEvent(eventData);
      toast({
        title: "Success",
        description: "Event created successfully"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create event"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Nomad Events</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => setLocation(`/profile/${user?.username}`)}
            >
              Profile
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, location: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="datetime-local"
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacity</Label>
                      <Input
                        type="number"
                        value={newEvent.capacity}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            capacity: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateEvent} className="w-full">
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user && recommendedEvents && recommendedEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingRecommended ? (
                <div className="col-span-full text-center py-8">
                  Loading recommendations...
                </div>
              ) : (
                recommendedEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setLocation(`/event/${event.id}`)}
                  >
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(event.date), "PPP")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {event.category}
                        </div>
                        {event.capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.capacity}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <Select onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <h2 className="text-2xl font-bold mb-6">All Events</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setLocation(`/event/${event.id}`)}
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.date), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {event.category}
                    </div>
                    {event.capacity && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.capacity}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
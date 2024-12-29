import { useState } from "react";
import { useLocation } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-user";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Plus, UserCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getEventImage } from "@/lib/eventImages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const cities = [
  "Bali",
  "Bangkok",
  "Barcelona",
  "Berlin",
  "Lisbon",
  "London",
  "Mexico City",
  "New York",
];

const categories = [
  "Networking",
  "Coworking",
  "Social",
  "Sports",
  "Cultural",
  "Tech",
  "Travel",
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("Mexico City");
  const { events, isLoading, createEvent } = useEvents(
    selectedCategory || undefined,
    selectedCity || undefined
  );
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    category: "",
    image: "",
    capacity: 0,
  });

  // Group events by time period
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const groupedEvents = events?.reduce((acc: any, event) => {
    const eventDate = new Date(event.date);
    if (eventDate <= nextWeek && eventDate >= today) {
      acc.thisWeekend.push(event);
    } else {
      acc.nextWeek.push(event);
    }
    return acc;
  }, { thisWeekend: [], nextWeek: [] });

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        date: new Date(newEvent.date),
        capacity: newEvent.capacity || null,
        image: getEventImage(newEvent.category),
      };

      await createEvent(eventData);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create event",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium uppercase tracking-wider">Discover</h1>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[180px] bg-transparent border-white/20">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/browse")}>
              Browse Members
            </Button>
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" onClick={() => setLocation(`/profile/${user.username}`)}>
                <UserCircle2 className="h-5 w-5 mr-2" />
                {user.username}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setLocation("/auth")}>
                Sign In
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Event</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
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
                        <SelectContent position="popper" className="w-[200px]">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
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
                        <SelectContent position="popper" className="w-[200px]">
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
                            capacity: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateEvent}
                    className="w-full mt-6"
                    disabled={
                      !newEvent.title ||
                      !newEvent.description ||
                      !newEvent.location ||
                      !newEvent.category ||
                      !newEvent.date
                    }
                  >
                    Create Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-white/5 rounded-lg mb-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* This Weekend Section */}
            {groupedEvents?.thisWeekend.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-white/60 mb-4">THIS WEEKEND</h2>
                <div className="space-y-4">
                  {groupedEvents.thisWeekend.map((event: any) => (
                    <Card
                      key={event.id}
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/event/${event.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="flex h-[140px]">
                          <div className="w-1/3">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold mb-1">{event.title}</h3>
                              <p className="text-sm text-white/60">
                                {format(new Date(event.date), "EEE, MMM d, yyyy · h:mm a")}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-white/60" />
                                <span className="text-sm text-white/60">{event.location}</span>
                                {event.capacity && (
                                  <>
                                    <span className="text-white/60">·</span>
                                    <span className="text-sm text-white/60">
                                      ${event.price || "Free"}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {[...Array(3)].map((_, i) => (
                                    <Avatar key={i} className="w-6 h-6 border-2 border-[#121212]">
                                      <AvatarFallback className="bg-white/10 text-xs">
                                        {String.fromCharCode(65 + i)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                <span className="text-sm text-white/60">
                                  {Math.floor(Math.random() * 50 + 10)} interested
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Next Week Section */}
            {groupedEvents?.nextWeek.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-white/60 mb-4">NEXT WEEK</h2>
                <div className="space-y-4">
                  {groupedEvents.nextWeek.map((event: any) => (
                    <Card
                      key={event.id}
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/event/${event.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="flex h-[140px]">
                          <div className="w-1/3">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold mb-1">{event.title}</h3>
                              <p className="text-sm text-white/60">
                                {format(new Date(event.date), "EEE, MMM d, yyyy · h:mm a")}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-white/60" />
                                <span className="text-sm text-white/60">{event.location}</span>
                                {event.capacity && (
                                  <>
                                    <span className="text-white/60">·</span>
                                    <span className="text-sm text-white/60">
                                      ${event.price || "Free"}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {[...Array(3)].map((_, i) => (
                                    <Avatar key={i} className="w-6 h-6 border-2 border-[#121212]">
                                      <AvatarFallback className="bg-white/10 text-xs">
                                        {String.fromCharCode(65 + i)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                <span className="text-sm text-white/60">
                                  {Math.floor(Math.random() * 50 + 10)} interested
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
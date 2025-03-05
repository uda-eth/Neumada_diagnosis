import { useState } from "react";
import { useLocation } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Plus, UserCircle2, Search, MessageSquare, Bot } from "lucide-react";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getEventImage } from "@/lib/eventImages";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DIGITAL_NOMAD_CITIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {ScrollArea} from "@/components/ui/scroll-area";


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
  "Concerts",
  "Coworking",
  "Cultural",
  "Day Parties",
  "Day Trips",
  "Excursions",
  "Getaways",
  "Networking",
  "Nightlife",
  "Retreats",
  "Social",
  "Sports",
  "Tech",
  "Travel",
  "VIP Events",
  "Volunteer",
];

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="w-6 h-6 rounded-full object-cover" />
);

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("Mexico City");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { events, isLoading, createEvent } = useEvents(undefined, selectedCity);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    category: "",
    imageFile: null as File | null,
    capacity: 0,
  });

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedEvents = filteredEvents?.reduce(
    (acc: { thisWeekend: any[]; nextWeek: any[] }, event) => {
      const eventDate = new Date(event.date);
      if (eventDate <= nextWeek && eventDate >= today) {
        acc.thisWeekend.push(event);
      } else {
        acc.nextWeek.push(event);
      }
      return acc;
    },
    { thisWeekend: [], nextWeek: [] }
  );

  const handleCreateEvent = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('location', newEvent.location);
      formData.append('date', new Date(newEvent.date).toISOString());
      formData.append('category', newEvent.category);
      formData.append('capacity', String(newEvent.capacity));

      if (newEvent.imageFile) {
        formData.append('image', newEvent.imageFile);
      }

      await createEvent(formData);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setIsDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        location: "",
        date: "",
        category: "",
        imageFile: null,
        capacity: 0,
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-50 bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-medium uppercase tracking-[.5em] text-white">
                Discover
              </h1>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[180px] bg-transparent border-border">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {DIGITAL_NOMAD_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/browse")} 
                className="hidden md:inline-flex items-center text-white"
              >
                <Users className="h-5 w-5 mr-2" />
                Browse Members
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/messages")} 
                className="hidden md:inline-flex items-center text-white"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Inbox
              </Button>
              <ThemeToggle />
              {user ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation(`/profile/${user.username}`)} 
                  className="hidden md:inline-flex items-center text-white"
                >
                  <UserCircle2 className="h-5 w-5 mr-2" />
                  {user.username}
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation("/auth")} 
                  className="hidden md:inline-flex items-center text-white"
                >
                  <UserCircle2 className="h-5 w-5 mr-2" />
                  Sign In
                </Button>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">Create Event</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="fixed left-[50%] top-[50%] z-[101] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Title</Label>
                      <Input
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Event Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, imageFile: e.target.files?.[0] || null })
                        }
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-sm text-muted-foreground">
                        Upload an image to represent your event. If none provided, we'll use a category-based image.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Description</Label>
                      <Textarea
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, description: e.target.value })
                        }
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Location</Label>
                        <Select
                          onValueChange={(value) =>
                            setNewEvent({ ...newEvent, location: value })
                          }
                        >
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border">
                            {cities.map((city) => (
                              <SelectItem key={city} value={city} className="text-foreground">
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Category</Label>
                        <Select
                          onValueChange={(value) =>
                            setNewEvent({ ...newEvent, category: value })
                          }
                        >
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-border">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="text-foreground">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Date</Label>
                        <Input
                          type="datetime-local"
                          value={newEvent.date}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, date: e.target.value })
                          }
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Capacity</Label>
                        <Input
                          type="number"
                          value={newEvent.capacity}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              capacity: parseInt(e.target.value) || 0,
                            })
                          }
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateEvent}
                      className="w-full mt-6 bg-primary text-white hover:bg-primary/90"
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
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  className="pl-10 bg-background/5 border-border text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px] bg-background/5 border-border">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-lg mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {groupedEvents?.thisWeekend.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-muted-foreground mb-4">
                    THIS WEEKEND
                  </h2>
                  <div className="space-y-4">
                    {groupedEvents.thisWeekend.map((event: any) => (
                      <Card
                        key={event.id}
                        className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden"
                        onClick={() => setLocation(`/event/${event.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row h-auto">
                            <div className="w-full md:w-[180px] h-[140px] md:h-[180px]">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="h-full w-full object-contain md:object-cover"
                              />
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {event.category}
                                  </Badge>
                                  {event.tags?.map((tag: string) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(event.date), "EEE, MMM d, h:mm a")}
                                </p>
                                <h3 className="font-semibold text-foreground mt-1 line-clamp-2">
                                  {event.title}
                                </h3>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground truncate">
                                      {event.location}
                                    </span>
                                  </div>
                                  {event.price && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <span className="text-muted-foreground">·</span>
                                      <span className="text-sm font-medium text-foreground">
                                        ${event.price}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast({
                                      title: "RSVP Successful",
                                      description: "You're going to " + event.title
                                    });
                                  }}
                                >
                                  RSVP
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {groupedEvents?.nextWeek.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-muted-foreground mb-4">
                    NEXT WEEK
                  </h2>
                  <div className="space-y-4">
                    {groupedEvents.nextWeek.map((event: any) => (
                      <Card
                        key={event.id}
                        className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden"
                        onClick={() => setLocation(`/event/${event.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row h-auto">
                            <div className="w-full md:w-[180px] h-[140px] md:h-[180px]">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="h-full w-full object-contain md:object-cover"
                              />
                            </div>
                            <div className="flex-1 p-4 flex flex-col justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {event.category}
                                  </Badge>
                                  {event.tags?.map((tag: string) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(event.date), "EEE, MMM d, h:mm a")}
                                </p>
                                <h3 className="font-semibold text-foreground mt-1 line-clamp-2">
                                  {event.title}
                                </h3>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground truncate">
                                      {event.location}
                                    </span>
                                  </div>
                                  {event.price && (
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <span className="text-muted-foreground">·</span>
                                      <span className="text-sm font-medium text-foreground">
                                        ${event.price}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast({
                                      title: "RSVP Successful",
                                      description: "You're going to " + event.title
                                    });
                                  }}
                                >
                                  RSVP
                                </Button>
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
      </ScrollArea>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black text-white border-t border-border p-4 md:hidden">
        <div className="container mx-auto">
          <div className="flex justify-around items-center">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/browse")}>
              <Users className="h-5 w-5 text-white" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/messages")}>
              <MessageSquare className="h-5 w-5 text-white" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/companion")}>
              <Bot className="h-5 w-5 text-white" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/auth")}>
              <UserCircle2 className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Plus, Search, Globe2, Bot, Share2, X, Check } from "lucide-react";
import { format } from "date-fns";
import { DIGITAL_NOMAD_CITIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/lib/translations";
import { ShareDialog } from "@/components/ui/share-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// Event types for filtering
const EVENT_TYPES = [
  "Afterhours",
  "Art",
  "Cultural",
  "Festivals",
  "Food & Drink",
  "Free",
  "Galleries",
  "Intimate",
  "Music",
  "Networking",
  "Outdoor",
  "Parties",
  "Spiritual",
  "Sports",
  "Tech",
  "VIP",
  "Wellness",
  "Workshops",
  "Yoga"
] as const;

const featuredEventData = {
  id: "onda-linda-festival",
  title: "Onda Linda Festival",
  description: "Experience Mexico's premier beach festival, featuring live music, art installations, and seaside performances under the stars.",
  location: "Mexico City",
  date: new Date("2025-03-08T15:00:00").toISOString(),
  category: "Cultural",
  tags: ["Music", "Art", "Festival"],
  price: 45,
  image: "/attached_assets/Screenshot 2025-03-06 at 9.50.03 AM.png",
  attendingCount: 89,
  interestedCount: 213
};

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
  "Retail",
  "Retreats",
  "Social",
  "Sports",
  "Tech",
  "Travel",
  "VIP Events",
  "Volunteer",
];

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  const fallbackImage = "/attached_assets/profile-image-1.jpg";

  return (
    <img
      src={error ? fallbackImage : src}
      alt={alt}
      className="w-6 h-6 rounded-full object-cover"
      onError={() => setError(true)}
    />
  );
};

export default function HomePage() {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState("Mexico City");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const { events: fetchedEvents } = useEvents(undefined, selectedCity);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { refreshUser } = useUser();
  
  // Handle session parameters when coming from login redirect
  useEffect(() => {
    // Parse URL parameters for session information
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    
    if (sessionId) {
      console.log("Detected session parameter, refreshing user data");
      
      // Refresh user data to ensure we're using the new session
      refreshUser().then(userData => {
        console.log("User data refreshed successfully:", userData?.username);
        
        // Remove the query params from URL without triggering a page reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }).catch(error => {
        console.error("Error refreshing user data:", error);
      });
    }
  }, [location, refreshUser]);

  const allEvents = fetchedEvents || [];
  const featuredEvent = featuredEventData;

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesEventTypes = selectedEventTypes.length === 0 ||
                             event.tags?.some(tag => selectedEventTypes.includes(tag));
    return matchesSearch && matchesCategory && matchesEventTypes;
  });

  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const groupedEvents = filteredEvents.reduce(
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


  const handleShare = (event: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShareDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-50 bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium uppercase tracking-[.5em] text-white">
                {t('discover')}
              </h1>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[140px] md:w-[180px] bg-transparent border-border">
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/connect")}
                className="hidden md:inline-flex items-center text-white"
              >
                <Users className="h-5 w-5 mr-2" />
                connect123
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white whitespace-nowrap px-2 md:px-4"
                onClick={() => setLocation("/create")}
              >
                <Plus className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Make</span>
                <span className="inline md:hidden">Make</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="mb-8 space-y-4">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('searchEvents')}
                  className="pl-10 bg-background/5 border-border text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Unified Filter Dropdown for both Mobile and Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[180px] justify-between">
                    <span>Filter Events</span>
                    {selectedEventTypes.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedEventTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[280px]">
                  <DropdownMenuLabel>Event Types</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[400px] overflow-y-auto">
                    {EVENT_TYPES.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={selectedEventTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setSelectedEventTypes(prev =>
                            checked
                              ? [...prev, type]
                              : prev.filter(t => t !== type)
                          );
                        }}
                      >
                        {type}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                  {selectedEventTypes.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="justify-center text-muted-foreground"
                        onClick={() => setSelectedEventTypes([])}
                      >
                        Clear all filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Selected Filters Display */}
            {selectedEventTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 py-4">
                {selectedEventTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    {type}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedEventTypes(prev => prev.filter(t => t !== type));
                      }}
                      className="ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEventTypes([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {featuredEvent && (
              <section>
                <h2 className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
                  RECOMMENDED
                </h2>
                <Card
                  className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden"
                  onClick={() => setLocation(`/event/onda-linda-festival`)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="md:hidden">
                        <div className="aspect-[4/3] relative">
                          <img
                            src={featuredEvent.image}
                            alt={featuredEvent.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <div className="aspect-[16/9] relative">
                          <img
                            src={featuredEvent.image}
                            alt={featuredEvent.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className="bg-primary text-white">
                            Featured
                          </Badge>
                          <Badge variant="outline" className="text-white border-white/20">
                            {featuredEvent.category}
                          </Badge>
                          {featuredEvent.tags?.slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-white/10 text-white"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2">
                          {featuredEvent.title}
                        </h3>
                        <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4">
                          {featuredEvent.description}
                        </p>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-white/60" />
                              <span className="text-white/60 text-sm">
                                {featuredEvent.location}
                              </span>
                            </div>
                            <div className="text-white/60 text-sm">
                              {format(new Date(featuredEvent.date), "EEE, MMM d, h:mm a")}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex gap-2">
                              <span className="text-lg font-medium text-white">${featuredEvent.price}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                onClick={(e) => handleShare(featuredEvent, e)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white w-full md:w-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLocation(`/event/${featuredEvent.id}/register`);
                                }}
                              >
                                Get Tickets
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {groupedEvents?.thisWeekend.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-4">
                  {t('thisWeekend')}
                </h2>
                <div className="space-y-4">
                  {groupedEvents.thisWeekend.map((event: any) => (
                    <Card
                      key={event.id}
                      className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden"
                      onClick={() => setLocation(`/event/${event.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-64 h-[360px] md:h-[400px] flex-shrink-0">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover bg-black/40"
                            />
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-sm">
                                  {event.category}
                                </Badge>
                                {event.tags?.slice(0, 2).map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-sm"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <h3 className="text-xl font-semibold mb-2">
                                {event.title}
                              </h3>
                              <p className="text-muted-foreground line-clamp-2 mb-4">
                                {event.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {event.location}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  {format(new Date(event.date), "EEE, MMM d, h:mm a")}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-medium">${event.price}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={(e) => handleShare(event, e)}
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/event/${event.id}/register`);
                                    }}
                                  >
                                    Get Tickets
                                  </Button>
                                </div>
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

            <section className="py-4">
              <div className="w-full relative">
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                  Premium Ad Partner
                </div>
                <div className="rounded-lg overflow-hidden relative">
                  <div className="relative hidden md:block">
                    <img
                      src="/attached_assets/Screenshot 2025-03-05 at 10.20.48 PM.png"
                      alt="MUSA Zihuatanejo"
                      className="w-full object-cover h-[400px]"
                    />
                    <div className="absolute bottom-8 right-8 text-right">
                      <h3 className="font-serif text-2xl text-white mb-2 drop-shadow-lg">
                        MUSA
                      </h3>
                      <p className="font-serif text-white/90 text-lg tracking-wide drop-shadow-lg">
                        A Holistic Hideaway On The Coast<br />Of Zihuatanejo
                      </p>
                    </div>
                  </div>
                  <div className="md:hidden relative">
                    <img
                      src="/attached_assets/Screenshot 2025-03-05 at 10.20.48 PM.png"
                      alt="MUSA Zihuatanejo"
                      className="w-full aspect-[3/2] object-cover"
                    />
                    <div className="absolute bottom-4 right-4 text-right">
                      <h3 className="font-serif text-xl text-white mb-1 drop-shadow-lg">
                        MUSA
                      </h3>
                      <p className="font-serif text-white/90 text-sm tracking-wide drop-shadow-lg">
                        A Holistic Hideaway On The Coast<br />Of Zihuatanejo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {groupedEvents?.nextWeek.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-4">
                  {t('nextWeek')}
                </h2>
                <div className="space-y-4">
                  {groupedEvents.nextWeek.map((event: any) => (
                    <Card
                      key={event.id}
                      className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden"
                      onClick={() => setLocation(`/event/${event.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-64 h-[360px] md:h-[400px] flex-shrink-0">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover bg-black/40"
                            />
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-sm">
                                  {event.category}
                                </Badge>
                                {event.tags?.slice(0, 2).map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-sm"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <h3 className="text-xl font-semibold mb-2">
                                {event.title}
                              </h3>
                              <p className="text-muted-foreground line-clamp-2 mb-4">
                                {event.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {event.location}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  {format(new Date(event.date), "EEE, MMM d, h:mm a")}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-medium">${event.price}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={(e) => handleShare(event, e)}
                                  >
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLocation(`/event/${event.id}/register`);
                                    }}
                                  >
                                    Get Tickets
                                  </Button>
                                </div>
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
        </main>
      </ScrollArea>
      <nav className="fixed bottom-0 left-0 right-0 bg-black text-white border-t border-border p-4 md:hidden">
        <div className="container mx-auto">
          <div className="flex justify-around items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-white flex flex-col items-center"
            >
              <Search className="h-5 w-5" />
              <span className="text-xs mt-1">Discover</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/connect")}
              className="text-white flex flex-col items-center"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">connect123</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/translate")}
              className="text-white flex flex-col items-center"
            >
              <Globe2 className="h-5 w-5" />
              <span className="text-xs mt-1">Translate</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/concierge")}
              className="text-white flex flex-col items-center"
            >
              <Bot className="h-5 w-5" />
              <span className="text-xs mt-1">Concierge</span>
            </Button>
          </div>
        </div>
      </nav>
      {selectedEvent && (
        <ShareDialog
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          title={selectedEvent.title}
          description={selectedEvent.description}
          url={`${window.location.origin}/event/${selectedEvent.id}`}
        />
      )}
    </div>
  );
}
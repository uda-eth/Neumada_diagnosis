import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Search, Plus, Star, Calendar, X } from "lucide-react";
import { format } from "date-fns";
import { DIGITAL_NOMAD_CITIES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/lib/translations";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function DiscoverPage() {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const { events: fetchedEvents, isLoading } = useEvents(undefined, selectedCity);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const itemsPerPage = 16; // Show 16 items (4x4 grid) per page

  const allEvents = fetchedEvents || [];

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesEventTypes = selectedEventTypes.length === 0 ||
                             event.tags?.some(tag => selectedEventTypes.includes(tag));
    return matchesSearch && matchesCategory && matchesEventTypes;
  });

  // Get current page of events
  const indexOfLastEvent = page * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const hasMoreEvents = filteredEvents.length > indexOfLastEvent;

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCity, selectedCategory, selectedEventTypes]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-50 bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium uppercase tracking-[.5em] text-white">
                {t('discover')}
              </h1>
              <div className="flex items-center gap-2">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-[140px] md:w-[180px] bg-transparent border-border">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {DIGITAL_NOMAD_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/connect")}
                className="hidden md:inline-flex items-center text-white"
              >
                <Users className="h-5 w-5 mr-2" />
                Connect
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white whitespace-nowrap px-2 md:px-4"
                onClick={() => setLocation("/create")}
              >
                <Plus className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Create Event</span>
                <span className="inline md:hidden">Create</span>
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

          {/* Event Grid */}
          <div className="space-y-8">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">
              {filteredEvents.length} Events Found
            </h2>

            {isLoading ? (
              // Loading skeleton grid
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg text-muted-foreground mb-4">No events match your search criteria</p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedEventTypes([]);
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Responsive Grid Layout */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                  {currentEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      onClick={() => setLocation(`/event/${event.id}`)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={event.image || "/placeholder-event.jpg"}
                          alt={event.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-white/60">
                                {format(new Date(event.date), "EEE, MMM d, h:mm a")}
                              </p>
                              <h3 className="text-lg font-semibold text-white mt-1 truncate">{event.title}</h3>
                            </div>
                            <div className="text-right text-white z-10">
                              {event.price === "0" ? (
                                <p className="font-semibold text-white text-lg">Free</p>
                              ) : (
                                <>
                                  <p className="font-semibold text-white text-lg">${event.price}</p>
                                  <p className="text-sm text-white/60">per person</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                              {event.location}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {event.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {event.tags?.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMoreEvents && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      variant="outline" 
                      onClick={loadMore}
                      className="w-full md:w-auto"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </ScrollArea>
    </div>
  );
}
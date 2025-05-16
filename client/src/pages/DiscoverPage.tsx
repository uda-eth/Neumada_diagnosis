import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useEvents } from "@/hooks/use-events";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, Search, Plus, Star, Calendar, X, UserCircle } from "lucide-react";
import { format } from "date-fns";
import { DIGITAL_NOMAD_CITIES, VIBE_AND_MOOD_TAGS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/lib/translations";
import { Skeleton } from "@/components/ui/skeleton";
import { FirstEventModal } from "@/components/FirstEventModal";
import { GradientHeader } from "@/components/ui/GradientHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// Use unified event mood taxonomy for filtering events
const EVENT_TYPES = VIBE_AND_MOOD_TAGS;

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
  
  // Price display helper function for translation
  const renderPrice = (price: string) => {
    if (price === "0") {
      return <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">{t('free')}</p>;
    } else {
      return (
        <>
          <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">${price}</p>
          <p className="text-[8px] sm:text-xs md:text-sm text-white/60">{t('perPerson')}</p>
        </>
      );
    }
  };
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  // Removed dateFilter state, as we'll always show all events organized by date
  const { events: fetchedEvents, isLoading } = useEvents(undefined, selectedCity);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [displayCount, setDisplayCount] = useState(24); // Increased initial count to display more items
  const itemsPerBatch = 12; // Load more items on each scroll
  const observerTarget = useRef(null);
  const [showFirstEventModal, setShowFirstEventModal] = useState(false);
  const [seenEmptyCities, setSeenEmptyCities] = useState<string[]>([]);
  
  const allEvents = fetchedEvents || [];

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    const matchesEventTypes = selectedEventTypes.length === 0 ||
                             event.tags?.some(tag => selectedEventTypes.includes(tag));
    
    return matchesSearch && matchesCategory && matchesEventTypes;
  });

  // Date utilities for categorizing events
  const now = new Date();
  
  // Reset hours to start of day for proper comparison
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  
  // Calculate end of today
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);
  
  // Calculate weekend boundaries (Friday, Saturday, Sunday)
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Find the upcoming weekend (if today is part of the weekend, include it)
  const endOfWeekend = new Date(startOfToday);
  if (dayOfWeek === 0) { // Sunday - weekend ends today
    // endOfWeekend is already today
  } else if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday - weekend ends on Sunday
    endOfWeekend.setDate(startOfToday.getDate() + (7 - dayOfWeek)); // Next Sunday
  } else { // Monday to Thursday - weekend starts on Friday
    endOfWeekend.setDate(startOfToday.getDate() + (5 - dayOfWeek) + 2); // Next Sunday (Friday + 2 days)
  }
  endOfWeekend.setHours(23, 59, 59, 999);
  
  // Next week starts after the weekend and goes for the next 7 days
  const startOfNextWeek = new Date(endOfWeekend);
  startOfNextWeek.setDate(endOfWeekend.getDate() + 1);
  startOfNextWeek.setHours(0, 0, 0, 0);
  
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
  
  // This month is everything after next week up to 30 days from today
  const endOfMonth = new Date(startOfToday);
  endOfMonth.setDate(startOfToday.getDate() + 30);

  // Group events by date categories
  const groupedEvents = {
    todayOnly: filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      // "TODAY'S EVENTS" - Events happening only today
      return eventDate >= startOfToday && eventDate <= endOfToday;
    }),
    weekend: filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      // "This Weekend" - Events happening after today but up to and including Sunday
      return eventDate > endOfToday && eventDate <= endOfWeekend;
    }),
    week: filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      // "Next Week" - Events happening after the weekend but within the next 7 days after that
      return eventDate > endOfWeekend && eventDate <= endOfNextWeek;
    }),
    month: filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      // "Events This Month" - Events happening after next week but within 30 days from today
      return eventDate > endOfNextWeek && eventDate < endOfMonth;
    }),
    upcoming: filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      // "Upcoming" - Events happening more than 30 days from now
      return eventDate >= endOfMonth;
    })
  };

  // Create a flattened list of all filtered events for display count
  const allFilteredEvents = [...filteredEvents];
  const hasMoreEvents = allFilteredEvents.length > displayCount;
  
  // Load more events when scrolling to the bottom
  const loadMoreEvents = useCallback(() => {
    if (hasMoreEvents) {
      setDisplayCount(prev => prev + itemsPerBatch);
    }
  }, [hasMoreEvents]);
  
  // Set up the intersection observer for infinite scrolling
  useEffect(() => {
    if (!observerTarget.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreEvents && !isLoading) {
        loadMoreEvents();
      }
    }, { 
      rootMargin: '100px' // Load more content before reaching the bottom
    });
    
    observer.observe(observerTarget.current);
    
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMoreEvents, isLoading, loadMoreEvents]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayCount(24); // Reset to initial count when filters change
  }, [searchTerm, selectedCity, selectedCategory, selectedEventTypes]);

  // Check for empty city and show modal if needed
  useEffect(() => {
    // Only check if we have a valid city (not 'all') and data is loaded
    const isEmptyCity = selectedCity !== 'all' && !isLoading && allEvents.length === 0;
    
    // Show modal if this is an empty city and we haven't shown it before for this city
    if (isEmptyCity && !seenEmptyCities.includes(selectedCity)) {
      setShowFirstEventModal(true);
    }
  }, [selectedCity, allEvents, isLoading, seenEmptyCities]);
  
  // Handle modal close
  const handleModalClose = () => {
    setShowFirstEventModal(false);
    // Add this city to the list of seen empty cities so we don't show the modal again
    setSeenEmptyCities(prev => [...prev, selectedCity]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FirstEventModal 
        cityName={selectedCity} 
        open={showFirstEventModal} 
        onClose={handleModalClose} 
      />
      <GradientHeader 
        title={t('discover')}
        showBackButton={false}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[130px] sm:w-[140px] md:w-[180px] bg-transparent border-border text-xs sm:text-sm">
              <SelectValue placeholder={t('selectCity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allLocations')}</SelectItem>
              {DIGITAL_NOMAD_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/connect")}
            className="hidden md:inline-flex items-center"
          >
            <Users className="h-5 w-5 mr-2" />
            {t('connect')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/connections")}
            className="hidden md:inline-flex items-center"
          >
            <UserCircle className="h-5 w-5 mr-2" />
            {t('yourNetwork')}
          </Button>
          <Button
            className="bg-primary/10 hover:bg-primary/20 whitespace-nowrap px-2 py-1 sm:py-2 md:px-4 text-xs sm:text-sm flex-shrink-0"
            onClick={() => setLocation("/create")}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:mr-2" />
            <span className="hidden md:inline">{t('publishEvent')}</span>
            <span className="inline md:hidden">{t('create')}</span>
          </Button>
        </div>
      </GradientHeader>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
            {/* Search and Filter Section */}
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Input
                  placeholder={t('searchEvents')}
                  className="pl-8 sm:pl-10 bg-background/5 border-border text-foreground h-9 text-xs sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Unified Filter Dropdown for both Mobile and Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full md:w-[180px] justify-between h-9 text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="truncate">{t('allCategories')}</span>
                    {selectedEventTypes.length > 0 && (
                      <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1.5">
                        {selectedEventTypes.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px] sm:w-[280px]">
                  <DropdownMenuLabel className="text-xs sm:text-sm">{t('searchByVibe')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
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
                        className="text-xs sm:text-sm"
                      >
                        {t(type)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                  {selectedEventTypes.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="justify-center text-muted-foreground text-xs sm:text-sm"
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
              <div className="flex flex-wrap gap-1.5 sm:gap-2 py-3 sm:py-4">
                {selectedEventTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="px-2 sm:px-3 py-0.5 sm:py-1 flex items-center gap-0.5 sm:gap-1 text-xs"
                  >
                    {type}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedEventTypes(prev => prev.filter(t => t !== type));
                      }}
                      className="ml-0.5 sm:ml-1 hover:text-destructive focus:outline-none"
                    >
                      <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEventTypes([])}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-6 sm:h-8 px-2 sm:px-3"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Date filters removed - vertical section headers will be used instead */}

          {/* Event Grid with Date Categories */}
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4">
              {filteredEvents.length} {t('eventsFound')}
            </h2>

            {isLoading ? (
              // Loading skeleton grid
              <div className="grid gap-4 gap-y-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm h-auto max-h-[calc(100vh-8rem)]">
                    <Skeleton className="aspect-[1/2] sm:aspect-[1/2] w-full" />
                    <div className="p-3 sm:p-4 space-y-2">
                      <Skeleton className="h-3 sm:h-4 w-3/4" />
                      <Skeleton className="h-3 sm:h-4 w-1/2" />
                      <Skeleton className="h-3 sm:h-4 w-5/6" />
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
                  {t('filters')}
                </Button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Today's Events Section */}
                {groupedEvents.todayOnly.length > 0 && (
                  <div className="space-y-4">
                    <div className="py-2">
                      <h2 className="text-base md:text-lg font-semibold text-gray-300">TODAY'S EVENTS</h2>
                    </div>
                    <div className="grid gap-4 gap-y-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                      {groupedEvents.todayOnly.map((event: any) => (
                        <Card 
                          key={event.id} 
                          className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-auto max-h-[calc(100vh-4rem)]"
                          onClick={() => setLocation(`/event/${event.id}`)}
                        >
                          <div className="relative aspect-[1/2] sm:aspect-[1/2] overflow-hidden">
                            <img
                              src={event.image || "/placeholder-event.jpg"}
                              alt={event.title}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center justify-between">
                                <div className="max-w-[70%]">
                                  <p className="text-[9px] sm:text-xs md:text-sm font-medium text-white/60">
                                    {format(new Date(event.date), "MMM d, h:mm a")}
                                  </p>
                                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-white mt-0.5 truncate">{event.title}</h3>
                                </div>
                                <div className="text-right text-white z-10">
                                  {event.price === "0" ? (
                                    <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">Free</p>
                                  ) : (
                                    <>
                                      <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">${event.price}</p>
                                      <p className="text-[8px] sm:text-xs md:text-sm text-white/60">per person</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-2 sm:p-3 md:p-4">
                            <div className="flex items-center justify-between flex-wrap gap-y-1 sm:gap-y-2">
                              <div className="flex items-center space-x-1 min-w-0 max-w-[50%]">
                                <MapPin className="h-2.5 w-2.5 sm:h-3 md:h-4 sm:w-3 md:w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
                                  {event.location}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 min-w-0 max-w-[50%]">
                                <Calendar className="h-2.5 w-2.5 sm:h-3 md:h-4 sm:w-3 md:w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
                                  {event.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1 sm:mt-2 md:mt-3">
                              {event.tags?.slice(0, 2).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0 sm:py-0.5 h-4 sm:h-5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* This Weekend Section */}
                {groupedEvents.weekend.length > 0 && (
                  <div className="space-y-4">
                    <div className="py-2">
                      <h2 className="text-base md:text-lg font-semibold text-gray-300">THIS WEEKEND</h2>
                    </div>
                    <div className="grid gap-4 gap-y-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                      {groupedEvents.weekend.map((event: any) => (
                        <Card 
                          key={event.id} 
                          className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-auto max-h-[calc(100vh-4rem)]"
                          onClick={() => setLocation(`/event/${event.id}`)}
                        >
                          <div className="relative aspect-[1/2] sm:aspect-[1/2] overflow-hidden">
                            <img
                              src={event.image || "/placeholder-event.jpg"}
                              alt={event.title}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="bg-black/30 text-[8px] sm:text-xs text-white px-1.5 py-0 sm:px-2 sm:py-0.5 border-white/10">
                                  {format(new Date(event.date), 'EEE, MMM d')}
                                </Badge>
                                {event.price && event.price !== "0" ? (
                                  <p className="font-medium text-white text-xs sm:text-sm">${event.price}</p>
                                ) : (
                                  <Badge variant="outline" className="bg-primary/20 text-[8px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5 border-primary/10">
                                    {t('free')}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-white text-xs sm:text-sm md:text-base mt-1 sm:mt-2 line-clamp-2">
                                {event.title}
                              </h3>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Events This Week Section */}
                {groupedEvents.week.length > 0 && (
                  <div className="space-y-4">
                    <div className="py-2">
                      <h2 className="text-base md:text-lg font-semibold text-gray-300">NEXT WEEK</h2>
                    </div>
                    <div className="grid gap-4 gap-y-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                      {groupedEvents.week.map((event: any) => (
                        <Card 
                          key={event.id} 
                          className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-auto max-h-[calc(100vh-4rem)]"
                          onClick={() => setLocation(`/event/${event.id}`)}
                        >
                          <div className="relative aspect-[1/2] sm:aspect-[1/2] overflow-hidden">
                            <img
                              src={event.image || "/placeholder-event.jpg"}
                              alt={event.title}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center justify-between">
                                <div className="max-w-[70%]">
                                  <p className="text-[9px] sm:text-xs md:text-sm font-medium text-white/60">
                                    {format(new Date(event.date), "MMM d, h:mm a")}
                                  </p>
                                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-white mt-0.5 truncate">{event.title}</h3>
                                </div>
                                <div className="text-right text-white z-10">
                                  {event.price === "0" ? (
                                    <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">Free</p>
                                  ) : (
                                    <>
                                      <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">${event.price}</p>
                                      <p className="text-[8px] sm:text-xs md:text-sm text-white/60">per person</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-2 sm:p-3 md:p-4">
                            <div className="flex items-center justify-between flex-wrap gap-y-1 sm:gap-y-2">
                              <div className="flex items-center space-x-1 min-w-0 max-w-[50%]">
                                <MapPin className="h-2.5 w-2.5 sm:h-3 md:h-4 sm:w-3 md:w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
                                  {event.location}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 min-w-0 max-w-[50%]">
                                <Calendar className="h-2.5 w-2.5 sm:h-3 md:h-4 sm:w-3 md:w-4 flex-shrink-0 text-muted-foreground" />
                                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
                                  {event.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1 sm:mt-2 md:mt-3">
                              {event.tags?.slice(0, 2).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-[9px] sm:text-xs px-1 sm:px-1.5 py-0 sm:py-0.5 h-4 sm:h-5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events This Month Section */}
                {groupedEvents.month.length > 0 && (
                  <div className="space-y-4">
                    <div className="py-2">
                      <h2 className="text-base md:text-lg font-semibold text-gray-300">THIS MONTH</h2>
                    </div>
                    <div className="grid gap-4 gap-y-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                      {groupedEvents.month.map((event: any) => (
                        <Card 
                          key={event.id} 
                          className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-auto max-h-[calc(100vh-4rem)]"
                          onClick={() => setLocation(`/event/${event.id}`)}
                        >
                          <div className="relative aspect-[1/2] sm:aspect-[1/2] overflow-hidden">
                            <img
                              src={event.image || "/placeholder-event.jpg"}
                              alt={event.title}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center justify-between">
                                <div className="max-w-[70%]">
                                  <p className="text-[9px] sm:text-xs md:text-sm font-medium text-white/60">
                                    {format(new Date(event.date), "MMM d, h:mm a")}
                                  </p>
                                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-white mt-0.5 truncate">{event.title}</h3>
                                </div>
                                <div className="text-right text-white z-10">
                                  {event.price === "0" ? (
                                    <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">Free</p>
                                  ) : (
                                    <>
                                      <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">${event.price}</p>
                                      <p className="text-[8px] sm:text-xs md:text-sm text-white/60">per person</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-2 sm:p-3 md:p-4">
                            <div className="flex items-center text-[10px] sm:text-xs mt-1 gap-2">
                              <Badge variant="outline" className="text-[8px] sm:text-[10px] md:text-xs px-1.5 py-0.5 whitespace-nowrap">
                                {event.category || "Event"}
                              </Badge>
                              {event.tags && event.tags[0] && (
                                <Badge variant="outline" className="text-[8px] sm:text-[10px] md:text-xs px-1.5 py-0.5 whitespace-nowrap">
                                  {event.tags[0]}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events Section */}
                {groupedEvents.upcoming.length > 0 && (
                  <div className="space-y-4">
                    <div className="py-2">
                      <h2 className="text-base md:text-lg font-semibold text-gray-300">UPCOMING</h2>
                    </div>
                    <div className="grid gap-4 gap-y-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                      {groupedEvents.upcoming.map((event: any) => (
                        <Card 
                          key={event.id} 
                          className="overflow-hidden bg-black/40 border-white/10 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg h-auto max-h-[calc(100vh-4rem)]"
                          onClick={() => setLocation(`/event/${event.id}`)}
                        >
                          <div className="relative aspect-[1/2] sm:aspect-[1/2] overflow-hidden">
                            <img
                              src={event.image || "/placeholder-event.jpg"}
                              alt={event.title}
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                              <div className="flex items-center justify-between">
                                <div className="max-w-[70%]">
                                  <p className="text-[9px] sm:text-xs md:text-sm font-medium text-white/60">
                                    {format(new Date(event.date), "MMM d, h:mm a")}
                                  </p>
                                  <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-white mt-0.5 truncate">{event.title}</h3>
                                </div>
                                <div className="text-right text-white z-10">
                                  {event.price === "0" ? (
                                    <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">Free</p>
                                  ) : (
                                    <>
                                      <p className="font-semibold text-white text-xs sm:text-sm md:text-lg">${event.price}</p>
                                      <p className="text-[8px] sm:text-xs md:text-sm text-white/60">per person</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-2 sm:p-3 md:p-4">
                            <div className="flex items-center text-[10px] sm:text-xs mt-1 gap-2">
                              <Badge variant="outline" className="text-[8px] sm:text-[10px] md:text-xs px-1.5 py-0.5 whitespace-nowrap">
                                {event.category || "Event"}
                              </Badge>
                              {event.tags && event.tags[0] && (
                                <Badge variant="outline" className="text-[8px] sm:text-[10px] md:text-xs px-1.5 py-0.5 whitespace-nowrap">
                                  {event.tags[0]}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Events Message */}
                {groupedEvents.todayOnly.length === 0 && 
                 groupedEvents.weekend.length === 0 &&
                 groupedEvents.week.length === 0 && 
                 groupedEvents.month.length === 0 && 
                 groupedEvents.upcoming.length === 0 && (
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
                )}

                {/* Intersection Observer Target for Infinite Scrolling */}
                {hasMoreEvents && (
                  <div 
                    ref={observerTarget} 
                    className="h-10 w-full flex items-center justify-center mt-8 mb-4"
                  >
                    {isLoading ? (
                      <div className="animate-pulse flex space-x-2">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Scroll for more events</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </ScrollArea>
    </div>
  );
}
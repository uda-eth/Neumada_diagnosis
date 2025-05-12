
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, MapPin, Search, Filter, UserCircle, Heart, X } from "lucide-react";
import { GradientHeader } from "@/components/ui/GradientHeader";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

// Mood badge styles configuration
// User interface based on the database schema
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  profileType?: string;
  gender?: string | null;
  sexualOrientation?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  profileImages?: string[];
  location?: string | null;
  birthLocation?: string | null;
  nextLocation?: string | null;
  interests?: string[] | null;
  currentMoods?: string[] | null;
  profession?: string | null;
  age?: number | null;
  createdAt?: Date | string | null;
}

const moodStyles = {
  // New vibe and mood tags
  "Party & Nightlife": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Fashion & Style": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking & Business": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Dining & Drinks": "bg-green-500/20 text-green-500 hover:bg-green-500/30",
  "Outdoor & Nature": "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30",
  "Wellness & Fitness": "bg-teal-500/20 text-teal-500 hover:bg-teal-500/30",
  "Creative & Artsy": "bg-violet-500/20 text-violet-500 hover:bg-violet-500/30",
  "Single & Social": "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30",
  "Chill & Recharge": "bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30",
  "Adventure & Exploring": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Spiritual & Intentional": "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
  
  // Keep legacy styles for backward compatibility
  "Dating": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Parties": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Adventure": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Dining Out": "bg-green-500/20 text-green-500 hover:bg-green-500/30",
  "Working": "bg-slate-500/20 text-slate-500 hover:bg-slate-500/30",
  "Exploring": "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30",
  "Learning": "bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30", 
  "Teaching": "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
  "Socializing": "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30",
  "Focusing": "bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30",
  "Relaxing": "bg-teal-500/20 text-teal-500 hover:bg-teal-500/30",
  "Creating": "bg-violet-500/20 text-violet-500 hover:bg-violet-500/30"
} as const;

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

const interests = [
  "Travel",
  "Digital Marketing",
  "Photography",
  "Entrepreneurship",
  "Tech",
  "Fitness",
  "Art",
  "Music",
  "Food",
  "Fashion"
];

import { useUser } from "@/hooks/use-user";
import { VIBE_AND_MOOD_TAGS } from "@/lib/constants";

const moods = VIBE_AND_MOOD_TAGS;

export function ConnectPage() {
  const [, setLocation] = useLocation();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const { toast } = useToast();

  // Fetch real users from the API
  const { user: currentUser } = useUser();
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery<User[]>({
    queryKey: ['users', selectedCity, selectedMoods, currentUser?.id],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (selectedCity !== 'all') {
        params.append('city', selectedCity);
      }

      if (currentUser?.id) {
        params.append('currentUserId', currentUser.id.toString());
      }
      
      // Add moods as array parameters - ensure this is working
      if (selectedMoods.length > 0) {
        // Try multiple parameter formats to ensure compatibility with server
        // Format 1: Standard array notation as 'moods[]'
        selectedMoods.forEach(mood => {
          params.append('moods[]', mood);
        });
        
        // Format 2: Also add as 'moods' parameter for frameworks that might handle it differently
        params.append('moods', selectedMoods.join(','));
        
        console.log(`Including mood filters: ${selectedMoods.join(', ')}`);
      }
      
      // Log the query for debugging
      const queryString = params.toString();
      console.log(`Fetching users with filters: ${queryString}`);
      
      // Use the properly formatted query string
      const response = await fetch(`/api/users/browse?${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const results = await response.json();
      console.log(`Received ${results.length} users from server`);
      return results;
    },
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Filter the user results client-side for search terms only
  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || 
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  }) || [];

  const toggleFilter = (item: string) => {
    setSelectedMoods(prev => {
      const newMoods = prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item];
      console.log(`Updated moods: ${newMoods.join(', ')}`);
      return newMoods;
    });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <GradientHeader
        title="Connect"
        backButtonFallbackPath="/discover"
      >
        <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          <Link href="/connections">
            <Button variant="outline" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm h-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <UserCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">Connections</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm h-8 text-white hover:bg-white/10"
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">Filters</span>
            {selectedMoods.length > 0 && (
              <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1.5">
                {selectedMoods.length}
              </Badge>
            )}
          </Button>
        </div>
      </GradientHeader>

      <div className="mb-8 space-y-4">
        {/* Location and Mood filters - Primary Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Location Filter - Positioned at top-left */}
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full md:w-[180px] bg-background/5 border-border h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Mood Filter - Enhanced pill-style toggles with better visual feedback */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium transition-colors 
                  ${selectedMoods.includes(mood) 
                    ? moodStyles[mood as keyof typeof moodStyles] + ' shadow-sm' 
                    : 'border border-border bg-background/5 hover:bg-accent/20'}`}
                onClick={() => toggleFilter(mood)}
              >
                {selectedMoods.includes(mood) && (
                  <span className="mr-0.5 sm:mr-1">✓</span>
                )}
                {mood}
              </button>
            ))}
            {selectedMoods.length > 0 && (
              <button
                className="rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-muted-foreground border border-border bg-background/5 hover:bg-accent/20"
                onClick={() => setSelectedMoods([])}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Additional filters - Expanded section */}
        {isFiltersVisible && (
          <div className="space-y-3 sm:space-y-4 bg-accent/5 p-3 sm:p-4 rounded-lg border border-border">
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-xs sm:text-sm font-medium">Search</h3>
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Interests filter removed - now only filtering by moods */}
          </div>
        )}

        {/* Display selected filters count if any */}
        {selectedMoods.length > 0 && (
          <div className="py-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {filteredUsers.length} People Found
            </h2>
          </div>
        )}
      </div>

      {/* Dating app-style horizontal scrolling carousel */}
      <div className="w-full">
        {isLoading ? (
          // Loading skeletons in carousel format
          <Carousel className="w-full">
            <CarouselContent>
              {Array(6).fill(0).map((_, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="p-1">
                    <Card className="overflow-hidden h-full w-full">
                      <CardContent className="p-0">
                        <div className="flex flex-col h-full">
                          <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted">
                            <Skeleton className="h-full w-full" />
                          </div>
                          <div className="p-3 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <div className="flex gap-1 mt-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-16" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : filteredUsers.length > 0 ? (
          // Real users from database in carousel format
          <Carousel className="w-full">
            <CarouselContent>
              {filteredUsers.map((user) => (
                <CarouselItem 
                  key={user.id} 
                  className="sm:basis-2/3 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="p-1">
                    <Link href={`/profile/${user.username}`} className="block h-full">
                      <Card className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer group h-full">
                        <CardContent className="p-0">
                          <div className="flex flex-col h-full">
                            <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.fullName || user.username}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                                  <UserCircle className="h-20 w-20 text-primary/50" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-base text-white truncate">
                                      {user.fullName || user.username}
                                      {user.age && `, ${user.age}`}
                                    </h3>
                                  </div>
                                  {user.location && (
                                    <div className="flex items-center text-sm text-white/80">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      <span className="truncate">{user.location}</span>
                                    </div>
                                  )}
                                  {user.currentMoods && user.currentMoods.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {user.currentMoods.map((mood, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className={`${moodStyles[mood as keyof typeof moodStyles] || 'bg-secondary'} text-xs`}
                                        >
                                          {mood}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="p-3">
                              {user.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {user.bio}
                                </p>
                              )}
                              {user.interests && user.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {user.interests.slice(0, 3).map((interest, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-5 sm:-left-8" />
              <CarouselNext className="-right-5 sm:-right-8" />
            </div>
          </Carousel>
        ) : (
          // No users found
          <div className="py-12 text-center w-full">
            <p className="text-muted-foreground text-lg">No users found matching your criteria.</p>
            <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedMoods([]);
                setSelectedCity("all"); 
              }}
              className="mt-4"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
      <div className="py-8 border-y border-border/10 bg-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Premium Ad Partner
          </p>
          <img
            src="/attached_assets/Screenshot 2025-03-05 at 8.09.43 AM.png"
            alt="Premium Ad Partner"
            className="w-full max-w-md mx-auto h-auto object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default ConnectPage;

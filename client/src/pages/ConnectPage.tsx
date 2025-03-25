import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, MapPin, Search, Filter, UserCircle } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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

const moods = [
  "Dating",
  "Networking",
  "Parties",
  "Adventure",
  "Dining Out"
];

export function ConnectPage() {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const { toast } = useToast();

  // Fetch real users from the API
  const {
    data: users,
    isLoading,
    error
  } = useQuery<User[]>({
    queryKey: ['users', selectedCity, selectedInterests, selectedMoods],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (selectedCity !== 'all') {
        params.append('city', selectedCity);
      }
      
      selectedInterests.forEach(interest => {
        params.append('interests[]', interest);
      });
      
      selectedMoods.forEach(mood => {
        params.append('moods[]', mood);
      });
      
      const response = await fetch(`/api/users/browse?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json();
    }
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

  // Filter the user results client-side for search terms
  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm || 
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  }) || [];

  const toggleFilter = (item: string, type: 'interests' | 'moods') => {
    const setterFn = type === 'interests' ? setSelectedInterests : setSelectedMoods;
    setterFn(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Connect</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFiltersVisible && (
        <div className="space-y-4 bg-accent/5 p-4 rounded-lg border border-border">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleFilter(interest, 'interests')}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Mood</h3>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <Badge
                  key={mood}
                  variant={selectedMoods.includes(mood) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedMoods.includes(mood) ? moodStyles[mood as keyof typeof moodStyles] : ''}`}
                  onClick={() => toggleFilter(mood, 'moods')}
                >
                  {mood}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
        {isLoading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden h-full">
              <CardContent className="p-0">
                <div className="flex flex-col h-full">
                  <div className="relative w-full aspect-square overflow-hidden bg-muted">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-1 mt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredUsers.length > 0 ? (
          // Real users from database
          filteredUsers.map((user) => (
            <Link key={user.id} href={`/profile/${user.username}`}>
              <Card className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer group h-full">
                <CardContent className="p-0">
                  <div className="flex flex-col h-full">
                    <div className="relative w-full aspect-square overflow-hidden bg-muted">
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
                                  className={`${moodStyles[mood] || 'bg-secondary'} text-xs`}
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
          ))
        ) : (
          // No users found
          <div className="col-span-3 py-12 text-center">
            <p className="text-muted-foreground">No users found matching your criteria.</p>
            <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
      <div className="py-8 border-y border-border/10 bg-accent/5">
        <div className="container">
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
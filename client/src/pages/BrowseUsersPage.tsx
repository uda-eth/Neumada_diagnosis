import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@db/schema";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

// List of hub cities
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
  "Party",
  "Socializing",
  "Dating",
  "Networking",
  "Exploring",
  "Chilling",
  "Adventure",
  "Cultural",
  "Learning",
  "Working"
];

const getProfileImage = (user: User): string | undefined => {
  if (user.profileImages && user.profileImages.length > 0) {
    return user.profileImages[0];
  }
  return user.profileImage || undefined;
};

export default function BrowseUsersPage() {
  const [, setLocation] = useLocation();
  const [selectedCity, setSelectedCity] = useState<string>("Bali");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState({ min: "", max: "" });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/browse', selectedCity, selectedGender, selectedInterests, selectedMoods, ageRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedGender !== 'all') params.append('gender', selectedGender);
      if (ageRange.min) params.append('minAge', ageRange.min);
      if (ageRange.max) params.append('maxAge', ageRange.max);
      if (selectedInterests.length > 0) {
        selectedInterests.forEach(interest => 
          params.append('interests[]', interest)
        );
      }
      if (selectedMoods.length > 0) {
        selectedMoods.forEach(mood => 
          params.append('moods[]', mood)
        );
      }

      const response = await fetch(`/api/users/browse?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      return data;
    },
  });

  const toggleFilter = (item: string, filterType: 'interests' | 'moods') => {
    const setterFn = filterType === 'interests' ? setSelectedInterests : setSelectedMoods;
    setterFn(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with City Selection */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Connect in {selectedCity}</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                Filters
              </Button>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters Panel */}
        <AnimatePresence>
          {isFiltersVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/50 p-6 rounded-lg">
                <div className="space-y-4">
                  <h3 className="font-semibold">Demographics</h3>
                  <div className="space-y-4">
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min age"
                        value={ageRange.min}
                        onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max age"
                        value={ageRange.max}
                        onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(interest => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => toggleFilter(interest, 'interests')}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Current Mood</h3>
                  <div className="flex flex-wrap gap-2">
                    {moods.map(mood => (
                      <Badge
                        key={mood}
                        variant={selectedMoods.includes(mood) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => toggleFilter(mood, 'moods')}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {users?.map((user) => (
              <motion.div
                key={user.id}
                variants={item}
                layout
                className="group cursor-pointer"
                onClick={() => setLocation(`/profile/${user.username}`)}
              >
                <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 group-hover:shadow-xl">
                  <div className="aspect-[3/4] relative">
                    {getProfileImage(user) ? (
                      <img
                        src={getProfileImage(user)}
                        alt={user.fullName || user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback>
                            {(user.fullName?.[0] || user.username[0]).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    {/* Overlay with user info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">{user.fullName || user.username}</h3>
                          <span className="text-sm flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {user.age}
                          </span>
                        </div>
                        {user.location && (
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <MapPin className="w-3 h-3" />
                            {user.location}
                          </div>
                        )}
                        {user.interests && user.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.interests.slice(0, 2).map(interest => (
                              <span 
                                key={interest} 
                                className="text-xs bg-white/20 px-2 py-0.5 rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                            {user.interests.length > 2 && (
                              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                +{user.interests.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
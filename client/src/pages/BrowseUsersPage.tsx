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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Calendar, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@db/schema";

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
  hidden: { opacity: 0, scale: 0.9 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

const cities = [
  "London",
  "New York",
  "Los Angeles",
  "Paris",
  "Tokyo",
  "Berlin",
  "Sydney",
  "Singapore",
  "Dubai",
  "Mumbai"
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

export default function BrowseUsersPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState({ min: "", max: "" });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/browse', searchTerm, selectedCity, selectedGender, selectedInterests, selectedMoods, ageRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
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
      return response.json();
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
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Connect</h1>
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
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {isFiltersVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/50 p-6 rounded-lg">
                  {/* Demographics */}
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

                  {/* Interests */}
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

                  {/* Current Mood */}
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

          {/* Members Grid */}
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
              <AnimatePresence>
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
                        {user.profileImages?.[0] ? (
                          <img
                            src={user.profileImages[0]}
                            alt={user.fullName || user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Avatar className="h-20 w-20">
                              <AvatarFallback>
                                {user.fullName?.[0] || user.username[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="font-bold">{user.fullName || user.username}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-3 h-3" />
                              {user.location}
                            </div>
                            {user.interests && user.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {user.interests.slice(0, 2).map(interest => (
                                  <span key={interest} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
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
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
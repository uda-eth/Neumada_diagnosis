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
    const currentFilters = filterType === 'interests' ? selectedInterests : selectedMoods;

    setterFn(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Header and Search */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl">Discover Members</h1>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-muted/50 p-6 rounded-lg">
            {/* Location and Demographics */}
            <div className="space-y-4">
              <h3 className="font-semibold">Location & Demographics</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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

                <Input
                  type="number"
                  placeholder="Min age"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max age"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full"
                />
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

            {/* Moods */}
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

          {/* Users Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
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
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
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
                            {user.location && (
                              <p className="text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {user.location}
                              </p>
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
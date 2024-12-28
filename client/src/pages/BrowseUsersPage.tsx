import { useState } from "react";
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
import { Search, MapPin, Briefcase, Calendar } from "lucide-react";
import { motion } from "framer-motion";
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
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

export default function BrowseUsersPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState({ min: "", max: "" });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/browse', searchTerm, selectedCity, selectedGender, selectedInterests, ageRange],
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
      const response = await fetch(`/api/users/browse?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const allInterests = Array.from(
    new Set(
      users?.flatMap(user => user.interests || []) || []
    )
  ).sort();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl mb-8">Discover Members</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Age</label>
                <Input
                  type="number"
                  placeholder="Min age"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, min: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Age</label>
                <Input
                  type="number"
                  placeholder="Max age"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg mb-2">Filter by Interests</h3>
            <div className="flex flex-wrap gap-2">
              {allInterests.map(interest => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading members...</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {users?.map((user) => (
              <motion.div key={user.id} variants={item}>
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-200"
                  onClick={() => setLocation(`/profile/${user.username}`)}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.profileImage || undefined} />
                      <AvatarFallback>
                        {user.fullName?.[0] || user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{user.fullName || user.username}</CardTitle>
                      <CardDescription>@{user.username}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {user.location && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </div>
                    )}
                    {user.profession && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Briefcase className="w-4 h-4" />
                        {user.profession}
                      </div>
                    )}
                    {user.age && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        {user.age} years old
                      </div>
                    )}
                    {user.interests && user.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.interests.map(interest => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="text-xs"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
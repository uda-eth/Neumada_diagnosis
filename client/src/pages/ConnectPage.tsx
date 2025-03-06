import { useState } from "react";
import { useLocation } from "wouter";
import { members } from "@/lib/members-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, MapPin, Search, Filter } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "wouter";

// Mood badge styles configuration
const moodStyles = {
  "Dating": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Parties": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Adventure": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Dining Out": "bg-green-500/20 text-green-500 hover:bg-green-500/30"
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

  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === "" ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "all" || member.location === selectedCity;
    const matchesInterests = selectedInterests.length === 0 ||
      selectedInterests.some(interest => member.interests.includes(interest));
    const matchesMoods = selectedMoods.length === 0 ||
      selectedMoods.some(mood => member.currentMoods.includes(mood));

    return matchesSearch && matchesCity && matchesInterests && matchesMoods;
  });

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
        {filteredMembers.map((member) => (
          <Link key={member.id} href={`/profile/${member.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <Card className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer group h-full">
              <CardContent className="p-0">
                <div className="flex flex-col h-full">
                  <div className="relative w-full aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-base text-white truncate">
                            {member.name}, {member.age}
                          </h3>
                        </div>
                        <div className="flex items-center text-sm text-white/80">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{member.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.currentMoods.map((mood, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={`${moodStyles[mood]} text-xs`}
                            >
                              {mood}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {member.bio}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.interests.slice(0, 3).map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
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
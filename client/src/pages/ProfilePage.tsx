import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Globe, MessageSquare, UserPlus2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import type { User, Event } from "@db/schema";

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

export default function ProfilePage() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useUser();

  const { data: profile, isLoading: isLoadingProfile } = useQuery<User>({
    queryKey: [`/api/users/${username}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
  });

  const { data: userEvents, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: [`/api/users/${username}/events`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${username}/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  if (isLoadingProfile || isLoadingEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-[#121212] text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        User not found
      </motion.div>
    );
  }

  const currentImageIndex = 0; // TODO: Add image carousel state

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        {/* Profile Content */}
        <div className="max-w-2xl mx-auto">
          {/* Profile Image Section */}
          <motion.div 
            className="relative aspect-[4/5] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={profile.profileImage || profile.profileImages?.[currentImageIndex]}
              alt={profile.fullName || profile.username}
              className="w-full h-full object-cover rounded-lg"
            />
            {profile.profileImages && profile.profileImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </motion.div>

          {/* User Info */}
          <motion.div
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <h1 className="text-2xl font-bold">{profile.fullName}</h1>
              {profile.profession && (
                <p className="text-white/60">{profile.profession}</p>
              )}
            </motion.div>

            {/* Tags/Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <motion.div variants={item} className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={item} className="flex gap-4">
              <Button className="flex-1 h-12">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" className="flex-1 h-12">
                <UserPlus2 className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </motion.div>

            {/* User Status */}
            <motion.div variants={item} className="space-y-4 border-t border-white/10 pt-6">
              {profile.currentMoods && profile.currentMoods.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">MOOD</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.currentMoods.map((mood) => (
                      <span key={mood} className="text-white/80">
                        {mood}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.birthLocation && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">BORN</h3>
                  <p className="text-white/80">{profile.birthLocation}</p>
                </div>
              )}

              {profile.location && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">LIVE & LOCAL</h3>
                  <p className="text-white/80">{profile.location}</p>
                </div>
              )}

              {profile.nextLocation && (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">NEXT</h3>
                  <p className="text-white/80">{profile.nextLocation}</p>
                </div>
              )}
            </motion.div>

            {/* Recent Events */}
            {userEvents && userEvents.length > 0 && (
              <motion.div variants={item} className="border-t border-white/10 pt-6">
                <h2 className="text-lg font-semibold mb-4">Recently Published Events</h2>
                <div className="space-y-4">
                  {userEvents.slice(0, 3).map((event) => (
                    <Card
                      key={event.id}
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => setLocation(`/event/${event.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-24 h-24 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold mb-2">{event.title}</h3>
                            <div className="flex items-center gap-2 text-white/60">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(event.date), "PPP")}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
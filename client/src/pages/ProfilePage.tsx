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
import { Calendar, MapPin, Globe } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
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
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        User not found
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="ghost" onClick={() => setLocation("/")}>
            Back to Events
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage src={profile.profileImage} />
                      <AvatarFallback>
                        {profile.fullName?.[0] || profile.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <CardTitle>{profile.fullName}</CardTitle>
                  <CardDescription>@{profile.username}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {profile.bio && (
                  <motion.div 
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{profile.bio}</p>
                  </motion.div>
                )}
                {profile.location && (
                  <motion.div 
                    className="flex items-center gap-2 text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </motion.div>
                )}
                {profile.interests && profile.interests.length > 0 && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-semibold mb-2">Interests</h3>
                    <motion.div 
                      className="flex flex-wrap gap-2"
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      {profile.interests.map((interest) => (
                        <motion.div
                          key={interest}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm hover-transition"
                          variants={item}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          {interest}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">Events</h2>
            <motion.div 
              className="grid gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence>
                {userEvents?.map((event) => (
                  <motion.div
                    key={event.id}
                    variants={item}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setLocation(`/event/${event.id}`)}
                    >
                      <div className="grid md:grid-cols-3 gap-4">
                        {event.image && (
                          <motion.img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-32 object-cover rounded-l-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          />
                        )}
                        <div className="md:col-span-2 p-4">
                          <h3 className="font-semibold text-lg mb-2">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(event.date), "PPP")}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {event.category}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
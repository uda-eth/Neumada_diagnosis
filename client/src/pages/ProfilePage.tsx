import { useParams, useLocation } from "wouter";
import { members } from "@/lib/members-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, MapPin, MessageSquare, UserPlus2, Smile } from "lucide-react";
import { motion } from "framer-motion";

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

// Mood badge styles configuration
const moodStyles = {
  "Dating": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Parties": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Adventure": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Dining Out": "bg-green-500/20 text-green-500 hover:bg-green-500/30"
} as const;

export default function ProfilePage() {
  const { username } = useParams();
  const [, setLocation] = useLocation();

  const profile = members.find(
    (member) => member.name.toLowerCase().replace(/\s+/g, '-') === username
  );

  const handleMessageClick = () => {
    if (profile) {
      setLocation(`/chat/${profile.id}`);
    }
  };

  if (!profile) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Member not found
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
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

        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="relative aspect-[4/5] mb-8 rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <h1 className="text-2xl font-semibold flex items-center gap-4">
                {profile.name}, {profile.age}
              </h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                {profile.location}
              </div>
              <p className="text-muted-foreground mt-2">{profile.occupation}</p>
            </motion.div>

            <motion.div variants={item}>
              <p className="text-lg">{profile.bio}</p>
            </motion.div>

            {/* Current Mood Section */}
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold mb-3">Current Mood</h3>
              <div className="flex flex-wrap gap-2">
                {profile.currentMoods.map((mood, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary"
                    className={`${moodStyles[mood]} flex items-center gap-1`}
                  >
                    <Smile className="w-3 h-3" />
                    {mood}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Interests Section */}
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <Badge 
                    key={idx} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-3 py-1"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={item} className="flex gap-4">
              <Button 
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                onClick={handleMessageClick}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" className="flex-1 h-12">
                <UserPlus2 className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
import { useParams, useLocation } from "wouter";
import { members } from "@/lib/members-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, MapPin, MessageSquare, UserPlus2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

  // Find the member based on the URL parameter
  const profile = members.find(
    (member) => member.name.toLowerCase().replace(/\s+/g, '-') === username
  );

  if (!profile) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-background text-foreground"
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

          {/* User Info */}
          <motion.div
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <h1 className="text-2xl font-semibold">{profile.name}, {profile.age}</h1>
              <div className="flex items-center text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                {profile.location}
              </div>
              <p className="text-muted-foreground mt-2">{profile.occupation}</p>
            </motion.div>

            {/* Bio */}
            <motion.div variants={item}>
              <p className="text-lg">{profile.bio}</p>
            </motion.div>

            {/* Interests */}
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <Badge key={idx} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </motion.div>

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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
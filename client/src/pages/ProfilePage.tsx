import { useParams, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronLeft, 
  MapPin, 
  MessageSquare, 
  UserPlus2, 
  Smile, 
  Edit2,
  Heart, 
  Globe,
  Home,
  PenTool,
  Briefcase,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const { user } = useUser();

  // If no username is provided, show the logged-in user's profile
  const isOwnProfile = !username;
  const profile = user;

  const handleBackClick = () => {
    setLocation('/');
  };

  const handleEditClick = () => {
    setLocation('/profile/edit');
  };

  if (!profile && !isOwnProfile) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Profile not found
      </motion.div>
    );
  }

  // If user is not logged in, redirect to auth page
  if (!profile && isOwnProfile) {
    setLocation('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8 flex justify-between items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="ghost" onClick={handleBackClick}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {isOwnProfile && (
            <Button onClick={handleEditClick} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Profile Header */}
            <motion.div variants={item} className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="w-32 h-32 rounded-lg border-4 border-primary/10">
                <AvatarImage 
                  src={profile?.profileImage || "/attached_assets/profile-image-1.jpg"} 
                  alt={profile?.fullName || "User"} 
                />
                <AvatarFallback>
                  {profile?.fullName?.charAt(0) || profile?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold">
                  {profile?.fullName || profile?.username}
                  {profile?.age && <span className="ml-2 text-muted-foreground">{profile.age}</span>}
                </h1>
                
                <div className="flex flex-col md:flex-row gap-2 mt-2 items-center md:items-start">
                  {profile?.profession && (
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {profile.profession}
                    </div>
                  )}
                  
                  {profile?.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  
                  {profile?.gender && (
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      {profile.gender}
                    </div>
                  )}
                </div>
                
                {/* Bio */}
                {profile?.bio && (
                  <div className="mt-4">
                    <p className="text-lg">{profile.bio}</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <Separator />
            
            {/* Locations */}
            <motion.div variants={item}>
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-primary" />
                    Locations
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.location && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Current</span>
                        <span className="font-medium">{profile.location}</span>
                      </div>
                    )}
                    
                    {profile?.birthLocation && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Born</span>
                        <span className="font-medium">{profile.birthLocation}</span>
                      </div>
                    )}
                    
                    {profile?.nextLocation && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Upcoming</span>
                        <span className="font-medium">{profile.nextLocation}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Moods Section */}
            {profile?.currentMoods && profile.currentMoods.length > 0 && (
              <motion.div variants={item}>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Smile className="w-5 h-5 mr-2 text-primary" />
                      Current Mood
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {profile.currentMoods.map((mood, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Smile className="w-3 h-3" />
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Interests Section */}
            {profile?.interests && profile.interests.length > 0 && (
              <motion.div variants={item}>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-primary" />
                      Interests
                    </h3>
                    
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
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Action Buttons - Only show if viewing someone else's profile */}
            {!isOwnProfile && (
              <motion.div variants={item} className="flex gap-4">
                <Button 
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                  onClick={() => setLocation(`/chat/${profile?.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" className="flex-1 h-12">
                  <UserPlus2 className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
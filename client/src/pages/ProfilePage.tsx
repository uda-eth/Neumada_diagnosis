import { motion } from "framer-motion";
import { useParams, useLocation } from "wouter";
import { useUser } from "../hooks/use-user";
import { UserCircle } from "lucide-react";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
  const { username } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();

  // Check if this is viewing own profile or another user's profile
  const isOwnProfile = !username || (user && user.username === username);

  // If viewing another user's profile, we'll need to fetch their data
  // For now using mock data until API endpoint is ready
  const profile = isOwnProfile ? user : null; // This will be replaced with API call

  const handleBackClick = () => {
    setLocation('/');
  };

  const handleEditClick = () => {
    setLocation('/profile-edit');
  };

  if (!profile && !isOwnProfile) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Loading profile...
      </motion.div>
    );
  }

  // If user is not logged in and trying to view their own profile, redirect to auth
  if (!profile && isOwnProfile) {
    setLocation('/auth');
    return null;
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={handleBackClick} className="text-sm font-medium">
            ← Back
          </button>
          {isOwnProfile && (
            <button 
              onClick={handleEditClick}
              className="text-sm font-medium text-primary"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden">
              {profile?.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt={profile.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-16 h-16" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile?.fullName}</h1>
              <p className="text-muted-foreground">@{profile?.username}</p>
            </div>
          </div>

          {profile?.bio && (
            <motion.div variants={item}>
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-muted-foreground">{profile.bio}</p>
            </motion.div>
          )}

          {profile?.interests && profile.interests.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-lg font-semibold mb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span 
                    key={interest}
                    className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";

interface ProfileData {
  id: number;
  username: string;
  fullName?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  profileImage?: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      setLoading(true);
      setError(null);
      
      try {
        // If no username provided, show current user's profile
        const targetUsername = username || currentUser?.username;
        if (!targetUsername) {
          setError("No profile specified");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/users/${targetUsername}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [username, currentUser?.username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Profile not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          {profileData.profileImage && (
            <img 
              src={profileData.profileImage}
              alt={profileData.fullName || profileData.username}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{profileData.fullName || profileData.username}</h1>
            {profileData.location && (
              <p className="text-gray-600">{profileData.location}</p>
            )}
          </div>
        </div>
        
        {profileData.bio && (
          <p className="mt-6 text-gray-700">{profileData.bio}</p>
        )}

        {profileData.interests && profileData.interests.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

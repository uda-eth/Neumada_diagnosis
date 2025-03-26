
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Loader2, ArrowLeft, MapPin, Mail, Briefcase, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  profession: string | null;
  age: number | null;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { username } = useParams();
  const { user: currentUser } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) throw new Error('Failed to fetch profile data');
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profileData) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => setLocation('/connect')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Connect
      </Button>

      <Card className="max-w-3xl mx-auto">
        <CardHeader className="relative">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-2">
              <AvatarImage src={profileData.profileImage || undefined} alt={profileData.username} />
              <AvatarFallback>{profileData.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{profileData.fullName || profileData.username}</h1>
              {profileData.bio && (
                <p className="text-muted-foreground">{profileData.bio}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {profileData.location && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profileData.location}
                  </Badge>
                )}
                {profileData.profession && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {profileData.profession}
                  </Badge>
                )}
                {profileData.age && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {profileData.age} years old
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profileData.interests && profileData.interests.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, index) => (
                  <Badge key={index} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

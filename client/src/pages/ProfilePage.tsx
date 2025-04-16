
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, MapPin, Mail, Briefcase, Calendar, UserPlus, Check, X, UserCheck, Smile, Heart, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mood badge styles configuration
const moodStyles = {
  "Dating": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Parties": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Adventure": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Dining Out": "bg-green-500/20 text-green-500 hover:bg-green-500/30",
  "Working": "bg-slate-500/20 text-slate-500 hover:bg-slate-500/30",
  "Exploring": "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30",
  "Learning": "bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30",
  "Teaching": "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
  "Socializing": "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30",
  "Focusing": "bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30",
  "Relaxing": "bg-teal-500/20 text-teal-500 hover:bg-teal-500/30",
  "Creating": "bg-violet-500/20 text-violet-500 hover:bg-violet-500/30"
} as const;

interface ProfileData {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  profileImage: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  currentMoods?: string[] | null;
  profession: string | null;
  age: number | null;
}

interface ConnectionStatus {
  outgoing: {
    status: string;
    date: string;
  } | null;
  incoming: {
    status: string;
    date: string;
  } | null;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { username } = useParams();
  const { user: currentUser } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingMood, setIsUpdatingMood] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Available moods for selection
  const moods = [
    "Dating",
    "Networking",
    "Parties",
    "Adventure",
    "Dining Out",
    "Working",
    "Exploring",
    "Learning",
    "Teaching",
    "Socializing",
    "Focusing",
    "Relaxing",
    "Creating"
  ];
  
  // If we're at /profile (without a username), we want to show the current user's profile
  // And redirect to /profile/{username} for proper routing
  useEffect(() => {
    if (!username && currentUser?.username) {
      setLocation(`/profile/${currentUser.username}`);
    }
  }, [username, currentUser, setLocation]);

  // Get the connection status between current user and profile user
  const {
    data: connectionStatus,
    isLoading: connectionLoading,
  } = useQuery<ConnectionStatus>({
    queryKey: ['connection-status', profileData?.id, currentUser?.id],
    queryFn: async () => {
      if (!profileData?.id || !currentUser?.id) {
        return { outgoing: null, incoming: null };
      }
      const response = await fetch(`/api/connections/status/${profileData.id}`);
      if (!response.ok) throw new Error('Failed to fetch connection status');
      return response.json();
    },
    enabled: !!profileData?.id && !!currentUser?.id,
  });

  // Create a connection request
  const createConnectionMutation = useMutation({
    mutationFn: async (targetUserId: number) => {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send connection request');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Connection request sent',
        description: 'Your connection request has been sent successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['connection-status', profileData?.id, currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Accept a connection request
  const respondToConnectionMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: number, status: 'accepted' | 'declined' }) => {
      const response = await fetch(`/api/connections/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${status} connection request`);
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'accepted' ? 'Connection accepted' : 'Connection declined',
        description: variables.status === 'accepted' 
          ? 'You are now connected with this user.' 
          : 'You have declined this connection request.',
      });
      queryClient.invalidateQueries({ queryKey: ['connection-status', profileData?.id, currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update mood mutation
  const updateMoodMutation = useMutation({
    mutationFn: async (mood: string) => {
      console.log('Updating mood with:', mood ? [mood] : []);
      const response = await fetch('/api/profile', {
        method: 'POST', // Changed from PATCH to POST to match server endpoint
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentMoods: mood ? [mood] : [] 
        }),
      });
      
      if (!response.ok) {
        // Fix for HTML error response handling
        try {
          const errorText = await response.text();
          // Check if response is HTML (typical for redirect to login page)
          if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
            throw new Error('Authentication error. Please log in again.');
          }
          
          // Try to parse as JSON if not HTML
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to update mood');
        } catch (e: any) {
          // If JSON parsing fails or any other error
          if (e.message === 'Authentication error. Please log in again.') {
            throw e;
          }
          throw new Error(`Error updating mood: ${response.status} ${response.statusText}`);
        }
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Mood updated',
        description: 'Your mood has been updated successfully.',
      });
      
      // Update the profile data locally
      if (profileData) {
        setProfileData({
          ...profileData,
          currentMoods: data.currentMoods
        });
      }
      
      // Close the mood selector
      setIsUpdatingMood(false);
      
      // Invalidate any queries that depend on user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating mood',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // If we have no username to look up, use the current user data directly
        if (!username && currentUser) {
          setProfileData(currentUser as ProfileData);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch the profile from the API
        if (username) {
          // Check if username is a numeric ID
          const isNumericId = /^\d+$/.test(username);
          let endpoint = '';
          
          if (isNumericId) {
            // Fetch by user ID directly
            console.log(`Fetching user profile by ID: ${username}`);
            endpoint = `/api/users/${username}`;
          } else {
            // Fetch by username
            console.log(`Fetching user profile by username: ${username}`);
            endpoint = `/api/users/username/${username}`;
          }
          
          const response = await fetch(endpoint);
          if (!response.ok) {
            console.error(`Failed to fetch profile data: ${response.status}`);
            throw new Error('Failed to fetch profile data');
          }
          const data = await response.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username || currentUser) {
      fetchProfileData();
    }
  }, [username, currentUser]);

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
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold">{profileData.fullName || profileData.username}</h1>
                
                {/* Edit Profile button - only show if viewing own profile */}
                {currentUser && profileData.id === currentUser.id && (
                  <Button 
                    variant="outline"
                    className="gap-2"
                    onClick={() => setLocation('/profile-edit')}
                  >
                    Edit Profile
                  </Button>
                )}
                
                {/* Connection Button - only show if viewing profile of other user and user is logged in */}
                {currentUser && profileData.id !== currentUser.id && (
                  <div>
                    {connectionLoading ? (
                      <Button disabled>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading
                      </Button>
                    ) : connectionStatus?.outgoing?.status === 'accepted' || connectionStatus?.incoming?.status === 'accepted' ? (
                      <Button variant="outline" className="gap-2" disabled>
                        <UserCheck className="h-4 w-4" />
                        Connected
                      </Button>
                    ) : connectionStatus?.outgoing?.status === 'pending' ? (
                      <Button variant="outline" className="gap-2" disabled>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Request Pending
                      </Button>
                    ) : connectionStatus?.incoming?.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => respondToConnectionMutation.mutate({ 
                            userId: profileData.id, 
                            status: 'accepted' 
                          })}
                          disabled={respondToConnectionMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => respondToConnectionMutation.mutate({ 
                            userId: profileData.id, 
                            status: 'declined' 
                          })}
                          disabled={respondToConnectionMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => createConnectionMutation.mutate(profileData.id)}
                        disabled={createConnectionMutation.isPending}
                        className="gap-2"
                      >
                        {createConnectionMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                        Connect
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
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
          {/* Current Mood Section */}
          <div className="mt-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Current Mood</h2>
              
              {/* Only show change mood button if viewing own profile */}
              {currentUser && profileData.id === currentUser.id && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={() => setIsUpdatingMood(!isUpdatingMood)}
                  disabled={updateMoodMutation.isPending}
                >
                  {updateMoodMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}
                  {isUpdatingMood ? "Cancel" : (profileData.currentMoods?.length ? "Change Your Mood" : "Share Your Mood")}
                </Button>
              )}
            </div>
            
            {/* Current Mood Display */}
            {!isUpdatingMood ? (
              <div>
                {profileData.currentMoods && profileData.currentMoods.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.currentMoods.map((mood, index) => (
                      <Badge 
                        key={index}
                        className={`text-sm py-1.5 px-3 ${moodStyles[mood as keyof typeof moodStyles] || ''}`}
                      >
                        <Smile className="h-4 w-4 mr-2" />
                        {mood}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {currentUser && profileData.id === currentUser.id 
                      ? "You haven't shared your mood yet." 
                      : "This user hasn't shared their mood yet."}
                  </p>
                )}
              </div>
            ) : (
              // Mood Selection Panel
              <div className="bg-accent/5 p-4 rounded-lg border border-border">
                <h3 className="text-sm font-medium mb-3">How are you feeling today?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {moods.map((mood) => (
                    <Badge
                      key={mood}
                      variant="outline"
                      className={`cursor-pointer text-sm py-2 px-3 flex items-center justify-center transition-colors
                        ${profileData.currentMoods?.includes(mood) 
                          ? moodStyles[mood as keyof typeof moodStyles] 
                          : 'hover:bg-accent/50'}`}
                      onClick={() => updateMoodMutation.mutate(mood)}
                    >
                      {profileData.currentMoods?.includes(mood) && <Check className="h-3 w-3 mr-1" />}
                      {mood}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateMoodMutation.mutate('')}
                    disabled={updateMoodMutation.isPending || !profileData.currentMoods?.length}
                  >
                    Clear mood
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Interests Section */}
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


import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, MapPin, Mail, Briefcase, Calendar, UserPlus, Check, X, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // If we're at /profile (without a username), we want to show the current user's profile
  const targetUsername = username || currentUser?.username;

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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // If we have no username to look up, use the current user data directly
        if (!targetUsername && currentUser) {
          setProfileData(currentUser as ProfileData);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch the profile from the API
        const response = await fetch(`/api/users/${targetUsername}`);
        if (!response.ok) throw new Error('Failed to fetch profile data');
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser || targetUsername) {
      fetchProfileData();
    }
  }, [targetUsername, currentUser]);

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

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  UserCircle, 
  Camera, 
  MapPin, 
  Globe, 
  Smile,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DIGITAL_NOMAD_CITIES, MOOD_TAGS, INTEREST_TAGS } from "@/lib/constants";

const profileSchema = z.object({
  username: z.string().optional(),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.string().optional(),
  sexualOrientation: z.string().optional(),
  age: z.number().min(18, "Must be at least 18 years old").optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  profession: z.string().min(2, "Profession is required"),
  currentLocation: z.string(),
  birthLocation: z.string().optional(),
  raisedLocation: z.string().optional(),
  livedLocation: z.string().optional(),
  upcomingLocation: z.string().optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  currentMoods: z.array(z.string()).min(1, "Select at least one mood"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" }
];

const orientationOptions = [
  { value: "straight", label: "Straight" },
  { value: "gay", label: "Gay" },
  { value: "lesbian", label: "Lesbian" },
  { value: "bisexual", label: "Bisexual" },
  { value: "pansexual", label: "Pansexual" },
  { value: "asexual", label: "Asexual" },
  { value: "queer", label: "Queer" },
  { value: "questioning", label: "Questioning" },
  { value: "prefer-not-to-say", label: "Prefer not to say" }
];

export default function ProfileEditPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, updateProfile } = useUser();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      fullName: user?.fullName || "",
      gender: user?.gender || "",
      sexualOrientation: user?.sexualOrientation || "",
      age: user?.age || 18,
      bio: user?.bio || "",
      profession: user?.profession || "",
      currentLocation: user?.location || "",
      birthLocation: user?.birthLocation || "",
      raisedLocation: "",
      livedLocation: "",
      upcomingLocation: user?.nextLocation || "",
      interests: user?.interests || [],
      currentMoods: user?.currentMoods || [],
    },
  });

  // Initialize selected items from user data when it's loaded
  useEffect(() => {
    if (user) {
      if (user.interests) setSelectedInterests(user.interests);
      if (user.currentMoods) setSelectedMoods(user.currentMoods);
      if (user.profileImage) setImagePreview(user.profileImage);
      
      form.reset({
        username: user.username,
        fullName: user.fullName || "",
        gender: user.gender || "",
        sexualOrientation: user.sexualOrientation || "",
        age: user.age || 18,
        bio: user.bio || "",
        profession: user.profession || "",
        currentLocation: user.location || "",
        birthLocation: user.birthLocation || "",
        upcomingLocation: user.nextLocation || "",
        interests: user.interests || [],
        currentMoods: user.currentMoods || [],
      });
    }
  }, [user, form]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Show local preview immediately for better UX
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('image', file);
      
      // Create headers - important for auth
      const headers = new Headers();
      const sessionId = localStorage.getItem('maly_session_id');
      if (sessionId) {
        headers.append('X-Session-ID', sessionId);
      }
      
      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const result = await response.json();
      
      // Update preview with the stored image URL from server
      setImagePreview(result.profileImage);
      
      toast({
        title: "Image Uploaded",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Map form values to the API expected format
      // Note: profileImage is now handled separately by the upload endpoint
      const profileData = {
        ...data,
        location: data.currentLocation,
        birthLocation: data.birthLocation,
        nextLocation: data.upcomingLocation,
      };

      await updateProfile(profileData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Redirect to profile page with username
      setLocation(`/profile/${user?.username}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setLocation(`/profile/${user?.username}`)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <UserCircle className="w-6 h-6" />
              <h1 className="text-lg font-semibold">Edit Profile</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="p-6">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={imagePreview || "/attached_assets/profile-image-1.jpg"} />
                      <AvatarFallback>{user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="profile-image" 
                      className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary/90 p-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('profile-image')?.click()}>
                    Change Photo
                  </Button>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="@username" {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          Username cannot be changed
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genderOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sexualOrientation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexual Orientation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select orientation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {orientationOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input placeholder="What do you do?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Locations */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Locations</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Current Location
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your current location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIGITAL_NOMAD_CITIES.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Born</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Where were you born?" className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="raisedLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raised</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Where were you raised?" className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="livedLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lived</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="A meaningful place you've lived" className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="upcomingLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Upcoming
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Where are you going next?" className="bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Interests & Moods */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Interests & Moods</h2>
                <div className="space-y-6">
                  <div>
                    <FormLabel>Interests</FormLabel>
                    <FormDescription>Select your interests and expertise areas</FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {INTEREST_TAGS.map(interest => (
                        <Badge
                          key={interest}
                          variant={selectedInterests.includes(interest) ? "default" : "outline"}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const newInterests = selectedInterests.includes(interest)
                              ? selectedInterests.filter(i => i !== interest)
                              : [...selectedInterests, interest];
                            setSelectedInterests(newInterests);
                            form.setValue("interests", newInterests);
                          }}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage>{form.formState.errors.interests?.message}</FormMessage>
                  </div>

                  <div>
                    <FormLabel className="flex items-center gap-2">
                      <Smile className="w-4 h-4" /> 
                      Current Moods
                    </FormLabel>
                    <FormDescription>What's your current focus or mood?</FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {MOOD_TAGS.map(mood => (
                        <Badge
                          key={mood}
                          variant={selectedMoods.includes(mood) ? "default" : "outline"}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const newMoods = selectedMoods.includes(mood)
                              ? selectedMoods.filter(m => m !== mood)
                              : [...selectedMoods, mood];
                            setSelectedMoods(newMoods);
                            form.setValue("currentMoods", newMoods);
                          }}
                        >
                          {mood}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage>{form.formState.errors.currentMoods?.message}</FormMessage>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation(`/profile/${user?.username}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
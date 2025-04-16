import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Upload } from "lucide-react";
import { members } from "@/lib/members-data";
import { DIGITAL_NOMAD_CITIES } from "@/lib/constants";
import { useLocation } from "wouter"; // Replace next/router with wouter

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(18, "Must be at least 18 years old"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  profession: z.string().min(2, "Profession is required"),
  location: z.string(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  currentMood: z.enum(["Dating", "Networking", "Parties", "Adventure", "Dining Out"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const interests = [
  "Digital Marketing",
  "Software Development",
  "Content Creation",
  "Photography",
  "Entrepreneurship",
  "Remote Work",
  "Travel",
  "Fitness",
  "Languages",
  "Art & Design",
  "Music",
  "Food & Cuisine",
];

const moods = ["Dating", "Networking", "Parties", "Adventure", "Dining Out"] as const;

// Mood badge styles configuration
const moodStyles = {
  "Dating": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Parties": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Adventure": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Dining Out": "bg-green-500/20 text-green-500 hover:bg-green-500/30"
} as const;

export default function EditProfilePage() {
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [, navigate] = useLocation(); // Use wouter's useLocation for navigation

  // For demo, use first member as current user
  const currentUser = members[0];

  // Handle back navigation
  const handleBack = () => {
    navigate('/profile'); // Navigate to profile page
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: currentUser.name,
      age: currentUser.age,
      bio: currentUser.bio,
      profession: currentUser.occupation,
      location: currentUser.location,
      interests: currentUser.interests,
      currentMood: (currentUser.currentMoods && currentUser.currentMoods.length > 0) 
        ? currentUser.currentMoods[0] as any 
        : "Networking", // Default to Networking if no mood is set
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Create headers object
      const headers = new Headers({
        'Content-Type': 'application/json'
      });
      
      // Add session ID if it exists
      const sessionId = localStorage.getItem('maly_session_id');
      if (sessionId) {
        headers.append('X-Session-ID', sessionId);
      }
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers,
        credentials: 'include', // Important for auth
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Edit Profile</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Image Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-2 ring-primary/10">
                  <AvatarImage 
                    src={imagePreview || currentUser.image} 
                    alt="Profile picture"
                  />
                  <AvatarFallback>
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-image" 
                  className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Profile Picture</h2>
                <p className="text-sm text-muted-foreground">
                  Upload a photo that best represents you
                </p>
              </div>
            </div>

            {/* Current Mood - Primary CTA */}
            <div className="space-y-4 glass p-6 rounded-lg border border-primary/30 shadow-lg">
              <h2 className="text-2xl font-bold gradient-text">How are you feeling today?</h2>
              
              <div className="w-full">
                <div className="flex flex-wrap gap-3 mt-2">
                  {moods.map(mood => (
                    <div
                      key={mood}
                      className={`cursor-pointer flex-grow text-center py-3 px-4 rounded-lg transition-all ${
                        (form.watch("currentMoods") || []).includes(mood)
                          ? `${moodStyles[mood]} border-2 border-white/20 shadow-md transform scale-105` 
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                      onClick={async () => {
                        // Get current moods
                        const currentMoods = form.watch("currentMoods") || [];
                        
                        // Toggle the selected mood (add if not present, remove if present)
                        const updatedMoods = currentMoods.includes(mood) 
                          ? currentMoods.filter(m => m !== mood)
                          : [...currentMoods, mood];
                        
                        // Update form value
                        form.setValue("currentMoods", updatedMoods);
                        
                        // Save immediately via POST request
                        try {
                          // Create headers object
                          const headers = new Headers({
                            'Content-Type': 'application/json'
                          });
                          
                          // Add session ID if it exists
                          const sessionId = localStorage.getItem('maly_session_id');
                          if (sessionId) {
                            headers.append('X-Session-ID', sessionId);
                          }
                          
                          const response = await fetch('/api/profile', {
                            method: 'POST',
                            headers,
                            credentials: 'include',
                            body: JSON.stringify({ currentMoods: updatedMoods })
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to update mood');
                          }
                          
                          toast({
                            title: "Mood Updated",
                            description: "Your mood has been updated!",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update your mood. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      {mood}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Basic Information */}
            <div className="space-y-4 glass p-6 rounded-lg border border-white/10">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} className="bg-white/5 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                          className="bg-white/5 border-white/10"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            {...field} 
                            className="pl-9 bg-white/5 border-white/10" 
                            placeholder="Where are you based?"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bio & Profession */}
            <div className="space-y-4 glass p-6 rounded-lg border border-white/10">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What do you do?" 
                        {...field}
                        className="bg-white/5 border-white/10"
                      />
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
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px] bg-white/5 border-white/10"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-white/60">
                      Share your story and what brings you here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interests */}
            <div className="space-y-4 glass p-6 rounded-lg border border-white/10">
              <div>
                <FormLabel>Interests</FormLabel>
                <FormDescription className="text-white/60">Select your interests and expertise areas</FormDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {interests.map(interest => (
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
            </div>

            <div className="flex gap-4">
              <Button type="submit" size="lg" className="interactive-hover" disabled={isLoading}> {/* Disable button while loading */}
                {isLoading ? "Saving..." : "Save Changes"} {/* Show loading indicator */}
              </Button>
              <Button type="button" variant="outline" size="lg" className="glass-hover" onClick={handleBack}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
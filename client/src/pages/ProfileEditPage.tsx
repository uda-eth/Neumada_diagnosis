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
import { DIGITAL_NOMAD_CITIES, VIBE_AND_MOOD_TAGS } from "@/lib/constants";

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

  // State to store the selected file for later upload when the user clicks Save
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Handle image selection without immediate upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Stage the file for later upload (when user clicks Save)
    setSelectedImageFile(file);
    
    // Show local preview immediately for better UX
    const reader = new FileReader();
    reader.onloadend = () => {
      // Store preview in state - but only upload on form submission
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Notify user the image is staged but not yet saved
    toast({
      title: "Image Selected",
      description: "Click 'Save' to update your profile with this image.",
    });
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Step 1: Upload the image first if one was selected
      let uploadedImageUrl: string | null = null;
      
      if (selectedImageFile) {
        // Create formData for image upload
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        
        // Create headers for auth
        const headers = new Headers();
        const sessionId = localStorage.getItem('maly_session_id');
        if (sessionId) {
          headers.append('X-Session-ID', sessionId);
        }
        
        // Upload the image
        const imageResponse = await fetch('/api/upload-profile-image', {
          method: 'POST',
          headers,
          credentials: 'include',
          body: formData
        });
        
        if (!imageResponse.ok) {
          throw new Error('Failed to upload profile image');
        }
        
        const imageResult = await imageResponse.json();
        uploadedImageUrl = imageResult.profileImage;
      }
      
      // Step 2: Map form values to the API expected format
      const profileData = {
        ...data,
        location: data.currentLocation,
        birthLocation: data.birthLocation,
        nextLocation: data.upcomingLocation,
        // Include the new image URL if we uploaded one
        ...(uploadedImageUrl && { profileImage: uploadedImageUrl }),
      };

      // Step 3: Update the profile with all data
      await updateProfile(profileData);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Clear the selected image file state since we've now processed it
      setSelectedImageFile(null);
      
      // Redirect to profile page with username
      setLocation(`/profile/${user?.username}`);
    } catch (error) {
      console.error('Profile update error:', error);
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

              {/* Vibe and Mood */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Vibe and Mood</h2>
                <div className="space-y-6">
                  <div>
                    <FormLabel className="flex items-center gap-2">
                      <Smile className="w-4 h-4" /> 
                      Vibe and Mood Tags
                    </FormLabel>
                    <FormDescription>Select tags that represent your vibe and mood</FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {VIBE_AND_MOOD_TAGS.map(tag => {
                        const isInterest = selectedInterests.includes(tag);
                        const isMood = selectedMoods.includes(tag);
                        
                        // Determine badge style based on selection states
                        let variant = "outline";
                        let className = "cursor-pointer hover:opacity-80 transition-opacity";
                        
                        if (isInterest && isMood) {
                          // Tag is selected as both interest and mood
                          variant = "default";
                          className += " ring-2 ring-primary ring-opacity-50";
                        } else if (isInterest) {
                          // Tag is selected as interest only
                          variant = "default";
                        } else if (isMood) {
                          // Tag is selected as mood only
                          variant = "secondary";
                        }
                        
                        return (
                          <Badge
                            key={tag}
                            variant={variant as any}
                            className={className}
                            onClick={() => {
                              // Toggle selection for both interest and mood at once
                              const newInterests = isInterest
                                ? selectedInterests.filter(i => i !== tag)
                                : [...selectedInterests, tag];
                              
                              const newMoods = isMood
                                ? selectedMoods.filter(m => m !== tag)
                                : [...selectedMoods, tag];
                              
                              setSelectedInterests(newInterests);
                              setSelectedMoods(newMoods);
                              
                              form.setValue("interests", newInterests);
                              form.setValue("currentMoods", newMoods);
                            }}
                          >
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                    <div className="mt-3 space-y-1">
                      <FormMessage>{form.formState.errors.interests?.message}</FormMessage>
                      <FormMessage>{form.formState.errors.currentMoods?.message}</FormMessage>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Tags are used for both your profile preferences and current mood.</p>
                      <p className="mt-1">Default (purple): Selected as your preferred vibe</p>
                      <p className="mt-1">Secondary (gray): Selected as your current mood</p>
                      <p className="mt-1">Ringed: Selected as both preferred vibe and current mood</p>
                    </div>
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
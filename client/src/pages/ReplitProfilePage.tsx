import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { DIGITAL_NOMAD_CITIES, INTEREST_TAGS, MOOD_TAGS } from "@/lib/constants";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { UserPlus, ArrowRight, Camera, Briefcase, MapPin, Users } from "lucide-react";

// Form schema for profile creation
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(300, "Bio cannot exceed 300 characters"),
  profession: z.string().min(2, "Profession is required"),
  location: z.string(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  currentMoods: z.array(z.string()),
  // Profile image is required - validated both here and in onSubmit
  profileImage: z.any().refine((val) => val !== undefined, {
    message: "Profile picture is required",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ReplitProfilePage() {
  const { toast } = useToast();
  const { register } = useUser();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replitUser, setReplitUser] = useState<any>(null);

  // Initialize the form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      bio: "",
      profession: "",
      location: "Mexico City", // Default location
      interests: [],
      currentMoods: [],
    },
  });

  // Attempt to get Replit user info if available
  useEffect(() => {
    // Since we're in Replit's environment, we can try to access user data
    // This is a simplified approach for demonstration - actual implementation would
    // use Replit's API through proper authentication
    try {
      const fetchReplitUser = async () => {
        // In a real implementation, this would be an actual API call to Replit
        if (window.location.hostname.includes('replit.app') || 
            window.location.hostname.includes('replit.dev')) {
          try {
            // For demonstration, get data from localStorage if testing
            const testUser = localStorage.getItem('replitUser');
            if (testUser) {
              const parsedUser = JSON.parse(testUser);
              setReplitUser(parsedUser);
              
              // Pre-fill the form with Replit user data
              if (parsedUser.username) {
                form.setValue('username', parsedUser.username);
              }
              if (parsedUser.name) {
                form.setValue('fullName', parsedUser.name);
              }
              if (parsedUser.bio) {
                form.setValue('bio', parsedUser.bio);
              }
              if (parsedUser.profileImage) {
                setImagePreview(parsedUser.profileImage);
              }
            }
          } catch (error) {
            console.error("Error parsing mock Replit user:", error);
          }
        }
      };
      
      fetchReplitUser();
    } catch (error) {
      console.error("Error fetching Replit user:", error);
    }
  }, [form]);

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

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      form.setValue("interests", newInterests);
      return newInterests;
    });
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => {
      const newMoods = prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood];
      form.setValue("currentMoods", newMoods);
      return newMoods;
    });
  };

  const onSubmit = async (data: ProfileFormValues) => {
    // Prevent form submission if profile image is missing
    if (!imagePreview) {
      toast({
        title: "Profile Image Required",
        description: "Please upload a profile photo to complete your registration.",
        variant: "destructive",
      });
      // Set a custom form error for the profile image field
      form.setError('profileImage', {
        type: 'manual',
        message: 'Profile photo is required'
      });
      // Return early to prevent form submission
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Add profile image to the form data
      const profileData = {
        ...data,
        profileImage: imagePreview,
      };
      
      // Register the user
      const result = await register(profileData);
      
      if (!result.ok) {
        throw new Error(result.message);
      }
      
      toast({
        title: "Profile Created",
        description: "Your profile has been successfully created! Welcome to the community.",
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Join Our Community</h1>
          <p className="text-muted-foreground mt-2">
            Create your profile and connect with digital nomads around the world
          </p>
        </div>

        {replitUser && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Replit Profile Connected
              </CardTitle>
              <CardDescription>
                We've found your Replit account. Your profile information has been pre-filled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {replitUser.profileImage && (
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={replitUser.profileImage} alt={replitUser.username} />
                    <AvatarFallback>{replitUser.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h3 className="font-medium text-lg">{replitUser.name || replitUser.username}</h3>
                  {replitUser.bio && <p className="text-sm text-muted-foreground">{replitUser.bio}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Account & Personal Info */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Account Information
                  </h2>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johnsmith" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be your unique identifier in the community
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={imagePreview} alt="Profile" />
                        <AvatarFallback>
                          {form.watch("fullName")?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="profile-image" 
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          required
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <FormLabel htmlFor="profile-image">
                          <span className="flex items-center gap-2 text-sm font-medium">
                            Profile Photo <span className="text-destructive">*</span>
                          </span>
                        </FormLabel>
                        <FormDescription>
                          Upload a photo (required)
                        </FormDescription>
                        {form.formState.errors.profileImage && (
                          <FormMessage>
                            {String(form.formState.errors.profileImage?.message || "")}
                          </FormMessage>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Profession
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Software Developer" {...field} />
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
                        <FormLabel>
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Current Location
                          </span>
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
                </div>
              </div>
              
              {/* Right column - Bio & Interests */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">About You</h2>
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself, your journey, and what brings you here..."
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/300 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Interests & Connections</h2>
                  
                  <div>
                    <FormLabel>Interests</FormLabel>
                    <FormDescription>Select topics you're interested in</FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {INTEREST_TAGS.map(interest => (
                        <Badge
                          key={interest}
                          variant={selectedInterests.includes(interest) ? "default" : "outline"}
                          className="cursor-pointer transition-all"
                          onClick={() => toggleInterest(interest)}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage>{form.formState.errors.interests?.message}</FormMessage>
                  </div>
                  
                  <div>
                    <FormLabel>Current Mood</FormLabel>
                    <FormDescription>What are you looking for right now?</FormDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {MOOD_TAGS.map(mood => (
                        <Badge
                          key={mood}
                          variant={selectedMoods.includes(mood) ? "default" : "outline"}
                          className="cursor-pointer transition-all"
                          onClick={() => toggleMood(mood)}
                        >
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                Create Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
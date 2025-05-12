import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { z } from "zod";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { VIBE_AND_MOOD_TAGS } from "@/lib/constants";

const loginSchema = z.object({
  username: z.string().min(3, "Username or email must be provided"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(), // Changed to "name" in the UI but keeping field name the same in schema
  location: z.string().optional(),
  interests: z.string().optional(), // Changed to vibe/mood filters in UI
  age: z.string().optional(),
  profileImage: z.any().optional(), // For profile picture upload
});

// Mood style definitions for consistent visual appearance
const moodStyles = {
  "Party & Nightlife": "bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
  "Fashion & Style": "bg-pink-500/20 text-pink-500 hover:bg-pink-500/30",
  "Networking & Business": "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
  "Dining & Drinks": "bg-green-500/20 text-green-500 hover:bg-green-500/30",
  "Outdoor & Nature": "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30",
  "Wellness & Fitness": "bg-teal-500/20 text-teal-500 hover:bg-teal-500/30",
  "Creative & Artsy": "bg-violet-500/20 text-violet-500 hover:bg-violet-500/30",
  "Single & Social": "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30",
  "Chill & Recharge": "bg-cyan-500/20 text-cyan-500 hover:bg-cyan-500/30",
  "Adventure & Exploring": "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30",
  "Spiritual & Intentional": "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    location: "",
    interests: "",
    age: "",
    profileImage: null as File | null,
  });
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplitEnv, setIsReplitEnv] = useState(false);
  const [replitData, setReplitData] = useState<any>(null);
  const { login, register, user } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // If user is already logged in, redirect to home page
  useEffect(() => {
    // Use cached data first instead of making an API call
    const cachedUser = localStorage.getItem('maly_user_data');
    if (cachedUser) {
      try {
        // Check if cached user data exists and is valid JSON
        JSON.parse(cachedUser);
        console.log("Cached user found, redirecting to homepage");
        setLocation("/");
        return;
      } catch (e) {
        // Invalid JSON in cache, will continue with normal flow
        localStorage.removeItem('maly_user_data');
      }
    }
    
    // If we already have user data in the React state, redirect without making another request
    if (user) {
      console.log("User found in state, redirecting to homepage");
      setLocation("/");
    }
    // We don't need to check auth status here since we're already on the auth page
    // The user will need to log in
  }, [user, setLocation]);
  
  // Check if we're in a Replit environment
  useEffect(() => {
    const checkReplitEnvironment = async () => {
      try {
        const response = await fetch('/api/replit-info');
        const data = await response.json();
        setIsReplitEnv(data.isReplit);
        if (data.isReplit) {
          setReplitData({
            replId: data.replId,
            owner: data.owner,
            slug: data.slug
          });
        }
      } catch (error) {
        console.error('Error checking Replit environment:', error);
      }
    };
    
    checkReplitEnvironment();
  }, []);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse(formData);
      } else {
        registerSchema.parse(formData);
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      }
      return false;
    }
  };

  // Check for error messages in URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.replace(/\+/g, ' '),
      });
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Type cast to avoid type issues
      setFormData(prev => ({ ...prev, profileImage: file }));
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev => {
      if (prev.includes(mood)) {
        return prev.filter(m => m !== mood);
      } else {
        return [...prev, mood];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Create a form for direct server-side submission and redirect
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = isLogin ? '/api/login-redirect' : '/api/register-redirect';
      form.encType = 'multipart/form-data'; // Important for file uploads
      
      // Create a FormData object for file upload
      const formDataObj = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'profileImage' && value) {
            // Handle the file separately
            formDataObj.append('profileImage', value);
          } else {
            formDataObj.append(key, value as string);
          }
        }
      });
      
      // Handle selected moods as interests
      if (!isLogin && selectedMoods.length > 0) {
        formDataObj.delete('interests');
        formDataObj.append('interests', JSON.stringify(selectedMoods));
      }
      
      // For direct form submission
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'profileImage' && value !== undefined && value !== null && value !== '') {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        }
      });
      
      // Special handling for moods/interests in registration
      if (!isLogin && selectedMoods.length > 0) {
        // Replace the interests field with the selected moods
        const interestsField = form.querySelector('input[name="interests"]');
        if (interestsField) {
          form.removeChild(interestsField);
        }
        
        const interestsInput = document.createElement('input');
        interestsInput.type = 'hidden';
        interestsInput.name = 'interests';
        interestsInput.value = JSON.stringify(selectedMoods);
        form.appendChild(interestsInput);
      }
      
      // Handle file upload using a file input
      if (formData.profileImage && !isLogin) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = 'profileImage';
        fileInput.style.display = 'none';
        
        // Create a DataTransfer object and add the file
        const dt = new DataTransfer();
        dt.items.add(formData.profileImage as any);
        fileInput.files = dt.files;
        
        form.appendChild(fileInput);
      }
      
      // Append to document and submit
      document.body.appendChild(form);
      form.submit();
      
      // We don't set isSubmitting back to false here because we're navigating away
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred",
      });
      setIsSubmitting(false);
    }
  };
  
  // Function to handle Replit profile setup
  const handleReplitProfileSetup = () => {
    // Navigate to the Replit profile setup page
    setLocation("/replit-profile");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center">
        <Logo className="h-12 w-auto" />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
          <CardDescription>
            {isLogin 
              ? "Sign in to your Maly account" 
              : "Create a new account to join our community"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{isLogin ? "Username or Email" : "Username"}</Label>
              <Input
                id="username"
                required
                placeholder={isLogin ? "Enter your username or email" : "Enter your username"}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age <span className="text-xs text-muted-foreground">(will not be displayed)</span></Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Where are you based?"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moods">Mood & Vibe</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {VIBE_AND_MOOD_TAGS.map(mood => {
                      const isSelected = selectedMoods.includes(mood);
                      // @ts-ignore - Type safety handled through known values
                      const moodStyle = moodStyles[mood] || "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30";
                      
                      return (
                        <Badge
                          key={mood}
                          className={`cursor-pointer transition-all ${isSelected ? moodStyle + ' font-medium' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          onClick={() => handleMoodToggle(mood)}
                        >
                          {mood}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Picture</Label>
                  {imagePreview && (
                    <div className="mb-2">
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-24 h-24 rounded-full object-cover border"
                      />
                    </div>
                  )}
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLogin ? (
                "Login"
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button
            variant="ghost"
            type="button"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isSubmitting}
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
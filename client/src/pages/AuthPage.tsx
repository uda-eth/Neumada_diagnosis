import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  interests: z.string().optional(),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    bio: "",
    location: "",
    interests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplitEnv, setIsReplitEnv] = useState(false);
  const [replitData, setReplitData] = useState<any>(null);
  const { login, register } = useUser();
  const { toast } = useToast();
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const result = await login({
          username: formData.username,
          password: formData.password,
        });
        if (!result.ok) {
          throw new Error(result.message);
        }
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        // Convert interests string to array and clean it up
        const registerData = {
          ...formData,
          interests: formData.interests ? formData.interests.split(',').map(i => i.trim()) : undefined,
        };

        const result = await register(registerData);
        if (!result.ok) {
          throw new Error(result.message);
        }
        toast({
          title: "Success",
          description: "Registered successfully",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to handle Replit profile setup
  const handleReplitProfileSetup = () => {
    // Navigate to the Replit profile setup page
    window.location.href = "/replit-profile";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
          {!isLogin && isReplitEnv && (
            <div className="mb-6">
              <Button 
                onClick={handleReplitProfileSetup}
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 h-11 bg-primary/5 hover:bg-primary/10 border-primary/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M7.25471 16.001C7.25471 11.6146 10.813 8.05631 15.1993 8.05631C19.5856 8.05631 23.1439 11.6146 23.1439 16.001C23.1439 20.3874 19.5856 23.9457 15.1993 23.9457C10.813 23.9457 7.25471 20.3874 7.25471 16.001Z" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.1993 32.0001C23.593 32.0001 30.3986 25.1946 30.3986 16.8008C30.3986 8.40708 23.593 1.60156 15.1993 1.60156C6.80551 1.60156 0 8.40708 0 16.8008C0 25.1946 6.80551 32.0001 15.1993 32.0001ZM15.1993 27.1922C21.2518 27.1922 26.1622 22.2818 26.1622 16.2293C26.1622 10.1767 21.2518 5.26638 15.1993 5.26638C9.14671 5.26638 4.23644 10.1767 4.23644 16.2293C4.23644 22.2818 9.14671 27.1922 15.1993 27.1922Z"/>
                </svg>
                Sign up with Replit
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                required
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

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
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
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
                  <Label htmlFor="interests">Interests</Label>
                  <Input
                    id="interests"
                    placeholder="Travel, Photography, etc. (comma-separated)"
                    value={formData.interests}
                    onChange={(e) =>
                      setFormData({ ...formData, interests: e.target.value })
                    }
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
          
          {isLogin && isReplitEnv && (
            <div className="w-full mt-4 pt-4 border-t text-center">
              <Button 
                onClick={handleReplitProfileSetup}
                variant="link" 
                className="text-sm text-primary"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Sign up with your Replit account
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
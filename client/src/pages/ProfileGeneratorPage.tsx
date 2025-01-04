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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DIGITAL_NOMAD_CITIES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Briefcase, Globe } from "lucide-react";

// Form schema
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().regex(/^\d+$/).transform(Number),
  gender: z.string(),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  profession: z.string().min(2, "Profession is required"),
  location: z.string(),
  nextLocation: z.string(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  currentMoods: z.array(z.string()),
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

const moods = [
  "Working",
  "Exploring",
  "Networking",
  "Learning",
  "Teaching",
  "Socializing",
  "Focusing",
  "Adventure",
  "Relaxing",
  "Creating",
];

export default function ProfileGeneratorPage() {
  const { toast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      interests: [],
      currentMoods: [],
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Create Your Profile</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Basic Information</h2>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Bio & Profession */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">About You</h2>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share your story, what drives you, and what you're looking for.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Profession
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Developer, Digital Marketer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Location</h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Current Location
                          </span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIGITAL_NOMAD_CITIES.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
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
                    name="nextLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <span className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Next Destination
                          </span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIGITAL_NOMAD_CITIES.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Interests & Moods */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Interests & Moods</h2>
                
                <div>
                  <FormLabel>Interests</FormLabel>
                  <FormDescription>Select your interests and expertise areas</FormDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.map(interest => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
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
                  <FormDescription>What are you currently focused on?</FormDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {moods.map(mood => (
                      <Badge
                        key={mood}
                        variant={selectedMoods.includes(mood) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => toggleMood(mood)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save Profile
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

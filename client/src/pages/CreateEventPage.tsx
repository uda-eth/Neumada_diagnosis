import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus } from "lucide-react";
import { insertEventSchema } from "@db/schema";
import type { z } from "zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";

// Define the form data type using the zod schema
type FormData = z.infer<typeof insertEventSchema>;

const interestTags = [
  "Digital Nomads",
  "Entrepreneurs",
  "Artists",
  "Tech",
  "Music",
  "Food",
  "Travel",
  "Sports",
  "Wellness",
  "Photography",
  "Reading",
  "Languages",
];

const categories = [
  "Social",
  "Professional",
  "Cultural",
  "Sports",
  "Dining",
  "Festivals",
  "Retail",
  "Fashion",
  "Tech",
  "Educational"
];

export default function CreateEventPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Social");

  const form = useForm<FormData>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: user?.location || "",
      city: user?.location || "",
      date: new Date(),
      price: "0",
      isPrivate: false,
      category: "Social", // Default category
      image: null,
      tags: [],
      image_url: null,
      creatorId: user?.id || null,
      capacity: 20,
      ticketType: "free", // Required field
      availableTickets: 100,
      timeFrame: "This Week", // Required field
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImage(reader.result as string);
        // Also update the form data
        form.setValue("image_url", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData for multipart/form-data (for image upload)
      const formData = new FormData();
      
      // Handle date conversion properly for the server
      const formattedData = {
        ...data,
        // Convert Date to ISO string for API
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        // Make sure ticketType is correctly set based on price
        ticketType: parseFloat(data.price?.toString() || '0') > 0 ? 'paid' : 'free'
      };

      // Log all form data for debugging
      console.log("Form data before submission:", formattedData);
      
      // Add all form fields to FormData
      Object.entries(formattedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Handle arrays (like tags) by converting to JSON
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Add the selected tags as JSON string
      formData.append('tags', JSON.stringify(selectedTags));
      
      // Add category
      formData.append('category', selectedCategory);
      
      // Ensure creatorId is included
      if (user && user.id) {
        formData.append('creatorId', user.id.toString());
      }
      
      // If we have a Base64 image URL, convert it to a file and append
      if (eventImage && eventImage.startsWith('data:image')) {
        // Convert base64 to blob
        const fetchResponse = await fetch(eventImage);
        const blob = await fetchResponse.blob();
        const file = new File([blob], "event-image.jpg", { type: "image/jpeg" });
        formData.append('image', file);
      }
      
      console.log("Submitting event:", Object.fromEntries(formData));
      
      // Make the API call
      const response = await fetch('/api/events', {
        method: 'POST',
        body: formData,
        // No Content-Type header - browser will set it for FormData with correct boundary
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      const createdEvent = await response.json();
      console.log("Event created:", createdEvent);

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setLocation("/");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60"
              onClick={() => setLocation("/")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-sm font-medium uppercase tracking-wider">
              Create Event
            </h1>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 140px)' }}>
        <form id="event-form" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="container mx-auto px-4 py-8 space-y-8 max-w-2xl">
            <div className="space-y-4">
              <p className="text-sm text-white/60">Let's get started!</p>
              <div className="relative aspect-[3/2] bg-white/5 rounded-lg overflow-hidden">
                {eventImage ? (
                  <img
                    src={eventImage}
                    alt="Event preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="w-8 h-8 text-white/60" />
                      <span className="text-sm text-white/60">
                        Add photos or flyer for your event
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Input
                  {...form.register("title")}
                  className="bg-white/5 border-0 h-12 text-lg"
                  placeholder="Event title"
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  {...form.register("description")}
                  className="bg-white/5 border-0 h-32 resize-none"
                  placeholder="Fill in event details"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Event Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedCategory === category ? "default" : "outline"}
                      className={`h-10 text-sm ${
                        selectedCategory === category
                          ? ""
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                      onClick={() => {
                        setSelectedCategory(category);
                        form.setValue("category", category);
                      }}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Target audience is</h3>
              <div className="grid grid-cols-3 gap-2">
                {interestTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`h-8 text-sm ${
                      selectedTags.includes(tag)
                        ? ""
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="time"
                    className="bg-white/5 border-0 h-12"
                    onChange={(e) => {
                      const time = e.target.value;
                      const currentDate = form.getValues("date");
                      if (currentDate && time) {
                        // Set the time component on the date
                        const [hours, minutes] = time.split(':').map(Number);
                        const newDate = new Date(currentDate);
                        newDate.setHours(hours, minutes);
                        form.setValue("date", newDate);
                      }
                    }}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    className="bg-white/5 border-0 h-12"
                    onChange={(e) => {
                      const time = e.target.value;
                      if (time) {
                        // Create or update end date with this time
                        const [hours, minutes] = time.split(':').map(Number);
                        const endDate = form.getValues("endDate") || new Date(form.getValues("date"));
                        const newEndDate = new Date(endDate);
                        newEndDate.setHours(hours, minutes);
                        form.setValue("endDate", newEndDate);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                {...form.register("location")}
                className="bg-white/5 border-0 h-12"
                placeholder="Tell me system location"
              />
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={form.watch("price") === "0" ? "default" : "outline"}
                  className="flex-1 h-12"
                  onClick={() => form.setValue("price", "0")}
                >
                  Free
                </Button>
                <Button
                  type="button"
                  variant={parseFloat(form.watch("price") || "0") > 0 ? "default" : "outline"}
                  className="flex-1 h-12"
                  onClick={() => form.setValue("price", "10")} // Set a default price
                >
                  Paid
                </Button>
              </div>

              {parseFloat(form.watch("price") || "0") > 0 && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    {...form.register("price", { valueAsNumber: true })}
                    className="bg-white/5 border-0 h-12"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={!form.watch("isPrivate") ? "default" : "outline"}
                  className="flex-1 h-12"
                  onClick={() => form.setValue("isPrivate", false)}
                >
                  Public
                </Button>
                <Button
                  type="button"
                  variant={form.watch("isPrivate") ? "default" : "outline"}
                  className="flex-1 h-12"
                  onClick={() => form.setValue("isPrivate", true)}
                >
                  Private
                </Button>
              </div>
            </div>

            {/* Publication Status Toggle */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Publication Status</h3>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  form="event-form"
                  variant="outline"
                  className="flex-1 h-12 bg-white/5 border-white/10 hover:bg-white/10"
                  disabled={!eventImage || !form.watch("title") || !form.watch("description")}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  form="event-form"
                  className="flex-1 h-12 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white"
                  disabled={!eventImage || !form.watch("title") || !form.watch("description")}
                >
                  Publish Event
                </Button>
              </div>
            </div>
          </div>
        </form>

        <div className="container mx-auto max-w-2xl px-4 pb-32">
          <div className="rounded-lg overflow-hidden relative">
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
              Premium Ad Partner
            </div>
            <img
              src="/attached_assets/Screenshot 2025-03-05 at 1.56.31 AM.png"
              alt="American Express Platinum - The world is yours with Platinum"
              className="w-full object-cover"
            />
          </div>
        </div>
      </ScrollArea>

      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10">
        <div className="container mx-auto max-w-2xl p-4">
          <Button
            type="submit"
            form="event-form"
            className="w-full h-12 bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 hover:from-teal-700 hover:via-blue-700 hover:to-purple-700 text-white transition-all duration-200"
            disabled={!eventImage || !form.watch("title") || !form.watch("description")}
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Create Event</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
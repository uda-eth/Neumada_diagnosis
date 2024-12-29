import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Image as ImageIcon, Plus } from "lucide-react";
import type { Event } from "@db/schema";
import { insertEventSchema } from "@db/schema";

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

export default function CreateEventPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [eventImages, setEventImages] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      date: "",
      category: "",
      price: 0,
      capacity: undefined,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImages([...eventImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: Event) => {
    try {
      // TODO: Implement event creation API
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      setLocation("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            className="text-white/60"
            onClick={() => setLocation("/")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Create YOUR event</h1>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Add photos or flyer to your event</Label>
            <div className="grid grid-cols-3 gap-4">
              {eventImages.map((img, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={img}
                    alt={`Event ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
              <label className="aspect-square bg-white/5 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
                <Plus className="w-6 h-6 text-white/60" />
                <span className="text-sm text-white/60">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div>
              <Label>Event Title</Label>
              <Input
                {...form.register("title")}
                className="bg-white/5 border-0"
                placeholder="Give your event a name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                {...form.register("description")}
                className="bg-white/5 border-0 h-32"
                placeholder="Tell people what your event is about"
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <Label>Target audience is</Label>
            <div className="flex flex-wrap gap-2">
              {interestTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="rounded-full"
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

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Event start</Label>
              <Input
                type="datetime-local"
                {...form.register("date")}
                className="bg-white/5 border-0"
              />
            </div>
            <div>
              <Label>Event end</Label>
              <Input
                type="datetime-local"
                className="bg-white/5 border-0"
              />
            </div>
          </div>

          {/* Price and Capacity */}
          <div className="space-y-4">
            <div>
              <Label>Payment</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => form.setValue("price", 0)}
                >
                  Free
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => form.setValue("price", undefined)}
                >
                  Paid
                </Button>
              </div>
            </div>

            {form.watch("price") !== 0 && (
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  {...form.register("price")}
                  className="bg-white/5 border-0"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-12">
            Publish
          </Button>
        </form>
      </div>
    </div>
  );
}

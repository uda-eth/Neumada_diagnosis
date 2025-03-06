import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, UserCircle, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfileEditPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setLocation("/")}
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
          <Card className="p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="/attached_assets/profile-image-1.jpg" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-primary hover:bg-primary/90"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="@username" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Current Location</Label>
                <Input id="location" placeholder="City, Country" />
              </div>

              <div className="pt-4">
                <Button className="w-full">Save Changes</Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

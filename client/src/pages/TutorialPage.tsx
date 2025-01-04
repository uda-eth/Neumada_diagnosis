import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Users,
  Calendar,
  Bot,
  Moon,
  MessageSquare,
  MapPin,
  Filter,
  UserPlus2,
} from "lucide-react";

// Tutorial images will be imported here
const images = {
  darkMode: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
  browse: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1200&h=600&fit=crop",
  chat: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1200&h=600&fit=crop",
  events: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=1200&h=600&fit=crop",
};

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Neumada</h1>
          <p className="text-lg text-muted-foreground">
            Your digital nomad community platform
          </p>
        </div>

        {/* Feature Tabs */}
        <Tabs defaultValue="interface" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <TabsTrigger value="interface" className="gap-2">
              <Globe className="w-4 h-4" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="discovery" className="gap-2">
              <Users className="w-4 h-4" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="companion" className="gap-2">
              <Bot className="w-4 h-4" />
              AI Companion
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Interface & Navigation */}
          <TabsContent value="interface">
            <Card>
              <CardContent className="p-6 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Globe className="w-6 h-6" />
                    Interface & Navigation
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Dark/Light Mode</h3>
                      <p className="text-muted-foreground">
                        Toggle between dark and light themes for comfortable viewing in any environment.
                      </p>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon">
                          <Moon className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Click the theme toggle in the top right
                        </span>
                      </div>
                    </div>
                    <img
                      src={images.darkMode}
                      alt="Theme toggle demonstration"
                      className="rounded-lg shadow-lg"
                    />
                  </div>

                  <div className="border-t pt-8">
                    <h3 className="text-xl font-medium mb-4">Navigation</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { icon: Globe, label: "Discover" },
                        { icon: Users, label: "Connect" },
                        { icon: Calendar, label: "Create" },
                        { icon: Bot, label: "Concierge" },
                        { icon: Moon, label: "Settings" },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50"
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Discovery & Matching */}
          <TabsContent value="discovery">
            <Card>
              <CardContent className="p-6 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    User Discovery & Matching
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Browse Members</h3>
                      <p className="text-muted-foreground">
                        Find and connect with fellow digital nomads using our advanced filtering system.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>Location-based filtering</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-muted-foreground" />
                          <span>Demographics & interests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserPlus2 className="w-4 h-4 text-muted-foreground" />
                          <span>AI-powered matching</span>
                        </div>
                      </div>
                    </div>
                    <img
                      src={images.browse}
                      alt="Browse members interface"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Travel Companion */}
          <TabsContent value="companion">
            <Card>
              <CardContent className="p-6 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Bot className="w-6 h-6" />
                    AI Travel Companion
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Interactive Chat</h3>
                      <p className="text-muted-foreground">
                        Get personalized travel recommendations and local insights from our AI companion.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span>Context-aware responses</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span>Local recommendations</span>
                        </div>
                      </div>
                    </div>
                    <img
                      src={images.chat}
                      alt="AI chat interface"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events System */}
          <TabsContent value="events">
            <Card>
              <CardContent className="p-6 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Events System
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium">Event Management</h3>
                      <p className="text-muted-foreground">
                        Create, discover, and join events with fellow digital nomads in your area.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>Location-based discovery</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Category filtering</span>
                        </div>
                      </div>
                    </div>
                    <img
                      src={images.events}
                      alt="Events interface"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

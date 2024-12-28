import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import { Loader2, Globe, Users, Calendar } from "lucide-react";
import type { Event } from "@db/schema";

export default function HomePage() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Connect with Digital Nomads Worldwide
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
          Discover events, meet fellow travelers, and create unforgettable experiences in your current city.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/events">
            <Button size="lg">
              <Calendar className="mr-2 h-4 w-4" />
              Browse Events
            </Button>
          </Link>
          <Link href="/profile">
            <Button size="lg" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Find People
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Images Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <img
          src="https://images.unsplash.com/photo-1718631919875-934a5f3ad411"
          alt="Digital nomad working"
          className="rounded-lg object-cover h-48 w-full"
        />
        <img
          src="https://images.unsplash.com/photo-1605882171181-e31b036e4ceb"
          alt="Coworking space"
          className="rounded-lg object-cover h-48 w-full"
        />
        <img
          src="https://images.unsplash.com/photo-1496950866446-3253e1470e8e"
          alt="Travel experience"
          className="rounded-lg object-cover h-48 w-full"
        />
        <img
          src="https://images.unsplash.com/photo-1495106245177-55dc6f43e83f"
          alt="Social gathering"
          className="rounded-lg object-cover h-48 w-full"
        />
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Join Our Community?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <Globe className="mx-auto h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Global Network</h3>
            <p className="text-muted-foreground">Connect with digital nomads and travelers from around the world.</p>
          </div>
          <div className="text-center space-y-4">
            <Calendar className="mx-auto h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Local Events</h3>
            <p className="text-muted-foreground">Discover and join events happening in your current city.</p>
          </div>
          <div className="text-center space-y-4">
            <Users className="mx-auto h-12 w-12 text-primary" />
            <h3 className="text-xl font-semibold">Community</h3>
            <p className="text-muted-foreground">Build meaningful connections with like-minded individuals.</p>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link href="/events">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

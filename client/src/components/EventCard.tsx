import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { format } from "date-fns";
import type { EventWithRelations } from "@db/schema";

type EventCardProps = {
  event: EventWithRelations;
  onParticipate?: () => void;
};

export default function EventCard({ event, onParticipate }: EventCardProps) {
  return (
    <Card className="overflow-hidden">
      {event.imageUrl && (
        <div className="relative h-48 w-full">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{event.category}</p>
          </div>
          {event.creator && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={event.creator.profileImage || undefined} />
              <AvatarFallback>
                {event.creator.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{event.description}</p>
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4" />
            {format(new Date(event.date), "PPP 'at' p")}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPinIcon className="h-4 w-4" />
            {event.location}
          </div>
          {event.capacity && (
            <div className="flex items-center gap-2 text-sm">
              <UsersIcon className="h-4 w-4" />
              {event.capacity} spots
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onParticipate}
          variant="secondary"
        >
          Join Event
        </Button>
      </CardFooter>
    </Card>
  );
}
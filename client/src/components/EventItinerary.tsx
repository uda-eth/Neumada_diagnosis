import { useMemo } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";

type ItineraryItem = {
  startTime: string;
  endTime: string;
  description: string;
};

interface EventItineraryProps {
  itinerary: ItineraryItem[] | null | undefined;
  className?: string;
}

export default function EventItinerary({ itinerary, className = "" }: EventItineraryProps) {
  // Sort itinerary items by startTime
  const sortedItinerary = useMemo(() => {
    if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
      return [];
    }

    return [...itinerary].sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [itinerary]);

  if (!sortedItinerary.length) {
    return null;
  }

  // Format time string for display
  const formatTimeString = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, "h:mm a"); // Format as "1:30 PM"
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Event Schedule
      </h2>
      
      <div className="space-y-0">
        {sortedItinerary.map((item, index) => (
          <div key={index} className="relative pl-8 py-3 border-l border-white/20 group">
            {/* Time circle indicator */}
            <div className="absolute left-[-8px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
            
            {/* Time range */}
            <div className="text-sm font-medium text-primary">
              {formatTimeString(item.startTime)} - {formatTimeString(item.endTime)}
            </div>
            
            {/* Activity description */}
            <div className="mt-1 text-white/80">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
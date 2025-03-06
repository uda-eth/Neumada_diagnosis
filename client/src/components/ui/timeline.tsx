import { cn } from "@/lib/utils";

interface TimelineProps {
  schedule: Array<{
    time: string;
    artist: string;
    stage?: string;
    description?: string;
  }>;
  className?: string;
}

export function Timeline({ schedule, className }: TimelineProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {schedule.map((item, index) => (
        <div key={index} className="relative pl-8 pb-8">
          {/* Timeline connector line */}
          {index !== schedule.length - 1 && (
            <div className="absolute left-[11px] top-[24px] bottom-0 w-[2px] bg-border" />
          )}
          {/* Time marker */}
          <div className="absolute left-0 top-[10px] w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-background" />
          </div>
          {/* Content */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{item.time}</p>
            <h4 className="text-lg font-semibold leading-none">{item.artist}</h4>
            {item.stage && (
              <p className="text-sm text-muted-foreground">{item.stage}</p>
            )}
            {item.description && (
              <p className="text-sm text-muted-foreground/80 mt-2">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

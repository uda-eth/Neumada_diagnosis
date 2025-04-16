import { useState, useEffect } from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Clock } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ItineraryFormFieldProps {
  name: string; // field name for the form context
}

export function ItineraryFormField({ name }: ItineraryFormFieldProps) {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name,
    control: form.control,
  });

  // Add a new itinerary item
  const handleAddItem = () => {
    const defaultStartTime = new Date();
    const defaultEndTime = new Date(defaultStartTime);
    defaultEndTime.setHours(defaultEndTime.getHours() + 1);

    append({
      startTime: defaultStartTime.toISOString(),
      endTime: defaultEndTime.toISOString(),
      description: "",
    });
  };

  // Format time input fields - we use time inputs which require HH:MM format
  const formatTimeForInput = (isoTimeString: string) => {
    try {
      const date = new Date(isoTimeString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time for input:", error);
      return "00:00";
    }
  };

  // Convert time input (HH:MM) back to ISO string
  const convertTimeToISO = (timeString: string, baseDate: string) => {
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date(baseDate);
      date.setHours(hours, minutes);
      return date.toISOString();
    } catch (error) {
      console.error("Error converting time to ISO:", error);
      return new Date().toISOString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium inline-flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Event Schedule
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
          No schedule items added yet. Click "Add Item" to start creating your event schedule.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border border-white/10 rounded-md space-y-4 bg-white/5"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Item {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-8 px-2 text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Time Field */}
                <FormField
                  control={form.control}
                  name={`${name}.${index}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Start Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={formatTimeForInput(field.value)}
                          onChange={(e) => {
                            const baseDate = field.value;
                            field.onChange(convertTimeToISO(e.target.value, baseDate));
                          }}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Time Field */}
                <FormField
                  control={form.control}
                  name={`${name}.${index}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">End Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={formatTimeForInput(field.value)}
                          onChange={(e) => {
                            const baseDate = field.value;
                            field.onChange(convertTimeToISO(e.target.value, baseDate));
                          }}
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Field */}
              <FormField
                control={form.control}
                name={`${name}.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe this activity"
                        className="resize-none text-sm min-h-[60px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
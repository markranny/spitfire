// components/ui/custom-date-picker.tsx
import * as React from "react";
import { ControllerRenderProps } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CustomDatePickerProps {
  field: ControllerRenderProps<any, string>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disabledDates?: (date: Date) => boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  field,
  placeholder = "Pick a date",
  disabled = false,
  className,
  disabledDates,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] h-12 justify-start text-left font-normal",
            !field.value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {field.value ? format(field.value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-0 bg-white-50 border border-gray-200 rounded-md shadow-lg",
          "dark:bg-gray-800 dark:border-gray-700" // Support dark mode if using a theme
        )}
        align="start"
      >
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          disabled={disabledDates || ((date) => date > new Date())}
          className={cn(
            "bg-white-50 rounded-md", // Ensure the calendar itself has a background
            "dark:bg-gray-800" // Support dark mode
          )}
        />
      </PopoverContent>
    </Popover>
  );
};

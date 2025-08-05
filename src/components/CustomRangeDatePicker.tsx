// components/ui/custom-date-range-picker.tsx
import * as React from "react";
import { ControllerRenderProps } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker"; // Import DateRange type

interface CustomDateRangePickerProps {
  field: ControllerRenderProps<any, string>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disabledDates?: (date: Date) => boolean;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  field,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  disabledDates,
}) => {
  // Ensure the field value is a DateRange object or undefined
  const value: DateRange | undefined = field.value
    ? {
        from: field.value.from ? new Date(field.value.from) : undefined,
        to: field.value.to ? new Date(field.value.to) : undefined,
      }
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "min-w-[280px] justify-start text-left font-normal h-12", // Slightly wider to accommodate range text
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto p-0 bg-white border bg-white-50 border-gray-200 rounded-md shadow-lg",
          "dark:bg-gray-800 dark:border-gray-700"
        )}
        align="start"
      >
        {/* <Calendar
          mode="range" // Set mode to range
          selected={value}
          onSelect={field.onChange} // Updates the field value with { from, to }
          disabled={disabledDates || ((date) => date > new Date())}

          numberOfMonths={2} // Show two months for easier range selection
          className={cn("bg-white rounded-md", "dark:bg-gray-800")}
        /> */}
      </PopoverContent>
    </Popover>
  );
};

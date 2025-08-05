import React from "react";
import { ControllerRenderProps, FieldValues, useFormContext, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox"; // Add this import
import { Edit, X, Plus } from "lucide-react";
import { registerPlugin } from "filepond";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { CustomDatePicker } from "./CustomDatePicker";
import { CustomDateRangePicker } from "./CustomRangeDatePicker";
import { PhoneInput } from "./PhoneInput";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "textarea"
    | "number"
    | "phone"
    | "select"
    | "switch"
    | "password"
    | "file"
    | "multi-input"
    | "checkbox"
    | "date"
    | "date-range";
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  labelElement?: React.ReactNode;
  value?: string | boolean;
  disabled?: boolean;
  multiple?: boolean;
  isIcon?: boolean;
  initialValue?: string | number | boolean | string[] | Date | { from?: Date; to?: Date };
  onChange?: (value: any) => void;
  disabledDates?: (date: Date) => boolean;
  checked?: boolean;
  step?: string;
  spellcheck?: boolean;
}

export const CustomFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options,
  accept,
  className,
  inputClassName,
  labelClassName,
  labelElement,
  disabled = false,
  multiple = false,
  isIcon = false,
  initialValue,
  onChange,
  disabledDates,
  checked,
  step,
  spellcheck = true,
}) => {
  const { control } = useFormContext();

  const renderFormControl = (field: ControllerRenderProps<FieldValues, string>) => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            spellCheck={true}
            placeholder={placeholder}
            {...field}
            disabled={disabled}
            rows={5}
            className={`border-gray-400 p-4 ${inputClassName}`}
          />
        );
      case "select":
        return (
          <Select
            value={field.value || (initialValue as string)}
            defaultValue={field.value || (initialValue as string)}
            onValueChange={field.onChange}
          >
            <SelectTrigger className={`w-full h-12 w-auto bg-white border border-gray-400 rounded-md p-4 ${inputClassName}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="w-full text-black bg-white border border-gray-400 rounded-md">
              {options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={`cursor-pointer bg-white text-black hover:!bg-gray-100 hover:!text-customgreys-darkGrey`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value}
              onCheckedChange={onChange || field.onChange}
              id={name}
              className={`text-customgreys-dirtyGrey ${inputClassName}`}
            />
            <FormLabel htmlFor={name} className={labelClassName}>
              {label}
            </FormLabel>
          </div>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={checked || field.value}
              onCheckedChange={onChange || field.onChange}
              disabled={disabled}
              className={inputClassName}
            />
            <FormLabel htmlFor={name} className={labelClassName}>
              {labelElement ? labelElement : label}
            </FormLabel>
          </div>
        );
      case "date": // Add case for date picker
        return (
          <CustomDatePicker
            field={field}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClassName} // Pass inputClassName to the date picker
            disabledDates={disabledDates}
          />
        );
      case "date-range": // Add case for date range picker
        return (
          <CustomDateRangePicker
            field={field}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClassName}
            disabledDates={disabledDates}
          />
        );
      case "file":
        const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
        const acceptedFileTypes = accept ? [accept] : ACCEPTED_VIDEO_TYPES;

        return (
          <FilePond
            className={`${inputClassName}`}
            files={field.value ? [field.value] : []}
            allowMultiple={multiple}
            onupdatefiles={(fileItems) => {
              field.onChange(multiple ? fileItems.map((fileItem) => fileItem.file) : fileItems[0]?.file);
            }}
            acceptedFileTypes={acceptedFileTypes}
            labelIdle={`Drag & Drop your files or <span class="filepond--label-action">Browse</span>`}
            credits={false}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={placeholder}
            step={step}
            {...field}
            className={`border-gray-400 h-12 p-4 ${inputClassName}`}
            disabled={disabled}
            onChange={(event) => field.onChange(+event.target.value)}
          />
        );
      case "multi-input":
        return (
          <MultiInputField name={name} control={control} placeholder={placeholder} inputClassName={inputClassName} />
        );
      case "phone":
        return (
         <PhoneInput placeholder={placeholder} className={`border-gray-400 h-12 p-4 ${inputClassName}`} {...field} />
      )
        default:
        return (
          <Input
            spellCheck={spellcheck}
            type={type}
            placeholder={placeholder}
            {...field}
            className={`border-gray-400 h-12 p-4 ${inputClassName}`}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={initialValue}
      render={({ field }) => (
        <FormItem className={`${type !== "switch" && type !== "checkbox" && "rounded-md"} relative ${className}`}>
          {type !== "switch" && type !== "checkbox" && (
            <div className="flex justify-between items-center">
              <FormLabel className={`text-black text-sm ${labelClassName}`}>{label}</FormLabel>
              {!disabled && isIcon && type !== "file" && type !== "multi-input" && (
                <Edit className="size-4 text-customgreys-dirtyGrey" />
              )}
            </div>
          )}
          <FormControl>
            {renderFormControl({
              ...field,
              value: field.value !== undefined ? field.value : initialValue,
            })}
          </FormControl>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
};

interface MultiInputFieldProps {
  name: string;
  control: any;
  placeholder?: string;
  inputClassName?: string;
}

const MultiInputField: React.FC<MultiInputFieldProps> = ({ name, control, placeholder, inputClassName }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <FormField
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className={`flex-1 border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
                />
              </FormControl>
            )}
          />
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="ghost"
            size="icon"
            className="text-customgreys-dirtyGrey"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => append("")}
        variant="outline"
        size="sm"
        className="mt-2 text-customgreys-dirtyGrey"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};

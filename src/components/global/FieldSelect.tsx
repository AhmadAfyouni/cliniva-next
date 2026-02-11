import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useParams } from "next/navigation";
import { Control, FieldPath, FieldValues } from "react-hook-form";

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  control: Control<TFieldValues>;
  description?: string;
  placeholder?: string;
  required?: boolean;
  items: { value: string; label: string }[];
};

export default function FieldSelect<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  description,
  placeholder,
  required = false,
  items,
}: Props<TFieldValues>) {
  // Left to Right layout for RTL languages
  const params = useParams();
  const locale = params.locale as string;

  const isRTL = locale === "ar";
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            htmlFor={field.name}
            className={[
              "text-sm font-lato text-primary font-normal leading-relaxed",
              isRTL ? "text-right" : "text-left",
            ].join(" ")}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </FormLabel>

          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger
                className={[
                  isRTL ? "text-right" : "text-left",
                  // match Input styling
                  "!h-[48px] w-full text-base font-lato border-border bg-background text-foreground",
                  "focus-visible:ring-ring focus-visible:border-ring shadow-sm",
                  "placeholder:text-muted-foreground",
                  "pl-4 pr-4",
                ].join(" ")}
                style={{
                  boxShadow: "0px 0px 1px 1px rgba(21, 197, 206, 0.16)",
                  borderRadius: "8px",
                }}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription className={isRTL ? "text-right" : "text-left"}>
            {description}
          </FormDescription>
          <FormMessage className={isRTL ? "text-right" : "text-left"} />
        </FormItem>
      )}
    />
  );
}

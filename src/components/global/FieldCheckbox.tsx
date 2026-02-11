import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { useParams } from "next/navigation";

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  control: Control<TFieldValues>;
  description?: string;
};

export default function FieldCheckbox<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  description,
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
        <FormItem className="flex items-center gap-3">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              id={field.name}
              className={[
                "w-4 h-4 border-[#00B48D] data-[state=checked]:bg-[#00B48D] data-[state=checked]:border-[#00B48D]",
                isRTL ? "text-right" : "text-left",
              ].join(" ")}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel
              htmlFor={field.name}
              className="text-sm font-lato text-primary font-normal leading-relaxed"
            >
              {label}
            </FormLabel>
            <FormDescription className={isRTL ? "text-right" : "text-left"}>
              {description}
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
}

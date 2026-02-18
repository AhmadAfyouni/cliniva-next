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

type Variant = "default" | "pill";

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label?: string;
  control: Control<TFieldValues>;
  description?: string;
  placeholder?: string;
  required?: boolean;
  items: { value: string; label: string }[];

  variant?: Variant;
  hideLabel?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<typeof SelectTrigger>,
  "value" | "defaultValue" | "onValueChange"
>;

export default function FieldSelect<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  description,
  placeholder,
  required = false,
  items,

  variant = "default",
  hideLabel = false,
}: Props<TFieldValues>) {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const triggerClassName =
    variant === "pill"
      ? [
          // ✅ keep same height
          "!h-[48px]",

          // pill shape
          "rounded-full",

          // remove border + shadow
          "border-0 shadow-none",

          // background like screenshot
          "!bg-emerald-100/60 text-foreground",

          // content-based width (not full width)
          "w-fit min-w-[120px]",

          // spacing
          "px-6",

          // remove ring glow
          "focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",

          isRTL ? "text-right" : "text-left",
        ].join(" ")
      : [
          "!h-[48px] w-full text-base font-lato border-border bg-background text-foreground",
          "focus-visible:ring-ring focus-visible:border-ring shadow-sm",
          "placeholder:text-muted-foreground",
          "pl-4 pr-4",
          isRTL ? "text-right" : "text-left",
        ].join(" ");

  const triggerStyle =
    variant === "pill"
      ? undefined
      : {
          boxShadow: "0px 0px 1px 1px rgba(21, 197, 206, 0.16)",
          borderRadius: "8px",
        };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {!hideLabel && label && (
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
          )}

          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className={triggerClassName} style={triggerStyle}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent
              className={
                variant === "pill"
                  ? ["rounded-2xl border-0 shadow-lg", "bg-white", "p-2"].join(
                      " ",
                    )
                  : ""
              }
            >
              {items.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  className={
                    variant === "pill"
                      ? [
                          "rounded-xl px-4 py-2 text-sm font-lato",
                          "focus:bg-emerald-100/60 focus:text-foreground",
                          "data-[highlighted]:bg-emerald-100/60 data-[highlighted]:text-foreground",
                          "cursor-pointer",
                        ].join(" ")
                      : ""
                  }
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {description && (
            <FormDescription className={isRTL ? "text-right" : "text-left"}>
              {description}
            </FormDescription>
          )}
          <FormMessage className={isRTL ? "text-right" : "text-left"} />
        </FormItem>
      )}
    />
  );
}

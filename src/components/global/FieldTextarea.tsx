import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { useParams } from "next/navigation";

type Layout = "stacked" | "inline";
type Variant = "glow" | "flat";

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string | React.ReactNode;
  placeholder?: string;
  control: Control<TFieldValues>;
  description?: string;
  required?: boolean;

  layout?: Layout;
  variant?: Variant;

  wrapperClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;

  labelWidthClassName?: string;
  rows?: number;

  /** show counter even without maxLength */
  showCharCount?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  "name" | "defaultValue" | "value" | "onChange"
>;

export default function FieldTextarea<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  description,
  required = false,

  layout = "stacked",
  variant = "glow",

  wrapperClassName,
  labelClassName,
  textareaClassName,
  labelWidthClassName = "w-52",
  rows = 2,

  showCharCount = false,

  ...rest
}: Props<TFieldValues>) {
  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const baseTextareaClasses = [
    "text-base font-lato",
    "bg-background text-foreground border-border",
    "focus-visible:ring-ring focus-visible:border-ring",
    "placeholder:text-muted-foreground",
    isRTL ? "text-right" : "text-left",
  ].join(" ");

  const textareaVariantClasses =
    variant === "glow"
      ? "shadow-sm"
      : "shadow-none border border-border rounded-md";

  const textareaStyle =
    variant === "glow"
      ? {
          boxShadow: "0px 0px 1px 1px rgba(21, 197, 206, 0.16)",
          borderRadius: "8px",
        }
      : {
          boxShadow: "none",
          borderRadius: "6px",
        };

  const itemLayoutClass =
    layout === "inline" ? "flex items-start gap-6" : "space-y-2";

  const labelLayoutClass =
    layout === "inline" ? [labelWidthClassName, "shrink-0 mt-2"].join(" ") : "";

  // maxLength comes from native textarea props
  const maxLength =
    typeof rest.maxLength === "number" ? rest.maxLength : undefined;

  const shouldShowCounter = showCharCount || typeof maxLength === "number";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const valueAsString =
          field.value === null || field.value === undefined
            ? ""
            : String(field.value);

        const currentLength = valueAsString.length;

        return (
          <FormItem className={[itemLayoutClass, wrapperClassName].join(" ")}>
            <FormLabel
              htmlFor={field.name}
              className={[
                "text-sm font-lato text-primary font-normal leading-relaxed",
                isRTL ? "text-right" : "text-left",
                labelLayoutClass,
                labelClassName,
              ].join(" ")}
            >
              {label}
              {required && <span className="text-red-500">*</span>}
            </FormLabel>

            <div className={layout === "inline" ? "flex-1 min-w-0 w-full" : ""}>
              <FormControl>
                <Textarea
                  {...rest}
                  {...field}
                  id={field.name}
                  placeholder={placeholder}
                  rows={rows}
                  className={[
                    baseTextareaClasses,
                    textareaVariantClasses,
                    "min-h-[120px] px-4 py-3 w-full resize-y whitespace-pre-wrap break-words",
                    textareaClassName,
                  ].join(" ")}
                  style={textareaStyle}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    rest.onBlur?.(e);
                  }}
                />
              </FormControl>

              {/* bottom row: description (left) + counter (right) */}
              {(description || shouldShowCounter) && (
                <div
                  className={[
                    "mt-1 flex items-center justify-between gap-3",
                    isRTL ? "flex-row-reverse" : "flex-row",
                  ].join(" ")}
                >
                  <div className="text-xs text-muted-foreground">
                    {description}
                  </div>

                  {shouldShowCounter && (
                    <div
                      className={[
                        "text-xs",
                        fieldState.invalid
                          ? "text-destructive"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {typeof maxLength === "number"
                        ? `${currentLength} / ${maxLength}`
                        : `${currentLength}`}
                    </div>
                  )}
                </div>
              )}

              <FormMessage />
            </div>
          </FormItem>
        );
      }}
    />
  );
}

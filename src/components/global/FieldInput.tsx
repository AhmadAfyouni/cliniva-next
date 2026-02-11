import React, { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useParams } from "next/navigation";
import { ValidationMessage } from "../ui/validation-message";
import { UniqueValidationState } from "@/hooks/useUniqueValidation";

type Layout = "stacked" | "inline";
type Variant = "glow" | "flat";

type Props<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string | React.ReactNode;
  placeholder?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  control: Control<TFieldValues>;
  description?: string;
  icon?: React.ReactNode;
  required?: boolean;
  validate?: boolean;
  validation?: UniqueValidationState;

  // ✅ new
  layout?: Layout;
  variant?: Variant;

  // optional overrides if needed
  wrapperClassName?: string;
  labelClassName?: string;
  inputClassName?: string;

  // inline layout sizing
  labelWidthClassName?: string; // e.g. "w-48"
} & Omit<
  React.ComponentPropsWithoutRef<"input">,
  "name" | "defaultValue" | "value" | "onChange"
>;

export default function FieldInput<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  control,
  description,
  icon,
  required = false,
  validate = false,
  validation,

  layout = "stacked",
  variant = "glow",

  wrapperClassName,
  labelClassName,
  inputClassName,
  labelWidthClassName = "w-52",
  ...rest
}: Props<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const baseInputClasses = [
    "h-[48px] text-base font-lato",
    "bg-background text-foreground border-border",
    "focus-visible:ring-ring focus-visible:border-ring",
    "placeholder:text-muted-foreground",
    isRTL ? "text-right" : "text-left",
  ].join(" ");

  // ✅ style variants
  const inputVariantClasses =
    variant === "glow"
      ? "shadow-sm"
      : "shadow-none border border-border rounded-md"; // “flat” look

  const inputPaddingClasses = [
    icon ? "pl-12" : "pl-4",
    isPassword ? "pr-12" : "pr-4",
  ].join(" ");

  // ✅ variant-specific inline style (only for glow since you used inline shadow+radius)
  const inputStyle =
    variant === "glow"
      ? {
          boxShadow: "0px 0px 1px 1px rgba(21, 197, 206, 0.16)",
          borderRadius: "8px",
        }
      : {
          boxShadow: "none",
          borderRadius: "6px",
        };

  // ✅ layout wrapper
  const itemLayoutClass =
    layout === "inline" ? "flex items-center gap-6" : "space-y-2";

  // ✅ label alignment for inline
  const labelLayoutClass =
    layout === "inline" ? [labelWidthClassName, "shrink-0 mb-0"].join(" ") : "";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
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

          <div className={layout === "inline" ? "flex-1" : ""}>
            <FormControl>
              <div className="relative">
                {icon && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    {icon}
                  </span>
                )}

                <Input
                  {...rest}
                  {...field}
                  id={field.name}
                  placeholder={placeholder}
                  type={isPassword && showPassword ? "text" : type}
                  className={[
                    baseInputClasses,
                    inputVariantClasses,
                    inputPaddingClasses,
                    inputClassName,
                  ].join(" ")}
                  style={inputStyle}
                  onChange={(e) => {
                    field.onChange(e);
                    if (type === "number") {
                      const value = e.target.value;
                      field.onChange(value ? parseInt(value) : undefined);
                    }
                  }}
                />

                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Eye
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.5}
                      />
                    )}
                  </button>
                )}
              </div>
            </FormControl>

            {/* In inline layout, descriptions usually still go under the input */}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
            {validate && validation && (
              <ValidationMessage validation={validation} />
            )}
          </div>
        </FormItem>
      )}
    />
  );
}

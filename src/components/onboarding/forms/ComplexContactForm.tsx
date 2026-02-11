"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronLeft,
  ChevronRight,
  PlusIcon,
  TrashIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  GlobeIcon,
  Building,
  Mail,
  Home,
  Hash,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  MailIcon,
  HeartIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  ComplexContactDto,
  PhoneNumberDto,
  AddressDto,
  EmergencyContactDto,
  SocialMediaLinksDto,
} from "@/types/onboarding";
import { saveComplexContact } from "@/api/onboardingApiClient";
import { useUniqueValidation } from "@/hooks/useUniqueValidation";
import { FormFieldWithIcon } from "@/components/ui/form-field-with-icon";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { ValidationMessage } from "@/components/ui/validation-message";
import FieldInput from "@/components/global/FieldInput";

// Phone number validation schema
const phoneNumberSchema = z.object({
  number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
  type: z.enum(["primary", "secondary", "emergency", "fax", "mobile"], {
    message: "Please select a phone type",
  }),
  label: z.string().optional(),
});

// Address validation schema
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  googleLocation: z.string().optional(),
});

// Emergency contact validation schema
const emergencyContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  relationship: z.string().optional(),
});

// Social media links validation schema
const socialMediaLinksSchema = z.object({
  facebook: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid Facebook URL" },
    ),
  instagram: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid Instagram URL" },
    ),
  twitter: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid Twitter URL" },
    ),
  linkedin: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid LinkedIn URL" },
    ),
  whatsapp: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid WhatsApp URL" },
    ),
  youtube: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid YouTube URL" },
    ),
});

// Form validation schema matching ComplexContactDto
const complexContactSchema = z.object({
  phoneNumbers: z
    .array(phoneNumberSchema)
    .min(1, "At least one phone number is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  socialMediaLinks: socialMediaLinksSchema.optional(),
});

type ComplexContactFormData = z.infer<typeof complexContactSchema>;

interface ComplexContactFormProps {
  onNext: (data: ComplexContactDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ComplexContactDto>;
  organizationData?: any; // For inheritance
  isLoading?: boolean;
}

export const ComplexContactForm: React.FC<ComplexContactFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  organizationData,
  isLoading = false,
}) => {
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isEmergencyExpanded, setIsEmergencyExpanded] = useState(false);
  const [isSocialExpanded, setIsSocialExpanded] = useState(false);
  const [useInheritance] = useState(true); // Always inherit from organization data
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply data inheritance from organization if available and requested
  const getInheritedContactValue = (field: string, currentValue?: any) => {
    if (!useInheritance || !organizationData || currentValue)
      return currentValue;

    // Handle nested objects
    if (field.includes(".")) {
      const [parentField, childField] = field.split(".");
      return organizationData.contact?.[parentField]?.[childField];
    }

    return organizationData.contact?.[field];
  };

  const form = useForm<ComplexContactFormData>({
    resolver: zodResolver(complexContactSchema),
    defaultValues: {
      phoneNumbers:
        initialData.phoneNumbers ||
        (organizationData?.contact?.phoneNumbers?.length
          ? organizationData.contact.phoneNumbers
          : [{ number: "", type: "primary" }]),
      email: initialData.email || getInheritedContactValue("email") || "",
      address: initialData.address || {
        street: getInheritedContactValue("address.street") || "",
        city: getInheritedContactValue("address.city") || "",
        state: getInheritedContactValue("address.state") || "",
        postalCode: getInheritedContactValue("address.postalCode") || "",
        country: getInheritedContactValue("address.country") || "",
        googleLocation:
          getInheritedContactValue("address.googleLocation") || "",
      },
      emergencyContact: initialData.emergencyContact || {
        name: "",
        phone: "",
        email: "",
        relationship: "",
      },
      socialMediaLinks: {
        facebook:
          initialData.socialMediaLinks?.facebook ||
          getInheritedContactValue("socialMediaLinks.facebook") ||
          "",
        instagram:
          initialData.socialMediaLinks?.instagram ||
          getInheritedContactValue("socialMediaLinks.instagram") ||
          "",
        twitter:
          initialData.socialMediaLinks?.twitter ||
          getInheritedContactValue("socialMediaLinks.twitter") ||
          "",
        linkedin:
          initialData.socialMediaLinks?.linkedin ||
          getInheritedContactValue("socialMediaLinks.linkedin") ||
          "",
        whatsapp:
          initialData.socialMediaLinks?.whatsapp ||
          getInheritedContactValue("socialMediaLinks.whatsapp") ||
          "",
        youtube:
          initialData.socialMediaLinks?.youtube ||
          getInheritedContactValue("socialMediaLinks.youtube") ||
          "",
      },
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control: form.control,
    name: "phoneNumbers",
  });

  // Real-time validation for email uniqueness
  const currentEmail = form.watch("email") || "";
  const isEditingExistingEmail = Boolean(
    initialData?.email &&
    initialData.email.trim().length > 0 &&
    currentEmail.trim().toLowerCase() ===
      initialData.email.trim().toLowerCase(),
  );

  const emailValidation = useUniqueValidation(
    currentEmail,
    "email",
    800, // 800ms debounce delay
    undefined,
    isEditingExistingEmail, // Skip validation if editing existing email
  );

  const addPhoneNumber = () => {
    appendPhone({ number: "", type: "secondary", label: "" });
  };

  const onSubmit = async (data: ComplexContactFormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate and clean the data
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => {
          if (typeof value === "string") {
            return value.trim() !== "";
          }
          return value !== undefined && value !== null;
        }),
      ) as ComplexContactFormData;

      // Check unique validation before submitting
      if (
        emailValidation.hasChecked &&
        (!emailValidation.isValid || !emailValidation.isAvailable)
      ) {
        toast.error("Please fix the email issue before continuing");
        setIsSubmitting(false);
        return;
      }

      // If validation is still in progress, wait for it
      if (emailValidation.isChecking) {
        toast.info("Please wait for email validation to complete");
        setIsSubmitting(false);
        return;
      }

      // Transform form data to ComplexContactDto
      const contactData: ComplexContactDto = {
        phoneNumbers: data.phoneNumbers?.filter(
          (phone) => phone.number.trim() !== "",
        ),
        email: data.email || undefined,
        address: data.address,
        emergencyContact: data.emergencyContact,
        socialMediaLinks: data.socialMediaLinks,
      };

      console.log("📤 Submitting complex contact:", contactData);

      // Save to backend
      const response = await saveComplexContact(contactData);

      if (response.success) {
        console.log("✅ Complex contact saved successfully:", response);
        toast.success("Complex contact information saved successfully!");

        // Pass the response data including entityId to the parent
        onNext({
          ...contactData,
          entityId: response.entityId,
        } as any);
      } else {
        throw new Error(
          response.message || "Failed to save complex contact information",
        );
      }
    } catch (error: any) {
      console.error("❌ Error saving complex contact:", error);

      // Handle specific error cases
      if (error.message && error.message.includes("Complex not found")) {
        toast.error(
          "Please complete the complex overview step first before adding contact information.",
        );
      } else if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: "manual",
            message: err.message,
          });
        });
        toast.error("Please check the form for errors");
      } else {
        toast.error(
          error.message || "Failed to save complex contact information",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar would go here if needed */}
      <div className="flex-1 p-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors font-lato"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Previous Step
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Complex Contact Information
          </h1>
          <p className="text-muted-foreground font-lato">
            Provide contact details for your medical complex
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            {/* Basic Contact Information */}
            <CollapsibleCard
              title="Basic Contact"
              isOpen={isContactExpanded}
              onToggle={() => setIsContactExpanded(!isContactExpanded)}
            >
              <div className="space-y-6">
                {/* Phone Numbers */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Phone Numbers</Label>

                  {phoneFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-3">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Phone number"
                                  className="h-12"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-32">
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger className="h-12">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="primary">
                                    Primary
                                  </SelectItem>
                                  <SelectItem value="secondary">
                                    Secondary
                                  </SelectItem>
                                  <SelectItem value="emergency">
                                    Emergency
                                  </SelectItem>
                                  <SelectItem value="fax">Fax</SelectItem>
                                  <SelectItem value="mobile">Mobile</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-24">
                        <FormField
                          control={form.control}
                          name={`phoneNumbers.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Label"
                                  className="h-12"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {phoneFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removePhone(index)}
                          className="h-12 w-12 shrink-0"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {phoneFields.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPhoneNumber}
                      className="w-full h-12 border-dashed"
                      disabled={isLoading}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Phone Number
                    </Button>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-primary font-lato">
                    Email Address
                  </label>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                              <Mail
                                className="h-[18px] w-[18px] text-primary"
                                strokeWidth={1.5}
                              />
                            </div>
                            <Input
                              {...field}
                              type="email"
                              placeholder="complex@example.com"
                              className="h-[48px] pl-12 pr-4 text-base font-lato border-border bg-background text-foreground focus-visible:ring-ring focus-visible:border-ring shadow-sm placeholder:text-muted-foreground"
                              style={{
                                boxShadow:
                                  "0px 0px 1px 1px rgba(21, 197, 206, 0.16)",
                                borderRadius: "8px",
                              }}
                              disabled={
                                isSubmitting || emailValidation.isChecking
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <ValidationMessage validation={emailValidation} />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CollapsibleCard>

            {/* Address Information */}
            <CollapsibleCard
              title="Address Information"
              isOpen={isAddressExpanded}
              onToggle={() => setIsAddressExpanded(!isAddressExpanded)}
            >
              <div className="px-6 pb-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Google Location */}
                  <FieldInput
                    control={form.control}
                    name="address.googleLocation"
                    label={
                      <span className="flex items-center gap-x-1">
                        <MapPinIcon
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Google Maps Location
                      </span>
                    }
                    placeholder="Google Maps URL or Place ID"
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />
                  {/* Company Website */}
                  <FieldInput
                    control={form.control}
                    name="address.googleLocation"
                    label={
                      <span className="flex items-center gap-x-1">
                        <GlobeIcon
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Company Website
                      </span>
                    }
                    placeholder="Website URL"
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />
                </div>
                {/* Street Address */}
                <FieldInput
                  control={form.control}
                  name="address.street"
                  label="Street Address"
                  placeholder="123 Main Street"
                  layout="inline"
                  variant="flat"
                  disabled={isLoading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* City */}
                  <FieldInput
                    control={form.control}
                    name="address.city"
                    label="City"
                    placeholder="City name"
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* State */}
                  <FieldInput
                    control={form.control}
                    name="address.state"
                    label="State/Province"
                    placeholder="State or Province"
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Postal Code */}
                  <FieldInput
                    control={form.control}
                    name="address.postalCode"
                    label="Postal Code"
                    placeholder="12345"
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* Country */}
                  <FieldInput
                    control={form.control}
                    name="address.country"
                    label="Country"
                    placeholder="Country name"
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CollapsibleCard>

            {/* Emergency Contact */}
            <CollapsibleCard
              title="Emergency Contact"
              isOpen={isEmergencyExpanded}
              onToggle={() => setIsEmergencyExpanded(!isEmergencyExpanded)}
            >
              <div className="px-6 pb-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Emergency Contact Name */}
                  <FieldInput
                    control={form.control}
                    name="emergencyContact.name"
                    placeholder="Contact Name"
                    label={
                      <span className="flex items-center gap-x-1">
                        <UserIcon
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Contact Name
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* Emergency Contact Phone */}
                  <FieldInput
                    control={form.control}
                    name="emergencyContact.phone"
                    placeholder="+1234567890"
                    label={
                      <span className="flex items-center gap-x-1">
                        <PhoneIcon
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Contact Phone
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Emergency Contact Email */}
                  <FieldInput
                    type="email"
                    control={form.control}
                    name="emergencyContact.email"
                    placeholder="emergency@example.com"
                    label={
                      <span className="flex items-center gap-x-1">
                        <MailIcon
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Contact Email
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* Relationship */}
                  <FieldInput
                    control={form.control}
                    name="emergencyContact.relationship"
                    placeholder="Manager, Owner, etc."
                    label={
                      <span className="flex items-center gap-x-1">
                        <HeartIcon
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Relationship
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CollapsibleCard>

            {/* Social Media Links */}
            <CollapsibleCard
              title="Social Media & Web"
              isOpen={isSocialExpanded}
              onToggle={() => setIsSocialExpanded(!isSocialExpanded)}
            >
              <div className="px-6 pb-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Facebook */}
                  <FieldInput
                    control={form.control}
                    name="socialMediaLinks.facebook"
                    placeholder="https://facebook.com/yourcompany"
                    label={
                      <span className="flex items-center gap-x-1">
                        <Facebook
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Facebook
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* Instagram */}
                  <FieldInput
                    control={form.control}
                    name="socialMediaLinks.instagram"
                    placeholder="https://instagram.com/yourcompany"
                    label={
                      <span className="flex items-center gap-x-1">
                        <Instagram
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Instagram
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* Twitter */}
                  <FieldInput
                    control={form.control}
                    name="socialMediaLinks.twitter"
                    placeholder="https://twitter.com/yourcompany"
                    label={
                      <span className="flex items-center gap-x-1">
                        <Twitter
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        Twitter
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* LinkedIn */}
                  <FieldInput
                    control={form.control}
                    name="socialMediaLinks.linkedin"
                    placeholder="https://linkedin.com/company/yourcompany"
                    label={
                      <span className="flex items-center gap-x-1">
                        <Linkedin
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        LinkedIn
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* WhatsApp */}
                  <FieldInput
                    control={form.control}
                    name="socialMediaLinks.whatsapp"
                    placeholder="https://wa.me/1234567890"
                    label={
                      <span className="flex items-center gap-x-1">
                        <MessageCircle
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        WhatsApp
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />

                  {/* YouTube */}
                  <FieldInput
                    control={form.control}
                    name="socialMediaLinks.youtube"
                    placeholder="https://youtube.com/@yourcompany"
                    label={
                      <span className="flex items-center gap-x-1">
                        <Youtube
                          className="h-[18px] w-[18px] text-primary"
                          strokeWidth={1.5}
                        />
                        YouTube
                      </span>
                    }
                    layout="inline"
                    variant="flat"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CollapsibleCard>

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-[48px] px-8 font-lato text-primary border-border hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  emailValidation.isChecking ||
                  !form.formState.isValid
                }
                className="w-full sm:w-auto h-[48px] px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-lato disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

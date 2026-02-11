"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Upload,
  Calendar,
  Building,
  FileText,
  User,
  Hash,
  Target,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// Real-time validation will be added later
import { stepApi } from "@/api/validationApi";
import {
  useUniqueValidation,
  getValidationStatusClass,
  getValidationMessage,
} from "@/hooks/useUniqueValidation";
import { apiHelpers } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { FormFieldWithIcon } from "@/components/ui/form-field-with-icon";
import { ValidationMessage } from "@/components/ui/validation-message";
import FieldInput from "@/components/global/FieldInput";
import { useParams } from "next/navigation";
import FieldTextarea from "@/components/global/FieldTextarea";

// Form validation schema based on backend CreateOrganizationDto
const companyOverviewSchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .trim(),
  legalName: z
    .string()
    .max(100, "Legal name must be less than 100 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  registrationNumber: z
    .string()
    .max(50, "Registration number must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  yearEstablished: z
    .number()
    .min(1800, "Year must be after 1800")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional(),
  logoUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      {
        message: "Please provide a valid logo URL",
      },
    ),
  ceoName: z
    .string()
    .max(50, "CEO name must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  mission: z
    .string()
    .max(500, "Mission statement must be less than 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  vision: z
    .string()
    .max(500, "Vision statement must be less than 500 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

type CompanyOverviewFormData = z.infer<typeof companyOverviewSchema>;

interface CompanyOverviewFormProps {
  onNext: (data: CompanyOverviewFormData) => void;
  onPrevious?: () => void;
  initialData?: Partial<CompanyOverviewFormData>;
  currentStep?: number;
  currentSubStep?: string;
}

export const CompanyOverviewFormNew: React.FC<CompanyOverviewFormProps> = ({
  onNext,
  onPrevious,
  initialData,
  currentStep = 1,
  currentSubStep = "overview",
}) => {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrgData, setIsLoadingOrgData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const params = useParams();
  const locale = params.locale as string;
  const isRTL = locale === "ar";

  const form = useForm<CompanyOverviewFormData>({
    resolver: zodResolver(companyOverviewSchema),
    defaultValues: {
      name: initialData?.name || "",
      legalName: initialData?.legalName || "",
      registrationNumber: initialData?.registrationNumber || "",
      yearEstablished: initialData?.yearEstablished, // Keep as number or undefined
      logoUrl: initialData?.logoUrl || "",
      ceoName: initialData?.ceoName || "",
      mission: initialData?.mission || "",
      vision: initialData?.vision || "",
    },
  });

  // Fetch current organization data when component mounts if user has an organization
  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (
        session?.user?.organizationId &&
        (!initialData || Object.keys(initialData).length === 0)
      ) {
        setIsLoadingOrgData(true);
        try {
          const response = await apiHelpers.getCurrentOrganization();
          if (response.success && response.data) {
            const orgData = response.data;

            // Update form with organization data
            form.setValue("name", orgData.name || "");
            form.setValue("legalName", orgData.legalName || "");
            form.setValue(
              "registrationNumber",
              orgData.registrationNumber || "",
            );
            form.setValue("yearEstablished", orgData.yearEstablished);
            form.setValue("logoUrl", orgData.logoUrl || ""); // This will now have the correct URL
            form.setValue("ceoName", orgData.ceoName || "");
            form.setValue("mission", orgData.mission || "");
            form.setValue("vision", orgData.vision || "");

            console.log("✅ Loaded organization data:", orgData);
          }
        } catch (error) {
          console.error("Failed to fetch organization data:", error);
          // Don't show error toast, just log it as this is optional enhancement
        } finally {
          setIsLoadingOrgData(false);
        }
      }
    };

    fetchOrganizationData();
  }, [session?.user?.organizationId, initialData, form]);

  // Update form when initialData changes (when user returns from other forms)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      Object.keys(initialData).forEach((key) => {
        const value = initialData[key as keyof typeof initialData];
        if (value !== undefined && value !== null) {
          form.setValue(key as keyof CompanyOverviewFormData, value);
        }
      });
    }
  }, [initialData, form]);

  // Real-time validation for company name uniqueness
  const currentName = form.watch("name") || "";
  const isEditingExistingName = Boolean(
    initialData?.name &&
    initialData.name.trim().length > 0 &&
    currentName.trim().toLowerCase() === initialData.name.trim().toLowerCase(),
  );

  const companyNameValidation = useUniqueValidation(
    currentName,
    "organizationName",
    800, // 800ms debounce delay
    undefined,
    isEditingExistingName, // Skip validation if editing existing organization name
  );

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload an SVG, PNG, JPG or GIF file");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      // For now, create a blob URL for preview
      // TODO: Upload to server and get proper URL
      const imageUrl = URL.createObjectURL(file);
      form.setValue("logoUrl", imageUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: CompanyOverviewFormData) => {
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
      ) as CompanyOverviewFormData;

      // Ensure required fields are present
      if (!cleanedData.name || cleanedData.name.trim() === "") {
        toast.error("Company name is required");
        setIsSubmitting(false);
        return;
      }

      // Check unique validation before submitting
      if (
        companyNameValidation.hasChecked &&
        (!companyNameValidation.isValid || !companyNameValidation.isAvailable)
      ) {
        toast.error("Please fix the company name issue before continuing");
        setIsSubmitting(false);
        return;
      }

      // If validation is still in progress, wait for it
      if (companyNameValidation.isChecking) {
        toast.info("Please wait for name validation to complete");
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting company overview data:", cleanedData);

      // Try backend validation first
      try {
        const validationResult =
          await stepApi.saveOrganizationOverview(cleanedData);
        if (validationResult.success && validationResult.canProceed) {
          onNext(cleanedData);
          toast.success(
            validationResult.message || "Company overview saved successfully",
          );
          return;
        } else if (!validationResult.success) {
          // Handle specific validation errors from backend
          toast.error(
            validationResult.message || "Company overview validation failed",
          );
          setIsSubmitting(false);
          return;
        }
      } catch (error: any) {
        console.error("Backend validation error:", error);

        // Handle specific backend validation errors
        if (error.response?.status === 400) {
          const errorMessage =
            error.response.data?.message ||
            error.message ||
            "Invalid data provided";

          // Handle specific validation error cases
          if (errorMessage.includes("already owns an organization")) {
            toast.error(
              "You already own a company. Each user can only own one organization.",
            );
          } else if (errorMessage.includes("Subscription is not active")) {
            toast.error(
              "Your subscription is not active. Please contact support or update your subscription.",
            );
          } else if (errorMessage.includes("company plan")) {
            toast.error(
              "Company registration requires a company plan subscription. Please upgrade your plan.",
            );
          } else if (errorMessage.includes("User not found")) {
            toast.error(
              "Authentication error. Please log out and log in again.",
            );
          } else if (errorMessage.includes("Invalid Commercial Registration")) {
            toast.error(
              "Commercial Registration number must be exactly 10 digits.",
            );
          } else if (errorMessage.includes("Invalid VAT")) {
            toast.error(
              "VAT number format is invalid. Please enter a valid VAT number.",
            );
          } else if (errorMessage.includes("Invalid email")) {
            toast.error("Please enter a valid email address.");
          } else if (errorMessage.includes("required")) {
            toast.error("Please fill in all required fields.");
          } else {
            toast.error(`Validation Error: ${errorMessage}`);
          }
        } else if (error.response?.status === 401) {
          toast.error("Authentication required. Please log in again.");
        } else if (error.response?.status >= 500) {
          toast.error("Server error. Please try again in a few minutes.");
        } else {
          // For network errors, fall back to local mode
          console.warn(
            "Backend API not available, continuing with form flow:",
            error,
          );
          onNext(cleanedData);
          toast.success("Company overview data saved locally");
        }

        setIsSubmitting(false);
        return;
      }

      // Fallback: proceed locally if backend is unavailable
      onNext(cleanedData);
      toast.success("Company overview data saved locally");
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="p-8 bg-background">
        {/* Header */}
        <div className="mb-8">
          <button
            className="flex items-center gap-2 text-sm mb-4 text-muted-foreground hover:text-primary transition-colors font-lato"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Choosing Plan Page
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Fill in Company Details
          </h1>
          <p className="text-muted-foreground font-lato">Company Overview</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            {/* Logo and Company Name Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div
                  className={[
                    "flex items-center gap-6",
                    isRTL ? "flex-row-reverse" : "flex-row",
                  ].join(" ")}
                >
                  <label
                    className={[
                      "text-sm font-lato text-primary font-normal leading-relaxed w-52",
                      isRTL ? "text-right" : "text-left",
                    ].join(" ")}
                  >
                    Logo<span className="text-red-500 ml-1">*</span>
                  </label>

                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div>
                            {/* hidden input */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/svg+xml,image/png,image/jpeg,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file); // your existing upload logic
                              }}
                              className="hidden"
                            />

                            {/* circle button */}
                            <button
                              type="button"
                              onClick={triggerFileUpload}
                              className={[
                                "relative inline-flex items-center justify-center overflow-hidden",
                                "border border-border bg-background",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                              ].join(" ")}
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 9999,
                                boxShadow:
                                  "0px 0px 1px 1px rgba(21, 197, 206, 0.16)",
                              }}
                              aria-label="Upload logo"
                            >
                              {field.value ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={field.value}
                                  alt="Logo"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Upload className="h-5 w-5 text-muted-foreground" />
                              )}

                              {/* optional uploading overlay */}
                              {isUploading && (
                                <span className="absolute inset-0 bg-background/60 flex items-center justify-center text-xs text-primary">
                                  Uploading…
                                </span>
                              )}
                            </button>
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Year of Establishment */}
                <FieldInput
                  control={form.control}
                  name="yearEstablished"
                  label="Year of Establishment"
                  placeholder="Enter Year"
                  layout="inline"
                  variant="flat"
                  type="number"
                  required
                />
              </div>
              <div className="space-y-6">
                {/* Company Name Field */}
                <FieldInput
                  control={form.control}
                  name="name"
                  label="Company Name"
                  placeholder="Enter Trade Name"
                  validate={true}
                  validation={companyNameValidation}
                  layout="inline"
                  variant="flat"
                  required
                />

                {/* Legal Name Field */}
                <FieldInput
                  control={form.control}
                  name="legalName"
                  label="Legal Name"
                  placeholder="Enter Legal Name"
                  layout="inline"
                  variant="flat"
                  required
                />
              </div>
            </div>

            {/* Company Overview Section */}
            <Card className="bg-background border-border shadow-sm">
              <div className="p-6">
                <div
                  className="flex items-center justify-between mb-6 cursor-pointer"
                  onClick={() => setIsOverviewOpen(!isOverviewOpen)}
                >
                  <h3 className="text-lg font-bold text-primary font-lato">
                    Company Overview
                  </h3>
                  {isOverviewOpen ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  )}
                </div>

                {isOverviewOpen && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                      {/* Mission Field */}
                      <FieldTextarea
                        control={form.control}
                        name="mission"
                        label="Mission"
                        placeholder="Enter Mission"
                        aria-multiline={true}
                        layout="inline"
                        variant="flat"
                        disabled={isSubmitting}
                      />

                      {/* Vision Field */}
                      <FieldTextarea
                        control={form.control}
                        name="vision"
                        label="Vision"
                        placeholder="Enter Vision"
                        aria-multiline={true}
                        layout="inline"
                        variant="flat"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* CEO Name Field */}
                      <FieldInput
                        control={form.control}
                        name="ceoName"
                        label="CEO Name"
                        placeholder="Enter CEO Name"
                        layout="inline"
                        variant="flat"
                        disabled={isSubmitting}
                      />

                      {/* Registration Number Field */}
                      <FieldInput
                        control={form.control}
                        name="registrationNumber"
                        label="Registration Number"
                        placeholder="Enter Registration Number"
                        layout="inline"
                        variant="flat"
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Bottom Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={!onPrevious}
                className="w-full sm:w-auto h-[48px] px-8 font-lato text-primary border-border hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
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
                    <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
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

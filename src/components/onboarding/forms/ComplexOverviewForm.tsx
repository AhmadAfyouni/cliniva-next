"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  Calendar,
  Target,
  Eye,
  FileText,
  Globe,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { fetchDepartments } from "@/api/onboardingApiClient";
import { ComplexOverviewDto } from "@/types/onboarding";
import { saveComplexOverview } from "@/api/onboardingApiClient";
import {
  DepartmentSearchInput,
  Department,
} from "@/components/ui/department-search-input";
import { useUniqueValidation } from "@/hooks/useUniqueValidation";
import { FormFieldWithIcon } from "@/components/ui/form-field-with-icon";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { EnhancedLogoUpload } from "@/components/ui/enhanced-logo-upload";
import { ValidationMessage } from "@/components/ui/validation-message";
import FieldInput from "@/components/global/FieldInput";
import FieldTextarea from "@/components/global/FieldTextarea";

// Form validation schema matching new flattened ComplexOverviewDto
const complexOverviewSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(2, "Complex name must be at least 2 characters")
    .max(100, "Complex name must be less than 100 characters")
    .trim(),

  // Optional basic info
  managerName: z
    .string()
    .max(50, "Manager name must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val === "" ||
        z.string().url().safeParse(val).success ||
        val.startsWith("/uploads/"),
      {
        message: "Please provide a valid logo URL",
      },
    ),
  website: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      {
        message:
          "Please provide a valid website URL (e.g., https://example.com)",
      },
    ),

  // Flattened business profile fields (no nested businessProfile object)
  yearEstablished: z
    .number()
    .min(1800, "Year must be after 1800")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional(),
  mission: z
    .string()
    .max(500, "Mission statement must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  vision: z
    .string()
    .max(500, "Vision statement must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  overview: z
    .string()
    .max(1000, "Overview must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  goals: z
    .string()
    .max(1000, "Goals must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  ceoName: z
    .string()
    .max(50, "CEO name must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),

  // Department management - simplified to single array
  departments: z.array(
    z.object({
      _id: z.string().optional(),
      name: z.string().min(1, "Department name is required"),
      description: z.string().optional(),
    }),
  ),
});

type ComplexOverviewFormData = z.infer<typeof complexOverviewSchema>;

interface ComplexOverviewFormProps {
  onNext: (data: ComplexOverviewDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ComplexOverviewDto>;
  organizationData?: any; // For inheritance
  isLoading?: boolean;
}

export const ComplexOverviewForm: React.FC<ComplexOverviewFormProps> = ({
  onNext,
  onPrevious,
  initialData = {},
  organizationData,
  isLoading = false,
}) => {
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
  const [isBusinessProfileExpanded, setIsBusinessProfileExpanded] =
    useState(false);
  const [isDepartmentsExpanded, setIsDepartmentsExpanded] = useState(false);
  const [useInheritance] = useState(true); // Always inherit from organization data
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load departments on component mount
  React.useEffect(() => {
    fetchDepartments()
      .then((data: any[]) => {
        const formattedDepartments: Department[] = data.map((dept) => ({
          _id: dept._id || dept.id,
          name: dept.name,
          description: dept.description,
        }));
        setAllDepartments(formattedDepartments);
      })
      .catch(() => toast.error("Failed to load departments"));
  }, []);

  // Apply data inheritance from organization if available and requested
  const getInheritedValue = (
    field: keyof ComplexOverviewDto,
    currentValue?: any,
  ) => {
    if (!useInheritance || !organizationData || currentValue)
      return currentValue;
    return organizationData.overview?.[field];
  };

  const form = useForm<ComplexOverviewFormData>({
    resolver: zodResolver(complexOverviewSchema),
    defaultValues: {
      name: initialData.name || "",
      managerName: initialData.managerName || "",
      logoUrl: initialData.logoUrl || getInheritedValue("logoUrl") || "",
      website: initialData.website || "",
      // Apply inheritance for business profile fields
      yearEstablished: getInheritedValue(
        "yearEstablished",
        initialData.yearEstablished,
      ),
      mission: getInheritedValue("mission", initialData.mission) || "",
      vision: getInheritedValue("vision", initialData.vision) || "",
      overview: getInheritedValue("overview", initialData.overview) || "",
      goals: getInheritedValue("goals", initialData.goals) || "",
      ceoName: getInheritedValue("ceoName", initialData.ceoName) || "",
      departments: initialData.departments ||
        // Convert legacy departmentIds/newDepartmentNames to departments format
        [
          ...(initialData.departmentIds || []).map((id) => ({
            _id: id,
            name: "Loading...",
          })),
          ...(initialData.newDepartmentNames || []).map((name) => ({ name })),
        ],
    },
  });

  // Logo upload handler
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
      const imageUrl = URL.createObjectURL(file);
      form.setValue("logoUrl", imageUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
    }
  };

  // Real-time validation for complex name uniqueness
  const currentName = form.watch("name") || "";
  const isEditingExistingName = Boolean(
    initialData?.name &&
    initialData.name.trim().length > 0 &&
    currentName.trim().toLowerCase() === initialData.name.trim().toLowerCase(),
  );

  const complexNameValidation = useUniqueValidation(
    currentName,
    "complexName",
    800, // 800ms debounce delay
    {
      organizationId:
        organizationData?.overview?.id || organizationData?.overview?._id,
    },
    isEditingExistingName, // Skip validation if editing existing complex name
  );

  // Handle department changes
  const handleDepartmentChange = (departments: Department[]) => {
    form.setValue("departments", departments, { shouldValidate: true });
  };

  const onSubmit = async (data: ComplexOverviewFormData) => {
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
      ) as ComplexOverviewFormData;

      // Ensure required fields are present
      if (!cleanedData.name || cleanedData.name.trim() === "") {
        toast.error("Complex name is required");
        setIsSubmitting(false);
        return;
      }

      // Check unique validation before submitting
      if (
        complexNameValidation.hasChecked &&
        (!complexNameValidation.isValid || !complexNameValidation.isAvailable)
      ) {
        toast.error("Please fix the complex name issue before continuing");
        setIsSubmitting(false);
        return;
      }

      // If validation is still in progress, wait for it
      if (complexNameValidation.isChecking) {
        toast.info("Please wait for name validation to complete");
        setIsSubmitting(false);
        return;
      }

      // Separate existing departments from new ones
      const existingDepartments = data.departments.filter((dept) => dept._id);
      const newDepartments = data.departments.filter((dept) => !dept._id);

      // Transform form data to ComplexOverviewDto
      const complexData: ComplexOverviewDto = {
        name: cleanedData.name,
        managerName: cleanedData.managerName || undefined,
        logoUrl: cleanedData.logoUrl || undefined,
        website: cleanedData.website || undefined,
        // Flattened business profile fields
        yearEstablished: cleanedData.yearEstablished,
        mission: cleanedData.mission || undefined,
        vision: cleanedData.vision || undefined,
        overview: cleanedData.overview || undefined,
        goals: cleanedData.goals || undefined,
        ceoName: cleanedData.ceoName || undefined,
        // Department management - backend expects these fields
        departmentIds: existingDepartments.map((dept) => dept._id!),
        newDepartmentNames: newDepartments.map((dept) => dept.name),
      };

      console.log("📤 Submitting complex overview:", complexData);

      // Save to backend
      const response = await saveComplexOverview(complexData);

      if (response.success) {
        console.log("✅ Complex overview saved successfully:", response);
        toast.success("Complex overview saved successfully!");

        // Pass the response data including entityId to the parent
        onNext({
          ...complexData,
          entityId: response.entityId,
          complexId: response.entityId,
        } as any);
      } else {
        throw new Error(response.message || "Failed to save complex overview");
      }
    } catch (error: any) {
      console.error("❌ Error saving complex overview:", error);

      if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: "manual",
            message: err.message,
          });
        });
        toast.error("Please check the form for errors");
      } else {
        toast.error(error.message || "Failed to save complex overview");
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
            Complex Information
          </h1>
          <p className="text-muted-foreground font-lato">
            Set up your medical complex with departments and management details
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            {/* Logo and Complex Name Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-primary font-lato mb-2">
                  Logo<span className="text-red-500 ml-1">*</span>
                </label>
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          className="border-2 border-dashed border-border bg-muted/30 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept =
                              "image/svg+xml,image/png,image/jpeg,image/gif";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              if (file) handleFileUpload(file);
                            };
                            input.click();
                          }}
                        >
                          {field.value ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={field.value}
                                alt="Logo"
                                className="w-12 h-12 object-contain mb-2 rounded"
                              />
                              <p className="text-sm text-primary">
                                Logo uploaded successfully
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm mb-1 text-primary">
                                {isUploading
                                  ? "Uploading..."
                                  : "Click or Drag file to this area to upload"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                SVG, PNG, JPG or GIF, Maximum file size 2MB.
                              </p>
                            </>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {/* Complex Name Field */}
                <FieldInput
                  control={form.control}
                  name="name"
                  placeholder="Enter Complex Name"
                  validate
                  validation={complexNameValidation}
                  layout="inline"
                  variant="flat"
                  label={
                    <span className="flex items-center gap-x-1">
                      <Building
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.5}
                      />
                      Complex Name
                    </span>
                  }
                  required={true}
                  disabled={isSubmitting}
                />

                {/* Manager Name Field */}
                <FieldInput
                  control={form.control}
                  name="managerName"
                  placeholder="Manager's full name"
                  layout="inline"
                  variant="flat"
                  label={
                    <span className="flex items-center gap-x-1">
                      <User
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.5}
                      />
                      Complex Manager
                    </span>
                  }
                  required={true}
                  disabled={isSubmitting}
                />

                {/* Year Established Field */}
                <FieldInput
                  control={form.control}
                  name="yearEstablished"
                  placeholder="Enter Year"
                  layout="inline"
                  variant="flat"
                  type="number"
                  label={
                    <span className="flex items-center gap-x-1">
                      <Calendar
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.5}
                      />
                      Year Established
                    </span>
                  }
                  required={true}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Website Field */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FieldInput
                control={form.control}
                name="website"
                placeholder="https://yourcomplex.com"
                layout="inline"
                variant="flat"
                type="url"
                label={
                  <span className="flex items-center gap-x-1">
                    <Globe
                      className="h-[18px] w-[18px] text-primary"
                      strokeWidth={1.5}
                    />
                    Website
                  </span>
                }
                required={true}
                disabled={isSubmitting}
              />
              <FieldInput
                control={form.control}
                name="ceoName"
                placeholder="Enter CEO/Director Name"
                layout="inline"
                variant="flat"
                label={
                  <span className="flex items-center gap-x-1">
                    <User
                      className="h-[18px] w-[18px] text-primary"
                      strokeWidth={1.5}
                    />
                    CEO/Director Name
                  </span>
                }
                required={true}
                disabled={isSubmitting}
              />
            </div>

            {/* Business Profile Section */}
            <CollapsibleCard
              title="Business Profile"
              isOpen={isBusinessProfileExpanded}
              onToggle={() =>
                setIsBusinessProfileExpanded(!isBusinessProfileExpanded)
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mission Field */}
                <FieldTextarea
                  control={form.control}
                  name="mission"
                  placeholder="Enter Mission Statement"
                  layout="inline"
                  variant="flat"
                  label={
                    <span className="flex items-center gap-x-1">
                      <Target
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.5}
                      />
                      CEO/Director Name
                    </span>
                  }
                  disabled={isSubmitting}
                  maxLength={500}
                />

                {/* Vision Field */}
                <FieldTextarea
                  control={form.control}
                  name="vision"
                  placeholder="Enter Vision Statement"
                  layout="inline"
                  variant="flat"
                  label={
                    <span className="flex items-center gap-x-1">
                      <Eye
                        className="h-[18px] w-[18px] text-primary"
                        strokeWidth={1.5}
                      />
                      CEO/Director Name
                    </span>
                  }
                  disabled={isSubmitting}
                  maxLength={500}
                />
              </div>

              {/* Complex Overview */}
              <FieldTextarea
                control={form.control}
                name="overview"
                placeholder="Describe your complex's services and specialties..."
                layout="inline"
                variant="flat"
                label={"Complex Overview"}
                disabled={isSubmitting}
                maxLength={1000}
              />

              {/* Complex Goals */}
              <FieldTextarea
                control={form.control}
                name="goals"
                placeholder="What are your complex's main goals and objectives?"
                layout="inline"
                variant="flat"
                label={"Complex Goals"}
                disabled={isSubmitting}
                maxLength={1000}
              />
            </CollapsibleCard>

            {/* Departments Section */}
            <CollapsibleCard
              title="Departments"
              isOpen={isDepartmentsExpanded}
              onToggle={() => setIsDepartmentsExpanded(!isDepartmentsExpanded)}
            >
              <FormField
                control={form.control}
                name="departments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Medical Departments
                    </FormLabel>
                    <FormControl>
                      <DepartmentSearchInput
                        selectedDepartments={field.value || []}
                        availableDepartments={allDepartments}
                        onDepartmentsChange={handleDepartmentChange}
                        disabled={isSubmitting}
                        placeholder="Search departments or create new ones..."
                        maxSelections={20}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      Search existing departments or type new names to create
                      them. Selected departments will be linked to your complex.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  complexNameValidation.isChecking ||
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

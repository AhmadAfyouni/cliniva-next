"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon,
  StethoscopeIcon,
  UsersIcon,
  ClockIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ClinicServicesCapacityDto } from "@/types/onboarding";
import { saveClinicServicesCapacity } from "@/api/onboardingApiClient";
import { useClivinaTheme } from "@/hooks/useClivinaTheme";
import { FormFieldWithIcon } from "@/components/ui/form-field-with-icon";
import FieldInput from "@/components/global/FieldInput";
import FieldTextarea from "@/components/global/FieldTextarea";

// Service name validation function removed - services don't need to be unique

// Service validation schema
const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  durationMinutes: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
});

// Capacity validation schema (kept for legacy support but marked as optional)
const capacitySchema = z.object({
  maxStaff: z.number().min(1, "Max staff must be at least 1").optional(),
  maxDoctors: z.number().min(1, "Max doctors must be at least 1").optional(),
  maxPatients: z.number().min(1, "Max patients must be at least 1").optional(),
  sessionDuration: z
    .number()
    .min(5, "Session duration must be at least 5 minutes")
    .optional(),
});

// Form validation schema matching ClinicServicesCapacityDto
const clinicServicesCapacitySchema = z.object({
  services: z.array(serviceSchema).min(1, "At least one service is required"),
  capacity: capacitySchema.optional(),
});

type ClinicServicesCapacityFormData = z.infer<
  typeof clinicServicesCapacitySchema
>;

interface ClinicServicesCapacityFormProps {
  onNext: (data: ClinicServicesCapacityDto) => void;
  onPrevious: () => void;
  initialData?: Partial<ClinicServicesCapacityDto>;
  complexDepartmentId?: string; // Add complexDepartmentId as optional prop
  isLoading?: boolean;
}

export const ClinicServicesCapacityForm: React.FC<
  ClinicServicesCapacityFormProps
> = ({
  onNext,
  onPrevious,
  initialData = {},
  complexDepartmentId, // Add to destructured props
  isLoading = false,
}) => {
  const [isServicesExpanded, setIsServicesExpanded] = useState(true);
  const [isCapacityExpanded, setIsCapacityExpanded] = useState(false);
  const { colors } = useClivinaTheme();

  const form = useForm<ClinicServicesCapacityFormData>({
    resolver: zodResolver(clinicServicesCapacitySchema),
    defaultValues: {
      services: initialData.services || [
        { name: "", description: "", durationMinutes: 30, price: 0 },
      ],
      capacity: initialData.capacity || {
        maxStaff: 50,
        maxDoctors: 10,
        maxPatients: 500,
        sessionDuration: 30,
      },
    },
  });

  // Trigger validation when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === "change" && name) {
        form.trigger(name);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const addService = () => {
    appendService({ name: "", description: "", durationMinutes: 30, price: 0 });
  };

  const onSubmit = async (data: ClinicServicesCapacityFormData) => {
    try {
      // Check for existing services from overview form
      const existingServices = initialData?.services || [];
      const newServices =
        data.services?.filter((service) => service.name.trim() !== "") || [];

      // Note: Service uniqueness validation removed as per requirements
      // Services don't need to be unique across the system

      if (existingServices.length > 0) {
        toast.info("Services detected from overview form", {
          description:
            "This form is for capacity management. Services were already configured in the overview step.",
        });
      }

      // Transform form data to ClinicServicesCapacityDto
      const servicesCapacityData: ClinicServicesCapacityDto = {
        services: data.services?.filter(
          (service) => service.name.trim() !== "",
        ),
        capacity: data.capacity,
      };

      // Save to backend
      const response = await saveClinicServicesCapacity(servicesCapacityData);

      if (response.success) {
        toast.success("Clinic services and capacity saved successfully!");
        onNext(servicesCapacityData);
      } else {
        throw new Error(
          response.message || "Failed to save clinic services and capacity",
        );
      }
    } catch (error: any) {
      console.error("Error saving clinic services and capacity:", error);

      if (error.validationError && error.errors) {
        // Handle field-specific validation errors
        error.errors.forEach((err: any) => {
          form.setError(err.field, {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        toast.error("Failed to save clinic services and capacity", {
          description: error.message || "An unexpected error occurred",
        });
      }
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
            <ChevronLeftIcon className="w-4 h-4" />
            Back to Contact Details
          </button>
          <h1 className="text-2xl font-bold mb-2 text-primary font-lato">
            Fill in Clinic Details
          </h1>
          <p className="text-muted-foreground font-lato">Services & Capacity</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            {/* Medical Services Section */}
            <Card className="border-border bg-card">
              <Collapsible
                open={isServicesExpanded}
                onOpenChange={setIsServicesExpanded}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover">
                    <div className="flex items-center gap-3">
                      <StethoscopeIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold text-foreground font-lato">
                          Medical Services
                        </h2>
                        <p className="text-sm text-muted-foreground font-lato">
                          Services offered by your clinic
                        </p>
                      </div>
                    </div>
                    {isServicesExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="px-6 pb-6 pt-0 space-y-4">
                    <div className="space-y-4">
                      {serviceFields.map((field, index) => (
                        <Card
                          key={field.id}
                          className="border-border bg-surface-tertiary"
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground font-lato">
                                Service #{index + 1}
                              </h4>
                              {serviceFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeService(index)}
                                  className="text-destructive hover:text-destructive border-border hover:bg-surface-hover"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Service Name */}
                              <FieldInput
                                control={form.control}
                                name={`services.${index}.name`}
                                label="Service Name"
                                placeholder="e.g., General Consultation"
                                disabled={isLoading}
                                layout="inline"
                                variant="flat"
                                required
                              />

                              {/* Duration */}
                              <FieldInput
                                control={form.control}
                                name={`services.${index}.durationMinutes`}
                                label="Duration (minutes)"
                                placeholder="e.g., 30"
                                disabled={isLoading}
                                layout="inline"
                                variant="flat"
                                type="number"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Description */}
                              <FieldTextarea
                                control={form.control}
                                name={`services.${index}.description`}
                                label="Description"
                                placeholder="Brief description of the service"
                                disabled={isLoading}
                                layout="inline"
                                variant="flat"
                              />
                              {/* Price */}
                              <FieldInput
                                control={form.control}
                                name={`services.${index}.price`}
                                label="Price"
                                placeholder="e.g., 50.00"
                                step="0.01"
                                disabled={isLoading}
                                layout="inline"
                                variant="flat"
                                type="number"
                                isDecimal
                                required
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {serviceFields.length < 20 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addService}
                          className="w-full h-[48px] border-dashed border-border text-primary hover:bg-surface-hover font-lato"
                          disabled={isLoading}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Medical Service
                        </Button>
                      )}
                    </div>

                    <Card
                      className="border-primary/20 mt-4"
                      style={{ backgroundColor: colors.primary.light }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <StethoscopeIcon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-primary mb-1 font-lato">
                              Service Information
                            </h3>
                            <p className="text-sm text-primary/80 font-lato">
                              Add all the medical services your clinic offers.
                              You can always add more services or modify
                              existing ones later through the clinic management
                              dashboard.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Capacity Settings Section */}
            <Card className="border-border bg-card">
              <Collapsible
                open={isCapacityExpanded}
                onOpenChange={setIsCapacityExpanded}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-surface-hover">
                    <div className="flex items-center gap-3">
                      <UsersIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold text-foreground font-lato">
                          Capacity Settings
                        </h2>
                        <p className="text-sm text-muted-foreground font-lato">
                          Optional capacity configuration
                        </p>
                      </div>
                    </div>
                    {isCapacityExpanded ? (
                      <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="px-6 pb-6 pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Max Staff */}
                      <FieldInput
                        control={form.control}
                        name="capacity.maxStaff"
                        label="Maximum Staff"
                        placeholder="e.g., 50"
                        step="1"
                        disabled={isLoading}
                        layout="inline"
                        variant="flat"
                        type="number"
                        description="Maximum number of staff members"
                      />

                      {/* Max Doctors */}
                      <FieldInput
                        control={form.control}
                        name="capacity.maxDoctors"
                        label="Maximum Doctors"
                        placeholder="e.g., 10"
                        step="1"
                        disabled={isLoading}
                        layout="inline"
                        variant="flat"
                        type="number"
                        description="Maximum number of doctors"
                      />

                      {/* Max Patients */}
                      <FieldInput
                        control={form.control}
                        name="capacity.maxPatients"
                        label="Maximum Patients"
                        placeholder="e.g., 500"
                        step="1"
                        disabled={isLoading}
                        layout="inline"
                        variant="flat"
                        type="number"
                        description="Maximum number of patients"
                      />

                      {/* Session Duration */}
                      <FieldInput
                        control={form.control}
                        name="capacity.sessionDuration"
                        label="Default Session Duration"
                        placeholder="e.g., 30"
                        step="1"
                        disabled={isLoading}
                        layout="inline"
                        variant="flat"
                        type="number"
                        description="Default session duration in minutes"
                      />
                    </div>

                    <Card
                      className="border-primary/20"
                      style={{ backgroundColor: colors.surface.secondary }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <ClockIcon className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h3 className="font-medium text-foreground mb-1 font-lato">
                              Optional Configuration
                            </h3>
                            <p className="text-sm text-muted-foreground font-lato">
                              Capacity settings are optional and have been set
                              to reasonable defaults. You can adjust these
                              values later in the clinic settings. These limits
                              help manage system resources and ensure optimal
                              performance.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Information Card */}
            <Card
              className="border-primary/20"
              style={{ backgroundColor: colors.primary.light }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <StethoscopeIcon className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-primary mb-2 font-lato">
                      Services & Capacity Management
                    </h3>
                    <div className="text-sm text-primary/80 space-y-1 font-lato">
                      <p>
                        • <strong>Services:</strong> Define all medical services
                        your clinic provides with descriptions, durations, and
                        pricing.
                      </p>
                      <p>
                        • <strong>Capacity:</strong> Set operational limits to
                        ensure smooth clinic management and system performance.
                      </p>
                      <p>
                        • <strong>Flexibility:</strong> All settings can be
                        modified later through the clinic management dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading}
                className="flex items-center gap-2 h-[48px] border-border hover:bg-surface-hover font-lato"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={isLoading || !form.formState.isDirty}
                  className="flex items-center gap-2 min-w-[120px] h-[48px] bg-primary hover:bg-primary-dark text-white font-lato"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRightIcon className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

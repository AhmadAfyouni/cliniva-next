"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { NavigationSidebar } from "@/components/onboarding/NavigationSidebar";
import { CompanyOverviewForm } from "@/components/onboarding/forms/CompanyOverviewForm";
import { CompanyOverviewFormNew } from "@/components/onboarding/forms/CompanyOverviewFormNew";
import { CompanyContactForm } from "@/components/onboarding/forms/CompanyContactForm";
import { CompanyLegalForm } from "@/components/onboarding/forms/CompanyLegalForm";
import { ComplexOverviewForm } from "@/components/onboarding/forms/ComplexOverviewForm";
import { ComplexContactForm } from "@/components/onboarding/forms/ComplexContactForm";
import { ComplexLegalForm } from "@/components/onboarding/forms/ComplexLegalForm";
import ComplexWorkingHoursForm from "@/components/onboarding/ComplexWorkingHoursForm";
import { ClinicOverviewForm } from "@/components/onboarding/forms/ClinicOverviewForm";
import { ClinicContactForm } from "@/components/onboarding/forms/ClinicContactForm";
import { ClinicServicesCapacityForm } from "@/components/onboarding/forms/ClinicServicesCapacityForm";
import { ClinicLegalForm } from "@/components/onboarding/forms/ClinicLegalForm";
import { ClinicScheduleForm } from "@/components/onboarding/forms/ClinicScheduleForm";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUserEntitiesStatus } from "@/hooks/api/useUserEntitiesStatus";
import { SkipButton } from "@/components/onboarding/SkipButton";
import { useRefreshSession } from "@/hooks/useRefreshSession";
import {
  mapOrganizationToComplexData,
  OrganizationData,
  ComplexInheritedData,
} from "@/utils/dataInheritance";

type PlanType = "company" | "complex" | "clinic";
type SubStepName = "overview" | "contact" | "legal" | "services" | "schedule";

interface OnboardingUserData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  planType: PlanType;
  planId: string;
}

interface FormData {
  [key: string]: any;
}

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const { refreshSession } = useRefreshSession();

  const planType = searchParams.get("plan") as PlanType;

  // Initialize state with URL parameters immediately
  const stepFromUrl = parseInt(searchParams.get("step") || "1");
  const subStepFromUrl = searchParams.get("subStep") || "overview";

  const [userData, setUserData] = useState<OnboardingUserData | null>(null);
  const [currentStep, setCurrentStep] = useState(stepFromUrl);
  const [currentSubStep, setCurrentSubStep] = useState<SubStepName>(
    subStepFromUrl as SubStepName,
  );
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [primaryEntityCreated, setPrimaryEntityCreated] = useState(false);

  // Check user entities status to guide setup flow
  const { data: entitiesStatus, isLoading: checkingEntities } =
    useCurrentUserEntitiesStatus();

  // Load user data and form state on mount
  useEffect(() => {
    // Get user data from localStorage (set during registration)
    const storedUserData = localStorage.getItem("onboardingUserData");
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUserData(userData);
        console.log("📋 Loaded user data:", userData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        toast.error("Failed to load user data");
        router.push(`/${locale}/onboarding/plan-selection`);
        return;
      }
    }

    // Restore form data
    const savedFormData = localStorage.getItem("onboardingFormData");
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (error) {
        console.error("Failed to parse form data:", error);
      }
    }

    // Restore completed steps
    const savedCompletedSteps = localStorage.getItem(
      "completedOnboardingSteps",
    );
    if (savedCompletedSteps) {
      try {
        setCompletedSteps(JSON.parse(savedCompletedSteps));
      } catch (error) {
        console.error("Failed to parse completed steps:", error);
      }
    }

    setIsLoading(false);
  }, [planType, router, locale]);

  // Update state when URL parameters change
  useEffect(() => {
    const stepFromUrl = parseInt(searchParams.get("step") || "1");
    const subStepFromUrl = searchParams.get("subStep") || "overview";
    setCurrentStep(stepFromUrl);
    setCurrentSubStep(subStepFromUrl as SubStepName);
  }, [searchParams]);

  // Update URL when step or substep changes
  useEffect(() => {
    if (!isLoading) {
      updateUrl();
    }
  }, [currentStep, currentSubStep, isLoading]);

  // Handle entities status check and redirect if primary entity already exists
  useEffect(() => {
    if (!checkingEntities && entitiesStatus) {
      console.log("🔍 Entities Status Check:", {
        planType,
        entitiesStatus,
        hasPrimaryEntity: entitiesStatus.hasPrimaryEntity,
        needsSetup: entitiesStatus.needsSetup,
      });

      // If user already has the primary entity for their plan, redirect to dashboard
      if (entitiesStatus.hasPrimaryEntity) {
        console.log(
          "✅ User already has primary entity, redirecting to dashboard",
        );
        toast.success("Setup already completed! Redirecting to dashboard...");

        // Use window.location to bypass NextAuth middleware redirects
        window.location.href = `/${locale}/dashboard/owner`;
        return;
      }

      // Legacy check for needsSetup (keeping for backward compatibility)
      if (!entitiesStatus.needsSetup) {
        console.log(
          "✅ Setup not needed (legacy check), redirecting to dashboard",
        );
        toast.success("Setup already completed! Redirecting to dashboard...");
        window.location.href = `/${locale}/dashboard/owner`;
      }
    }
  }, [checkingEntities, entitiesStatus, locale, planType]);

  // Handle form submission for each step
  const handleFormSubmit = (stepData: FormData) => {
    // Store form data
    const stepKey = `${currentStep}-${currentSubStep}`;
    const updatedFormData = { ...formData, [stepKey]: stepData };
    setFormData(updatedFormData);
    localStorage.setItem("onboardingFormData", JSON.stringify(updatedFormData));

    // Mark current substep as completed
    const stepCompletedKey = `step-${currentStep}-${currentSubStep}`;
    if (!completedSteps.includes(stepCompletedKey)) {
      const newCompletedSteps = [...completedSteps, stepCompletedKey];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(
        "completedOnboardingSteps",
        JSON.stringify(newCompletedSteps),
      );
    }

    // Navigate to next step
    goToNextStep();
  };

  const goToNextStep = () => {
    if (planType === "company") {
      if (currentStep === 1) {
        if (currentSubStep === "overview") setCurrentSubStep("contact");
        else if (currentSubStep === "contact") setCurrentSubStep("legal");
        else if (currentSubStep === "legal") {
          setCurrentStep(2);
          setCurrentSubStep("overview");
        }
      } else if (currentStep === 2) {
        if (currentSubStep === "overview") setCurrentSubStep("contact");
        else if (currentSubStep === "contact") setCurrentSubStep("schedule");
        else if (currentSubStep === "schedule") {
          setCurrentStep(3);
          setCurrentSubStep("overview");
        }
      } else if (currentStep === 3) {
        if (currentSubStep === "overview") setCurrentSubStep("contact");
        else if (currentSubStep === "contact") setCurrentSubStep("services");
        else if (currentSubStep === "services") setCurrentSubStep("schedule");
        else completeSetup();
      }
    } else if (planType === "complex") {
      if (currentStep === 1) {
        if (currentSubStep === "overview") setCurrentSubStep("contact");
        else if (currentSubStep === "contact") setCurrentSubStep("legal");
        else if (currentSubStep === "legal") setCurrentSubStep("schedule");
        else if (currentSubStep === "schedule") {
          setCurrentStep(2);
          setCurrentSubStep("overview");
        }
      } else if (currentStep === 2) {
        if (currentSubStep === "overview") setCurrentSubStep("contact");
        else if (currentSubStep === "contact") setCurrentSubStep("services");
        else if (currentSubStep === "services") setCurrentSubStep("schedule");
        else completeSetup();
      }
    } else if (planType === "clinic") {
      if (currentSubStep === "overview") setCurrentSubStep("contact");
      else if (currentSubStep === "contact") setCurrentSubStep("services");
      else if (currentSubStep === "services") setCurrentSubStep("legal");
      else if (currentSubStep === "legal") setCurrentSubStep("schedule");
      else if (currentSubStep === "schedule") completeSetup();
    }
  };

  const goToPreviousStep = () => {
    if (planType === "company") {
      if (currentStep === 1) {
        if (currentSubStep === "contact") setCurrentSubStep("overview");
        else if (currentSubStep === "legal") setCurrentSubStep("contact");
      } else if (currentStep === 2) {
        if (currentSubStep === "overview") {
          setCurrentStep(1);
          setCurrentSubStep("legal");
        } else if (currentSubStep === "contact") setCurrentSubStep("overview");
        else if (currentSubStep === "schedule") setCurrentSubStep("contact");
      } else if (currentStep === 3) {
        if (currentSubStep === "overview") {
          setCurrentStep(2);
          setCurrentSubStep("schedule");
        } else if (currentSubStep === "contact") setCurrentSubStep("overview");
        else if (currentSubStep === "services") setCurrentSubStep("contact");
        else if (currentSubStep === "schedule") setCurrentSubStep("services");
      }
    } else if (planType === "complex") {
      if (currentStep === 1) {
        if (currentSubStep === "contact") setCurrentSubStep("overview");
        else if (currentSubStep === "legal") setCurrentSubStep("contact");
        else if (currentSubStep === "schedule") setCurrentSubStep("legal");
      } else if (currentStep === 2) {
        if (currentSubStep === "overview") {
          setCurrentStep(1);
          setCurrentSubStep("schedule");
        } else if (currentSubStep === "contact") setCurrentSubStep("overview");
        else if (currentSubStep === "services") setCurrentSubStep("contact");
        else if (currentSubStep === "schedule") setCurrentSubStep("services");
      }
    } else if (planType === "clinic") {
      if (currentSubStep === "contact") setCurrentSubStep("overview");
      else if (currentSubStep === "services") setCurrentSubStep("contact");
      else if (currentSubStep === "legal") setCurrentSubStep("services");
      else if (currentSubStep === "schedule") setCurrentSubStep("legal");
    }
  };

  const updateUrl = (step?: number, subStep?: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("step", (step || currentStep).toString());
    newUrl.searchParams.set("subStep", subStep || currentSubStep);
    router.push(newUrl.pathname + newUrl.search);
  };

  const completeSetup = async () => {
    if (!planType) {
      toast.error("Plan type not selected");
      return;
    }
    // For company plan, handle different completion logic based on current step
    if (planType === "company") {
      if (currentStep === 1) {
        // Step 1: Company creation - check if user already owns a company
        if (entitiesStatus?.hasPrimaryEntity) {
          toast.error("You already own an organization");
          completeOnboardingFlow();
          return;
        }
      } else {
        // Step 2 or 3: Complex/Clinic setup - company already exists, just complete the flow
        toast.success("Setup completed successfully!");
        completeOnboardingFlow();
        return;
      }
    }

    try {
      // Get raw step data from localStorage
      const rawFormData = localStorage.getItem("onboardingFormData");
      if (!rawFormData) {
        toast.error("No form data found. Please complete all steps.");
        return;
      }

      const stepsData = JSON.parse(rawFormData);
      if (planType === "company") {
        // Validate company step 1 (overview, contact, legal) completion
        const overviewData = stepsData["1-overview"];
        const contactData = stepsData["1-contact"];
        const legalData = stepsData["1-legal"];
        if (!overviewData?.name || !contactData || !legalData) {
          toast.error(
            "Please complete all company setup steps before continuing",
          );
          return;
        }

        // Build payload matching CompanyFormData shape (nested overview, contact, legal)
        const companyPayload = {
          overview: overviewData,
          contact: contactData,
          legal: legalData,
        };

        // Import the company API
        const { completeCompanyRegistration, validateCompanyRegistrationData } =
          await import("@/lib/api/company");

        // Validate data
        const validation = validateCompanyRegistrationData(companyPayload);
        if (!validation.isValid) {
          toast.error(
            `Please fix the following issues: ${validation.errors.join(", ")}`,
          );
          return;
        }

        toast.loading("Creating your company...");

        // The API now handles getting subscription ID from session automatically
        const result = await completeCompanyRegistration(companyPayload);

        toast.dismiss();

        if (result.success) {
          toast.success("Company created successfully!");

          // Refresh session to get updated user data (setupComplete: true)
          await refreshSession();

          // Mark primary entity as created (only for new creation)
          setPrimaryEntityCreated(true);

          // Show completion options to user
          const shouldContinue = await showCompletionDialog();

          if (shouldContinue) {
            // Continue with complex and clinic setup
            toast.info("Let's set up your complex and clinics");
            setCurrentStep(2); // Move to complex setup
            setCurrentSubStep("overview");
          } else {
            // Go directly to dashboard
            completeOnboardingFlow();
          }
        } else {
          toast.error(result.message || "Failed to complete company setup");
        }
      } else if (planType === "complex") {
        // For complex plan, the complex is the primary entity
        // TODO: Implement complex creation logic similar to company
        setPrimaryEntityCreated(true);
        await refreshSession(); // Refresh session after complex creation
        toast.info("Setup completion for complex plan is not yet implemented");
        completeOnboardingFlow();
      } else if (planType === "clinic") {
        // For clinic plan, the clinic is the primary entity
        // Complete clinic setup by finalizing all form data and linking services
        try {
          toast.loading("Finalizing clinic setup...");

          // Import the clinic completion API
          const { completeClinicSetup } =
            await import("@/api/onboardingApiClient");

          // Call completion endpoint to finalize clinic and link all services
          const result = await completeClinicSetup();

          toast.dismiss();

          if (result.success) {
            toast.success(
              result.message || "Clinic setup completed successfully!",
            );

            // Mark as completed and refresh session
            setPrimaryEntityCreated(true);
            await refreshSession();

            // Complete the onboarding flow
            completeOnboardingFlow();
          } else {
            throw new Error(
              result.message || "Failed to complete clinic setup",
            );
          }
        } catch (error: any) {
          console.error("Clinic setup completion error:", error);
          toast.dismiss();
          toast.error("Failed to complete clinic setup", {
            description: error.message || "Please try again or contact support",
          });
        }
      } else {
        // For other plan types, implement similar logic
        toast.info(
          "Setup completion for this plan type is not yet implemented",
        );
        completeOnboardingFlow();
      }
    } catch (error) {
      console.error("Setup completion error:", error);
      toast.error("Failed to complete setup. Please try again.");
    }
  };

  // Helper function to show completion dialog
  const showCompletionDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const result = window.confirm(
        "Company created successfully! 🎉\n\n" +
          "Would you like to continue setting up complex and clinics now?\n\n" +
          'Click "OK" to continue setup, or "Cancel" to go to dashboard (you can set up complex/clinics later)',
      );
      resolve(result);
    });
  };

  // Complete the entire onboarding flow
  const completeOnboardingFlow = () => {
    // Clear onboarding data
    localStorage.removeItem("onboardingFormData");
    localStorage.removeItem("completedOnboardingSteps");
    localStorage.removeItem("onboardingUserData");

    toast.success("Welcome to Cliniva! Your company is now set up.");

    // Use window.location to bypass middleware redirects
    window.location.href = `/${locale}/dashboard/owner`;
  };

  // Helper function to determine if skip button should be shown
  const shouldShowSkipButton = () => {
    // Only show skip button if user has created the primary entity during this session
    // AND they are now in secondary setup steps
    if (!primaryEntityCreated) return false;

    switch (planType) {
      case "company":
        // Show skip button when in complex or clinic setup (step 2 or 3)
        // This means company is already created and user can skip the rest
        return currentStep >= 2;
      case "complex":
        // Show skip button when in clinic setup (step 2)
        // This means complex is already created and user can skip clinic setup
        return currentStep >= 2;
      case "clinic":
        // For clinic plan, show skip button immediately after clinic creation
        // Since clinic is the only entity, user can go to dashboard right away
        return true;
      default:
        return false;
    }
  };

  // Render current form component
  const renderCurrentForm = () => {
    if (!planType) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">No Plan Selected</h2>
            <p className="text-gray-600">
              Please select a plan to continue with setup.
            </p>
            <Button
              onClick={() =>
                router.push(`/${locale}/onboarding/plan-selection`)
              }
              className="mt-4"
            >
              Select Plan
            </Button>
          </div>
        </div>
      );
    }

    const stepKey = `${currentStep}-${currentSubStep}`;
    let initialData = formData[stepKey] || {};

    // Handle data inheritance for company plan
    if (planType === "company" && currentStep === 2) {
      // Complex step - inherit data from company step 1
      const companyOverviewData = formData["1-overview"] || {};
      const companyContactData = formData["1-contact"] || {};
      const companyLegalData = formData["1-legal"] || {};

      // Map company data to complex format
      const organizationData: OrganizationData = {
        overview: companyOverviewData,
        contact: companyContactData,
        legal: companyLegalData,
      };

      const inheritedComplexData =
        mapOrganizationToComplexData(organizationData);

      // Merge inherited data with any existing complex data (user can override)
      initialData = {
        ...inheritedComplexData,
        ...initialData, // User changes take precedence
      };
    }

    if (planType === "company") {
      if (currentStep === 1) {
        if (currentSubStep === "overview") {
          return (
            <CompanyOverviewFormNew
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              currentStep={currentStep}
              currentSubStep={currentSubStep}
            />
          );
        } else if (currentSubStep === "contact") {
          return (
            <CompanyContactForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
            />
          );
        } else if (currentSubStep === "legal") {
          return (
            <CompanyLegalForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
            />
          );
        }
      } else if (currentStep === 2) {
        if (currentSubStep === "overview") {
          // Build organizational data for inheritance
          const organizationData = {
            overview: formData["1-overview"] || {},
            contact: formData["1-contact"] || {},
            legal: formData["1-legal"] || {},
          };

          return (
            <ComplexOverviewForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              organizationData={organizationData}
            />
          );
        } else if (currentSubStep === "contact") {
          // Build organizational data for inheritance
          const organizationData = {
            overview: formData["1-overview"] || {},
            contact: formData["1-contact"] || {},
            legal: formData["1-legal"] || {},
          };

          return (
            <ComplexContactForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              organizationData={organizationData}
            />
          );
        } else if (currentSubStep === "legal") {
          // Build organizational data for inheritance
          const organizationData = {
            overview: formData["1-overview"] || {},
            contact: formData["1-contact"] || {},
            legal: formData["1-legal"] || {},
          };

          return (
            <ComplexLegalForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              organizationData={organizationData}
            />
          );
        } else if (currentSubStep === "schedule") {
          return (
            <ComplexWorkingHoursForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
            />
          );
        }
      } else if (currentStep === 3) {
        if (currentSubStep === "overview") {
          // Get complexId from form data - for company plan, complex is created in step 2
          const complexId =
            formData["2-overview"]?.entityId ||
            formData["2-overview"]?.complexId ||
            formData["2-overview"]?.id ||
            formData["2-overview"]?._id;

          // Debug logging for company plan step 3
          console.log("🏢 Company Plan - Clinic Overview - Debug:", {
            step: currentStep,
            subStep: currentSubStep,
            "formData[2-overview]": formData["2-overview"],
            complexId,
            entityIdExists: !!formData["2-overview"]?.entityId,
            complexIdExists: !!formData["2-overview"]?.complexId,
          });

          // Build parent data for inheritance from complex data
          const parentData = {
            ...formData["2-overview"],
            type: "complex",
            id: complexId,
            _id: complexId,
          };

          return (
            <ClinicOverviewForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              parentData={parentData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
              complexId={complexId}
            />
          );
        } else if (currentSubStep === "contact") {
          return (
            <ClinicContactForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
            />
          );
        } else if (currentSubStep === "services") {
          // Get complexId for company plan (from step 2 complex overview)
          const complexId =
            formData["2-overview"]?.entityId ||
            formData["2-overview"]?.complexId ||
            formData["2-overview"]?.id ||
            formData["2-overview"]?._id;

          return (
            <ClinicServicesCapacityForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              complexDepartmentId={complexId}
            />
          );
        } else if (currentSubStep === "legal") {
          // Build parent data for inheritance from complex data
          const parentData = {
            ...formData["2-overview"],
            ...formData["2-legal"],
            type: "complex",
          };

          return (
            <ClinicLegalForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              parentData={parentData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
            />
          );
        } else if (currentSubStep === "schedule") {
          return (
            <ClinicScheduleForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
              complexId={
                formData["2-overview"]?.entityId ||
                formData["2-overview"]?.complexId ||
                formData["2-overview"]?.id ||
                formData["2-overview"]?._id
              }
            />
          );
        }
      }
    } else if (planType === "complex") {
      if (currentStep === 1) {
        if (currentSubStep === "overview") {
          return (
            <ComplexOverviewForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
            />
          );
        } else if (currentSubStep === "contact") {
          return (
            <ComplexContactForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
            />
          );
        } else if (currentSubStep === "legal") {
          return (
            <ComplexLegalForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
            />
          );
        } else if (currentSubStep === "schedule") {
          return (
            <ComplexWorkingHoursForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
            />
          );
        }
      } else if (currentStep === 2) {
        // Clinic forms for complex plan
        // Get complexId from form data - for complex plan, complex is created in step 1
        const complexId =
          formData["1-overview"]?.entityId ||
          formData["1-overview"]?.complexId ||
          formData["1-overview"]?.id ||
          formData["1-overview"]?._id;

        if (currentSubStep === "overview") {
          // Debug logging for complex plan step 2
          console.log("🏗️ Complex Plan - Clinic Overview - Debug:", {
            step: currentStep,
            subStep: currentSubStep,
            "formData[1-overview]": formData["1-overview"],
            complexId,
            entityIdExists: !!formData["1-overview"]?.entityId,
            complexIdExists: !!formData["1-overview"]?.complexId,
          });

          // Build parent data for inheritance from complex data
          const parentData = {
            ...formData["1-overview"],
            type: "complex",
            id: complexId,
            _id: complexId,
          };

          return (
            <ClinicOverviewForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              parentData={parentData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
              complexId={complexId}
            />
          );
        } else if (currentSubStep === "contact") {
          return (
            <ClinicContactForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
            />
          );
        } else if (currentSubStep === "services") {
          // Get complexId for complex plan (from step 1 complex overview)
          const complexId =
            formData["1-overview"]?.entityId ||
            formData["1-overview"]?.complexId ||
            formData["1-overview"]?.id ||
            formData["1-overview"]?._id;

          return (
            <ClinicServicesCapacityForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              complexDepartmentId={complexId}
            />
          );
        } else if (currentSubStep === "schedule") {
          return (
            <ClinicScheduleForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
              complexId={complexId}
            />
          );
        }
      }
    } else if (planType === "clinic") {
      if (currentStep === 1) {
        if (currentSubStep === "overview") {
          return (
            <ClinicOverviewForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
            />
          );
        } else if (currentSubStep === "contact") {
          return (
            <ClinicContactForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
            />
          );
        } else if (currentSubStep === "services") {
          return (
            <ClinicServicesCapacityForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              complexDepartmentId={undefined} // No complex for standalone clinic
            />
          );
        } else if (currentSubStep === "legal") {
          return (
            <ClinicLegalForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
            />
          );
        } else if (currentSubStep === "schedule") {
          return (
            <ClinicScheduleForm
              onNext={handleFormSubmit}
              onPrevious={goToPreviousStep}
              initialData={initialData}
              planType={planType}
              formData={formData}
              currentStep={currentStep}
              complexId={
                formData["1-overview"]?.entityId ||
                formData["1-overview"]?.complexId ||
                formData["1-overview"]?.id ||
                formData["1-overview"]?._id
              }
            />
          );
        }
      }
    }

    // Fallback for unimplemented forms
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm m-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {currentSubStep.charAt(0).toUpperCase() + currentSubStep.slice(1)}{" "}
          Form
        </h3>
        <p className="text-gray-600 mb-6">This form is coming soon.</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={goToPreviousStep}>
            Previous
          </Button>
          <Button onClick={goToNextStep}>Skip for Now</Button>
        </div>
      </div>
    );
  };

  if (isLoading || checkingEntities) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading setup...</p>
        </div>
      </div>
    );
  }

  if (!planType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Plan Required</h2>
          <p className="text-gray-600 mb-6">
            Please select a plan to continue with setup.
          </p>
          <Button
            onClick={() => router.push(`/${locale}/onboarding/plan-selection`)}
          >
            Select Plan
          </Button>
        </div>
      </div>
    );
  }

  // All forms should use the consistent layout with sidebar

  return (
    <div className="min-h-screen bg-gray-50 flex h-screen overflow-hidden">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        currentStep={currentStep}
        currentSubStep={currentSubStep}
        planType={planType}
        completedSteps={completedSteps}
      />

      {/* Main Content */}
      <div className="flex-1 relative h-full overflow-y-auto">
        {/* Skip Button - Top Right */}
        {shouldShowSkipButton() && (
          <div className="absolute top-4 right-4 z-10">
            <SkipButton
              size="sm"
              variant="outline"
              onSkip={() => {
                toast.success("Skipping to dashboard...");
                // Clear any stored data
                localStorage.removeItem("onboardingFormData");
                localStorage.removeItem("completedOnboardingSteps");
                // Use window.location to bypass middleware redirects
                window.location.href = `/${locale}/dashboard/owner`;
              }}
            />
          </div>
        )}

        {renderCurrentForm()}
      </div>
    </div>
  );
}

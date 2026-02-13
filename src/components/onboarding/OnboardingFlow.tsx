'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PlanType } from '@/types/onboarding/common';
import { OnboardingData } from '@/hooks/useRegister';

// Import form components
import { OrganizationOverviewForm } from './OrganizationOverviewForm';
import { OrganizationContactForm } from './OrganizationContactForm';
import { OrganizationLegalForm } from './OrganizationLegalForm';
import { ComplexOverviewForm } from './forms/ComplexOverviewForm';
import ComplexWorkingHoursForm from './ComplexWorkingHoursForm';

// Import API functions
import { 
  saveOrganizationOverview,
  saveOrganizationContact,
  saveOrganizationLegal,
  completeOrganizationSetup,
  saveComplexOverview,
  saveComplexContact,
  saveComplexSchedule,
  completeComplexSetup
} from '@/api/onboardingApiClient';

// Progress indicator component
const ProgressIndicator = ({ currentStep, totalSteps, stepName }: { 
  currentStep: number; 
  totalSteps: number; 
  stepName: string;
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-2xl font-bold text-gray-900">{stepName}</h2>
      <span className="text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);

interface OnboardingFlowProps {
  subscriptionId: string;
  planType: PlanType;
  onComplete: (data: OnboardingData) => void;
  onBack: () => void;
}

export function OnboardingFlow({ 
  subscriptionId, 
  planType, 
  onComplete, 
  onBack 
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data storage for each entity
  const [organizationData, setOrganizationData] = useState<Record<string, any>>({});
  const [complexData, setComplexData] = useState<Record<string, any>>({});
  const [clinicData, setClinicData] = useState<Record<string, any>>({});

  // Define step configurations based on plan type
  const getStepsConfig = () => {
    const steps = [];

    // All plan types start with organization setup
    if (planType === 'company' || planType === 'complex' || planType === 'clinic') {
      steps.push(
        { key: 'org-overview', name: 'Company Overview', entity: 'organization' },
        { key: 'org-contact', name: 'Company Contact', entity: 'organization' },
        { key: 'org-legal', name: 'Legal Information', entity: 'organization' }
      );
    }

    // Complex and company plans include complex setup
    if (planType === 'company' || planType === 'complex') {
      steps.push(
        { key: 'complex-overview', name: 'Complex Overview', entity: 'complex' },
        { key: 'complex-contact', name: 'Complex Contact', entity: 'complex' },
        { key: 'complex-hours', name: 'Working Hours', entity: 'complex' }
      );
    }

    // All plans include clinic setup
    steps.push(
      { key: 'clinic-overview', name: 'Clinic Overview', entity: 'clinic' },
      { key: 'clinic-contact', name: 'Clinic Contact', entity: 'clinic' },
      { key: 'clinic-hours', name: 'Clinic Hours', entity: 'clinic' }
    );

    return steps;
  };

  const steps = getStepsConfig();
  const currentStepConfig = steps[currentStep];

  // Handle API calls for saving data
  const saveStepData = async (stepKey: string, data: any) => {
    setIsLoading(true);
    try {
      let response;

      switch (stepKey) {
        case 'org-overview':
          response = await saveOrganizationOverview(data);
          setOrganizationData(prev => ({ ...prev, overview: data }));
          break;
        case 'org-contact':
          response = await saveOrganizationContact(data);
          setOrganizationData(prev => ({ ...prev, contact: data }));
          break;
        case 'org-legal':
          response = await saveOrganizationLegal(data);
          setOrganizationData(prev => ({ ...prev, legal: data }));
          // Complete organization setup after legal info
          await completeOrganizationSetup();
          toast.success('Company setup completed successfully!');
          break;
        case 'complex-overview':
          response = await saveComplexOverview(data);
          setComplexData(prev => ({ ...prev, overview: data }));
          break;
        case 'complex-contact':
          response = await saveComplexContact(data);
          setComplexData(prev => ({ ...prev, contact: data }));
          break;
        case 'complex-hours':
          response = await saveComplexSchedule(data);
          setComplexData(prev => ({ ...prev, workingHours: data }));
          // Complete complex setup after working hours
          await completeComplexSetup();
          toast.success('Complex setup completed successfully!');
          break;
        default:
          console.log('Clinic steps not yet implemented:', stepKey);
          response = { success: true };
      }

      if (response?.success) {
        toast.success('Step saved successfully!');
        return true;
      } else {
        throw new Error(response?.message || 'Failed to save step');
      }
         } catch (error) {
       console.error(`Error saving ${stepKey}:`, error);
       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
       toast.error(`Failed to save ${currentStepConfig.name}: ${errorMessage}`);
       return false;
     } finally {
      setIsLoading(false);
    }
  };

  // Handle step navigation
  const handleNext = async (data: any) => {
    const saved = await saveStepData(currentStepConfig.key, data);
    
    if (saved) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step completed - finish onboarding
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    const completeData: OnboardingData = {
      planId: subscriptionId,
      organizationType: planType,
      organizationName: organizationData.overview?.name || '',
      organizationDescription: organizationData.overview?.overview || '',
      // Include form data
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    };

    onComplete(completeData);
  };

  // Render current step form
  const renderCurrentStep = () => {
    const stepData = {
      organization: organizationData,
      complex: complexData,
      clinic: clinicData
    }[currentStepConfig.entity];

    switch (currentStepConfig.key) {
      case 'org-overview':
        return (
          <OrganizationOverviewForm
            data={stepData?.overview}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        );
      case 'org-contact':
        return (
          <OrganizationContactForm
            data={stepData?.contact}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        );
      case 'org-legal':
        return (
          <OrganizationLegalForm
            data={stepData?.legal}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        );
      case 'complex-overview':
        return (
          <ComplexOverviewForm
            initialData={stepData?.overview}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isLoading={isLoading}
          />
        );
      case 'complex-hours':
        return (
          <ComplexWorkingHoursForm
            initialData={stepData?.workingHours}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      default:
        return (
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-4">
              {currentStepConfig.name}
            </h3>
            <p className="text-gray-600 mb-6">
              This step is not yet implemented.
            </p>
            <div className="space-x-4">
              <button 
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Previous
              </button>
              <button 
                onClick={() => handleNext({})}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProgressIndicator 
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          stepName={currentStepConfig.name}
        />
        
        <div className="bg-white rounded-lg shadow-sm">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
} 
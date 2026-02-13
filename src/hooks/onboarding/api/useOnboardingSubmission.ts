'use client';

import { useMutation } from '@tanstack/react-query';
import { useOnboardingStore } from '@/hooks/onboarding/useOnboardingStore';
import { completeOnboarding } from '@/api/onboardingApiClient';
import { CompleteOnboardingDto } from '@/types/onboarding';
import { toast } from 'sonner';

interface UseOnboardingSubmissionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useOnboardingSubmission = (options: UseOnboardingSubmissionOptions = {}) => {
  const { 
    planType, 
    companyData, 
    complexData, 
    clinicData 
  } = useOnboardingStore();

  const transformCompanyDataToOrganization = () => {
    if (!companyData.overview) return undefined;

    // Convert address object to string
    const addressString = companyData.contact?.address 
      ? [
          companyData.contact.address.street,
          companyData.contact.address.city,
          companyData.contact.address.state,
          companyData.contact.address.postalCode,
          companyData.contact.address.country
        ].filter(Boolean).join(', ')
      : undefined;

    return {
      name: companyData.overview.name,
      legalName: companyData.overview.legalName,
      registrationNumber: companyData.legal?.crNumber,
      phone: companyData.contact?.phoneNumbers?.[0]?.number,
      email: companyData.contact?.email,
      address: addressString,
      googleLocation: companyData.contact?.address?.googleLocation,
      logoUrl: companyData.overview.logoUrl,
      website: companyData.overview.website,
      businessProfile: {
        yearEstablished: companyData.overview.yearEstablished,
        mission: companyData.overview.mission,
        vision: companyData.overview.vision,
        ceoName: companyData.overview.ceoName
      },
      legalInfo: {
        vatNumber: companyData.legal?.vatNumber,
        crNumber: companyData.legal?.crNumber,
        termsConditions: companyData.legal?.termsConditionsUrl,
        privacyPolicy: companyData.legal?.privacyPolicyUrl
      }
    };
  };

  const transformToCompleteOnboardingDto = (userData: any, subscriptionData: any): CompleteOnboardingDto => {
    const baseData: CompleteOnboardingDto = {
      userData,
      subscriptionData
    };

    // Add organization data if we have company data
    if (planType === 'company' && companyData.overview) {
      baseData.organization = transformCompanyDataToOrganization();
    }

    // Add complexes data if we have complex data
    if ((planType === 'complex' || planType === 'company') && complexData) {
      // Transform complex data to backend format
      // This would need to be implemented based on the complex form structure
      baseData.complexes = [];
    }

    // Add clinics data if we have clinic data
    if (clinicData) {
      // Transform clinic data to backend format
      // This would need to be implemented based on the clinic form structure
      baseData.clinics = [];
    }

    return baseData;
  };

  const submission = useMutation({
    mutationFn: async ({ userData, subscriptionData }: { 
      userData: any; 
      subscriptionData: any;
    }) => {
      const completeData = transformToCompleteOnboardingDto(userData, subscriptionData);
      
      console.log('🚀 Submitting onboarding data:', completeData);
      
      return await completeOnboarding(completeData);
    },
    onSuccess: (data) => {
      toast.success('Onboarding completed successfully!', {
        description: 'Welcome to Cliniva! Your account has been set up.'
      });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      console.error('Onboarding submission failed:', error);
      
      toast.error('Failed to complete onboarding', {
        description: error.message || 'Please check your data and try again.'
      });
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });

  const submitOnboarding = (userData: any, subscriptionData: any) => {
    // Validate that we have the required data
    if (!planType) {
      toast.error('Plan type not selected');
      return;
    }

    if (planType === 'company' && !companyData.overview?.name) {
      toast.error('Company information is incomplete');
      return;
    }

    // Submit the data
    submission.mutate({ userData, subscriptionData });
  };

  const validateFormData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!planType) {
      errors.push('Plan type is required');
    }

    if (planType === 'company') {
      if (!companyData.overview?.name) {
        errors.push('Company name is required');
      }
      if (!companyData.contact?.email) {
        errors.push('Company email is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    submitOnboarding,
    validateFormData,
    isSubmitting: submission.isPending,
    error: submission.error,
    data: submission.data,
    reset: submission.reset
  };
}; 
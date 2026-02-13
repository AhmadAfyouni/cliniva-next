'use client';

import { useMutation } from '@tanstack/react-query';
import { onboardingApi, ValidationResult } from '@/lib/api/onboarding';
import { PlanType } from '@/types/onboarding';
import { useOnboardingStore } from '../useOnboardingStore';

interface UseValidateStepOptions {
  onSuccess?: (data: ValidationResult) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
}

export const useValidateStep = (options: UseValidateStepOptions = {}) => {
  const { setErrors, clearErrors } = useOnboardingStore();
  const { onSuccess, onError, showToast = false } = options;

  return useMutation({
    mutationFn: async ({ 
      stepData, 
      planType, 
      step 
    }: { 
      stepData: any; 
      planType: PlanType; 
      step: string; 
    }) => {
      const response = await onboardingApi.validateStep(stepData, planType, step);
      
      if (!response.success) {
        throw new Error(response.message || 'Validation failed');
      }
      
      return response.data!;
    },
    
    onSuccess: (data, variables) => {
      // Clear any previous validation errors
      clearErrors();
      
      if (data.isValid) {
        if (showToast) {
          // Optionally show success toast
          console.log('Step validation passed');
        }
      } else {
        // Set validation errors in store
        const errorMap: Record<string, string[]> = {};
        data.errors.forEach((error: string) => {
          if (!errorMap[error]) errorMap[error] = [];
          errorMap[error].push(error);
        });
        setErrors(errorMap);
      }
      
      if (onSuccess) {
        onSuccess(data);
      }
    },
    
    onError: (error: any) => {
      console.error('Step validation failed:', error);
      
      // Set general error
      setErrors({ 
        general: [error.response?.data?.message || error.message || 'Validation failed'] 
      });
      
      if (onError) {
        onError(error);
      }
    },

    // Don't retry validation requests
    retry: false,
  });
};

// Hook for validating current step automatically
export const useValidateCurrentStep = (options: UseValidateStepOptions = {}) => {
  const validateMutation = useValidateStep(options);
  const { 
    progress, 
    planType, 
    getFormDataForCurrentStep,
    getCurrentStepConfig 
  } = useOnboardingStore();

  const validateCurrentStep = () => {
    if (!planType) {
      console.warn('Cannot validate step: Plan type not selected');
      return;
    }

    const currentStepConfig = getCurrentStepConfig();
    if (!currentStepConfig) {
      console.warn('Cannot validate step: Step configuration not found');
      return;
    }

    const formData = getFormDataForCurrentStep();
    const stepKey = `${currentStepConfig.name}-${progress.currentSubStep}`;

    return validateMutation.mutate({
      stepData: formData,
      planType,
      step: stepKey
    });
  };

  return {
    validateCurrentStep,
    isValidating: validateMutation.isPending,
    validationResult: validateMutation.data,
    validationError: validateMutation.error,
    reset: validateMutation.reset
  };
};

// Hook for batch validation of multiple steps
export const useValidateSteps = (options: UseValidateStepOptions = {}) => {
  const { setErrors, clearErrors } = useOnboardingStore();

  return useMutation({
    mutationFn: async (steps: Array<{
      stepData: any;
      planType: PlanType;
      step: string;
    }>) => {
      const results = await Promise.allSettled(
        steps.map(({ stepData, planType, step }) => 
          onboardingApi.validateStep(stepData, planType, step)
        )
      );

      const validationResults = results.map((result, index) => ({
        step: steps[index].step,
        result: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));

      return validationResults;
    },

    onSuccess: (results) => {
      clearErrors();
      
      const allErrors: Record<string, string[]> = {};
      let hasErrors = false;

      results.forEach(({ step, result, error }) => {
        if (error) {
          allErrors[step] = [error.message || 'Validation failed'];
          hasErrors = true;
        } else if (result?.data && !result.data.isValid) {
          allErrors[step] = result.data.errors;
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setErrors(allErrors);
      }

      if (options.onSuccess) {
        const overallResult: ValidationResult = {
          isValid: !hasErrors,
          errors: Object.values(allErrors).flat(),
          warnings: results
            .filter(r => r.result?.data?.warnings)
            .flatMap(r => r.result!.data!.warnings!)
        };
        options.onSuccess(overallResult);
      }
    },

    onError: (error) => {
      console.error('Batch validation failed:', error);
      setErrors({ general: ['Validation failed'] });
      
      if (options.onError) {
        options.onError(error);
      }
    },

    retry: false,
  });
};

// Helper hook for form validation integration
export const useFormValidation = (stepKey: string, planType: PlanType) => {
  const validateMutation = useValidateStep();

  const validateForm = async (formData: any): Promise<boolean> => {
    try {
      const result = await validateMutation.mutateAsync({
        stepData: formData,
        planType,
        step: stepKey
      });
      
      return result.isValid;
    } catch (error) {
      return false;
    }
  };

  return {
    validateForm,
    isValidating: validateMutation.isPending,
    validationErrors: validateMutation.error
  };
}; 
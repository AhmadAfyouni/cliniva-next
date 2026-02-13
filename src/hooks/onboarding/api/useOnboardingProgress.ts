'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi, OnboardingProgressResult } from '@/lib/api/onboarding';
import { useOnboardingStore } from '../useOnboardingStore';

// Query key factory
const onboardingKeys = {
  all: ['onboarding'] as const,
  progress: (userId: string) => [...onboardingKeys.all, 'progress', userId] as const,
  plans: () => [...onboardingKeys.all, 'plans'] as const,
};

interface UseOnboardingProgressOptions {
  userId?: string;
  enabled?: boolean;
  refetchInterval?: number;
}

export const useOnboardingProgress = (options: UseOnboardingProgressOptions = {}) => {
  const { userId, enabled = true, refetchInterval } = options;
  
  return useQuery({
    queryKey: onboardingKeys.progress(userId || ''),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required to fetch progress');
      }
      
      const response = await onboardingApi.getProgress(userId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch progress');
      }
      
      return response.data!;
    },
    enabled: enabled && !!userId,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook for getting available plans
export const useOnboardingPlans = () => {
  return useQuery({
    queryKey: onboardingKeys.plans(),
    queryFn: async () => {
      const response = await onboardingApi.getAvailablePlans();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch plans');
      }
      
      return response.data!;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for syncing local store with server progress
export const useSyncOnboardingProgress = () => {
  const queryClient = useQueryClient();
  const { updateProgress, setPlanType, updateCompanyData, updateComplexData, updateClinicData } = useOnboardingStore();

  const syncWithServer = (userId: string) => {
    const query = useQuery({
      queryKey: onboardingKeys.progress(userId),
      queryFn: async () => {
        const response = await onboardingApi.getProgress(userId);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to sync progress');
        }
        
        return response.data!;
      },
      enabled: !!userId,
    });

    // Use useEffect to handle data updates
    React.useEffect(() => {
      if (query.data) {
        // Sync server data with local store
        updateProgress({
          currentStep: query.data.currentStep,
          completedSteps: query.data.completedSteps,
          planType: query.data.planType
        });

        if (query.data.planType) {
          setPlanType(query.data.planType);
        }

        // Sync form data if available
        if (query.data.data) {
          if (query.data.data.companyData) {
            updateCompanyData(query.data.data.companyData);
          }
          if (query.data.data.complexData) {
            updateComplexData(query.data.data.complexData);
          }
          if (query.data.data.clinicData) {
            updateClinicData(query.data.data.clinicData);
          }
        }
      }
    }, [query.data, updateProgress, setPlanType, updateCompanyData, updateComplexData, updateClinicData]);

    return query;
  };

  return { syncWithServer };
};

// Hook for saving progress to server
export const useSaveOnboardingProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      progressData 
    }: { 
      userId: string; 
      progressData: Partial<OnboardingProgressResult>;
    }) => {
      // Note: This would need to be implemented in the backend
      // For now, we'll just update the local cache
      return progressData;
    },
    
    onSuccess: (data, variables) => {
      // Update the cache with new progress
      queryClient.setQueryData(
        onboardingKeys.progress(variables.userId),
        (oldData: OnboardingProgressResult | undefined) => ({
          ...oldData,
          ...data,
          lastUpdated: new Date().toISOString()
        })
      );

      // Invalidate to refetch from server
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.progress(variables.userId)
      });
    },
  });
};

// Hook for auto-saving progress
export const useAutoSaveProgress = (userId?: string, interval: number = 30000) => {
  const { progress, planType, companyData, complexData, clinicData } = useOnboardingStore();
  const saveMutation = useSaveOnboardingProgress();

  // Auto-save effect would go here using useEffect
  // For now, we'll provide a manual save function
  const saveProgress = () => {
    if (!userId) return;

    const progressData: Partial<OnboardingProgressResult> = {
      userId,
      planType: planType!,
      currentStep: typeof progress.currentStep === 'string' ? parseInt(progress.currentStep, 10) : progress.currentStep,
      completedSteps: progress.completedSteps,
      lastUpdated: new Date().toISOString(),
      data: {
        companyData,
        complexData,
        clinicData
      }
    };

    return saveMutation.mutate({ userId, progressData });
  };

  return {
    saveProgress,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    lastSaved: saveMutation.data
  };
};

// Hook for progress statistics
export const useProgressStats = () => {
  const { progress, planType, getTotalSteps, getProgressPercentage } = useOnboardingStore();

  const currentStepNum = typeof progress.currentStep === 'string' ? parseInt(progress.currentStep, 10) : (progress.currentStep || 1);

  const stats = {
    currentStep: currentStepNum,
    totalSteps: getTotalSteps(),
    completedSteps: progress.completedSteps.length,
    progressPercentage: getProgressPercentage(),
    planType,
    isComplete: getProgressPercentage() === 100,
    remainingSteps: getTotalSteps() - currentStepNum
  };

  return stats;
};

// Hook for progress validation
export const useProgressValidation = () => {
  const { progress, planType, canProceedToStep, isStepCompleted } = useOnboardingStore();

  const validateProgress = () => {
    const issues = [];

    if (!planType) {
      issues.push('Plan type not selected');
    }

    const currentStepNum = typeof progress.currentStep === 'string' ? parseInt(progress.currentStep, 10) : (progress.currentStep || 1);

    if (currentStepNum < 1) {
      issues.push('Invalid current step');
    }

    // Check if user can proceed to current step
    if (!canProceedToStep(currentStepNum)) {
      issues.push('Cannot proceed to current step - previous steps incomplete');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  return { validateProgress };
};

// Hook for resetting progress
export const useResetProgress = () => {
  const queryClient = useQueryClient();
  const { resetOnboarding } = useOnboardingStore();

  const resetProgress = (userId?: string) => {
    // Reset local store
    resetOnboarding();

    // Clear all cached data
    queryClient.removeQueries({ queryKey: onboardingKeys.all });

    // If userId provided, invalidate specific progress
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.progress(userId)
      });
    }
  };

  return { resetProgress };
}; 
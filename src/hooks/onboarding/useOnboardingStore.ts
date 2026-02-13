'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  PlanType, 
  OnboardingProgressDto, 
  CompanyFormData, 
  ComplexFormData, 
  ClinicFormData
} from '@/types/onboarding';
import { WorkingDay } from '@/types/onboarding/common';

// Step configurations for each plan type
const PLAN_STEP_CONFIGS = {
  company: {
    totalSteps: 3,
    steps: [
      { id: 1, name: 'company', subSteps: ['overview', 'contact', 'legal'] },
      { id: 2, name: 'complex', subSteps: ['overview', 'contact', 'schedule'] },
      { id: 3, name: 'clinic', subSteps: ['overview', 'contact', 'services', 'schedule'] }
    ]
  },
  complex: {
    totalSteps: 2,
    steps: [
      { id: 1, name: 'complex', subSteps: ['overview', 'contact', 'legal', 'schedule'] },
      { id: 2, name: 'clinic', subSteps: ['overview', 'contact', 'services', 'schedule'] }
    ]
  },
  clinic: {
    totalSteps: 1,
    steps: [
      { id: 1, name: 'clinic', subSteps: ['overview', 'contact', 'legal', 'schedule'] }
    ]
  }
};

// Default working hours template
const DEFAULT_WORKING_HOURS: WorkingDay[] = [
  { dayOfWeek: 'monday', isWorkingDay: true, openingTime: '09:00', closingTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
  { dayOfWeek: 'tuesday', isWorkingDay: true, openingTime: '09:00', closingTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
  { dayOfWeek: 'wednesday', isWorkingDay: true, openingTime: '09:00', closingTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
  { dayOfWeek: 'thursday', isWorkingDay: true, openingTime: '09:00', closingTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
  { dayOfWeek: 'friday', isWorkingDay: true, openingTime: '09:00', closingTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00' },
  { dayOfWeek: 'saturday', isWorkingDay: false, openingTime: '', closingTime: '', breakStartTime: '', breakEndTime: '' },
  { dayOfWeek: 'sunday', isWorkingDay: false, openingTime: '', closingTime: '', breakStartTime: '', breakEndTime: '' }
];

// Local progress state (different from API DTO)
interface ProgressState {
  currentStep: number;
  currentSubStep: string;
  completedSteps: string[];
  planType: PlanType;
}

interface OnboardingState {
  // Plan and progress
  planType: PlanType | null;
  progress: ProgressState;
  
  // Form data for each plan type
  companyData: Partial<CompanyFormData>;
  complexData: Partial<ComplexFormData>;
  clinicData: Partial<ClinicFormData>;
  
  // UI state
  isLoading: boolean;
  errors: Record<string, string[]>;
  
  // Actions
  setPlanType: (planType: PlanType) => void;
  updateProgress: (progress: Partial<ProgressState>) => void;
  updateCompanyData: (data: Partial<CompanyFormData>) => void;
  updateComplexData: (data: Partial<ComplexFormData>) => void;
  updateClinicData: (data: Partial<ClinicFormData>) => void;
  resetOnboarding: () => void;
  
  // Step management
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number, subStep?: string) => void;
  goToNextSubStep: () => void;
  goToPreviousSubStep: () => void;
  markStepCompleted: (stepKey: string) => void;
  markSubStepCompleted: (stepKey: string, subStepKey: string) => void;
  
  // Validation and state checking
  isStepCompleted: (stepKey: string) => boolean;
  isSubStepCompleted: (stepKey: string, subStepKey: string) => boolean;
  canProceedToStep: (step: number) => boolean;
  canProceedToSubStep: (subStep: string) => boolean;
  getCurrentStepConfig: () => any;
  getTotalSteps: () => number;
  getProgressPercentage: () => number;
  
  // Error management
  setErrors: (errors: Record<string, string[]>) => void;
  clearErrors: () => void;
  addError: (field: string, error: string) => void;
  
  // Loading state
  setLoading: (loading: boolean) => void;
  
  // Data helpers
  initializeDefaultData: () => void;
  getFormDataForCurrentStep: () => any;
  updateCurrentStepData: (data: any) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      planType: null,
      progress: {
        currentStep: 1,
        currentSubStep: 'overview',
        completedSteps: [],
        planType: 'company'
      },
      companyData: {},
      complexData: {},
      clinicData: {},
      isLoading: false,
      errors: {},
      
      // Plan type management
      setPlanType: (planType) => {
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        const firstStep = stepConfig.steps[0];
        
        set({ 
          planType,
          progress: { 
            currentStep: 1,
            currentSubStep: firstStep.subSteps[0],
            completedSteps: [],
            planType
          }
        });
        
        // Initialize default data
        get().initializeDefaultData();
      },
      
      // Progress management
      updateProgress: (progress) => set(state => ({
        progress: { ...state.progress, ...progress }
      })),
      
      // Form data management
      updateCompanyData: (data) => set(state => ({
        companyData: { ...state.companyData, ...data }
      })),
      
      updateComplexData: (data) => set(state => ({
        complexData: { ...state.complexData, ...data }
      })),
      
      updateClinicData: (data) => set(state => ({
        clinicData: { ...state.clinicData, ...data }
      })),
      
      // Reset functionality
      resetOnboarding: () => set({
        planType: null,
        progress: {
          currentStep: 1,
          currentSubStep: 'overview',
          completedSteps: [],
          planType: 'company'
        },
        companyData: {},
        complexData: {},
        clinicData: {},
        isLoading: false,
        errors: {}
      }),
      
      // Step navigation
      goToNextStep: () => {
        const { progress, planType } = get();
        if (!planType) return;
        
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        const nextStep = progress.currentStep + 1;
        
        if (nextStep <= stepConfig.totalSteps) {
          const nextStepConfig = stepConfig.steps.find(s => s.id === nextStep);
          if (nextStepConfig) {
            set(state => ({
              progress: {
                ...state.progress,
                currentStep: nextStep,
                currentSubStep: nextStepConfig.subSteps[0]
              }
            }));
          }
        }
      },
      
      goToPreviousStep: () => {
        const { progress, planType } = get();
        if (!planType) return;
        
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        const prevStep = progress.currentStep - 1;
        
        if (prevStep >= 1) {
          const prevStepConfig = stepConfig.steps.find(s => s.id === prevStep);
          if (prevStepConfig) {
            set(state => ({
              progress: {
                ...state.progress,
                currentStep: prevStep,
                currentSubStep: prevStepConfig.subSteps[prevStepConfig.subSteps.length - 1]
              }
            }));
          }
        }
      },
      
      goToStep: (step, subStep) => {
        const { planType } = get();
        if (!planType) return;
        
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        const targetStepConfig = stepConfig.steps.find(s => s.id === step);
        
        if (targetStepConfig) {
          const targetSubStep = subStep || targetStepConfig.subSteps[0];
          set(state => ({
            progress: {
              ...state.progress,
              currentStep: step,
              currentSubStep: targetSubStep
            }
          }));
        }
      },
      
      goToNextSubStep: () => {
        const { progress, planType } = get();
        if (!planType) return;
        
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        const currentStepConfig = stepConfig.steps.find(s => s.id === progress.currentStep);
        
        if (currentStepConfig) {
          const currentSubStepIndex = currentStepConfig.subSteps.indexOf(progress.currentSubStep);
          const nextSubStepIndex = currentSubStepIndex + 1;
          
          if (nextSubStepIndex < currentStepConfig.subSteps.length) {
            // Move to next sub-step
            set(state => ({
              progress: {
                ...state.progress,
                currentSubStep: currentStepConfig.subSteps[nextSubStepIndex]
              }
            }));
          } else {
            // Move to next step
            get().goToNextStep();
          }
        }
      },
      
      goToPreviousSubStep: () => {
        const { progress, planType } = get();
        if (!planType) return;
        
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        const currentStepConfig = stepConfig.steps.find(s => s.id === progress.currentStep);
        
        if (currentStepConfig) {
          const currentSubStepIndex = currentStepConfig.subSteps.indexOf(progress.currentSubStep);
          const prevSubStepIndex = currentSubStepIndex - 1;
          
          if (prevSubStepIndex >= 0) {
            // Move to previous sub-step
            set(state => ({
              progress: {
                ...state.progress,
                currentSubStep: currentStepConfig.subSteps[prevSubStepIndex]
              }
            }));
          } else {
            // Move to previous step
            get().goToPreviousStep();
          }
        }
      },
      
      // Completion tracking
      markStepCompleted: (stepKey) => set(state => ({
        progress: {
          ...state.progress,
          completedSteps: [...new Set([...state.progress.completedSteps, stepKey])]
        }
      })),
      
      markSubStepCompleted: (stepKey, subStepKey) => {
        const fullKey = `${stepKey}-${subStepKey}`;
        get().markStepCompleted(fullKey);
      },
      
      // Validation helpers
      isStepCompleted: (stepKey) => get().progress.completedSteps.includes(stepKey),
      
      isSubStepCompleted: (stepKey, subStepKey) => {
        const fullKey = `${stepKey}-${subStepKey}`;
        return get().progress.completedSteps.includes(fullKey);
      },
      
      canProceedToStep: (step) => {
        const { progress, planType } = get();
        if (!planType) return false;
        
        // Can always go to current step or previous steps
        if (step <= progress.currentStep) return true;
        
        // Check if previous steps are completed
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        for (let i = 1; i < step; i++) {
          const stepToCheck = stepConfig.steps.find(s => s.id === i);
          if (stepToCheck) {
            const allSubStepsCompleted = stepToCheck.subSteps.every(subStep => 
              get().isSubStepCompleted(stepToCheck.name, subStep)
            );
            if (!allSubStepsCompleted) return false;
          }
        }
        
        return true;
      },
      
      canProceedToSubStep: (subStep) => {
        // Add logic for sub-step validation if needed
        return true;
      },
      
      // Helper functions
      getCurrentStepConfig: () => {
        const { progress, planType } = get();
        if (!planType) return null;
        
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        return stepConfig.steps.find(s => s.id === progress.currentStep);
      },
      
      getTotalSteps: () => {
        const { planType } = get();
        if (!planType) return 0;
        return PLAN_STEP_CONFIGS[planType].totalSteps;
      },
      
      getProgressPercentage: () => {
        const { progress, planType } = get();
        if (!planType) return 0;
        
        const stepConfig = PLAN_STEP_CONFIGS[planType];
        const totalSubSteps = stepConfig.steps.reduce((total, step) => total + step.subSteps.length, 0);
        const completedSubSteps = progress.completedSteps.length;
        
        return Math.round((completedSubSteps / totalSubSteps) * 100);
      },
      
      // Error management
      setErrors: (errors) => set({ errors }),
      clearErrors: () => set({ errors: {} }),
      addError: (field, error) => set(state => ({
        errors: {
          ...state.errors,
          [field]: [...(state.errors[field] || []), error]
        }
      })),
      
      // Loading state
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Data helpers
      initializeDefaultData: () => {
        const { planType } = get();
        if (!planType) return;
        
        // Initialize with default working hours for all entities
        if (planType === 'complex' || planType === 'company') {
          set(state => ({
            complexData: {
              ...state.complexData,
              workingHours: state.complexData.workingHours || DEFAULT_WORKING_HOURS
            }
          }));
        }
        
        if (planType === 'clinic' || planType === 'company') {
          set(state => ({
            clinicData: {
              ...state.clinicData,
              workingHours: state.clinicData.workingHours || DEFAULT_WORKING_HOURS
            }
          }));
        }
      },
      
      getFormDataForCurrentStep: () => {
        const { progress, companyData, complexData, clinicData } = get();
        const currentStepConfig = get().getCurrentStepConfig();
        
        if (!currentStepConfig) return {};
        
        switch (currentStepConfig.name) {
          case 'company':
            return companyData;
          case 'complex':
            return complexData;
          case 'clinic':
            return clinicData;
          default:
            return {};
        }
      },
      
      updateCurrentStepData: (data) => {
        const currentStepConfig = get().getCurrentStepConfig();
        if (!currentStepConfig) return;
        
        switch (currentStepConfig.name) {
          case 'company':
            get().updateCompanyData(data);
            break;
          case 'complex':
            get().updateComplexData(data);
            break;
          case 'clinic':
            get().updateClinicData(data);
            break;
        }
      }
    }),
    {
      name: 'cliniva-onboarding-store',
      partialize: (state) => ({
        planType: state.planType,
        progress: state.progress,
        companyData: state.companyData,
        complexData: state.complexData,
        clinicData: state.clinicData
      }),
      // Don't persist loading states and errors
      skipHydration: false,
    }
  )
);

// Export helper hooks for easier usage
export const useOnboardingProgress = () => {
  const store = useOnboardingStore();
  return {
    progress: store.progress,
    planType: store.planType,
    currentStepConfig: store.getCurrentStepConfig(),
    totalSteps: store.getTotalSteps(),
    progressPercentage: store.getProgressPercentage(),
    canProceedToStep: store.canProceedToStep,
    isStepCompleted: store.isStepCompleted,
    isSubStepCompleted: store.isSubStepCompleted
  };
};

export const useOnboardingNavigation = () => {
  const store = useOnboardingStore();
  return {
    goToNextStep: store.goToNextStep,
    goToPreviousStep: store.goToPreviousStep,
    goToStep: store.goToStep,
    goToNextSubStep: store.goToNextSubStep,
    goToPreviousSubStep: store.goToPreviousSubStep,
    markStepCompleted: store.markStepCompleted,
    markSubStepCompleted: store.markSubStepCompleted
  };
};

export const useOnboardingData = () => {
  const store = useOnboardingStore();
  return {
    companyData: store.companyData,
    complexData: store.complexData,
    clinicData: store.clinicData,
    updateCompanyData: store.updateCompanyData,
    updateComplexData: store.updateComplexData,
    updateClinicData: store.updateClinicData,
    getFormDataForCurrentStep: store.getFormDataForCurrentStep,
    updateCurrentStepData: store.updateCurrentStepData
  };
};

export const useOnboardingUI = () => {
  const store = useOnboardingStore();
  return {
    isLoading: store.isLoading,
    errors: store.errors,
    setLoading: store.setLoading,
    setErrors: store.setErrors,
    clearErrors: store.clearErrors,
    addError: store.addError
  };
}; 
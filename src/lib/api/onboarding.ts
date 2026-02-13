import axios, { AxiosResponse } from 'axios';
import { 
  PlanType, 
  CompanyFormData, 
  ComplexFormData, 
  ClinicFormData,
  OrganizationDto,
  ComplexDto,
  ClinicDto,
  DepartmentDto,
  ServiceDto,
  UserDataDto,
  SubscriptionDataDto,
  ContactDto,
  WorkingHoursDto,
  LegalInfoDto
} from '@/types/onboarding';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Generic API Response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// All DTO interfaces are imported from @/types/onboarding

export interface CompleteOnboardingPayload {
  userData: UserDataDto;
  subscriptionData: SubscriptionDataDto;
  organization?: OrganizationDto;
  complexes?: ComplexDto[];
  departments?: DepartmentDto[];
  clinics?: ClinicDto[];
  services?: ServiceDto[];
  workingHours?: WorkingHoursDto[];
  contacts?: ContactDto[];
  legalInfo?: LegalInfoDto;
}

export interface OnboardingResult {
  success: boolean;
  userId: string;
  subscriptionId: string;
  entities: {
    organization?: any;
    complexes?: any[];
    clinics?: any[];
    departments?: any[];
    services?: any[];
  };
  workingHours?: any[];
  contacts?: any[];
  message: string;
}

export interface PlanInfo {
  id: string;
  name: string;
  type: PlanType;
  description: string;
  features: string[];
  pricing?: {
    monthly: number;
    yearly: number;
  };
  limitations?: {
    maxComplexes?: number;
    maxClinics?: number;
    maxUsers?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface OnboardingProgressResult {
  userId: string;
  planType: PlanType;
  currentStep: number;
  completedSteps: string[];
  lastUpdated: string;
  data?: any;
}

// API Client Class
export class OnboardingApiClient {
  // Complete the entire onboarding process
  async completeOnboarding(payload: CompleteOnboardingPayload): Promise<ApiResponse<OnboardingResult>> {
    try {
      const response: AxiosResponse<ApiResponse<OnboardingResult>> = await apiClient.post('/onboarding/complete', payload);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete onboarding',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Validate step data
  async validateStep(stepData: any, planType: PlanType, step: string): Promise<ApiResponse<ValidationResult>> {
    try {
      const response: AxiosResponse<ApiResponse<ValidationResult>> = await apiClient.post('/onboarding/validate', {
        stepData,
        planType,
        step
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Validation failed',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Get onboarding progress
  async getProgress(userId: string): Promise<ApiResponse<OnboardingProgressResult>> {
    try {
      const response: AxiosResponse<ApiResponse<OnboardingProgressResult>> = await apiClient.get(`/onboarding/progress/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get progress',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Get available plans
  async getAvailablePlans(): Promise<ApiResponse<PlanInfo[]>> {
    try {
      const response: AxiosResponse<ApiResponse<PlanInfo[]>> = await apiClient.get('/onboarding/plans');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get plans',
        errors: error.response?.data?.errors || [{ field: 'general', message: error.message }]
      };
    }
  }

  // Transform form data to API payload
  transformToApiPayload(
    planType: PlanType,
    userData: UserDataDto,
    companyData?: Partial<CompanyFormData>,
    complexData?: Partial<ComplexFormData>,
    clinicData?: Partial<ClinicFormData>
  ): CompleteOnboardingPayload {
    const payload: CompleteOnboardingPayload = {
      userData,
      subscriptionData: {
        planType,
        planId: 'default-plan-id' // This should come from plan selection
      }
    };

    // Transform company data
    if (planType === 'company' && companyData?.overview && companyData?.contact && companyData?.legal) {
      const address = companyData.contact.address ? 
        [
          companyData.contact.address.street,
          companyData.contact.address.city,
          companyData.contact.address.state,
          companyData.contact.address.postalCode,
          companyData.contact.address.country
        ].filter(Boolean).join(', ') : '';

      payload.organization = {
        name: companyData.overview.name,
        legalName: companyData.overview.legalName,
        phone: companyData.contact.phoneNumbers?.[0]?.number,
        email: companyData.contact.email,
        address,
        googleLocation: companyData.contact.address?.googleLocation,
        logoUrl: companyData.overview.logoUrl,
        website: companyData.overview.website,
        businessProfile: {
          yearEstablished: companyData.overview.yearEstablished,
          mission: companyData.overview.mission,
          vision: companyData.overview.vision,
          ceoName: companyData.overview.ceoName
        },
        legalInfo: companyData.legal
      };

      // Add social media contacts
      payload.contacts = [];
      const socialMedia = companyData.contact.socialMediaLinks;
      if (socialMedia?.facebook) {
        payload.contacts.push({ contactType: 'facebook', contactValue: socialMedia.facebook });
      }
      if (socialMedia?.twitter) {
        payload.contacts.push({ contactType: 'twitter', contactValue: socialMedia.twitter });
      }
      if (socialMedia?.instagram) {
        payload.contacts.push({ contactType: 'instagram', contactValue: socialMedia.instagram });
      }
      if (socialMedia?.linkedin) {
        payload.contacts.push({ contactType: 'linkedin', contactValue: socialMedia.linkedin });
      }
    }

    // Transform complex data
    if ((planType === 'complex' || planType === 'company') && complexData?.overview && complexData?.contact) {
      const address = complexData.contact.address ? 
        [
          complexData.contact.address.street,
          complexData.contact.address.city,
          complexData.contact.address.state,
          complexData.contact.address.postalCode,
          complexData.contact.address.country
        ].filter(Boolean).join(', ') : '';

      const complexDto: ComplexDto = {
        name: complexData.overview.name,
        address,
        googleLocation: complexData.contact.address?.googleLocation,
        phone: complexData.contact.phoneNumbers?.[0]?.number,
        email: complexData.contact.email,
        logoUrl: complexData.overview.logoUrl,
        website: complexData.overview.website,
        managerName: complexData.overview.managerName,
        departmentIds: complexData.overview.departmentIds,
        businessProfile: {
          yearEstablished: complexData.overview.yearEstablished,
          mission: complexData.overview.mission,
          vision: complexData.overview.vision,
          ceoName: complexData.overview.ceoName
        },
        legalInfo: complexData.legal
      };

      payload.complexes = [complexDto];

      // Add departments
      if (complexData.overview.departments) {
        payload.departments = complexData.overview.departments.map(dept => ({
          name: dept.name,
          description: dept.description
        }));
      }

      // Add working hours
      if (complexData.workingHours) {
        if (!payload.workingHours) payload.workingHours = [];
        payload.workingHours.push(...complexData.workingHours.map(wh => ({
          entityType: 'complex' as const,
          entityName: complexData.overview?.name || '',
          dayOfWeek: wh.dayOfWeek,
          isWorkingDay: wh.isWorkingDay,
          openingTime: wh.openingTime,
          closingTime: wh.closingTime,
          breakStartTime: wh.breakStartTime,
          breakEndTime: wh.breakEndTime
        })));
      }
    }

    // Transform clinic data
    if (clinicData?.overview && clinicData?.contact) {
      const address = clinicData.contact.address ? 
        [
          clinicData.contact.address.street,
          clinicData.contact.address.city,
          clinicData.contact.address.state,
          clinicData.contact.address.postalCode,
          clinicData.contact.address.country
        ].filter(Boolean).join(', ') : '';

      const clinicDto: ClinicDto = {
        name: clinicData.overview.name,
        address,
        googleLocation: clinicData.contact.address?.googleLocation,
        phone: clinicData.contact.phoneNumbers?.[0]?.number,
        email: clinicData.contact.email,
        logoUrl: clinicData.overview.logoUrl,
        website: clinicData.overview.website,
        headDoctorName: clinicData.overview.headDoctorName,
        specialization: clinicData.overview.specialization,
        pin: clinicData.overview.pin,
        complexDepartmentId: clinicData.overview.complexDepartmentId,
        capacity: clinicData.servicesCapacity?.capacity,
        businessProfile: {
          yearEstablished: clinicData.overview.yearEstablished,
          mission: clinicData.overview.mission,
          vision: clinicData.overview.vision,
          ceoName: clinicData.overview.ceoName
        },
        legalInfo: planType === 'clinic' ? clinicData.legal : undefined
      };

      if (!payload.clinics) payload.clinics = [];
      payload.clinics.push(clinicDto);

      // Add services
      if (clinicData.servicesCapacity?.services) {
        if (!payload.services) payload.services = [];
        payload.services.push(...clinicData.servicesCapacity.services.map(service => ({
          name: service.name,
          description: service.description,
          durationMinutes: service.durationMinutes,
          price: service.price
        })));
      }

      // Add clinic working hours
      if (clinicData.workingHours) {
        if (!payload.workingHours) payload.workingHours = [];
        payload.workingHours.push(...clinicData.workingHours.map(wh => ({
          entityType: 'clinic' as const,
          entityName: clinicData.overview?.name || '',
          dayOfWeek: wh.dayOfWeek,
          isWorkingDay: wh.isWorkingDay,
          openingTime: wh.openingTime,
          closingTime: wh.closingTime,
          breakStartTime: wh.breakStartTime,
          breakEndTime: wh.breakEndTime
        })));
      }
    }

    return payload;
  }

  // Upload file helper
  async uploadFile(file: File): Promise<ApiResponse<{ url: string; id: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'File upload failed',
        errors: [{ field: 'file', message: error.message }]
      };
    }
  }
}

// Create singleton instance
export const onboardingApi = new OnboardingApiClient();

// Export default for easier imports
export default onboardingApi; 
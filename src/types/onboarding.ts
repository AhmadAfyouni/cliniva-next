// ========================================
// CLINIVA ONBOARDING TYPES
// ========================================
// These types MUST match the backend DTOs exactly
// Source: cliniva-backend/src/onboarding/dto/

// ========================================
// SHARED BASE TYPES (from shared-base.dto.ts)
// ========================================

export interface PhoneNumberDto {
  number: string;
  type?: 'primary' | 'secondary' | 'emergency' | 'fax' | 'mobile';
  label?: string;
}

export interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  googleLocation?: string;
}

export interface EmergencyContactDto {
  name?: string;
  phone?: string;
  email?: string;
  relationship?: string;
}

export interface SocialMediaLinksDto {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
  youtube?: string;
  website?: string;
}

export interface ContactInfoDto {
  phoneNumbers?: PhoneNumberDto[];
  email?: string;
  address?: AddressDto;
  emergencyContact?: EmergencyContactDto;
  socialMediaLinks?: SocialMediaLinksDto;
}

export interface BusinessProfileDto {
  yearEstablished?: number;
  mission?: string;
  vision?: string;
  ceoName?: string;
}

export interface LegalInfoDto {
  vatNumber?: string;
  crNumber?: string;
  termsConditionsUrl?: string;
  privacyPolicyUrl?: string;
}

// ========================================
// ENTITY-SPECIFIC DTOs
// ========================================

export interface CapacityDto {
  maxStaff?: number;
  maxDoctors?: number;
  maxPatients?: number;
  sessionDuration?: number;
}

// Working Hours
export interface WorkingHoursDto {
  entityType?: 'organization' | 'complex' | 'clinic';
  entityId?: string;
  entityName?: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorkingDay: boolean;
  openingTime?: string;
  closingTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

// ========================================
// STEP-BY-STEP DTOs (matching backend)
// ========================================

// Organization Steps
export interface OrganizationOverviewDto {
  name: string;
  legalName?: string;
  logoUrl?: string;
  website?: string;
  // Flattened business profile fields
  yearEstablished?: number;
  mission?: string;
  vision?: string;
  overview?: string;
  goals?: string;
  ceoName?: string;
}

export interface OrganizationContactDto extends ContactInfoDto {
  // All contact fields inherited from ContactInfoDto
}

export interface OrganizationLegalDto extends LegalInfoDto {
  // All legal fields inherited from LegalInfoDto
}

// Complex Steps
export interface ComplexOverviewDto {
  name: string;
  managerName?: string;
  logoUrl?: string;
  website?: string;
  // Flattened business profile fields
  yearEstablished?: number;
  mission?: string;
  vision?: string;
  overview?: string;
  goals?: string;
  ceoName?: string;
  // Department management
  departmentIds?: string[];
  newDepartmentNames?: string[];
  // Frontend helper field for full department objects
  departments?: Array<{
    _id?: string;
    name: string;
    description?: string;
  }>;
}

export interface ComplexContactDto extends ContactInfoDto {
  // All contact fields inherited from ContactInfoDto
}

export interface ComplexLegalInfoDto extends LegalInfoDto {
  // All legal fields inherited from LegalInfoDto
}

export interface ComplexWorkingHoursDto {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorkingDay: boolean;
  openingTime?: string;
  closingTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

// Clinic Steps
export interface ClinicOverviewDto {
  name: string;
  headDoctorName?: string;
  specialization?: string;
  licenseNumber?: string;
  pin?: string;
  logoUrl?: string;
  website?: string;
  // Flattened business profile fields
  yearEstablished?: number;
  mission?: string;
  vision?: string;
  overview?: string;
  goals?: string;
  ceoName?: string;
  // Services and relationships
  services?: Array<{
    name: string;
    description?: string;
    durationMinutes?: number;
    price?: number;
  }>;
  complexDepartmentId?: string;
  // Note: Capacity fields removed - now handled by schema defaults
  // Note: Contact information fields moved to ClinicContactDto
}

export interface ClinicContactDto extends ContactInfoDto {
  // All contact fields inherited from ContactInfoDto
}

export interface ClinicLegalInfoDto extends LegalInfoDto {
  // All legal fields inherited from LegalInfoDto
}

export interface ClinicServicesCapacityDto {
  services?: Array<{
    name: string;
    description?: string;
    durationMinutes?: number;
    price?: number;
  }>;
  capacity?: CapacityDto;
}

export interface ClinicWorkingHoursDto {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorkingDay: boolean;
  openingTime?: string;
  closingTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
}

// ========================================
// LEGACY COMPLETE ONBOARDING DTO
// ========================================

// Main entity DTOs for legacy support
export interface OrganizationDto {
  name: string;
  legalName?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  googleLocation?: string; // Should be string, not object
  logoUrl?: string;
  website?: string;
  businessProfile?: BusinessProfileDto;
  legalInfo?: LegalInfoDto;
}

export interface ComplexDto {
  name: string;
  address?: string;
  googleLocation?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  website?: string;
  managerName?: string;
  departmentIds?: string[];
  businessProfile?: BusinessProfileDto;
  legalInfo?: LegalInfoDto;
}

export interface ClinicDto {
  name: string;
  address?: string;
  googleLocation?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  logoUrl?: string;
  website?: string;
  headDoctorName?: string;
  specialization?: string;
  pin?: string;
  complexDepartmentId?: string;
  // Services managed through ClinicService junction table
  capacity?: CapacityDto;
  businessProfile?: BusinessProfileDto;
  legalInfo?: LegalInfoDto;
}

export interface DepartmentDto {
  name: string;
  description?: string;
}

export interface ServiceDto {
  name: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  complexDepartmentId?: string;
}

export interface UserDataDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface SubscriptionDataDto {
  planType: 'company' | 'complex' | 'clinic';
  planId: string;
}

export interface CompleteOnboardingDto {
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

export interface ContactDto {
  contactType: string;
  contactValue: string;
  isActive?: boolean;
}

// ========================================
// FRONTEND-SPECIFIC EXTENSIONS
// ========================================

// Location coordinates for maps
export interface LocationCoords {
  lat: number;
  lng: number;
  shareableLink?: string;
}

// Form data interfaces that match backend DTOs exactly
export interface CompanyFormData {
  subscriptionId?: string;
  // Organization Overview (matches OrganizationOverviewDto)
  overview?: OrganizationOverviewDto;
  // Organization Contact (matches OrganizationContactDto with new structure)
  contact?: ContactInfoDto;
  // Organization Legal (matches OrganizationLegalDto)
  legal?: LegalInfoDto;
}

export interface ComplexFormData {
  subscriptionId?: string;
  organizationId?: string;
  overview?: ComplexOverviewDto;
  contact?: ContactInfoDto;
  legal?: LegalInfoDto;
  workingHours?: ComplexWorkingHoursDto[];
}

export interface ClinicFormData {
  subscriptionId?: string;
  complexDepartmentId?: string;
  overview?: ClinicOverviewDto;
  contact?: ContactInfoDto;
  servicesCapacity?: ClinicServicesCapacityDto;
  legal?: LegalInfoDto;
  workingHours?: ClinicWorkingHoursDto[];
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface StepSaveResponseDto {
  success: boolean;
  message?: string;
  data?: any;
  entityId?: string;
  nextStep?: string;
  canProceed?: boolean;
}

export interface StepValidationResultDto {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface OnboardingProgressDto {
  userId: string;
  currentStep?: string | number;
  currentSubStep?: string;
  completedSteps: string[];
  planType: 'company' | 'complex' | 'clinic';
  subscriptionId?: string;
  organizationId?: string;
  complexId?: string;
  clinicId?: string;
  totalSteps?: number;
  currentStepNumber?: number;
  canSkipCurrent?: boolean;
}

// ========================================
// PLAN TYPE UTILITIES
// ========================================

export type PlanType = 'company' | 'complex' | 'clinic';

export interface PlanConfiguration {
  planType: PlanType;
  requiredSteps: string[];
  optionalSteps: string[];
  entityHierarchy: string[];
}

// ========================================
// ONBOARDING CONTEXT
// ========================================

export interface OnboardingContextData {
  // From authentication
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  planType?: PlanType;
  subscriptionId?: string;
  onboardingProgress?: string[];
  
  // Form data
  userData?: Partial<UserDataDto>;
  subscriptionData?: Partial<SubscriptionDataDto>;
  organization?: Partial<OrganizationDto>;
  complex?: Partial<ComplexDto>;
  clinic?: Partial<ClinicDto>;
  
  // Progress tracking
  currentStep: string;
  currentSubStep: string;
  completedSteps: string[];
}

// ========================================
// FORM PROPS INTERFACES
// ========================================

export interface BaseFormProps<T> {
  data?: Partial<T>;
  onNext: (data: Partial<T>) => void;
  onPrevious: () => void;
  currentSubStep: string;
  onSubStepChange: (subStep: string) => void;
  isLoading?: boolean;
  errors?: any;
}

export type CompanyFormProps = BaseFormProps<CompanyFormData>;
export type ComplexFormProps = BaseFormProps<ComplexFormData>;
export type ClinicFormProps = BaseFormProps<ClinicFormData>;

// ========================================
// ERROR HANDLING TYPES
// ========================================

export interface ApiError {
  networkError?: boolean;
  validationError?: boolean;
  authError?: boolean;
  serverError?: boolean;
  backendError?: boolean;
  code?: string;
  status?: number;
  message: string;
  error?: string;
  errors?: any[];
  data?: any;
  context?: string;
  canProceed?: boolean;
}

// ========================================
// VALIDATION RESPONSE TYPES
// ========================================

export interface ValidationResponse {
  success: boolean;
  isAvailable?: boolean;
  isUnique?: boolean;
  isValid?: boolean;
  message: string;
  data?: any;
}
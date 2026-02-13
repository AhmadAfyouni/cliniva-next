import apiClient from '../axios';
import { CompanyFormData } from '@/types/onboarding';
import { getSession } from 'next-auth/react';

export interface CompleteCompanyRegistrationPayload {
  // Company Overview (Organization)
  name: string;
  legalName?: string;
  registrationNumber?: string;
  yearEstablished?: number;
  logoUrl?: string;
  ceoName?: string;
  mission?: string;
  vision?: string;
  
  // Contact Information
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  googleLocation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    whatsapp?: string;
  };
  
  // Legal Information
  vatNumber?: string;
  crNumber?: string;
  termsConditionsUrl?: string;
  privacyPolicyUrl?: string;
  
  // Subscription ID (required)
  subscriptionId: string;
}

export interface CompanyRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    organizationId: string;
    subscriptionId: string;
  };
}

/**
 * Get subscription ID from user session
 */
async function getSubscriptionId(): Promise<string> {
  try {
    const session = await getSession();
    if (session?.user?.subscriptionId) {
      return session.user.subscriptionId;
    }
    
    // Fallback: Call user profile API to get subscription ID
    const response = await apiClient.get('/auth/profile');
    return response.data?.subscriptionId || 'temp-subscription-id';
  } catch (error) {
    console.warn('Could not get subscription ID from session:', error);
    return 'temp-subscription-id';
  }
}

/**
 * Complete company registration by combining all form data
 */
export async function completeCompanyRegistration(
  formData: CompanyFormData,
  providedSubscriptionId?: string
): Promise<CompanyRegistrationResponse> {
  try {
    // Get subscription ID from session or use provided one
    const subscriptionId = providedSubscriptionId || await getSubscriptionId();
    
    // Transform form data to API payload
    const payload: CompleteCompanyRegistrationPayload = {
      subscriptionId,
      // Overview data
      name: formData.overview?.name || '',
      legalName: formData.overview?.legalName,
      registrationNumber: formData.legal?.crNumber, // From legal data, not overview
      yearEstablished: formData.overview?.yearEstablished,
      logoUrl: formData.overview?.logoUrl,
      ceoName: formData.overview?.ceoName,
      mission: formData.overview?.mission,
      vision: formData.overview?.vision,
      // Contact data (convert from DTO structure)
      phone: formData.contact?.phoneNumbers?.[0]?.number,
      email: formData.contact?.email,
      website: formData.overview?.website, // Website is in overview, not contact
      address: formData.contact?.address ? 
        [
          formData.contact.address.street,
          formData.contact.address.city,
          formData.contact.address.state,
          formData.contact.address.postalCode,
          formData.contact.address.country
        ].filter(Boolean).join(', ') : undefined,
      googleLocation: formData.contact?.address?.googleLocation,
      emergencyContactName: formData.contact?.emergencyContact?.name,
      emergencyContactPhone: formData.contact?.emergencyContact?.phone,
      socialMediaLinks: formData.contact?.socialMediaLinks,
      // Legal data
      vatNumber: formData.legal?.vatNumber,
      crNumber: formData.legal?.crNumber,
      termsConditionsUrl: formData.legal?.termsConditionsUrl,
      privacyPolicyUrl: formData.legal?.privacyPolicyUrl,
    };

    console.log('Creating organization with payload:', payload);

    // Make API call to create organization
    const response = await apiClient.post<CompanyRegistrationResponse>(
      '/organization', // Updated to match backend controller
      payload
    );

    return response.data;
  } catch (error: any) {
    console.error('Company registration error:', error);
    
    // Return structured error response
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to complete company registration',
      data: {
        organizationId: '',
        subscriptionId: providedSubscriptionId || 'temp-subscription-id'
      }
    };
  }
}

/**
 * Validate company registration data before submission
 */
export function validateCompanyRegistrationData(formData: CompanyFormData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate overview (required)
  if (!formData.overview?.name || formData.overview.name.trim() === '') {
    errors.push('Company name is required');
  }

  // Validate contact (optional but if provided should be valid)
  if (formData.contact?.email && formData.contact.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact.email)) {
      errors.push('Please provide a valid email address');
    }
  }

  // Website is in overview, not contact
  if (formData.overview?.website && formData.overview.website.trim() !== '') {
    try {
      new URL(formData.overview.website.startsWith('http') ? 
        formData.overview.website : 
        `https://${formData.overview.website}`);
    } catch {
      errors.push('Please provide a valid website URL');
    }
  }

  // Validate legal URLs if provided
  if (formData.legal?.termsConditionsUrl && formData.legal.termsConditionsUrl.trim() !== '') {
    try {
      new URL(formData.legal.termsConditionsUrl.startsWith('http') ? 
        formData.legal.termsConditionsUrl : 
        `https://${formData.legal.termsConditionsUrl}`);
    } catch {
      errors.push('Please provide a valid Terms & Conditions URL');
    }
  }

  if (formData.legal?.privacyPolicyUrl && formData.legal.privacyPolicyUrl.trim() !== '') {
    try {
      new URL(formData.legal.privacyPolicyUrl.startsWith('http') ? 
        formData.legal.privacyPolicyUrl : 
        `https://${formData.legal.privacyPolicyUrl}`);
    } catch {
      errors.push('Please provide a valid Privacy Policy URL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 
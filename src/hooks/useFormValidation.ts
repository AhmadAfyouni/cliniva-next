// ========================================
// FORM VALIDATION HOOK
// ========================================
// Validates forms according to backend DTO requirements before submission

import { useState, useCallback } from 'react'
import { 
  OrganizationOverviewDto, 
  OrganizationContactDto, 
  OrganizationLegalDto,
  ComplexOverviewDto,
  ComplexContactDto,
  ComplexWorkingHoursDto,
  ClinicOverviewDto,
  ClinicContactDto,
  ClinicWorkingHoursDto
} from '@/types/onboarding'

export interface ValidationError {
  field: string
  message: string
  type: 'required' | 'format' | 'length' | 'custom'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationError[]>>({})

  // Helper functions for common validations
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidYear = (year: number): boolean => {
    const currentYear = new Date().getFullYear()
    return year >= 1800 && year <= currentYear
  }

  // Organization Overview Validation
  const validateOrganizationOverview = useCallback((data: Partial<OrganizationOverviewDto>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Required: name
    if (!data.name || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Organization name is required',
        type: 'required'
      })
    } else if (data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Organization name must be at least 2 characters',
        type: 'length'
      })
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Organization name must not exceed 100 characters',
        type: 'length'
      })
    }

    // Optional but validated: legalName
    if (data.legalName && data.legalName.trim().length > 150) {
      errors.push({
        field: 'legalName',
        message: 'Legal name must not exceed 150 characters',
        type: 'length'
      })
    }

    // Optional but validated: yearEstablished
    if (data.yearEstablished && !isValidYear(data.yearEstablished)) {
      errors.push({
        field: 'yearEstablished',
        message: 'Year established must be between 1800 and current year',
        type: 'format'
      })
    }

    // Optional but validated: logoUrl
    if (data.logoUrl && !isValidUrl(data.logoUrl)) {
      errors.push({
        field: 'logoUrl',
        message: 'Logo URL must be a valid URL',
        type: 'format'
      })
    }

    // Optional but validated: registrationNumber (from legal data, not overview)
    // Note: registrationNumber is in legal data (crNumber), not in overview
    // if (data.registrationNumber && data.registrationNumber.trim().length > 50) {
    //   errors.push({
    //     field: 'registrationNumber',
    //     message: 'Registration number must not exceed 50 characters',
    //     type: 'length'
    //   })
    // }

    // Warnings for recommended fields
    if (!data.overview || data.overview.trim().length === 0) {
      warnings.push({
        field: 'overview',
        message: 'Company overview is recommended for better profile completion',
        type: 'custom'
      })
    }

    if (!data.goals || data.goals.trim().length === 0) {
      warnings.push({
        field: 'goals',
        message: 'Strategic goals help define your organization\'s direction',
        type: 'custom'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  // Organization Contact Validation
  const validateOrganizationContact = useCallback((data: Partial<OrganizationContactDto>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Validate email if provided
    if (data.email && !isValidEmail(data.email)) {
      errors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        type: 'format'
      })
    }

    // Validate website if provided (website is in overview, not contact)
    // if (data.website && !isValidUrl(data.website)) {
    //   errors.push({
    //     field: 'website',
    //     message: 'Please enter a valid website URL',
    //     type: 'format'
    //   })
    // }

    // Validate phone if provided (phone is phoneNumbers array in contact DTO)
    // if (data.phone && data.phone.trim().length > 0) {
    //   const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    //   if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
    //     errors.push({
    //       field: 'phone',
    //       message: 'Please enter a valid phone number',
    //       type: 'format'
    //     })
    //   }
    // }

    // Validate address length (address is AddressDto object, not string)
    // if (data.address && data.address.trim().length > 500) {
    //   errors.push({
    //     field: 'address',
    //     message: 'Address must not exceed 500 characters',
    //     type: 'length'
    //   })
    // }

    // Warnings for important contact info
    if (!data.email || data.email.trim().length === 0) {
      warnings.push({
        field: 'email',
        message: 'Email address is highly recommended for communication',
        type: 'custom'
      })
    }

    // Phone is phoneNumbers array, not a simple string
    // if (!data.phone || data.phone.trim().length === 0) {
    //   warnings.push({
    //     field: 'phone',
    //     message: 'Phone number is recommended for direct contact',
    //     type: 'custom'
    //   })
    // }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  // Organization Legal Validation
  const validateOrganizationLegal = useCallback((data: Partial<OrganizationLegalDto>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Validate VAT number format if provided
    if (data.vatNumber && data.vatNumber.trim().length > 0) {
      if (data.vatNumber.trim().length < 8 || data.vatNumber.trim().length > 20) {
        errors.push({
          field: 'vatNumber',
          message: 'VAT number must be between 8 and 20 characters',
          type: 'length'
        })
      }
    }

    // Validate CR number format if provided
    if (data.crNumber && data.crNumber.trim().length > 0) {
      if (data.crNumber.trim().length < 5 || data.crNumber.trim().length > 25) {
        errors.push({
          field: 'crNumber',
          message: 'CR number must be between 5 and 25 characters',
          type: 'length'
        })
      }
    }

    // Validate URLs if provided
    if (data.termsConditionsUrl && !isValidUrl(data.termsConditionsUrl)) {
      errors.push({
        field: 'termsConditionsUrl',
        message: 'Terms & Conditions URL must be a valid URL',
        type: 'format'
      })
    }

    if (data.privacyPolicyUrl && !isValidUrl(data.privacyPolicyUrl)) {
      errors.push({
        field: 'privacyPolicyUrl',
        message: 'Privacy Policy URL must be a valid URL',
        type: 'format'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  // Complex Overview Validation
  const validateComplexOverview = useCallback((data: Partial<ComplexOverviewDto>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Required: name
    if (!data.name || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Complex name is required',
        type: 'required'
      })
    } else if (data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Complex name must be at least 2 characters',
        type: 'length'
      })
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Complex name must not exceed 100 characters',
        type: 'length'
      })
    }

    // Optional validations
    if (data.yearEstablished && !isValidYear(data.yearEstablished)) {
      errors.push({
        field: 'yearEstablished',
        message: 'Year established must be between 1800 and current year',
        type: 'format'
      })
    }

    if (data.logoUrl && !isValidUrl(data.logoUrl)) {
      errors.push({
        field: 'logoUrl',
        message: 'Logo URL must be a valid URL',
        type: 'format'
      })
    }

    if (data.website && !isValidUrl(data.website)) {
      errors.push({
        field: 'website',
        message: 'Website URL must be a valid URL',
        type: 'format'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  // Clinic Overview Validation
  const validateClinicOverview = useCallback((data: Partial<ClinicOverviewDto>): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Required: name
    if (!data.name || data.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Clinic name is required',
        type: 'required'
      })
    } else if (data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Clinic name must be at least 2 characters',
        type: 'length'
      })
    } else if (data.name.trim().length > 100) {
      errors.push({
        field: 'name',
        message: 'Clinic name must not exceed 100 characters',
        type: 'length'
      })
    }

    // Validate capacity if provided (capacity is not in ClinicOverviewDto)
    // if (data.capacity) {
    //   if (data.capacity.maxStaff && (data.capacity.maxStaff < 1 || data.capacity.maxStaff > 1000)) {
    //     errors.push({
    //       field: 'capacity.maxStaff',
    //       message: 'Max staff must be between 1 and 1000',
    //       type: 'format'
    //     })
    //   }

    //   if (data.capacity.maxDoctors && (data.capacity.maxDoctors < 1 || data.capacity.maxDoctors > 500)) {
    //     errors.push({
    //       field: 'capacity.maxDoctors',
    //       message: 'Max doctors must be between 1 and 500',
    //       type: 'format'
    //     })
    //   }

    //   if (data.capacity.maxPatients && (data.capacity.maxPatients < 1 || data.capacity.maxPatients > 10000)) {
    //     errors.push({
    //       field: 'capacity.maxPatients',
    //       message: 'Max patients must be between 1 and 10,000',
    //       type: 'format'
    //     })
    //   }

    //   if (data.capacity.sessionDuration && (data.capacity.sessionDuration < 5 || data.capacity.sessionDuration > 480)) {
    //     errors.push({
    //       field: 'capacity.sessionDuration',
    //       message: 'Session duration must be between 5 and 480 minutes',
    //       type: 'format'
    //     })
    //   }
    // }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }, [])

  // Main validation function that determines which validator to use
  const validateForm = useCallback((formType: string, data: any): ValidationResult => {
    switch (formType) {
      case 'organization-overview':
        return validateOrganizationOverview(data)
      case 'organization-contact':
        return validateOrganizationContact(data)
      case 'organization-legal':
        return validateOrganizationLegal(data)
      case 'complex-overview':
        return validateComplexOverview(data)
      case 'clinic-overview':
        return validateClinicOverview(data)
      default:
        return { isValid: true, errors: [], warnings: [] }
    }
  }, [
    validateOrganizationOverview,
    validateOrganizationContact,
    validateOrganizationLegal,
    validateComplexOverview,
    validateClinicOverview
  ])

  // Set validation errors for a specific form
  const setFormErrors = useCallback((formType: string, errors: ValidationError[]) => {
    setValidationErrors(prev => ({
      ...prev,
      [formType]: errors
    }))
  }, [])

  // Clear validation errors for a specific form
  const clearFormErrors = useCallback((formType: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[formType]
      return newErrors
    })
  }, [])

  // Get validation errors for a specific form
  const getFormErrors = useCallback((formType: string): ValidationError[] => {
    return validationErrors[formType] || []
  }, [validationErrors])

  return {
    validateForm,
    setFormErrors,
    clearFormErrors,
    getFormErrors,
    hasErrors: Object.keys(validationErrors).length > 0,
    allFormErrors: validationErrors
  }
} 
import React from 'react';
import { UniqueValidationState } from '@/hooks/useUniqueValidation';

interface ValidationMessageProps {
  validation: UniqueValidationState;
}

export function ValidationMessage({ validation }: ValidationMessageProps) {
  if (!validation.hasChecked) return null;

  const { message, isChecking, isValid, isAvailable } = validation;

  if (!message) return null;

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeLinecap="round"/>
        </svg>
      );
    }

    if (isValid && isAvailable) {
      return (
        <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      );
    }

    return (
      <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
    );
  };

  const getStatusClass = () => {
    if (isChecking) return "text-blue-600";
    if (isValid && isAvailable) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className={`text-sm ${getStatusClass()}`}>
      <span className="inline-flex items-center gap-1">
        {getStatusIcon()}
        {message}
      </span>
    </div>
  );
}

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiHelpers } from '@/lib/axios';
import { signIn } from 'next-auth/react';
import { useRefreshSession } from './useRefreshSession';

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OnboardingData extends RegisterData {
  planId: string;
  organizationType: 'clinic' | 'complex' | 'company';
  organizationName: string;
  organizationDescription?: string;
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { forceRefreshWithLogin } = useRefreshSession();

  const registerPatient = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Register patient
      const result = await apiHelpers.register({
        ...data,
        role: 'patient',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        gender: data.gender as 'male' | 'female' | 'other' | undefined,
      });

      // Auto-login after successful registration
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error('Registration successful, but login failed. Please login manually.');
      }

      // Redirect to patient dashboard
      router.push('/dashboard/patient');
      
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerWithOnboarding = async (data: OnboardingData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Step 1: Register owner user
      console.log('🔥 Step 1: Registering owner user...');
      const userResult = await apiHelpers.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'owner',
        phone: data.phone || undefined,
      });

      console.log('✅ User registered successfully:', userResult);

      // Step 2: Create subscription with selected plan
      console.log('🔥 Step 2: Creating subscription...');
      const subscriptionResult = await apiHelpers.post('/subscriptions', {
        userId: userResult.user.id,
        planId: data.planId,
        planType: data.organizationType, // clinic, complex, or company
        status: 'active'
      });

      console.log('✅ Subscription created successfully:', subscriptionResult);
      console.log('📊 Subscription details:', {
        subscriptionId: subscriptionResult.data?.id,
        userId: subscriptionResult.data?.userId,
        planType: data.organizationType,
        planId: data.planId
      });

      // Step 3: Wait for database consistency, then auto-login with session refresh
      console.log('🔥 Step 3: Auto-login with session refresh...');
      // Small delay to ensure database writes are committed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // First, do the basic sign-in
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error('Registration successful, but login failed. Please login manually.');
      }

      console.log('✅ Basic login successful, now refreshing session with fresh data...');
      
      // Step 3.5: Force session refresh with fresh user data from backend
      const refreshedSession = await forceRefreshWithLogin(data.email, data.password);
      
      if (refreshedSession?.user) {
        console.log('✅ Session refreshed with subscription data:', {
        subscriptionId: refreshedSession.user.subscriptionId,
        planType: refreshedSession.user.planType,
        userId: refreshedSession.user.id
      });
      
      // Check if user needs setup based on their plan and existing entities
      console.log('🔍 Checking if user needs setup...');
      try {
        const entitiesStatus = await apiHelpers.get(`/users/${refreshedSession.user.id}/entities-status`);
        console.log('📊 User entities status:', entitiesStatus);
        
        if (entitiesStatus.needsSetup) {
          console.log('🎯 User needs setup, redirecting to setup page');
          window.location.href = `/onboarding/setup?plan=${entitiesStatus.planType}&step=${entitiesStatus.nextStep}`;
        } else {
          console.log('✅ User setup complete, redirecting to dashboard');
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('❌ Error checking user entities, using fallback redirect:', error);
        // Fallback: redirect to setup with the plan type from registration data
        const planType = refreshedSession.user.planType || data.organizationType;
        console.log('🎯 Fallback redirect to setup with plan type:', planType);
        window.location.href = `/onboarding/setup?plan=${planType}`;
      }
      } else {
        console.log('⚠️ Session refresh failed, but login was successful. Using fallback redirect...');
        // Fallback: redirect to setup with the plan type from registration data
        const planType = data.organizationType;
        console.log('🎯 Fallback redirect to setup with plan type:', planType);
        window.location.href = `/onboarding/setup?plan=${planType}`;
      }

      // Step 4: Store onboarding data in sessionStorage for setup page
      const onboardingData = {
        organizationType: data.organizationType,
        organizationName: data.organizationName,
        organizationDescription: data.organizationDescription,
        subscriptionId: subscriptionResult.data.id,
        planId: data.planId
      };
      
      sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      console.log('💾 Onboarding data stored in sessionStorage:', onboardingData);
      console.log('✅ Onboarding data stored for setup');

      // Step 5: Small delay to ensure session is established, then redirect
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      router.push(`/onboarding/setup?plan=${data.organizationType}`);
      
      return { user: userResult, subscription: subscriptionResult };
    } catch (err: any) {
      console.error('💥 Registration failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    registerPatient,
    registerWithOnboarding,
    loading,
    error,
    clearError,
  };
}; 
'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingFlow, OnboardingData } from '@/components/onboarding';
import { PlanType } from '@/types/onboarding/common';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

function SetupPageContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get plan type from URL parameters, fallback to user's session planType
  const urlPlanType = searchParams.get('plan') as PlanType | null;
  const sessionPlanType = user?.planType as PlanType | null;

  // Enhanced planType determination with multiple fallbacks
  let planType = urlPlanType || sessionPlanType;
  
  // Additional fallbacks when planType is not available
  if (!planType && user) {
    // Try to determine from onboarding progress
    if (user.onboardingProgress?.includes('company')) planType = 'company';
    else if (user.onboardingProgress?.includes('complex')) planType = 'complex';
    else if (user.subscriptionId || user.organizationId || user.clinicId) planType = 'clinic';
    
    // Check sessionStorage for onboarding data as final fallback
    if (!planType && typeof window !== 'undefined') {
      try {
        const onboardingData = sessionStorage.getItem('onboardingData');
        if (onboardingData) {
          const parsed = JSON.parse(onboardingData);
          if (parsed.organizationType) {
            planType = parsed.organizationType as PlanType;
          }
        }
      } catch (error) {
        console.log('Could not parse sessionStorage data:', error);
      }
    }
  }

  // Redirect to new setup flow
  useEffect(() => {
    if (planType) {
      console.log('🔄 Redirecting to new setup flow...');
      router.push(`/onboarding/setup?plan=${planType}`);
      return;
    }
  }, [planType, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = `/onboarding/setup${planType ? `?plan=${planType}` : ''}`;
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isLoading, isAuthenticated, router, planType]);

  // Redirect if user has already completed setup
  useEffect(() => {
    if (user?.setupComplete) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <Card className="border-2 border-[#00b48d]">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#00b48d]" />
            <h3 className="text-lg font-medium mb-2 text-[#414651]">Loading Setup...</h3>
            <p className="text-sm text-[#717680]">
              Please wait while we prepare your onboarding experience.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You need to be logged in to access the setup wizard.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if user role is not owner
  if (user && user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Only organization owners can access the setup wizard. 
              Your current role: <strong>{user.role}</strong>
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no plan type specified
  if (!planType) {
    console.log('❌ Setup: No plan type found. Debug info:', {
      urlPlanType,
      sessionPlanType: user?.planType,
      userHasSubscription: !!user?.subscriptionId,
      userHasOrg: !!user?.organizationId,
      userOnboardingProgress: user?.onboardingProgress,
      fullUser: user
    });

    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-medium mb-2">Plan Selection Required</h3>
            <div className="text-sm text-muted-foreground mb-4">
              {user?.subscriptionId ? (
                <>
                  <p>We found your subscription but couldn't determine your plan type.</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Subscription ID: {user.subscriptionId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This usually resolves itself on the next login. Please try refreshing the page.
                  </p>
                </>
              ) : (
                <p>Please select a subscription plan before proceeding with the setup.</p>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/onboarding/plan-selection')}
                className="bg-[#e1edfb] text-[#69a3e9] border-[#69a3e9] hover:bg-[#d4e6f7]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Choose Your Plan
              </Button>
              {user?.subscriptionId && (
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-[#00b48d] hover:bg-[#00a080] text-white"
                >
                  Refresh Page
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validate plan type
  const validPlanTypes: PlanType[] = ['company', 'complex', 'clinic'];
  if (!validPlanTypes.includes(planType)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Invalid Plan Type</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The specified plan type "{planType}" is not valid. 
              Please select a valid plan.
            </p>
            <Button onClick={() => router.push('/onboarding/plan-selection')}>
              Choose Your Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOnboardingComplete = async (data: OnboardingData) => {
    console.log('Onboarding completed with data:', data);
    
    try {
      console.log('Setup completed for plan type:', planType);
      console.log('Organization:', data.organizationName);
      
      // Redirect to our new setup forms instead of dashboard
      router.push(`/onboarding/setup?plan=${planType}`);
    } catch (error) {
      console.error('Setup completion failed:', error);
      // Handle error - show toast or error message
    }
  };

  const handleBack = () => {
    // Navigate back to plan selection
    router.push('/onboarding/plan-selection');
  };

  // Get subscription ID from user or URL params
  const subscriptionId = user?.subscriptionId || 'temp-subscription-id';

  return (
    <OnboardingFlow
      subscriptionId={subscriptionId}
      planType={planType}
      onComplete={handleOnboardingComplete}
      onBack={handleBack}
    />
  );
} 


export default function SetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SetupPageContent />
    </Suspense>
  );
}

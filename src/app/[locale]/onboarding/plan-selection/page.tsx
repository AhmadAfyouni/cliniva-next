'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { PlanType } from '@/types/onboarding/common';
import { useSubscriptionPlans, SubscriptionPlan } from '@/hooks/api/useSubscriptionPlans';
import { useTheme } from 'next-themes';
import { designSystem } from '@/lib/design-system';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Fallback plans in case API is not available - matching Figma design
const fallbackPlans: SubscriptionPlan[] = [
  {
    _id: '1',
    name: 'Company Plan',
    type: 'company',
    price: 299,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Centralized admin and reporting',
      'Multi-location support',
      'Role hierarchy across all levels'
    ],
    limitations: ['Unlimited organizations', 'Up to 50 complexes'],
    isActive: true,
    isPopular: false,
    description: 'Manage a network of multiple medical complexes, each with its own departments and clinics'
  },
  {
    _id: '2', 
    name: 'Complex Plan',
    type: 'complex',
    price: 149,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Localized administration',
      'Department-based control',
      'Full visibility over all clinics'
    ],
    limitations: ['Single complex', 'Up to 10 clinics'],
    isActive: true,
    description: 'Manage a single complex that contains various departments and clinics under one roof'
  },
  {
    _id: '3',
    name: 'Single Clinic Plan', 
    type: 'clinic',
    price: 49,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Minimal setup',
      'Quick onboarding',
      'Direct management by the clinic owner or manager'
    ],
    limitations: ['Single clinic only', 'Up to 3 staff members'],
    isActive: true,
    description: 'A simplified setup for managing one independent clinic with no additional branches or departments'
  }
];

function PlanSelectionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark';
  const isDark = currentTheme === 'dark';
  
  // Translations and RTL support
  const t = useTranslations();
  const locale = searchParams.get('locale') || 'en';
  const isRTL = locale === 'ar';
  
  // Ensure theme exists in design system, fallback to light if not
  const safeTheme = designSystem.themes[currentTheme] ? currentTheme : 'light';
  const colors = designSystem.themes[safeTheme];
  
  // Fetch plans from API
  const { data: plansData, isLoading, error, isError } = useSubscriptionPlans();

  // Transform API data to match our component structure
  const transformPlan = (plan: SubscriptionPlan) => ({
    id: plan.type as PlanType,
    _id: plan._id, // Include the database ID for API calls
    title: `${plan.name}`,
    description: plan.description || getDefaultDescription(plan.type),
    features: plan.features || getDefaultFeatures(plan.type),
    price: plan.price,
    currency: plan.currency,
    billingPeriod: plan.billingPeriod,
    isPopular: plan.isPopular,
    limitations: plan.limitations,
  });

  // Default descriptions for fallback - matching Figma design
  const getDefaultDescription = (type: string) => {
    const descriptions = {
      company: "Manage a network of multiple medical complexes, each with its own departments and clinics",
      complex: "Manage a single complex that contains various departments and clinics under one roof", 
      clinic: "A simplified setup for managing one independent clinic with no additional branches or departments"
    };
    return descriptions[type as keyof typeof descriptions] || "Professional healthcare management solution";
  };

  // Default features for fallback - matching Figma design
  const getDefaultFeatures = (type: string) => {
    const features = {
      company: ["Centralized admin and reporting", "Multi-location support", "Role hierarchy across all levels"],
      complex: ["Localized administration", "Department-based control", "Full visibility over all clinics"],
      clinic: ["Minimal setup", "Quick onboarding", "Direct management by the clinic owner or manager"]
    };
    return features[type as keyof typeof features] || ["Professional features", "24/7 support", "Secure platform"];
  };

  // Use API data if available, otherwise fallback to hardcoded plans
  const rawPlans = plansData?.length ? plansData : (isError ? fallbackPlans : []);
  const plans = rawPlans.filter(plan => plan.isActive).map(transformPlan);

  const handlePlanSelect = (planType: PlanType) => {
    setSelectedPlan(planType);
    
    // Store plan selection in sessionStorage for later use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedPlanType', planType);
      
      // Also store the full plan data for reference
      const selectedPlanData = plans.find(p => p.id === planType);
      if (selectedPlanData) {
        sessionStorage.setItem('selectedPlanData', JSON.stringify(selectedPlanData));
      }
    }
    
    // Navigate to owner registration with selected plan
    router.push(`/onboarding/register?planType=${planType}&planId=${plans.find(p => p.id === planType)?._id || ''}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{ backgroundColor: colors.background.primary }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-48 h-48 opacity-40">
          <div 
            className="w-full h-full rounded-br-full transform -translate-x-12 -translate-y-12 blur-[500px]"
            style={{ backgroundColor: designSystem.colors.secondary[50] }}
          ></div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-40">
          <div 
            className="w-full h-full rounded-bl-full transform translate-x-8 -translate-y-8 blur-[500px]"
            style={{ backgroundColor: designSystem.colors.primary[50] }}
          ></div>
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 
              className="w-12 h-12 animate-spin mx-auto mb-4" 
              style={{ color: designSystem.colors.secondary[500] }}
            />
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: colors.text.primary }}
            >
              Loading Plans...
            </h2>
            <p style={{ color: colors.text.secondary }}>
              Please wait while we fetch your subscription options
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show fallback notice if using fallback data
  const showFallbackNotice = isError && plans.length > 0;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Decorative background elements - matching Figma */}
      <div className="absolute top-0 left-0 w-[654px] h-[654px] opacity-40">
        <div 
          className="w-full h-full rounded-full transform -translate-x-[111px] -translate-y-[84px] blur-[500px]"
          style={{ backgroundColor: designSystem.colors.secondary[50] }}
        ></div>
      </div>
      <div className="absolute top-[357px] right-0 w-[692px] h-[669px] opacity-40">
        <div 
          className="w-full h-full rounded-full transform translate-x-[1030px] blur-[500px]"
          style={{ backgroundColor: designSystem.colors.secondary[50] }}
        ></div>
      </div>
      <div className="absolute top-[10px] left-[73px] w-[135px] h-[135px] opacity-50">
        <div 
          className="w-full h-full rounded-full"
          style={{ backgroundColor: designSystem.colors.primary[50] }}
        ></div>
      </div>
      <div className="absolute top-[79px] right-[1269px] w-[69px] h-[69px] opacity-50">
        <div 
          className="w-full h-full rounded-full"
          style={{ backgroundColor: designSystem.colors.primary[50] }}
        ></div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Fallback notice */}
        {showFallbackNotice && (
          <div className="max-w-4xl mx-auto mb-8">
            <div 
              className="border rounded-lg p-4 text-center"
              style={{
                backgroundColor: safeTheme === 'dark' ? designSystem.colors.warning[900] + '33' : designSystem.colors.warning[50],
                borderColor: safeTheme === 'dark' ? designSystem.colors.warning[700] : designSystem.colors.warning[200],
              }}
            >
              <AlertTriangle 
                className="w-5 h-5 inline-block mr-2" 
                style={{ color: designSystem.colors.warning[600] }}
              />
              <span 
                className="text-sm"
                style={{ 
                  color: safeTheme === 'dark' ? designSystem.colors.warning[400] : designSystem.colors.warning[800] 
                }}
              >
                Unable to load plans from server. Showing sample plans for demonstration.
              </span>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mb-8`}>
          <ThemeToggle />
        </div>

        {/* Header Section - matching Figma */}
        <div className={`text-center mb-10 ${isRTL ? 'text-right' : ''}`}>
          <h1 
            className="text-[48px] font-bold leading-[1.2] tracking-[-0.02em] mb-4"
            style={{ 
              color: colors.primary.default,
              fontFamily: designSystem.typography.fontFamily.sans.join(', ')
            }}
          >
            {t('onboarding.planSelection.title')}
          </h1>
          <p 
            className="text-[20px] font-semibold leading-[1.14] max-w-[852px] mx-auto"
            style={{ 
              color: colors.text.tertiary,
              fontFamily: designSystem.typography.fontFamily.sans.join(', ')
            }}
          >
            {t('onboarding.planSelection.subtitle')}
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center">
            <AlertTriangle 
              className="w-12 h-12 mx-auto mb-4" 
              style={{ color: designSystem.colors.warning[500] }}
            />
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: colors.text.primary }}
            >
              No Plans Available
            </h2>
            <p 
              className="mb-6"
              style={{ color: colors.text.secondary }}
            >
              We couldn't load any subscription plans. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-white"
              style={{ 
                backgroundColor: designSystem.colors.secondary[500]
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.secondary[600]}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.secondary[500]}
            >
              Reload Page
            </button>
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center gap-12 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`rounded-[20px] p-[30px] pb-[30px] flex flex-col gap-8 w-[308px] h-[400px] transition-all duration-200 hover:shadow-lg relative ${
                  selectedPlan === plan.id 
                    ? 'shadow-lg scale-105' 
                    : 'hover:scale-102'
                }`}
                style={{
                  backgroundColor: colors.surface.primary,
                  border: `1px solid ${designSystem.colors.secondary[500]}`,
                }}
              >
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center gap-5">
                  <h2 className={`text-[30px] font-bold leading-[1.2] text-center ${
                    plan.id === 'company' 
                      ? (isDark ? 'text-white' : 'text-[#5a5a5a]')
                      : plan.id === 'complex'
                      ? (isDark ? 'text-white' : 'text-[#414651]')
                      : (isDark ? 'text-white' : 'text-[#5a5a5a]')
                  }`}>
                    {plan.title}
                  </h2>
                  <p className={`text-[14px] font-medium leading-[1.2] text-center ${
                    plan.id === 'company' 
                      ? 'w-[207px]' 
                      : plan.id === 'complex'
                      ? 'w-[218px]'
                      : 'w-[220px]'
                  } ${isDark ? 'text-gray-400' : 'text-[#717680]'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Divider */}
                <div className={`w-full h-px ${isDark ? 'bg-gray-600' : 'bg-[#717680]'}`}></div>

                {/* Features Section */}
                <div className="flex flex-col gap-5 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-[7px]">
                      <div className="flex-shrink-0 w-[18px] h-[18px] bg-[#00b48d] rounded-full flex items-center justify-center">
                        <Check className="w-2 h-1.5 text-white stroke-2" />
                      </div>
                      <span className={`text-[14px] font-normal leading-[1.2] ${
                        featureIndex === 0 && (plan.id === 'company' || plan.id === 'clinic')
                          ? (isDark ? 'text-gray-300' : 'text-[#414651]')
                          : (isDark ? 'text-gray-300' : 'text-[#414651]')
                      } ${
                        plan.id === 'clinic' && featureIndex === 2 
                          ? 'text-left w-[222px]'
                          : 'text-center'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className="w-[248px] h-[48px] bg-[#00b48d] hover:bg-[#00a080] rounded-[19px] px-[10.5px] py-[10.5px] flex items-center justify-center gap-2 transition-colors duration-200 mx-auto"
                >
                  <span className="text-[16px] font-bold leading-[1.24] text-[#fafaf8]">
                    {t('onboarding.planSelection.chooseThisPlan')}
                  </span>
                  <ArrowRight className="w-[17px] h-0 stroke-[1.5px] text-[#fafaf8]" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Back button */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.back()}
            className={`font-medium transition-colors duration-200 ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-[#717680] hover:text-[#414651]'
            }`}
          >
            {isRTL ? '→' : '←'} {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanSelectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PlanSelectionPageContent />
    </Suspense>
  );
} 
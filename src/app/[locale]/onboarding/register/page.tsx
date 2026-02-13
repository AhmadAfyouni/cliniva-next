'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, OnboardingData } from '@/hooks/useRegister';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeftIcon, ArrowRightIcon, LoaderIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';
import { useTheme } from 'next-themes';
import { designSystem } from '@/lib/design-system';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const createRegistrationSchema = (t: any) => z.object({
  firstName: z.string().min(2, t('errors.firstNameMin')),
  lastName: z.string().min(2, t('errors.lastNameMin')),
  email: z.string().email(t('errors.emailInvalid')),
  password: z
    .string()
    .min(8, t('errors.passwordMin'))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      t('errors.passwordComplex')
    ),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('errors.passwordMismatch'),
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<ReturnType<typeof createRegistrationSchema>>;

interface RegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'owner';
  phone?: string;
  gender?: string;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  planType: 'company' | 'complex' | 'clinic';
  description?: string;
}

// Remove these functions as we'll use the useRegister hook

function RegisterPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  
  const planType = searchParams.get('planType') as 'company' | 'complex' | 'clinic';
  const planId = searchParams.get('planId');
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { registerWithOnboarding, loading } = useRegister();
  
  // Translations
  const t = useTranslations();
  const isRTL = locale === 'ar';
  
  // Theme support
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark';
  const safeTheme = designSystem.themes[currentTheme] ? currentTheme : 'light';
  const colors = designSystem.themes[safeTheme];

  useEffect(() => {
    // Retrieve selected plan from localStorage
    const storedPlan = localStorage.getItem('selectedPlan');
    if (storedPlan) {
      try {
        const plan = JSON.parse(storedPlan);
        setSelectedPlan(plan);
      } catch (error) {
        console.error('Error parsing stored plan:', error);
      }
    }

    // If no plan is found in localStorage or URL params, redirect back
    if (!planType || !planId) {
      toast.error(t('errors.selectPlanFirst'));
      router.push(`/${locale}/onboarding/plan-selection`);
    }
  }, [planType, planId, router, locale]);

  const registrationSchema = createRegistrationSchema(t);
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  // Remove the mutation as we'll handle it in onSubmit directly

  const onSubmit = async (data: RegistrationFormData) => {
    if (!planType || !planId) {
      toast.error(t('errors.planMissing'));
      return;
    }

    try {
      const onboardingData: OnboardingData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        planId: planId,
        organizationType: planType,
        organizationName: `${data.firstName} ${data.lastName}'s ${planType}`, // Default name
        organizationDescription: `${planType} managed by ${data.firstName} ${data.lastName}`,
      };

      await registerWithOnboarding(onboardingData);
      toast.success(t('errors.accountCreated'));
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      if (error.message.includes('already exists')) {
        toast.error(t('errors.emailExists'));
        form.setError('email', { message: t('errors.emailExists') });
      } else {
        toast.error(error.message || t('errors.registrationFailed'));
      }
    }
  };

  const handleGoBack = () => {
    router.push(`/${locale}/onboarding/plan-selection`);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        backgroundColor: colors.background.primary,
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      {/* Decorative background elements - matching design system */}
      <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-[400px] h-[400px] opacity-30`}>
        <div 
          className={`w-full h-full rounded-full transform ${isRTL ? 'translate-x-[100px]' : '-translate-x-[100px]'} -translate-y-[100px] blur-[400px]`}
          style={{ backgroundColor: designSystem.colors.secondary[50] }}
        ></div>
      </div>
      <div className={`absolute top-[200px] ${isRTL ? 'left-0' : 'right-0'} w-[300px] h-[300px] opacity-30`}>
        <div 
          className={`w-full h-full rounded-full transform ${isRTL ? '-translate-x-[150px]' : 'translate-x-[150px]'} blur-[400px]`}
          style={{ backgroundColor: designSystem.colors.primary[50] }}
        ></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          {/* Top Bar with Back Button and Theme Toggle */}
          <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{ 
                color: colors.text.secondary,
                backgroundColor: colors.surface.secondary 
              }}
            >
              {isRTL ? (
                <ArrowRightIcon className="w-4 h-4" />
              ) : (
                <ArrowLeftIcon className="w-4 h-4" />
              )}
              {t('common.back')}
            </Button>
            
            <ThemeToggle />
          </div>
          
          {/* Title and Subtitle */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ 
                color: colors.text.primary,
                fontFamily: designSystem.typography.fontFamily.sans.join(', ')
              }}
            >
              {t('onboarding.register.title')}
            </h1>
            <p style={{ color: colors.text.secondary }}>
              {t('onboarding.register.subtitle', { 
                planName: selectedPlan?.name || t(`onboarding.planNames.${planType}`) || planType 
              })}
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          {/* Selected Plan Info */}
          {selectedPlan && (
            <Card 
              className="mb-6 shadow-md"
              style={{ 
                backgroundColor: colors.surface.secondary,
                borderColor: colors.border.medium 
              }}
            >
              <CardContent className="p-4">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h3 
                      className="font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      {selectedPlan.name || t(`onboarding.planNames.${planType}`) || planType}
                    </h3>
                    <p 
                      className="text-sm capitalize"
                      style={{ color: colors.text.secondary }}
                    >
                      {t(`onboarding.planNames.${selectedPlan.planType || planType}`) || selectedPlan.planType || planType}
                    </p>
                  </div>
                  <div style={{ color: designSystem.colors.secondary[500] }}>
                    ✓ {t('onboarding.register.planSelected')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registration Form */}
          <Card 
            className="shadow-lg"
            style={{ 
              backgroundColor: colors.surface.primary,
              borderColor: colors.border.light 
            }}
          >
            <CardHeader>
              <CardTitle 
                className="text-center"
                style={{ color: colors.text.primary }}
              >
                {t('onboarding.register.ownerAccountRegistration')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isRTL ? 'text-right' : 'text-left'}>
                            {t('onboarding.register.firstName')} {t('onboarding.register.required')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('onboarding.register.firstNamePlaceholder')} 
                              className={isRTL ? 'text-right' : 'text-left'}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isRTL ? 'text-right' : 'text-left'}>
                            {t('onboarding.register.lastName')} {t('onboarding.register.required')}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('onboarding.register.lastNamePlaceholder')} 
                              className={isRTL ? 'text-right' : 'text-left'}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isRTL ? 'text-right' : 'text-left'}>
                          {t('onboarding.register.email')} {t('onboarding.register.required')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder={t('onboarding.register.emailPlaceholder')} 
                            className={isRTL ? 'text-right' : 'text-left'}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isRTL ? 'text-right' : 'text-left'}>
                          {t('onboarding.register.phone')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder={t('onboarding.register.phonePlaceholder')} 
                            className={isRTL ? 'text-right' : 'text-left'}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isRTL ? 'text-right' : 'text-left'}>
                          {t('onboarding.register.gender')}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                              <SelectValue placeholder={t('onboarding.register.genderPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t('onboarding.register.genderMale')}</SelectItem>
                            <SelectItem value="female">{t('onboarding.register.genderFemale')}</SelectItem>
                            <SelectItem value="other">{t('onboarding.register.genderOther')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isRTL ? 'text-right' : 'text-left'}>
                          {t('onboarding.register.password')} {t('onboarding.register.required')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder={t('onboarding.register.passwordPlaceholder')}
                              className={isRTL ? 'text-right pr-10' : 'text-left pr-10'}
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full px-3`}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isRTL ? 'text-right' : 'text-left'}>
                          {t('onboarding.register.confirmPassword')} {t('onboarding.register.required')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder={t('onboarding.register.confirmPasswordPlaceholder')}
                              className={isRTL ? 'text-right pr-10' : 'text-left pr-10'}
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full px-3`}
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Requirements */}
                  <div 
                    className={`text-xs p-3 rounded ${isRTL ? 'text-right' : 'text-left'}`}
                    style={{ 
                      color: colors.text.tertiary,
                      backgroundColor: colors.surface.secondary 
                    }}
                  >
                    {t('onboarding.register.passwordRequirements')}
                    <ul className={`mt-1 ${isRTL ? 'mr-4 list-disc' : 'ml-4 list-disc'}`}>
                      <li>{t('onboarding.register.passwordReq1')}</li>
                      <li>{t('onboarding.register.passwordReq2')}</li>
                      <li>{t('onboarding.register.passwordReq3')}</li>
                      <li>{t('onboarding.register.passwordReq4')}</li>
                      <li>{t('onboarding.register.passwordReq5')}</li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className={`w-full text-white font-semibold transition-colors duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
                    style={{ 
                      backgroundColor: designSystem.colors.secondary[500] 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.secondary[600]}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.secondary[500]}
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <LoaderIcon className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('onboarding.register.creatingAccount')}
                      </>
                    ) : (
                      <>
                        {t('onboarding.register.createAccount')}
                        {isRTL ? (
                          <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        ) : (
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        )}
                      </>
                    )}
                  </Button>

                  <p 
                    className="text-xs text-center"
                    style={{ color: colors.text.tertiary }}
                  >
                    {t('onboarding.register.termsAgreement')}
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
} 
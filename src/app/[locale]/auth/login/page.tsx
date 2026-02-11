"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/lib/validation/auth";
import FieldInput from "@/components/global/FieldInput";
import { Form } from "@/components/ui/form";
import FieldCheckbox from "@/components/global/FieldCheckbox";
import { toast } from "sonner";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const { login, redirectBasedOnRole } = useAuth();

  const form = useForm<z.infer<typeof LoginSchema>>({
    defaultValues: { email: "", password: "", rememberMe: false },
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);

      if (result?.ok) {
        // Wait a moment for session to update, then redirect based on role and plan status
        setTimeout(() => {
          window.location.reload(); // Force reload to get updated session, then OnboardingRouter will handle redirect
        }, 1000);
      } else {
        toast.error(t("errors.invalidCredentials"));
      }
    } catch (error: any) {
      toast.error(error.message || t("errors.networkError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden flex-col lg:flex-row">
      {/* Theme Switcher and Language Switcher - Position based on LTR/RTL */}
      <div className="absolute top-4 lg:top-8 z-10 flex gap-3 lg:gap-4 ltr:right-4 rtl:left-4 lg:ltr:right-8 lg:rtl:left-8">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      {/* Left Side - Branding */}
      <div
        className={`w-full lg:w-1/2 bg-primary dark:bg-primary/90 relative flex items-center justify-center min-h-[50vh] lg:min-h-screen ${
          locale === "ar" ? "lg:rounded-l-[48px]" : "lg:rounded-r-[48px]"
        }`}
      >
        {/* Decorative Elements - Hidden on mobile */}
        <div className="absolute top-[754px] left-[570px] hidden xl:block">
          <svg
            width="146"
            height="146"
            viewBox="0 0 146 146"
            fill="none"
            className="opacity-25"
          >
            <path
              d="M73 0L83.3771 0C87.7114 32.5309 113.469 58.2887 146 62.623L146 73L73 73L73 0ZM0 73L73 73L73 146L63.2667 146L63.2667 141.134C63.2667 108.88 37.1198 82.7334 4.86633 82.7334L0 82.7334L0 73Z"
              fill="#FAF6F5"
              fillOpacity="0.25"
            />
          </svg>
        </div>

        <div className="absolute top-[543px] left-[-145.84px] hidden xl:block">
          <svg
            width="399.25"
            height="399.25"
            viewBox="0 0 399.25 399.25"
            fill="none"
            className="opacity-25"
          >
            <path
              d="M199.625 0C308.785 0 397.25 88.465 397.25 306.785 308.785 395.25 199.625 395.25C90.465 395.25 2 306.785 2 197.625C2 88.465 90.465 0 199.625 0ZM199.625 99.3125C248.495 99.3125 288.125 138.942 288.125 187.8125C288.125 236.682 248.495 276.3125 199.625 276.3125C150.755 276.3125 111.125 236.682 111.125 187.8125C111.125 138.942 150.755 99.3125 199.625 99.3125Z"
              fill="#FAF6F5"
              fillOpacity="0.25"
            />
          </svg>
        </div>

        <div className="absolute top-0 left-[620px] hidden xl:block">
          <svg
            width="127.26"
            height="127.26"
            viewBox="0 0 127.26 127.26"
            fill="none"
            className="opacity-25"
          >
            <path
              d="M63.63 0C98.94 0 127.26 28.32 127.26 63.63C127.26 98.94 98.94 127.26 63.63 127.26C28.32 127.26 0 98.94 0 63.63C0 28.32 28.32 0 63.63 0Z"
              fill="#DEFFF8"
              fillOpacity="0.25"
            />
          </svg>
        </div>

        {/* Brand Content */}
        <div className="flex flex-col items-center gap-8 lg:gap-16 w-full max-w-[398px] z-10 px-8 lg:px-0">
          <div className="text-center">
            <div className="mx-auto mb-4 lg:mb-8">
              <svg
                width="64"
                height="64"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="lg:w-24 lg:h-24"
              >
                <path
                  d="M96 48V54.8232C74.6098 57.6732 57.6732 74.6098 54.8232 96H48V48H96ZM48 0V48H0V41.5996H3.2002C24.4078 41.5995 41.5995 24.4078 41.5996 3.2002V0H48Z"
                  fill="#FAF6F5"
                />
              </svg>
            </div>
            <h1 className="text-primary-foreground text-3xl lg:text-[48px] font-semibold leading-none tracking-tight font-inter">
              {t("branding.systemName")}
            </h1>
            <p className="text-primary-foreground/90 text-sm lg:text-xl font-medium mt-2 lg:mt-4 font-inter leading-relaxed">
              {t("branding.welcomeTitle")}
              <br className="hidden lg:block" />
              {t("branding.welcomeSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 lg:px-16 bg-background min-h-[50vh] lg:min-h-screen">
        <div className="w-full max-w-[422px]">
          <div className="mb-8 lg:mb-12">
            <h2 className="text-primary text-2xl lg:text-[36px] font-semibold text-center mb-2 font-lato leading-tight">
              {t("auth.loginTitle")}
            </h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldInput
                name="email"
                label={t("auth.email")}
                type="email"
                control={form.control}
                placeholder={t("auth.enterUsername")}
                required={true}
                icon={
                  <User
                    className="h-[18px] w-[18px] text-primary"
                    strokeWidth={1.5}
                  />
                }
              />
              <FieldInput
                name="password"
                label={t("auth.password")}
                type="password"
                control={form.control}
                placeholder={t("auth.enterPassword")}
                required={true}
                icon={
                  <Lock
                    className="h-[18px] w-[18px] text-primary"
                    strokeWidth={1.5}
                  />
                }
              />
              <div className="flex items-center justify-between">
                <FieldCheckbox
                  name="rememberMe"
                  label={t("auth.rememberMe")}
                  control={form.control}
                />

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-primary hover:text-primary/80 font-lato"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] bg-[#00B48D] hover:bg-[#009B7D] text-white font-semibold text-lg font-lato rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    {t("common.loading")}
                  </>
                ) : (
                  t("auth.logIn")
                )}
              </Button>
            </form>
          </Form>

          {/* Get Started Section - Figma Design */}
          <div className="mt-12 lg:mt-16 text-center">
            <p className="text-muted-foreground text-sm lg:text-base font-lato leading-relaxed max-w-md mx-auto mb-8">
              {t("auth.noAccount")} {t("home.startOrganization")}.
            </p>

            {/* Get Started Button - Exact Figma Design with System Colors */}
            <div className="flex justify-center">
              <div className="relative w-[268px] h-[60px] bg-primary hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer overflow-hidden">
                <Link
                  href="/onboarding/plan-selection"
                  className="block w-full h-full relative"
                >
                  {/* Star Icon - Exact Figma positioning */}
                  <div className="absolute left-0 top-0 w-[60px] h-[60px] flex items-center justify-center">
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                      <defs>
                        <linearGradient
                          id="starGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            style={{
                              stopColor: "hsl(var(--primary-foreground))",
                              stopOpacity: 0.8,
                            }}
                          />
                          <stop
                            offset="100%"
                            style={{
                              stopColor: "hsl(var(--primary-foreground))",
                              stopOpacity: 0.4,
                            }}
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M15 0L18.3677 11.6323H30L20.4593 18.3677L23.8269 30L15 23.2644L6.17308 30L9.54069 18.3677L0 11.6323H11.6323L15 0Z"
                        fill="url(#starGradient)"
                      />
                    </svg>
                  </div>
                  {/* Text - Exact Figma styling: x:84px, y:8px, w:184px, h:43px */}
                  <div className="absolute left-[84px] top-[8px] w-[184px] h-[43px] flex items-center justify-center">
                    <span className="text-[24px] font-lato font-semibold text-primary-foreground leading-[1.2] text-center">
                      {t("common.getStarted")}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

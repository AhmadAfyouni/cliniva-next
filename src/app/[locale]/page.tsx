"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LanguageSwitcher, {
  FloatingLanguageSwitcher,
} from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();
  const { user, isLoading, redirectBasedOnRole } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users to their dashboard
      redirectBasedOnRole(user);
    }
  }, [user, isLoading, redirectBasedOnRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 dark:from-background dark:via-background dark:to-background">
      {/* Floating Language Switcher */}
      <FloatingLanguageSwitcher />

      {/* Header */}
      <div className="bg-background shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <svg
                width="48"
                height="48"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M96 48V54.8232C74.6098 57.6732 57.6732 74.6098 54.8232 96H48V48H96ZM48 0V48H0V41.5996H3.2002C24.4078 41.5995 41.5995 24.4078 41.5996 3.2002V0H48Z"
                  fill="#69a3e9"
                />
              </svg>
              <h1 className="text-3xl font-bold text-[#69a3e9]">
                {t("home.title")}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Link
                href="/auth/login"
                className="text-[#69a3e9] hover:text-blue-600 font-medium transition-colors"
              >
                {t("common.signIn")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-bold text-[#69a3e9] mb-6 leading-tight">
            {t("home.heroTitle")}
            <br />
            <span className="text-foreground">{t("home.heroSubtitle")}</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            {t("home.heroDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="bg-[#69a3e9] hover:bg-[#4a8ce0] text-white font-semibold px-10 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Link href="/onboarding/plan-selection">
                {t("home.startOrganization")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white hover:bg-gray-50 text-[#69a3e9] border-2 border-[#69a3e9] font-semibold px-10 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Link href="/auth/register">{t("home.registerPatient")}</Link>
            </Button>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow duration-300 text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-[#69a3e9]/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-[#69a3e9]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {t("home.singleClinics")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.singleClinicsDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300 text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-[#69a3e9]/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-[#69a3e9]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {t("home.medicalComplexes")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.medicalComplexesDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300 text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-[#69a3e9]/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-[#69a3e9]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {t("home.healthcareCompanies")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.healthcareCompaniesDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center py-16 bg-[#69a3e9]/5 rounded-2xl">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            {t("home.readyToTransform")}
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.joinThousands")}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#69a3e9] hover:bg-[#4a8ce0] text-white font-semibold px-10 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Link href="/onboarding/plan-selection">
              {t("home.getStartedToday")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

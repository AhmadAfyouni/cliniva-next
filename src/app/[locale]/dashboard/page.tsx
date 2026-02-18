"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  SettingsIcon,
  UsersIcon,
  BuildingIcon,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem("onboardingUserData");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Verify authentication
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push(`/${locale}/auth/login`);
      return;
    }
  }, [router, locale]);

  const handleStartOver = () => {
    // Clear onboarding data
    localStorage.removeItem("onboardingUserData");
    localStorage.removeItem("onboardingFormData");
    localStorage.removeItem("completedOnboardingSteps");
    localStorage.removeItem("selectedPlan");

    // Redirect to onboarding
    router.push(`/${locale}/onboarding`);
  };

  const handleContinueSetup = () => {
    // Navigate back to setup if user wants to continue
    router.push(
      `/${locale}/onboarding/setup?planType=${userData?.planType}&step=1`,
    );
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Please wait...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Onboarding Complete!
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Congratulations! You've successfully completed the onboarding
            process for your {userData.planType} plan.
          </p>
        </div>

        {/* Success Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-green-700">
                Welcome to Cliniva!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <UsersIcon className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">
                    Account Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {userData.firstName} {userData.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {userData.email}
                  </div>
                  <div>
                    <span className="font-medium">Plan Type:</span>{" "}
                    <span className="capitalize font-medium text-green-700">
                      {userData.planType}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> Organization
                    Owner
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BuildingIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">What's Next?</h3>
                </div>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Your account has been created and is ready to use
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Your {userData.planType} setup has been initialized
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <SettingsIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      You can now access your dashboard and start managing your
                      organization
                    </span>
                  </div>
                </div>
              </div>

              {/* Completion Message */}
              <div className="text-center py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎉 Setup Complete!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your Cliniva system is now ready for use. You can start
                  managing your{" "}
                  {userData.planType === "company"
                    ? "organization, complexes, and clinics"
                    : userData.planType === "complex"
                      ? "complex and clinics"
                      : "clinic"}
                  .
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() =>
                      (window.location.href = `/${locale}/main-dashboard`)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    size="lg"
                  >
                    Go to Dashboard
                  </Button>

                  <Button
                    onClick={handleContinueSetup}
                    variant="outline"
                    className="px-8 py-3"
                    size="lg"
                  >
                    Continue Setup
                  </Button>
                </div>
              </div>

              {/* Debug Options */}
              <div className="border-t pt-6">
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700 mb-2">
                    Debug Options (Development)
                  </summary>
                  <div className="space-y-2">
                    <Button
                      onClick={handleStartOver}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Start Onboarding Over
                    </Button>
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                      <strong>Stored Data:</strong>
                      <pre className="mt-1 overflow-auto max-h-32">
                        {JSON.stringify(userData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

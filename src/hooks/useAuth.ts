import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = useMemo(() => session?.user, [session]);
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session;

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error: any) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/auth/login" });
  }, []);

  const redirectBasedOnRole = useCallback(
    (user: any) => {
      if (!user) return;

      const { role, setupComplete, subscriptionId, planType, organizationId } =
        user;
      console.log(role);

      switch (role) {
        case "owner":
          if (!setupComplete) {
            // Check if owner has selected a plan
            const hasSubscription = !!(subscriptionId || organizationId);
            const hasSelectedPlan = !!(subscriptionId || planType);

            if (hasSubscription || hasSelectedPlan) {
              // Owner has a plan, redirect to setup with plan type
              const finalPlanType = planType || "clinic";
              console.log(
                "🚀 useAuth: Redirecting owner to setup with plan:",
                finalPlanType,
              );
              router.push(`/setup?plan=${finalPlanType}`);
            } else {
              // Owner has no plan, redirect to plan selection
              console.log(
                "📋 useAuth: Owner has no plan, redirecting to plan selection",
              );
              router.push("/onboarding/plan-selection");
            }
          } else {
            router.push("/dashboard/user");
          }
          break;
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "patient":
          router.push("/dashboard/patient");
          break;
        case "doctor":
          router.push("/dashboard/doctor");
          break;
        case "staff":
          router.push("/dashboard/staff");
          break;
        default:
          router.push("/dashboard");
          break;
      }
    },
    [router],
  );

  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!user?.role) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user],
  );

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;

      // Add permission logic based on role
      const rolePermissions: Record<string, string[]> = {
        super_admin: ["*"], // All permissions
        owner: [
          "manage_organization",
          "manage_users",
          "view_reports",
          "manage_settings",
        ],
        admin: ["manage_users", "view_reports", "manage_settings"],
        doctor: ["view_patients", "manage_appointments", "view_reports"],
        staff: ["view_patients", "manage_appointments"],
        patient: ["view_profile", "book_appointments"],
      };

      const userPermissions = rolePermissions[user.role] || [];
      return (
        userPermissions.includes("*") || userPermissions.includes(permission)
      );
    },
    [user],
  );

  return {
    // Session data
    session,
    user,
    isLoading,
    isAuthenticated,

    // Auth methods
    login,
    logout,
    update,

    // Role and permission checking
    hasRole,
    hasPermission,
    redirectBasedOnRole,

    // User properties shortcuts
    isOwner: user?.role === "owner",
    isAdmin: user?.role === "admin",
    isPatient: user?.role === "patient",
    isDoctor: user?.role === "doctor",
    isStaff: user?.role === "staff",
    isSuperAdmin: user?.role === "super_admin",
  };
};

"use client";
import FieldInput from "@/components/global/FieldInput";
import FieldSelect from "@/components/global/FieldSelect";
import { Form } from "@/components/ui/form";
import { useDebounce } from "@/hooks/useDebounced";
import apiClient from "@/lib/axios";
import { Search } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
// import { useRouter } from "next/router";
import React from "react";
import { useForm, useWatch } from "react-hook-form";

export default function UserSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) Read initial values from URL (source of truth)
  const initialSearch = searchParams.get("search") ?? "";
  const initialRole = searchParams.get("role") ?? "";
  const initialStatus = searchParams.get("status") ?? "";
  const initialPage = Number(searchParams.get("page") ?? "1");
  const initialLimit = Number(searchParams.get("limit") ?? "10");

  const form = useForm();

  // 2) Keep form in sync if user navigates back/forward
  // (URL changes but component remains mounted)
  React.useEffect(() => {
    form.reset({
      search: initialSearch,
      role: initialRole,
      status: initialStatus,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearch, initialRole, initialStatus]);

  // 3) Watch form fields
  const search = useWatch({ control: form.control, name: "search" });
  const role = useWatch({ control: form.control, name: "role" });
  const status = useWatch({ control: form.control, name: "status" });

  const debouncedSearch = useDebounce(search, 1000);

  // 4) Form changes -> update URL params (and reset page=1)
  React.useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());

    // update filter params
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");

    if (role) next.set("role", role);
    else next.delete("role");

    if (status) next.set("status", status);
    else next.delete("status");

    // important for pagination: reset page when filters change
    next.set("page", "1");

    // Only replace if something actually changed (prevents loops)
    const nextStr = next.toString();
    const currStr = searchParams.toString();
    if (nextStr !== currStr) {
      router.replace(`${pathname}?${nextStr}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, role, status]);

  const fetchData = async (controller: AbortController) => {
    try {
      const apiParams = new URLSearchParams(searchParams.toString());
      // example endpoint expects the same params
      const response = await apiClient.get(
        `/user-access?${apiParams.toString()}`,
        {
          signal: controller.signal,
        },
      );
      console.log(response.data.pagination);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error(error);
      }
    }
  };

  // 5) URL changes -> fetch data (includes page)
  React.useEffect(() => {
    const controller = new AbortController();
    fetchData(controller);

    return () => controller.abort();
  }, [searchParams]);

  const onSubmit = (data: any) => {};

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex items-center gap-4"
      >
        <FieldInput
          control={form.control}
          name="search"
          placeholder="Search..."
          label="Search"
          hideLabel={true}
          variant="pill"
          icon={
            <Search
              className="h-[18px] w-[18px] text-primary"
              strokeWidth={1.5}
            />
          }
        />
        <FieldSelect
          control={form.control}
          name="role"
          label="Role"
          items={[
            { value: "owner", label: "Owner" },
            { value: "staff", label: "Staff" },
          ]}
          placeholder="Role"
          variant="pill"
          hideLabel={true}
        />
        <FieldSelect
          control={form.control}
          name="status"
          label="Status"
          items={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="Status"
          variant="pill"
          hideLabel={true}
        />
      </form>
    </Form>
  );
}

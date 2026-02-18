"use client";

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AddButton from "@/components/global/Buttons/AddButton";
import { Pencil, Plus, Trash2 } from "lucide-react";
import UserSearchForm from "@/components/pages/dashboard/user/UserSearchForm";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/global/DataTable";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/axios";

type UserRow = {
  no: number;
  userId: string;
  userName: string;
  role: string;
  userType: string;
  active: boolean;
};

const columns: ColumnDef<UserRow>[] = [
  { accessorKey: "no", header: "No.", enableSorting: false },
  { accessorKey: "userId", header: "User ID", enableSorting: false },
  {
    accessorKey: "userName",
    header: "User Name",
    enableSorting: true,
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: true,
  },
  {
    accessorKey: "userType",
    header: "User Type",
    enableSorting: true,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const v = row.original.active;
      return (
        <div className="flex items-center gap-2">
          <Switch checked={v} />
          <span className="text-sm">{v ? "Active" : "Inactive"}</span>
        </div>
      );
    },
  },
  {
    id: "action",
    header: "Action",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

function parseIntSafe(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseSorting(
  params: ReturnType<typeof useSearchParams>,
): SortingState {
  const sortBy = params.get("sortBy");
  const sortDir = params.get("sortDir"); // "asc" | "desc"
  if (!sortBy) return [];
  return [{ id: sortBy, desc: sortDir === "desc" }];
}

function setQuery(
  pathname: string,
  params: URLSearchParams,
  patch: Record<string, string | null>,
) {
  const next = new URLSearchParams(params.toString());
  Object.entries(patch).forEach(([k, v]) => {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  });
  return `${pathname}?${next.toString()}`;
}

export default function OwnerDashboard() {
  const { user } = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ✅ read state from URL
  const pageIndex = Math.max(0, parseIntSafe(searchParams.get("page"), 1) - 1); // url is 1-based
  const pageSize = parseIntSafe(searchParams.get("limit"), 10);
  const sorting = parseSorting(searchParams);
  console.log(pageSize);

  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function fetchData(controller: AbortController) {
    setLoading(true);

    const s = sorting[0];
    const sortBy = s?.id ?? "";
    const sortDir = s?.desc ? "desc" : "asc";

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
    });

    if (sortBy) params.set("sortBy", sortBy);
    if (sortBy) params.set("sortDir", sortDir);

    try {
      const res = await apiClient.get(`/user-access?${params.toString()}`, {
        signal: controller.signal,
      });

      setTotalCount(res.data.pagination.total);
      setData(res.data.data);
      // setData(res.data);
      // setTotalCount(res.meta.total);
      // const res = await fetch(`/api/users?${params.toString()}`, {
      //   signal: controller.signal,
      // });
      // const json = await res.json();
      // setData(json.items);
      // setTotalCount(json.total);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  }

  // ✅ API call on URL state change
  // useEffect(() => {
  //   const controller = new AbortController();

  //   fetchData(controller);
  //   return () => controller.abort();
  // }, [pageIndex, pageSize, sorting]);

  return (
    <ProtectedRoute allowedRoles={["owner"]}>
      <div className="flex justify-between px-6 py-5">
        <div>
          <UserSearchForm />
        </div>
        <div>
          <AddButton>
            <Plus /> Add New User
          </AddButton>
        </div>
      </div>
      <div className="px-6">
        <DataTable
          columns={columns}
          data={data}
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize || 10}
          sorting={sorting}
          isLoading={loading}
          onPaginationChange={({
            pageIndex: nextPageIndex,
            pageSize: nextPageSize,
          }) => {
            // ✅ update URL; reset page when limit changes
            const limitChanged = nextPageSize !== pageSize;
            router.replace(
              setQuery(pathname, searchParams, {
                page: String((limitChanged ? 0 : nextPageIndex) + 1),
                limit: String(nextPageSize),
              }),
            );
          }}
          onSortingChange={(next) => {
            const s = next[0];
            router.replace(
              setQuery(pathname, searchParams, {
                sortBy: s?.id ?? null,
                sortDir: s ? (s.desc ? "desc" : "asc") : null,
                page: "1", // ✅ reset page on sort
              }),
            );
          }}
        />
      </div>
    </ProtectedRoute>
  );
}

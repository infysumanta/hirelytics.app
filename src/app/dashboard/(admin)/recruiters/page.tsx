"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { UserRole } from "@/models/user";
import { format } from "date-fns";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { UserDetails } from "@/components/admin/user-details";
import { toast } from "sonner";

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const t = useTranslations("Dashboard");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery] = useState("");

  // Fetch users with role filter, pagination, and search
  const { data, refetch } = useQuery({
    queryKey: ["recruiter", page, pageSize, searchQuery],
    queryFn: async () => {
      const searchParam = searchQuery ? `&search=${searchQuery}` : "";
      const response = await fetch(
        `/api/admin/users?page=${page + 1}&limit=${pageSize}&role=recruiter${searchParam}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      return response.json();
    },
  });

  // Define columns for the data table
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return (
          <Badge
            variant={
              role === "admin"
                ? "destructive"
                : role === "recruiter"
                  ? "default"
                  : "secondary"
            }
          >
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "outline"}>
            {isActive ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <span>{format(date, "PPP")}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              setIsDrawerOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        );
      },
    },
  ];

  // Handle user status toggle
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user status");
      }

      // Refetch users to update the table
      refetch();
      toast.success(`User ${isActive ? "disabled" : "enabled"} successfully`);
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("userManagement")}</h1>
        <p className="text-muted-foreground">{t("manageUsers")}</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.users || []}
        searchKey="name"
        searchPlaceholder="Search users..."
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[90vh] overflow-auto">
          {selectedUser && (
            <UserDetails
              user={selectedUser}
              onToggleStatus={handleToggleUserStatus}
              onClose={() => setIsDrawerOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

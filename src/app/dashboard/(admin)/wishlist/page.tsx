"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, Calendar, User } from "lucide-react";

// Define wishlist entry type
interface WishlistEntry {
  id: string;
  name: string;
  email: string;
  reason?: string;
  createdAt: string;
}

export default function AdminWishlistPage() {
  const t = useTranslations("Dashboard");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch wishlist data
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-wishlist", page, pageSize],
    queryFn: async () => {
      const response = await fetch(
        `/api/wishlist?page=${page + 1}&limit=${pageSize}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist entries");
      }
      return response.json();
    },
  });

  // Define columns for the data table
  const columns: ColumnDef<WishlistEntry>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => {
        const reason = row.getValue("reason") as string;
        return reason ? (
          <div className="max-w-xs">
            <p className="text-sm text-muted-foreground truncate" title={reason}>
              {reason}
            </p>
          </div>
        ) : (
          <Badge variant="outline" className="text-xs">
            No reason provided
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(date), "MMM dd, yyyy")}
            </span>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Wishlist Management</h1>
          <p className="text-muted-foreground">
            Manage and view wishlist entries
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">Failed to load wishlist entries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Wishlist Management</h1>
        <p className="text-muted-foreground">
          Manage and view wishlist entries from potential users
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Entries</h3>
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {data?.pagination?.total || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            People interested in the platform
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">This Page</h3>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {data?.wishlistEntries?.length || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Entries on current page
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pages</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {data?.pagination?.totalPages || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Total pages available
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.wishlistEntries || []}
        searchKey="name"
        searchPlaceholder="Search by name, email, or reason..."
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        isLoading={isLoading}
      />
    </div>
  );
}

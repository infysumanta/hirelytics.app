'use client';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar, Mail, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';

// Define wishlist entry type
interface WishlistEntry {
  id: string;
  name: string;
  email: string;
  reason?: string;
  createdAt: string;
}

export default function AdminWishlistPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch wishlist data
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-wishlist', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/wishlist?page=${page + 1}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist entries');
      }
      return response.json();
    },
  });

  // Define columns for the data table
  const columns: ColumnDef<WishlistEntry>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => {
        const email = row.getValue('email') as string;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => {
        const reason = row.getValue('reason') as string;
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
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{format(new Date(date), 'MMM dd, yyyy')}</span>
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
          <p className="text-muted-foreground">Manage and view wishlist entries</p>
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

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isResolved: boolean;
}

export default function ContactSubmissionsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts', page, pageSize],
    queryFn: async () => {
      const response = await fetch(`/api/contact?page=${page + 1}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });

  const handleToggleResolved = async (contactId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isResolved: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Status updated successfully');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contact deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to delete contact');
    },
  });

  const handleDelete = (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete);
    }
  };

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
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
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        const message = row.getValue('message') as string;
        return (
          <div className="max-w-xs">
            <p className="text-sm text-muted-foreground truncate" title={message}>
              {message}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted On',
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
    {
      accessorKey: 'isResolved',
      header: 'Status',
      cell: ({ row }) => {
        const isResolved = row.getValue('isResolved') as boolean;
        return (
          <Badge variant={isResolved ? 'default' : 'secondary'} className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {isResolved ? 'Resolved' : 'Pending'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedContact(contact)}>
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleResolved(contact._id, contact.isResolved)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(contact._id)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contact Form Submissions</h1>
          <p className="text-muted-foreground">Manage and respond to contact form submissions</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-500">Failed to load contact submissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Contact Form Submissions</h1>
        <p className="text-muted-foreground">
          Manage and respond to contact form submissions from users
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.contacts || []}
        searchKey="name"
        searchPlaceholder="Search by name, email, or message..."
        pagination={{
          pageIndex: page,
          pageSize: pageSize,
          pageCount: data?.pagination?.totalPages || 1,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        isLoading={isLoading}
      />

      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <span className="font-semibold">From:</span> {selectedContact?.name} (
              {selectedContact?.email})
            </div>
            <div className="whitespace-pre-wrap">{selectedContact?.message}</div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

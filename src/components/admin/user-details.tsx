"use client";

import { useState } from "react";
import { format } from "date-fns";
import { UserRole } from "@/models/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, UserCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface UserDetailsProps {
  user: User;
  onToggleStatus: (userId: string, isActive: boolean) => Promise<void>;
  onClose: () => void;
}

export function UserDetails({
  user,
  onToggleStatus,
  onClose,
}: UserDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    setIsLoading(true);
    try {
      await onToggleStatus(user.id, user.isActive);
      onClose();
    } catch (error) {
      console.error("Error toggling user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <DrawerHeader>
        <DrawerTitle className="text-2xl flex items-center">
          <UserCircle className="h-8 w-8 mr-2" />
          {user.name}
        </DrawerTitle>
        <DrawerDescription>{user.email}</DrawerDescription>
      </DrawerHeader>

      <div className="py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <Badge
              variant={
                user.role === "admin"
                  ? "destructive"
                  : user.role === "recruiter"
                    ? "default"
                    : "secondary"
              }
              className="text-sm"
            >
              {user.role}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge
              variant={user.isActive ? "default" : "outline"}
              className="text-sm"
            >
              {user.isActive ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Created At
            </p>
            <p className="text-sm">{format(new Date(user.createdAt), "PPP")}</p>
          </div>
        </div>
      </div>

      <DrawerFooter className="flex flex-row justify-between">
        <DrawerClose asChild>
          <Button variant="outline">Close</Button>
        </DrawerClose>

        {user.role !== "admin" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={user.isActive ? "destructive" : "default"}
                disabled={isLoading}
              >
                {user.isActive ? "Disable User" : "Enable User"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {user.isActive
                    ? "Are you sure you want to disable this user?"
                    : "Are you sure you want to enable this user?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {user.isActive
                    ? "This will prevent the user from logging in and accessing the system."
                    : "This will allow the user to log in and access the system again."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggleStatus}>
                  {user.isActive ? "Disable" : "Enable"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DrawerFooter>
    </div>
  );
}

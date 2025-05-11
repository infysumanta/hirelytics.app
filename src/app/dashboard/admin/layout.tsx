"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import {
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
} from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("Dashboard");
  const auth = useTranslations("Auth");

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login/admin");
    return null;
  }

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent className="flex flex-col justify-between h-full">
            <SidebarMenu>
              <SidebarMenuButton
                onClick={() => router.push("/dashboard")}
                tooltip="Dashboard"
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                <span>Dashboard</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                onClick={() => router.push("/dashboard/admin/users")}
                tooltip="User Management"
                isActive={router.pathname === "/dashboard/admin/users"}
              >
                <Users className="h-5 w-5 mr-2" />
                <span>User Management</span>
              </SidebarMenuButton>
              <SidebarMenuButton
                onClick={() => router.push("/dashboard/admin/settings")}
                tooltip="Settings"
                isActive={router.pathname === "/dashboard/admin/settings"}
              >
                <Settings className="h-5 w-5 mr-2" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenu>
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {auth("signOut")}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center md:hidden">
            <SidebarTrigger />
            <h1 className="text-xl font-bold ml-2">Admin Dashboard</h1>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

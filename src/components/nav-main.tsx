"use client";

import { IconDashboard } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User2Icon, UserIcon, BriefcaseIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function NavMain() {
  const session = useSession();
  const user = session.data?.user;
  const role = user?.role;

  const adminMenu = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Candidates",
      url: "/dashboard/candidates",
      icon: UserIcon,
    },
    {
      title: "Recruiters",
      url: "/dashboard/recruiters",
      icon: User2Icon,
    },
  ];

  const recruiterMenu = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Job Listing",
      url: "/dashboard/job-listing",
      icon: BriefcaseIcon,
    },
  ];

  const userMenu = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Jobs",
      url: "/dashboard/jobs",
      icon: BriefcaseIcon,
    },
  ];

  const menu =
    role === "admin"
      ? adminMenu
      : role === "recruiter"
        ? recruiterMenu
        : userMenu;

  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {menu.map((item) => (
            <SidebarMenuItem
              key={item.title}
              onClick={() => router.push(item.url)}
            >
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

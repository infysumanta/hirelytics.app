'use client';

import { IconDashboard } from '@tabler/icons-react';
import { BriefcaseIcon, Heart, User2Icon, UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function NavMain() {
  const session = useSession();
  const user = session.data?.user;
  const role = user?.role;

  const adminMenu = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Jobs',
      url: '/dashboard/manage-jobs',
      icon: BriefcaseIcon,
    },
    {
      title: 'Candidates',
      url: '/dashboard/candidates',
      icon: UserIcon,
    },
    {
      title: 'Recruiters',
      url: '/dashboard/recruiters',
      icon: User2Icon,
    },
    {
      title: 'Wishlist',
      url: '/dashboard/wishlist',
      icon: Heart,
    },
    {
      title: 'Contact Submissions',
      url: '/dashboard/contact-submissions',
      icon: UserIcon, // You can import and use a different icon like MessageSquare if desired
    },
  ];

  const recruiterMenu = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Job Listing',
      url: '/dashboard/job-listing',
      icon: BriefcaseIcon,
    },
    {
      title: 'Job Applications',
      url: '/dashboard/job-applications',
      icon: UserIcon,
    },
  ];

  const userMenu = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Jobs',
      url: '/dashboard/jobs',
      icon: BriefcaseIcon,
    },
    {
      title: 'Applications',
      url: '/dashboard/applications',
      icon: UserIcon,
    },
  ];

  const menu = role === 'admin' ? adminMenu : role === 'recruiter' ? recruiterMenu : userMenu;

  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {menu.map((item) => (
            <SidebarMenuItem key={item.title} onClick={() => router.push(item.url)}>
              <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
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

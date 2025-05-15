"use client";

import * as React from "react";
import {
  IconCalendar,
  IconDashboard,
  IconHelp,
  IconUser,
  IconUserShield,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/admin/",
      icon: IconDashboard,
    },
    {
      title: "Contul meu",
      url: "/dashboard/admin/contul-meu",
      icon: IconUser,
    },
    {
      title: "Orarul meu",
      url: "/dashboard/admin/orarul-meu",
      icon: IconCalendar,
    },
    {
      title: "Antrenorii mei",
      url: "/dashboard/admin/antrenorii-mei",
      icon: IconUsers,
    },
    {
      title: "Administratori",
      url: "/dashboard/admin/administratori",
      icon: IconUserShield,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard/admin">
                <Image
                  src="/logo.png"
                  height={50}
                  width={50}
                  alt="logo"
                ></Image>
                <span className="text-base font-semibold">
                  &nbsp;&nbsp;&nbsp;Fitlife Club
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}

"use client";

import * as React from "react";
import {
  IconCalendar,
  IconDashboard,
  IconUser,
  IconUserShield,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

import { NavMain } from "@/components/nav-main";
import { LogoutButton } from "@/components/logout-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
      title: "Gestionare",
      url: "/dashboard/admin/gestionare",
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
              <Link href="/dashboard/membru">
                <Image
                  src="/logo.png"
                  height={50}
                  width={50}
                  alt="logo"
                ></Image>
                <span className="text-base font-semibold">
                  &nbsp;&nbsp;&nbsp;FitLife Club
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <NavMain items={data.navMain} />
        <LogoutButton className="mt-auto mb-4" />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}

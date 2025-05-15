"use client";

import * as React from "react";
import {
  IconCalendar,
  IconChartBar,
  IconDashboard,
  IconUser,
} from "@tabler/icons-react";

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
import Image from "next/image";

export const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/antrenor/",
      icon: IconDashboard,
    },
    {
      title: "Contul meu",
      url: "/dashboard/antrenor/contul-meu",
      icon: IconUser,
    },
    {
      title: "Orarul meu",
      url: "/dashboard/antrenor/orarul-meu",
      icon: IconCalendar,
    },
    {
      title: "Planuri",
      url: "/dashboard/antrenor/planuri",
      icon: IconChartBar,
    },
  ],
};

export function TrainerSidebar({
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
              <a href="/dashboard/antrenor">
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
      <SidebarContent className="flex flex-col">
        <NavMain items={data.navMain} />
        <LogoutButton className="mt-auto mb-4" />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}

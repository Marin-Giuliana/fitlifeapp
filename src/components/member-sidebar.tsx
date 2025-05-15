"use client";

import * as React from "react";
import {
  IconBarbell,
  IconDashboard,
  IconHelp,
  IconCarambola,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUser,
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
      url: "/dashboard/membru/",
      icon: IconDashboard,
    },
    {
      title: "Contul meu",
      url: "/dashboard/membru/contul-meu",
      icon: IconUser,
    },
    {
      title: "Abonamentul meu",
      url: "/dashboard/membru/abonamentul-meu",
      icon: IconCarambola,
    },
    {
      title: "Clase de grup",
      url: "/dashboard/membru/clase-de-grup",
      icon: IconBarbell,
    },
    {
      title: "Personal Trainer",
      url: "/dashboard/membru/personal-trainer",
      icon: IconUsers,
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

export function MemberSidebar({
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
              <a href="/dashboard/membru">
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

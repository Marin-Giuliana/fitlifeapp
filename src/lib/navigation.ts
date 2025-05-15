import { data as adminSidebarData } from "@/components/admin-sidebar";
import { data as trainerSidebarData } from "@/components/trainer-sidebar";
import { data as memberSidebarData } from "@/components/member-sidebar";

interface NavItem {
  title: string;
  url: string;
}

export function getTitleFromUrl(pathname: string): string {
  const DEFAULT_TITLE = "Fitlife Club";
  
  const isDashboard = pathname.startsWith('/dashboard');
  if (!isDashboard) return DEFAULT_TITLE;
  
  const isAdmin = pathname.startsWith('/dashboard/admin');
  const isTrainer = pathname.startsWith('/dashboard/antrenor');
  const isMember = pathname.startsWith('/dashboard/membru');
  
  let navItems: NavItem[] = [];
  
  if (isAdmin) {
    navItems = adminSidebarData.navMain;
  } else if (isTrainer) {
    navItems = trainerSidebarData.navMain;
  } else if (isMember) {
    navItems = memberSidebarData.navMain;
  } else {
    return DEFAULT_TITLE;
  }
  
  if (
    pathname === "/dashboard/admin/" || 
    pathname === "/dashboard/admin" ||
    pathname === "/dashboard/antrenor/" || 
    pathname === "/dashboard/antrenor" ||
    pathname === "/dashboard/membru/" || 
    pathname === "/dashboard/membru"
  ) {
    return "Dashboard";
  }
  
  const exactMatch = navItems.find(item => 
    pathname === item.url || 
    pathname === `${item.url}/`
  );
  
  if (exactMatch) {
    return exactMatch.title;
  }
  
  const sortedItems = [...navItems].sort((a, b) => b.url.length - a.url.length);
  
  for (const item of sortedItems) {
    if (pathname.startsWith(item.url)) {
      return item.title;
    }
  }
  
  return "Dashboard";
}
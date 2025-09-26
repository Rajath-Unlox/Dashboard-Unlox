import {
  Calendar,
  CreditCard,
  Group,
  Home,
  Inbox,
  LayoutDashboard,
  Logs,
  Search,
  Settings,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import Logo from "@/public/images/Logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    url: "/user-data",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/reports-data",
    icon: ShieldAlert,
  },
  {
    title: "Web Payments",
    url: "/payment-data",
    icon: CreditCard,
  },
  {
    title: "System Logs",
    url: "/logs-data",
    icon: Logs,
  },
    {
    title: "Edulet Track",
    url: "/edulet-track",
    icon: Truck,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <Link href="/">
          <Image src={Logo} alt="Logo" height={20} />
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}

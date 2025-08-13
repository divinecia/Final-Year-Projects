
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Wallet,
  Star,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoWithName } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { signOut } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { AuthProvider } from "@/hooks/use-auth"

function WorkerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/worker/login");
  };
  
  const menuItems = [
    { href: "/worker/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { href: "/worker/jobs", icon: <Briefcase />, label: "Find Jobs" },
    { href: "/worker/schedule", icon: <Calendar />, label: "My Schedule" },
    { href: "/worker/earnings", icon: <Wallet />, label: "Earnings" },
    { href: "/worker/reviews", icon: <Star />, label: "My Reviews" },
    { href: "/worker/training", icon: <GraduationCap />, label: "Training" },
    { href: "/worker/notifications", icon: <Bell />, label: "Notifications", badge: "5" },
  ];

  const settingsItems = [
    { href: "/worker/settings", icon: <Settings />, label: "Settings" },
  ];

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="group-data-[variant=floating]:max-w-60"
    >
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <LogoWithName />
          <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
               <SidebarMenuButton asChild isActive={typeof pathname === 'string' && pathname.startsWith(item.href)}>
                <Link href={item.href}>
                  {item.icon}
                  {item.label}
                  {item.badge && <Badge variant="destructive" className="ml-auto">{item.badge}</Badge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton asChild isActive={typeof pathname === 'string' && pathname.startsWith(item.href)}>
                        <Link href={item.href}>
                            {item.icon}
                            {item.label}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/70">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://placehold.co/100x100.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">John Doe</p>
            <p className="text-xs text-muted-foreground">john.doe@example.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
        <SidebarProvider>
            <div className="flex min-h-screen">
                <WorkerSidebar />
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
                    <div className="md:hidden mb-4">
                        <SidebarTrigger/>
                    </div>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    </AuthProvider>
  )
}

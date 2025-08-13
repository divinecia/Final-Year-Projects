"use client"

import * as React from "react"
import Link from "next/link"
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
} from "../../../components/ui/sidebar"
import {
  Home,
  Briefcase,
  Wallet,
  AreaChart,
  Settings,
  LogOut,
  GraduationCap,
  Package,
  HardHat,
  Building2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { LogoWithName } from "../../../components/logo"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "../../../lib/auth"
import { useToast } from "../../../hooks/use-toast"

type MenuItem = {
  href: string
  icon: React.ReactNode
  label: string
  exact?: boolean
}

const menuItems: MenuItem[] = [
  { href: "/admin/dashboard", icon: <Home style={{ color: "rgb(76, 102, 164)" }} />, label: "Dashboard", exact: true },
  { href: "/admin/workers/workermanage", icon: <HardHat style={{ color: "rgb(76, 102, 164)" }} />, label: "Workers" },
  { href: "/admin/households", icon: <Building2 style={{ color: "rgb(138, 165, 208)" }} />, label: "Households" },
  { href: "/admin/jobs", icon: <Briefcase style={{ color: "rgb(76, 102, 164)" }} />, label: "Jobs" },
  { href: "/admin/training", icon: <GraduationCap style={{ color: "rgb(138, 165, 208)" }} />, label: "Training" },
  { href: "/admin/packages", icon: <Package style={{ color: "rgb(95, 108, 126)" }} />, label: "Service Packages" },
  { href: "/admin/payments", icon: <Wallet style={{ color: "rgb(76, 102, 164)" }} />, label: "Payments" },
  { href: "/admin/reports", icon: <AreaChart style={{ color: "rgb(138, 165, 208)" }} />, label: "Reports" },
]

const settingsItems: MenuItem[] = [
  { href: "/admin/settings", icon: <Settings style={{ color: "rgb(95, 108, 126)" }} />, label: "Settings", exact: true },
]

import { db } from "../../../lib/firebase"
import { collection, doc, getDoc } from "firebase/firestore"

function useAdminUser() {
  const [user, setUser] = React.useState<{ name: string; email: string; avatar?: string } | null>(null);
  React.useEffect(() => {
    // Example: fetch admin user from Firestore (adjust path as needed)
    async function fetchUser() {
      try {
        const userDoc = await getDoc(doc(collection(db, "admin"), "current"));
        if (userDoc.exists()) {
          setUser(userDoc.data() as { name: string; email: string; avatar?: string });
        } else {
          setUser({ name: "Admin", email: "admin@househelp.rw" });
        }
      } catch {
        setUser({ name: "Admin", email: "admin@househelp.rw" });
      }
    }
    fetchUser();
  }, []);
  return user;
}



function AdminSidebar() {
  const user = useAdminUser();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/admin/login");
  };

  const renderMenuItems = (items: MenuItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={
            item.exact
              ? pathname === item.href
              : typeof pathname === 'string' && pathname.startsWith(item.href) ? true : false
          }
          aria-label={item.label}
        >
          <Link href={item.href}>
            {item.icon}
            {item.label}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="group-data-[variant=floating]:max-w-60"
    >
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
          <LogoWithName />
          <SidebarTrigger className="hidden md:flex" aria-label="Toggle sidebar" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {renderMenuItems(menuItems)}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarGroup>
          <SidebarMenu>
            {renderMenuItems(settingsItems)}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} aria-label="Logout">
                <LogOut style={{ color: "rgb(95, 108, 126)" }} />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/70 mt-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
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
    <SidebarProvider>
      <div className="flex min-h-screen flex-row-reverse">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
          <div className="md:hidden mb-4">
            <SidebarTrigger aria-label="Open sidebar" />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
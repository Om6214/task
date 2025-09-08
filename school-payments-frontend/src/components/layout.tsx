// src/components/Layout.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="w-full flex-1 flex flex-col">
          {/* Topbar with Sidebar toggle */}
          <header className="flex items-center border-b p-2">
            <SidebarTrigger /> {/* <-- toggle button */}
            <h1 className="ml-2 text-xl font-bold">School Payments</h1>
          </header>

          {/* Page Content */}
          <main className="w-full p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

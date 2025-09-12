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
          <header className="flex fixed items-center border-b ">
            <SidebarTrigger /> {/* <-- toggle button */}
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

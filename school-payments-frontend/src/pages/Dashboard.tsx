import { SidebarProvider } from "@/components/ui/sidebar"
import { Routes, Route } from "react-router-dom"
import Transactions from "@/pages/Transaction"
import Payments from "@/pages/Payments"
import Analytics from "@/pages/Analytics"
import { AppSidebar } from "@/components/app-sidebar"

function Dashboard() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground">
                {/* Sidebar */}
                <AppSidebar/>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <Routes>
                        <Route path="transactions" element={<Transactions />} />
                        <Route path="payments" element={<Payments />} />
            <Route path="analytics" element={<Analytics />} />
                    </Routes>
                </main>
            </div>
        </SidebarProvider>
    )
}

export default Dashboard

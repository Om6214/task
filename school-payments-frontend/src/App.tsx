import { Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Authentication from "./pages/Authentication"
import Transactions from "./pages/Transaction"
import Payments from "./pages/Payments"
import Analytics from "./pages/Analytics"
import Dashboard from "./pages/Dashboard"
import Layout from "@/components/layout"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="school-payments-theme">
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Authentication />} />

        {/* Protected Routes with Sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App

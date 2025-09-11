import { Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Authentication from "./pages/Authentication"
import Transactions from "./pages/Transaction"
import Analytics from "./pages/Analytics"
import Layout from "@/components/layout"
import CreatePaymentPage from "@/pages/CreatePaymentPage"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="school-payments-theme">
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Authentication />} />

        {/* Protected Routes with Sidebar */}
        <Route element={<Layout />}>
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/payments" element={<CreatePaymentPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App

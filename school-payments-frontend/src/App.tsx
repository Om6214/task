import { Routes, Route, useNavigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Authentication from "./pages/Authentication"
import Transactions from "./pages/Transaction"
import Analytics from "./pages/Analytics"
import Layout from "@/components/layout"
import CreatePaymentPage from "@/pages/CreatePaymentPage"
import { getToken, isTokenExpired, removeToken } from "@/utils/auth"
import { useEffect } from "react"
import {jwtDecode} from "jwt-decode"

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/");
      return;
    }

    if (isTokenExpired(token)) {
      removeToken();
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // ✅ Make sure exp exists
      if (!decoded || !decoded.exp) {
        removeToken();
        navigate("/");
        return;
      }

      const timeLeft = decoded.exp * 1000 - Date.now();

      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          removeToken();
          navigate("/");
        }, timeLeft);

        return () => clearTimeout(timer);
      } else {
        removeToken();
        navigate("/");
      }
    } catch (err) {
      console.error("Invalid token:", err);
      removeToken();
      navigate("/");
    }
  }, [navigate]);

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

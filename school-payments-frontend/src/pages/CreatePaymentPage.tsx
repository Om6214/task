import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from "sonner"
import { CreditCard, User, Mail, Phone, IndianRupee, Shield } from "lucide-react"
import axios from "axios"

export default function CreatePaymentPage() {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    student_name: "",
    phone: "",
    email: "",
    amount: "",
    school_id: "",
    trustee_id: ""
  })

  useEffect(() => {
    // Get token from localStorage when component mounts
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
    
    if (!storedToken) {
      toast.error("Authentication required", {
        description: "Please login to continue"
      })
      navigate("/") // Redirect to login if no token
    }
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error("Authentication required", {
        description: "Please login to continue"
      })
      navigate("/login")
      return
    }
    
    setLoading(true)

    try {
      const response = await axios.post(
        "http://localhost:5000/api/payments/create-payment",
        {
          amount: formData.amount,
          student_info: {
            name: formData.student_name,
            phone: formData.phone,
            email: formData.email
          },
          trustee_id: formData.trustee_id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.redirect_url) {
        // Redirect to payment page
        window.location.href = response.data.redirect_url
      } else {
        toast.error("Payment initiation failed", {
          description: "No redirect URL received"
        })
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      
      if (error.response?.status === 401) {
        // Token is invalid or expired
        toast.error("Session expired", {
          description: "Please login again"
        })
        localStorage.removeItem("token") // Clear invalid token
        navigate("/") // Redirect to login
      } else {
        toast.error("Payment Failed", {
          description: error.response?.data?.message || error.message
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen  from-blue-50 to-purple-50 dark: from-neutral-900 dark: to-zinc-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border-0 dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-t-2xl py-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Create Payment</CardTitle>
              <CardDescription className="text-blue-100 dark:text-blue-200">
                Enter student details to process payment
              </CardDescription>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_name" className="flex items-center gap-2 dark:text-gray-300">
                <User className="h-4 w-4" />
                Student Name
              </Label>
              <Input
                id="student_name"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 dark:text-gray-300">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="Amount" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <IndianRupee className="h-4 w-4 inline-block mr-1" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="500"
                  required
                  className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 dark:text-gray-300">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label htmlFor="trustee_id" className="dark:text-gray-300">Trustee ID</Label>
                <Input
                  id="trustee_id"
                  name="trustee_id"
                  value={formData.trustee_id}
                  onChange={handleChange}
                  placeholder="TRUSTEE123"
                  className="h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <Shield className="h-3 w-3 inline-block mr-1" />
              All transactions are secure and encrypted. We never store your payment details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Sonner Toaster */}
      <Toaster richColors position="top-center" />
    </div>
  )
}
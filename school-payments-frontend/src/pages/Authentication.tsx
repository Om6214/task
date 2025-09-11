import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  loginUser,
  registerUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  clearError,
  clearMessage
} from "../redux/slices/userSlices";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Mail, Lock, User, ShieldCheck } from "lucide-react";
import { Toaster, toast } from "@/components/ui/sonner";

function Authentication() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, needsVerification, message, token } = useAppSelector((state: any) => state.auth);


  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [resetPasswordData, setResetPasswordData] = useState({ email: "", password: "", confirmPassword: "" });

  const [activeTab, setActiveTab] = useState("login");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/transactions");
    }
  }, [token, navigate]);

  // Show toast notifications for errors and messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, dispatch]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(registerUser({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password
    }));

    if (result.meta.requestStatus === "fulfilled") {
      setCurrentEmail(registerData.email);
      setOtpModalOpen(true);
      toast.success("Verification code has been sent to your email");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser(loginData));

    if (result.meta.requestStatus === "fulfilled") {
      navigate("/transactions");
    } else if (needsVerification) {
      setCurrentEmail(loginData.email);
      setOtpModalOpen(true);
    }
  };

  const handleOtpSubmit = async () => {
    const result = await dispatch(verifyEmail({ email: currentEmail, otp }));

    if (result.meta.requestStatus === "fulfilled") {
      setOtpModalOpen(false);
      setOtp("");

      toast.success("Email verified successfully! You can now log in.");

      // If user was trying to login, automatically log them in after verification
      if (activeTab === "login") {
        const loginResult = await dispatch(loginUser({ email: currentEmail, password: loginData.password }));
        if (loginResult.meta.requestStatus === "fulfilled") {
          navigate("/transactions");
        }
      }
    }
  };

  const handleResendOtp = async () => {
    const result = await dispatch(resendVerification({ email: currentEmail }));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Verification code has been resent to your email");
    }
  };

  const handleForgotPassword = async () => {
    const result = await dispatch(forgotPassword({ email: resetPasswordData.email }));

    if (result.meta.requestStatus === "fulfilled") {
      setForgotPasswordModalOpen(false);
      setResetPasswordModalOpen(true);
      toast.success("Password reset code has been sent to your email");
    }
  };

  const handleResetPassword = async () => {
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(resetPassword({
      email: resetPasswordData.email,
      otp,
      password: resetPasswordData.password
    }));

    if (result.meta.requestStatus === "fulfilled") {
      setResetPasswordModalOpen(false);
      setResetPasswordData({ email: "", password: "", confirmPassword: "" });
      setOtp("");
      setActiveTab("login");

      toast.success("Password reset successfully! You can now log in.");
    }
  };

  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r  text-white pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Welcome</CardTitle>
          <p className="text-center text-blue-100 mt-2">
            {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-white hover:text-blue-800 text-sm"
                    onClick={() => {
                      setResetPasswordData({ ...resetPasswordData, email: loginData.email });
                      setForgotPasswordModalOpen(true);
                    }}
                  >
                    Forgot your password?
                  </Button>
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog open={otpModalOpen} onOpenChange={setOtpModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to {currentEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              type="text"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-lg font-mono tracking-widest"
            />
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleResendOtp} disabled={loading}>
                Resend Code
              </Button>
              <Button onClick={handleOtpSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={forgotPasswordModalOpen} onOpenChange={setForgotPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a code to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={resetPasswordData.email}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, email: e.target.value })}
            />
            <DialogFooter>
              <Button type="submit" onClick={handleForgotPassword} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetPasswordModalOpen} onOpenChange={setResetPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Password</DialogTitle>
            <DialogDescription>
              Enter the code we sent to your email and your new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              type="text"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-lg font-mono tracking-widest"
            />
            <Input
              type="password"
              placeholder="New password"
              value={resetPasswordData.password}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={resetPasswordData.confirmPassword}
              onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
            />
            <DialogFooter>
              <Button onClick={handleResetPassword} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Toaster component at the root level */}
      <Toaster />
    </div>
  );
}

export default Authentication;
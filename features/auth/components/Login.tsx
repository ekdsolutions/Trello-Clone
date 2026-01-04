import Navbar from "@/components/layout/Navbar";
import AuthForm from "./AuthForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AuthForm
        mode="sign-in"
        title="Sign in to your account"
        subtitle="Welcome back to Kesllo 🧀"
        redirectUrl="/dashboard"
        alternateUrl="/sign-up"
      />
    </div>
  );
}

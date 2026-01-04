import Navbar from "@/components/layout/Navbar";
import AuthForm from "./AuthForm";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AuthForm
        mode="sign-up"
        title="Create your account"
        subtitle="Join 🧀 Kesllo and start organizing your projects"
        redirectUrl="/dashboard"
        alternateUrl="/sign-in"
      />
    </div>
  );
}

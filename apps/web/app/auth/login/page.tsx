import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-memo-paper">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-memo-wood mb-2">SupaNote</h1>
          <p className="text-memo-textLight">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

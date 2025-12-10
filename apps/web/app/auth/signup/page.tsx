import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-memo-paper">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-memo-wood mb-2">SupaNote</h1>
          <p className="text-memo-textLight">Create a new account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}

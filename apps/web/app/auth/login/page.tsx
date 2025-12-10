import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="text-center mb-4">
              <h1 className="fw-bold text-primary mb-1">SupaNote</h1>
              <p className="text-secondary mb-0">Sign in to continue</p>
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="h4 fw-semibold text-dark mb-4">Welcome back</h2>
                <LoginForm />
              </div>
            </div>
            <p className="text-center text-muted mt-3 small">
              Trouble signing in? Contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

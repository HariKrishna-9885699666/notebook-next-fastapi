import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="text-center mb-4">
              <h1 className="fw-bold text-primary mb-1">SupaNote</h1>
              <p className="text-secondary mb-0">Create your account</p>
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="h4 fw-semibold text-dark mb-4">Get started</h2>
                <SignupForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

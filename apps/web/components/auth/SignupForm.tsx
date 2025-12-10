"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2 } from "lucide-react";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    const errs: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Use at least 8 characters";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords must match";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center d-grid gap-3">
        <div className="mx-auto rounded-3 bg-light border d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
          <Mail className="text-primary" size={36} />
        </div>
        <div>
          <h2 className="h4 fw-bold text-dark mb-2">Check your email</h2>
          <p className="text-muted mb-0">
            We sent a confirmation link to <strong>{email}</strong>. Open it to finish signing up.
          </p>
        </div>
        <Link href="/auth/login" className="btn btn-primary w-100">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="d-grid gap-3">
      {error && (
        <div className="alert alert-danger small mb-0" role="alert">
          {error}
        </div>
      )}

      <div className="mb-2">
        <label htmlFor="email" className="form-label fw-semibold">
          Email
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <Mail className="text-secondary" size={18} />
          </span>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validate}
            placeholder="you@example.com"
            className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
          />
          {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
        </div>
      </div>

      <div className="mb-2">
        <label htmlFor="password" className="form-label fw-semibold">
          Password
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <Lock className="text-secondary" size={18} />
          </span>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validate}
            placeholder="••••••••"
            minLength={8}
            className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
          />
          {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
        </div>
      </div>

      <div className="mb-2">
        <label htmlFor="confirmPassword" className="form-label fw-semibold">
          Confirm Password
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <Lock className="text-secondary" size={18} />
          </span>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={validate}
            placeholder="••••••••"
            minLength={8}
            className={`form-control ${fieldErrors.confirmPassword ? "is-invalid" : ""}`}
          />
          {fieldErrors.confirmPassword && (
            <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
      >
        {loading && <Loader2 className="spinner-border spinner-border-sm" />}
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-muted small mb-0">
        Already have an account?{" "}
        <Link href="/auth/login" className="link-primary fw-semibold">
          Sign in
        </Link>
      </p>
    </form>
  );
}

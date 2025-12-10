"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
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

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

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

      <div className="mb-1">
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

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
      >
        {loading && <Loader2 className="spinner-border spinner-border-sm" />}
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-muted small mb-0">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="link-primary fw-semibold">
          Create one
        </Link>
      </p>
    </form>
  );
}

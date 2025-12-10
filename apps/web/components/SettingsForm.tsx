"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, User as UserIcon, Lock, Trash2 } from "lucide-react";

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const validatePasswords = () => {
    const errs: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword || newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm the new password";
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm.');
      return;
    }
    setDeleteError(null);
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 920 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <p className="text-uppercase text-secondary mb-1 small fw-semibold">Account</p>
          <h1 className="h3 fw-bold text-dark mb-0">Settings</h1>
          <p className="text-muted small mb-0">Manage your profile and security.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Profile card */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <UserIcon size={18} className="text-primary" />
                <h2 className="h6 fw-semibold mb-0">Profile</h2>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small mb-1">Email</label>
                <p className="mb-0 fw-semibold text-dark">{user.email}</p>
              </div>
              <div>
                <label className="form-label text-muted small mb-1">Account created</label>
                <p className="mb-0 text-dark">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password card */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Lock size={18} className="text-primary" />
                <h2 className="h6 fw-semibold mb-0">Change password</h2>
              </div>

              {message && (
                <div
                  className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} small`}
                  role="alert"
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="d-grid gap-3">
                <div>
                  <label htmlFor="newPassword" className="form-label fw-semibold">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={validatePasswords}
                    placeholder="••••••••"
                    className={`form-control ${fieldErrors.newPassword ? "is-invalid" : ""}`}
                    minLength={8}
                  />
                  {fieldErrors.newPassword && (
                    <div className="invalid-feedback">{fieldErrors.newPassword}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={validatePasswords}
                    placeholder="••••••••"
                    className={`form-control ${fieldErrors.confirmPassword ? "is-invalid" : ""}`}
                    minLength={8}
                  />
                  {fieldErrors.confirmPassword && (
                    <div className="invalid-feedback">{fieldErrors.confirmPassword}</div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                >
                  {loading && <Loader2 className="spinner-border spinner-border-sm" />}
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Trash2 size={18} className="text-danger" />
            <h2 className="h6 fw-semibold mb-0 text-danger">Danger zone</h2>
          </div>
          <p className="text-muted small mb-3">
            Deleting your account will sign you out. (Full deletion would require a server action.)
          </p>
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              setDeleteInput("");
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
          >
            Delete account
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1059 }} />
          <div className="modal d-block" style={{ zIndex: 1060 }} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg rounded-3 border-0">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-semibold text-danger">Delete account</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowDeleteModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Type <span className="fw-semibold">DELETE</span> to confirm. This will sign you out.
                  </p>
                  <input
                    type="text"
                    className={`form-control ${deleteError ? "is-invalid" : ""}`}
                    value={deleteInput}
                    onChange={(e) => {
                      setDeleteInput(e.target.value);
                      setDeleteError(null);
                    }}
                    placeholder="DELETE"
                  />
                  {deleteError && <div className="invalid-feedback d-block">{deleteError}</div>}
                </div>
                <div className="modal-footer border-0 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger w-50"
                    onClick={handleDeleteAccount}
                  >
                    Confirm delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

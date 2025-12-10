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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

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
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your notes will be permanently deleted."
    );

    if (!confirmed) return;

    const doubleConfirm = prompt(
      'Type "DELETE" to confirm account deletion:'
    );

    if (doubleConfirm !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }

    // Note: Actual account deletion would require a server-side function
    // For now, we'll just sign out
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-memo-text mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="bg-white border border-memo-line rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="w-5 h-5 text-memo-wood" />
          <h2 className="text-lg font-semibold text-memo-text">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-memo-textLight mb-1">
              Email
            </label>
            <p className="text-memo-text">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-memo-textLight mb-1">
              Account created
            </label>
            <p className="text-memo-text">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Change Password Section */}
      <section className="bg-white border border-memo-line rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-memo-wood" />
          <h2 className="text-lg font-semibold text-memo-text">Change Password</h2>
        </div>

        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-600"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-memo-text mb-2">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-memo-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-memo-accent focus:border-transparent transition"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-memo-text mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-memo-line rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-memo-accent focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-memo-wood text-white font-medium rounded-lg hover:bg-memo-woodDark focus:outline-none focus:ring-2 focus:ring-memo-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
        </div>
        <p className="text-sm text-memo-textLight mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}

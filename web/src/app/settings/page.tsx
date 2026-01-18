"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

type Tab = "profile" | "security" | "subscription" | "help";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    username: "",
    location: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Contact form state
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/settings");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session?.user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          username: data.profile?.username || "",
          location: data.profile?.location || "",
        });
        setContactData(prev => ({
          ...prev,
          name: data.profile?.displayName || data.profile?.username || "",
          email: session?.user?.email || "",
        }));
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    if (!confirm("Are you absolutely sure? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }

      toast.success("Account deleted. Redirecting...");
      await signOut({ callbackUrl: "/" });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
    
    if (!formspreeEndpoint) {
      toast.error("Support form not configured");
      return;
    }

    setIsSendingMessage(true);

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent. We'll reply soon!");
      setContactData(prev => ({ ...prev, message: "" }));
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="bg-[var(--bg-surface)] border-b border-[var(--border-light)] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">NeuroKind</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[var(--border-light)] mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Login & Security
          </button>
          <button
            onClick={() => setActiveTab("subscription")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "subscription"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Subscription
          </button>
          <button
            onClick={() => setActiveTab("help")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === "help"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Help & Support
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-[var(--bg-surface)] rounded-lg border border-[var(--border-light)] p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-lg">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={session.user?.email || ""}
                    disabled
                    className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg text-[var(--text-muted)] cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Your username"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="City, State or ZIP code"
                  />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">Optional: helps find local providers</p>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full sm:w-auto"
                >
                  {isSavingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              {/* Change Password */}
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSavingPassword}
                    className="w-full sm:w-auto"
                  >
                    {isSavingPassword ? "Updating..." : "Change Password"}
                  </Button>
                </form>
              </div>

              {/* Delete Account */}
              <div className="pt-8 border-t border-[var(--border-light)]">
                <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
                <div className="max-w-lg bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-800 mb-4">
                    Once you delete your account, there is no going back. Your posts will be anonymized and you will lose access to all data.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="deleteConfirm" className="block text-sm font-medium text-red-900 mb-2">
                        Type <strong>DELETE</strong> to confirm
                      </label>
                      <input
                        id="deleteConfirm"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                        placeholder="DELETE"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "DELETE" || isDeleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeleting ? "Deleting..." : "Delete My Account"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Subscription</h2>
              <div className="max-w-lg">
                <div className="bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Premium Features Coming Soon</h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    We're working on premium subscription plans with exclusive features, priority support, and ad-free experience.
                  </p>
                  <div className="bg-white border border-[var(--border-light)] rounded-lg p-4 mb-4">
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-[var(--text-primary)]">$9.99</span>
                      <span className="text-[var(--text-muted)]">/month</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Estimated pricing</p>
                  </div>
                  <Button disabled className="w-full opacity-50 cursor-not-allowed">
                    Manage Subscription
                  </Button>
                  <p className="mt-3 text-xs text-[var(--text-muted)]">Currently, all features are free for everyone</p>
                </div>
              </div>
            </div>
          )}

          {/* Help Tab */}
          {activeTab === "help" && (
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Contact Support</h2>
              {!process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ? (
                <div className="max-w-lg bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800">
                    Support form is not configured. Please set the NEXT_PUBLIC_FORMSPREE_ENDPOINT environment variable.
                  </p>
                </div>
              ) : (
                <div className="max-w-md">
                  <div className="bg-black/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div>
                        <input
                          id="contactName"
                          type="text"
                          value={contactData.name}
                          onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-[#2C3544] border-0 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-200"
                          placeholder="Your Name"
                          required
                        />
                      </div>

                      <div>
                        <input
                          id="contactEmail"
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-[#2C3544] border-0 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-200"
                          placeholder="Your Email"
                          required
                        />
                      </div>

                      <div>
                        <textarea
                          id="message"
                          value={contactData.message}
                          onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                          rows={5}
                          className="w-full px-4 py-3 bg-[#2C3544] border-0 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none transition-all duration-200"
                          placeholder="Your Message"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingMessage}
                        className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                      >
                        {isSendingMessage ? "Sending..." : "Send Message"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

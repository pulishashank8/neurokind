"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ProfileUpdateSchema } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    bio: "",
    location: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/settings");
    }
  }, [status, router]);

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchProfile();
    }
  }, [(session?.user as any)?.id]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setFormData({
        username: data.profile?.username || "",
        displayName: data.profile?.displayName || "",
        bio: data.profile?.bio || "",
        location: data.profile?.location || "",
        avatarUrl: data.profile?.avatarUrl || "",
      });
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load profile");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const parsed = ProfileUpdateSchema.safeParse(formData);
      if (!parsed.success) {
        const errors: Record<string, string> = {};
        parsed.error.errors.forEach((err) => {
          const path = err.path[0] as string;
          errors[path] = err.message;
        });
        setFieldErrors(errors);
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <div className="skeleton h-6 w-32 mb-4"></div>
          <div className="skeleton h-4 w-48"></div>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-[var(--surface)] border-b border-[var(--border-light)] shadow-[var(--shadow-sm)]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">N</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">NeuroKind</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">← Back to Home</span>
                <span className="sm:hidden">← Back</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Settings</h1>
            <p className="text-[var(--text-secondary)]">Manage your account and preferences</p>
          </div>

          {/* User Info Card */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-[var(--info-light)] border border-[var(--border-light)] rounded-[var(--radius-md)]">
            <h2 className="font-semibold text-[var(--text-primary)] mb-2 text-sm sm:text-base">Account Information</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] break-all">
              <strong>Email:</strong> {session.user?.email}
            </p>
            {(session.user as any)?.roles && (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                <strong>Roles:</strong> {(session.user as any).roles.join(", ")}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error)] rounded-[var(--radius-md)]">
              <p className="text-[var(--error)] text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-[var(--success-light)] border border-[var(--success)] rounded-[var(--radius-md)]">
              <p className="text-[var(--success)] text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <Input
              id="username"
              type="text"
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={fieldErrors.username}
            />
            {!fieldErrors.username && (
              <p className="text-xs text-[var(--text-muted)] -mt-4">
                3-20 characters, letters, numbers, underscores, and hyphens only
              </p>
            )}

            <Input
              id="displayName"
              type="text"
              name="displayName"
              label="Display Name"
              value={formData.displayName}
              onChange={handleChange}
              error={fieldErrors.displayName}
            />

            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className={`
                  w-full
                  bg-[var(--bg-elevated)]
                  border-2 border-[var(--border-base)]
                  text-[var(--text-primary)]
                  rounded-[var(--radius-md)]
                  px-4 py-3
                  min-h-[120px]
                  text-base
                  transition-all duration-[var(--transition-fast)]
                  hover:border-[var(--primary-light)]
                  focus:border-[var(--primary)]
                  focus:outline-none
                  focus:shadow-[var(--focus-ring)]
                  ${fieldErrors.bio ? "border-[var(--error)]" : ""}
                `}
              />
              {fieldErrors.bio && (
                <p className="mt-1 text-sm text-[var(--error)]">{fieldErrors.bio}</p>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <Input
              id="location"
              type="text"
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State/Country"
              error={fieldErrors.location}
            />

            <Input
              id="avatarUrl"
              type="url"
              name="avatarUrl"
              label="Avatar URL"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              error={fieldErrors.avatarUrl}
            />

            <Button
              type="submit"
              disabled={isSaving}
              variant="primary"
              className="w-full mt-6 sm:mt-8"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[var(--border-light)]">
            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              variant="secondary"
              className="w-full bg-[var(--error-light)] text-[var(--error)] border-[var(--error)] hover:bg-[var(--error)] hover:text-white"
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

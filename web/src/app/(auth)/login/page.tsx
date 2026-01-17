"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoginSchema } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      const parsed = LoginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setError(parsed.error.errors[0]?.message || "Invalid input");
        setIsLoading(false);
        return;
      }

      // Sign in with credentials
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(result?.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Redirect to callback URL
      router.push(callbackUrl);
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto" hover={false}>
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
          <span className="text-white font-bold text-xl sm:text-2xl">N</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          Welcome Back
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error)] rounded-[var(--radius-md)]">
          <p className="text-[var(--error)] text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          className="w-full mt-6"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[var(--text-secondary)] text-sm">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold"
          >
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[var(--border-light)]">
        <div className="text-center text-xs text-[var(--text-muted)]">
          <p className="mb-2">Demo credentials for testing:</p>
          <p className="font-mono bg-[var(--bg-elevated)] px-2 sm:px-3 py-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] text-xs break-all">
            admin@neurokind.local / admin123
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="max-w-md mx-auto" hover={false}>
        <div className="text-center">
          <div className="skeleton h-8 w-48 mx-auto mb-4"></div>
          <div className="skeleton h-4 w-32 mx-auto"></div>
        </div>
      </Card>
    }>
      <LoginContent />
    </Suspense>
  );
}

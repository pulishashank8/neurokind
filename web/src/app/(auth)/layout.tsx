import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-xl">N</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">NeuroKind</span>
        </Link>
        {children}
      </div>
      <p className="text-[var(--text-muted)] text-xs sm:text-sm text-center mt-6 sm:mt-8 px-4">
        A sensory-friendly space for the neurodivergent community
      </p>
    </div>
  );
}

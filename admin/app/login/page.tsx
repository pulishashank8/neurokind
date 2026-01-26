import { redirect } from 'next/navigation';
import { isAuthenticated, validatePassword, setSession, isPasswordConfigured } from '@/lib/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const passwordConfigured = isPasswordConfigured();
  
  if (!passwordConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
            <p className="text-gray-500 mt-4">
              The ADMIN_PASSWORD secret is not configured. Please set the ADMIN_PASSWORD 
              environment variable to enable admin access.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const error = params.error;

  async function login(formData: FormData) {
    'use server';
    
    const password = formData.get('password') as string;
    
    if (validatePassword(password)) {
      await setSession();
      redirect('/dashboard');
    } else {
      redirect('/login?error=invalid');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">NeuroKid Admin</h1>
          <p className="text-gray-500 mt-2">Enter your admin password to continue</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            Invalid password. Please try again.
          </div>
        )}
        
        <form action={login}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

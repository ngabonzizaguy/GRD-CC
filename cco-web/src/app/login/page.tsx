'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Lock, User } from 'lucide-react';
import { apiClient, ApiError } from '@admin/lib/api-client';
import type { AdminUser } from '@admin/types';
import { useAuthStore } from '@/stores/auth-store';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

function CcoLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, isAuthenticated, checkAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchParams.get('error') === 'super_admin_only') {
      setError('Command Center requires a super_admin account.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        setError('Enter username and password');
        return;
      }

      let userData: AdminUser;

      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 600));
        userData = {
          id: 1,
          admin_id: 'DEMO_ADMIN_001',
          username,
          email: `${username}@greenrideafrica.com`,
          first_name: username,
          last_name: 'Admin',
          full_name: `${username} Admin`,
          role: 'super_admin',
          status: 'active',
          active_status: 'online',
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', `demo_token_${Date.now()}`);
        }
      } else {
        const response = await apiClient.login(username, password);
        userData = response.data.user as AdminUser;
      }

      if (userData.role !== 'super_admin') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
        }
        setError('This account is not authorized for Command Center (super_admin only).');
        return;
      }

      setUser(userData);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.serverMessage || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">GreenRide</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Command Center</h1>
          <p className="mt-1 text-sm text-neutral-500">Standalone superuser console</p>
        </div>

        {error ? (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Username</span>
            <span className="relative flex">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                className="w-full rounded-md border border-neutral-200 py-2 pl-9 pr-3 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Password</span>
            <span className="relative flex">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-md border border-neutral-200 py-2 pl-9 pr-10 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Open Command Center'}
          </button>
        </form>

        {DEMO_MODE ? (
          <p className="mt-4 text-center text-xs text-neutral-500">
            Demo mode: any credentials sign in as super_admin.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function CcoLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
          Loading…
        </div>
      }
    >
      <CcoLoginForm />
    </Suspense>
  );
}

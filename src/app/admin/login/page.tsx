"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    signIn("azure-ad", { callbackUrl: "/admin" });
  };

  return (
    <div className="container" style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', alignItems: 'center' }}>
      <div style={{ flex: 1, padding: '2rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Portal Identity
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#111827' }}>
          Storkfort Health
        </h1>
      </div>
      <div style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Admin login</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>Enter your admin credentials to continue.</p>

          <form onSubmit={handleLogin} className="flex-col gap-4">
            <div className="flex-col gap-2 mt-4">
              <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#0078d4' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 21 21"><path fill="#f35325" d="M0 0h10v10H0z"/><path fill="#81bc06" d="M11 0h10v10H11z"/><path fill="#05a6f0" d="M0 11h10v10H0z"/><path fill="#ffba08" d="M11 11h10v10H11z"/></svg>
                Sign in with Microsoft
              </button>
              <Link href="/" className="btn" style={{ width: '100%', borderRadius: 'var(--radius-md)', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', textAlign: 'center', display: 'block' }}>
                Back to public verifier
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

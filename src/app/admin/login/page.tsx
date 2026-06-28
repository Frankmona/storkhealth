"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "4rem 1.5rem", display: "flex", justifyContent: "center" }}>
      <div className="card animate-slide-up" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary)", marginBottom: "1.5rem", textAlign: "center" }}>
          Admin Login
        </h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              id="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@storkfort.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          <button className="btn" onClick={() => signIn('azure-ad', { callbackUrl: '/admin/dashboard' })} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            Sign in with Microsoft
          </button>
        </div>

        {error && (
          <div style={{ marginTop: "1rem", color: "var(--color-error)", textAlign: "center", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

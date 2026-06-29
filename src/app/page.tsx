"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";

export default function Home() {
  const [certNum, setCertNum] = useState("");
  const [nin, setNin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (error) {
      timeoutId = setTimeout(() => {
        setError("");
      }, 5000); // Clear error after 5 seconds
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [error]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Intended API endpoint
      const res = await fetch(`/api/verify?certNum=${encodeURIComponent(certNum)}&nin=${encodeURIComponent(nin)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("No matching certificates");
        } else {
          setError("An error occurred during verification.");
        }
      } else {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-sm" style={{ padding: '2rem 1.5rem' }}>
      <div className="card mb-6 animate-slide-up" style={{ padding: '2.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6b7280', marginBottom: '0.5rem' }}>PUBLIC VERIFIER</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          Check certificate status
        </h1>
        <p style={{ color: '#4b5563', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Search by certificate number or National ID/Passport to confirm certificates is valid and current.
        </p>

        <form onSubmit={handleVerify} className="flex-col gap-4">
          <div>
            <label htmlFor="certNum" className="label">
              Certificate number
            </label>
            <input
              type="text"
              id="certNum"
              className="input-field"
              placeholder="Enter certificate number"
              value={certNum}
              onChange={(e) => setCertNum(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="nin" className="label">
              National ID/Passport
            </label>
            <input
              type="text"
              id="nin"
              className="input-field"
              placeholder="Enter National ID/Passport"
              value={nin}
              onChange={(e) => setNin(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-8" style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Fetching results...
              </>
            ) : (
              <>
                <Search size={16} /> Verify certificate
              </>
            )}
          </button>
        </form>
      </div>

      <div className="card animate-slide-up" style={{ padding: '2.5rem', animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Verification result</h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>Read-only verification results from the live certificate table.</p>

        {loading && (
          <div style={{ padding: '3rem 2rem', backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: 'var(--radius-md)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <Loader2 size={32} color="#54a69c" className="animate-spin" />
            <div style={{ color: '#54a69c', fontSize: '0.875rem', fontWeight: 600 }}>Securely querying Storkfort Dataverse...</div>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '2rem', backgroundColor: '#fee2e2', border: '1px solid #f87171', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#b91c1c', fontSize: '0.875rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {!loading && !error && !result && (
          <div style={{ padding: '2rem', backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb', borderRadius: 'var(--radius-md)', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>
            Enter a certificate number or National ID to begin verification.
          </div>
        )}

        {!loading && result && (
          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ color: 'var(--color-success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Valid Certificate Found
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", fontSize: "0.95rem" }}>
              <div><strong>Holder:</strong> {result.yips_holderfullname}</div>
              <div><strong>ID/Passport:</strong> {result.yips_nationalidpassport}</div>
              {result.yips_MedicalOfficer && <div><strong>Medical Officer:</strong> {result.yips_MedicalOfficer.yips_fullname || result.yips_MedicalOfficer.yips_name || 'Assigned'}</div>}
              <div><strong>Issue Date:</strong> {result.yips_issuedate ? new Date(result.yips_issuedate).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Expiry Date:</strong> {result.yips_expirydate ? new Date(result.yips_expirydate).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Status:</strong> <span style={{ padding: "0.25rem 0.5rem", backgroundColor: result.yips_certificatestatus === 341150000 ? 'var(--color-success)' : result.yips_certificatestatus === 341150002 ? 'var(--color-error)' : 'var(--color-warning)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700 }}>
                {result.yips_certificatestatus === 341150000 ? 'FIT' : result.yips_certificatestatus === 341150001 ? 'UNFIT' : result.yips_certificatestatus === 341150002 ? 'REVOKED' : 'UNKNOWN'}
              </span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

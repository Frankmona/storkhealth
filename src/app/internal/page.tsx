"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function InternalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [medicalOfficerId, setMedicalOfficerId] = useState("");
  const [status, setStatus] = useState("341150000");
  const [occupationalPractitionerId, setOccupationalPractitionerId] = useState("");
  const [medicalType, setMedicalType] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [comments, setComments] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess(false);

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          nationalId,
          companyName,
          medicalOfficerId,
          status,
          occupationalPractitionerId,
          medicalType,
          issueDate,
          expiryDate,
          comments
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save certificate");
      }

      setFormSuccess(true);
      // Reset form
      setFullName("");
      setNationalId("");
      setCompanyName("");
      setComments("");
      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
      }, 2000);
    } catch (err) {
      setFormError("Failed to save certificate to Dataverse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Internal login</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>Enter your staff email and password to continue.</p>

            <form onSubmit={handleLogin} className="flex-col gap-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. frank@sh.co.bw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mt-4">
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex-col gap-2 mt-8">
                <button type="submit" className="btn btn-primary" style={{ width: '100%', borderRadius: 'var(--radius-md)' }}>
                  Sign in
                </button>
                <Link href="/" className="btn" style={{ width: '100%', borderRadius: 'var(--radius-md)', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                  Back to public verifier
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: 'var(--color-secondary)', borderRadius: 'var(--radius-lg)', color: 'white', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ backgroundColor: 'white', color: 'var(--color-accent)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
            FO
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Frank Oguche</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>frank@sh.co.bw</div>
          </div>
          <ChevronLeft size={16} color="#9ca3af" />
        </div>
        
        <div style={{ padding: '1rem' }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><UserIcon size={16} /> Profile</span>
            <ChevronDown size={16} />
          </button>
          
          <button onClick={() => setIsLoggedIn(false)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            <LogOut size={16} /> Sign out
          </button>
          
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
          
          <Link href="/" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', textDecoration: 'none' }}>
            <ChevronLeft size={16} /> Back to public verifier
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6b7280', textTransform: 'uppercase' }}>INTERNAL WORKSPACE</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Certificate entry</h2>
            </div>
            <button className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Close certificate entry' : 'New certificate entry'}
            </button>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Create or update live Dataverse certificate records.</p>
        </div>

        {showForm ? (
          <div className="card animate-slide-up" style={{ padding: '2rem' }}>
            <form className="flex-col gap-6" onSubmit={handleCertificateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="label">Certificate number</label>
                  <input type="text" className="input-field" disabled placeholder="Generated automatically when you save" style={{ backgroundColor: '#f9fafb' }} />
                </div>
                <div>
                  <label className="label">Full name *</label>
                  <input type="text" className="input-field" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="label">National ID/Passport *</label>
                  <input type="text" className="input-field" required value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label">Company name *</label>
                  <input type="text" className="input-field" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Medical officer</label>
                  <select className="input-field" value={medicalOfficerId} onChange={(e) => setMedicalOfficerId(e.target.value)}>
                    <option value="">No medical officer assigned</option>
                    <option value="id-1">Dr. Smith</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status *</label>
                  <select className="input-field" required value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="341150000">Fit</option>
                    <option value="341150001">Unfit</option>
                    <option value="341150002">Revoked</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label">Occupational medical practitioner</label>
                  <select className="input-field" value={occupationalPractitionerId} onChange={(e) => setOccupationalPractitionerId(e.target.value)}>
                    <option value="">No occupational medical practitioner assigned</option>
                    <option value="id-2">Dr. Jones</option>
                  </select>
                </div>
                <div>
                  <label className="label">Medical type</label>
                  <select className="input-field" value={medicalType} onChange={(e) => setMedicalType(e.target.value)}>
                    <option value="">Select medical type</option>
                    <option value="341150000">Entry</option>
                    <option value="341150001">Periodic</option>
                    <option value="341150002">Exit Medical</option>
                    <option value="341150003">Special Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="label">Issue date *</label>
                  <input type="date" className="input-field" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label">Expiry date *</label>
                  <input type="date" className="input-field" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label className="label">Comments</label>
                <textarea className="input-field" rows={4} style={{ resize: 'vertical' }} value={comments} onChange={(e) => setComments(e.target.value)}></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" className="btn" style={{ backgroundColor: '#f3f4f6', color: '#374151', borderRadius: 'var(--radius-full)' }} onClick={() => setShowForm(false)}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save certificate'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card animate-slide-up" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Certificate register</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Search, review, edit, and delete live certificate records.</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div style={{ flex: 1, position: 'relative' }}>
                <input type="text" className="input-field" placeholder="Search by certificate, holder, or ID" style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }} />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <select className="input-field" style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }}>
                <option>All statuses</option>
              </select>
              <select className="input-field" style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }}>
                <option>All officers</option>
              </select>
              <button className="btn" style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-full)', color: '#374151' }}>
                Clear filters
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Certificate number</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Holder</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>National ID/Passport</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Officer</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Issue date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Expiry date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
                      No live certificates match the current filters.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end items-center gap-2 mt-4" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <button className="btn" style={{ padding: '0.25rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: '#f9fafb' }}>Previous</button>
              <span>Page 1 of 1</span>
              <button className="btn" style={{ padding: '0.25rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: '#f9fafb' }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

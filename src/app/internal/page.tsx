"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, LogOut, User as UserIcon, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function InternalPage() {
  const { data: session, status: authStatus } = useSession();
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [occupationalPractitioners, setOccupationalPractitioners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const fetchCertificates = async () => {
    setIsLoadingCerts(true);
    try {
      const res = await fetch("/api/certificates");
      if (res.ok) {
        const result = await res.json();
        setCertificates(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch certificates", err);
    } finally {
      setIsLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (session && !showForm) {
      fetchCertificates();
    }
    if (session && showForm) {
      fetch('/api/medical-officers').then(res => res.json()).then(data => {
        if(data.data) setMedicalOfficers(data.data);
      });
      fetch('/api/occupational-practitioners').then(res => res.json()).then(data => {
        if(data.data) setOccupationalPractitioners(data.data);
      });
    }
  }, [session, showForm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);


  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setNationalId("");
    setCompanyName("");
    setComments("");
    setFormError("");
    setMedicalOfficerId("");
    setOccupationalPractitionerId("");
    setMedicalType("");
    setStatus("341150000");
    setIssueDate("");
    setExpiryDate("");
    setFormSuccess(false);
  };

  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess(false);

    try {
      const url = editingId ? `/api/certificates/${editingId}` : "/api/certificates";
      const method = editingId ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
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
          comments,
          callerId: (session?.user as any)?.id || "unknown",
          userName: session?.user?.name || "System",
          certName: editingId ? (certificates.find(c => c.yips_certificatesid === editingId)?.yips_certificatename || nationalId) : nationalId
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save certificate");
      }

      resetForm();
      setShowForm(false);
      fetchCertificates();
    } catch (err: any) {
      setFormError(err.message || "Failed to save certificate to Dataverse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cert: any) => {
    setFormError("");
    setEditingId(cert.yips_certificatesid);
    setFullName(cert.yips_holderfullname || "");
    setNationalId(cert.yips_nationalidpassport || "");
    setCompanyName(cert.yips_companyname || "");
    setStatus(cert.yips_certificatestatus?.toString() || "341150000");
    setIssueDate(cert.yips_issuedate ? cert.yips_issuedate.split('T')[0] : "");
    setExpiryDate(cert.yips_expirydate ? cert.yips_expirydate.split('T')[0] : "");
    
    // Set lookup properties if they exist
    setMedicalOfficerId(cert.yips_MedicalOfficer?.yips_medicalofficersid || cert._yips_medicalofficer_value || "");
    setOccupationalPractitionerId(cert.yips_OccupationalMedicalPractitioner?.yips_occupationalmedicalpractionerid || cert._yips_occupationalmedicalpractitioner_value || "");
    
    setShowForm(true);
  };

  const handleDelete = async (id: string, certName: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const res = await fetch(`/api/certificates/${id}?userName=${encodeURIComponent(session?.user?.name || "System")}&certName=${encodeURIComponent(certName || "Unknown")}`, { method: "DELETE" });
      if (res.ok) {
        fetchCertificates();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const getStatusText = (statusVal: number) => {
    switch (statusVal) {
      case 341150000: return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#e2faea', color: '#0d7d40', borderRadius: '9999px', fontWeight: 600, fontSize: '0.75rem' }}>Fit</span>;
      case 341150001: return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '9999px', fontWeight: 600, fontSize: '0.75rem' }}>Unfit</span>;
      case 341150002: return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#ffedd5', color: '#c2410c', borderRadius: '9999px', fontWeight: 600, fontSize: '0.75rem' }}>Revoked</span>;
      default: return <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', color: '#4b5563', borderRadius: '9999px', fontWeight: 600, fontSize: '0.75rem' }}>Unknown</span>;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    let matchesSearch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matchesSearch = (
        (cert.yips_certificatename || "").toLowerCase().includes(q) ||
        (cert.yips_holderfullname || "").toLowerCase().includes(q) ||
        (cert.yips_nationalidpassport || "").toLowerCase().includes(q)
      );
    }
    
    let matchesStatus = true;
    if (filterStatus !== "All statuses") {
      let numericStatus = 0;
      if (filterStatus === "FIT") numericStatus = 341150000;
      else if (filterStatus === "UNFIT") numericStatus = 341150001;
      else if (filterStatus === "REVOKED") numericStatus = 341150002;
      
      matchesStatus = (cert.yips_certificatestatus === numericStatus);
    }
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (authStatus === "loading") {
    return (
      <div className="container" style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container" style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', alignItems: 'center' }}>
        <div style={{ flex: 1, padding: '2rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            Portal Identity
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#111827' }}>
            Storkfort Health
          </h1>
        </div>
        <div style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '400px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Internal login</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>Sign in with your Microsoft account to continue.</p>

            <div className="flex-col gap-4">
              <div className="flex-col gap-2 mt-4">
                <button 
                  onClick={() => signIn("azure-ad", { callbackUrl: "/internal" })} 
                  className="btn btn-primary" 
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#0078d4' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 21 21"><path fill="#f35325" d="M0 0h10v10H0z"/><path fill="#81bc06" d="M11 0h10v10H11z"/><path fill="#05a6f0" d="M0 11h10v10H0z"/><path fill="#ffba08" d="M11 11h10v10H11z"/></svg>
                  Sign in with Microsoft
                </button>
                <Link href="/" className="btn" style={{ width: '100%', borderRadius: 'var(--radius-md)', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', textAlign: 'center', display: 'block' }}>
                  Back to public verifier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar - EXACT DESIGN MATCH */}
      <div style={{ width: '280px', backgroundColor: 'var(--color-secondary)', color: 'white', flexShrink: 0 }}>
        {/* Profile Block */}
        <div style={{ padding: '1.5rem 1rem' }}>
          <div style={{ backgroundColor: '#1e333a', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#62a8a6', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
              {session?.user?.name ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{session?.user?.name || 'Staff User'}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{session?.user?.email || 'staff@storkfort.com'}</div>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'white', color: '#111827', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><UserIcon size={16} color="#6b7280" /> Profile</span>
          </button>
          
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer' }}>
            <LogOut size={16} /> Sign out
          </button>
          
          <Link href="/" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', textDecoration: 'none' }}>
            <ChevronLeft size={16} /> Back to public verifier
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        {showForm ? (
          <div className="card animate-fade-in" style={{ padding: '2.5rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>INTERNAL WORKSPACE</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Certificate entry</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Create or update live Dataverse certificate records.</p>
              </div>
              <button 
                className="btn" 
                style={{ backgroundColor: '#6b7280', color: 'white', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem' }} 
                onClick={() => { resetForm(); setShowForm(false); }}
              >
                Close certificate entry
              </button>
            </div>

            {formError && (
              <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                {formError}
              </div>
            )}
            
            <form className="flex-col gap-6" onSubmit={handleCertificateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Certificate number</label>
                  <input type="text" className="input-field" disabled placeholder="Generated automatically when you save" style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Full name *</label>
                  <input type="text" className="input-field" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>National ID/Passport *</label>
                  <input type="text" className="input-field" required value={nationalId} onChange={(e) => setNationalId(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Company name *</label>
                  <input type="text" className="input-field" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Medical officer</label>
                  <select className="input-field" value={medicalOfficerId} onChange={(e) => setMedicalOfficerId(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="">No medical officer assigned</option>
                    {medicalOfficers.map(mo => (
                      <option key={mo.yips_medicalofficersid} value={mo.yips_medicalofficersid}>
                        {mo.yips_name || mo.yips_fullname || 'Unnamed Officer'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Status *</label>
                  <select className="input-field" required value={status} onChange={(e) => setStatus(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="341150000">Fit</option>
                    <option value="341150001">Unfit</option>
                    <option value="341150002">Revoked</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Occupational medical practitioner</label>
                  <select className="input-field" value={occupationalPractitionerId} onChange={(e) => setOccupationalPractitionerId(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="">No practitioner assigned</option>
                    {occupationalPractitioners.map(op => (
                      <option key={op.yips_occupationalmedicalpractionerid} value={op.yips_occupationalmedicalpractionerid}>
                        {op.yips_name || op.yips_fullname || 'Unnamed Practitioner'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Medical type</label>
                  <select className="input-field" value={medicalType} onChange={(e) => setMedicalType(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="">Select medical type</option>
                    <option value="341150000">Entry</option>
                    <option value="341150001">Periodic</option>
                    <option value="341150002">Exit Medical</option>
                    <option value="341150003">Special Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Issue date *</label>
                  <input type="date" className="input-field" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Expiry date *</label>
                  <input type="date" className="input-field" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label className="label" style={{ fontSize: '0.8rem' }}>Comments</label>
                <textarea className="input-field" rows={4} style={{ resize: 'vertical', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} value={comments} onChange={(e) => setComments(e.target.value)}></textarea>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 2rem', backgroundColor: '#54a69c' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save certificate'}
                </button>
                <button type="button" className="btn" style={{ backgroundColor: '#f3f4f6', color: '#374151', borderRadius: 'var(--radius-full)', padding: '0.6rem 2rem' }} onClick={() => {
                  setFullName(""); setNationalId(""); setCompanyName(""); setComments("");
                }}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card animate-fade-in" style={{ padding: '2.5rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}>
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>INTERNAL WORKSPACE</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Certificate register</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Search, review, edit, and delete live certificate records.</p>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem', backgroundColor: '#54a69c' }} 
                onClick={() => { resetForm(); setShowForm(true); }}
              >
                New certificate entry
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search by certificate, holder, or ID" 
                  style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <select 
                className="input-field" 
                style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All statuses">All statuses</option>
                <option value="FIT">Fit</option>
                <option value="UNFIT">Unfit</option>
                <option value="REVOKED">Revoked</option>
              </select>
              <button 
                className="btn" 
                style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-full)', color: '#374151' }}
                onClick={() => { setSearchQuery(""); setFilterStatus("All statuses"); }}
              >
                Clear filters
              </button>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280' }}>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Certificate #</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Holder</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>National ID/Passport</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Issue date</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Expiry date</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Created By</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingCerts ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
                        Loading certificates...
                      </td>
                    </tr>
                  ) : filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
                        No live certificates match the current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedCertificates.map((cert) => (
                      <tr key={cert.yips_certificatesid} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: '#111827' }}>
                          {cert.yips_certificatename}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_holderfullname}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_nationalidpassport}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_issuedate ? new Date(cert.yips_issuedate).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_expirydate ? new Date(cert.yips_expirydate).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          {getStatusText(cert.yips_certificatestatus)}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>
                          {cert.createdby?.fullname || 'System'}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={() => handleEdit(cert)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#62a8a6', transition: 'transform 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(cert.yips_certificatesid, cert.yips_certificatename)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', transition: 'transform 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-6" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <div>Showing {filteredCertificates.length} certificates (Page {totalPages > 0 ? currentPage : 0} of {totalPages})</div>
              <div className="flex items-center gap-2">
                <button 
                  className="btn" 
                  style={{ padding: '0.35rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button 
                  className="btn" 
                  style={{ padding: '0.35rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1, cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

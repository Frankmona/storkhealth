"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, LogOut, User as UserIcon, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";


const toTitleCase = (str: string) => {
  return str.split(' ').map(word => {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

export default function InternalPage() {
  const { data: session, status: authStatus } = useSession();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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
    if (session) {
      fetchCertificates();
    }
  }, [session]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

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
        (cert.yips_nationalidpassport || "").toLowerCase().includes(q) ||
        (cert.yips_companyname || "").toLowerCase().includes(q)
      );
    }
    
    let matchesStatus = true;
    if (filterStatus !== "All Statuses") {
      let numericStatus = 0;
      if (filterStatus === "FIT") numericStatus = 341150000;
      else if (filterStatus === "UNFIT") numericStatus = 341150001;
      else if (filterStatus === "REVOKED") numericStatus = 341150002;
      
      matchesStatus = (cert.yips_certificatestatus === numericStatus);
    }

    let matchesDate = true;
    if (startDate) {
      const issueDate = new Date(cert.yips_issuedate || 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (issueDate < start) matchesDate = false;
    }
    if (endDate && matchesDate) {
      const issueDate = new Date(cert.yips_issuedate || 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (issueDate > end) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
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
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>Sign In with your Microsoft account to continue.</p>

            <div className="flex-col gap-4">
              <div className="flex-col gap-2 mt-4">
                <button 
                  onClick={() => signIn("azure-ad", { callbackUrl: "/internal" })} 
                  className="btn btn-primary" 
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#0078d4' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 21 21"><path fill="#f35325" d="M0 0h10v10H0z"/><path fill="#81bc06" d="M11 0h10v10H11z"/><path fill="#05a6f0" d="M0 11h10v10H0z"/><path fill="#ffba08" d="M11 11h10v10H11z"/></svg>
                  Sign In with Microsoft
                </button>
                <Link href="/" className="btn" style={{ width: '100%', borderRadius: 'var(--radius-md)', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', textAlign: 'center', display: 'block' }}>
                  Back to Public Verifier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 56px)', backgroundColor: '#f8fafc' }}>
      
      {/* Sidebar - EXACT DESIGN MATCH */}
      <div className="dashboard-sidebar" style={{ width: '280px', backgroundColor: 'var(--color-secondary)', color: 'white', flexShrink: 0 }}>
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
            <LogOut size={16} /> Sign Out
          </button>
          
          <Link href="/" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', textDecoration: 'none' }}>
            <ChevronLeft size={16} /> Back to Public Verifier
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main" style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
          <div className="card animate-fade-in" style={{ padding: '2.5rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}>
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>INTERNAL WORKSPACE</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Certificate Register</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Search and review live certificate records.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search by certificate, holder, company, or ID" 
                  style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
                            <input 
                type="date" 
                className="input-field" 
                style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white', color: startDate ? 'black' : '#9ca3af' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input 
                type="date" 
                className="input-field" 
                style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white', color: endDate ? 'black' : '#9ca3af' }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <select 
                className="input-field" 
                style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All Statuses">All Statuses</option>
                <option value="FIT">Fit</option>
                <option value="UNFIT">Unfit</option>
                <option value="REVOKED">Revoked</option>
              </select>
              <button 
                className="btn" 
                style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-full)', color: '#374151' }}
                onClick={() => { setSearchQuery(""); setFilterStatus("All Statuses"); setStartDate(""); setEndDate(""); }}
              >
                Clear Filters
              </button>
            </div>

            <div style={{ overflowX: 'auto', backgroundColor: 'white' }}>
              <div className="table-responsive-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280' }}>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Unique ID</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Certificate Number</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Holder</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>National ID/Passport</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Company</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Issue Date</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Expiry Date</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Work As</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Created By</th>
                    <th style={{ padding: '1rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingCerts ? (
                    <tr>
                      <td colSpan={12} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
                        Loading Certificates...
                      </td>
                    </tr>
                  ) : filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
                        No Live Certificates Match the Current Filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedCertificates.map((cert) => (
                      <tr key={cert.yips_certificatesid} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 600, color: '#111827' }}>
                          {cert.yips_certificatename}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_certificatenumber || '-'}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_holderfullname}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_nationalidpassport}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_companyname || '-'}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_issuedate ? new Date(cert.yips_issuedate).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_expirydate ? new Date(cert.yips_expirydate).toLocaleDateString() : '-'}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>
                          {getStatusText(cert.yips_certificatestatus)}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>{cert.yips_workas || '-'}</td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>
                          {cert.createdby?.fullname || 'System'}
                        </td>
                        <td style={{ padding: '1rem 0.75rem', color: '#4b5563' }}>
                          {cert.createdon ? new Date(cert.createdon).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
</div>
            </div>
            
            <div className="flex justify-between items-center mt-6" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <div>Showing {filteredCertificates.length} Certificates (Page {totalPages > 0 ? currentPage : 0} of {totalPages})</div>
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
          </div>
    </div>
  );
}

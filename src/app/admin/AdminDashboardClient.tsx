"use client";

import { useState, useEffect } from "react";
import { User, LogOut, ChevronLeft, FileText, CheckCircle, AlertCircle, XCircle, Globe, Users, Lock, Plus, Edit, Trash2, FileDown, ShieldCheck, Search, Download } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";


const toTitleCase = (str: string) => {
  return str.split(' ').map(word => {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

export default function AdminDashboardClient({ 
  session, 
  stats 
}: { 
  session: any; 
  stats: { total: number; fit: number; unfit: number; revoked: number } 
}) {
  
  const [showMedicalOfficerList, setShowMedicalOfficerList] = useState(false);
  const [showOccupationalList, setShowOccupationalList] = useState(false);
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [occupationalPractitioners, setOccupationalPractitioners] = useState<any[]>([]);
  
  const [moPage, setMoPage] = useState(1);
  const [opPage, setOpPage] = useState(1);
  const itemsPerPage = 15;
  


  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrails, setAuditTrails] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("All Event Types");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");

  const [showVerificationHistory, setShowVerificationHistory] = useState(false);
  const [verificationHistories, setVerificationHistories] = useState<any[]>([]);
  const [vhPage, setVhPage] = useState(1);
  const [vhSearch, setVhSearch] = useState("");
  const [vhStartDate, setVhStartDate] = useState("");
  const [vhEndDate, setVhEndDate] = useState("");

  const [showCertificates, setShowCertificates] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certSearchQuery, setCertSearchQuery] = useState("");
  const [certStartDate, setCertStartDate] = useState("");
  const [certEndDate, setCertEndDate] = useState("");
  const [certFilterStatus, setCertFilterStatus] = useState("All Statuses");
  const [certPage, setCertPage] = useState(1);



  const fetchMedicalOfficers = async () => {
    try {
      const res = await fetch("/api/medical-officers");
      if (res.ok) {
        const data = await res.json();
        setMedicalOfficers(data.data || []);
      }
    } catch (e) {}
  };

  const fetchOccupationalPractitioners = async () => {
    try {
      const res = await fetch("/api/occupational-practitioners");
      if (res.ok) {
        const data = await res.json();
        setOccupationalPractitioners(data.data || []);
      }
    } catch (e) {}
  };

  const fetchAuditTrails = async () => {
    try {
      const res = await fetch("/api/audit-trail");
      if (res.ok) {
        const data = await res.json();
        setAuditTrails(data.data || []);
      }
    } catch (e) {}
  };

  const fetchVerificationHistories = async () => {
    try {
      const res = await fetch("/api/verification-history");
      if (res.ok) {
        const data = await res.json();
        setVerificationHistories(data.data || []);
      }
    } catch (e) {}
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates");
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.data || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchMedicalOfficers();
    fetchOccupationalPractitioners();
    fetchAuditTrails();
    fetchVerificationHistories();
    fetchCertificates();
  }, []);





  const exportToCSV = () => {
    if (filteredCertificates.length === 0) return;
    
    const headers = ["Unique ID", "Certificate Number", "Holder", "National ID/Passport", "Company", "Issue Date", "Expiry Date", "Status", "Work As"];
    const rows = filteredCertificates.map(cert => {
      let statusStr = "Unknown";
      if (cert.yips_certificatestatus === 341150000) statusStr = "Fit";
      else if (cert.yips_certificatestatus === 341150001) statusStr = "Unfit";
      else if (cert.yips_certificatestatus === 341150002) statusStr = "Revoked";

      return [
        cert.yips_certificatename || "",
        cert.yips_certificatenumber || "",
        cert.yips_holderfullname || "",
        cert.yips_nationalidpassport || "",
        cert.yips_companyname || "",
        cert.yips_issuedate ? new Date(cert.yips_issuedate).toLocaleDateString() : "",
        cert.yips_expirydate ? new Date(cert.yips_expirydate).toLocaleDateString() : "",
        statusStr,
        cert.yips_workas || ""
      ].map(v => `"${v}"`).join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `certificates_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    if (certSearchQuery) {
      const q = certSearchQuery.toLowerCase();
      matchesSearch = (
        (cert.yips_certificatename || "").toLowerCase().includes(q) ||
        (cert.yips_holderfullname || "").toLowerCase().includes(q) ||
        (cert.yips_nationalidpassport || "").toLowerCase().includes(q) ||
        (cert.yips_companyname || "").toLowerCase().includes(q)
      );
    }
    
    let matchesStatus = true;
    if (certFilterStatus !== "All Statuses") {
      let numericStatus = 0;
      if (certFilterStatus === "FIT") numericStatus = 341150000;
      else if (certFilterStatus === "UNFIT") numericStatus = 341150001;
      else if (certFilterStatus === "REVOKED") numericStatus = 341150002;
      
      matchesStatus = (cert.yips_certificatestatus === numericStatus);
    }

    let matchesDate = true;
    if (certStartDate) {
      const issueDate = new Date(cert.yips_issuedate || 0);
      const start = new Date(certStartDate);
      start.setHours(0, 0, 0, 0);
      if (issueDate < start) matchesDate = false;
    }
    if (certEndDate && matchesDate) {
      const issueDate = new Date(cert.yips_issuedate || 0);
      const end = new Date(certEndDate);
      end.setHours(23, 59, 59, 999);
      if (issueDate > end) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const certTotalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const certPaginated = filteredCertificates.slice((certPage - 1) * itemsPerPage, certPage * itemsPerPage);

  const moTotalPages = Math.ceil(medicalOfficers.length / itemsPerPage);
  const moPaginated = medicalOfficers.slice((moPage - 1) * itemsPerPage, moPage * itemsPerPage);

  const opTotalPages = Math.ceil(occupationalPractitioners.length / itemsPerPage);
  const opPaginated = occupationalPractitioners.slice((opPage - 1) * itemsPerPage, opPage * itemsPerPage);

  const vhFiltered = verificationHistories.filter(vh => {
    let matchesSearch = true;
    if (vhSearch) {
      matchesSearch = (vh.yips_certificatenumber || "").toLowerCase().includes(vhSearch.toLowerCase());
    }
    let matchesDate = true;
    if (vhStartDate || vhEndDate) {
      const vhDate = new Date(vh.yips_verifiedat || vh.createdon);
      if (vhStartDate) {
        matchesDate = matchesDate && vhDate >= new Date(vhStartDate);
      }
      if (vhEndDate) {
        const endDate = new Date(vhEndDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && vhDate <= endDate;
      }
    }
    return matchesSearch && matchesDate;
  });
  const vhTotalPages = Math.ceil(vhFiltered.length / itemsPerPage);
  const vhPaginated = vhFiltered.slice((vhPage - 1) * itemsPerPage, vhPage * itemsPerPage);

  const filteredAuditTrails = auditTrails.filter(trail => {
    let matchesSearch = true;
    if (auditSearch) {
      matchesSearch = (trail.yips_eventname || "").toLowerCase().includes(auditSearch.toLowerCase());
    }
    let matchesFilter = true;
    if (auditFilter !== "All Event Types") {
      matchesFilter = (trail.yips_eventtype || "") === auditFilter;
    }
    let matchesDate = true;
    if (auditStartDate || auditEndDate) {
      const trailDate = new Date(trail.createdon);
      if (auditStartDate) {
        matchesDate = matchesDate && trailDate >= new Date(auditStartDate);
      }
      if (auditEndDate) {
        const endDate = new Date(auditEndDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && trailDate <= endDate;
      }
    }
    return matchesSearch && matchesFilter && matchesDate;
  });

  const exportAuditCSV = () => {
    if (filteredAuditTrails.length === 0) return;
    const headers = ['Event Name', 'Unique ID', 'Certificate Number', 'Event Type', 'Timestamp', 'Modified By'];
    const csvRows = [headers.join(',')];
    filteredAuditTrails.forEach(trail => {
      const nameParts = (trail.yips_eventname || "").split("::");
      const displayEventName = nameParts[0];
      const customUserName = nameParts.length > 1 ? nameParts[1] : null;
      const customCertName = nameParts.length > 2 ? nameParts[2] : null;
      const customCertNumber = nameParts.length > 3 ? nameParts[3] : null;

      const certName = customCertName || trail['_yips_certificate_value@OData.Community.Display.V1.FormattedValue'] || "-";
      const certNumber = customCertNumber || trail.yips_Certificate?.yips_certificatenumber || trail.yips_certificatenumber || "-";
      const eventType = trail['yips_eventtype@OData.Community.Display.V1.FormattedValue'] || trail.yips_eventtype;
      const timestamp = new Date(trail.createdon).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/,/g, '');
      const modifiedBy = customUserName || trail['_createdby_value@OData.Community.Display.V1.FormattedValue'] || trail.yips_modifiedby || "System";

      const row = [
        `"${displayEventName}"`,
        `"${certName}"`,
        `"${certNumber}"`,
        `"${eventType}"`,
        `"${timestamp}"`,
        `"${modifiedBy}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "audit_trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const auditTotalPages = Math.ceil(filteredAuditTrails.length / itemsPerPage);
  const auditPaginated = filteredAuditTrails.slice((auditPage - 1) * itemsPerPage, auditPage * itemsPerPage);

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'var(--font-inter)' }}>
      {/* Left Sidebar */}
      <div className="dashboard-sidebar" style={{ width: '280px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2rem', height: '2rem', backgroundColor: '#10b981', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: '#9ca3af', textTransform: 'uppercase' }}>STORKFORT HEALTH</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Online Verification Portal</div>
          </div>
        </div>

        <div style={{ padding: '2rem 1.5rem', flex: 1 }}>
          <div style={{ backgroundColor: '#374151', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#54a69c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                {session?.user?.name ? session.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{session?.user?.name || 'Administrator'}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{session?.user?.email || 'admin@sh.co.bw'}</div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'white', color: '#111827', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><User size={16} color="#6b7280" /> Profile</span>
            </button>
            
            <button onClick={() => signOut()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer' }}>
              <LogOut size={16} /> Sign Out
            </button>
            
            <Link href="/" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', textDecoration: 'none' }}>
              <ChevronLeft size={16} /> Back to Public Verifier
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Nav */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
              <Globe size={16} /> Public Verifier
            </Link>
            <Link href="/internal" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
              <Users size={16} /> Internal Staff
            </Link>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', backgroundColor: '#54a69c', textDecoration: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
              <Lock size={16} /> Admin
            </Link>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-main-content" style={{ padding: '2rem 3rem', flex: 1, overflowY: 'auto' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>ADMINISTRATOR DASHBOARD</h2>
          
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
                <FileText size={20} color="#4b5563" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>Total Certificates</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{stats.total}</div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem' }}>
                <CheckCircle size={20} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>Fit</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{stats.fit}</div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#fef08a', borderRadius: '0.5rem' }}>
                <AlertCircle size={20} color="#eab308" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>Unfit</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{stats.unfit}</div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#fecaca', borderRadius: '0.5rem' }}>
                <XCircle size={20} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>Revoked Certificates</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{stats.revoked}</div>
              </div>
            </div>
          </div>

          {/* Action Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: '#f0fdfa', borderRadius: '50%' }}>
                  <Users size={20} color="#0d9488" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Create User Accounts</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Accounts are managed in Microsoft Admin Center.</div>
                </div>
              </div>
              <a href="https://admin.microsoft.com" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                + Create User Accounts
              </a>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, border: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f0fdfa', borderRadius: '50%' }}>
                    <CheckCircle size={20} color="#0d9488" />
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Medical Officer</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowMedicalOfficerList(!showMedicalOfficerList)} className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'white' }}>
                    {showMedicalOfficerList ? 'Hide list' : 'View list'}
                  </button>
                </div>
              </div>
              {showMedicalOfficerList && (
                <div style={{ padding: '0 1.5rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', margin: '1rem 0', letterSpacing: '0.05em' }}>REGISTERED OFFICERS</h4>
                  {medicalOfficers.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {moPaginated.map((mo: any) => (
                          <div key={mo.yips_medicalofficersid} style={{ padding: '0.75rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <User size={14} color="#9ca3af" /> {mo.yips_fullname}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        <div>Showing {moPaginated.length} of {medicalOfficers.length} (Page {moTotalPages > 0 ? moPage : 0} of {moTotalPages})</div>
                        <div className="flex items-center gap-2">
                          <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: moPage === 1 ? 0.5 : 1, cursor: moPage === 1 ? 'not-allowed' : 'pointer' }} onClick={() => setMoPage(p => Math.max(1, p - 1))} disabled={moPage === 1}>Previous</button>
                          <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: moPage === moTotalPages || moTotalPages === 0 ? 0.5 : 1, cursor: moPage === moTotalPages || moTotalPages === 0 ? 'not-allowed' : 'pointer' }} onClick={() => setMoPage(p => Math.min(moTotalPages, p + 1))} disabled={moPage === moTotalPages || moTotalPages === 0}>Next</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No Medical Officers Found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, border: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f0fdfa', borderRadius: '50%' }}>
                    <CheckCircle size={20} color="#0d9488" />
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Occupational Medical Practitioner</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowOccupationalList(!showOccupationalList)} className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'white' }}>
                    {showOccupationalList ? 'Hide list' : 'View list'}
                  </button>
                </div>
              </div>
              {showOccupationalList && (
                <div style={{ padding: '0 1.5rem 1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', margin: '1rem 0', letterSpacing: '0.05em' }}>REGISTERED PRACTITIONERS</h4>
                  {occupationalPractitioners.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {opPaginated.map((op: any) => (
                          <div key={op.yips_occupationalmedicalpractionerid} style={{ padding: '0.75rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <User size={14} color="#9ca3af" /> {op.yips_fullname}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        <div>Showing {opPaginated.length} of {occupationalPractitioners.length} (Page {opTotalPages > 0 ? opPage : 0} of {opTotalPages})</div>
                        <div className="flex items-center gap-2">
                          <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: opPage === 1 ? 0.5 : 1, cursor: opPage === 1 ? 'not-allowed' : 'pointer' }} onClick={() => setOpPage(p => Math.max(1, p - 1))} disabled={opPage === 1}>Previous</button>
                          <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: opPage === opTotalPages || opTotalPages === 0 ? 0.5 : 1, cursor: opPage === opTotalPages || opTotalPages === 0 ? 'not-allowed' : 'pointer' }} onClick={() => setOpPage(p => Math.min(opTotalPages, p + 1))} disabled={opPage === opTotalPages || opTotalPages === 0}>Next</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No occupational practitioners found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#89caba', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color="#111827" />
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>Verification History</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowVerificationHistory(!showVerificationHistory)} className="btn" style={{ backgroundColor: '#54a69c', color: 'white', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    {showVerificationHistory ? 'Close' : 'View'}
                  </button>
                </div>
              </div>
              
              {showVerificationHistory && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>Search by Certificate Number</label>
                      <input 
                        type="text"
                        placeholder="Enter certificate number"
                        value={vhSearch}
                        onChange={e => setVhSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>Start Date</label>
                      <input 
                        type="date"
                        value={vhStartDate}
                        onChange={e => setVhStartDate(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>End Date</label>
                      <input 
                        type="date"
                        value={vhEndDate}
                        onChange={e => setVhEndDate(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button 
                        onClick={() => {
                          setVhSearch("");
                          setVhStartDate("");
                          setVhEndDate("");
                        }}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', cursor: 'pointer', height: '38px', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
                    <div className="table-responsive-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: 'white' }}>
                        <tr>
                          <th style={{ padding: '1rem', fontWeight: 500, color: '#475569', borderBottom: '1px solid #cbd5e1' }}>Certificate Number</th>
                          <th style={{ padding: '1rem', fontWeight: 500, color: '#475569', borderBottom: '1px solid #cbd5e1' }}>Date and time</th>
                          <th style={{ padding: '1rem', fontWeight: 500, color: '#475569', borderBottom: '1px solid #cbd5e1' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'white' }}>
                        {vhPaginated.length > 0 ? vhPaginated.map((vh: any) => (
                          <tr key={vh.yips_verificationhistoryid} style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '1rem', color: '#1e293b' }}>{vh.yips_certificatenumber}</td>
                            <td style={{ padding: '1rem', color: '#1e293b' }}>{new Date(vh.yips_verifiedat || vh.createdon).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ backgroundColor: '#2ba89c', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 500 }}>
                                Verified
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>No Verification History Found</td></tr>
                        )}
                      </tbody>
                    </table>
</div>
                  </div>
                  {vhTotalPages > 0 && (
                    <div className="flex justify-between items-center mt-4" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      <div>Showing {vhPaginated.length} of {vhFiltered.length} (Page {vhPage} of {vhTotalPages})</div>
                      <div className="flex items-center gap-2">
                        <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: vhPage === 1 ? 0.5 : 1, cursor: vhPage === 1 ? 'not-allowed' : 'pointer' }} onClick={() => setVhPage(p => Math.max(1, p - 1))} disabled={vhPage === 1}>Previous</button>
                        <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: vhPage === vhTotalPages ? 0.5 : 1, cursor: vhPage === vhTotalPages ? 'not-allowed' : 'pointer' }} onClick={() => setVhPage(p => Math.min(vhTotalPages, p + 1))} disabled={vhPage === vhTotalPages}>Next</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, border: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f0fdfa', borderRadius: '50%' }}>
                    <AlertCircle size={20} color="#0d9488" />
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Audit Trail</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowAuditTrail(!showAuditTrail)} className="btn btn-primary" style={{ backgroundColor: '#54a69c', color: 'white', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={14} /> {showAuditTrail ? 'Hide' : 'View'}
                  </button>
                </div>
              </div>
              
              {showAuditTrail && (
                <div style={{ padding: '1.5rem', backgroundColor: '#eef2f6', borderTop: '1px solid #e5e7eb' }}>
                  {/* Controls Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>Search Audit Trail</label>
                      <input 
                        type="text"
                        placeholder="Search by event name"
                        value={auditSearch}
                        onChange={e => setAuditSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>Start Date</label>
                      <input 
                        type="date"
                        value={auditStartDate}
                        onChange={e => setAuditStartDate(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>End Date</label>
                      <input 
                        type="date"
                        value={auditEndDate}
                        onChange={e => setAuditEndDate(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>Filter by event type</label>
                      <select 
                        value={auditFilter}
                        onChange={e => setAuditFilter(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      >
                        <option>All Event Types</option>
                        <option>Create</option>
                        <option>Modify</option>
                        <option>Delete</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button 
                        onClick={() => {
                          setAuditSearch("");
                          setAuditStartDate("");
                          setAuditEndDate("");
                          setAuditFilter("All Event Types");
                        }}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', cursor: 'pointer', height: '38px', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div className="table-responsive-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Events name</th>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Unique ID</th>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Certificate Number</th>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Events type</th>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Timestamp</th>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Modified by</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditPaginated.length > 0 ? auditPaginated.map((trail: any) => {
                          const nameParts = (trail.yips_eventname || "").split("::");
                          const displayEventName = nameParts[0];
                          const customUserName = nameParts.length > 1 ? nameParts[1] : null;
                          const customCertName = nameParts.length > 2 ? nameParts[2] : null;
                          const customCertNumber = nameParts.length > 3 ? nameParts[3] : null;

                          return (
                          <tr key={trail.id || trail.yips_audittrailid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1rem', color: '#111827' }}>{displayEventName}</td>
                            <td style={{ padding: '1rem', color: '#111827' }}>{customCertName || trail['_yips_certificate_value@OData.Community.Display.V1.FormattedValue'] || "-"}</td>
                            <td style={{ padding: '1rem', color: '#111827' }}>{customCertNumber || trail.yips_Certificate?.yips_certificatenumber || trail.yips_certificatenumber || "-"}</td>
                            <td style={{ padding: '1rem', color: '#111827' }}>{trail['yips_eventtype@OData.Community.Display.V1.FormattedValue'] || trail.yips_eventtype}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{new Date(trail.createdon).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ padding: '1rem', color: '#111827' }}>{customUserName || trail['_createdby_value@OData.Community.Display.V1.FormattedValue'] || trail.yips_modifiedby || "System"}</td>
                          </tr>
                          );
                        }) : (
                          <tr><td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>No Audit Trails Found</td></tr>
                        )}
                      </tbody>
                    </table>
</div>
                  </div>

                  {/* Bottom Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button 
                        onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent', opacity: auditPage === 1 ? 0.5 : 1, cursor: auditPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>Page {auditTotalPages > 0 ? auditPage : 0} of {auditTotalPages}</span>
                      <button 
                        onClick={() => setAuditPage(p => Math.min(auditTotalPages, p + 1))}
                        disabled={auditPage === auditTotalPages || auditTotalPages === 0}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent', opacity: auditPage === auditTotalPages || auditTotalPages === 0 ? 0.5 : 1, cursor: auditPage === auditTotalPages || auditTotalPages === 0 ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
                      >
                        Next
                      </button>
                    </div>
                    <button onClick={exportAuditCSV} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid #d1d5db', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#111827', cursor: 'pointer' }}>
                      <FileDown size={16} /> Export CSV
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#e0e7ff', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color="#3730a3" />
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>Certificate records</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowCertificates(!showCertificates)} className="btn" style={{ backgroundColor: '#54a69c', color: 'white', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    {showCertificates ? 'Close' : 'View'}
                  </button>
                </div>
              </div>
              
              {showCertificates && (
                <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Search by certificate, holder, company, or ID" 
                        style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }} 
                        value={certSearchQuery}
                        onChange={(e) => setCertSearchQuery(e.target.value)}
                      />
                      <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                                        <input 
                      type="date" 
                      className="input-field" 
                      style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white', color: certStartDate ? 'black' : '#9ca3af' }}
                      value={certStartDate}
                      onChange={(e) => setCertStartDate(e.target.value)}
                    />
                    <input 
                      type="date" 
                      className="input-field" 
                      style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white', color: certEndDate ? 'black' : '#9ca3af' }}
                      value={certEndDate}
                      onChange={(e) => setCertEndDate(e.target.value)}
                    />
                    <select 
                      className="input-field" 
                      style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }}
                      value={certFilterStatus}
                      onChange={(e) => setCertFilterStatus(e.target.value)}
                    >
                      <option value="All Statuses">All Statuses</option>
                      <option value="FIT">Fit</option>
                      <option value="UNFIT">Unfit</option>
                      <option value="REVOKED">Revoked</option>
                    </select>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-full)', color: '#374151' }}
                      onClick={() => { setCertSearchQuery(""); setCertFilterStatus("All Statuses"); setCertStartDate(""); setCertEndDate(""); }}
                    >
                      Clear Filters
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ backgroundColor: '#54a69c', color: 'white', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={exportToCSV}
                    >
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                  
                  <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                    <div className="table-responsive-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Unique ID</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Certificate Number</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Holder</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>National ID/Passport</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Company</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Issue Date</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Expiry Date</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Work As</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Created By</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Created Date</th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'white' }}>
                        {certPaginated.length > 0 ? certPaginated.map((cert: any) => (
                          <tr key={cert.yips_certificatesid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1rem', color: '#111827', fontWeight: 600 }}>{cert.yips_certificatename}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_certificatenumber || '-'}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_holderfullname}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_nationalidpassport}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_companyname || '-'}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_issuedate ? new Date(cert.yips_issuedate).toLocaleDateString('en-US') : ''}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_expirydate ? new Date(cert.yips_expirydate).toLocaleDateString('en-US') : ''}</td>
                            <td style={{ padding: '1rem' }}>{getStatusText(cert.yips_certificatestatus)}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_workas || '-'}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert['_createdby_value@OData.Community.Display.V1.FormattedValue'] || 'System'}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.createdon ? new Date(cert.createdon).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={12} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No Certificates Found Matching Your Criteria</td></tr>
                        )}
                      </tbody>
                    </table>
</div>
                  </div>

                  <div className="flex justify-between items-center" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    <div>Showing {certPaginated.length} Certificates (Page {certTotalPages > 0 ? certPage : 0} of {certTotalPages})</div>
                    <div className="flex items-center gap-2">
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: certPage === 1 ? 0.5 : 1, cursor: certPage === 1 ? 'not-allowed' : 'pointer' }} onClick={() => setCertPage(p => Math.max(1, p - 1))} disabled={certPage === 1}>Previous</button>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', backgroundColor: 'white', opacity: certPage === certTotalPages || certTotalPages === 0 ? 0.5 : 1, cursor: certPage === certTotalPages || certTotalPages === 0 ? 'not-allowed' : 'pointer' }} onClick={() => setCertPage(p => Math.min(certTotalPages, p + 1))} disabled={certPage === certTotalPages || certTotalPages === 0}>Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>





    </div>
  );
}

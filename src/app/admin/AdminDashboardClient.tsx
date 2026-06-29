"use client";

import { useState, useEffect } from "react";
import { User, LogOut, ChevronLeft, FileText, CheckCircle, AlertCircle, XCircle, Globe, Users, Lock, Plus, Edit, Trash2, FileDown, ShieldCheck, Search, Download } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminDashboardClient({ 
  session, 
  stats 
}: { 
  session: any; 
  stats: { total: number; fit: number; unfit: number; expired: number } 
}) {
  const [showMedicalOfficerModal, setShowMedicalOfficerModal] = useState(false);
  const [showOccupationalModal, setShowOccupationalModal] = useState(false);
  
  const [showMedicalOfficerList, setShowMedicalOfficerList] = useState(false);
  const [showOccupationalList, setShowOccupationalList] = useState(false);
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [occupationalPractitioners, setOccupationalPractitioners] = useState<any[]>([]);
  
  const [moPage, setMoPage] = useState(1);
  const [opPage, setOpPage] = useState(1);
  const itemsPerPage = 15;
  
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingMedicalOfficerId, setEditingMedicalOfficerId] = useState<string | null>(null);
  const [editingOccupationalId, setEditingOccupationalId] = useState<string | null>(null);

  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrails, setAuditTrails] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("All event types");

  const [showVerificationHistory, setShowVerificationHistory] = useState(false);
  const [verificationHistories, setVerificationHistories] = useState<any[]>([]);
  const [vhPage, setVhPage] = useState(1);

  const [showCertificates, setShowCertificates] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certSearchQuery, setCertSearchQuery] = useState("");
  const [certFilterStatus, setCertFilterStatus] = useState("All statuses");
  const [certPage, setCertPage] = useState(1);

  // Certificate Form State
  const [showCertForm, setShowCertForm] = useState(false);
  const [certFormData, setCertFormData] = useState({
    nationalId: "",
    holderFullName: "",
    companyName: "",
    certStatus: "341150000",
    medicalOfficerId: "",
    occupationalPractitionerId: "",
    medicalType: "",
    issueDate: "",
    expiryDate: "",
    comments: ""
  });
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certFormError, setCertFormError] = useState("");


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

  const handleCreateMedicalOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingMedicalOfficerId ? `/api/medical-officers/${editingMedicalOfficerId}` : "/api/medical-officers";
      const method = editingMedicalOfficerId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowMedicalOfficerModal(false);
        setFormData({ fullName: "", email: "", phone: "" });
        setEditingMedicalOfficerId(null);
        fetchMedicalOfficers();
        setShowMedicalOfficerList(true);
        alert(editingMedicalOfficerId ? "Medical Officer updated successfully!" : "Medical Officer created successfully!");
      } else {
        alert("Failed to save Medical Officer");
      }
    } catch (err) {
      alert("An error occurred");
    }
    setIsSubmitting(false);
  };

  const handleDeleteMedicalOfficer = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Medical Officer?")) return;
    try {
      const res = await fetch(`/api/medical-officers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMedicalOfficers();
      } else {
        alert("Failed to delete Medical Officer");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  const handleCreateOccupational = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingOccupationalId ? `/api/occupational-practitioners/${editingOccupationalId}` : "/api/occupational-practitioners";
      const method = editingOccupationalId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowOccupationalModal(false);
        setFormData({ fullName: "", email: "", phone: "" });
        setEditingOccupationalId(null);
        fetchOccupationalPractitioners();
        setShowOccupationalList(true);
        alert(editingOccupationalId ? "Occupational Practitioner updated successfully!" : "Occupational Practitioner created successfully!");
      } else {
        alert("Failed to save Occupational Practitioner");
      }
    } catch (err) {
      alert("An error occurred");
    }
    setIsSubmitting(false);
  };

  const handleDeleteOccupational = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Occupational Practitioner?")) return;
    try {
      const res = await fetch(`/api/occupational-practitioners/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchOccupationalPractitioners();
      } else {
        alert("Failed to delete Occupational Practitioner");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  const handleDeleteCertificate = async (id: string, certName: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate?")) return;
    try {
      const res = await fetch(`/api/certificates/${id}?userName=${encodeURIComponent(session?.user?.name || "Admin")}&certName=${encodeURIComponent(certName || "Unknown")}`, { method: "DELETE" });
      if (res.ok) {
        fetchCertificates();
      }
    } catch (err) {
      console.error("Failed to delete certificate", err);
    }
  };

  const handleEditCertificate = (cert: any) => {
    setEditingCertId(cert.yips_certificatesid);
    setCertFormData({
      nationalId: cert.yips_nationalidpassport || "",
      holderFullName: cert.yips_holderfullname || "",
      companyName: cert.yips_companyname || "",
      certStatus: cert.yips_certificatestatus?.toString() || "341150000",
      medicalOfficerId: cert.yips_MedicalOfficer?.yips_medicalofficersid || cert._yips_medicalofficer_value || "",
      occupationalPractitionerId: cert.yips_OccupationalMedicalPractitioner?.yips_occupationalmedicalpractionerid || cert._yips_occupationalmedicalpractitioner_value || "",
      medicalType: cert.yips_medicaltype?.toString() || "",
      issueDate: cert.yips_issuedate ? cert.yips_issuedate.split("T")[0] : "",
      expiryDate: cert.yips_expirydate ? cert.yips_expirydate.split("T")[0] : "",
      comments: cert.yips_comments || ""
    });
    setShowCertForm(true);
  };

  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCertFormError("");

    try {
      const url = editingCertId ? `/api/certificates/${editingCertId}` : "/api/certificates";
      const method = editingCertId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...certFormData,
          callerId: session?.user?.id || "",
          userName: session?.user?.name || "Admin",
          certName: editingCertId ? (certificates.find(c => c.yips_certificatesid === editingCertId)?.yips_certificatename || certFormData.nationalId) : certFormData.nationalId
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save certificate");
      }

      setShowCertForm(false);
      setEditingCertId(null);
      fetchCertificates();
    } catch (err: any) {
      setCertFormError(err.message || "Failed to save certificate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    if (filteredCertificates.length === 0) return;
    
    const headers = ["Certificate #", "Holder", "National ID/Passport", "Issue date", "Expiry date", "Status"];
    const rows = filteredCertificates.map(cert => {
      let statusStr = "Unknown";
      if (cert.yips_certificatestatus === 341150000) statusStr = "Fit";
      else if (cert.yips_certificatestatus === 341150001) statusStr = "Unfit";
      else if (cert.yips_certificatestatus === 341150002) statusStr = "Revoked";

      return [
        cert.yips_certificatename || "",
        cert.yips_holderfullname || "",
        cert.yips_nationalidpassport || "",
        cert.yips_issuedate ? new Date(cert.yips_issuedate).toLocaleDateString() : "",
        cert.yips_expirydate ? new Date(cert.yips_expirydate).toLocaleDateString() : "",
        statusStr
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
        (cert.yips_nationalidpassport || "").toLowerCase().includes(q)
      );
    }
    
    let matchesStatus = true;
    if (certFilterStatus !== "All statuses") {
      let numericStatus = 0;
      if (certFilterStatus === "FIT") numericStatus = 341150000;
      else if (certFilterStatus === "UNFIT") numericStatus = 341150001;
      else if (certFilterStatus === "REVOKED") numericStatus = 341150002;
      
      matchesStatus = (cert.yips_certificatestatus === numericStatus);
    }
    
    return matchesSearch && matchesStatus;
  });

  const certTotalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const certPaginated = filteredCertificates.slice((certPage - 1) * itemsPerPage, certPage * itemsPerPage);

  const moTotalPages = Math.ceil(medicalOfficers.length / itemsPerPage);
  const moPaginated = medicalOfficers.slice((moPage - 1) * itemsPerPage, moPage * itemsPerPage);

  const opTotalPages = Math.ceil(occupationalPractitioners.length / itemsPerPage);
  const opPaginated = occupationalPractitioners.slice((opPage - 1) * itemsPerPage, opPage * itemsPerPage);

  const vhFiltered = verificationHistories;
  const vhTotalPages = Math.ceil(vhFiltered.length / itemsPerPage);
  const vhPaginated = vhFiltered.slice((vhPage - 1) * itemsPerPage, vhPage * itemsPerPage);

  const filteredAuditTrails = auditTrails.filter(trail => {
    let matchesSearch = true;
    if (auditSearch) {
      matchesSearch = (trail.yips_eventname || "").toLowerCase().includes(auditSearch.toLowerCase());
    }
    let matchesFilter = true;
    if (auditFilter !== "All event types") {
      matchesFilter = (trail.yips_eventtype || "") === auditFilter;
    }
    return matchesSearch && matchesFilter;
  });

  const auditTotalPages = Math.ceil(filteredAuditTrails.length / itemsPerPage);
  const auditPaginated = filteredAuditTrails.slice((auditPage - 1) * itemsPerPage, auditPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'var(--font-inter)' }}>
      {/* Left Sidebar */}
      <div style={{ width: '280px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
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
              <LogOut size={16} /> Sign out
            </button>
            
            <Link href="/" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', textDecoration: 'none' }}>
              <ChevronLeft size={16} /> Back to public verifier
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Nav */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
              <Globe size={16} /> Public verifier
            </Link>
            <Link href="/internal" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
              <Users size={16} /> Internal staff
            </Link>
            <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', backgroundColor: '#54a69c', textDecoration: 'none', fontSize: '0.875rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
              <Lock size={16} /> Admin
            </Link>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ padding: '2rem 3rem', flex: 1, overflowY: 'auto' }}>
          <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>ADMINISTRATOR DASHBOARD</h2>
          
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
                <FileText size={20} color="#4b5563" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>Total certificates</div>
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
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>Expired certificates</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{stats.expired}</div>
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
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Create user accounts</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Accounts are managed in Microsoft Admin Center.</div>
                </div>
              </div>
              <a href="https://admin.microsoft.com" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                + Create user accounts
              </a>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, border: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f0fdfa', borderRadius: '50%' }}>
                    <CheckCircle size={20} color="#0d9488" />
                  </div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Medical officer</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowMedicalOfficerList(!showMedicalOfficerList)} className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'white' }}>
                    {showMedicalOfficerList ? 'Hide list' : 'View list'}
                  </button>
                  <button onClick={() => setShowMedicalOfficerModal(true)} className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'white' }}>
                    + New
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button onClick={() => { setEditingMedicalOfficerId(mo.yips_medicalofficersid); setFormData({ ...formData, fullName: mo.yips_fullname }); setShowMedicalOfficerModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#62a8a6' }}><Edit size={14} /></button>
                              <button onClick={() => handleDeleteMedicalOfficer(mo.yips_medicalofficersid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
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
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No medical officers found.</div>
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
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Occupational medical practitioner</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowOccupationalList(!showOccupationalList)} className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'white' }}>
                    {showOccupationalList ? 'Hide list' : 'View list'}
                  </button>
                  <button onClick={() => setShowOccupationalModal(true)} className="btn btn-primary" style={{ backgroundColor: '#54a69c', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'white' }}>
                    + New
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button onClick={() => { setEditingOccupationalId(op.yips_occupationalmedicalpractionerid); setFormData({ ...formData, fullName: op.yips_fullname }); setShowOccupationalModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#62a8a6' }}><Edit size={14} /></button>
                              <button onClick={() => handleDeleteOccupational(op.yips_occupationalmedicalpractionerid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
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
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem' }}>Verification history</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowVerificationHistory(!showVerificationHistory)} className="btn" style={{ backgroundColor: '#54a69c', color: 'white', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    {showVerificationHistory ? 'Close' : 'View'}
                  </button>
                </div>
              </div>
              
              {showVerificationHistory && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                  <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid #cbd5e1' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: 'white' }}>
                        <tr>
                          <th style={{ padding: '1rem', fontWeight: 500, color: '#475569', borderBottom: '1px solid #cbd5e1' }}>Certificate number</th>
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
                          <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>No verification history found</td></tr>
                        )}
                      </tbody>
                    </table>
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
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Audit trail</div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
                    <div style={{ flex: 1, maxWidth: '400px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>Search audit trail</label>
                      <input 
                        type="text"
                        placeholder="Search by event name"
                        value={auditSearch}
                        onChange={e => setAuditSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>Filter by event type</label>
                      <select 
                        value={auditFilter}
                        onChange={e => setAuditFilter(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', backgroundColor: 'transparent' }}
                      >
                        <option>All event types</option>
                        <option>Create</option>
                        <option>Modify</option>
                        <option>Delete</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Events name</th>
                          <th style={{ padding: '1rem', fontWeight: 600, color: '#374151' }}>Certificate name</th>
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

                          return (
                          <tr key={trail.id || trail.yips_audittrailid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1rem', color: '#111827' }}>{displayEventName}</td>
                            <td style={{ padding: '1rem', color: '#111827' }}>{customCertName || trail['_yips_certificate_value@OData.Community.Display.V1.FormattedValue'] || "-"}</td>
                            <td style={{ padding: '1rem', color: '#111827' }}>{trail['yips_eventtype@OData.Community.Display.V1.FormattedValue'] || trail.yips_eventtype}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{new Date(trail.createdon).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ padding: '1rem', color: '#111827' }}>{customUserName || trail['_createdby_value@OData.Community.Display.V1.FormattedValue'] || trail.yips_modifiedby || "System"}</td>
                          </tr>
                          );
                        }) : (
                          <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>No audit trails found</td></tr>
                        )}
                      </tbody>
                    </table>
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
                    <button style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid #d1d5db', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#111827', cursor: 'pointer' }}>
                      <FileDown size={16} /> Download PDF
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
                        placeholder="Search by certificate, holder, or ID" 
                        style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }} 
                        value={certSearchQuery}
                        onChange={(e) => setCertSearchQuery(e.target.value)}
                      />
                      <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <select 
                      className="input-field" 
                      style={{ width: 'auto', borderRadius: 'var(--radius-full)', backgroundColor: 'white' }}
                      value={certFilterStatus}
                      onChange={(e) => setCertFilterStatus(e.target.value)}
                    >
                      <option value="All statuses">All statuses</option>
                      <option value="FIT">Fit</option>
                      <option value="UNFIT">Unfit</option>
                      <option value="REVOKED">Revoked</option>
                    </select>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-full)', color: '#374151' }}
                      onClick={() => { setCertSearchQuery(""); setCertFilterStatus("All statuses"); }}
                    >
                      Clear filters
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
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Certificate #</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Holder</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>National ID/Passport</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Issue date</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Expiry date</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                          <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Created By</th>
                          <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'white' }}>
                        {certPaginated.length > 0 ? certPaginated.map((cert: any) => (
                          <tr key={cert.yips_certificatesid} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '1rem', color: '#111827', fontWeight: 600 }}>{cert.yips_certificatename}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_holderfullname}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_nationalidpassport}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_issuedate ? new Date(cert.yips_issuedate).toLocaleDateString('en-US') : ''}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert.yips_expirydate ? new Date(cert.yips_expirydate).toLocaleDateString('en-US') : ''}</td>
                            <td style={{ padding: '1rem' }}>{getStatusText(cert.yips_certificatestatus)}</td>
                            <td style={{ padding: '1rem', color: '#4b5563' }}>{cert['_createdby_value@OData.Community.Display.V1.FormattedValue'] || 'System'}</td>
                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                              <div className="flex justify-center gap-2">
                                <button onClick={() => handleEditCertificate(cert)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#54a69c', padding: '0.25rem' }}>
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteCertificate(cert.yips_certificatesid, cert.yips_certificatename)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No certificates found matching your criteria</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    <div>Showing {certPaginated.length} certificates (Page {certTotalPages > 0 ? certPage : 0} of {certTotalPages})</div>
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

      {/* Modals */}
      {(showMedicalOfficerModal || showOccupationalModal) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-scale-in" style={{ width: '400px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Create {showMedicalOfficerModal ? 'Medical Officer' : 'Occupational Practitioner'}
            </h3>
            <form onSubmit={showMedicalOfficerModal ? handleCreateMedicalOfficer : handleCreateOccupational} className="flex-col gap-4">
              <div>
                <label className="label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setShowMedicalOfficerModal(false);
                    setShowOccupationalModal(false);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Form Modal */}
      {showCertForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 60, padding: '2rem', overflowY: 'auto' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', backgroundColor: 'white', position: 'relative', margin: 'auto' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ADMIN WORKSPACE</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Edit certificate record</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Update live Dataverse certificate records.</p>
              </div>
              <button 
                className="btn" 
                style={{ backgroundColor: '#6b7280', color: 'white', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.25rem' }} 
                onClick={() => { setShowCertForm(false); setEditingCertId(null); }}
              >
                Close
              </button>
            </div>

            {certFormError && (
              <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                {certFormError}
              </div>
            )}
            
            <form className="flex-col gap-6" onSubmit={handleCertSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Full name *</label>
                  <input type="text" className="input-field" required value={certFormData.holderFullName} onChange={(e) => setCertFormData({...certFormData, holderFullName: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>National ID/Passport *</label>
                  <input type="text" className="input-field" required value={certFormData.nationalId} onChange={(e) => setCertFormData({...certFormData, nationalId: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Company name *</label>
                  <input type="text" className="input-field" required value={certFormData.companyName} onChange={(e) => setCertFormData({...certFormData, companyName: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Status *</label>
                  <select className="input-field" required value={certFormData.certStatus} onChange={(e) => setCertFormData({...certFormData, certStatus: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="341150000">Fit</option>
                    <option value="341150001">Unfit</option>
                    <option value="341150002">Revoked</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Medical officer</label>
                  <select className="input-field" value={certFormData.medicalOfficerId} onChange={(e) => setCertFormData({...certFormData, medicalOfficerId: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="">No medical officer assigned</option>
                    {medicalOfficers.map(mo => (
                      <option key={mo.yips_medicalofficersid} value={mo.yips_medicalofficersid}>
                        {mo.yips_name || mo.yips_fullname || 'Unnamed Officer'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Occupational practitioner</label>
                  <select className="input-field" value={certFormData.occupationalPractitionerId} onChange={(e) => setCertFormData({...certFormData, occupationalPractitionerId: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="">No practitioner assigned</option>
                    {occupationalPractitioners.map(op => (
                      <option key={op.yips_occupationalmedicalpractionerid} value={op.yips_occupationalmedicalpractionerid}>
                        {op.yips_name || op.yips_fullname || 'Unnamed Practitioner'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Medical type</label>
                  <select className="input-field" value={certFormData.medicalType} onChange={(e) => setCertFormData({...certFormData, medicalType: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111827%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}>
                    <option value="">Select medical type</option>
                    <option value="341150000">Entry</option>
                    <option value="341150001">Periodic</option>
                    <option value="341150002">Exit Medical</option>
                    <option value="341150003">Special Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Issue date *</label>
                  <input type="date" className="input-field" required value={certFormData.issueDate} onChange={(e) => setCertFormData({...certFormData, issueDate: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Expiry date *</label>
                  <input type="date" className="input-field" required value={certFormData.expiryDate} onChange={(e) => setCertFormData({...certFormData, expiryDate: e.target.value})} style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label className="label" style={{ fontSize: '0.8rem' }}>Comments</label>
                <textarea className="input-field" rows={4} style={{ resize: 'vertical', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }} value={certFormData.comments} onChange={(e) => setCertFormData({...certFormData, comments: e.target.value})}></textarea>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 2rem', backgroundColor: '#54a69c' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

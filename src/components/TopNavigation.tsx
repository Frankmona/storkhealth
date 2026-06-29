"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, User, ShieldCheck } from "lucide-react";

export function TopNavigation() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="header-dark">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div style={{ backgroundColor: 'var(--color-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.05em', color: '#9ca3af', fontWeight: 600 }}>STORKFORT HEALTH</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Storkfort Health Online Verification Portal</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
          <Link href="/" className={`btn btn-nav ${pathname === '/' ? 'active' : ''}`} style={{ borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={16} /> Public verifier
          </Link>
          <Link href="/internal" className={`btn btn-nav ${pathname.startsWith('/internal') ? 'active' : ''}`} style={{ borderRadius: 'var(--radius-full)' }}>
            <User size={16} /> Internal staff
          </Link>
          <Link href="/admin" className={`btn btn-nav ${pathname.startsWith('/admin') ? 'active' : ''}`} style={{ borderRadius: 'var(--radius-full)' }}>
            <ShieldCheck size={16} /> Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

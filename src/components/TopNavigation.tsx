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
          <div style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/logo.png" alt="Storkfort Health Logo" style={{ height: '80px', width: 'auto' }} />
          </div>
        </div>
        
        <div className="flex items-center gap-2" style={{ backgroundColor: 'rgba(61, 102, 110, 0.05)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
          <Link href="/" className={`btn btn-nav ${pathname === '/' ? 'active' : ''}`} style={{ borderRadius: 'var(--radius-full)' }}>
            <CheckCircle2 size={16} /> Public Verifier
          </Link>
          {/* <Link href="/internal" className={`btn btn-nav ${pathname.startsWith('/internal') ? 'active' : ''}`} style={{ borderRadius: 'var(--radius-full)' }}>
            <User size={16} /> Internal Staff
          </Link>
          <Link href="/admin" className={`btn btn-nav ${pathname.startsWith('/admin') ? 'active' : ''}`} style={{ borderRadius: 'var(--radius-full)' }}>
            <ShieldCheck size={16} /> Admin
          </Link> */}
        </div>
      </div>
    </div>
  );
}

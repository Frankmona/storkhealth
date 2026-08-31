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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <div style={{ fontSize: '1.4rem', letterSpacing: '0.02em', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 400 }}>STORK</span>
              <span style={{ fontWeight: 700 }}>FORT</span>
            </div>
            <div style={{ fontSize: '0.85rem', letterSpacing: '0.15em', fontWeight: 400, marginLeft: '2px' }}>
              HEALTH
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
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

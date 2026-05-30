'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import EmergencyModal from './EmergencyModal';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tracker': 'Week Tracker',
  '/symptoms': 'Symptom Checker',
  '/nutrition': 'Nutrition Guide',
  '/mental-health': 'Mental Wellness',
  '/vaccination': 'Vaccinations',
  '/doctor-summary': 'Doctor Summary',
  '/ai-assistant': 'AI Assistant',
};

interface TopBarProps {
  userId: string;
  userName: string;
  pregnancyWeek: number;
}

export default function TopBar({ userId, userName, pregnancyWeek }: TopBarProps) {
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || 'Bloom';

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(251,247,242,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(200,169,110,0.15)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        {/* Left side: menu icon (mobile) + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'var(--rose-pale)',
              border: 'none',
              borderRadius: 10,
              padding: '8px 10px',
              cursor: 'pointer',
              fontSize: 18,
            }}
          >☰</button>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--text-dark)', margin: 0 }}>
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setEmergencyOpen(true)}
            className="animate-pulse-red"
            style={{
              background: 'var(--error)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            🚨 <span className="emergency-text">Emergency</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="mobile-sidebar-menu" style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, right: 0,
          background: 'rgba(44,32,24,0.5)', zIndex: 150,
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: '75%', maxWidth: 280,
            background: 'var(--warm-white)',
            padding: '28px 0',
            overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0 24px 20px', borderBottom: '1px solid rgba(200,169,110,0.2)' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: 'var(--rose)' }}>🌸 Bloom</div>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{userName} · Week {pregnancyWeek}</div>
            </div>
            {[
              ['/dashboard','🏠','Dashboard'],
              ['/tracker','📅','Week Tracker'],
              ['/symptoms','🩺','Symptom Check'],
              ['/nutrition','🥗','Nutrition'],
              ['/mental-health','💬','Mental Health'],
              ['/vaccination','💉','Vaccinations'],
              ['/doctor-summary','📋','Doctor Summary'],
              ['/ai-assistant','🤖','AI Assistant'],
            ].map(([href, icon, label]) => (
              <Link key={href} href={href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px',
                  textDecoration: 'none',
                  fontSize: 15, fontWeight: 500,
                  color: pathname === href ? 'var(--rose)' : 'var(--text-mid)',
                  background: pathname === href ? 'var(--rose-pale)' : 'transparent',
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                {label}
              </Link>
            ))}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(200,169,110,0.2)', marginTop: 8 }}>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, color: 'var(--text-light)',
                  fontFamily: "'DM Sans', sans-serif", padding: 0,
                }}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <EmergencyModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .emergency-text { display: none; }
        }
      `}</style>
    </>
  );
}

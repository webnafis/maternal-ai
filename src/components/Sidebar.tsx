'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { getProgress } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/tracker', icon: '📅', label: 'Week Tracker' },
  { href: '/symptoms', icon: '🩺', label: 'Symptom Check' },
  { href: '/nutrition', icon: '🥗', label: 'Nutrition' },
  { href: '/mental-health', icon: '💬', label: 'Mental Health' },
  { href: '/vaccination', icon: '💉', label: 'Vaccinations' },
  { href: '/doctor-summary', icon: '📋', label: 'Doctor Summary' },
  { href: '/ai-assistant', icon: '🤖', label: 'AI Assistant' },
];

interface SidebarProps {
  userName: string;
  pregnancyWeek: number;
}

export default function Sidebar({ userName, pregnancyWeek }: SidebarProps) {
  const pathname = usePathname();
  const progress = getProgress(pregnancyWeek);

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 260,
      background: 'var(--warm-white)',
      borderRight: '1px solid rgba(200,169,110,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      padding: '28px 0',
      boxShadow: '2px 0 20px rgba(44,32,24,0.06)',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(200,169,110,0.2)' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--rose)', letterSpacing: '-0.5px' }}>
          🌸 Bloom
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: 2 }}>
          Maternal Health AI
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? 'white' : 'var(--text-mid)',
                background: isActive ? 'var(--rose)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'var(--rose-pale)'; (e.currentTarget as HTMLElement).style.color = 'var(--rose)'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)'; } }}
            >
              <span style={{ fontSize: 18, width: 22, textAlign: 'center', filter: isActive ? 'brightness(10)' : 'none' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div style={{ margin: '0 12px 12px', padding: 14, background: 'linear-gradient(135deg, var(--rose-pale), var(--sage-pale))', borderRadius: 14, border: '1px solid rgba(200,169,110,0.2)' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-dark)' }}>{userName}</div>
        <div style={{ fontSize: 12, color: 'var(--rose)', marginTop: 2 }}>Week {pregnancyWeek} of 40</div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-light)', marginBottom: 5 }}>
            <span>Pregnancy</span><span>{progress}%</span>
          </div>
          <div style={{ height: 5, background: 'rgba(200,169,110,0.2)', borderRadius: 10, overflow: 'hidden' }}>
            <div className="progress-fill-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        style={{
          margin: '0 12px',
          padding: '10px 14px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-light)',
          background: 'transparent',
          border: '1px solid rgba(200,169,110,0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFF5F5'; (e.currentTarget as HTMLElement).style.color = 'var(--error)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-light)'; }}
      >
        🚪 Sign Out
      </button>
    </aside>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/tracker', icon: '📅', label: 'Tracker' },
  { href: '/symptoms', icon: '🩺', label: 'Symptoms' },
  { href: '/ai-assistant', icon: '🤖', label: 'AI Chat' },
  { href: '/mental-health', icon: '💬', label: 'Wellness' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" style={{ display: 'none' }}>
      {MOBILE_NAV.map(item => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '4px 8px',
              borderRadius: 10,
              textDecoration: 'none',
              color: isActive ? 'var(--rose)' : 'var(--text-light)',
              minWidth: 56,
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

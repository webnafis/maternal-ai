'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const MOBILE_NAV = [
  { href: '/dashboard', icon: '🏠', key: 'nav.home' },
  { href: '/tracker', icon: '📅', key: 'nav.tracker' },
  { href: '/symptoms', icon: '🩺', key: 'nav.symptoms' },
  { href: '/ai-assistant', icon: '🤖', key: 'nav.aiChat' },
  { href: '/mental-health', icon: '💬', key: 'nav.wellness' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

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
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

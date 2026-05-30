'use client';
import { EMERGENCY_CONTACTS } from '@/lib/utils';

interface EmergencyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ open, onClose }: EmergencyModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(44,32,24,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 20,
        animation: 'fadeInUp 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--warm-white)',
          borderRadius: 24,
          padding: 28,
          maxWidth: 420,
          width: '100%',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'var(--cream)', border: 'none',
            borderRadius: '50%', width: 32, height: 32,
            cursor: 'pointer', fontSize: 14, color: 'var(--text-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--text-dark)', marginBottom: 8 }}>
          🚨 Emergency Contacts
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: 18, lineHeight: 1.5 }}>
          If you experience severe symptoms, contact immediately:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EMERGENCY_CONTACTS.map(contact => (
            <a
              key={contact.number}
              href={contact.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: 'var(--cream)',
                borderRadius: 14,
                border: '1px solid rgba(200,169,110,0.15)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--rose-pale)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--rose-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cream)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,169,110,0.15)'; }}
            >
              <span style={{ fontSize: 28 }}>{contact.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--rose)', fontFamily: "'Playfair Display', serif" }}>
                  {contact.number}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 2 }}>{contact.desc}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--rose)' }}>📞</span>
            </a>
          ))}
        </div>

        <div style={{
          marginTop: 16, padding: 12,
          background: 'var(--rose-pale)',
          borderRadius: 12, fontSize: 13,
          color: 'var(--rose)', lineHeight: 1.6,
        }}>
          ⚠️ <strong>Red flags:</strong> Heavy bleeding, severe abdominal pain, no fetal movement for 12hrs, vision changes, high fever, severe headache.
        </div>
      </div>
    </div>
  );
}

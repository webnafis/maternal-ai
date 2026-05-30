'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [week, setWeek] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!week || parseInt(week) < 1 || parseInt(week) > 40) {
      setError('Please enter a valid pregnancy week (1–40).');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      name: name.trim(),
      pregnancyWeek: week,
      redirect: false,
    });

    if (result?.error) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    } else {
      router.replace('/dashboard');
    }
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 40 }}>🌸</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--rose-pale) 0%, var(--cream) 40%, var(--sage-pale) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '-80px', right: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,117,106,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-60px', left: '-60px',
        width: '250px', height: '250px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,175,142,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--warm-white)',
        borderRadius: '28px',
        padding: '40px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(200,169,110,0.15)',
        width: '100%',
        maxWidth: '440px',
        animation: 'fadeInUp 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🌸</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'var(--rose)', letterSpacing: '-0.5px' }}>
            Bloom
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: 4 }}>
            Maternal Health AI
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: 'var(--text-dark)', marginBottom: 8 }}>
            Welcome to Bloom
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6 }}>
            Your caring maternal health companion.<br />
            Enter your details to begin or continue your journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>
              Your Name
            </label>
            <input
              className="bloom-input"
              type="text"
              placeholder="e.g. Ayesha Rahman"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>
              Current Pregnancy Week (1–40)
            </label>
            <input
              className="bloom-input"
              type="number"
              min="1"
              max="40"
              placeholder="e.g. 24"
              value={week}
              onChange={e => setWeek(e.target.value)}
            />
          </div>

          {error && (
            <div className="alert-box alert-danger" style={{ marginTop: 0 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 16, borderRadius: '14px', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? '✨ Setting up your journey...' : 'Begin My Journey 🌸'}
          </button>
        </form>

        <div style={{
          marginTop: 20,
          padding: '12px 16px',
          background: 'linear-gradient(135deg, var(--rose-pale), var(--sage-pale))',
          borderRadius: 12,
          fontSize: 12,
          color: 'var(--text-mid)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text-dark)' }}>🔒 Your privacy matters.</strong> All data is stored locally and linked to your name. Returning users are automatically logged in.
        </div>
      </div>
    </div>
  );
}

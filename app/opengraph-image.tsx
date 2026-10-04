import { ImageResponse } from 'next/og';
import { profile } from '@/data/portfolio';

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function SocialPreview() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: 54, background: '#0b0d10', color: '#f0f1f3', fontFamily: 'sans-serif', backgroundImage: 'radial-gradient(ellipse at 80% 12%, rgba(220,224,229,0.08), transparent 65%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: '44px 48px', borderRadius: 32, border: '1px solid rgba(236,238,242,0.13)', borderTop: '1px solid rgba(236,238,242,0.28)', borderBottom: '1px solid rgba(236,238,242,0.07)', backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.004) 55%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: '-4px' }}>mr.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 78, fontWeight: 600, letterSpacing: '-4px', lineHeight: 1.1 }}>{profile.name}</div>
          <div style={{ fontSize: 33, color: '#c9cdd3', letterSpacing: '-0.5px' }}>{profile.role}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: '#a3a9b1' }}>Building thoughtful digital experiences.</div>
      </div>
    </div>,
    size,
  );
}

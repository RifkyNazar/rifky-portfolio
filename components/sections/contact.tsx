'use client';
import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, Phone, Github, Linkedin, LoaderCircle } from 'lucide-react';
import { profile } from '@/data/portfolio';
import { Glass, Reveal } from '@/components/ui/glass';
import { SectionHeading } from '@/components/ui/section-heading';

type FormStatus = { kind: 'idle' | 'loading' | 'draft' | 'error'; message: string };
export default function Contact() {
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle', message: '' });
  const [draft, setDraft] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || status.kind === 'loading') return;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim(), email = String(data.get('email') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim(), message = String(data.get('message') ?? '').trim();
    if (!name || !subject || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ kind: 'error', message: 'Please enter a valid email and complete every field with more than whitespace.' }); return;
    }
    setStatus({ kind: 'loading', message: 'Preparing your email draft…' });
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const body = `${message}\n\nFrom: ${name}\nReply to: ${email}`;
    const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setDraft(href);
    try {
      window.location.href = href;
      setStatus({ kind: 'draft', message: 'Your email app was requested to open a draft. Nothing has been sent yet. Review and send it in your email app, or email Rifky directly.' });
    } catch { setStatus({ kind: 'error', message: 'Your email app could not be opened. Use the draft link below or email Rifky directly.' }); }
  }
  return <div className="contact-grid">
    <div className="contact-copy"><SectionHeading number="05" label="LET’S CONNECT" title="Let’s build something meaningful." /><Reveal delay={.06} distance={20}><p className="contact-lead">A conversation.<br />A new possibility.</p><p className="body-copy">I’m open to conversations about web development, intelligent applications, and opportunities to learn and build.</p>
      <div className="contact-links"><a href={`mailto:${profile.email}`}><span className="contact-link-icon"><Mail size={18} /></span><span><small>EMAIL</small>{profile.email}</span><ArrowUpRight size={17} /></a><a href={profile.phoneHref}><span className="contact-link-icon"><Phone size={18} /></span><span><small>PHONE</small>{profile.phone}</span><ArrowUpRight size={17} /></a></div>
      <div className="social-links"><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={17} />GitHub<ArrowUpRight size={14} /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17} />LinkedIn<ArrowUpRight size={14} /></a></div>
    </Reveal></div>
    <Reveal className="contact-form-entry" delay={.14} distance={24}><Glass className="contact-form" depth="medium"><form onSubmit={submit} aria-busy={status.kind === 'loading'}>
      <div className="form-heading"><span className="eyebrow">START A CONVERSATION</span><span className="form-hint">All fields required</span></div>
      <div className="form-row"><label>Name<input name="name" autoComplete="name" placeholder="Your name" required maxLength={100} /></label><label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label></div>
      <label>Subject<input name="subject" placeholder="What would you like to build?" required maxLength={150} /></label>
      <label>Message<textarea name="message" rows={3} placeholder="Tell me a little about your idea…" required maxLength={2000} aria-describedby="contact-status" /></label>
      <button className="button primary" type="submit" disabled={status.kind === 'loading'}>{status.kind === 'loading' ? <>Preparing Draft<LoaderCircle size={17} className="spinner" /></> : <>Send Message<ArrowUpRight size={17} /></>}</button>
      <p id="contact-status" className={`form-note ${status.kind}`} role="status">{status.message || 'Opens a draft in your email app. You review and send it there.'}</p>
      {draft && <a className="text-link draft-link" href={draft}>Open email draft<ArrowUpRight size={14} /></a>}
    </form></Glass></Reveal>
  </div>;
}

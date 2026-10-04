'use client';
import { useState, useRef, type FormEvent } from 'react';
import { ArrowUpRight, Mail, Phone, Github, Linkedin, LoaderCircle } from 'lucide-react';
import { profile } from '@/data/portfolio';
import { Glass, Reveal } from '@/components/ui/glass';
import { SectionHeading } from '@/components/ui/section-heading';

type FormStatus = { kind: 'idle' | 'loading' | 'success' | 'error'; message: string };
export default function Contact() {
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle', message: '' });
  const busy = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (busy.current || !form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim(), email = String(data.get('email') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim(), message = String(data.get('message') ?? '').trim();
    if (!name || !subject || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ kind: 'error', message: 'Please enter a valid email and complete every field with more than whitespace.' }); return;
    }
    busy.current = true;
    setStatus({ kind: 'loading', message: 'Sending your message…' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website: String(data.get('website') ?? '') }),
      });
      const result: unknown = await response.json();
      if (!response.ok || typeof result !== 'object' || result === null || !('success' in result) || result.success !== true) {
        setStatus({ kind: 'error', message: response.status === 429 ? 'Too many attempts. Please wait before trying again.' : 'Unable to send your message right now. Please try again.' });
        return;
      }
      form.reset();
      setStatus({ kind: 'success', message: 'Message sent successfully. I’ll get back to you soon.' });
    } catch { setStatus({ kind: 'error', message: 'Unable to send your message right now. Please try again.' }); }
    finally { busy.current = false; }
  }
  return <div className="contact-grid">
    <div className="contact-copy"><SectionHeading number="05" label="LET’S CONNECT" title="Let’s build something meaningful." /><Reveal delay={.06} distance={20}><p className="contact-lead">A conversation.<br />A new possibility.</p><p className="body-copy">I’m open to conversations about web development, intelligent applications, and opportunities to learn and build.</p>
      <div className="contact-links"><a href={`mailto:${profile.email}`}><span className="contact-link-icon"><Mail size={18} /></span><span><small>EMAIL</small>{profile.email}</span><ArrowUpRight size={17} /></a><a href={profile.phoneHref}><span className="contact-link-icon"><Phone size={18} /></span><span><small>PHONE</small>{profile.phone}</span><ArrowUpRight size={17} /></a></div>
      <div className="social-links"><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={17} />GitHub<ArrowUpRight size={14} /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={17} />LinkedIn<ArrowUpRight size={14} /></a></div>
    </Reveal></div>
    <Reveal className="contact-form-entry" delay={.14} distance={24}><Glass className="contact-form" depth="medium"><form onSubmit={submit} aria-busy={status.kind === 'loading'}>
      <div className="form-heading"><span className="eyebrow">START A CONVERSATION</span><span className="form-hint">All fields required</span></div>
      <div aria-hidden="true" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}><label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={2000} /></label></div>
      <div className="form-row"><label>Name<input name="name" autoComplete="name" placeholder="Your name" required maxLength={100} /></label><label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></label></div>
      <label>Subject<input name="subject" placeholder="What would you like to build?" required maxLength={150} /></label>
      <label>Message<textarea name="message" rows={3} placeholder="Tell me a little about your idea…" required maxLength={2000} aria-describedby="contact-status" /></label>
      <button className="button primary" type="submit" disabled={status.kind === 'loading'}>{status.kind === 'loading' ? <>Sending...<LoaderCircle size={17} className="spinner" /></> : <>Send Message<ArrowUpRight size={17} /></>}</button>
      <p id="contact-status" className={`form-note ${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'} aria-live={status.kind === 'error' ? 'assertive' : 'polite'}>{status.message || 'Send a message directly to Rifky’s inbox.'}</p>
    </form></Glass></Reveal>
  </div>;
}

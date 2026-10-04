'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useSpring } from 'motion/react';
import { ArrowUpRight, ArrowDown, Github, Linkedin, Download, MapPin } from 'lucide-react';
import { profile } from '@/data/portfolio';
import { Reveal, Glass, Magnetic } from '@/components/ui/glass';

export function Hero({ downloadCV }: { downloadCV: () => Promise<void> }) {
  const reduced = useReducedMotion();
  const [word, setWord] = useState(0);
  const [portrait, setPortrait] = useState<'loading' | 'ready' | 'missing'>('loading');
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rotateY = useSpring(mx, { stiffness: 100, damping: 22 });
  const rotateX = useSpring(my, { stiffness: 100, damping: 22 });
  const words = ['Web.', 'AI.', 'People.'];
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setWord(current => (current + 1) % 3), 3600);
    return () => clearInterval(timer);
  }, [reduced]);
  useEffect(() => {
    const pointer = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
    const reset = () => { mx.set(0); my.set(0); };
    pointer.addEventListener('change', reset);
    reset();
    return () => pointer.removeEventListener('change', reset);
  }, [mx, my, reduced]);
  return <section id="home" className="hero container">
    <div className="hero-copy"><Reveal>
      <span className="hero-kicker"><span className="status-dot" /> DEVELOPER. THINKER. BUILDER.</span>
      <p className="hero-greeting">Hello, I’m</p>
      <h1>Mohammed<br /><span>Rifky</span><span className="name-dot">.</span></h1>
      <div className="role"><span />{profile.role}</div>
      <p className="hero-description">{profile.description}</p>
      <div className="hero-descriptor" aria-label="I build experiences for Web, AI and People"><span>I build experiences for</span><span className="descriptor-word" aria-hidden="true"><AnimatePresence mode="wait"><motion.strong key={words[word]} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .4 }}>{words[word]}</motion.strong></AnimatePresence></span></div>
      <div className="hero-actions"><Magnetic><a href="#projects" className="button primary">Explore My Work<ArrowUpRight size={17} /></a></Magnetic><Magnetic><a className="button secondary" href={profile.cv} download="Mohammed-Rifky-CV.pdf" onClick={event => { event.preventDefault(); void downloadCV(); }}>Download CV<Download size={16} /></a></Magnetic></div>
      <div className="hero-bottom"><a className="glass glass-soft text-link hero-contact" href={`mailto:${profile.email}`}>Contact Me<ArrowUpRight size={15} /></a><span className="small-divider" /><a className="icon-button" href={profile.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer"><Github size={19} /></a><a className="icon-button" href={profile.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><Linkedin size={19} /></a></div>
    </Reveal></div>
    <Reveal className="portrait-composition" delay={.12}>
      <div className="glass glass-soft portrait-orbit orbit-one" aria-hidden="true" /><div className="glass glass-soft portrait-orbit orbit-two" aria-hidden="true" />
      <motion.div className="portrait-depth" style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, transformPerspective: 1400 }} onPointerMove={event => {
        if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)').matches) return;
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set(((event.clientX - rect.left) / rect.width - .5) * 2.4);
        my.set(-((event.clientY - rect.top) / rect.height - .5) * 2.4);
      }} onPointerLeave={() => { mx.set(0); my.set(0); }}>
        <Glass className="portrait-stage" depth="medium">
          <div className="portrait-image">
            {portrait === 'missing' && <div className="portrait-placeholder" role="img" aria-label="Portrait unavailable. Monogram placeholder for Mohammed Rifky."><div className="portrait-sculpture" aria-hidden="true" /><span className="portrait-initials">MR<span>.</span></span><span className="portrait-placeholder-label">Portrait unavailable.</span></div>}
            {portrait !== 'missing' && <Image src={profile.portrait} alt="Mohammed Rifky" fill sizes="(max-width: 900px) min(86vw, 420px), (max-width: 1100px) 44vw, 512px" priority unoptimized onLoad={() => setPortrait('ready')} onError={() => setPortrait('missing')} className={portrait === 'ready' ? 'loaded' : ''} />}
          </div>
        </Glass>
      </motion.div>
      <div className="portrait-caption"><span>THE PERSON BEHIND THE CODE</span><div className="portrait-location"><MapPin size={12} /> BASED IN {profile.location.toUpperCase()}</div></div>
    </Reveal>
    <div className="hero-foot"><span>WEB DEVELOPMENT <i>/</i> INTELLIGENT EXPERIENCES</span><a href="#about"><span className="scroll-track" aria-hidden="true"><ArrowDown size={14} /></span>Scroll to discover</a></div>
  </section>;
}

'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Github, Linkedin, Sun, Moon, Command, Menu, X, GraduationCap, ShieldCheck, Layers, Check, Download, Mail } from 'lucide-react';
import { profile, education, focus, navigation, projects, skills, certifications, jwsFeatures } from '@/data/portfolio';
import { welcome, type ChatMessage } from '@/lib/assistant';
import { Glass, Reveal, useLiquidReflection } from '@/components/ui/glass';
import { Modal } from '@/components/ui/modal';
import { SectionHeading } from '@/components/ui/section-heading';
import { Hero } from '@/components/sections/hero';
import ProjectShowcase from '@/components/sections/project-showcase';
import Contact from '@/components/sections/contact';
import { CommandPalette, type CommandAction } from '@/components/command/palette';
import { ChatPanel } from '@/components/assistant/chat-panel';
import { NavigationLens } from '@/components/ui/navigation-lens';

type Overlay = 'palette' | 'chat' | 'cv' | 'menu' | null;

export default function Portfolio({ availableMedia = [] }: { availableMedia?: string[] }) {
  const reduced = useReducedMotion();
  const assistantReflection = useLiquidReflection();
  const navbarReflection = useLiquidReflection();
  const [intro, setIntro] = useState(true);
  const [introStep, setIntroStep] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: welcome }]);
  const cvBusy = useRef(false);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('rifky-intro') === 'seen'; } catch { /* Storage can be unavailable. */ }
    const skip = seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = setTimeout(() => setIntroStep(true), 900);
    const finish = setTimeout(() => {
      setIntro(false);
      try { sessionStorage.setItem('rifky-intro', 'seen'); } catch { /* Optional session preference. */ }
    }, skip ? 0 : 2200);
    const sync = setTimeout(() => setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'), 0);
    return () => { clearTimeout(step); clearTimeout(finish); clearTimeout(sync); };
  }, []);

  useEffect(() => {
    const scroll = () => {
      setScrolled(window.scrollY > 30);
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) setActive('contact');
    };
    scroll();
    window.addEventListener('scroll', scroll, { passive: true });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    navigation.forEach(name => { const element = document.getElementById(name.toLowerCase()); if (element) observer.observe(element); });
    return () => { window.removeEventListener('scroll', scroll); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (intro) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOverlay(current => current === 'palette' ? null : 'palette');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [intro]);

  useEffect(() => {
    if (!intro) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [intro]);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next); document.documentElement.dataset.theme = next;
    try { localStorage.setItem('rifky-theme', next); } catch { /* Theme remains usable without storage. */ }
  }

  async function downloadCV() {
    if (cvBusy.current) return;
    cvBusy.current = true;
    try {
      const result = await fetch(profile.cv, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (!result.ok || !result.headers.get('content-type')?.includes('pdf')) { setOverlay('cv'); return; }
      const anchor = document.createElement('a');
      anchor.href = profile.cv; anchor.download = 'Mohammed-Rifky-CV.pdf';
      document.body.append(anchor); anchor.click(); anchor.remove();
    } catch { setOverlay('cv'); }
    finally { cvBusy.current = false; }
  }

  function navigate(name: string) {
    setOverlay(null);
    // Let the dialog release its scroll lock before navigating to the shared CSS offset.
    requestAnimationFrame(() => {
      const section = document.getElementById(name.toLowerCase());
      if (!section) return;
      section.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    });
  }
  const commands: CommandAction[] = [
    ...navigation.map(name => ({ label: name === 'Home' ? 'Go Home' : name === 'About' ? 'About Rifky' : name === 'Contact' ? 'Contact Rifky' : `View ${name}`, group: 'NAVIGATE', action: () => navigate(name) })),
    { label: 'Download CV', group: 'DOCUMENT', action: () => { setOverlay(null); void downloadCV(); } },
    { label: 'Open GitHub', group: 'CONNECT', action: () => { window.open(profile.github, '_blank', 'noopener,noreferrer'); setOverlay(null); } },
    { label: 'Open LinkedIn', group: 'CONNECT', action: () => { window.open(profile.linkedin, '_blank', 'noopener,noreferrer'); setOverlay(null); } },
    { label: 'Ask Rifky AI', group: 'EXPLORE', action: () => setOverlay('chat') },
    { label: 'Toggle Theme', group: 'APPEARANCE', action: () => { toggleTheme(); setOverlay(null); } },
  ];

  return <MotionConfig reducedMotion="user"><div className="portfolio">
    <div className="page-grain" aria-hidden="true" />
    <a href="#main" className="skip-link" inert={intro}>Skip to content</a>
    <AnimatePresence>{intro && <motion.div className="intro" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .5 }}>
      <motion.div className="intro-orb glass-orb" aria-hidden="true" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: introStep ? .35 : 1, scale: introStep ? 2.6 : 1 }} transition={{ duration: 1.2, ease: [.22, 1, .36, 1] }} />
      <AnimatePresence mode="wait"><motion.p key={String(introStep)} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .3 }}>{introStep ? "I'm Mohammed Rifky." : 'Hi.'}</motion.p></AnimatePresence>
      <button className="text-link" onClick={() => { setIntro(false); try { sessionStorage.setItem('rifky-intro', 'seen'); } catch { /* Optional. */ } }}>Skip intro<ArrowUpRight size={14} /></button>
    </motion.div>}</AnimatePresence>

    <header className={`nav-wrap ${scrolled ? 'scrolled' : ''}`} inert={intro}>
      <motion.nav {...navbarReflection} className="navbar" aria-label="Main navigation">
        <span className="navbar-material" aria-hidden="true">
          <span className="navbar-diffusion" />
          <span className="navbar-refraction" />
          <span className="navbar-reflection" />
          <span className="navbar-rim" />
        </span>
        <div className="navbar-content">
        <a className="wordmark" href="#home" aria-label="Mohammed Rifky home">mr<span>.</span></a>
        <button className="mobile-ask" onClick={() => setOverlay('chat')} aria-label="Ask Rifky AI" aria-haspopup="dialog"><Command size={13} aria-hidden="true" /><span>Ask Rifky...</span></button>
        <div className="desktop-nav"><NavigationLens active={active} />{navigation.map(name => <a className={active === name.toLowerCase() ? 'active' : ''} aria-current={active === name.toLowerCase() ? 'location' : undefined} key={name} href={`#${name.toLowerCase()}`}><span className="nav-label">{name}</span></a>)}</div>
        <div className="nav-tools">
          <button className="icon-button command-toggle" onClick={() => setOverlay('palette')} aria-label="Open command palette (Control or Command K)" aria-haspopup="dialog"><Command size={15} /><span>K</span></button><span className="nav-divider" />
          <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
          <a className="icon-button nav-social" href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={17} /></a>
          <a className="icon-button nav-social" href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
          <button className="icon-button mobile-toggle" onClick={() => setOverlay(overlay === 'menu' ? null : 'menu')} aria-expanded={overlay === 'menu'} aria-controls="mobile-nav" aria-haspopup="dialog" aria-label="Open navigation menu">{overlay === 'menu' ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        </div>
      </motion.nav>
    </header>

    <main id="main" tabIndex={-1} inert={intro}>
      <Hero downloadCV={downloadCV} />
      <div className="section-rule container" />
      <section id="about" className="section container">
        <SectionHeading number="01" label="A LITTLE ABOUT ME" title="Curiosity meets craft." />
        <div className="about-grid">
          <Reveal delay={.06}><p className="about-lead">I’m Rifky, an IT undergraduate drawn to the space where <em>thoughtful design meets useful technology.</em></p>
            <p className="body-copy">I connect responsive interfaces with database-backed applications. My university work also explores how image processing and computer vision can make digital experiences more intelligent.</p>
            <p className="body-copy">Each project is an opportunity to understand a problem, make careful decisions, and keep learning.</p>
            <div className="focus-tags">{focus.map((item, index) => <span key={item}><small aria-hidden="true">{String(index + 1).padStart(2, '0')}</small>{item}</span>)}</div>
          </Reveal>
          <Reveal delay={.14}><Glass className="education" depth="medium"><span className="education-icon"><GraduationCap size={25} /></span><span className="eyebrow">THE FOUNDATION</span><h3>{education.university}</h3><p>{education.degree}</p><span className="education-faculty">{education.faculty}</span><div className="education-line" /><div className="education-dates"><span>{education.period}</span><span>Expected graduation<strong>{education.graduation}</strong></span></div></Glass></Reveal>
        </div>
      </section>

      <section id="experience" className="section container">
        <SectionHeading number="02" label="FEATURED ENGINEERING" title="Built for real needs." description="A closer look at the decisions behind a community service platform." />
        <Reveal delay={.08}><Glass className="case-study" depth="medium">
          <div className="case-header"><span className="case-label"><Layers size={16} /> FEATURED CASE STUDY</span><span className="case-role">{profile.role}</span></div>
          <div className="case-intro"><Reveal delay={.08} distance={18}><h3>Janaza Welfare<br />Society<span>.</span></h3><p>Technology in service of community.</p></Reveal><div className="case-summary"><p>A mobile-first welfare service platform that connects public requests with the people and processes that fulfill them.</p><a className="text-link" href={projects[0].url} target="_blank" rel="noopener noreferrer">Explore on GitHub<ArrowUpRight size={16} /></a></div></div>
          <div className="case-workflow" aria-label="Service workflow"><div><span>01</span><strong>Request</strong><small>Public service & transportation</small></div><ArrowUpRight size={18} aria-hidden="true" /><div><span>02</span><strong>Coordinate</strong><small>Approval, assignment & tracking</small></div><ArrowUpRight size={18} aria-hidden="true" /><div><span>03</span><strong>Review</strong><small>Secure records & confirmations</small></div></div>
          <div className="case-story">{[['Problem', projects[0].problem], ['Solution', projects[0].solution], ['My contribution', projects[0].contribution], ['Outcome', projects[0].outcome]].map(([label, copy]) => <div key={label}><h4>{label}</h4><p>{copy}</p></div>)}</div>
          <div className="case-capabilities"><div><span className="eyebrow"><ShieldCheck size={15} /> CORE FUNCTIONALITY</span><h4>Connected workflows.<br />Considered privacy.</h4></div><ul>{jwsFeatures.map(feature => <li key={feature}><Check size={13} /><span>{feature}</span></li>)}</ul></div>
          <div className="case-technologies"><span className="eyebrow">TECHNOLOGIES & ENGINEERING</span><div className="tags">{projects[0].technologies.map(item => <span key={item}>{item}</span>)}</div></div>
        </Glass></Reveal>
      </section>

      <section id="projects" className="section container"><SectionHeading number="03" label="SELECTED PROJECTS" title="Ideas made tangible." description="Web applications, mobile experiences, and explorations in intelligent systems." /><ProjectShowcase availableMedia={availableMedia} /></section>

      <section id="skills" className="section container">
        <SectionHeading number="04" label="MY TOOLKIT" title="Tools behind the thinking." description="A practical foundation. An appetite to keep growing." />
        <div className="skills-grid">{Object.entries(skills).map(([label, items], index) => <Reveal key={label} delay={.06 + index % 3 * .06}><Glass className={`skill-group skill-${index}`}><div className="skill-heading"><span className="skill-number">0{index + 1}</span><h3>{label}</h3></div><div className="skill-items">{items.map(item => <span key={item}>{item}</span>)}</div></Glass></Reveal>)}</div>
        <div className="certifications"><Reveal><span className="eyebrow">CONTINUOUS LEARNING</span><h3>Learning never<br />stands still.</h3><p className="body-copy">Building the foundation, one new perspective at a time.</p></Reveal><div className="certificate-list">{certifications.map(([title, issuer], index) => <Reveal key={title}><div className="certificate"><span className="certificate-index">{String(index + 1).padStart(2, '0')}</span><div><h4>{title}</h4><span>{issuer}</span></div><span className="certificate-mark" aria-hidden="true"><Check size={14} /></span></div></Reveal>)}</div></div>
      </section>

      <section id="contact" className="section container"><Contact /></section>
    </main>
    <footer className="container" inert={intro}><div><a className="footer-name" href="#home">{profile.name}</a><span>{profile.role}</span></div><div className="footer-links"><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={`mailto:${profile.email}`}>Email</a></div><p>© {new Date().getFullYear()} {profile.name}</p></footer>

    <motion.button {...assistantReflection} className="glass glass-medium assistant-trigger" aria-label="Ask Rifky AI" inert={intro || overlay === 'chat'} style={{ ...assistantReflection.style, visibility: overlay === 'chat' ? 'hidden' : 'visible' }} layoutId={reduced ? undefined : 'portfolio-assistant'} onClick={() => setOverlay('chat')} aria-haspopup="dialog" whileTap={reduced ? undefined : { scale: .96 }}><span className="assistant-orb" aria-hidden="true" /><span className="assistant-label">Ask Rifky AI</span></motion.button>
    {overlay === 'menu' && <Modal key="menu" label="Mobile navigation" onClose={closeOverlay} className="mobile-menu-overlay"><div id="mobile-nav" className="mobile-nav"><span className="eyebrow">EXPLORE THE PORTFOLIO</span>{navigation.map((name, index) => <button key={name} className={active === name.toLowerCase() ? 'active' : ''} onClick={() => navigate(name)}><span>0{index + 1}</span>{name}<ArrowUpRight size={20} /></button>)}<div className="mobile-social"><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={14} /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={14} /></a><button onClick={() => setOverlay('palette')}><Command size={14} /> Search</button></div></div></Modal>}
    {overlay === 'palette' && <CommandPalette key="palette" commands={commands} onClose={closeOverlay} />}
    {overlay === 'chat' && <ChatPanel key="chat" onClose={closeOverlay} messages={messages} setMessages={setMessages} />}
    {overlay === 'cv' && <Modal key="cv" label="CV availability" onClose={closeOverlay}><div className="cv-notice"><span className="notice-icon"><Download size={27} /></span><span className="eyebrow">CURRICULUM VITAE</span><h2>The CV isn’t available yet.</h2><p>Contact Rifky directly to request his latest CV.</p><a className="button primary" href={`mailto:${profile.email}?subject=CV%20request`}>Request CV<Mail size={16} /></a></div></Modal>}
  </div></MotionConfig>;
}


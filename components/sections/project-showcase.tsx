'use client';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Github, ChevronDown, HeartHandshake, Droplets, Sprout, PencilRuler } from 'lucide-react';
import { projects, type Project } from '@/data/portfolio';
import { ProjectMedia } from './project-media';

const entranceEase = [0.22, 1, 0.36, 1] as const;
const copyItem = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0, transition: { duration: .45, ease: entranceEase } } };
const immediateReveal = { hidden: { opacity: 1, x: 0, y: 0, scale: 1 }, visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0 } } };

function ProjectArtwork({ visual }: { visual: Project['visual'] }) {
  return <div className={`project-art art-${visual}`} aria-hidden="true"><div className="art-grid" />
    {visual === 'jws' && <div className="jws-mockup"><div className="mockup-toolbar"><span /><span /><span /><strong>JWS / SERVICE WORKSPACE</strong></div><div className="mockup-body"><div className="mockup-sidebar"><HeartHandshake size={24} /><i /><i /><i /></div><div className="mockup-board"><span className="mockup-title">Care, coordinated.</span><div className="mockup-columns">{['Requests', 'Assigned', 'Review'].map(label => <div key={label}><small>{label}</small><div /><div /></div>)}</div><div className="mockup-privacy"><span /> Protected workflows</div></div></div></div>}
    {visual === 'drawing' && <div className="drawing-mockup"><div className="drawing-sheet"><svg viewBox="0 0 280 300"><path d="M140 238C81 215 45 168 62 110C91 107 126 126 140 152C152 113 183 82 222 85C230 161 197 210 140 238Z" /><path d="M140 253V153M140 211L88 152M140 185L195 122M140 231L191 173" /></svg><span>INPUT / OUTLINE</span></div><div className="drawing-sheet rendered"><svg viewBox="0 0 280 300"><path d="M140 238C81 215 45 168 62 110C91 107 126 126 140 152C152 113 183 82 222 85C230 161 197 210 140 238Z" /><path d="M140 253V153M140 211L88 152M140 185L195 122M140 231L191 173" /></svg><span>REFINE / COLOR</span></div><span className="drawing-tool"><PencilRuler size={20} /></span></div>}
    {visual === 'water' && <div className="water-phone"><div className="phone-notch" /><span className="water-label">WATER LOGGER</span><div className="water-ring"><Droplets size={42} strokeWidth={1} /><span>Daily hydration</span></div><div className="water-bars">{Array.from({ length: 7 }, (_, i) => <span key={i} style={{ height: `${28 + (i * 17 % 50)}px` }} />)}</div><div className="water-add">+ Record intake</div></div>}
    {visual === 'digits' && <div className="digits-composition"><div className="digit-frame"><span>7</span><i className="scan-line" /></div><div className="digit-output"><span className="eyebrow">IMAGE → CLASSIFICATION</span><strong>0 1 2 3 4<br />5 6 <em>7</em> 8 9</strong><span>Patterns. Pixels. Possibilities.</span></div></div>}
    {visual === 'plant' && <div className="plant-composition"><div className="plant-frame"><span className="measure-line vertical" /><span className="measure-line horizontal" /><Sprout size={150} strokeWidth={.65} /><span className="leaf-bound leaf-one" /><span className="leaf-bound leaf-two" /></div><div className="plant-metrics"><span>Leaf area</span><span>Plant height</span><span>Edge detection</span></div></div>}
    <div className="art-caption"><span>{visual === 'jws' ? 'SERVICE / SYSTEMS' : visual === 'drawing' ? 'ART / INTELLIGENCE' : visual === 'water' ? 'SMALL HABITS / DAILY PROGRESS' : visual === 'digits' ? 'PIXELS / PATTERNS' : 'GROW / UNDERSTAND'}</span><span>CONCEPT STUDY</span></div>
  </div>;
}

export default function ProjectShowcase({ availableMedia }: { availableMedia: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const itemVariants = reduced ? immediateReveal : copyItem;
  return <div className="project-list">{projects.map((project, index) => <motion.div key={project.title} initial={reduced ? false : 'hidden'} animate={reduced ? 'visible' : undefined} whileInView={reduced ? undefined : 'visible'} viewport={{ once: true, amount: .12 }}>
    <motion.article className={`project project-${project.visual} ${index % 2 ? 'project-reverse' : ''}`} variants={reduced ? immediateReveal : { hidden: { opacity: .5, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: .55, ease: entranceEase } } }}>
      <motion.div className="project-media-entry" variants={reduced ? immediateReveal : { hidden: { opacity: 0, x: index % 2 ? 24 : -24, y: 20, scale: .98 }, visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: .6, ease: entranceEase } } }}>
      <ProjectMedia media={project.media} availableMedia={availableMedia} fallback={<ProjectArtwork visual={project.visual} />} />
      </motion.div>
      <motion.div className="project-copy" variants={reduced ? immediateReveal : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: .55, ease: entranceEase, delayChildren: .06, staggerChildren: .05 } } }}><div className="project-number">{String(index + 1).padStart(2, '0')}<span>/</span></div><motion.span className="eyebrow" variants={itemVariants}>{project.category}</motion.span><motion.h3 variants={itemVariants}>{project.title}</motion.h3><motion.p className="project-subtitle" variants={itemVariants}>{project.subtitle}</motion.p><motion.p className="body-copy" variants={itemVariants}>{project.solution}</motion.p><motion.div className="tags" variants={itemVariants}>{project.technologies.map(technology => <span key={technology}>{technology}</span>)}</motion.div>
        <motion.div className="project-actions" variants={itemVariants}><button className="text-link" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} aria-controls={`project-detail-${index}`}>Behind the project<ChevronDown size={15} style={{ transform: open === index ? 'rotate(180deg)' : undefined }} /></button>{project.url && <a className="project-github text-link" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} on GitHub`}><Github size={16} />GitHub<ArrowUpRight size={14} /></a>}</motion.div>
      </motion.div>
      <div id={`project-detail-${index}`} className="project-detail-region"><AnimatePresence initial={false}>{open === index && <motion.div className="project-detail-motion" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .35, ease: [.22, 1, .36, 1] }}>
        <div className="glass glass-medium project-details">{[['Overview', project.subtitle], ['My contribution', project.contribution], ['Problem', project.problem], ['Approach', project.solution], ['Outcome', project.outcome]].map(([label, copy]) => <div key={label}><h4>{label}</h4><p>{copy}</p></div>)}<div className="project-detail-stack"><h4>Technologies</h4><p>{project.technologies.join(' · ')}</p></div>{project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-link">View Project on GitHub<ArrowUpRight size={15} /></a>}</div>
      </motion.div>}</AnimatePresence></div>
    </motion.article>
  </motion.div>)}</div>;
}


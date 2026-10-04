'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { useLiquidReflection } from './glass';

export function Modal({ children, label, onClose, className = '' }: { children: ReactNode; label: string; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const reflection = useLiquidReflection();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const overlay = el?.parentElement;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const siblings = Array.from(document.body.children).filter(child => child !== overlay && child instanceof HTMLElement) as HTMLElement[];
    const inertStates = siblings.map(child => child.inert);
    siblings.forEach(child => { child.inert = true; });
    const focusable = () => Array.from(el?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),[tabindex="0"]') ?? []).filter(item => item.tabIndex >= 0 && item.getClientRects().length > 0);
    (el?.querySelector<HTMLElement>('[data-autofocus]') ?? focusable()[0] ?? el)?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0], last = items.at(-1);
        if (!first) { event.preventDefault(); el?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !el?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !el?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      siblings.forEach((child, index) => { child.inert = inertStates[index]; });
      if (previous?.isConnected) previous.focus({ preventScroll: true });
      else if (label === 'Rifky portfolio assistant') document.querySelector<HTMLElement>('.assistant-trigger')?.focus({ preventScroll: true });
    };
  }, [onClose, label]);
  return createPortal(
    <motion.div className={`modal-overlay ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .2 }} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.div {...reflection} ref={ref} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} className="glass glass-elevated modal" layoutId={!reduced && className === 'chat-overlay' ? 'portfolio-assistant' : undefined} initial={reduced || className === 'chat-overlay' ? false : { opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
        <button className="icon-button modal-close" aria-label={`Close ${label}`} onClick={onClose}><X size={19} /></button>
        {children}
      </motion.div>
    </motion.div>, document.body,
  );
}

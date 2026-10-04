'use client';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect, type ReactNode, type PointerEvent } from 'react';

export function useLiquidReflection(enabled = true) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(38), my = useMotionValue(12);
  const sx = useSpring(mx, { stiffness: 65, damping: 24 });
  const sy = useSpring(my, { stiffness: 65, damping: 24 });
  const x = useTransform(sx, value => `${value}%`);
  const y = useTransform(sy, value => `${value}%`);
  useEffect(() => {
    const capable = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
    const reset = () => { mx.set(38); my.set(12); if (reduced || !capable.matches) { sx.jump(38); sy.jump(12); } };
    reset(); capable.addEventListener('change', reset);
    return () => capable.removeEventListener('change', reset);
  }, [reduced, mx, my, sx, sy]);
  return { style: { '--reflection-x': x, '--reflection-y': y } as import('motion/react').MotionStyle, onPointerMove: (event: PointerEvent<HTMLElement>) => {
    if (!enabled || reduced || event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    // Wide environmental reflection moves only a fraction of pointer travel.
    mx.set(35 + (event.clientX - rect.left) / rect.width * 6);
    my.set(10 + (event.clientY - rect.top) / rect.height * 4);
  }, onPointerLeave: () => { mx.set(38); my.set(12); } };
}

export function LiquidGlass({ children, className = '', depth = 'soft', as = 'div' }: { children: ReactNode; className?: string; depth?: 'soft' | 'medium' | 'elevated'; as?: 'div' | 'nav' }) {
  const reflection = useLiquidReflection(depth !== 'soft' && className !== 'portrait-stage');
  const Element = as === 'nav' ? motion.nav : motion.div;
  return <Element className={`glass glass-${depth} ${className}`} {...reflection} aria-label={as === 'nav' ? 'Main navigation' : undefined}>{children}</Element>;
}
export const Glass = LiquidGlass;

export function Reveal({ children, className = '', delay = 0, distance = 22 }: { children: ReactNode; className?: string; delay?: number; distance?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: distance }} animate={reduced ? { opacity: 1, y: 0 } : undefined} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduced ? 0 : .55, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function Magnetic({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 240, damping: 22 }), y = useSpring(my, { stiffness: 240, damping: 22 });
  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left - rect.width / 2) * 0.12);
    my.set((event.clientY - rect.top - rect.height / 2) * 0.15);
  }
  return <motion.div className={`magnetic ${className}`} style={{ x, y }} onPointerMove={move} onPointerLeave={() => { mx.set(0); my.set(0); }}>{children}</motion.div>;
}

'use client';

import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';

const lensSpring = { type: 'spring' as const, stiffness: 360, damping: 35, mass: .85 };

/** One persistent optical object; scroll-spy continues to own the active link. */
export function NavigationLens({ active }: { active: string }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLSpanElement>(null);
  const body = useRef<HTMLSpanElement>(null);
  const halo = useRef<HTMLSpanElement>(null);
  const previous = useRef<{ x: number; width: number } | null>(null);
  const x = useMotionValue(0);
  const width = useMotionValue(0);
  const bodyScale = useMotionValue(1);
  const bodyScaleY = useMotionValue(1);
  const haloScale = useMotionValue(1);
  const haloX = useMotionValue(0);
  const opacity = useMotionValue(1);

  useLayoutEffect(() => {
    const track = root.current?.parentElement;
    if (!track) return;
    let animations: Array<{ stop: () => void }> = [];
    function place(morph: boolean) {
      const link = track?.querySelector<HTMLAnchorElement>('a[aria-current="location"]');
      if (!link || !track) return;
      animations.forEach(animation => animation.stop());
      const target = { x: link.offsetLeft + 2, width: link.offsetWidth - 4 };
      const last = previous.current;
      previous.current = target;
      bodyScale.set(1); bodyScaleY.set(1); haloScale.set(1); haloX.set(0); opacity.set(1);
      if (!last || !morph) {
        x.set(target.x); width.set(target.width);
        return;
      }
      const travel = target.x - last.x;
      const direction = Math.sign(travel);
      if (body.current) body.current.style.transformOrigin = direction < 0 ? '100% 50%' : '0% 50%';
      if (halo.current) halo.current.style.transformOrigin = direction < 0 ? '100% 50%' : '0% 50%';
      const transition = reduced ? { duration: .12, ease: 'easeOut' as const } : lensSpring;
      animations = [animate(x, target.x, { ...transition, onComplete: () => {
        if (reduced) return;
        // Settle only once the travel spring actually arrives, not on a timer.
        if (body.current) body.current.style.transformOrigin = '50% 50%';
        animations.push(
          animate(bodyScale, [1, .985, 1], { duration: .2, times: [0, .4, 1], ease: 'easeInOut' }),
          animate(bodyScaleY, [1, 1.01, 1], { duration: .2, times: [0, .4, 1], ease: 'easeInOut' }),
        );
      } }), animate(width, target.width, transition)];
      if (reduced) {
        // Short fade/reposition, without surface-tension transforms.
        animations.push(animate(opacity, [.65, 1], { duration: .12 }));
        return;
      }
      const stretch = Math.min(.14, .05 + Math.abs(travel) * .00045 + Math.max(0, target.width - last.width) * .001);
      animations.push(
        animate(bodyScale, [1, 1, 1 + stretch, 1], { duration: .46, times: [0, .1, .3, 1], ease: 'easeOut' }),
        animate(haloScale, [1, 1 + Math.min(.2, stretch * 1.6), 1], { duration: .54, times: [0, .18, 1], ease: 'easeOut' }),
        animate(haloX, [0, direction * 2, -direction * 3, 0], { duration: .54, times: [0, .14, .45, 1], ease: 'easeOut' }),
      );
    }
    place(true);
    // Measurements run only on selection or layout changes, never per scroll frame.
    let initialObservation = true;
    const observer = new ResizeObserver(() => {
      // The first notification reports existing bounds; don't interrupt arrival.
      if (initialObservation) { initialObservation = false; return; }
      place(false);
    });
    observer.observe(track);
    track.querySelectorAll('a').forEach(link => observer.observe(link));
    return () => { observer.disconnect(); animations.forEach(animation => animation.stop()); };
  }, [active, reduced, x, width, bodyScale, bodyScaleY, haloScale, haloX, opacity]);

  return <motion.span ref={root} aria-hidden="true" className="nav-selection-lens" style={{ x, width, opacity }}>
    <motion.span ref={halo} className="nav-lens-halo" style={{ x: haloX, scaleX: haloScale }} />
    <motion.span ref={body} className="nav-lens-body" style={{ scaleX: bodyScale, scaleY: bodyScaleY }} />
  </motion.span>;
}

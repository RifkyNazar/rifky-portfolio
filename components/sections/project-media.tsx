'use client';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { Glass } from '@/components/ui/glass';
import type { ProjectMediaData } from '@/data/portfolio';

/** Real screenshots only; absent or failed assets retain the existing concept artwork. */
export function ProjectMedia({ media, availableMedia, fallback }: {
  media?: ProjectMediaData; availableMedia: string[]; fallback: ReactNode;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const images = media?.images.filter(image => availableMedia.includes(image.src) && !failed.includes(image.src)) ?? [];
  if (!media || !images.length) return fallback;
  const active = images.find(image => image.src === selected) ?? images[0];
  const gallery = media.layout === 'desktop' ? [active] : images;
  return <Glass depth="medium" className={`project-media media-${media.layout}`}>
    {media.layout === 'desktop' && <div className="media-browser-bar" aria-hidden="true"><span /><span /><span /><small>PROJECT PREVIEW</small></div>}
    <div className="media-gallery">{gallery.map((image, index) => <figure key={image.src}>
      <div className="media-screen"><Image src={image.src} alt={image.alt} fill sizes={media.layout === 'mobile' ? '(max-width: 768px) 28vw, 160px' : '(max-width: 768px) 90vw, 560px'} onError={() => setFailed(current => [...current, image.src])} />
      </div><figcaption><span>{String(index + 1).padStart(2, '0')}</span>{image.label}</figcaption>
    </figure>)}</div>
    {media.layout === 'desktop' && images.length > 1 && <div className="media-tabs" aria-label="Project screenshots">{images.map(image => <button key={image.src} aria-pressed={active.src === image.src} onClick={() => setSelected(image.src)}>{image.label}</button>)}</div>}
    {media.layout === 'comparison' && <p className="media-note">Input and result · Side-by-side comparison</p>}
  </Glass>;
}

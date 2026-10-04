import { Reveal } from './glass';

export function SectionHeading({ number, label, title, description }: { number: string; label: string; title: string; description?: string }) {
  return <Reveal className="section-heading">
    <div className="section-index"><span>{number}</span><span className="eyebrow">{label}</span></div>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </Reveal>;
}

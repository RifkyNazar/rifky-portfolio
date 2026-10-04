import Portfolio from '@/components/portfolio';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { projects } from '@/data/portfolio';

export default function Page() {
  const availableMedia = projects.flatMap(project => project.media?.images ?? [])
    .filter(image => existsSync(path.join(process.cwd(), 'public', image.src)))
    .map(image => image.src);
  return <Portfolio availableMedia={availableMedia} />;
}

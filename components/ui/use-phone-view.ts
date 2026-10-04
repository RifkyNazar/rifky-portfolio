'use client';

import { useSyncExternalStore } from 'react';

const query = '(max-width: 600px)';
function subscribe(update: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', update);
  return () => media.removeEventListener('change', update);
}

/** Keep server rendering stable; only phones use the shorter reveal distances. */
export function usePhoneView() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

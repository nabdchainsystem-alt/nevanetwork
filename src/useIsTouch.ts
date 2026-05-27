import { useEffect, useState } from 'react';

/**
 * True on touch / coarse-pointer devices (phones, tablets). Used to mount the
 * on-screen <TouchControls> overlay and add an `is-touch` class for CSS.
 * Re-evaluates if the primary pointer changes (e.g. a 2-in-1 docking).
 */
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(() =>
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window),
  );

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setTouch(mq.matches || 'ontouchstart' in window);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return touch;
}

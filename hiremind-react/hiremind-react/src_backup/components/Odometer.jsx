import { useEffect, useRef } from 'react';

/** Animated count-up number, e.g. for admin stat cards. */
export default function Odometer({ value, duration = 700 }) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const startTime = performance.now();
    let raf;
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else el.textContent = value;
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span ref={elRef}>0</span>;
}

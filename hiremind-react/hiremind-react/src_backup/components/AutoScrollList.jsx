import { useEffect, useRef } from 'react';

/**
 * Smooth auto-scrolling list panel — same look/behaviour as the
 * notification dropdown (fixed max-height, overflow-y: auto, natural
 * item heights) except it drifts downward on its own instead of waiting
 * for the user to scroll, looping back to the top when it reaches the
 * bottom. Pauses on hover/touch so it never fights the user.
 *
 * Deliberately does NOT force a fixed height per item and does NOT give
 * each item its own scrollbar — that's what was clipping content before.
 * Items are rendered exactly as passed in (`children`), at whatever
 * height their own content needs.
 */
export default function AutoScrollList({ children, maxHeight = 320, speed = 0.35, className = '' }) {
  const ref = useRef(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf;
    function tick() {
      if (!pausedRef.current && el.scrollHeight > el.clientHeight + 1) {
        el.scrollTop += speed;
        if (el.scrollTop >= el.scrollHeight - el.clientHeight - 0.5) {
          el.scrollTop = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={`auto-scroll-list ${className}`}
      style={{ maxHeight, overflowY: 'auto' }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { pausedRef.current = false; }}
    >
      {children}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';

/**
 * Auto-playing vertical (up→down) carousel.
 *
 * Shows `visibleCount` items at a time in a fixed-height window and advances
 * one item every `interval` ms, looping seamlessly. Pauses on hover so the
 * user can read/interact. Each item gets its own internal scrollbar
 * (`overflow-y: auto`) so a single tall item never breaks the fixed-height
 * layout of the slider — it just scrolls inside its own slot.
 *
 * If there are fewer than `visibleCount + 1` items, it just renders them
 * statically (no point animating a list that already fits).
 */
export default function VerticalSlider({
  items,
  visibleCount = 3,
  itemHeight = 90,
  gap = 10,
  interval = 3400,
  renderItem,
  keyFn,
  emptyState = null,
}) {
  const n = items.length;
  const canSlide = n > visibleCount;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const step = itemHeight + gap;

  useEffect(() => {
    setIndex(0);
    setAnimate(true);
  }, [n, visibleCount]);

  // Advance one item at a time.
  useEffect(() => {
    if (!canSlide || paused) return undefined;
    const id = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, interval);
    return () => clearInterval(id);
  }, [canSlide, paused, interval]);

  // Once we've scrolled past the real list (into the cloned lead-in items),
  // snap back to 0 without a visible jump by disabling the transition for
  // one frame right after it lands.
  useEffect(() => {
    if (!canSlide || index !== n) return undefined;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 560);
    return () => clearTimeout(t);
  }, [index, n, canSlide]);

  const displayItems = useMemo(
    () => (canSlide ? [...items, ...items.slice(0, visibleCount)] : items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, canSlide, visibleCount]
  );

  if (n === 0) return emptyState;

  const visible = Math.min(n, visibleCount);
  const containerHeight = visible * itemHeight + (visible - 1) * gap;

  return (
    <div
      className="v-slider"
      style={{ height: containerHeight }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="v-slider-track"
        style={{
          gap,
          transform: `translateY(-${index * step}px)`,
          transition: animate ? 'transform 0.55s cubic-bezier(.4,0,.2,1)' : 'none',
        }}
      >
        {displayItems.map((it, i) => (
          <div className="v-slider-item" style={{ height: itemHeight }} key={keyFn ? keyFn(it, i) : i}>
            {renderItem(it, i % n)}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';

export default function ScoreRing({ pct, size = 72, stroke = 6 }) {
  const circleRef = useRef(null);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const tier = pct >= 70 ? 'high' : pct >= 40 ? '' : 'low';

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDashoffset = c; // reset then animate to target
    const t = setTimeout(() => {
      el.style.strokeDashoffset = offset;
    }, 60);
    return () => clearTimeout(t);
  }, [pct, offset, c]);

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle className="bg-ring" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          ref={circleRef}
          className={`fg-ring ${tier}`}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c}
        />
      </svg>
      <div className="num">{pct}%</div>
    </div>
  );
}

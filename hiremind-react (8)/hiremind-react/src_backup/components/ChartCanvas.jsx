import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * Thin wrapper around Chart.js so we don't need the react-chartjs-2 package.
 * Pass `config` as a full Chart.js config object ({ type, data, options }).
 * Height is enforced by a fixed-size wrapper div + maintainAspectRatio:false,
 * so charts stay compact instead of Chart.js letting them grow to fill the card.
 */
export default function ChartCanvas({ config, height = 180 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const merged = {
      ...config,
      options: {
        ...(config.options || {}),
        responsive: true,
        maintainAspectRatio: false,
      },
    };
    chartRef.current = new Chart(canvasRef.current, merged);
    return () => {
      chartRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return (
    <div style={{ height, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

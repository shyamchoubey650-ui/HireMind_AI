/**
 * Maps a job title (or any free-text role) to a consistent {icon, color}
 * pairing used for icon badges, listing-row left borders, and chart bars.
 * Falls back to a hash-based rotation so unrecognized titles still get a
 * stable, distinct color instead of always defaulting to violet.
 */
const RULES = [
  { test: /machine learning|ml engineer|ai engineer|data scientist/i, icon: 'brain', color: 'violet' },
  { test: /full[\s-]?stack/i, icon: 'code', color: 'blue' },
  { test: /front[\s-]?end/i, icon: 'monitor', color: 'teal' },
  { test: /java(?!script)/i, icon: 'coffee', color: 'amber' },
  { test: /back[\s-]?end|database|sql/i, icon: 'database', color: 'pink' },
  { test: /devops|cloud|infra/i, icon: 'globe', color: 'green' },
  { test: /product|design/i, icon: 'spark', color: 'pink' },
  { test: /data analyst|analytics/i, icon: 'chart', color: 'blue' },
];

const FALLBACK_COLORS = ['violet', 'blue', 'teal', 'amber', 'rust', 'pink', 'green'];
const FALLBACK_ICONS = ['briefcase', 'code', 'globe', 'monitor', 'database'];

export function getJobVisual(title = '') {
  for (const rule of RULES) {
    if (rule.test.test(title)) return { icon: rule.icon, color: rule.color };
  }
  // stable hash fallback so the same title always gets the same look
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return {
    icon: FALLBACK_ICONS[hash % FALLBACK_ICONS.length],
    color: FALLBACK_COLORS[hash % FALLBACK_COLORS.length],
  };
}

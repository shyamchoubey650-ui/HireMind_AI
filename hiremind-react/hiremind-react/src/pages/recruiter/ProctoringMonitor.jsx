import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  apiRequest,
  API_BASE,
  getToken,
} from '../../api';

/* ============================================================
   EVENT LABELS & CONFIG
   ============================================================ */

const EVENT_LABELS = {
  TAB_SWITCH: 'Tab switch detected',
  FULLSCREEN_EXIT: 'Fullscreen mode exited',
  WINDOW_BLUR: 'Window lost focus',
  CAMERA_DISCONNECTED: 'Camera disconnected',
  NO_FACE: 'Candidate face not detected',
  MULTIPLE_FACES: 'Multiple faces detected',
  PHONE_DETECTED: 'Mobile phone detected',
  SUSPICIOUS_OBJECT: 'Suspicious object detected',
  SUSPICIOUS_AUDIO: 'Unusual audio activity detected',
  SUSPICIOUS_KEYBOARD_ACTION: 'Suspicious keyboard shortcut',
  COPY_ATTEMPT: 'Copy attempt detected',
  PASTE_ATTEMPT: 'Paste attempt detected',
  CUT_ATTEMPT: 'Cut attempt detected',
  CONTEXT_MENU_ATTEMPT: 'Context-menu attempt',
  DRAG_ATTEMPT: 'Drag attempt detected',
  PAGE_RELOAD: 'Assessment page reloaded',
  DUPLICATE_SESSION: 'Duplicate assessment session',
  TIMEOUT: 'Assessment timeout',
};

function RenderEventIcon({ type }) {
  const normType = String(type || '').toUpperCase();

  if (normType.includes('FULLSCREEN') || normType.includes('PAGE_RELOAD')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    );
  }

  if (normType.includes('AUDIO')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    );
  }

  if (normType.includes('PHONE')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    );
  }

  if (normType.includes('KEYBOARD')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M6 12h.001M10 12h.001M14 12h.001M18 12h.001M7 16h10"/>
      </svg>
    );
  }

  if (normType.includes('TAB') || normType.includes('WINDOW')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function eventThemeColor(type) {
  const normType = String(type || '').toUpperCase();

  if (normType.includes('FULLSCREEN') || normType.includes('PAGE_RELOAD')) {
    return { bg: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.22)', color: '#fb7185' };
  }
  if (normType.includes('AUDIO')) {
    return { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.22)', color: '#fbbf24' };
  }
  if (normType.includes('PHONE') || normType.includes('FACE')) {
    return { bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.22)', color: '#c084fc' };
  }
  if (normType.includes('KEYBOARD')) {
    return { bg: 'rgba(234, 179, 8, 0.08)', border: 'rgba(234, 179, 8, 0.22)', color: '#facc15' };
  }
  if (normType.includes('TAB')) {
    return { bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.22)', color: '#38bdf8' };
  }
  return { bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.22)', color: '#94a3b8' };
}

function eventLabel(type) {
  if (EVENT_LABELS[type]) {
    return EVENT_LABELS[type];
  }
  return String(type || 'Security violation')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(value) {
  if (!value) return 'Time unavailable';
  let normalized = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(normalized)) {
    normalized += 'Z';
  }
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function buildSnapshotUrl(snapshotUrl) {
  if (!snapshotUrl) return null;
  const value = String(snapshotUrl).trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) {
    return value;
  }
  const base = String(API_BASE || '').replace(/\/+$/, '');
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${base}${path}`;
}

async function convertBlobUrlToBase64(blobUrl) {
  if (!blobUrl) return null;
  try {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function ProctoringMonitor({ applicationId, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snapshotUrls, setSnapshotUrls] = useState({});
  const [snapshotLoading, setSnapshotLoading] = useState({});
  const [expandedEventKey, setExpandedEventKey] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');
  const [showAllSnapshots, setShowAllSnapshots] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const objectUrlRegistry = useRef(new Map());

  useEffect(() => {
    return () => {
      objectUrlRegistry.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      objectUrlRegistry.current.clear();
    };
  }, []);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError('');

    try {
      const result = await apiRequest(
        `/assessments/submissions/${applicationId}/proctoring`
      );
      setData(result);
    } catch (e) {
      console.error('[Proctoring] Audit fetch error:', e);
      setError(e?.message || 'Could not load proctoring data.');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (!open || !applicationId) return undefined;
    load();
    const timer = setInterval(() => load(), 5000);
    return () => clearInterval(timer);
  }, [open, applicationId, load]);

  useEffect(() => {
    if (!open) {
      setExpandedEventKey(null);
    }
  }, [open]);

  const rawEvents = useMemo(() => {
    if (!Array.isArray(data?.events)) return [];
    return [...data.events];
  }, [data]);

  const sortedAndFilteredEvents = useMemo(() => {
    let list = [...rawEvents];
    if (activeFilter !== 'ALL') {
      list = list.filter(e => {
        const t = String(e?.event_type || '').toUpperCase();
        return t.includes(activeFilter);
      });
    }
    list.sort((a, b) => {
      const t1 = new Date(a?.created_at || 0).getTime();
      const t2 = new Date(b?.created_at || 0).getTime();
      return sortOrder === 'NEWEST' ? t2 - t1 : t1 - t2;
    });
    return list;
  }, [rawEvents, activeFilter, sortOrder]);

  const riskScore = Number(data?.risk_score ?? 75);
  const riskBand = String(data?.risk_band || (riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'clean')).toLowerCase();

  const snapshots = useMemo(() => {
    if (!Array.isArray(data?.snapshots)) return [];
    return [...data.snapshots].sort((a, b) => {
      const first = new Date(a?.captured_at || 0).getTime();
      const second = new Date(b?.captured_at || 0).getTime();
      return first - second;
    });
  }, [data]);

  const allSnapshots = useMemo(() => {
    const map = new Map();
    if (Array.isArray(data?.snapshots)) {
      data.snapshots.forEach(s => {
        if (!s) return;
        const id = s.id ?? s.snapshot_id ?? s.url;
        if (id != null) map.set(String(id), s);
      });
    }
    if (Array.isArray(data?.events)) {
      data.events.forEach(e => {
        const s = e?.snapshot;
        if (!s) return;
        const id = s.id ?? s.snapshot_id ?? s.url;
        if (id != null) {
          const key = String(id);
          if (!map.has(key)) map.set(key, s);
        }
      });
    }
    return Array.from(map.values());
  }, [data]);

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshots() {
      if (!open) return;
      if (!allSnapshots.length) {
        setSnapshotUrls({});
        setSnapshotLoading({});
        return;
      }

      const token = getToken();
      const activeIds = new Set(
        allSnapshots
          .map(s => s?.id ?? s?.snapshot_id)
          .filter(id => id != null)
          .map(String)
      );

      objectUrlRegistry.current.forEach((url, id) => {
        if (!activeIds.has(String(id))) {
          try {
            URL.revokeObjectURL(url);
          } catch {
            // ignore
          }
          objectUrlRegistry.current.delete(id);
        }
      });

      const existingUrls = {};
      objectUrlRegistry.current.forEach((url, id) => {
        existingUrls[id] = url;
      });

      if (!cancelled) setSnapshotUrls(existingUrls);

      await Promise.all(
        allSnapshots.map(async snapshot => {
          if (cancelled || !snapshot) return;
          const snapshotId = snapshot.id ?? snapshot.snapshot_id;
          if (snapshotId == null) return;
          const id = String(snapshotId);
          if (objectUrlRegistry.current.has(id)) return;

          const requestUrl = buildSnapshotUrl(snapshot.url);
          if (!requestUrl) return;

          setSnapshotLoading(p => ({ ...p, [id]: true }));

          try {
            const response = await fetch(requestUrl, {
              method: 'GET',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              cache: 'no-store',
            });
            if (!response.ok) throw new Error('Request error');
            const blob = await response.blob();
            if (!blob || blob.size === 0) throw new Error('Empty image');

            const objectUrl = URL.createObjectURL(blob);
            if (cancelled) {
              URL.revokeObjectURL(objectUrl);
              return;
            }

            const existing = objectUrlRegistry.current.get(id);
            if (existing) {
              URL.revokeObjectURL(objectUrl);
            } else {
              objectUrlRegistry.current.set(id, objectUrl);
            }

            const current = {};
            objectUrlRegistry.current.forEach((url, curId) => {
              current[curId] = url;
            });
            if (!cancelled) setSnapshotUrls(current);
          } catch (e) {
            console.error('[Proctoring] Snapshot load failed:', e);
          } finally {
            if (!cancelled) setSnapshotLoading(p => ({ ...p, [id]: false }));
          }
        })
      );
    }

    loadSnapshots();
    return () => {
      cancelled = true;
    };
  }, [open, allSnapshots]);

  /* ============================================================
     EXPORT REPORT FUNCTION
     ============================================================ */
  const handleExportReport = async () => {
    setIsExporting(true);
    const candidateName = data?.candidate_name || 'Ram rajesh';
    const candidateEmail = data?.candidate_email || data?.email || 'ramchoubey1@gmail.com';
    const filename = `Proctoring_Report_${candidateName.replace(/\s+/g, '_')}_APP_${applicationId}.html`;

    const nowTime = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const snapshotBase64List = await Promise.all(
      snapshots.slice(0, 6).map(async (snap, idx) => {
        const id = snap?.id ?? snap?.snapshot_id;
        const url = id != null ? snapshotUrls[String(id)] : null;
        let base64 = null;
        if (url) {
          base64 = await convertBlobUrlToBase64(url);
        }
        return {
          base64,
          time: formatDate(snap?.captured_at),
          num: String(idx + 1).padStart(2, '0')
        };
      })
    );

    const snapshotCardsHtml = snapshotBase64List.map(item => `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff; margin-bottom: 8px;">
        <div style="position: relative; aspect-ratio: 4/3; width: 100%; background: #0f172a;">
          <span style="position: absolute; top: 4px; left: 4px; background: rgba(0,0,0,0.65); color: #fff; font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: 700; font-family: monospace;">${item.num}</span>
          ${item.base64 ? `<img src="${item.base64}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block;" />` : `<div style="aspect-ratio: 4/3; display: grid; place-items: center; color: #94a3b8; font-size: 10px;">Snapshot</div>`}
        </div>
        <div style="padding: 4px 6px; font-size: 9px; color: #64748b; font-family: monospace; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">${item.time}</div>
      </div>
    `).join('');

    const timelineHtml = sortedAndFilteredEvents
      .map(
        (event) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; margin-bottom: 6px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div>
            <div style="font-weight: 700; font-size: 12px; color: #0f172a;">${event?.label || eventLabel(event?.event_type)}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">Question ${event?.question_id || '5a19c41c'} · <span style="color: #e11d48; font-weight: 700;">+${event?.risk_points ?? 15} risk points</span></div>
          </div>
          <div style="font-size: 10.5px; color: #64748b; font-family: monospace; text-align: right;">${formatDate(event?.created_at)}</div>
        </div>
      `
      )
      .join('');

    const htmlDocument = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${filename.replace('.html', '')}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; background: #f8fafc; }
    .page-card { max-width: 960px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
    .banner { background: #0b1120; color: #ffffff; padding: 14px 18px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .grid-2 { display: grid; grid-template-columns: 200px 1fr; gap: 14px; margin-bottom: 16px; }
    .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #ffffff; }
    .tag { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; }
    .score { font-size: 36px; font-weight: 800; color: #e11d48; margin: 2px 0; }
    .alert { margin-top: 8px; padding: 8px 12px; background: #fef3c7; border: 1px solid #fde68a; color: #92400e; border-radius: 6px; font-size: 11.5px; font-weight: 500; }
    .split-workspace { display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 16px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #475569; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1.5px solid #e2e8f0; }
    .print-btn { background: #2563eb; color: #fff; border: 0; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
    @media print {
      body { padding: 0; background: #ffffff; }
      .page-card { border: 0; padding: 0; box-shadow: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page-card">
    <div class="no-print" style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="banner">
      <div>
        <div style="font-size: 18px; font-weight: 800;">${candidateName}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${candidateEmail}</div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #cbd5e1; font-family: monospace;">
        <div>APPLICATION #${applicationId}</div>
        <div>AUDIT DATE: ${nowTime}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card" style="background: #fff1f2; border-color: #fecdd3;">
        <div class="tag" style="color: #e11d48;">Risk Score</div>
        <div class="score">${riskScore}<span style="font-size: 16px; color: #94a3b8;">/100</span></div>
        <div style="font-size: 11px; font-weight: 700; color: #e11d48; margin-top: 4px;">● High Risk (${riskScore}%)</div>
      </div>

      <div class="card">
        <div class="tag">Attempt Status</div>
        <div style="font-size: 19px; font-weight: 700; color: #0f172a; margin: 4px 0 6px;">${statusText}</div>
        <div style="font-size: 12px; color: #64748b;">Total Security Events: <strong>${sortedAndFilteredEvents.length}</strong> · Risk Ratio: <strong>${data?.score ? `${data.score}%` : '3.6%'}</strong></div>
        <div class="alert">${data?.terminated_reason || 'Fullscreen mode exited. Your assessment was automatically submitted.'}</div>
      </div>
    </div>

    <div class="split-workspace">
      <div>
        <div class="section-title">Security Event Timeline (${sortedAndFilteredEvents.length})</div>
        <div>
          ${timelineHtml}
        </div>
      </div>

      <div>
        <div class="section-title">Camera Snapshots (${snapshots.length})</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          ${snapshotCardsHtml}
        </div>
      </div>
    </div>

    <div style="margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
      Confidential Proctoring Audit Log · HireMind AI Candidate Review
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDocument], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  if (!open) return null;

  const isAuto = String(data?.submission_type || '').startsWith('AUTO_');
  const status = data?.attempt_status || 'not_started';
  const statusText =
    status === 'scored'
      ? isAuto
        ? 'Auto-submitted'
        : 'Scored'
      : status === 'in_progress'
      ? 'In progress'
      : status === 'assigned'
      ? 'Assigned'
      : 'Not started';

  const candidateDisplayName = data?.candidate_name || 'Ram rajesh';
  const candidateDisplayEmail = data?.candidate_email || data?.email || 'ramchoubey1@gmail.com';

  return (
    <div className="p-modal-overlay" role="dialog" aria-modal="true">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .p-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(3, 6, 15, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .p-container {
          width: 1140px;
          max-width: 100%;
          max-height: 94vh;
          overflow-y: auto;
          background: #080c18;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          box-shadow: 0 24px 80px -15px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03) inset;
          color: #f1f5f9;
          padding: 22px 26px 26px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
        }

        .p-container::-webkit-scrollbar {
          width: 5px;
        }
        .p-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }

        /* Top Bar */
        .p-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          gap: 12px;
        }

        .p-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .p-header-title-block {
          min-width: 0;
          flex: 1;
        }

        .p-shield-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(129, 140, 248, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.2);
          flex-shrink: 0;
        }

        .p-title-main {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .p-breadcrumbs {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .p-breadcrumbs span.active {
          color: #cbd5e1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .p-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* BUTTONS */
        .p-btn-export {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 9px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #f1f5f9;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .p-btn-export:hover {
          background: linear-gradient(180deg, rgba(129, 140, 248, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
          border-color: rgba(129, 140, 248, 0.4);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .p-btn-close {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .p-btn-close:hover {
          background: rgba(244, 63, 94, 0.15);
          border-color: rgba(244, 63, 94, 0.35);
          color: #fff;
          transform: scale(1.04);
        }

        /* REFINED SELECT PILLS */
        .p-select-pill-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          min-width: 0;
          flex-shrink: 0;
        }

        .p-select-pill-wrap .p-select-icon {
          position: absolute;
          left: 10px;
          pointer-events: none;
          color: #818cf8;
          display: flex;
          align-items: center;
          z-index: 1;
        }

        .p-select-pill {
          appearance: none;
          -webkit-appearance: none;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 8px;
          padding: 6px 28px 6px 28px;
          color: #e2e8f0;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
          white-space: nowrap;
        }

        .p-select-pill:hover, .p-select-pill:focus {
          border-color: rgba(129, 140, 248, 0.45);
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.18) 0%, rgba(79, 70, 229, 0.08) 100%);
          color: #ffffff;
        }

        .p-select-pill option {
          background: #0f1629;
          color: #f1f5f9;
          padding: 8px;
        }

        .p-select-caret {
          position: absolute;
          right: 9px;
          pointer-events: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          z-index: 1;
        }

        /* VIEW FRAME BADGE */
        .p-btn-viewframe {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 7px;
          background: linear-gradient(180deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%);
          border: 1px solid rgba(168, 85, 247, 0.4);
          color: #f3e8ff;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          text-transform: uppercase;
          font-weight: 750;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          vertical-align: middle;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .p-btn-viewframe:hover {
          background: linear-gradient(180deg, rgba(168, 85, 247, 0.35) 0%, rgba(147, 51, 234, 0.2) 100%);
          border-color: rgba(192, 132, 252, 0.65);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);
          transform: translateY(-1px);
        }

        .p-btn-viewframe:active {
          transform: translateY(0);
        }

        .p-btn-viewall {
          padding: 5px 9px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #eef0f3;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: -1.5px 1px 1px;

        }

        .p-btn-viewall:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        /* Top Hero Metrics Cards */
        .p-top-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 14px;
          margin-bottom: 20px;
        }

        .p-risk-box {
          border-radius: 14px;
          padding: 16px 18px;
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.07) 0%, rgba(13, 17, 30, 0.8) 100%);
          border: 1px solid rgba(244, 63, 94, 0.22);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .p-risk-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .p-tag-label {
          color: #fb7185;
          font: 700 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .p-risk-values {
          display: flex;
          align-items: baseline;
          gap: 3px;
          margin: 6px 0 4px;
        }

        .p-risk-big {
          font-size: 38px;
          font-weight: 800;
          color: #fb7185;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .p-risk-sub {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }

        .p-risk-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          background: rgba(244, 63, 94, 0.12);
          color: #fb7185;
          border: 1px solid rgba(244, 63, 94, 0.25);
          width: fit-content;
        }

        .p-risk-bar-wrap {
          margin-top: 10px;
          position: relative;
        }

        .p-risk-bar-bg {
          width: 100%;
          height: 4px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .p-risk-bar-active {
          height: 100%;
          border-radius: 99px;
          width: ${Math.min(100, Math.max(5, riskScore))}%;
          background: linear-gradient(90deg, #f43f5e, #fb7185);
        }

        .p-risk-bar-text {
          position: absolute;
          right: 0;
          bottom: 6px;
          font-size: 10px;
          color: #64748b;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        /* Status Hero Card with Gold Shield Icon */
        .p-status-box {
          border-radius: 14px;
          padding: 16px 22px;
          background: linear-gradient(135deg, rgba(30, 41, 69, 0.35) 0%, rgba(13, 17, 30, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .p-gold-shield-container {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 70px;
          height: 85px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .p-status-title {
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
          margin: 4px 0 8px;
        }

        .p-metrics-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .p-metric-tag {
          padding: 3px 9px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          font-size: 11.5px;
          color: #94a3b8;
        }

        .p-metric-tag strong {
          color: #f1f5f9;
          font-weight: 600;
          margin-left: 3px;
        }

        .p-alert-strip {
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(245, 158, 11, 0.07);
          border: 1px solid rgba(245, 158, 11, 0.22);
          color: #fbbf24;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: calc(100% - 90px);
        }

        /* Divider & Filter Bar */
        .p-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0 14px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .p-filter-label {
          font: 700 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #64748b;
          white-space: nowrap;
        }

        .p-filter-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* 2-Column Split Workspace */
        .p-workspace-split {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 18px;
          align-items: start;
        }

        /* Left Column: Timeline */
        .p-timeline-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
          justify-content: flex-start;
        }

        .p-timeline-row {
          display: grid;
          grid-template-columns: 38px 1fr auto 10px;
          gap: 14px;
          align-items: flex-start;
          padding: 16px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.18s ease;
        }

        .p-timeline-row:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .p-timeline-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .p-timeline-content {
          overflow: hidden;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .p-timeline-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.4;
        }

        .p-timeline-action-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .p-timeline-meta {
          color: #64748b;
          font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .p-timeline-pill {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 5px;
          font: 700 10px ui-monospace, SFMono-Regular, Menlo, monospace;
          width: fit-content;
        }

        .p-timeline-time {
          color: #64748b;
          font: 10.5px ui-monospace, SFMono-Regular, Menlo, monospace;
          text-align: right;
          white-space: nowrap;
        }

        .p-timeline-dot {
          width: 6px;
          height: 6px;
          border-radius: 99px;
          background: #f43f5e;
          box-shadow: 0 0 6px rgba(244, 63, 94, 0.8);
          margin-left: auto;
        }

        /* Right Column: Snapshots Grid with Fixed 4:3 Aspect Ratio */
        .p-snapshots-col {
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
        }

        .p-snapshots-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .p-snapshots-title {
          font: 700 10.5px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #a4b6cf;
        }

        .p-snapshots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
        }

        .p-snap-card {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow: hidden;
          background: #030611;
          position: relative;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          height: auto;
        }

        .p-snap-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .p-snap-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #090e1a;
          overflow: hidden;
        }

        .p-snap-card img {
          width: 100%;
          height: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          display: block;
        }

        .p-snap-num-tag {
          position: absolute;
          top: 5px;
          left: 5px;
          padding: 1.5px 5px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          font: 700 9px ui-monospace, SFMono-Regular, Menlo, monospace;
          color: #cbd5e1;
          z-index: 2;
        }

        .p-snap-expand-icon {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          z-index: 2;
        }

        .p-snap-card-footer {
          padding: 4px 6px;
          font: 9px ui-monospace, SFMono-Regular, Menlo, monospace;
          color: #64748b;
          background: rgba(255, 255, 255, 0.015);
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .p-disclaimer-card {
          margin-top: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          background: linear-gradient(180deg, rgba(1, 65, 47, 0.2) 0%, rgba(2, 70, 51, 0.2)  100%);
          border: 2px solid rgba(9, 181, 127, 0.15);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .p-disclaimer-icon {
          color: #10b981;
          flex-shrink: 0;
        }

        .p-disclaimer-text {
          font-size: 10.5px;
          color: #b1c9eb;
          line-height: 1.35;
        }

        .p-violation-expand {
          margin-top: 8px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(244, 63, 94, 0.3);
          background: #020617;
          box-shadow: 0 8px 24px rgba(0,0,0,0.7);
        }

        .p-violation-expand img {
          width: 100%;
          max-height: 240px;
          object-fit: contain;
          display: block;
        }

        @media (max-width: 1024px) {
          .p-top-grid,
          .p-workspace-split {
            grid-template-columns: 1fr;
          }
          .p-snapshots-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .p-snapshots-col {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .p-modal-overlay {
            padding: 8px;
          }
          .p-container {
            padding: 14px;
          }
          .p-header {
            gap: 8px;
          }
          .p-btn-export span.export-text {
            display: none;
          }
          .p-btn-export {
            padding: 7px 10px;
          }
          .p-breadcrumbs {
            font-size: 11px;
          }
          .p-title-main {
            font-size: 16px;
          }
          .p-snapshots-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .p-timeline-row {
            grid-template-columns: 34px 1fr;
          }
          .p-timeline-time, .p-timeline-dot {
            display: none;
          }
        }
      `}</style>

      <div className="p-container">
        {/* HEADER BAR */}
        <div className="p-header">
          <div className="p-header-left">
            <div className="p-shield-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="p-header-title-block">
              <h2 className="p-title-main">Proctoring Review</h2>
              <div className="p-breadcrumbs">
                <span>APP #{applicationId}</span>
                <span>&gt;</span>
                <span className="active">
                  {candidateDisplayName} ({candidateDisplayEmail})
                </span>
              </div>
            </div>
          </div>

          <div className="p-header-actions">
            <button
              type="button"
              className="p-btn-export"
              onClick={handleExportReport}
              disabled={isExporting}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="export-text">{isExporting ? 'Exporting…' : 'Export Report'}</span>
            </button>
            <button
              type="button"
              className="p-btn-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* TOP HERO METRICS */}
        <div className="p-top-grid">
          {/* RISK CARD */}
          <div className="p-risk-box">
            <div className="p-risk-top">
              <span className="p-tag-label">Risk Score</span>
              <svg width="28" height="16" viewBox="0 0 40 20" fill="none" stroke="#fb7185" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 10h10l4-8 6 16 5-10 4 4h11"/>
              </svg>
            </div>
            <div className="p-risk-values">
              <span className="p-risk-big">{riskScore}</span>
              <span className="p-risk-sub">/100</span>
            </div>
            <div>
              <span className="p-risk-pill">● High Risk</span>
            </div>
            <div className="p-risk-bar-wrap">
              <div className="p-risk-bar-bg">
                <div className="p-risk-bar-active" />
              </div>
              <span className="p-risk-bar-text">{riskScore}%</span>
            </div>
          </div>

          {/* ATTEMPT STATUS CARD WITH GOLD SHIELD ICON */}
          <div className="p-status-box">
            <div className="p-gold-shield-container">
              <svg width="68" height="82" viewBox="0 0 80 100" fill="none">
                <path
                  d="M40 3L8 16V46C8 70 40 95 40 95C40 95 72 70 72 46V16L40 3Z"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  fill="rgba(245, 158, 11, 0.05)"
                />
                <path
                  d="M40 9L14 20V46C14 66 40 88 40 88C40 88 66 66 66 46V20L40 9Z"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
                <rect x="30" y="47" width="20" height="15" rx="3" fill="#f59e0b" />
                <path
                  d="M34 47V41C34 37.6863 36.6863 35 40 35C43.3137 35 46 37.6863 46 41V47"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <span className="p-tag-label" style={{ color: '#64748b' }}>
                Attempt Status
              </span>
              <div className="p-status-title">{statusText}</div>
              <div className="p-metrics-row">
                <span className="p-metric-tag">
                  Events <strong>{sortedAndFilteredEvents.length}</strong>
                </span>
                <span className="p-metric-tag">
                  Risk Score <strong>{data?.score ? `${data.score}%` : '3.6%'}</strong>
                </span>
              </div>
            </div>

            <div className="p-alert-strip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              {data?.terminated_reason || 'Fullscreen mode exited. Your assessment was automatically submitted.'}
            </div>
          </div>
        </div>

        {/* FILTER BAR WITH SELECT PILLS */}
        <div className="p-filter-bar">
          <span className="p-filter-label">Security Event Timeline</span>
          <div className="p-filter-controls">
            {/* Filter Selector */}
            <div className="p-select-pill-wrap">
              <span className="p-select-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
              </span>
              <select
                className="p-select-pill"
                value={activeFilter}
                onChange={e => setActiveFilter(e.target.value)}
              >
                <option value="ALL">All Events</option>
                <option value="FULLSCREEN">Fullscreen Exits</option>
                <option value="PHONE">Phone Detections</option>
                <option value="AUDIO">Audio Anomalies</option>
                <option value="TAB">Tab Switches</option>
                <option value="KEYBOARD">Keyboard Shortcuts</option>
              </select>
              <span className="p-select-caret">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </div>

            {/* Sort Selector */}
            <div className="p-select-pill-wrap">
              <span className="p-select-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
              </span>
              <select
                className="p-select-pill"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>
              <span className="p-select-caret">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* WORKSPACE: TIMELINE & CAMERA SNAPSHOTS */}
        <div className="p-workspace-split">
          {/* LEFT: TIMELINE */}
          <div className="p-timeline-col">
            {sortedAndFilteredEvents.map((event, index) => {
              const theme = eventThemeColor(event?.event_type);
              const snapshot = event?.snapshot;
              const eventKey = event?.id ?? `${event?.event_type}-${index}`;
              const isExpanded = expandedEventKey === eventKey;
              const snapshotId = snapshot?.id ?? snapshot?.snapshot_id;
              const snapshotUrl = snapshotId != null ? snapshotUrls[String(snapshotId)] : null;

              return (
                <div key={eventKey}>
                  <div className="p-timeline-row">
                    <div
                      className="p-timeline-icon"
                      style={{
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        color: theme.color,
                      }}
                    >
                      <RenderEventIcon type={event?.event_type} />
                    </div>

                    <div className="p-timeline-content">
                      <div className="p-timeline-title">
                        <span>Rule violated: {event?.label || eventLabel(event?.event_type)}</span>
                      </div>

                      {snapshot && (
                        <div className="p-timeline-action-row">
                          <button
                            type="button"
                            className="p-btn-viewframe"
                            onClick={() => setExpandedEventKey(isExpanded ? null : eventKey)}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {isExpanded ? 'Hide Frame' : 'View Frame'}
                          </button>
                        </div>
                      )}

                      <div className="p-timeline-meta">
                        Question {event?.question_id || '5a19c41c'}
                        {event?.metadata?.rms != null ? ` · rms: ${event.metadata.rms}` : ''}
                        {event?.metadata?.confidence != null ? ` · confidence: ${event.metadata.confidence}` : ''}
                      </div>

                      <div
                        className="p-timeline-pill"
                        style={{
                          background: theme.bg,
                          color: theme.color,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        +{event?.risk_points ?? 15} risk points
                      </div>
                    </div>

                    <div className="p-timeline-time">
                      {formatDate(event?.created_at)}
                    </div>

                    <div className="p-timeline-dot" />
                  </div>

                  {snapshot && isExpanded && (
                    <div className="p-violation-expand">
                      {snapshotUrl ? (
                        <img src={snapshotUrl} alt="Violation frame" />
                      ) : (
                        <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 11 }}>
                          Loading violation frame…
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: CAMERA SNAPSHOTS */}
          <div className="p-snapshots-col">
            <div className="p-snapshots-head">
              <span className="p-snapshots-title">Camera Snapshots</span>
              <button
                type="button"
                className="p-btn-viewall"
                onClick={() => setShowAllSnapshots(!showAllSnapshots)}
              >
                {showAllSnapshots ? 'Show Less' : 'View All'}
              </button>
            </div>

            <div className="p-snapshots-grid">
              {(snapshots.length ? snapshots : Array.from({ length: 6 }))
                .slice(0, showAllSnapshots ? 12 : Math.max(6, sortedAndFilteredEvents.length))
                .map((snapshot, idx) => {
                  const snapshotId = snapshot?.id ?? snapshot?.snapshot_id;
                  const imageUrl = snapshotId != null ? snapshotUrls[String(snapshotId)] : null;
                  const indexPadded = String(idx + 1).padStart(2, '0');

                  return (
                    <div className="p-snap-card" key={snapshotId ?? idx}>
                      <div className="p-snap-image-container">
                        <span className="p-snap-num-tag">{indexPadded}</span>
                        <div className="p-snap-expand-icon">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 3 21 3 21 9"/>
                            <polyline points="9 21 3 21 3 15"/>
                            <line x1="21" y1="3" x2="14" y2="10"/>
                            <line x1="3" y1="21" x2="10" y2="14"/>
                          </svg>
                        </div>

                        {imageUrl ? (
                          <img src={imageUrl} alt={`Snapshot ${idx}`} />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              background: '#090e1a',
                              color: '#475569',
                              fontSize: 10,
                            }}
                          >
                            {snapshotLoading[String(snapshotId)] ? 'Loading…' : 'Snapshot'}
                          </div>
                        )}
                      </div>

                      <div className="p-snap-card-footer">
                        {formatDate(snapshot?.captured_at)}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* DISCLAIMER NOTE */}
            <div className="p-disclaimer-card">
              <div className="p-disclaimer-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="p-disclaimer-text">
                Snapshots are captured automatically at regular intervals.
                <br />
                All timestamps are in your local timezone.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






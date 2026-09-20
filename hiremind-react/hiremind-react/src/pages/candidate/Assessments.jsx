

import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';

function scoreColor(score) {
  if (score >= 70) return 'teal';
  if (score >= 40) return 'blue';
  return 'violet';
}

function formatTime24Hour(isoString) {
  if (!isoString) return '';
  const utcString = /Z$|[+-]\d{2}:\d{2}$/.test(isoString) ? isoString : `${isoString}Z`;
  const d = new Date(utcString);
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateIndian(isoString) {
  if (!isoString) return '';
  const utcString = /Z$|[+-]\d{2}:\d{2}$/.test(isoString) ? isoString : `${isoString}Z`;
  const d = new Date(utcString);
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

function MiniCalendar({ assignedAt, submittedAt }) {
  const d = new Date(assignedAt);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const dayNum = d.getUTCDate();

  const subDate = submittedAt ? new Date(submittedAt) : null;
  const subDayNum = subDate ? subDate.getUTCDate() : null;
  const subMonth = subDate ? subDate.getUTCMonth() : null;
  const subYear = subDate ? subDate.getUTCFullYear() : null;

  const firstDayIndex = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month];

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  return (
    <div className="cal-card-wrapper">
      <div className="cal-header-row">
        <div className="cal-month-title">
          <span className="cal-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          {monthName} {year}
        </div>
        <div className="cal-schedule-pill">Schedule</div>
      </div>

      <div className="cal-days-header">
        <span className="weekend-label">Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span className="weekend-label">Sa</span>
      </div>

      <div className="cal-grid">
        {days.map((day, idx) => {
          const isAssigned = day === dayNum;
          const isSubmitted = day === subDayNum && month === subMonth && year === subYear;
          const colIndex = idx % 7;
          const isWeekend = (colIndex === 0 || colIndex === 6) && !isAssigned && !isSubmitted;

          let cellClass = 'cal-day-cell';
          if (isAssigned) cellClass += ' day-assigned';
          if (isSubmitted) cellClass += ' day-submitted';
          if (isWeekend) cellClass += ' day-weekend';

          return (
            <div key={idx} className={cellClass}>
              {day || ''}
              {isAssigned && <span className="cal-dot dot-purple" />}
              {isSubmitted && <span className="cal-dot dot-cyan" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Assessments() {
  const [subs, setSubs] = useState(null);
  const [jobMap, setJobMap] = useState({});
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [startConfirmTarget, setStartConfirmTarget] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const toast = useToast();

  async function load() {
    try {
      const data = await apiRequest('/assessments/mine');
      setSubs(data || []);
    } catch (_) {
      setSubs([]);
    }

    try {
      const jobs = await apiRequest('/jobs');
      const map = {};
      (jobs || []).forEach((j) => {
        map[j.id] = j.title;
      });
      setJobMap(map);
    } catch (_) {}
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function onFocus() {
      load();
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const stats = useMemo(() => {
    if (!subs) return { total: 0, pending: 0, completed: 0, avgScore: 0 };
    const scoredSubs = subs.filter((s) => s.status === 'scored');
    const totalScore = scoredSubs.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return {
      total: subs.length,
      pending: subs.filter((s) => s.status === 'assigned' || s.status === 'in_progress').length,
      completed: scoredSubs.length,
      avgScore: scoredSubs.length ? Math.round(totalScore / scoredSubs.length) : 0,
    };
  }, [subs]);

  const filteredSubs = useMemo(() => {
    if (!subs) return [];
    let list = [...subs];

    if (statusFilter === 'ACTION_REQUIRED') {
      list = list.filter((s) => s.status === 'assigned' || s.status === 'in_progress');
    } else if (statusFilter !== 'ALL') {
      list = list.filter((s) => s.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => {
        const jobTitle = (s.job_title || jobMap[s.job_id] || s.assessment_title || '').toLowerCase();
        const status = (s.status || '').toLowerCase();
        return jobTitle.includes(q) || status.includes(q);
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.assigned_at || 0) - new Date(a.assigned_at || 0);
      if (sortBy === 'oldest') return new Date(a.assigned_at || 0) - new Date(b.assigned_at || 0);
      if (sortBy === 'score_high') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'score_low') return (a.score || 0) - (b.score || 0);
      return 0;
    });

    return list;
  }, [subs, searchQuery, statusFilter, sortBy, jobMap]);

  function handleStartAssessment(assessmentId) {
    const url = `${window.location.origin}/candidate/assessment/${assessmentId}`;
    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      toast('Please allow pop-ups to start the assessment.', 'error');
    }
    setStartConfirmTarget(null);
  }

  // Interactive KPI click handlers
  function handleCardClick(type) {
    if (type === 'TOTAL') {
      setStatusFilter('ALL');
    } else if (type === 'PENDING') {
      setStatusFilter((prev) => (prev === 'ACTION_REQUIRED' ? 'ALL' : 'ACTION_REQUIRED'));
    } else if (type === 'COMPLETED') {
      setStatusFilter((prev) => (prev === 'SCORED' ? 'ALL' : 'SCORED'));
    } else if (type === 'SCORE') {
      setStatusFilter('SCORED');
      setSortBy('score_high');
    }
  }

  return (
    <div className="assessments-root-container">
      <style>{`
        /* Reset modal outer defaults */
        .modal-close,
        .modal-box > button:first-child:has(svg),
        .modal-box .close-btn { display: none !important; }
        .modal-box {
          overflow: visible !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .assessments-root-container {
          position: relative;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* ══════════════════════════════════════════════════════════
           FUNCTIONAL KPI CARDS (INTERACTIVE & GLOWING)
           ══════════════════════════════════════════════════════════ */
        .kpi-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-stat-card {
          position: relative;
          border-radius: 18px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          overflow: hidden;
          backdrop-filter: blur(16px);
          cursor: pointer;
          user-select: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .kpi-stat-card:hover {
          transform: translateY(-3px);
        }
        .kpi-stat-card:active {
          transform: translateY(-1px) scale(0.99);
        }

        /* Card Themes */
        .card-purple {
          background: linear-gradient(135deg, rgba(30, 22, 60, 0.7) 0%, rgba(13, 15, 36, 0.85) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15), inset 0 0 16px rgba(139, 92, 246, 0.1);
        }
        .card-purple:hover, .card-purple.active-card {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: 0 10px 36px rgba(168, 85, 247, 0.45), inset 0 0 20px rgba(168, 85, 247, 0.3);
        }

        .card-orange {
          background: linear-gradient(135deg, rgba(45, 27, 18, 0.7) 0%, rgba(20, 15, 25, 0.85) 100%);
          border: 1.5px solid rgba(245, 158, 11, 0.4);
          box-shadow: 0 8px 32px rgba(245, 158, 11, 0.15), inset 0 0 16px rgba(245, 158, 11, 0.1);
        }
        .card-orange:hover, .card-orange.active-card {
          border-color: rgba(245, 158, 11, 0.9);
          box-shadow: 0 10px 36px rgba(245, 158, 11, 0.45), inset 0 0 20px rgba(245, 158, 11, 0.3);
        }

        .card-blue {
          background: linear-gradient(135deg, rgba(14, 38, 70, 0.7) 0%, rgba(10, 18, 35, 0.85) 100%);
          border: 1.5px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15), inset 0 0 16px rgba(59, 130, 246, 0.1);
        }
        .card-blue:hover, .card-blue.active-card {
          border-color: rgba(56, 189, 248, 0.9);
          box-shadow: 0 10px 36px rgba(56, 189, 248, 0.45), inset 0 0 20px rgba(56, 189, 248, 0.3);
        }

        .card-magenta {
          background: linear-gradient(135deg, rgba(46, 16, 52, 0.7) 0%, rgba(20, 12, 32, 0.85) 100%);
          border: 1.5px solid rgba(217, 70, 239, 0.4);
          box-shadow: 0 8px 32px rgba(217, 70, 239, 0.15), inset 0 0 16px rgba(217, 70, 239, 0.1);
        }
        .card-magenta:hover, .card-magenta.active-card {
          border-color: rgba(232, 121, 249, 0.9);
          box-shadow: 0 10px 36px rgba(232, 121, 249, 0.45), inset 0 0 20px rgba(232, 121, 249, 0.3);
        }

        .kpi-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .circle-purple {
          background: radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(139, 92, 246, 0.1) 70%);
          border: 1px solid rgba(168, 85, 247, 0.6);
          color: #c084fc;
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.35);
        }
        .circle-orange {
          background: radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0.1) 70%);
          border: 1px solid rgba(245, 158, 11, 0.6);
          color: #fbbf24;
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.35);
        }
        .circle-blue {
          background: radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(59, 130, 246, 0.1) 70%);
          border: 1px solid rgba(56, 189, 248, 0.6);
          color: #38bdf8;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
        }
        .circle-magenta {
          background: radial-gradient(circle, rgba(232, 121, 249, 0.35) 0%, rgba(217, 70, 239, 0.1) 70%);
          border: 1px solid rgba(232, 121, 249, 0.6);
          color: #f472b6;
          box-shadow: 0 0 14px rgba(232, 121, 249, 0.35);
        }

        .kpi-text-group {
          display: flex;
          flex-direction: column;
          z-index: 2;
        }
        .kpi-stat-val {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
          font-family: var(--font-display, sans-serif);
        }
        .kpi-stat-label {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 4px;
          white-space: nowrap;
          font-weight: 500;
        }

        .kpi-bg-watermark {
          position: absolute;
          right: 12px;
          bottom: -4px;
          opacity: 0.12;
          pointer-events: none;
          z-index: 1;
        }

        /* ══════════════════════════════════════════════════════════
           FILTER PILLS & CONTROLS
           ══════════════════════════════════════════════════════════ */
        .filter-sort-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 22px;
        }

        .filter-pills-container {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
          max-width: 100%;
        }

        .filter-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(14, 18, 38, 0.7);
          border: 1.5px solid rgba(139, 92, 246, 0.28);
          border-radius: 9999px;
          padding: 8px 16px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .filter-pill-btn .pill-divider {
          width: 1px;
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
        }
        .filter-pill-btn:hover {
          border-color: rgba(168, 85, 247, 0.6);
          color: #ffffff;
        }
        .filter-pill-btn.active {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          border-color: #c084fc;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(168, 85, 247, 0.5);
        }

        .sort-select-wrapper {
          position: relative;
          width: 100%;
          margin-top: 4px;
        }
        .sort-select {
          width: 100%;
          background: rgba(15, 12, 32, 0.85);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          border-radius: 12px;
          padding: 10px 16px;
          outline: none;
          cursor: pointer;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .sort-select:focus {
          border-color: #a855f7;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
        }

        /* ══════════════════════════════════════════════════════════
           SEARCH BAR
           ══════════════════════════════════════════════════════════ */
        .aesthetic-search-wrapper {
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 18px;
          padding: 12px 16px;
          margin-bottom: 20px;
        }
        .aesthetic-search-input-box {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .aesthetic-search-input-box input {
          width: 100%;
          background: rgba(12, 10, 24, 0.9);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 10px 42px 10px 46px;
          color: #fff;
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
        }
        .aesthetic-search-icon-badge {
          position: absolute;
          left: 10px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
        }

        /* ══════════════════════════════════════════════════════════
           ASSESSMENT LISTING ROWS
           ══════════════════════════════════════════════════════════ */
        .assessment-listing-row {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.65) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 18px 22px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-sizing: border-box;
          width: 100%;
          transition: all 0.2s ease;
        }
        .assessment-listing-row:hover {
          border-color: rgba(168, 85, 247, 0.6);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.18);
        }

        .assessment-info-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        .assessment-title-text {
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 15px;
          color: #f8fafc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .assessment-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .assessment-badge-pill,
        .view-report-inline-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 28px;
          padding: 0 10px;
          border-radius: 8px;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          white-space: nowrap;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s ease;
          line-height: 1;
        }

        .assessment-badge-pill {
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #a78bfa;
        }
        .assessment-badge-pill:hover {
          background: rgba(139, 92, 246, 0.25);
          border-color: #a78bfa;
          color: #ffffff;
        }

        .view-report-inline-btn {
          background: rgba(168, 85, 247, 0.15);
          border: 1px solid rgba(168, 85, 247, 0.35);
          color: #c084fc;
        }
        .view-report-inline-btn:hover {
          background: rgba(168, 85, 247, 0.3);
          color: #ffffff;
          border-color: #c084fc;
        }

        .assessment-right-action {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .score-meta-box {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .score-percentage-num {
          font-family: var(--font-display, sans-serif);
          font-weight: 800;
          font-size: 18px;
          line-height: 1;
          white-space: nowrap;
        }
        .score-type-label {
          font-size: 9.5px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 3px;
          white-space: nowrap;
        }

        .circular-progress-ring {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
        }
        .circular-progress-inner {
          width: 32px;
          height: 32px;
          background: #090b16;
          border-radius: 50%;
        }

        .btn-start-gradient {
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          border: none;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 18px rgba(168, 85, 247, 0.4);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .btn-start-gradient:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(168, 85, 247, 0.6);
        }

        /* ══════════════════════════════════════════════════════════
           MODALS
           ══════════════════════════════════════════════════════════ */
        .atm-modal-container {
          background: #080d1a;
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 24px;
          padding: 24px 22px 22px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.95);
          color: #ffffff;
          position: relative;
          box-sizing: border-box;
          width: 100%;
        }
        
        .atm-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          margin-bottom: 20px;
          min-height: 36px;
        }
        .atm-main-title {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .atm-close-x {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #141c2e;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .atm-close-x:hover {
          background: rgba(244, 63, 94, 0.25);
          border-color: rgba(244, 63, 94, 0.4);
          color: #ffffff;
        }

        .atm-close-button {
          width: 100%;
          margin-top: 16px;
          background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 12px;
          padding: 12px;
          color: #ffffff;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .atm-close-button:hover {
          opacity: 0.94;
          transform: translateY(-1px);
        }

        .cal-card-wrapper {
          background: #0b1122;
          border: 1px solid rgba(139, 92, 246, 0.22);
          border-radius: 16px;
          padding: 14px;
        }
        .cal-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .cal-month-title { font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; font-size: 14px; }
        .cal-schedule-pill { background: rgba(99, 102, 241, 0.15); color: #a78bfa; padding: 3px 8px; border-radius: 8px; font-size: 10px; }
        .cal-days-header, .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 11.5px; }
        .cal-days-header { color: #64748b; margin-bottom: 6px; }
        .cal-day-cell { height: 34px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); border-radius: 8px; position: relative; }
        .day-assigned { background: #7c3aed !important; color: #fff !important; font-weight: 700; }
        .day-submitted { background: #0d9488 !important; color: #fff !important; font-weight: 700; }
        .cal-dot { width: 4px; height: 4px; border-radius: 50%; position: absolute; bottom: 3px; background: #fff; }
        .atm-info-card { margin-top: 12px; background: #0b1122; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; border: 1px solid rgba(139, 92, 246, 0.2); }
        .atm-info-row { display: flex; justify-content: space-between; font-size: 12px; }

        /* ══════════════════════════════════════════════════════════
           RESPONSIVE MOBILE BREAKPOINTS
           ══════════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .kpi-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .kpi-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .assessment-listing-row {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
            gap: 14px;
          }
          .assessment-info-left {
            width: 100%;
          }
          .assessment-title-text {
            white-space: normal;
            word-break: break-word;
          }
          .assessment-right-action {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            padding-top: 12px;
            margin-top: 2px;
          }
          .score-meta-box {
            align-items: flex-start;
            text-align: left;
          }
          .btn-start-gradient {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-eyebrow">ATS Pipeline</div>
        <h1 className="page-title"><span className="hl">Assessments</span></h1>
        <p className="page-sub">
          Review assignments, monitor testing timelines, and inspect real-time scoring breakdowns.
        </p>
      </div>

      {/* Interactive KPI Statistics Bar */}
      {subs && subs.length > 0 && (
        <div className="kpi-stats-grid">
          {/* 1. Total Assigned */}
          <div
            className={`kpi-stat-card card-purple ${statusFilter === 'ALL' ? 'active-card' : ''}`}
            onClick={() => handleCardClick('TOTAL')}
            title="Click to view all assessments"
          >
            <div className="kpi-icon-circle circle-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </div>
            <div className="kpi-text-group">
              <span className="kpi-stat-val">{stats.total}</span>
              <span className="kpi-stat-label">Total Assigned</span>
            </div>
            <div className="kpi-bg-watermark">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </div>
          </div>

          {/* 2. Action Required */}
          <div
            className={`kpi-stat-card card-orange ${statusFilter === 'ACTION_REQUIRED' ? 'active-card' : ''}`}
            onClick={() => handleCardClick('PENDING')}
            title="Click to filter assessments requiring action"
          >
            <div className="kpi-icon-circle circle-orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="kpi-text-group">
              <span className="kpi-stat-val">{stats.pending}</span>
              <span className="kpi-stat-label">Action Required</span>
            </div>
            <div className="kpi-bg-watermark">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
              </svg>
            </div>
          </div>

          {/* 3. Completed */}
          <div
            className={`kpi-stat-card card-blue ${statusFilter === 'SCORED' && sortBy !== 'score_high' ? 'active-card' : ''}`}
            onClick={() => handleCardClick('COMPLETED')}
            title="Click to view completed assessments"
          >
            <div className="kpi-icon-circle circle-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="kpi-text-group">
              <span className="kpi-stat-val">{stats.completed}</span>
              <span className="kpi-stat-label">Completed</span>
            </div>
            <div className="kpi-bg-watermark">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="16 10 11 15 8 12" />
              </svg>
            </div>
          </div>

          {/* 4. Average Score */}
          <div
            className={`kpi-stat-card card-magenta ${statusFilter === 'SCORED' && sortBy === 'score_high' ? 'active-card' : ''}`}
            onClick={() => handleCardClick('SCORE')}
            title="Click to sort scored assessments by highest score"
          >
            <div className="kpi-icon-circle circle-magenta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="kpi-text-group">
              <span className="kpi-stat-val">{stats.avgScore}%</span>
              <span className="kpi-stat-label">Average Score</span>
            </div>
            <div className="kpi-bg-watermark">
              <svg width="68" height="68" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="aesthetic-search-wrapper">
        <div className="aesthetic-search-input-box">
          <span className="aesthetic-search-icon-badge"><Icon name="search" size={14} /></span>
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Pills & Sorting */}
      <div className="filter-sort-bar">
        <div className="filter-pills-container">
          <button
            className={`filter-pill-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span className="pill-divider" />
            <span>ALL</span>
          </button>

          <button
            className={`filter-pill-btn ${statusFilter === 'ASSIGNED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ASSIGNED')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <polyline points="9 12 11.5 14.5 15.5 9.5" />
            </svg>
            <span className="pill-divider" />
            <span>ASSIGNED</span>
          </button>

          <button
            className={`filter-pill-btn ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
            <span className="pill-divider" />
            <span>IN PROGRESS</span>
          </button>

          <button
            className={`filter-pill-btn ${statusFilter === 'SCORED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('SCORED')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2" />
            </svg>
            <span className="pill-divider" />
            <span>SCORED</span>
          </button>
        </div>

        <div className="sort-select-wrapper">
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score_high">Highest Score</option>
            <option value="score_low">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {subs === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {/* Empty State */}
      {subs && filteredSubs.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="assessments" size={22} /></div>
          <div className="es-title">
            {subs.length === 0 ? 'No assessments assigned yet' : 'No assessments match your selection'}
          </div>
        </div>
      )}

      {/* List Submissions */}
      {filteredSubs.map((s) => {
        const color = s.status === 'scored' ? scoreColor(s.score) : 'violet';
        const jobTitle = s.job_title || jobMap[s.job_id] || s.assessment_title || 'Job Assessment';
        const isInProgress = s.status === 'in_progress';

        return (
          <div className={`assessment-listing-row c-${color}`} key={s.id}>
            {/* Left Box: Icon & Details */}
            <div className="assessment-info-left">
              <div
                className={`icon-badge ${color}`}
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  flexShrink: 0,
                }}
              >
                <Icon name="assessments" size={20} />
              </div>

              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="assessment-title-text" title={jobTitle}>
                  {jobTitle}
                </div>

                <div className="assessment-actions-group">
                  <div
                    className="assessment-badge-pill"
                    onClick={() => {
                      setCalendarTarget(s);
                      setShowCalendarModal(true);
                    }}
                  >
                    <Icon name="interviews" size={12} />
                    <span>Status: {s.status.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  {s.status === 'scored' && (
                    <button
                      type="button"
                      className="view-report-inline-btn"
                      onClick={() => {
                        setReportTarget(s);
                        setShowReportModal(true);
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      View Report
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Box: Actions / Scoring Ring */}
            <div className="assessment-right-action">
              {s.status === 'scored' ? (
                <>
                  <div className="score-meta-box">
                    <div className="score-percentage-num" style={{ color: `var(--${color})` }}>
                      {s.score}%
                    </div>
                    <div className="score-type-label">
                      {s.submission_type && s.submission_type !== 'MANUAL' ? 'Auto-submitted' : 'Score'}
                    </div>
                  </div>

                  <div
                    className="circular-progress-ring"
                    title="Click to view performance report"
                    onClick={() => {
                      setReportTarget(s);
                      setShowReportModal(true);
                    }}
                    style={{
                      background: `conic-gradient(var(--${color}) ${s.score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                    }}
                  >
                    <div className="circular-progress-inner" />
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-start-gradient"
                  onClick={() => setStartConfirmTarget(s)}
                >
                  {isInProgress ? 'Resume assessment' : 'Start assessment'}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Pre-Assessment Readiness Modal */}
      <Modal open={Boolean(startConfirmTarget)} onClose={() => setStartConfirmTarget(null)} maxWidth={460}>
        {startConfirmTarget && (
          <div className="atm-modal-container">
            <div className="atm-top-header">
              <h2 className="atm-main-title">Assessment Readiness</h2>
              <button className="atm-close-x" onClick={() => setStartConfirmTarget(null)}>✕</button>
            </div>

            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: 14 }}>
              <p style={{ margin: '0 0 10px 0' }}>
                You are about to launch the assessment for <strong>{startConfirmTarget.job_title || 'Position'}</strong>.
              </p>
              <div style={{ background: '#0b1122', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.25)' }}>
                <div style={{ color: '#fb7185', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️ Proctoring Rules</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8' }}>
                  <li>Do not switch tabs or exit fullscreen mode.</li>
                  <li>Assessment timer continues automatically once started.</li>
                  <li>Security violations will trigger automatic submission.</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              className="atm-close-button"
              onClick={() => handleStartAssessment(startConfirmTarget.assessment_id)}
            >
              Confirm & Launch Test 🚀
            </button>
          </div>
        )}
      </Modal>

      {/* Performance Report Modal */}
      <Modal open={showReportModal} onClose={() => setShowReportModal(false)} maxWidth={480}>
        {reportTarget && (
          <div className="atm-modal-container">
            <div className="atm-top-header">
              <h2 className="atm-main-title">Performance Summary</h2>
              <button className="atm-close-x" onClick={() => setShowReportModal(false)}>✕</button>
            </div>

            <div className="atm-info-card" style={{ marginTop: 0 }}>
              <div className="atm-info-row">
                <span style={{ color: '#94a3b8' }}>Final Score:</span>
                <span style={{ fontWeight: 800, color: `var(--${scoreColor(reportTarget.score)})` }}>
                  {reportTarget.score}% ({reportTarget.score >= 70 ? 'Passed' : 'Needs Improvement'})
                </span>
              </div>
              <div className="atm-info-row">
                <span style={{ color: '#94a3b8' }}>Submission Type:</span>
                <span style={{ color: '#cbd5e1' }}>{reportTarget.submission_type || 'MANUAL'}</span>
              </div>
              {reportTarget.terminated_reason && (
                <div className="atm-info-row">
                  <span style={{ color: '#fb7185' }}>Termination Reason:</span>
                  <span style={{ color: '#fb7185', fontSize: '11.5px', fontWeight: 600 }}>
                    {reportTarget.terminated_reason}
                  </span>
                </div>
              )}
            </div>

            {reportTarget.per_question_feedback && Object.keys(reportTarget.per_question_feedback).length > 0 && (
              <div style={{ marginTop: 14, maxHeight: 220, overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>
                  Question Feedback
                </div>
                {Object.entries(reportTarget.per_question_feedback).map(([qId, fb], i) => (
                  <div
                    key={qId}
                    style={{
                      background: '#0b1122',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ color: '#f8fafc', fontWeight: 600 }}>Question {i + 1}</div>
                    <div style={{ color: '#94a3b8', fontSize: '11.5px', marginTop: 4 }}>
                      {typeof fb === 'string' ? fb : JSON.stringify(fb)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="atm-close-button" onClick={() => setShowReportModal(false)}>
              Close Report
            </button>
          </div>
        )}
      </Modal>

      {/* Assessment Timeline Modal */}
      <Modal open={showCalendarModal} onClose={() => setShowCalendarModal(false)} maxWidth={420}>
        {calendarTarget && (
          <div className="atm-modal-container">
            <div className="atm-top-header">
              <h2 className="atm-main-title">Assessment Timeline</h2>
              <button type="button" className="atm-close-x" onClick={() => setShowCalendarModal(false)}>✕</button>
            </div>

            <MiniCalendar
              assignedAt={calendarTarget.assigned_at}
              submittedAt={calendarTarget.submitted_at}
            />

            <div className="atm-info-card">
              <div className="atm-info-row">
                <span style={{ color: '#c084fc', fontWeight: 600 }}>Assigned:</span>
                <span className="atm-info-value">
                  {formatDateIndian(calendarTarget.assigned_at)}, {formatTime24Hour(calendarTarget.assigned_at)}
                </span>
              </div>

              {calendarTarget.submitted_at && (
                <div className="atm-info-row">
                  <span style={{ color: '#2dd4bf', fontWeight: 600 }}>Submitted:</span>
                  <span className="atm-info-value">
                    {formatDateIndian(calendarTarget.submitted_at)}, {formatTime24Hour(calendarTarget.submitted_at)}
                  </span>
                </div>
              )}

              {calendarTarget.violation_count > 0 && (
                <div className="atm-info-row">
                  <span style={{ color: '#fb7185', fontWeight: 600 }}>Security events:</span>
                  <span className="atm-info-value" style={{ color: '#fb7185', fontWeight: 600 }}>
                    {calendarTarget.violation_count}
                  </span>
                </div>
              )}
            </div>

            <button type="button" className="atm-close-button" onClick={() => setShowCalendarModal(false)}>
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
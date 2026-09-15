import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest, fileUrl } from '../../api';

const MAX_CERTIFICATES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
const ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

/* =========================================================
   BUILT-IN SVG ICONS
========================================================= */

function AppIcon({ name, size = 16, className = '', style = {} }) {
  const icons = {
    trophy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
        <path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2Z" />
      </svg>
    ),
    graduationCap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
        <path d="M22 10v6" />
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    folder: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      </svg>
    ),
    filePdf: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M10 12v6" />
        <path d="M8 12h3a1.5 1.5 0 0 1 0 3H8" />
      </svg>
    ),
    fileDoc: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
    fileImage: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
    checkCircle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    alertCircle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    replace: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 3 4 4-4 4" />
        <path d="M4 7h8a4 4 0 0 1 4 4v1" />
        <path d="m16 21-4-4 4-4" />
        <path d="M20 17h-8a4 4 0 0 1-4-4v-1" />
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    upload: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    spinner: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
    ),
  };

  return (
    <span className={`achv-icon-inline ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {icons[name] || null}
    </span>
  );
}

function FileTypeIcon({ filename, size = 14 }) {
  const ext = getFileExtension(filename).toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <AppIcon name="fileImage" size={size} />;
  if (['doc', 'docx'].includes(ext)) return <AppIcon name="fileDoc" size={size} />;
  return <AppIcon name="filePdf" size={size} />;
}

/* =========================================================
   STYLES
========================================================= */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
}

.achv-page {
  --bg: #070913;
  --panel: rgba(13, 17, 30, 0.82);
  --line-purple: rgba(139, 92, 246, 0.25);
  --text: #f8fafc;
  --muted: #94a3b8;
  --purple: #a78bfa;
  --purple-strong: #8b5cf6;
  --teal: #2dd4bf;
  --danger: #fb7185;

  width: min(1180px, 100%);
  margin: 0 auto;
  padding: clamp(16px, 3vw, 32px);
  color: var(--text);
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.45;
}

@keyframes achv-fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes achv-modal-in {
  from { opacity: 0; transform: translateY(8px) scale(.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes achv-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes achv-spin {
  to { transform: rotate(360deg); }
}

@keyframes achv-toast-in {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes achv-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.achv-animate-in {
  animation: achv-fade-in-up .45s cubic-bezier(.16,1,.3,1) both;
}

.achv-spin-icon {
  animation: achv-spin .8s linear infinite;
  display: inline-flex;
}

/* Page Header */
.achv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.achv-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.achv-header-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: #e9d5ff;
  background:
    radial-gradient(circle at 30% 20%, rgba(255,255,255,.22), transparent 40%),
    linear-gradient(135deg, #7c3aed, #4c1d95);
  border: 1px solid rgba(196,181,253,.32);
  box-shadow: 0 10px 28px rgba(124,58,237,.3);
}

.achv-title {
  margin: 0;
  color: #fff;
  font-size: clamp(20px, 2.4vw, 28px);
  font-weight: 800;
  letter-spacing: -.03em;
}

.achv-title-accent {
  background: linear-gradient(135deg, #c084fc, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.achv-subtitle {
  margin: 4px 0 0;
  color: #c0bfc5;
  font-size: 13px;
}

.achv-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 14px;
  border: 1px solid rgba(139,92,246,.32);
  border-radius: 11px;
  color: #d8b4fe;
  background: rgba(139,92,246,.08);
  font: 600 11.5px/1 'JetBrains Mono', monospace;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
  user-select: none;
}

.achv-count-badge:hover {
  border-color: rgba(167,139,250,.6);
  background: rgba(139,92,246,.16);
  transform: translateY(-1px);
}

/* Cards */
.achv-card {
  position: relative;
  overflow: hidden;
  margin-bottom: 22px;
  padding: clamp(18px, 2.5vw, 26px);
  border: 1px solid var(--line-purple);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(16, 21, 38, 0.92), rgba(7, 10, 20, 0.95));
  box-shadow: 0 20px 50px rgba(0,0,0,.35);
}

.achv-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(167,139,250,.5), transparent);
}

.achv-card-head {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  justify-content: space-between !important;
  width: 100% !important;
  gap: 18px !important;
  margin-bottom: 20px !important;
}

.achv-card-title-group {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 14px !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

.achv-card-icon {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  max-width: 44px !important;
  flex: 0 0 44px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #e9d5ff !important;
  background:
    radial-gradient(circle at 30% 20%, rgba(255,255,255,.2), transparent 45%),
    linear-gradient(135deg, #7c3aed, #4c1d95) !important;
  border: 1px solid rgba(196,181,253,.28) !important;
  box-shadow: 0 8px 20px rgba(124,58,237,.25) !important;
}

.achv-card-title-box {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

.achv-card-title {
  display: block !important;
  width: auto !important;
  max-width: 100% !important;
  margin: 0 !important;
  color: #fff !important;
  font-size: 16px !important;
  font-weight: 800 !important;
  letter-spacing: -.015em !important;
  line-height: 1.25 !important;
  white-space: normal !important;
  overflow-wrap: normal !important;
  word-break: normal !important;
}

.achv-card-subtitle {
  display: block !important;
  width: auto !important;
  max-width: 100% !important;
  margin: 4px 0 0 !important;
  color: var(--muted) !important;
  font-size: 11.5px !important;
  line-height: 1.3 !important;
  white-space: normal !important;
  overflow-wrap: normal !important;
  word-break: normal !important;
}

.achv-top-action-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  height: 38px !important;
  padding: 0 16px !important;
  border: 1px solid rgba(139,92,246,.4) !important;
  border-radius: 10px !important;
  color: #d8b4fe !important;
  background: rgba(139,92,246,.12) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  transition: .18s ease !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  box-shadow: -2px 1px 2px ;
}

.achv-top-action-btn:hover:not(:disabled) {
  border-color: rgba(167,139,250,.7);
  background: rgba(139,92,246,.24);
  transform: translateY(-1px);
}

.achv-top-action-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

/* Academic Tiles */
.achv-tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.achv-tile {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(148,163,184,.12);
  border-radius: 16px;
  background: rgba(5,8,17,.65);
  transition: .2s ease;
}

.achv-tile:hover {
  border-color: rgba(139,92,246,.32);
  transform: translateY(-2px);
}

.achv-tile.is-done {
  border-color: rgba(45,212,191,.28);
  background:
    radial-gradient(circle at 100% 0%, rgba(20,184,166,.07), transparent 45%),
    rgba(5,8,17,.65);
}

.achv-tile.is-drag-active {
  border-color: rgba(167,139,250,.85);
  background: rgba(139,92,246,.1);
  box-shadow: 0 0 0 3px rgba(139,92,246,.15);
}

.achv-tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.achv-tile-label {
  font-size: 13.5px;
  font-weight: 800;
  color: #fff;
}

.achv-pdf-badge {
  padding: 3px 6px;
  border: 1px solid rgba(148,163,184,.18);
  border-radius: 6px;
  color: #fff;
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.4), inset 0 0 8px rgba(139, 92, 246, 0.4) !important;
  background: rgba(255,255,255,.03);
  font: 600 9.5px/1 'JetBrains Mono', monospace;
}

.achv-tile-caption {
  font-size: 11px;
  color: #98a4b5;
  margin: -4px 0 0;
}

.achv-file-preview-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(148,163,184,.1);
  border-radius: 9px;
  background: rgba(255,255,255,.02);
}

.achv-file-thumb {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 5px;
  object-fit: cover;
  border: 1px solid rgba(148,163,184,.2);
}

.achv-file-info {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  flex: 1;
}

.achv-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #f1f5f9;
  font: 600 11px/1.2 'JetBrains Mono', monospace;
}

.achv-file-size {
  color: #2dd4bf;
  font: 500 10px/1 'JetBrains Mono', monospace;
  white-space: nowrap;
}

.achv-tile-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(148,163,184,.15);
  border-radius: 9px;
  outline: none;
  color: #f8fafc;
  background: rgba(0,0,0,.3);
  font-size: 12px;
  transition: .15s ease;
}

.achv-tile-input:focus {
  border-color: rgba(139,92,246,.65);
  box-shadow: 0 0 0 3px rgba(139,92,246,.12);
}

.achv-progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.achv-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.achv-file-meta {
  color: #94a3b8;
  font: 500 10.5px/1.4 'JetBrains Mono', monospace;
}

.achv-progress-pct {
  color: #cbd5e1;
  font: 700 10.5px/1 'JetBrains Mono', monospace;
}

.achv-progress-bar-bg {
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148,163,184,.1);
}

.achv-progress-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #8b5cf6, #2dd4bf);
  transition: width .35s ease;
}

.achv-tile-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: auto;
}

.achv-btn,
.achv-btn-view {
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 10px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: .15s ease;
}

.achv-btn {
  border: 1px solid rgba(139,92,246,.4);
  color: #d8b4fe;
  background: rgba(139,92,246,.13);
}

.achv-btn:hover:not(:disabled) {
  border-color: rgba(167,139,250,.7);
  background: rgba(139,92,246,.25);
}

.achv-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.achv-btn-view {
  border: 1px solid rgba(148,163,184,.18);
  color: #cbd5e1;
  background: rgba(255,255,255,.03);
}

.achv-btn-view:hover {
  border-color: rgba(148,163,184,.35);
  color: #fff;
  background: rgba(255,255,255,.07);
}

.achv-tile-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #2dd4bf;
  font: 600 11px/1.2 'JetBrains Mono', monospace;
}

/* =========================================================
   CERTIFICATES LIST (PREMIUM PILL ALIGNMENT)
========================================================= */

.achv-cert-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  margin-bottom: 16px !important;
}

.achv-cert-item-card {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 10px 18px 10px 0 !important;
  border: 1.5px solid rgba(139, 92, 246, 0.26) !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, rgba(14, 18, 38, 0.96) 0%, rgba(8, 11, 24, 0.98) 100%) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(139, 92, 246, 0.04) !important;
  overflow: hidden !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.achv-cert-item-card:hover {
  border-color: rgba(168, 85, 247, 0.55) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.08) !important;
}

/* Left 3-Dots Grip Handle */
.achv-cert-grip-bar {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  align-self: stretch !important;
  background: rgba(255, 255, 255, 0.015) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
  margin-right: 14px !important;
  flex-shrink: 0 !important;
}

.achv-grip-dots {
  color: #64748b !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  letter-spacing: -2px !important;
  user-select: none !important;
}

/* Left Group */
.achv-cert-item-left {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  min-width: 0 !important;
  flex: 1 !important;
}

/* Trophy Icon Frame */
.achv-cert-trophy-box {
  width: 48px !important;
  height: 48px !important;
  border-radius: 13px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  transition: transform 0.2s ease !important;
}

.achv-cert-item-card:hover .achv-cert-trophy-box {
  transform: scale(1.04) !important;
}

.achv-cert-trophy-box.trophy-amber {
  background: radial-gradient(circle at 35% 25%, rgba(251, 191, 36, 0.25), transparent 60%), linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.08) 100%) !important;
  border: 1.5px solid rgba(245, 158, 11, 0.5) !important;
  color: #fbbf24 !important;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25), inset 0 0 10px rgba(245, 158, 11, 0.12) !important;
}

.achv-cert-trophy-box.trophy-purple {
  background: radial-gradient(circle at 35% 25%, rgba(192, 132, 252, 0.25), transparent 60%), linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(126, 34, 206, 0.08) 100%) !important;
  border: 1.5px solid rgba(168, 85, 247, 0.5) !important;
  color: #f0abfc !important;
  box-shadow: 0 0 16px rgba(168, 85, 247, 0.25), inset 0 0 10px rgba(168, 85, 247, 0.12) !important;
}

/* Certificate Text & Metadata */
.achv-cert-details {
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  gap: 5px !important;
}

.achv-cert-name {
  font-size: 15px !important;
  font-weight: 800 !important;
  color: #ffffff !important;
  margin: 0 !important;
  letter-spacing: -0.01em !important;
  line-height: 1.2 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.achv-cert-meta-bar {
  display: flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
  font-size: 11.5px !important;
  color: #94a3b8 !important;
  font-family: 'JetBrains Mono', monospace !important;
  line-height: 1 !important;
}

.achv-cert-status-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  color: #2dd4bf !important;
  font-weight: 700 !important;
}

.achv-meta-divider {
  color: rgba(255, 255, 255, 0.15) !important;
  font-size: 11px !important;
}

.achv-meta-dot {
  color: #475569 !important;
  font-size: 11px !important;
}

.achv-meta-date-wrap,
.achv-meta-size-wrap {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  color: #94a3b8 !important;
}

.achv-cert-file-badge {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2px 7px !important;
  border-radius: 6px !important;
  background: rgba(139, 92, 246, 0.18) !important;
  border: 1px solid rgba(139, 92, 246, 0.35) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-size: 10px !important;
  line-height: 1.2 !important;
}

/* Right-Side Action Controls */
.achv-cert-right-actions {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  flex-shrink: 0 !important;
}

.achv-cert-action-btn {
  height: 38px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 0 16px !important;
  border-radius: 11px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  font-family: inherit !important;
  cursor: pointer !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  white-space: nowrap !important;
  box-sizing: border-box !important;
}

.achv-cert-action-btn.view {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.14) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.achv-cert-action-btn.view:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

.achv-cert-action-btn.delete {
  background: rgba(244, 63, 94, 0.1) !important;
  border: 1.5px solid rgba(244, 63, 94, 0.4) !important;
  color: #fda4af !important;
  box-shadow: 0 2px 10px rgba(244, 63, 94, 0.15) !important;
}

.achv-cert-action-btn.delete:hover:not(:disabled) {
  background: rgba(244, 63, 94, 0.22) !important;
  border-color: rgba(244, 63, 94, 0.7) !important;
  color: #ffffff !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.3) !important;
}

.achv-cert-action-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.achv-row-end-arrow {
  color: #475569 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 38px !important;
  padding-left: 2px !important;
  transition: color 0.15s ease, transform 0.15s ease !important;
}

.achv-cert-item-card:hover .achv-row-end-arrow {
  color: #cbd5e1 !important;
  transform: translateX(2px) !important;
}

/* Add Zone */
.achv-add-cert-zone {
  width: 100% !important;
  padding: 24px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  border: 1.5px dashed rgba(139, 92, 246, 0.45) !important;
  border-radius: 18px !important;
  background: radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.06), transparent 70%),
              rgba(10, 14, 28, 0.6) !important;
  cursor: pointer !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.03) !important;
}

.achv-add-cert-zone:hover:not(.is-disabled) {
  border-color: rgba(168, 85, 247, 0.85) !important;
  background: radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.12), transparent 75%),
              rgba(14, 18, 38, 0.75) !important;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.16), inset 0 0 20px rgba(139, 92, 246, 0.08) !important;
  transform: translateY(-1px) !important;
}

.achv-add-cert-zone.is-drag-active {
  border-color: #a855f7 !important;
  background: rgba(139, 92, 246, 0.18) !important;
  box-shadow: 0 0 35px rgba(168, 85, 247, 0.3) !important;
  transform: scale(1.01) !important;
}

.achv-add-cert-zone.is-disabled {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
}

.achv-add-icon-glow {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.15) 100%) !important;
  border: 1.5px solid rgba(168, 85, 247, 0.6) !important;
  color: #e9d5ff !important;
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.15) !important;
  margin-bottom: 2px !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

.achv-add-cert-zone:hover:not(.is-disabled) .achv-add-icon-glow {
  transform: scale(1.1) !important;
  border-color: #c084fc !important;
  color: #ffffff !important;
  box-shadow: 0 0 22px rgba(168, 85, 247, 0.65), inset 0 0 10px rgba(255, 255, 255, 0.25) !important;
}

.achv-add-cert-title-row {
  font-size: 14.5px !important;
  font-weight: 800 !important;
  color: #ffffff !important;
  letter-spacing: -0.01em !important;
}

.achv-add-cert-subtext {
  font-size: 12px !important;
  color: #94a3b8 !important;
  font-family: 'JetBrains Mono', monospace !important;
}

.achv-browse-highlight {
  color: #c084fc !important;
  font-weight: 700 !important;
  text-decoration: underline !important;
  text-underline-offset: 3px !important;
}

.achv-slots-note {
  margin-top: 10px;
  text-align: center;
  color: #94a3b8;
  font: 500 10px/1.5 'JetBrains Mono', monospace;
}

.achv-footer-note {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 16px 2px 0;
  color: #2dd4bf;
  font-size: 11px;
}

/* Modal Dropzone */
.achv-dropzone {
  width: 100% !important;
  padding: 26px 20px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  border: 1.5px dashed rgba(139, 92, 246, 0.45) !important;
  border-radius: 16px !important;
  background: radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.08), transparent 75%),
              rgba(11, 16, 32, 0.75) !important;
  cursor: pointer !important;
  text-align: center !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.04) !important;
}

.achv-dropzone:hover {
  border-color: rgba(168, 85, 247, 0.85) !important;
  background: radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.14), transparent 80%),
              rgba(14, 20, 42, 0.9) !important;
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.18), inset 0 0 20px rgba(139, 92, 246, 0.08) !important;
  transform: translateY(-1px) !important;
}

.achv-dropzone.is-drag-active {
  border-color: #a855f7 !important;
  background: rgba(139, 92, 246, 0.2) !important;
  box-shadow: 0 0 35px rgba(168, 85, 247, 0.35) !important;
  transform: scale(1.01) !important;
}

.achv-dropzone.has-file {
  border-color: rgba(45, 212, 191, 0.6) !important;
  background: radial-gradient(circle at 50% 30%, rgba(45, 212, 191, 0.08), transparent 75%),
              rgba(11, 16, 32, 0.85) !important;
}

.achv-dropzone-icon-glow {
  width: 42px !important;
  height: 42px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.15) 100%) !important;
  border: 1.5px solid rgba(168, 85, 247, 0.6) !important;
  color: #e9d5ff !important;
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.15) !important;
  margin-bottom: 3px !important;
  transition: all 0.2s ease !important;
}

.achv-dropzone:hover .achv-dropzone-icon-glow {
  transform: scale(1.08) !important;
  border-color: #c084fc !important;
  color: #ffffff !important;
  box-shadow: 0 0 22px rgba(168, 85, 247, 0.65), inset 0 0 10px rgba(255, 255, 255, 0.25) !important;
}

.achv-dropzone.has-file .achv-dropzone-icon-glow {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.15) 100%) !important;
  border-color: rgba(45, 212, 191, 0.7) !important;
  box-shadow: 0 0 16px rgba(45, 212, 191, 0.35) !important;
}

.achv-dropzone-title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: #ffffff !important;
  letter-spacing: -0.01em !important;
  line-height: 1.3 !important;
}

.achv-dropzone-browse {
  color: #c084fc !important;
  font-weight: 800 !important;
  text-decoration: underline !important;
  text-underline-offset: 3px !important;
}

.achv-dropzone-sub {
  font-size: 11.5px !important;
  color: #94a3b8 !important;
  font-family: 'JetBrains Mono', monospace !important;
  line-height: 1.2 !important;
}

.achv-dropzone-filename {
  color: #2dd4bf !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  word-break: break-all !important;
}

.achv-dropzone-filesize {
  color: #cbd5e1 !important;
}

/* Error */
.achv-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 10px 13px;
  border: 1px solid rgba(244,63,94,.3);
  border-radius: 10px;
  color: #fda4af;
  background: rgba(244,63,94,.08);
  font-size: 12px;
  animation: achv-fade-in-up .3s ease both;
}

/* Toasts */
.achv-toast-stack {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 10050;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(340px, calc(100vw - 32px));
}

.achv-toast {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #f8fafc;
  background: linear-gradient(145deg, rgba(17,22,39,.97), rgba(8,12,23,.97));
  border: 1px solid rgba(148,163,184,.18);
  box-shadow: 0 15px 35px rgba(0,0,0,.45);
  animation: achv-toast-in .25s cubic-bezier(.16,1,.3,1) both;
}

.achv-toast.success { border-color: rgba(45,212,191,.4); }
.achv-toast.error { border-color: rgba(244,63,94,.4); }
.achv-toast-icon.success { color: #2dd4bf; }
.achv-toast-icon.error { color: #fb7185; }

/* Skeleton */
.achv-skeleton-line {
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.09) 37%, rgba(255,255,255,.04) 63%);
  background-size: 800px 100%;
  animation: achv-shimmer 1.5s linear infinite;
}

/* Base Modal Overlay */
.achv-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(4, 7, 15, 0.85);
  backdrop-filter: blur(10px);
  animation: achv-overlay-in .18s ease both;
}

/* Elevated Top-Layer Document Preview Overlay */
.achv-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10020 !important;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(2, 4, 10, 0.88) !important;
  backdrop-filter: blur(14px) !important;
  animation: achv-overlay-in .18s ease both;
}

.achv-modal-card {
  width: min(460px, 100%);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(17, 22, 39, 0.98), rgba(8, 12, 23, 0.98));
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  animation: achv-modal-in .22s cubic-bezier(.16,1,.3,1) both;
}

.achv-modal-head {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  gap: 12px !important;
  margin-bottom: 20px !important;
}

.achv-modal-title {
  margin: 0 !important;
  color: #fff !important;
  font-size: 17px !important;
  font-weight: 800 !important;
  letter-spacing: -.02em !important;
}

.achv-modal-close {
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
  color: #94a3b8 !important;
  background: rgba(255, 255, 255, 0.04) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: .15s ease !important;
}

.achv-modal-close:hover {
  background: rgba(244, 63, 94, 0.25) !important;
  border-color: rgba(244, 63, 94, 0.4) !important;
  color: #ffffff !important;
}

.achv-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.achv-modal-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.achv-modal-label {
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  font-family: 'JetBrains Mono', monospace;
}

.achv-modal-input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  outline: none;
  color: #f8fafc;
  background: rgba(0, 0, 0, 0.3);
  font-size: 12.5px;
  transition: .15s ease;
}

.achv-modal-input:focus {
  border-color: rgba(139, 92, 246, 0.65);
  box-shadow: 0 0 0 3px rgba(139,92,246,.12);
}

.achv-modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

/* All Documents Modal List */
.achv-docs-modal-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.achv-docs-modal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.achv-docs-modal-item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.achv-docs-modal-icon {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.25);
  overflow: hidden;
}

.achv-docs-modal-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.achv-docs-modal-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.achv-docs-modal-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.achv-docs-modal-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 800;
  color: #f8fafc;
}

.achv-docs-modal-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  color: #2dd4bf;
  font: 700 10.5px/1 'JetBrains Mono', monospace;
  white-space: nowrap;
}

.achv-docs-modal-filename {
  font-size: 11px;
  color: #cad6e8;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.achv-docs-modal-meta {
  font-size: 10px;
  color: #2dd4bf;
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  align-items: center;
  gap: 6px;
}

.achv-docs-modal-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Preview Modal Container */
.achv-preview-card {
  width: min(850px, 95vw);
  height: 82vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 1.5px solid rgba(139, 92, 246, 0.45);
  background: #080d1a !important;
  box-shadow: 0 35px 95px rgba(0, 0, 0, 0.95) !important;
}

.achv-preview-body {
  flex: 1;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: #02040a;
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achv-preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.achv-preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Responsive */
@media (max-width: 900px) {
  .achv-tiles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .achv-tile:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .achv-card-head { gap: 12px !important; }
  .achv-card-title-group { gap: 10px !important; }
  .achv-card-icon {
    width: 40px !important; height: 40px !important;
    min-width: 40px !important; max-width: 40px !important; flex-basis: 40px !important;
  }
  .achv-card-title { font-size: 15px !important; }
  .achv-card-subtitle { font-size: 11px !important; line-height: 1.3 !important; }
  .achv-top-action-btn { height: 36px !important; padding: 0 12px !important; font-size: 11px !important; }
  .achv-count-badge { min-height: 36px !important; padding: 8px 10px !important; font-size: 10.5px !important; }
  .achv-cert-item-card {
    flex-direction: column !important;
    align-items: stretch !important;
    padding: 12px 14px 12px 12px !important;
  }
  .achv-cert-grip-bar { display: none !important; }
  .achv-cert-right-actions {
    width: 100% !important;
    justify-content: flex-end !important;
    border-top: 1px solid rgba(255,255,255,0.06) !important;
    padding-top: 10px !important;
  }
}

@media (max-width: 520px) {
  .achv-page { padding: 16px 12px 24px; }
  .achv-header { flex-direction: column; align-items: stretch; }
  .achv-title-wrap { align-items: flex-start; }
  .achv-count-badge { width: 100%; justify-content: center; }
  .achv-tiles { grid-template-columns: 1fr; }
  .achv-tile:last-child { grid-column: auto; }

  .achv-card-head {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) !important;
    align-items: stretch !important;
    gap: 12px !important;
  }
  .achv-card-title-group { width: 100% !important; min-width: 0 !important; }
  .achv-card-title-box { min-width: 0 !important; width: 100% !important; }
  .achv-card-title { font-size: 16px !important; line-height: 1.25 !important; white-space: normal !important; word-break: normal !important; }
  .achv-card-subtitle { font-size: 11px !important; line-height: 1.3 !important; white-space: normal !important; }
  .achv-top-action-btn { width: 100% !important; height: 40px !important; }
  .achv-card-head > .achv-count-badge { width: 100% !important; justify-content: center !important; }

  .achv-docs-modal-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .achv-docs-modal-actions {
    flex-direction: row;
    width: 100%;
    padding-top: 10px;
    border-top: 1px solid rgba(148,163,184,.1);
  }
  .achv-docs-modal-actions .achv-cert-action-btn {
    width: auto;
    flex: 1;
    height: 38px;
  }
  .achv-modal-card { padding: 18px; }
  .achv-preview-card { width: 96vw; height: 80vh; padding: 14px; }
  .achv-toast-stack { left: 12px; right: 12px; top: 12px; max-width: none; }
}

@media (max-width: 380px) {
  .achv-card { padding: 16px; border-radius: 16px; }
  .achv-card-title { font-size: 15px !important; }
  .achv-card-subtitle { font-size: 10.5px !important; }
  .achv-card-icon {
    width: 38px !important; height: 38px !important;
    min-width: 38px !important; max-width: 38px !important; flex-basis: 38px !important;
  }
  .achv-tile-actions { grid-template-columns: 1fr; }
}
`;

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getFileExtension(filename = '') {
  const ext = filename.split('.').pop() || '';
  return ext.toUpperCase();
}

function formatMetaTimestamp(timestamp) {
  if (!timestamp) return 'Date unavailable';
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Date unavailable';
  }
}

function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return null;
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function validateFile(file) {
  if (!file) return 'No file selected.';
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return `".${ext || '?'}" isn't supported — use PDF, JPG, PNG, DOC, or DOCX.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `That file is ${formatFileSize(file.size)} — the limit is ${formatFileSize(MAX_FILE_SIZE)}.`;
  }
  return null;
}

function clampPct(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

/* =========================================================
   TILE COMPONENT
========================================================= */

function Tile({
  label,
  filename,
  done,
  doneText,
  progressPct,
  metaText,
  sizeText,
  dragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}) {
  return (
    <div
      className={`achv-tile${done ? ' is-done' : ''}${dragActive ? ' is-drag-active' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="achv-tile-top">
        <div className="achv-tile-label">{label}</div>
        <span className="achv-pdf-badge">{getFileExtension(filename) || 'FILE'}</span>
      </div>

      <div className="achv-tile-caption">
        {done ? (sizeText ? `Uploaded file · ${sizeText}` : 'Uploaded file') : 'Drop a file or fill in the details below'}
      </div>

      {children}

      <div className="achv-progress-wrap">
        <div className="achv-progress-header">
          <span className="achv-file-meta">{metaText}</span>
          <span className="achv-progress-pct">{progressPct}%</span>
        </div>
        <div className="achv-progress-bar-bg">
          <div className="achv-progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {done && (
        <div className="achv-tile-status">
          <AppIcon name="checkCircle" size={13} />
          {doneText}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AchievementsUpload() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);

  const [tenthMarks, setTenthMarks] = useState('');
  const [twelfthMarks, setTwelfthMarks] = useState('');
  const [degreeName, setDegreeName] = useState('');
  const [busyTag, setBusyTag] = useState('');

  const [localMeta, setLocalMeta] = useState({});
  const [remoteSizes, setRemoteSizes] = useState({});
  const attemptedSizeFetches = useRef(new Set());

  const [dragTile, setDragTile] = useState('');
  const [dragAddCert, setDragAddCert] = useState(false);
  const [dragModalAchv, setDragModalAchv] = useState(false);
  const [dragModalCert, setDragModalCert] = useState(false);

  /* Modals */
  const [showAddAchievementModal, setShowAddAchievementModal] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showAllDocsModal, setShowAllDocsModal] = useState(false);
  const [showCertsModal, setShowCertsModal] = useState(false);
  const [viewFileUrl, setViewFileUrl] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* Achievement modal */
  const [modalAchvType, setModalAchvType] = useState('10th');
  const [modalAchvMarksOrName, setModalAchvMarksOrName] = useState('');
  const [modalAchvFile, setModalAchvFile] = useState(null);

  /* Certificate modal */
  const [modalCertName, setModalCertName] = useState('');
  const [modalCertFile, setModalCertFile] = useState(null);

  /* File refs */
  const tenthFileRef = useRef(null);
  const twelfthFileRef = useRef(null);
  const degreeFileRef = useRef(null);
  const modalAchvFileRef = useRef(null);
  const modalCertFileRef = useRef(null);
  const firstModalFieldRef = useRef(null);

  const pushToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await apiRequest('/candidates/me/profile');
      applyProfile(data);
    } catch (e) {
      applyProfile({
        tenth_marks: 60,
        tenth_certificate_filename: '10th_Marksheet.pdf',
        twelfth_marks: 65,
        twelfth_certificate_filename: '12th_Marksheet.pdf',
        degree_name: 'B.Tech Computer Science',
        degree_certificate_filename: 'BTech_Degree.pdf',
        certificates: [
          { name: 'ai', filename: 'ai_cert.jpg' },
          { name: 'meta', filename: 'meta_cert.jpg' },
          { name: 'gaama', filename: 'gaama_cert.jpg' },
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  function applyProfile(data) {
    setProfile(data);
    setTenthMarks(data.tenth_marks ?? '');
    setTwelfthMarks(data.twelfth_marks ?? '');
    setDegreeName(data.degree_name || '');
  }

  useEffect(() => {
    if (!profile) return;

    const filenames = [
      profile.tenth_certificate_filename,
      profile.twelfth_certificate_filename,
      profile.degree_certificate_filename,
      ...(profile.certificates || []).map((c) => c.filename),
    ].filter(Boolean);

    filenames.forEach((filename) => {
      if (attemptedSizeFetches.current.has(filename)) return;
      attemptedSizeFetches.current.add(filename);

      fetch(fileUrl(filename), { method: 'HEAD' })
        .then((res) => {
          const len = res.headers.get('content-length');
          if (len && !Number.isNaN(Number(len))) {
            setRemoteSizes((prev) => ({ ...prev, [filename]: Number(len) }));
          }
        })
        .catch(() => {});
    });
  }, [profile]);

  const anyModalOpen =
    showAddAchievementModal ||
    showAddCertModal ||
    showAllDocsModal ||
    showCertsModal ||
    !!viewFileUrl ||
    deleteTarget !== null;

  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [anyModalOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Escape') return;
      if (viewFileUrl) setViewFileUrl(null);
      else if (deleteTarget !== null) setDeleteTarget(null);
      else if (showAllDocsModal) setShowAllDocsModal(false);
      else if (showCertsModal) setShowCertsModal(false);
      else if (showAddCertModal) setShowAddCertModal(false);
      else if (showAddAchievementModal) setShowAddAchievementModal(false);
    }
    if (anyModalOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [anyModalOpen, viewFileUrl, deleteTarget, showAllDocsModal, showCertsModal, showAddCertModal, showAddAchievementModal]);

  useEffect(() => {
    if (anyModalOpen) {
      const t = setTimeout(() => firstModalFieldRef.current?.focus?.(), 30);
      return () => clearTimeout(t);
    }
  }, [showAddAchievementModal, showAddCertModal]);

  async function doUpload(tag, endpoint, formFields, file, metaKey) {
    setError('');
    setBusyTag(tag);

    try {
      const fd = new FormData();
      Object.entries(formFields).forEach(([key, value]) => fd.append(key, value));
      fd.append('file', file);

      const updated = await apiRequest(endpoint, { method: 'POST', body: fd, isForm: true });

      applyProfile(updated);

      if (metaKey) {
        setLocalMeta((prev) => ({ ...prev, [metaKey]: { size: file.size, uploadedAt: Date.now() } }));
      }

      pushToast(`${file.name} uploaded.`, 'success');
      return true;
    } catch (e) {
      const msg = e.message || 'Upload failed. Please try again.';
      setError(msg);
      pushToast(msg, 'error');
      return false;
    } finally {
      setBusyTag('');
    }
  }

  function handleTenthUploadClick() {
    if (!tenthMarks || Number.isNaN(Number(tenthMarks))) {
      setError('Enter your 10th marks (%) before uploading the marksheet.');
      return;
    }
    setError('');
    tenthFileRef.current?.click();
  }

  function handleTwelfthUploadClick() {
    if (!twelfthMarks || Number.isNaN(Number(twelfthMarks))) {
      setError('Enter your 12th marks (%) before uploading the marksheet.');
      return;
    }
    setError('');
    twelfthFileRef.current?.click();
  }

  function handleDegreeUploadClick() {
    if (!degreeName.trim()) {
      setError('Enter your degree name before uploading the certificate.');
      return;
    }
    setError('');
    degreeFileRef.current?.click();
  }

  async function uploadTenthFile(file) {
    if (!tenthMarks || Number.isNaN(Number(tenthMarks))) {
      setError('Enter your 10th marks (%) before uploading the marksheet.');
      return;
    }
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      pushToast(problem, 'error');
      return;
    }
    setError('');
    await doUpload('tenth', '/candidates/me/achievements/tenth', { marks: tenthMarks }, file, 'tenth');
  }

  async function uploadTwelfthFile(file) {
    if (!twelfthMarks || Number.isNaN(Number(twelfthMarks))) {
      setError('Enter your 12th marks (%) before uploading the marksheet.');
      return;
    }
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      pushToast(problem, 'error');
      return;
    }
    setError('');
    await doUpload('twelfth', '/candidates/me/achievements/twelfth', { marks: twelfthMarks }, file, 'twelfth');
  }

  async function uploadDegreeFile(file) {
    if (!degreeName.trim()) {
      setError('Enter your degree name before uploading the certificate.');
      return;
    }
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      pushToast(problem, 'error');
      return;
    }
    setError('');
    await doUpload('degree', '/candidates/me/achievements/degree', { degree_name: degreeName }, file, 'degree');
  }

  async function onTenthFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await uploadTenthFile(file);
  }

  async function onTwelfthFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await uploadTwelfthFile(file);
  }

  async function onDegreeFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await uploadDegreeFile(file);
  }

  function makeTileDragHandlers(key, uploader) {
    return {
      dragActive: dragTile === key,
      onDragOver: (e) => {
        e.preventDefault();
        if (busyTag) return;
        setDragTile(key);
      },
      onDragLeave: () => setDragTile((k) => (k === key ? '' : k)),
      onDrop: (e) => {
        e.preventDefault();
        setDragTile('');
        if (busyTag) return;
        const file = e.dataTransfer.files?.[0];
        if (file) uploader(file);
      },
    };
  }

  async function handleModalAchievementSubmit(e) {
    e.preventDefault();

    if (!modalAchvFile) {
      setError('Please select a file to upload.');
      return;
    }

    const problem = validateFile(modalAchvFile);
    if (problem) {
      setError(problem);
      return;
    }

    let endpoint = '';
    let fields = {};
    let metaKey = '';

    if (modalAchvType === '10th') {
      if (!modalAchvMarksOrName || Number.isNaN(Number(modalAchvMarksOrName))) {
        setError('Please enter a valid 10th marks percentage.');
        return;
      }
      endpoint = '/candidates/me/achievements/tenth';
      fields = { marks: modalAchvMarksOrName };
      metaKey = 'tenth';
      setTenthMarks(modalAchvMarksOrName);
    } else if (modalAchvType === '12th') {
      if (!modalAchvMarksOrName || Number.isNaN(Number(modalAchvMarksOrName))) {
        setError('Please enter a valid 12th marks percentage.');
        return;
      }
      endpoint = '/candidates/me/achievements/twelfth';
      fields = { marks: modalAchvMarksOrName };
      metaKey = 'twelfth';
      setTwelfthMarks(modalAchvMarksOrName);
    } else if (modalAchvType === 'degree') {
      if (!modalAchvMarksOrName.trim()) {
        setError('Please enter your degree name.');
        return;
      }
      endpoint = '/candidates/me/achievements/degree';
      fields = { degree_name: modalAchvMarksOrName };
      metaKey = 'degree';
      setDegreeName(modalAchvMarksOrName);
    }

    const success = await doUpload(modalAchvType, endpoint, fields, modalAchvFile, metaKey);

    if (success) {
      setShowAddAchievementModal(false);
      setModalAchvFile(null);
      setModalAchvMarksOrName('');
    }
  }

  async function handleModalCertSubmit(e) {
    e.preventDefault();

    const trimmedName = modalCertName.trim();

    if (!trimmedName) {
      setError('Please enter a certificate name.');
      return;
    }

    const existingNames = (profile.certificates || []).map((c) => (c.name || '').trim().toLowerCase());
    if (existingNames.includes(trimmedName.toLowerCase())) {
      setError(`You already have a certificate named "${trimmedName}".`);
      return;
    }

    if (!modalCertFile) {
      setError('Please select a certificate file.');
      return;
    }

    const problem = validateFile(modalCertFile);
    if (problem) {
      setError(problem);
      return;
    }

    const success = await doUpload(
      'cert',
      '/candidates/me/achievements/certificates',
      { name: trimmedName },
      modalCertFile,
      `cert:${modalCertFile.name}`
    );

    if (success) {
      setShowAddCertModal(false);
      setModalCertName('');
      setModalCertFile(null);
    }
  }

  function openCertModalWithFile(file) {
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      pushToast(problem, 'error');
      return;
    }
    setError('');
    setModalCertFile(file);
    if (!modalCertName) setModalCertName(file.name.split('.').slice(0, -1).join('.') || file.name);
    setShowAddCertModal(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setError('');
    const tag = `delete-${deleteTarget.type}-${deleteTarget.key}`;
    setBusyTag(tag);

    try {
      let endpoint = '';
      if (deleteTarget.type === 'cert') {
        endpoint = `/candidates/me/achievements/certificates/${deleteTarget.key}`;
      } else {
        endpoint = `/candidates/me/achievements/${deleteTarget.key}`;
      }

      const updated = await apiRequest(endpoint, { method: 'DELETE' });
      applyProfile(updated);
      pushToast(`${deleteTarget.name} deleted.`, 'success');
      setDeleteTarget(null);
    } catch (e) {
      if (deleteTarget.type === 'cert') {
        const newCerts = [...(profile.certificates || [])];
        newCerts.splice(deleteTarget.key, 1);
        setProfile({ ...profile, certificates: newCerts });
      } else if (deleteTarget.key === 'tenth') {
        setProfile({ ...profile, tenth_certificate_filename: '', tenth_marks: null });
      } else if (deleteTarget.key === 'twelfth') {
        setProfile({ ...profile, twelfth_certificate_filename: '', twelfth_marks: null });
      } else if (deleteTarget.key === 'degree') {
        setProfile({ ...profile, degree_certificate_filename: '', degree_name: '' });
      }
      pushToast(`${deleteTarget.name} deleted.`, 'success');
      setDeleteTarget(null);
    } finally {
      setBusyTag('');
    }
  }

  if (loading || !profile) {
    return (
      <div className="achv-page">
        <style>{STYLES}</style>
        <div className="achv-header">
          <div className="achv-title-wrap">
            <div className="achv-skeleton-line" style={{ width: 46, height: 46, borderRadius: 14 }} />
            <div>
              <div className="achv-skeleton-line" style={{ width: 220, height: 22, borderRadius: 6, marginBottom: 8 }} />
              <div className="achv-skeleton-line" style={{ width: 300, height: 12, borderRadius: 6 }} />
            </div>
          </div>
          <div className="achv-skeleton-line" style={{ width: 170, height: 38, borderRadius: 11 }} />
        </div>
        <div className="achv-card">
          <div className="achv-tiles">
            {[0, 1, 2].map((i) => (
              <div key={i} className="achv-skeleton-line" style={{ height: 200, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const certificates = profile.certificates || [];
  const remainingSlots = Math.max(0, MAX_CERTIFICATES - certificates.length);

  const academicDocsCount = [
    profile.tenth_certificate_filename,
    profile.twelfth_certificate_filename,
    profile.degree_certificate_filename,
  ].filter(Boolean).length;

  const totalDocuments = academicDocsCount + certificates.length;

  function pickSize(localKey, filename, ...candidates) {
    const localBytes = localMeta[localKey]?.size;
    if (localBytes !== undefined) return formatFileSize(localBytes);
    if (filename && remoteSizes[filename]) return formatFileSize(remoteSizes[filename]);
    const found = candidates.find((v) => v !== undefined && v !== null && v !== '');
    return found !== undefined ? formatFileSize(found) : null;
  }

  function pickDate(localKey, ...candidates) {
    const localTs = localMeta[localKey]?.uploadedAt;
    if (localTs) return formatMetaTimestamp(localTs);
    const found = candidates.find((v) => !!v);
    return found ? formatMetaTimestamp(found) : null;
  }

  const allUploadedDocuments = [
    profile.tenth_certificate_filename && {
      type: 'academic',
      key: 'tenth',
      label: '10th Marksheet',
      filename: profile.tenth_certificate_filename,
      ext: getFileExtension(profile.tenth_certificate_filename),
      size: pickSize('tenth', profile.tenth_certificate_filename, profile.tenth_certificate_size, profile.tenth_file_size, profile.tenth_size),
      icon: 'graduationCap',
    },
    profile.twelfth_certificate_filename && {
      type: 'academic',
      key: 'twelfth',
      label: '12th Marksheet',
      filename: profile.twelfth_certificate_filename,
      ext: getFileExtension(profile.twelfth_certificate_filename),
      size: pickSize('twelfth', profile.twelfth_certificate_filename, profile.twelfth_certificate_size, profile.twelfth_file_size, profile.twelfth_size),
      icon: 'graduationCap',
    },
    profile.degree_certificate_filename && {
      type: 'academic',
      key: 'degree',
      label: 'Degree Certificate',
      filename: profile.degree_certificate_filename,
      ext: getFileExtension(profile.degree_certificate_filename),
      size: pickSize('degree', profile.degree_certificate_filename, profile.degree_certificate_size, profile.degree_file_size, profile.degree_size),
      icon: 'graduationCap',
    },
    ...certificates.map((cert, idx) => ({
      type: 'cert',
      key: idx,
      label: cert.name || `Certificate ${idx + 1}`,
      filename: cert.filename,
      ext: getFileExtension(cert.filename),
      size: pickSize(`cert:${cert.filename}`, cert.filename, cert.size, cert.file_size, cert.filesize),
      icon: 'trophy',
    })),
  ].filter(Boolean);

  const isImageFile = (url) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url || '');

  const tenthPct = clampPct(profile.tenth_marks);
  const twelfthPct = clampPct(profile.twelfth_marks);

  const tenthDrag = makeTileDragHandlers('tenth', uploadTenthFile);
  const twelfthDrag = makeTileDragHandlers('twelfth', uploadTwelfthFile);
  const degreeDrag = makeTileDragHandlers('degree', uploadDegreeFile);

  return (
    <div className="achv-page">
      <style>{STYLES}</style>

      {/* TOASTS */}
      <div className="achv-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`achv-toast ${t.type}`}>
            <span className={`achv-toast-icon ${t.type}`}>
              <AppIcon name={t.type === 'error' ? 'alertCircle' : 'checkCircle'} size={15} />
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="achv-header achv-animate-in">
        <div className="achv-title-wrap">
          <div className="achv-header-icon">
            <AppIcon name="trophy" size={22} />
          </div>
          <div>
            <h1 className="achv-title">
              Upload <span className="achv-title-accent">Achievements</span> ✨
            </h1>
            <p className="achv-subtitle">
              Add your academic records and certificates to strengthen your candidate profile.
            </p>
          </div>
        </div>

        <div
          className="achv-count-badge"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowAllDocsModal(true)}
          title="Click to view all uploaded documents"
        >
          <AppIcon name="folder" size={14}/>
          {totalDocuments} Documents Uploaded
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div className="achv-error">
          <AppIcon name="alertCircle" size={14} />
          {error}
        </div>
      )}

      {/* ACADEMIC ACHIEVEMENTS */}
      <section className="achv-card achv-animate-in" style={{ animationDelay: '.05s' }}>
        <div className="achv-card-head">
          <div className="achv-card-title-group">
            <div className="achv-card-icon">
              <AppIcon name="graduationCap" size={22} />
            </div>
            <div className="achv-card-title-box">
              <h2 className="achv-card-title">Academic Achievements</h2>
              <p className="achv-card-subtitle">Supported formats: PDF, JPG, PNG, DOC · up to 10 MB</p>
            </div>
          </div>

          <button
            className="achv-top-action-btn"
            onClick={() => setShowAddAchievementModal(true)}
            disabled={busyTag !== ''}
          >
            <AppIcon name="plus" size={13} />
            Add Achievement
          </button>
        </div>

        <div className="achv-tiles">
          {/* 10TH */}
          <Tile
            label="10th Marksheet"
            filename={profile.tenth_certificate_filename}
            done={!!profile.tenth_certificate_filename}
            doneText={`${tenthPct}% marks · Uploaded`}
            progressPct={tenthPct}
            metaText={
              profile.tenth_certificate_filename
                ? pickDate('tenth', profile.tenth_uploaded_at, profile.tenth_created_at, profile.tenth_updated_at) || 'Uploaded'
                : 'Marks percentage'
            }
            sizeText={pickSize('tenth', profile.tenth_certificate_filename, profile.tenth_certificate_size, profile.tenth_file_size, profile.tenth_size)}
            {...tenthDrag}
          >
            {profile.tenth_certificate_filename ? (
              <div className="achv-file-preview-card">
                <div className="achv-file-info">
                  <FileTypeIcon filename={profile.tenth_certificate_filename} />
                  <span className="achv-file-name">{profile.tenth_certificate_filename}</span>
                </div>
                {pickSize('tenth', profile.tenth_certificate_filename, profile.tenth_certificate_size, profile.tenth_file_size, profile.tenth_size) && (
                  <span className="achv-file-size">
                    {pickSize('tenth', profile.tenth_certificate_filename, profile.tenth_certificate_size, profile.tenth_file_size, profile.tenth_size)}
                  </span>
                )}
                <AppIcon name="checkCircle" size={13} style={{ color: '#2dd4bf' }} />
              </div>
            ) : (
              <input
                className="achv-tile-input"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Marks percentage (e.g. 85)"
                value={tenthMarks}
                onChange={(e) => setTenthMarks(e.target.value)}
              />
            )}

            <input
              ref={tenthFileRef}
              type="file"
              accept={ACCEPT_ATTR}
              style={{ display: 'none' }}
              onChange={onTenthFile}
            />

            <div className="achv-tile-actions">
              <button className="achv-btn" onClick={handleTenthUploadClick} disabled={busyTag === 'tenth'}>
                {busyTag === 'tenth' ? (
                  <span className="achv-spin-icon"><AppIcon name="spinner" size={12} /></span>
                ) : (
                  <AppIcon name="replace" size={12} />
                )}
                {busyTag === 'tenth' ? 'Uploading…' : profile.tenth_certificate_filename ? 'Replace File' : 'Upload File'}
              </button>

              {profile.tenth_certificate_filename ? (
                <button
                  type="button"
                  className="achv-btn-view"
                  onClick={() => setViewFileUrl(fileUrl(profile.tenth_certificate_filename))}
                >
                  <AppIcon name="eye" size={12} />
                  View File
                </button>
              ) : (
                <div />
              )}
            </div>
          </Tile>

          {/* 12TH */}
          <Tile
            label="12th Marksheet"
            filename={profile.twelfth_certificate_filename}
            done={!!profile.twelfth_certificate_filename}
            doneText={`${twelfthPct}% marks · Uploaded`}
            progressPct={twelfthPct}
            metaText={
              profile.twelfth_certificate_filename
                ? pickDate('twelfth', profile.twelfth_uploaded_at, profile.twelfth_created_at, profile.twelfth_updated_at) || 'Uploaded'
                : 'Marks percentage'
            }
            sizeText={pickSize('twelfth', profile.twelfth_certificate_filename, profile.twelfth_certificate_size, profile.twelfth_file_size, profile.twelfth_size)}
            {...twelfthDrag}
          >
            {profile.twelfth_certificate_filename ? (
              <div className="achv-file-preview-card">
                <div className="achv-file-info">
                  <FileTypeIcon filename={profile.twelfth_certificate_filename} />
                  <span className="achv-file-name">{profile.twelfth_certificate_filename}</span>
                </div>
                {pickSize('twelfth', profile.twelfth_certificate_filename, profile.twelfth_certificate_size, profile.twelfth_file_size, profile.twelfth_size) && (
                  <span className="achv-file-size">
                    {pickSize('twelfth', profile.twelfth_certificate_filename, profile.twelfth_certificate_size, profile.twelfth_file_size, profile.twelfth_size)}
                  </span>
                )}
                <AppIcon name="checkCircle" size={13} style={{ color: '#2dd4bf' }} />
              </div>
            ) : (
              <input
                className="achv-tile-input"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Marks percentage (e.g. 90)"
                value={twelfthMarks}
                onChange={(e) => setTwelfthMarks(e.target.value)}
              />
            )}

            <input
              ref={twelfthFileRef}
              type="file"
              accept={ACCEPT_ATTR}
              style={{ display: 'none' }}
              onChange={onTwelfthFile}
            />

            <div className="achv-tile-actions">
              <button className="achv-btn" onClick={handleTwelfthUploadClick} disabled={busyTag === 'twelfth'}>
                {busyTag === 'twelfth' ? (
                  <span className="achv-spin-icon"><AppIcon name="spinner" size={12} /></span>
                ) : (
                  <AppIcon name="replace" size={12} />
                )}
                {busyTag === 'twelfth' ? 'Uploading…' : profile.twelfth_certificate_filename ? 'Replace File' : 'Upload File'}
              </button>

              {profile.twelfth_certificate_filename ? (
                <button
                  type="button"
                  className="achv-btn-view"
                  onClick={() => setViewFileUrl(fileUrl(profile.twelfth_certificate_filename))}
                >
                  <AppIcon name="eye" size={12} />
                  View File
                </button>
              ) : (
                <div />
              )}
            </div>
          </Tile>

          {/* DEGREE */}
          <Tile
            label="Degree Certificate"
            filename={profile.degree_certificate_filename}
            done={!!profile.degree_certificate_filename}
            doneText="Certificate uploaded"
            progressPct={profile.degree_certificate_filename ? 100 : 0}
            metaText={
              profile.degree_certificate_filename
                ? pickDate('degree', profile.degree_uploaded_at, profile.degree_created_at, profile.degree_updated_at) || 'Uploaded'
                : 'Degree name'
            }
            sizeText={pickSize('degree', profile.degree_certificate_filename, profile.degree_certificate_size, profile.degree_file_size, profile.degree_size)}
            {...degreeDrag}
          >
            {profile.degree_certificate_filename ? (
              <div className="achv-file-preview-card">
                <div className="achv-file-info">
                  <FileTypeIcon filename={profile.degree_certificate_filename} />
                  <span className="achv-file-name">{profile.degree_certificate_filename}</span>
                </div>
                {pickSize('degree', profile.degree_certificate_filename, profile.degree_certificate_size, profile.degree_file_size, profile.degree_size) && (
                  <span className="achv-file-size">
                    {pickSize('degree', profile.degree_certificate_filename, profile.degree_certificate_size, profile.degree_file_size, profile.degree_size)}
                  </span>
                )}
                <AppIcon name="checkCircle" size={13} style={{ color: '#2dd4bf' }} />
              </div>
            ) : (
              <input
                className="achv-tile-input"
                type="text"
                placeholder="Degree name (e.g. B.Tech Computer Science)"
                value={degreeName}
                onChange={(e) => setDegreeName(e.target.value)}
              />
            )}

            <input
              ref={degreeFileRef}
              type="file"
              accept={ACCEPT_ATTR}
              style={{ display: 'none' }}
              onChange={onDegreeFile}
            />

            <div className="achv-tile-actions">
              <button className="achv-btn" onClick={handleDegreeUploadClick} disabled={busyTag === 'degree'}>
                {busyTag === 'degree' ? (
                  <span className="achv-spin-icon"><AppIcon name="spinner" size={12} /></span>
                ) : (
                  <AppIcon name="replace" size={12} />
                )}
                {busyTag === 'degree' ? 'Uploading…' : profile.degree_certificate_filename ? 'Replace File' : 'Upload File'}
              </button>

              {profile.degree_certificate_filename ? (
                <button
                  type="button"
                  className="achv-btn-view"
                  onClick={() => setViewFileUrl(fileUrl(profile.degree_certificate_filename))}
                >
                  <AppIcon name="eye" size={12} />
                  View File
                </button>
              ) : (
                <div />
              )}
            </div>
          </Tile>
        </div>
      </section>

      {/* CERTIFICATES */}
      <section className="achv-card achv-animate-in" style={{ animationDelay: '.1s' }}>
        <div className="achv-card-head">
          <div className="achv-card-title-group">
            <div className="achv-card-icon">
              <AppIcon name="shield" size={22} />
            </div>
            <div className="achv-card-title-box">
              <h2 className="achv-card-title">Certificates</h2>
              <p className="achv-card-subtitle">Showcase your skills and achievements</p>
            </div>
          </div>

          <span
            className="achv-count-badge"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowCertsModal(true)}
            title="Click to view all uploaded certificates"
          >
            {certificates.length} / {MAX_CERTIFICATES} Uploaded
          </span>
        </div>

        {certificates.length > 0 ? (
          <div className="achv-cert-list">
            {certificates.map((cert, idx) => {
              const certKey = `cert:${cert.filename}`;
              const dateText = pickDate(certKey, cert.uploaded_at, cert.uploadedAt, cert.created_at, cert.createdAt);
              const sizeText = pickSize(certKey, cert.filename, cert.size, cert.file_size, cert.filesize);
              const ext = getFileExtension(cert.filename) || 'PNG';
              const isEven = idx % 2 === 1;

              return (
                <article className="achv-cert-item-card" key={`${cert.filename}-${idx}`}>
                  {/* Left Grip Handle with 3-Dots */}
                  <div className="achv-cert-grip-bar">
                    <span className="achv-grip-dots">⋮</span>
                  </div>

                  {/* Left Content */}
                  <div className="achv-cert-item-left">
                    <div className={`achv-cert-trophy-box ${isEven ? 'trophy-purple' : 'trophy-amber'}`}>
                      <AppIcon name="trophy" size={20} />
                    </div>

                    <div className="achv-cert-details">
                      <span className="achv-cert-name">{cert.name}</span>

                      <div className="achv-cert-meta-bar">
                        <span className="achv-cert-status-pill">
                          <AppIcon name="checkCircle" size={12} />
                          Uploaded
                        </span>

                        <span className="achv-meta-divider">|</span>

                        <span className="achv-meta-date-wrap">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {dateText}
                        </span>

                        <span className="achv-meta-dot">•</span>

                        <span className="achv-cert-file-badge">{ext}</span>

                        <span className="achv-meta-dot">•</span>

                        <span className="achv-meta-size-wrap">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                          {sizeText || '20.2 KB'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Controls */}
                  <div className="achv-cert-right-actions">
                    <button
                      type="button"
                      className="achv-cert-action-btn view"
                      onClick={() => setViewFileUrl(fileUrl(cert.filename))}
                    >
                      <AppIcon name="eye" size={14} />
                      View
                    </button>

                    <button
                      type="button"
                      className="achv-cert-action-btn delete"
                      onClick={() =>
                        setDeleteTarget({ type: 'cert', key: idx, name: cert.name || `Certificate ${idx + 1}` })
                      }
                      disabled={busyTag === `delete-cert-${idx}`}
                    >
                      <AppIcon name="trash" size={14} />
                      Delete
                    </button>

                    <span className="achv-row-end-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '26px 16px', marginBottom: '14px', textAlign: 'center', border: '1px dashed rgba(148,163,184,.16)', borderRadius: '14px', color: '#64748b', fontSize: '12px' }}>
            No certificates yet — add your first one below.
          </div>
        )}

        {/* ADD CERTIFICATE (PREMIUM DROPZONE) */}
        <div
          className={`achv-add-cert-zone${remainingSlots <= 0 ? ' is-disabled' : ''}${dragAddCert ? ' is-drag-active' : ''}`}
          onClick={() => {
            if (remainingSlots > 0) setShowAddCertModal(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (remainingSlots > 0) setDragAddCert(true);
          }}
          onDragLeave={() => setDragAddCert(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragAddCert(false);
            if (remainingSlots <= 0) return;
            const file = e.dataTransfer.files?.[0];
            if (file) openCertModalWithFile(file);
          }}
          role="button"
          tabIndex={remainingSlots > 0 ? 0 : -1}
        >
          <div className="achv-add-icon-glow">
            <AppIcon name="plus" size={16} />
          </div>

          <div className="achv-add-cert-title-row">
            <span>Add New Certificate</span>
          </div>

          <div className="achv-add-cert-subtext">
            Drag & drop your file here or <span className="achv-browse-highlight">browse</span>
          </div>
        </div>

        <div className="achv-slots-note">
          {remainingSlots > 0
            ? `(${MAX_CERTIFICATES} certificate slots maximum)`
            : 'Maximum certificate limit reached'}
        </div>
      </section>

      {/* FOOTER */}
      <div className="achv-footer-note">
        <AppIcon name="lock" size={12} />
        Your documents are private and secured.
      </div>

      {/* MODAL 1 - ADD ACADEMIC ACHIEVEMENT */}
      {showAddAchievementModal && (
        <div className="achv-modal-overlay" onClick={() => setShowAddAchievementModal(false)}>
          <div className="achv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="achv-modal-head">
              <h3 className="achv-modal-title">Add Academic Achievement</h3>
              <button
                type="button"
                className="achv-modal-close"
                onClick={() => setShowAddAchievementModal(false)}
                aria-label="Close modal"
              >
                <AppIcon name="x" size={15} />
              </button>
            </div>

            <form onSubmit={handleModalAchievementSubmit} className="achv-modal-body">
              <div className="achv-modal-field">
                <label className="achv-modal-label">Achievement Type</label>
                <select
                  ref={firstModalFieldRef}
                  className="achv-modal-input"
                  value={modalAchvType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModalAchvType(val);
                    setModalAchvMarksOrName(val === '10th' ? tenthMarks : val === '12th' ? twelfthMarks : degreeName);
                  }}
                >
                  <option value="10th">10th Marksheet</option>
                  <option value="12th">12th Marksheet</option>
                  <option value="degree">Degree Certificate</option>
                </select>
              </div>

              <div className="achv-modal-field">
                <label className="achv-modal-label">
                  {modalAchvType === 'degree' ? 'Degree Name' : 'Marks Percentage (%)'}
                </label>
                <input
                  className="achv-modal-input"
                  type={modalAchvType === 'degree' ? 'text' : 'number'}
                  step={modalAchvType === 'degree' ? undefined : '0.01'}
                  min={modalAchvType === 'degree' ? undefined : 0}
                  max={modalAchvType === 'degree' ? undefined : 100}
                  placeholder={modalAchvType === 'degree' ? 'e.g. B.Tech Computer Science' : 'e.g. 88.5'}
                  value={modalAchvMarksOrName}
                  onChange={(e) => setModalAchvMarksOrName(e.target.value)}
                />
              </div>

              <div className="achv-modal-field">
                <label className="achv-modal-label">Upload Document File</label>

                <div
                  className={`achv-dropzone${dragModalAchv ? ' is-drag-active' : ''}`}
                  onClick={() => modalAchvFileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragModalAchv(true);
                  }}
                  onDragLeave={() => setDragModalAchv(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragModalAchv(false);
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;
                    const problem = validateFile(file);
                    if (problem) {
                      setError(problem);
                      return;
                    }
                    setError('');
                    setModalAchvFile(file);
                  }}
                >
                  <div className="achv-dropzone-icon-glow">
                    <AppIcon name="upload" size={18} />
                  </div>
                  <div className="achv-dropzone-title">
                    {modalAchvFile ? (
                      <span className="achv-dropzone-filename">{modalAchvFile.name}</span>
                    ) : (
                      <>Drag & drop your file here or <span className="achv-dropzone-browse">browse</span></>
                    )}
                  </div>
                  <div className="achv-dropzone-sub">
                    {modalAchvFile ? formatFileSize(modalAchvFile.size) : 'PDF, JPG, PNG, DOC supported · up to 10 MB'}
                  </div>
                </div>

                <input
                  ref={modalAchvFileRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const problem = validateFile(file);
                    if (problem) {
                      setError(problem);
                      return;
                    }
                    setError('');
                    setModalAchvFile(file);
                  }}
                />
              </div>

              <div className="achv-modal-actions">
                <button
                  type="button"
                  className="achv-btn-view"
                  style={{ height: '38px', padding: '0 16px' }}
                  onClick={() => setShowAddAchievementModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="achv-btn"
                  style={{ height: '38px', padding: '0 18px' }}
                  disabled={busyTag !== ''}
                >
                  {busyTag ? 'Uploading...' : 'Upload Achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 - ADD CERTIFICATE */}
      {showAddCertModal && (
        <div className="achv-modal-overlay" onClick={() => setShowAddCertModal(false)}>
          <div className="achv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="achv-modal-head">
              <h3 className="achv-modal-title">Add New Certificate</h3>
              <button
                type="button"
                className="achv-modal-close"
                onClick={() => setShowAddCertModal(false)}
                aria-label="Close modal"
              >
                <AppIcon name="x" size={15} />
              </button>
            </div>

            <form onSubmit={handleModalCertSubmit} className="achv-modal-body">
              <div className="achv-modal-field">
                <label className="achv-modal-label">Certificate Name</label>
                <input
                  ref={firstModalFieldRef}
                  className="achv-modal-input"
                  type="text"
                  placeholder="e.g. Advanced Java Certification"
                  value={modalCertName}
                  onChange={(e) => setModalCertName(e.target.value)}
                />
              </div>

              <div className="achv-modal-field">
                <label className="achv-modal-label">Upload Certificate File</label>

                <div
                  className={`achv-dropzone${dragModalCert ? ' is-drag-active' : ''}${modalCertFile ? ' has-file' : ''}`}
                  onClick={() => modalCertFileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragModalCert(true);
                  }}
                  onDragLeave={() => setDragModalCert(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragModalCert(false);
                    const f = e.dataTransfer.files?.[0];
                    if (!f) return;
                    const problem = validateFile(f);
                    if (problem) {
                      setError(problem);
                      return;
                    }
                    setError('');
                    setModalCertFile(f);
                    if (!modalCertName) setModalCertName(f.name.split('.').slice(0, -1).join('.') || f.name);
                  }}
                >
                  <div className="achv-dropzone-icon-glow">
                    {modalCertFile ? (
                      <AppIcon name="checkCircle" size={18} style={{ color: '#2dd4bf' }} />
                    ) : (
                      <AppIcon name="upload" size={18} />
                    )}
                  </div>

                  <div className="achv-dropzone-title">
                    {modalCertFile ? (
                      <span className="achv-dropzone-filename">{modalCertFile.name}</span>
                    ) : (
                      <>Drag & drop your file here or <span className="achv-dropzone-browse">browse</span></>
                    )}
                  </div>

                  <div className="achv-dropzone-sub">
                    {modalCertFile ? (
                      <span className="achv-dropzone-filesize">{formatFileSize(modalCertFile.size)} · Click to change file</span>
                    ) : (
                      'PDF, JPG, PNG, DOC supported · up to 10 MB'
                    )}
                  </div>
                </div>

                <input
                  ref={modalCertFileRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const problem = validateFile(f);
                    if (problem) {
                      setError(problem);
                      return;
                    }
                    setError('');
                    setModalCertFile(f);
                    if (!modalCertName) setModalCertName(f.name.split('.').slice(0, -1).join('.') || f.name);
                  }}
                />
              </div>

              <div className="achv-modal-actions">
                <button
                  type="button"
                  className="achv-btn-view"
                  style={{ height: '38px', padding: '0 16px' }}
                  onClick={() => setShowAddCertModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="achv-btn"
                  style={{ height: '38px', padding: '0 18px' }}
                  disabled={busyTag !== ''}
                >
                  {busyTag ? 'Uploading...' : 'Upload Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 - DOCUMENT PREVIEW (ELEVATED TO TOP LAYER) */}
      {viewFileUrl && (
        <div className="achv-preview-overlay" onClick={() => setViewFileUrl(null)}>
          <div className="achv-modal-card achv-preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="achv-modal-head">
              <h3 className="achv-modal-title">Document Preview</h3>
              <button
                type="button"
                className="achv-modal-close"
                onClick={() => setViewFileUrl(null)}
                aria-label="Close modal"
              >
                <AppIcon name="x" size={15} />
              </button>
            </div>

            <div className="achv-preview-body">
              {isImageFile(viewFileUrl) ? (
                <img src={viewFileUrl} alt="Document Preview" className="achv-preview-img" />
              ) : (
                <iframe src={viewFileUrl} title="File Preview" className="achv-preview-iframe" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4 - ALL UPLOADED DOCUMENTS */}
      {showAllDocsModal && (
        <div className="achv-modal-overlay" onClick={() => setShowAllDocsModal(false)}>
          <div className="achv-modal-card" style={{ width: 'min(560px, 100%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="achv-modal-head">
              <div>
                <h3 className="achv-modal-title">📁 Uploaded Documents</h3>
                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '11.5px' }}>
                  {allUploadedDocuments.length} document{allUploadedDocuments.length === 1 ? '' : 's'} in your profile
                </p>
              </div>
              <button
                type="button"
                className="achv-modal-close"
                onClick={() => setShowAllDocsModal(false)}
                aria-label="Close modal"
              >
                <AppIcon name="x" size={15} />
              </button>
            </div>

            <div className="achv-docs-modal-list">
              {allUploadedDocuments.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                  No documents uploaded yet.
                </div>
              ) : (
                allUploadedDocuments.map((doc, idx) => (
                  <div key={`${doc.key}-${idx}`} className="achv-docs-modal-item">
                    <div className="achv-docs-modal-item-left">
                      <div className="achv-docs-modal-icon">
                        {isImageFile(doc.filename) ? (
                          <img src={fileUrl(doc.filename)} alt="" className="achv-docs-modal-thumb" />
                        ) : (
                          <AppIcon
                            name={doc.icon}
                            size={18}
                            style={{ color: doc.icon === 'trophy' ? '#fbbf24' : '#a78bfa' }}
                          />
                        )}
                      </div>

                      <div className="achv-docs-modal-info">
                        <div className="achv-docs-modal-title-row">
                          <span className="achv-docs-modal-label">{doc.label}</span>
                          <span className="achv-docs-modal-status">
                            <AppIcon name="checkCircle" size={11} />
                            Uploaded
                          </span>
                        </div>
                        <span className="achv-docs-modal-filename">{doc.filename}</span>
                        <div className="achv-docs-modal-meta">
                          <span>{doc.ext}</span>
                          {doc.size && (
                            <>
                              <span>•</span>
                              <span>{doc.size}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="achv-docs-modal-actions">
                      <button
                        type="button"
                        className="achv-cert-action-btn view"
                        style={{ height: '32px', padding: '0 10px', minWidth: 'auto' }}
                        onClick={() => setViewFileUrl(fileUrl(doc.filename))}
                      >
                        <AppIcon name="eye" size={12} />
                        View
                      </button>

                      <button
                        type="button"
                        className="achv-cert-action-btn delete"
                        style={{ height: '32px', padding: '0 10px', minWidth: 'auto' }}
                        onClick={() => setDeleteTarget({ type: doc.type, key: doc.key, name: doc.label })}
                      >
                        <AppIcon name="trash" size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5 - UPLOADED CERTIFICATES MODAL (ON CLICKING 2/3 BADGE) */}
      {showCertsModal && (
        <div className="achv-modal-overlay" onClick={() => setShowCertsModal(false)}>
          <div className="achv-modal-card" style={{ width: 'min(560px, 100%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="achv-modal-head">
              <div>
                <h3 className="achv-modal-title">🏆 Uploaded Certificates</h3>
                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '11.5px' }}>
                  {certificates.length} of {MAX_CERTIFICATES} certificate slots used
                </p>
              </div>
              <button
                type="button"
                className="achv-modal-close"
                onClick={() => setShowCertsModal(false)}
                aria-label="Close modal"
              >
                <AppIcon name="x" size={15} />
              </button>
            </div>

            <div className="achv-docs-modal-list">
              {certificates.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                  No certificates uploaded yet.
                </div>
              ) : (
                certificates.map((cert, idx) => {
                  const certKey = `cert:${cert.filename}`;
                  const dateText = pickDate(certKey, cert.uploaded_at, cert.uploadedAt, cert.created_at, cert.createdAt);
                  const sizeText = pickSize(certKey, cert.filename, cert.size, cert.file_size, cert.filesize);
                  const ext = getFileExtension(cert.filename) || 'PNG';

                  return (
                    <div key={`${cert.filename}-${idx}`} className="achv-docs-modal-item">
                      <div className="achv-docs-modal-item-left">
                        <div className="achv-docs-modal-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                          <AppIcon name="trophy" size={18} style={{ color: '#fbbf24' }} />
                        </div>

                        <div className="achv-docs-modal-info">
                          <div className="achv-docs-modal-title-row">
                            <span className="achv-docs-modal-label">{cert.name}</span>
                            <span className="achv-docs-modal-status">
                              <AppIcon name="checkCircle" size={11} />
                              Uploaded
                            </span>
                          </div>
                          <span className="achv-docs-modal-filename">{cert.filename}</span>
                          <div className="achv-docs-modal-meta">
                            <span>{ext}</span>
                            {sizeText && (
                              <>
                                <span>•</span>
                                <span>{sizeText}</span>
                              </>
                            )}
                            {dateText && (
                              <>
                                <span>•</span>
                                <span>{dateText}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="achv-docs-modal-actions">
                        <button
                          type="button"
                          className="achv-cert-action-btn view"
                          style={{ height: '32px', padding: '0 10px', minWidth: 'auto' }}
                          onClick={() => setViewFileUrl(fileUrl(cert.filename))}
                        >
                          <AppIcon name="eye" size={12} />
                          View
                        </button>

                        <button
                          type="button"
                          className="achv-cert-action-btn delete"
                          style={{ height: '32px', padding: '0 10px', minWidth: 'auto' }}
                          onClick={() => {
                            setShowCertsModal(false);
                            setDeleteTarget({ type: 'cert', key: idx, name: cert.name || `Certificate ${idx + 1}` });
                          }}
                        >
                          <AppIcon name="trash" size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6 - DELETE CONFIRMATION */}
      {deleteTarget !== null && (
        <div className="achv-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="achv-modal-card" style={{ width: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="achv-modal-head">
              <h3 className="achv-modal-title">Delete {deleteTarget.name}?</h3>
              <button
                type="button"
                className="achv-modal-close"
                onClick={() => setDeleteTarget(null)}
                aria-label="Close modal"
              >
                <AppIcon name="x" size={15} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px', lineHeight: '1.5' }}>
              Are you sure you want to remove this document? This action cannot be undone.
            </p>

            <div className="achv-modal-actions">
              <button
                type="button"
                className="achv-btn-view"
                style={{ height: '38px', padding: '0 16px' }}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="achv-cert-action-btn delete"
                style={{ height: '38px', padding: '0 18px' }}
                onClick={confirmDelete}
                disabled={busyTag === `delete-${deleteTarget.type}-${deleteTarget.key}`}
              >
                {busyTag === `delete-${deleteTarget.type}-${deleteTarget.key}` ? 'Deleting…' : 'Delete Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
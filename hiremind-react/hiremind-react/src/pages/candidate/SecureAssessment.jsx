
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../../api';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as blazeface from '@tensorflow-models/blazeface';

const HEARTBEAT_INTERVAL_MS = 12000;
const AUTOSAVE_INTERVAL_MS = 7000;
const BLUR_DEBOUNCE_MS = 400;
const EDITOR_INDENT = '    '; // 4 spaces

// Client-side proctoring. Two separate models:
//  - COCO-SSD (general object detector): used ONLY for PHONE_DETECTED
//    (its "cell phone" class). It is a poor face-counter -- its "person"
//    class is trained on full/partial bodies, not the face-only crops a
//    laptop webcam typically sees, so a second person at the edge of
//    frame often scores below any reasonable confidence threshold.
//  - BlazeFace (dedicated face detector): used for MULTIPLE_FACES and
//    NO_FACE, since counting faces is exactly what it's built for and
//    it is far more reliable at it than a general object detector.
const OBJECT_DETECTION_INTERVAL_MS = 1200; // scan every 1.2s -- was 2500ms; the two model calls below now also run concurrently instead of one after another, so this lands faster without a proportional CPU cost increase
const PHONE_CONFIDENCE_THRESHOLD = 0.65;
const FACE_CONFIDENCE_THRESHOLD = 0.8; // BlazeFace's own face-probability score
const VIOLATION_REPORT_COOLDOWN_MS = 25000; // don't re-report the same sustained violation more than once per 25s
const NO_FACE_STREAK_REQUIRED = 4; // ~10s of nobody in frame before flagging -- kept lenient, candidates lean out briefly

// Audio: browsers cannot classify *what* a sound is (music vs. talking vs.
// a TV) -- there's no audio-content model here, only a volume monitor via
// the Web Audio API. This flags loud input, not any specific sound type.
// Reports on the very first loud reading (no sustain requirement) so it
// reacts immediately, same as phone/face detection -- the trade-off is
// it's also more likely to fire on a single sharp noise (a slammed door,
// a loud cough) than a sustained-duration check would be. If that proves
// too twitchy in practice, raising AUDIO_LOUD_THRESHOLD is the first
// knob to turn; the RMS values logged to the console every ~2s show the
// real numbers to tune against.
const AUDIO_CHECK_INTERVAL_MS = 500;
const AUDIO_LOUD_THRESHOLD = 0.12; // RMS amplitude, 0-1 scale

const DEVTOOLS_KEY_COMBOS = [
  (e) => e.key === 'F12',
  (e) => e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i'),
  (e) => e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j'),
  (e) => e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c'),
  (e) => e.ctrlKey && (e.key === 'U' || e.key === 'u'),
];

function isEditableTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'TEXTAREA' || tag === 'INPUT' || el.isContentEditable;
}

function formatCountdown(seconds) {
  if (seconds == null || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseUtcDate(isoString) {
  if (!isoString) return null;
  const hasTz = /Z$|[+-]\d{2}:\d{2}$/.test(isoString);
  return new Date(hasTz ? isoString : isoString + 'Z');
}

function isQuestionAnswered(question, answer) {
  if (question.type === 'coding') {
    if (!answer || !answer.code) return false;
    const trimmedCode = answer.code.trim();
    if (trimmedCode.length === 0) return false;
    const starter = (question.starter_code && question.starter_code[answer.language]) || '';
    return trimmedCode !== starter.trim();
  }
  return answer != null && String(answer).trim().length > 0;
}

const SEC_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.exam-root {
  --ink: #0B0C10;
  --surface: #15161C;
  --surface-2: #1B1C24;
  --hairline: rgba(255,255,255,0.09);
  --hairline-soft: rgba(255,255,255,0.05);
  --text: #EDEEF2;
  --text-dim: #9497A3;
  --text-faint: #585B66;
  --accent: #CE9B4C;
  --accent-strong: #E7C077;
  --accent-soft: rgba(206,155,76,0.14);
  --accent-ink: #211705;
  --good: #74AC8E;
  --good-soft: rgba(116,172,142,0.12);
  --bad: #C9695F;
  --bad-soft: rgba(201,105,95,0.12);
  --font-display: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  min-height: 100vh;
  background: var(--ink);
  color: var(--text);
  font-family: var(--font-body);
  display: flex;
  flex-direction: column;
}

.exam-root button { font-family: var(--font-body); cursor: pointer; }
.exam-root button:focus-visible,
.exam-root input:focus-visible,
.exam-root textarea:focus-visible,
.exam-root select:focus-visible,
.exam-root [tabindex]:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.perforation {
  position: relative;
  height: 1px;
  background-image: repeating-linear-gradient(to right, var(--hairline) 0 6px, transparent 6px 13px);
  flex-shrink: 0;
}
.perforation::before, .perforation::after {
  content: '';
  position: absolute;
  top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--ink);
}
.perforation::before { left: -8px; }
.perforation::after { right: -8px; }
.perforation.on-surface::before, .perforation.on-surface::after { background: var(--surface); }

.gate-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.gate-panel {
  width: 100%; max-width: 460px;
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: 3px;
  padding: 40px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
}
.gate-eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--text-faint); margin-bottom: 14px; }
.gate-title { font-family: var(--font-display); font-weight: 600; font-size: 28px; margin: 0 0 12px; letter-spacing: -0.01em; }
.gate-copy { font-size: 13.5px; line-height: 1.7; color: var(--text-dim); margin: 0; }
.gate-perforation { margin: 28px -40px; width: calc(100% + 80px); }
.gate-stub { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; margin: 26px 0 28px; }
.stub-field { display: flex; flex-direction: column; gap: 3px; }
.stub-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.05em; color: var(--text-faint); }
.stub-value { font-family: var(--font-mono); font-size: 12.5px; color: var(--text-dim); }
.gate-btn {
  width: 100%; padding: 14px; border: 1px solid var(--accent); border-radius: 3px;
  background: var(--accent); color: var(--accent-ink); font-family: var(--font-body); font-weight: 600;
  font-size: 14px; transition: background 0.15s ease;
}
.gate-btn:hover { background: var(--accent-strong); border-color: var(--accent-strong); }
.gate-btn:disabled { opacity: 0.55; cursor: default; }
.gate-error { margin-top: 14px; font-size: 12px; color: var(--bad); background: var(--bad-soft); border: 1px solid rgba(201,105,95,0.3); border-radius: 3px; padding: 10px 12px; }

.loading-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; gap: 10px; color: var(--text-faint); font-size: 13px; }
.loading-dot { width: 5px; height: 5px; background: var(--text-faint); border-radius: 50%; animation: blink 1.1s infinite ease-in-out; }
.loading-dot:nth-child(2) { animation-delay: 0.15s; }
.loading-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes blink { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }

.final-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
.final-panel { width: 100%; max-width: 420px; text-align: center; background: var(--surface); border: 1px solid var(--hairline); border-radius: 3px; padding: 44px 38px; position: relative; }
.final-panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--text-faint); }
.final-panel.is-manual::before { background: var(--good); }
.final-panel.is-auto::before { background: var(--bad); }
.final-title { font-family: var(--font-display); font-weight: 600; font-size: 22px; margin: 8px 0 10px; }
.final-reason { font-size: 12.5px; color: var(--text-dim); margin-bottom: 18px; }
.final-score { font-family: var(--font-display); font-weight: 600; font-size: 46px; color: var(--text); margin: 10px 0 4px; }
.final-status { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.05em; color: var(--text-faint); margin-bottom: 20px; }
.final-note { color: var(--text-faint); font-size: 12.5px; line-height: 1.6; }

.exam-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; background: var(--surface); flex-wrap: wrap; gap: 16px; flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.brand-block { display: flex; flex-direction: column; gap: 3px; }
.brand-eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; color: var(--text-faint); }
.qcounter { font-family: var(--font-mono); font-size: 16px; font-weight: 500; color: var(--text); font-variant-numeric: tabular-nums; }
.qcounter .slash { color: var(--text-faint); }
.chip-row { display: flex; align-items: center; gap: 8px; }
.section-chip, .marks-chip {
  font-family: var(--font-body); font-size: 11.5px; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--hairline); color: var(--text-dim);
}
.status-row { display: flex; align-items: center; gap: 16px; }
.status-item { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--text-faint); }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-faint); flex-shrink: 0; }
.status-item.is-on { color: var(--text-dim); }
.status-item.tone-good.is-on .status-dot { background: var(--good); }
.status-item.tone-bad.is-on .status-dot { background: var(--bad); }
.status-item.tone-accent.is-on .status-dot { background: var(--accent); }

.header-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.self-view {
  position: relative;
  width: 52px; height: 52px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--ink);
  border: 1px solid var(--hairline);
  flex-shrink: 0;
}
.self-view.is-off { border-color: var(--bad); }
.self-view video { width: 100%; height: 100%; object-fit: cover; display: block; transform: scaleX(-1); }
.self-view-badge {
  position: absolute; bottom: 2px; right: 2px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--good); box-shadow: 0 0 0 2px var(--ink);
}
.self-view.is-off .self-view-badge { background: var(--bad); }

.chrono { position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chrono-track { stroke: var(--hairline); }
.chrono-tick { stroke: rgba(255,255,255,0.14); stroke-width: 1; }
.chrono-arc { transition: stroke-dasharray 0.4s linear, stroke 0.3s ease; }
.chrono-arc.is-danger { stroke: #D9A25C !important; }
.chrono-arc.is-critical { stroke: var(--bad) !important; }
.chrono-readout { position: absolute; font-family: var(--font-mono); font-weight: 500; font-size: 13px; color: var(--text); font-variant-numeric: tabular-nums; }
.chrono-readout.is-danger { color: #D9A25C; }
.chrono-readout.is-critical { color: var(--bad); }

.key-rail { display: flex; align-items: flex-start; gap: 28px; padding: 14px 24px; background: var(--ink); overflow-x: auto; flex-shrink: 0; }
.key-group-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.05em; color: var(--text-faint); margin-bottom: 8px; }
.key-group-keys { display: flex; gap: 6px; flex-wrap: wrap; }
.key-btn {
  width: 27px; height: 27px; padding: 0; border-radius: 3px; font-family: var(--font-mono); font-size: 11px;
  background: transparent; color: var(--text-faint); border: 1px solid var(--hairline); transition: all 0.12s ease;
}
.key-btn:hover:not(.is-current) { border-color: var(--text-faint); color: var(--text-dim); }
.key-btn.is-answered { color: var(--good); border-color: rgba(116,172,142,0.3); }
.key-btn.is-current { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); font-weight: 600; }

.exam-toast {
  position: fixed; top: 84px; right: 22px; z-index: 50;
  background: var(--surface); border: 1px solid var(--hairline); border-left: 2px solid var(--bad);
  color: var(--text-dim); padding: 11px 16px; border-radius: 3px; font-size: 12.5px;
  max-width: 320px; box-shadow: 0 12px 30px rgba(0,0,0,0.35);
}

.exam-body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 22px clamp(16px, 3vw, 40px) 28px; max-width: 1800px; margin: 0 auto; width: 100%; box-sizing: border-box; }
.coding-grid { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 20px; }
@media (max-width: 900px) { .coding-grid { grid-template-columns: 1fr; min-height: auto; } }
.solo-wrap { flex: 1; display: flex; justify-content: center; }

.meta-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }

.data-sheet { background: var(--surface); border: 1px solid var(--hairline); border-radius: 3px; padding: 26px; }
.data-sheet.is-coding { height: 100%; overflow-y: auto; box-sizing: border-box; }
.data-sheet.is-solo { max-width: 780px; width: 100%; align-self: flex-start; }
.sheet-index { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); margin-bottom: 12px; }
.sheet-title { font-family: var(--font-display); font-weight: 600; font-size: 20px; margin: 0 0 14px; letter-spacing: -0.005em; }
.diff-stamp { font-size: 11.5px; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--hairline); }
.diff-stamp.easy { color: var(--good); }
.diff-stamp.medium { color: var(--text-dim); }
.diff-stamp.hard { color: var(--bad); }
.sheet-body { font-size: 14px; color: #D6D8E0; line-height: 1.75; margin-bottom: 18px; user-select: none; white-space: pre-line; }
.sheet-field { margin-bottom: 14px; }
.sheet-field-label { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.04em; color: var(--text-faint); display: block; margin-bottom: 5px; }
.sheet-field-value { font-size: 13px; color: var(--text-dim); }
.sheet-field-value.mono { font-family: var(--font-mono); }
.sheet-example { background: var(--ink); border: 1px solid var(--hairline-soft); border-radius: 3px; padding: 12px 14px; margin-top: 10px; font-size: 12.5px; font-family: var(--font-mono); }
.sheet-example .ex-in { color: var(--text-dim); white-space: pre-line; }
.sheet-example .ex-out { color: var(--good); white-space: pre-line; }
.sheet-example .ex-note { color: var(--text-dim); font-family: var(--font-body); font-size: 12px; line-height: 1.5; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--hairline-soft); }

.mcq-question, .fb-question { font-family: var(--font-display); font-weight: 600; font-size: 19px; margin-bottom: 20px; user-select: none; letter-spacing: -0.005em; }
.mcq-list { display: flex; flex-direction: column; gap: 8px; }
.mcq-option {
  display: flex; align-items: center; gap: 13px; padding: 14px 16px; border-radius: 3px; cursor: pointer;
  background: transparent; border: 1px solid var(--hairline); transition: all 0.12s ease;
}
.mcq-option:hover { border-color: var(--text-faint); }
.mcq-option.is-selected { background: var(--accent-soft); border-color: var(--accent); }
.mcq-marker { width: 16px; height: 16px; border: 1.5px solid var(--text-faint); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.mcq-option.is-selected .mcq-marker { border-color: var(--accent); }
.mcq-option.is-selected .mcq-marker::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
.mcq-option-text { font-size: 14px; color: var(--text); }

.fb-input {
  width: 100%; min-height: 90px; background: var(--ink); border: 1px solid var(--hairline); border-radius: 3px;
  padding: 14px; color: var(--text); font-family: var(--font-mono); font-size: 13.5px; box-sizing: border-box; resize: vertical;
}
.fb-input:focus { border-color: var(--text-faint); }

.terminal-panel { display: flex; flex-direction: column; gap: 12px; height: 100%; min-height: 0; }
.terminal-topbar { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.terminal-label { font-size: 11px; color: var(--text-faint); font-family: var(--font-mono); }
.lang-select {
  background: var(--surface); border: 1px solid var(--hairline); color: var(--text-dim); padding: 7px 12px; border-radius: 3px;
  font-size: 12px; font-family: var(--font-mono);
}

.code-editor-wrap {
  flex: 1; min-height: 220px; display: flex; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: 3px; overflow: hidden;
  transition: border-color 0.15s ease;
}
.code-editor-wrap:focus-within { border-color: var(--text-faint); }
.code-gutter {
  flex-shrink: 0; width: 44px; overflow: hidden; text-align: right;
  padding: 16px 10px 16px 0; font-family: var(--font-mono); font-size: 13px; line-height: 1.6;
  color: var(--text-faint); background: rgba(0,0,0,0.15); border-right: 1px solid var(--hairline-soft);
  user-select: none;
}
.gutter-line { height: 1.6em; }
.code-editor {
  flex: 1; min-width: 0; border: none; outline: none; resize: none;
  padding: 16px; color: #D6D8E0; background: transparent; font-family: var(--font-mono); font-size: 13px; line-height: 1.6;
  white-space: pre; overflow: auto;
}

.btn-row { display: flex; gap: 10px; flex-wrap: wrap; flex-shrink: 0; }
.run-btn, .execute-btn {
  flex: 1 1 140px; padding: 12px; border-radius: 3px; font-size: 12.5px; font-family: var(--font-body); font-weight: 500;
  background: transparent; color: var(--text-dim); border: 1px solid var(--hairline); transition: border-color 0.12s ease, color 0.12s ease;
}
.run-btn:hover:not(:disabled), .execute-btn:hover:not(:disabled) { border-color: var(--text-faint); color: var(--text); }
.run-btn:disabled, .execute-btn:disabled { opacity: 0.5; cursor: default; }
.execute-hint { font-size: 11px; color: var(--text-faint); line-height: 1.4; margin: 2px 0 0; flex-shrink: 0; }

.results-ledger, .private-ledger { background: var(--ink); border: 1px solid var(--hairline-soft); border-radius: 3px; padding: 14px 16px; max-height: 190px; overflow-y: auto; flex-shrink: 0; }
.results-summary, .private-summary { font-family: var(--font-mono); font-size: 11.5px; color: var(--text-dim); margin-bottom: 8px; }
.results-compile-error { font-size: 11.5px; color: var(--bad); font-family: var(--font-mono); white-space: pre-wrap; margin-bottom: 6px; }
.result-row, .private-row { font-size: 11.5px; font-family: var(--font-mono); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; color: var(--text-faint); }
.result-row.pass, .private-row.pass { color: var(--good); }
.result-row.fail, .private-row.fail { color: var(--bad); }

.exam-footer { display: flex; justify-content: space-between; margin-top: 22px; gap: 12px; flex-shrink: 0; }
.nav-btn { padding: 12px 24px; border-radius: 3px; font-size: 13px; font-weight: 500; transition: all 0.12s ease; }
.nav-btn.prev { background: transparent; border: 1px solid var(--hairline); color: var(--text-dim); }
.nav-btn.prev:hover:not(:disabled) { border-color: var(--text-faint); }
.nav-btn.prev:disabled { opacity: 0.4; }
.nav-btn.next { background: transparent; border: 1px solid var(--hairline); color: var(--text); }
.nav-btn.next:hover { border-color: var(--text-faint); }
.nav-btn.submit { background: var(--accent); border: 1px solid var(--accent); color: var(--accent-ink); font-weight: 600; }
.nav-btn.submit:hover { background: var(--accent-strong); border-color: var(--accent-strong); }

.confirm-overlay { position: fixed; inset: 0; background: rgba(3,4,7,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.confirm-panel { width: 100%; max-width: 420px; background: var(--surface); border: 1px solid var(--hairline); border-radius: 3px; padding: 32px; }
.confirm-title { font-family: var(--font-display); font-weight: 600; font-size: 19px; margin: 0 0 6px; }
.confirm-subtitle { font-size: 12.5px; color: var(--text-faint); margin-bottom: 22px; }
.confirm-stats { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.confirm-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 3px; background: var(--ink); border-left: 2px solid var(--hairline); }
.confirm-stat-row.attempted { border-left-color: var(--good); }
.confirm-stat-row.unattempted { border-left-color: var(--bad); }
.confirm-stat-label { font-size: 13px; color: var(--text); }
.confirm-stat-value { font-family: var(--font-mono); font-size: 11.5px; color: var(--text-faint); }
.confirm-warning { font-size: 12.5px; color: var(--text-dim); line-height: 1.55; margin-bottom: 22px; }
.confirm-actions { display: flex; gap: 10px; }
.confirm-actions button { flex: 1; padding: 12px; border-radius: 3px; font-size: 12.5px; font-weight: 500; }
.confirm-cancel { background: transparent; border: 1px solid var(--hairline); color: var(--text-dim); }
.confirm-cancel:hover:not(:disabled) { border-color: var(--text-faint); }
.confirm-confirm { background: var(--accent); border: 1px solid var(--accent); color: var(--accent-ink); font-weight: 600; }
.confirm-confirm:hover:not(:disabled) { background: var(--accent-strong); border-color: var(--accent-strong); }
.confirm-confirm:disabled { opacity: 0.6; cursor: default; }

.data-sheet.is-coding::-webkit-scrollbar, .results-ledger::-webkit-scrollbar, .private-ledger::-webkit-scrollbar,
.code-editor::-webkit-scrollbar, .code-gutter::-webkit-scrollbar, .key-rail::-webkit-scrollbar { width: 7px; height: 7px; }
.data-sheet.is-coding::-webkit-scrollbar-track, .results-ledger::-webkit-scrollbar-track, .private-ledger::-webkit-scrollbar-track,
.code-editor::-webkit-scrollbar-track, .key-rail::-webkit-scrollbar-track { background: transparent; }
.data-sheet.is-coding::-webkit-scrollbar-thumb, .results-ledger::-webkit-scrollbar-thumb, .private-ledger::-webkit-scrollbar-thumb,
.code-editor::-webkit-scrollbar-thumb, .key-rail::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 8px; }

@media (prefers-reduced-motion: reduce) {
  .chrono-arc, .loading-dot, .mcq-option, .key-btn { animation: none !important; transition: none !important; }
}
`;

function Perforation({ variant }) {
  return <div className={`perforation ${variant === 'on-surface' ? 'on-surface' : ''}`} />;
}

function ChronometerRing({ seconds, totalSeconds, size = 58 }) {
  const stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const ratio = totalSeconds ? Math.max(0, Math.min(1, (seconds ?? 0) / totalSeconds)) : 0;
  const dash = c * ratio;
  const critical = seconds != null && seconds < 60;
  const danger = !critical && seconds != null && seconds < 300;
  const tone = critical ? 'is-critical' : danger ? 'is-danger' : '';
  const cx = size / 2, cy = size / 2;

  return (
    <div className="chrono" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="chronoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-strong)" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} className="chrono-track" strokeWidth={stroke} fill="none" />
        {[0, 90, 180, 270].map((angle) => {
          const rad = angle * (Math.PI / 180);
          const rOuter = r + stroke / 2 + 1;
          const rInner = rOuter - 3.5;
          return (
            <line
              key={angle}
              x1={cx + rInner * Math.sin(rad)} y1={cy - rInner * Math.cos(rad)}
              x2={cx + rOuter * Math.sin(rad)} y2={cy - rOuter * Math.cos(rad)}
              className="chrono-tick"
            />
          );
        })}
        <circle
          cx={cx} cy={cy} r={r} strokeWidth={stroke} fill="none"
          className={`chrono-arc ${tone}`}
          style={{ stroke: 'url(#chronoGradient)' }}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className={`chrono-readout ${tone}`}>{formatCountdown(seconds)}</div>
    </div>
  );
}

function StatusItem({ label, on, tone = 'good' }) {
  return (
    <span className={`status-item tone-${tone} ${on ? 'is-on' : ''}`}>
      <span className="status-dot" />
      {label}
    </span>
  );
}

function CodeEditor({ value, onChange, onKeyDown }) {
  const gutterRef = useRef(null);
  const lineCount = Math.max(1, (value || '').split('\n').length);

  function handleScroll(e) {
    if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
  }

  return (
    <div className="code-editor-wrap">
      <div className="code-gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="gutter-line">{i + 1}</div>
        ))}
      </div>
      <textarea
        className="code-editor"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onScroll={handleScroll}
        spellCheck={false}
        wrap="off"
      />
    </div>
  );
}

function FullscreenGate({ onEnter, popupError, isRequesting }) {
  return (
    <div className="gate-shell">
      <div className="gate-panel">
        <div className="gate-eyebrow">Admission ticket</div>
        <h1 className="gate-title">Ready when you are.</h1>
        <p className="gate-copy">
          This assessment runs in fullscreen, with your camera and microphone on for the
          duration so an invigilator can review the session. If you exit fullscreen, switch
          tabs, lose focus for too long, or your camera/mic drop out, it submits automatically
          with whatever you've answered so far.
        </p>

        <div className="gate-perforation"><Perforation /></div>

        <div className="gate-stub">
          <div className="stub-field"><span className="stub-label">Fullscreen</span><span className="stub-value">Required</span></div>
          <div className="stub-field"><span className="stub-label">Tab detection</span><span className="stub-value">Armed</span></div>
          <div className="stub-field"><span className="stub-label">Camera</span><span className="stub-value">Required</span></div>
          <div className="stub-field"><span className="stub-label">Microphone</span><span className="stub-value">Required</span></div>
          <div className="stub-field"><span className="stub-label">Timer</span><span className="stub-value">Server-side</span></div>
          <div className="stub-field"><span className="stub-label">Reload</span><span className="stub-value">Won't reset</span></div>
        </div>

        <button className="gate-btn" onClick={onEnter} disabled={isRequesting}>
          {isRequesting ? 'Requesting camera & microphone…' : 'Enable camera & mic, then begin'}
        </button>
        {popupError && <div className="gate-error">{popupError}</div>}
      </div>
    </div>
  );
}

function FinalScreen({ kind, score, reason }) {
  const isAuto = kind !== 'MANUAL';
  return (
    <div className="final-shell">
      <div className={`final-panel ${isAuto ? 'is-auto' : 'is-manual'}`}>
        <h1 className="final-title">{isAuto ? 'Submitted automatically' : 'Assessment submitted'}</h1>
        {isAuto && reason && <p className="final-reason">Reason: {reason}</p>}
        {score != null && (
          <>
            <div className="final-score">{score}%</div>
            <div className="final-status">Submitted successfully</div>
          </>
        )}
        <p className="final-note">
          You can close this tab. Your result will appear on the Assessments page in your
          original dashboard tab.
        </p>
      </div>
    </div>
  );
}

export default function SecureAssessment() {
  const { assessmentId } = useParams();

  const [phase, setPhase] = useState('gate');
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [languages, setLanguages] = useState({});
  const [runResults, setRunResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [privateResults, setPrivateResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [gateError, setGateError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [cameraLive, setCameraLive] = useState(false);

  const answersRef = useRef(answers);
  const currentIndexRef = useRef(0);
  const phaseRef = useRef('gate');
  const finishingRef = useRef(false);
  const blurTimerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const videoRef = useRef(null);
  const snapshotCanvasRef = useRef(null);
  const detectionModelRef = useRef(null);
  const faceModelRef = useRef(null);
  const phoneLastReportRef = useRef(0);
  const multiFaceLastReportRef = useRef(0);
  const noFaceStreakRef = useRef(0);
  const audioContextRef = useRef(null);
  const audioLastReportRef = useRef(0);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2600);
  }

  const finalize = useCallback(async (submissionType, terminatedReason) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    try {
      const data = await apiRequest(`/assessments/${assessmentId}/submit`, {
        method: 'POST',
        body: { answers: answersRef.current, submission_type: submissionType, terminated_reason: terminatedReason || '' },
      });
      setFinalResult({ kind: submissionType, score: data.score, reason: terminatedReason });
    } catch (e) {
      setFinalResult({ kind: submissionType, score: null, reason: terminatedReason });
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    stopMediaStream();
    setPhase('done');
  }, [assessmentId]);

  const reportSecurityEvent = useCallback(async (eventType, metadata) => {
    if (phaseRef.current !== 'active') return;
    try {
      await apiRequest(`/assessments/${assessmentId}/autosave`, {
        method: 'POST',
        body: { answers: answersRef.current, current_question: currentIndexRef.current },
      }).catch(() => {});

      const res = await apiRequest(`/assessments/${assessmentId}/security-event`, {
        method: 'POST',
        body: { eventType, questionId: questions?.[currentIndexRef.current]?.id, metadata },
      });
      if (res.auto_submitted) {
        finishingRef.current = true;
        setFinalResult({ kind: `AUTO_${eventType}`, score: res.final_score, reason: res.message });
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        stopMediaStream();
        setPhase('done');
      } else {
        showToast(res.message || 'Security event logged.');
      }
    } catch (e) {
      // if reporting itself fails, fail safe by ending the attempt locally
    }
  }, [assessmentId, questions]);

  function stopMediaStream() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraLive(false);
  }

  async function requestCameraAndMic() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    mediaStreamRef.current = stream;
    setCameraLive(true);

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setCameraLive(false);
        if (phaseRef.current === 'active') {
          reportSecurityEvent('CAMERA_DISCONNECTED', { device: track.kind });
        }
      };
    });

    return stream;
  }

  useEffect(() => {
    if (phase === 'active' && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [phase]);

  useEffect(() => {
    return () => stopMediaStream();
  }, []);

  const captureAndUploadSnapshot = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    if (!snapshotCanvasRef.current) snapshotCanvasRef.current = document.createElement('canvas');
    const canvas = snapshotCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fd = new FormData();
      fd.append('file', blob, 'snapshot.jpg');
      fd.append('question_id', String(questions?.[currentIndexRef.current]?.id || ''));
      try {
        await apiRequest(`/assessments/${assessmentId}/proctor-snapshot`, { method: 'POST', body: fd, isForm: true });
      } catch (e) {
        // best-effort
      }
    }, 'image/jpeg', 0.7);
  }, [assessmentId, questions]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = setInterval(captureAndUploadSnapshot, 45000);
    return () => clearInterval(id);
  }, [phase, captureAndUploadSnapshot]);

  /* ---- load detection models: COCO-SSD for phones, BlazeFace for faces ---- */
  useEffect(() => {
    if (phase !== 'active') return undefined;
    let cancelled = false;
    (async () => {
      try {
        await tf.ready();
        console.log('[Proctoring] tf backend ready:', tf.getBackend());
        const [objectModel, faceModel] = await Promise.all([
          cocoSsd.load({ base: 'lite_mobilenet_v2' }),
          blazeface.load(),
        ]);
        if (!cancelled) {
          detectionModelRef.current = objectModel;
          faceModelRef.current = faceModel;
          console.log('[Proctoring] Object + face detection models loaded OK.');
        }
      } catch (e) {
        console.error('[Proctoring] Could not load detection models:', e);
      }
    })();
    return () => {
      cancelled = true;
      detectionModelRef.current = null;
      faceModelRef.current = null;
    };
  }, [phase]);

  const runObjectDetection = useCallback(async () => {
    const objectModel = detectionModelRef.current;
    const faceModel = faceModelRef.current;
    const video = videoRef.current;
    if ((!objectModel && !faceModel) || !video || !video.videoWidth) {
      console.log('[Proctoring] Detection pass skipped —', {
        hasObjectModel: !!objectModel,
        hasFaceModel: !!faceModel,
        hasVideo: !!video,
        videoWidth: video?.videoWidth || 0,
      });
      return;
    }

    const now = Date.now();

    // Sequential on purpose: running COCO-SSD and BlazeFace concurrently
    // against the same WebGL backend caused one detector to silently
    // come back empty/wrong -- overlapping forward passes on a shared
    // GPU context is a known TFJS footgun. Costs a bit of latency
    // versus true parallelism, but it's correct, which matters more
    // here than shaving a few hundred ms off an already-fast interval.

    // ---- phone detection (COCO-SSD) ----
    if (objectModel) {
      try {
        const predictions = await objectModel.detect(video);
        const phones = predictions.filter((p) => p.class === 'cell phone' && p.score >= PHONE_CONFIDENCE_THRESHOLD);
        console.log('[Proctoring] Object pass:', predictions.map((p) => `${p.class} (${p.score.toFixed(2)})`));

        if (phones.length >= 1 && now - phoneLastReportRef.current > VIOLATION_REPORT_COOLDOWN_MS) {
          phoneLastReportRef.current = now;
          reportSecurityEvent('PHONE_DETECTED', { confidence: Math.max(...phones.map((p) => p.score)) });
          captureAndUploadSnapshot();
        }
      } catch (e) {
        console.error('[Proctoring] object detect() threw:', e);
      }
    }

    // ---- face count (BlazeFace) ----
    if (faceModel) {
      try {
        const faces = await faceModel.estimateFaces(video, false);
        const confidentFaces = (faces || []).filter((f) => {
          const prob = Array.isArray(f.probability) ? f.probability[0] : f.probability;
          return prob == null || prob >= FACE_CONFIDENCE_THRESHOLD;
        });
        const faceCount = confidentFaces.length;
        console.log('[Proctoring] Face pass: count =', faceCount);

        if (faceCount >= 2 && now - multiFaceLastReportRef.current > VIOLATION_REPORT_COOLDOWN_MS) {
          multiFaceLastReportRef.current = now;
          reportSecurityEvent('MULTIPLE_FACES', { face_count: faceCount });
          captureAndUploadSnapshot();
        }

        if (faceCount === 0) {
          noFaceStreakRef.current += 1;
          if (noFaceStreakRef.current === NO_FACE_STREAK_REQUIRED) {
            reportSecurityEvent('NO_FACE', {});
          }
        } else {
          noFaceStreakRef.current = 0;
        }
      } catch (e) {
        console.error('[Proctoring] face estimateFaces() threw:', e);
      }
    }
  }, [reportSecurityEvent, captureAndUploadSnapshot]);

  useEffect(() => {
    if (phase !== 'active') return undefined;
    const id = setInterval(runObjectDetection, OBJECT_DETECTION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase, runObjectDetection]);

  /* ---- audio proctoring (loud-noise volume gate, reports immediately) ---- */
  useEffect(() => {
    if (phase !== 'active' || !cameraLive || !mediaStreamRef.current) return undefined;
    const audioTracks = mediaStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) return undefined;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;

    let audioCtx;
    let source;
    let analyser;
    try {
      audioCtx = new AudioContextClass();
      source = audioCtx.createMediaStreamSource(mediaStreamRef.current);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      console.log('[Proctoring] Audio monitoring started.');
    } catch (e) {
      console.warn('[Proctoring] Could not start audio monitoring:', e);
      return undefined;
    }

    const dataArray = new Uint8Array(analyser.fftSize);

    let logTickCount = 0;
    const id = setInterval(() => {
      analyser.getByteTimeDomainData(dataArray);
      let sumSquares = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);
      const now = Date.now();

      logTickCount += 1;
      if (logTickCount % 4 === 0) {
        console.log(`[Proctoring] Audio RMS: ${rms.toFixed(4)} (threshold: ${AUDIO_LOUD_THRESHOLD})`);
      }

      // Fires on the very first loud reading -- no sustained-duration
      // requirement -- so it reacts immediately like phone/face
      // detection. Cooldown still prevents the same ongoing noise from
      // spamming repeat events.
      if (rms >= AUDIO_LOUD_THRESHOLD && now - audioLastReportRef.current > VIOLATION_REPORT_COOLDOWN_MS) {
        audioLastReportRef.current = now;
        console.log('[Proctoring] SUSPICIOUS_AUDIO reported at RMS', rms.toFixed(4));
        reportSecurityEvent('SUSPICIOUS_AUDIO', { rms: Number(rms.toFixed(3)) });
      }
    }, AUDIO_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(id);
      try {
        source.disconnect();
        analyser.disconnect();
        audioCtx.close().catch(() => {});
      } catch (e) { /* already torn down */ }
      audioContextRef.current = null;
    };
  }, [phase, cameraLive, reportSecurityEvent]);

  async function handleEnterFullscreen() {
    setGateError('');
    setIsRequestingMedia(true);
    try {
      await requestCameraAndMic();
    } catch (e) {
      setIsRequestingMedia(false);
      setGateError('Camera and microphone access is required for this assessment. Please allow both and try again.');
      return;
    }
    setIsRequestingMedia(false);

    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      stopMediaStream();
      setGateError('Could not enter fullscreen. Please allow fullscreen for this site and try again.');
      return;
    }
    setPhase('loading');
    try {
      const sessionData = await apiRequest(`/assessments/${assessmentId}/start-session`, { method: 'POST' });
      const qData = await apiRequest(`/assessments/${assessmentId}/questions`);
      setSession(sessionData);
      setQuestions(qData);
      setAnswers(sessionData.answers || {});
      setCurrentIndex(sessionData.current_question || 0);

      const initialLangs = {};
      const seededAnswers = { ...(sessionData.answers || {}) };
      (qData || []).forEach((q) => {
        if (q.type === 'coding' && !seededAnswers[q.id]) {
          const defaultLang = q.allowed_languages ? q.allowed_languages[0] : 'python';
          initialLangs[q.id] = defaultLang;
          seededAnswers[q.id] = { code: q.starter_code?.[defaultLang] || '', language: defaultLang };
        } else if (q.type === 'coding' && seededAnswers[q.id]) {
          initialLangs[q.id] = seededAnswers[q.id].language || (q.allowed_languages ? q.allowed_languages[0] : 'python');
        }
      });
      setLanguages(initialLangs);
      setAnswers(seededAnswers);

      const expires = parseUtcDate(sessionData.expires_at).getTime();
      setSecondsRemaining(Math.max(0, Math.floor((expires - Date.now()) / 1000)));
      setPhase('active');
    } catch (e) {
      stopMediaStream();
      setGateError(e.message || 'Could not start the assessment session.');
      setPhase('gate');
    }
  }

  useEffect(() => {
    function onFsChange() {
      const isFs = !!document.fullscreenElement;
      setFullscreenActive(isFs);
      if (!isFs && phaseRef.current === 'active') {
        reportSecurityEvent('FULLSCREEN_EXIT', {});
      }
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [reportSecurityEvent]);

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden' && phaseRef.current === 'active') {
        reportSecurityEvent('TAB_SWITCH', { visibilityState: 'hidden' });
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [reportSecurityEvent]);

  useEffect(() => {
    function onBlur() {
      if (phaseRef.current !== 'active') return;
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = setTimeout(() => {
        if (document.hasFocus()) return;
        reportSecurityEvent('WINDOW_BLUR', {});
      }, BLUR_DEBOUNCE_MS);
    }
    function onFocus() {
      clearTimeout(blurTimerRef.current);
    }
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      clearTimeout(blurTimerRef.current);
    };
  }, [reportSecurityEvent]);

  useEffect(() => {
    function onCopyOrCut(e) {
      if (phaseRef.current !== 'active') return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      showToast('Copy/paste is disabled during the assessment.');
    }
    function onContextMenu(e) {
      if (phaseRef.current !== 'active') return;
      e.preventDefault();
    }
    function onDragStart(e) {
      if (phaseRef.current !== 'active') return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
    }
    function onKeyDown(e) {
      if (phaseRef.current !== 'active') return;
      const isDevtoolsCombo = DEVTOOLS_KEY_COMBOS.some((test) => test(e));
      if (isDevtoolsCombo) {
        e.preventDefault();
        reportSecurityEvent('SUSPICIOUS_KEYBOARD_ACTION', { key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey });
        return;
      }
      if (!isEditableTarget(e.target) && e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        showToast('Copy/paste is disabled during the assessment.');
      }
    }
    document.addEventListener('copy', onCopyOrCut);
    document.addEventListener('cut', onCopyOrCut);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('copy', onCopyOrCut);
      document.removeEventListener('cut', onCopyOrCut);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [reportSecurityEvent]);

  useEffect(() => {
    function onBeforeUnload(e) {
      if (phaseRef.current !== 'active') return;
      reportSecurityEvent('PAGE_RELOAD', {});
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [reportSecurityEvent]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = setInterval(async () => {
      try {
        const hb = await apiRequest(`/assessments/${assessmentId}/heartbeat`, { method: 'POST' });
        if (!hb.valid) {
          if (!finishingRef.current) {
            finishingRef.current = true;
            setFinalResult({ kind: 'TIMEOUT', score: null, reason: 'Time limit reached.' });
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            stopMediaStream();
            setPhase('done');
          }
        } else if (hb.seconds_remaining != null) {
          setSecondsRemaining(hb.seconds_remaining);
        }
      } catch (e) { /* transient network hiccup -- next tick will retry */ }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase, assessmentId]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev == null) return prev;
        if (prev <= 1) {
          finalize('TIMEOUT', 'Time limit reached.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, finalize]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = setInterval(() => {
      apiRequest(`/assessments/${assessmentId}/autosave`, {
        method: 'POST',
        body: { answers: answersRef.current, current_question: currentIndexRef.current },
      }).catch(() => {});
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phase, assessmentId]);

  function setAnswer(qid, value) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function computeAttemptSummary() {
    let attemptedCount = 0, unattemptedCount = 0, marksAttempted = 0, marksUnattempted = 0;
    questions.forEach((qq) => {
      const a = answers[qq.id];
      if (isQuestionAnswered(qq, a)) {
        attemptedCount += 1;
        marksAttempted += qq.marks || 0;
      } else {
        unattemptedCount += 1;
        marksUnattempted += qq.marks || 0;
      }
    });
    return { attemptedCount, unattemptedCount, marksAttempted, marksUnattempted, totalQuestions: questions.length };
  }

  async function handleConfirmSubmit() {
    setIsSubmitting(true);
    await finalize('MANUAL', '');
  }

  function goToQuestion(idx) {
    apiRequest(`/assessments/${assessmentId}/autosave`, {
      method: 'POST',
      body: { answers: answersRef.current, current_question: idx },
    }).catch(() => {});
    setCurrentIndex(idx);
    setRunResults(null);
    setPrivateResults(null);
  }

  async function handleRunCode(q) {
    setIsRunning(true);
    setRunResults(null);
    try {
      const currentAns = answers[q.id] || { code: '', language: languages[q.id] || 'python' };
      const res = await apiRequest('/assessments/code/run', {
        method: 'POST',
        body: { questionId: q.id, language: currentAns.language || 'python', code: currentAns.code || '', testCases: q.visible_test_cases || [] },
      });
      setRunResults(res);
    } catch (e) {
      showToast(e.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  }

  async function handleExecuteCode(q) {
    setIsExecuting(true);
    setPrivateResults(null);
    try {
      const currentAns = answers[q.id] || { code: '', language: languages[q.id] || 'python' };
      const res = await apiRequest('/assessments/code/execute', {
        method: 'POST',
        body: { questionId: q.id, language: currentAns.language || 'python', code: currentAns.code || '' },
      });
      setPrivateResults(res);
    } catch (e) {
      showToast(e.message || 'Execution error');
    } finally {
      setIsExecuting(false);
    }
  }

  function handleEditorKeyDown(e, qid, lang) {
    const key = e.key;
    if (key !== 'Tab' && key !== 'Enter') return;

    const textarea = e.target;
    const { value, selectionStart, selectionEnd } = textarea;
    e.preventDefault();

    const commit = (newValue, caretPos) => {
      setAnswer(qid, { code: newValue, language: lang });
      requestAnimationFrame(() => {
        textarea.selectionStart = caretPos;
        textarea.selectionEnd = caretPos;
      });
    };

    if (key === 'Tab') {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      if (e.shiftKey) {
        const lineText = value.slice(lineStart, selectionStart);
        const stripMatch = lineText.match(/^ {1,4}/);
        const stripLen = stripMatch ? stripMatch[0].length : 0;
        if (stripLen === 0) return;
        const newValue = value.slice(0, lineStart) + lineText.slice(stripLen) + value.slice(selectionStart);
        commit(newValue, selectionStart - stripLen);
      } else {
        const newValue = value.slice(0, selectionStart) + EDITOR_INDENT + value.slice(selectionEnd);
        commit(newValue, selectionStart + EDITOR_INDENT.length);
      }
      return;
    }

    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLine = value.slice(lineStart, selectionStart);
    const baseIndentMatch = currentLine.match(/^[ \t]*/);
    let indent = baseIndentMatch ? baseIndentMatch[0] : '';
    if (/[{([]$/.test(currentLine.trim())) {
      indent += EDITOR_INDENT;
    }
    const insertion = '\n' + indent;
    const newValue = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
    commit(newValue, selectionStart + insertion.length);
  }

  const totalSeconds = session ? session.duration_minutes * 60 : null;

  let body = null;

  if (phase === 'gate') {
    body = <FullscreenGate onEnter={handleEnterFullscreen} popupError={gateError} isRequesting={isRequestingMedia} />;
  } else if (phase === 'loading') {
    body = (
      <div className="loading-shell">
        <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
        &nbsp;Setting up your session
      </div>
    );
  } else if (phase === 'done') {
    body = <FinalScreen kind={finalResult?.kind || 'MANUAL'} score={finalResult?.score} reason={finalResult?.reason} />;
  } else if (phase === 'active' && questions) {
    const q = questions[currentIndex];
    const isCoding = q.type === 'coding';
    const mcqIndices = questions.map((qq, i) => ({ q: qq, i })).filter((x) => x.q.type === 'mcq');
    const fbIndices = questions.map((qq, i) => ({ q: qq, i })).filter((x) => x.q.type === 'fill_blank');
    const codingIndices = questions.map((qq, i) => ({ q: qq, i })).filter((x) => x.q.type === 'coding');

    const answeredState = (idx) => {
      const qq = questions[idx];
      const a = answers[qq.id];
      return isQuestionAnswered(qq, a);
    };

    const sectionLabel = q.type === 'mcq' ? 'Multiple choice' : q.type === 'fill_blank' ? 'Fill in the blank' : 'Coding';
    const marksLabel = `${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}`;

    body = (
      <>
        <div className="exam-header">
          <div className="header-left">
            <div className="brand-block">
              <span className="brand-eyebrow">Secure session</span>
              <span className="qcounter">Q {String(currentIndex + 1).padStart(2, '0')}<span className="slash"> / {questions.length}</span></span>
            </div>
            <div className="chip-row">
              <span className="section-chip">{sectionLabel}</span>
              <span className="marks-chip">{marksLabel}</span>
            </div>
            <div className="status-row">
              <StatusItem label="Secure" on tone="accent" />
              <StatusItem label={fullscreenActive ? 'Fullscreen' : 'Fullscreen off'} on={fullscreenActive} tone={fullscreenActive ? 'good' : 'bad'} />
              <StatusItem label={cameraLive ? 'Camera on' : 'Camera off'} on={cameraLive} tone={cameraLive ? 'good' : 'bad'} />
              <StatusItem label="Monitoring" on tone="good" />
            </div>
          </div>
          <div className="header-right">
            <div className={`self-view ${cameraLive ? '' : 'is-off'}`} title={cameraLive ? 'Your camera (self-view)' : 'Camera disconnected'}>
              <video ref={videoRef} autoPlay playsInline muted />
              <span className="self-view-badge" />
            </div>
            <ChronometerRing seconds={secondsRemaining} totalSeconds={totalSeconds} />
          </div>
        </div>

        <Perforation />

        <div className="key-rail">
          {[
            { label: 'MCQ', items: mcqIndices },
            { label: 'Fill blank', items: fbIndices },
            { label: 'Coding', items: codingIndices },
          ].map((section) => section.items.length > 0 && (
            <div key={section.label}>
              <div className="key-group-label">{section.label}</div>
              <div className="key-group-keys">
                {section.items.map(({ i }) => (
                  <button
                    key={i}
                    className={`key-btn ${i === currentIndex ? 'is-current' : answeredState(i) ? 'is-answered' : ''}`}
                    onClick={() => goToQuestion(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {toastMsg && <div className="exam-toast">{toastMsg}</div>}

        <div className="exam-body">
          {isCoding ? (
            <div className="coding-grid">
              <div className="data-sheet is-coding">
                <div className="sheet-index">Problem {String(currentIndex + 1).padStart(2, '0')} of {questions.length}</div>
                <h3 className="sheet-title">{q.question}</h3>
                <div className="meta-row">
                  <span className={`diff-stamp ${(q.difficulty || 'medium').toLowerCase()}`}>{q.difficulty || 'Medium'}</span>
                  <span className="marks-chip">{marksLabel}</span>
                </div>
                <div className="sheet-body">{q.problem_statement}</div>
                {q.input_format && (
                  <div className="sheet-field">
                    <span className="sheet-field-label">Input format</span>
                    <div className="sheet-field-value">{q.input_format}</div>
                  </div>
                )}
                {q.output_format && (
                  <div className="sheet-field">
                    <span className="sheet-field-label">Output format</span>
                    <div className="sheet-field-value">{q.output_format}</div>
                  </div>
                )}
                {q.constraints && (
                  <div className="sheet-field">
                    <span className="sheet-field-label">Constraints</span>
                    <div className="sheet-field-value mono">{q.constraints}</div>
                  </div>
                )}
                {q.examples?.map((ex, idx) => (
                  <div key={idx} className="sheet-example">
                    <div className="ex-in">Input: {ex.input}</div>
                    <div className="ex-out">Output: {ex.output}</div>
                    {ex.explanation && <div className="ex-note">{ex.explanation}</div>}
                  </div>
                ))}
              </div>

              <div className="terminal-panel">
                <div className="terminal-topbar">
                  <span className="terminal-label">Code editor</span>
                  <select
                    className="lang-select"
                    value={languages[q.id] || 'python'}
                    onChange={(e) => {
                      const lang = e.target.value;
                      setLanguages((p) => ({ ...p, [q.id]: lang }));
                      setAnswer(q.id, { code: q.starter_code?.[lang] || '', language: lang });
                    }}
                  >
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>

                <CodeEditor
                  value={answers[q.id]?.code || ''}
                  onChange={(e) => setAnswer(q.id, { code: e.target.value, language: languages[q.id] || 'python' })}
                  onKeyDown={(e) => handleEditorKeyDown(e, q.id, languages[q.id] || 'python')}
                />

                <div className="btn-row">
                  <button className="run-btn" onClick={() => handleRunCode(q)} disabled={isRunning}>
                    {isRunning ? 'Running…' : 'Run sample tests'}
                  </button>
                  <button className="execute-btn" onClick={() => handleExecuteCode(q)} disabled={isExecuting}>
                    {isExecuting ? 'Checking…' : 'Check private tests'}
                  </button>
                </div>
                <div className="execute-hint">
                  {q.hidden_test_count ? `Run checks the ${q.visible_test_cases?.length || 0} sample tests. Check runs all ${q.hidden_test_count} private tests (inputs stay hidden). Neither one submits the assessment.` : "Run checks the sample tests. Check runs the private tests used for grading. Neither one submits the assessment."}
                </div>

                {runResults && (
                  <div className="results-ledger">
                    <div className="results-summary">
                      {runResults.passed}/{runResults.total} passed · {runResults.runtime}
                    </div>
                    {runResults.compile_error && <div className="results-compile-error">{runResults.compile_error}</div>}
                    {(runResults.results || []).map((r, idx) => (
                      <div key={idx} className={`result-row ${r.passed ? 'pass' : 'fail'}`}>
                        {r.passed ? 'Pass' : 'Fail'} — Test case {idx + 1}
                      </div>
                    ))}
                  </div>
                )}

                {privateResults && (
                  <div className="private-ledger">
                    <div className="private-summary">
                      {privateResults.passed}/{privateResults.total} private tests passed
                    </div>
                    {privateResults.compile_error && <div className="results-compile-error">{privateResults.compile_error}</div>}
                    {(privateResults.results || []).map((r, idx) => (
                      <div key={idx} className={`private-row ${r.passed ? 'pass' : 'fail'}`}>
                        {r.passed ? 'Pass' : 'Fail'} — Test case {idx + 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="solo-wrap">
              <div className="data-sheet is-solo">
                <div className="sheet-index">Question {String(currentIndex + 1).padStart(2, '0')} of {questions.length}</div>
                <div className="meta-row">
                  <span className="marks-chip">{marksLabel}</span>
                  {q.difficulty && <span className={`diff-stamp ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>}
                </div>
                <div className={q.type === 'mcq' ? 'mcq-question' : 'fb-question'}>{q.question}</div>
                {q.type === 'mcq' ? (
                  <div className="mcq-list">
                    {(q.options || []).map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <div key={opt} className={`mcq-option ${isSelected ? 'is-selected' : ''}`} onClick={() => setAnswer(q.id, opt)}>
                          <span className="mcq-marker" />
                          <span className="mcq-option-text">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    className="fb-input"
                    placeholder="Type your answer here…"
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          <div className="exam-footer">
            <button className="nav-btn prev" disabled={currentIndex === 0} onClick={() => goToQuestion(currentIndex - 1)}>Previous</button>
            {currentIndex < questions.length - 1 ? (
              <button className="nav-btn next" onClick={() => goToQuestion(currentIndex + 1)}>Next question</button>
            ) : (
              <button className="nav-btn submit" onClick={() => setShowSubmitConfirm(true)}>Submit assessment</button>
            )}
          </div>
        </div>

        {showSubmitConfirm && (() => {
          const summary = computeAttemptSummary();
          return (
            <div className="confirm-overlay">
              <div className="confirm-panel">
                <h2 className="confirm-title">Submit this assessment?</h2>
                <p className="confirm-subtitle">Review your progress before submitting.</p>
                <div className="confirm-stats">
                  <div className="confirm-stat-row attempted">
                    <span className="confirm-stat-label">Attempted</span>
                    <span className="confirm-stat-value">{summary.attemptedCount} / {summary.totalQuestions} questions · {summary.marksAttempted} marks</span>
                  </div>
                  <div className="confirm-stat-row unattempted">
                    <span className="confirm-stat-label">Not attempted</span>
                    <span className="confirm-stat-value">{summary.unattemptedCount} / {summary.totalQuestions} questions · {summary.marksUnattempted} marks</span>
                  </div>
                </div>
                <p className="confirm-warning">
                  {summary.unattemptedCount > 0
                    ? "Unattempted questions score zero. Once submitted, you can't come back and answer them."
                    : "Every question has been attempted. This is your final submission — it can't be undone."}
                </p>
                <div className="confirm-actions">
                  <button className="confirm-cancel" onClick={() => setShowSubmitConfirm(false)} disabled={isSubmitting}>Go back</button>
                  <button className="confirm-confirm" onClick={handleConfirmSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting…' : 'Confirm submit'}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </>
    );
  }

  return (
    <div className="exam-root">
      <style>{SEC_STYLES}</style>
      {body}
    </div>
  );
}












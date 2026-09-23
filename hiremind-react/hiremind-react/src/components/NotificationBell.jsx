// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { apiRequest } from '../api';
// import { useToast } from '../context/ToastContext';
// import Icon from './Icon';

// /* ============================================================
//    NOTIFICATION TYPE ICON
//    ============================================================ */

// function formatNotificationDateTime(value) {
//   if (!value) return '';

//   const raw = String(value).trim();

//   // Backend is sending UTC without timezone information.
//   // If timezone is already present, keep it unchanged.
//   const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);

//   const utcValue = hasTimezone
//     ? raw
//     : `${raw.replace(' ', 'T')}Z`;

//   const date = new Date(utcValue);

//   if (Number.isNaN(date.getTime())) return '';

//   return new Intl.DateTimeFormat('en-IN', {
//     timeZone: 'Asia/Kolkata',
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: true,
//   }).format(date);
// }



// function NotificationTypeIcon({ message }) {
//   const text = (message || '').toLowerCase();

//   // Rejected
//   if (text.includes('rejected')) {
//     return (
//       <div className="notification-type-icon notification-rejected">
//         <svg viewBox="0 0 24 24" fill="none">
//           <path
//             d="M6 6L18 18M18 6L6 18"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//           />
//         </svg>
//       </div>
//     );
//   }

//   // Selected
//   if (text.includes('selected')) {
//     return (
//       <div className="notification-type-icon notification-selected">
//         <svg viewBox="0 0 24 24" fill="none">
//           <path
//             d="M20 6L9 17L4 12"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       </div>
//     );
//   }

//   // Interview
//   if (text.includes('interview')) {
//     return (
//       <div className="notification-type-icon notification-interview">
//         <svg viewBox="0 0 24 24" fill="none">
//           <rect
//             x="3"
//             y="4"
//             width="18"
//             height="17"
//             rx="3"
//             stroke="currentColor"
//             strokeWidth="1.8"
//           />

//           <path
//             d="M16 2V6M8 2V6M3 10H21"
//             stroke="currentColor"
//             strokeWidth="1.8"
//             strokeLinecap="round"
//           />

//           <path
//             d="M8 14H8.01M12 14H12.01M16 14H16.01"
//             stroke="currentColor"
//             strokeWidth="2.5"
//             strokeLinecap="round"
//           />
//         </svg>
//       </div>
//     );
//   }

//   // AI Screening
//   if (text.includes('screening')) {
//     return (
//       <div className="notification-type-icon notification-screening">
//         <svg viewBox="0 0 24 24" fill="none">
//           <path
//             d="M12 3L14.2 8.8L20 11L14.2 13.2L12 19L9.8 13.2L4 11L9.8 8.8L12 3Z"
//             stroke="currentColor"
//             strokeWidth="1.8"
//             strokeLinejoin="round"
//           />
//         </svg>
//       </div>
//     );
//   }

//   // Default
//   return (
//     <div className="notification-type-icon notification-default">
//       <svg viewBox="0 0 24 24" fill="none">
//         <path
//           d="M18 8A6 6 0 006 8C6 15 3 15 3 17H21C21 15 18 15 18 8Z"
//           stroke="currentColor"
//           strokeWidth="1.8"
//           strokeLinejoin="round"
//         />

//         <path
//           d="M10 21H14"
//           stroke="currentColor"
//           strokeWidth="1.8"
//           strokeLinecap="round"
//         />
//       </svg>
//     </div>
//   );
// }


// /* ============================================================
//    NOTIFICATION BELL
//    ============================================================ */

// export default function NotificationBell() {

//   const [open, setOpen] = useState(false);
//   const [unread, setUnread] = useState(0);
//   const [notes, setNotes] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   const wrapRef = useRef(null);

//   const toast = useToast();


//   /* ============================================================
//      REFRESH UNREAD COUNT
//      ============================================================ */

//   const refreshBadge = useCallback(async () => {
//     try {
//       const data = await apiRequest(
//         '/notifications/mine/unread-count'
//       );

//       setUnread(data.unread || 0);

//     } catch (_) {
//       // Silent
//     }
//   }, []);


//   /* ============================================================
//      INITIAL BADGE + AUTO REFRESH
//      ============================================================ */

//   useEffect(() => {

//     refreshBadge();

//     const id = setInterval(
//       refreshBadge,
//       20000
//     );

//     return () => clearInterval(id);

//   }, [refreshBadge]);


//   /* ============================================================
//      CLOSE WHEN CLICKING OUTSIDE
//      ============================================================ */

//   useEffect(() => {

//     function onDocClick(e) {

//       if (
//         wrapRef.current &&
//         !wrapRef.current.contains(e.target)
//       ) {
//         setOpen(false);
//       }

//     }

//     document.addEventListener(
//       'click',
//       onDocClick
//     );

//     return () => {
//       document.removeEventListener(
//         'click',
//         onDocClick
//       );
//     };

//   }, []);


//   /* ============================================================
//      LOAD NOTIFICATIONS
//      ============================================================ */

//   const loadNotes = useCallback(async () => {

//     setLoading(true);

//     try {

//       const data = await apiRequest(
//         '/notifications/mine'
//       );

//       setNotes(data);

//     } catch (_) {

//       setNotes([]);

//     } finally {

//       setLoading(false);

//     }

//   }, []);


//   /* ============================================================
//      TOGGLE NOTIFICATION PANEL
//      ============================================================ */

//   async function toggle() {

//     const next = !open;

//     setOpen(next);

//     if (next) {
//       setSearchQuery('');
//       await loadNotes();
//     }

//   }


//   /* ============================================================
//      MARK SINGLE NOTIFICATION READ
//      ============================================================ */

//   async function markRead(id, e) {

//     if (e) {
//       e.stopPropagation();
//     }

//     try {

//       await apiRequest(
//         `/notifications/${id}/read`,
//         {
//           method: 'PATCH'
//         }
//       );

//       setNotes(prev =>
//         prev.map(n =>
//           n.id === id
//             ? { ...n, is_read: true }
//             : n
//         )
//       );

//       refreshBadge();

//     } catch (_) {
//       // Silent
//     }

//   }


//   /* ============================================================
//      DELETE NOTIFICATION
//      ============================================================ */

//   async function deleteNotification(id, e) {

//     e.stopPropagation();

//     try {

//       await apiRequest(
//         `/notifications/${id}`,
//         {
//           method: 'DELETE'
//         }
//       );

//       setNotes(prev =>
//         prev.filter(n => n.id !== id)
//       );

//       refreshBadge();

//       toast(
//         'Notification removed',
//         'success'
//       );

//     } catch (_) {

//       toast(
//         'Could not delete notification',
//         'error'
//       );

//     }

//   }


//   /* ============================================================
//      MARK ALL READ
//      ============================================================ */

//   async function markAllRead() {

//     try {

//       await apiRequest(
//         '/notifications/read-all',
//         {
//           method: 'PATCH'
//         }
//       );

//       await loadNotes();

//       refreshBadge();

//     } catch (_) {

//       toast(
//         'Could not mark notifications read',
//         'error'
//       );

//     }

//   }


//   /* ============================================================
//      FILTERED NOTIFICATIONS
//      ============================================================ */

//   const filteredNotes = useMemo(() => {
//     if (!notes) return [];
//     if (!searchQuery.trim()) return notes;
//     const q = searchQuery.toLowerCase().trim();
//     return notes.filter((n) => {
//       const msg = (n.message || '').toLowerCase();
//       const dateStr = new Date(n.created_at).toLocaleString().toLowerCase();
//       return msg.includes(q) || dateStr.includes(q);
//     });
//   }, [notes, searchQuery]);


//   /* ============================================================
//      JSX
//      ============================================================ */

//   return (

//     <div
//       className="notif-bell-wrap"
//       ref={wrapRef}
//     >

//       <style>{`

//         /* =====================================================
//            BELL BUTTON
//            ===================================================== */

//         .notif-bell-wrap {
//           position: relative;
//           display: inline-block;
//         }

//         .notif-bell-btn {

//           position: relative;

//           width: 42px;
//           height: 42px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           background:
//             linear-gradient(
//               145deg,
//               rgba(30, 20, 56, .90),
//               rgba(8, 12, 27, .98)
//             );

//           border: 1px solid
//             rgba(139, 92, 246, .35);

//           border-radius: 12px;

//           color: #cbd5e1;

//           cursor: pointer;

//           transition:
//             transform .25s ease,
//             border-color .25s ease,
//             box-shadow .25s ease,
//             color .25s ease;

//           box-shadow:
//             0 8px 25px rgba(0,0,0,.35),
//             inset 0 0 20px
//               rgba(139,92,246,.04);

//           overflow: visible;
//         }

//         .notif-bell-btn:hover {

//           transform: translateY(-1px);

//           color: #ffffff;

//           border-color:
//             rgba(168,85,247,.8);

//           box-shadow:
//             0 10px 30px
//               rgba(139,92,246,.25),
//             inset 0 0 20px
//               rgba(139,92,246,.08);
//         }


//         /* =====================================================
//            UNREAD BADGE
//            ===================================================== */

//         .notif-unread-badge {

//           position: absolute;

//           top: -6px;
//           right: -6px;

//           min-width: 19px;
//           height: 19px;

//           padding: 0 5px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           background:
//             linear-gradient(
//               135deg,
//               #ef4444,
//               #ec4899
//             );

//           color: white;

//           font-family: monospace;

//           font-size: 10px;
//           font-weight: 800;

//           border-radius: 10px;

//           border: 2px solid #080b18;

//           box-shadow:
//             0 3px 12px
//               rgba(239,68,68,.55);

//           z-index: 10;

//           pointer-events: none;
//         }


//         /* =====================================================
//            DROPDOWN
//            ===================================================== */

//         .notif-dropdown-pane {

//           position: absolute;

//           right: 0;

//           top: calc(100% + 12px);

//           width: 430px;

//           max-width:
//             calc(100vw - 24px);

//           background:

//             radial-gradient(
//               circle at 90% 0%,
//               rgba(168,85,247,.10),
//               transparent 32%
//             ),

//             linear-gradient(
//               145deg,
//               rgba(16,19,40,.98),
//               rgba(7,10,23,.99)
//             );

//           border:
//             1px solid
//             rgba(139,92,246,.38);

//           border-radius: 20px;

//           overflow: hidden;

//           z-index: 99999;

//           backdrop-filter: blur(22px);

//           box-shadow:

//             0 30px 80px
//               rgba(0,0,0,.70),

//             0 0 45px
//               rgba(139,92,246,.12),

//             inset 0 1px 0
//               rgba(255,255,255,.05);

//           animation:
//             notifSlideDown
//             .22s cubic-bezier(
//               .16,1,.3,1
//             );
//         }


//         @keyframes notifSlideDown {

//           from {
//             opacity: 0;
//             transform:
//               translateY(-10px)
//               scale(.97);
//           }

//           to {
//             opacity: 1;
//             transform:
//               translateY(0)
//               scale(1);
//           }

//         }


//         /* =====================================================
//            HEADER
//            ===================================================== */

//         .notif-dropdown-header {

//           height: 66px;

//           padding:
//             0 18px 0 22px;

//           display: flex;
//           align-items: center;
//           justify-content: space-between;

//           border-bottom:
//             1px solid
//             rgba(255,255,255,.07);

//           background:
//             linear-gradient(
//               90deg,
//               rgba(139,92,246,.08),
//               transparent
//             );
//         }


//         .notif-title-wrap {

//           display: flex;
//           align-items: center;

//           gap: 10px;
//         }


//         .notif-title-dot {

//           width: 8px;
//           height: 8px;

//           border-radius: 50%;

//           background:
//             linear-gradient(
//               135deg,
//               #a855f7,
//               #ec4899
//             );

//           box-shadow:
//             0 0 12px
//               rgba(168,85,247,.8);
//         }


//         .notif-title {

//           font-family:
//             var(--font-display, Inter, sans-serif);

//           font-size: 16px;

//           font-weight: 800;

//           color: #f8fafc;

//           letter-spacing: -.2px;
//         }


//         .notif-count {

//           font-family:
//             var(--font-mono, monospace);

//           font-size: 10px;

//           color: #94a3b8;

//           margin-left: 4px;
//         }


//         .notif-mark-all {

//           border: 1px solid
//             rgba(139,92,246,.25);

//           background:
//             rgba(139,92,246,.08);

//           color: #c4b5fd;

//           font-size: 11px;

//           font-weight: 700;

//           padding:
//             7px 11px;

//           border-radius: 9px;

//           cursor: pointer;

//           transition: all .2s ease;
//         }


//         .notif-mark-all:hover {

//           color: white;

//           border-color:
//             rgba(168,85,247,.55);

//           background:
//             rgba(139,92,246,.18);

//           box-shadow:
//             0 0 18px
//               rgba(139,92,246,.12);
//         }


//         /* =====================================================
//            SEARCH BAR
//            ===================================================== */

//         .notif-search-container {
//           padding: 12px 18px 4px 18px;
//           border-bottom: 1px solid rgba(255,255,255,0.05);
//           background: rgba(12, 10, 24, 0.4);
//         }

//         .notif-search-input-box {
//           position: relative;
//           width: 100%;
//           display: flex;
//           align-items: center;
//         }

//         .notif-search-input-box input {
//           width: 100%;
//           background: rgba(12, 10, 24, 0.9);
//           border: 1.5px solid rgba(139, 92, 246, 0.35);
//           border-radius: 12px;
//           padding: 10px 36px 10px 42px;
//           color: #fff;
//           font-size: 13px;
//           box-sizing: border-box;
//           outline: none;
//           font-family: Inter, sans-serif;
//           transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
//           box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
//           height: 40px;
//         }

//         .notif-search-input-box input:focus {
//           border-color: rgba(168, 85, 247, 0.9);
//           box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.3);
//         }

//         .notif-search-icon-badge {
//           position: absolute;
//           left: 10px;
//           top: 0;
//           bottom: 0;
//           margin: auto;
//           width: 26px;
//           height: 26px;
//           border-radius: 8px;
//           background: rgba(139, 92, 246, 0.15);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #c084fc;
//           pointer-events: none;
//         }


//         /* =====================================================
//            SCROLL AREA
//            ===================================================== */

//         .notif-scroll-area {

//           max-height: 380px;

//           overflow-y: auto;

//           scrollbar-width: thin;

//           scrollbar-color:
//             rgba(139,92,246,.45)
//             transparent;
//         }


//         .notif-scroll-area::-webkit-scrollbar {
//           width: 5px;
//         }


//         .notif-scroll-area::-webkit-scrollbar-track {
//           background: transparent;
//         }


//         .notif-scroll-area::-webkit-scrollbar-thumb {

//           background:
//             linear-gradient(
//               #8b5cf6,
//               #ec4899
//             );

//           border-radius: 10px;
//         }


//         /* ======================================================
//           NOTIFICATION ROWS
//         ====================================================== */

//         .notif-row-item {
//           position: relative;

//           display: flex;
//           align-items: flex-start;
//           gap: 14px;

//           padding: 18px 18px 18px 20px;

//           border-bottom: 1px solid rgba(255, 255, 255, 0.055);

//           cursor: pointer;

//           transition:
//             background 0.2s ease,
//             transform 0.2s ease;
//         }

//         /* EVEN ROW */
//         .notif-row-item:nth-child(even) {
//           background:
//             linear-gradient(
//               90deg,
//               rgba(30, 27, 75, 0.48),
//               rgba(18, 20, 43, 0.72)
//             );
//         }

//         /* ODD ROW */
//         .notif-row-item:nth-child(odd) {
//           background:
//             linear-gradient(
//               90deg,
//               rgba(12, 18, 38, 0.72),
//               rgba(8, 12, 27, 0.90)
//             );
//         }

//         /* HOVER */
//         .notif-row-item:hover {
//           background:
//             linear-gradient(
//               90deg,
//               rgba(124, 58, 237, 0.18),
//               rgba(236, 72, 153, 0.06),
//               rgba(10, 14, 30, 0.85)
//             );

//           transform: translateX(2px);
//         }

//         /* UNREAD ODD */
//         .notif-row-item.unread-row:nth-child(odd) {
//           background:
//             linear-gradient(
//               90deg,
//               rgba(88, 28, 135, 0.16),
//               rgba(17, 20, 43, 0.88)
//             );
//         }

//         /* UNREAD EVEN */
//         .notif-row-item.unread-row:nth-child(even) {
//           background:
//             linear-gradient(
//               90deg,
//               rgba(67, 56, 202, 0.18),
//               rgba(25, 24, 55, 0.88)
//             );
//         }

//         /* UNREAD LEFT ACCENT */
//         .notif-row-item.unread-row::before {
//           content: '';

//           position: absolute;

//           left: 0;
//           top: 14px;
//           bottom: 14px;

//           width: 3px;

//           border-radius: 0 5px 5px 0;

//           background:
//             linear-gradient(
//               180deg,
//               #8b5cf6,
//               #ec4899
//             );

//           box-shadow:
//             0 0 12px rgba(168, 85, 247, 0.55);
//         }


//         /* =====================================================
//            TYPE ICON
//            ===================================================== */

//         .notification-type-icon {

//           width: 50px;
//           height: 50px;

//           min-width: 50px;

//           border-radius: 15px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           position: relative;

//           background:
//             rgba(15,23,42,.78);

//           border:
//             1px solid
//             rgba(148,163,184,.16);

//           box-shadow:
//             inset 0 0 20px
//               rgba(255,255,255,.015),

//             0 8px 25px
//               rgba(0,0,0,.18);

//           transition:
//             transform .25s ease,
//             border-color .25s ease,
//             box-shadow .25s ease;
//         }


//         .notification-type-icon svg {

//           width: 24px;
//           height: 24px;

//         }


//         .notification-screening {

//           color: #c084fc;

//           border-color:
//             rgba(168,85,247,.45);

//           background:
//             linear-gradient(
//               145deg,
//               rgba(168,85,247,.15),
//               rgba(79,70,229,.04)
//             );

//           box-shadow:
//             0 0 25px
//               rgba(168,85,247,.13),

//             inset 0 0 18px
//               rgba(168,85,247,.06);
//         }


//         .notification-selected {

//           color: #22d3ee;

//           border-color:
//             rgba(34,211,238,.45);

//           background:
//             linear-gradient(
//               145deg,
//               rgba(34,211,238,.13),
//               rgba(16,185,129,.04)
//             );

//           box-shadow:
//             0 0 25px
//               rgba(34,211,238,.12);
//         }


//         .notification-rejected {

//           color: #fb7185;

//           border-color:
//             rgba(244,63,94,.48);

//           background:
//             linear-gradient(
//               145deg,
//               rgba(244,63,94,.13),
//               rgba(127,29,29,.04)
//             );

//           box-shadow:
//             0 0 25px
//               rgba(244,63,94,.12);
//         }


//         .notification-interview {

//           color: #60a5fa;

//           border-color:
//             rgba(59,130,246,.48);

//           background:
//             linear-gradient(
//               145deg,
//               rgba(59,130,246,.14),
//               rgba(37,99,235,.04)
//             );

//           box-shadow:
//             0 0 25px
//               rgba(59,130,246,.12);
//         }


//         .notification-default {

//           color: #a78bfa;

//           border-color:
//             rgba(139,92,246,.4);
//         }


//         .notif-row-item:hover
//         .notification-type-icon {

//           transform:
//             translateY(-2px)
//             scale(1.035);
//         }


//         /* =====================================================
//            CONTENT
//            ===================================================== */

//         .notif-content {

//           flex: 1;

//           min-width: 0;

//           padding-top: 1px;
//         }


//         .notif-row-msg {

//           font-family:
//             var(--font-display, Inter, sans-serif);

//           font-size: 13px;

//           line-height: 1.48;

//           font-weight: 650;

//           color: #e2e8f0;

//           letter-spacing: -.05px;

//           overflow-wrap: anywhere;
//         }


//         .notif-row-item:hover
//         .notif-row-msg {

//           color: #ffffff;
//         }


//         .notif-row-time {

//           display: flex;

//           align-items: center;

//           margin-top: 8px;

//           font-family:
//             var(--font-mono, monospace);

//           font-size: 10px;

//           color: #71809b;

//           letter-spacing: .15px;
//         }


//         .notif-calendar {

//           color: #a78bfa;

//           font-size: 12px;

//           margin-right: 7px;

//           opacity: .9;
//         }


//         /* =====================================================
//            DELETE BUTTON
//            ===================================================== */

//         .notif-delete-btn {

//           width: 32px;
//           height: 32px;

//           min-width: 32px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           border-radius: 9px;

//           border: 1px solid
//             transparent;

//           background: transparent;

//           color: #64748b;

//           cursor: pointer;

//           opacity: .55;

//           transition:
//             opacity .2s ease,
//             color .2s ease,
//             background .2s ease,
//             border-color .2s ease,
//             transform .2s ease;
//         }


//         .notif-row-item:hover
//         .notif-delete-btn {

//           opacity: 1;
//         }


//         .notif-delete-btn:hover {

//           color: #fb7185;

//           background:
//             rgba(244,63,94,.10);

//           border-color:
//             rgba(244,63,94,.25);

//           transform: scale(1.05);

//           box-shadow:
//             0 0 16px
//               rgba(244,63,94,.12);
//         }


//         /* =====================================================
//            EMPTY / LOADING
//            ===================================================== */

//         .notif-empty-state {

//           min-height: 180px;

//           display: flex;

//           align-items: center;
//           justify-content: center;

//           flex-direction: column;

//           padding: 30px 20px;

//           text-align: center;

//           color: #64748b;

//           font-family:
//             var(--font-mono, monospace);

//           font-size: 12px;
//         }


//         .notif-empty-icon {

//           width: 42px;
//           height: 42px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           border-radius: 13px;

//           margin-bottom: 12px;

//           color: #a78bfa;

//           background:
//             rgba(139,92,246,.08);

//           border:
//             1px solid
//             rgba(139,92,246,.2);
//         }


//         /* =====================================================
//            MOBILE
//            ===================================================== */

//         @media (max-width: 520px) {

//           .notif-dropdown-pane {

//             position: fixed;

//             top: 70px;

//             left: 12px;
//             right: 12px;

//             width: auto;

//             max-width: none;

//             border-radius: 18px;
//           }

//           .notif-row-item {

//             padding:
//               14px 12px 14px 15px;

//           }

//           .notification-type-icon {

//             width: 44px;
//             height: 44px;
//             min-width: 44px;

//             border-radius: 13px;
//           }

//           .notification-type-icon svg {

//             width: 21px;
//             height: 21px;
//           }

//         }

//       `}</style>


//       {/* ======================================================
//           BELL BUTTON
//           ====================================================== */}

//       <button
//         className="notif-bell-btn"
//         onClick={toggle}
//         title="Notifications"
//         aria-label="Notifications"
//       >

//         <Icon
//           name="bell"
//           size={18}
//         />

//         {unread > 0 && (

//           <span className="notif-unread-badge">

//             {unread > 9
//               ? '9+'
//               : unread}

//           </span>

//         )}

//       </button>


//       {/* ======================================================
//           NOTIFICATION PANEL
//           ====================================================== */}

//       {open && (

//         <div className="notif-dropdown-pane">


//           {/* HEADER */}

//           <div className="notif-dropdown-header">

//             <div className="notif-title-wrap">

//               <span className="notif-title-dot" />

//               <span className="notif-title">
//                 Notifications
//               </span>

//               {notes.length > 0 && (

//                 <span className="notif-count">
//                   {notes.length}
//                 </span>

//               )}

//             </div>


//             <button
//               className="notif-mark-all"
//               onClick={markAllRead}
//             >
//               Mark all read
//             </button>

//           </div>


//           {/* SEARCH BAR */}

//           <div className="notif-search-container">
//             <div className="notif-search-input-box">
//               <span className="notif-search-icon-badge">
//                 <Icon name="search" size={13} />
//               </span>
//               <input
//                 type="text"
//                 placeholder="Search notifications..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => setSearchQuery('')}
//                   style={{
//                     position: 'absolute',
//                     right: '10px',
//                     top: '0',
//                     bottom: '0',
//                     margin: 'auto',
//                     background: 'rgba(255,255,255,0.06)',
//                     border: '1px solid rgba(255,255,255,0.1)',
//                     color: '#94a3b8',
//                     borderRadius: '6px',
//                     width: '20px',
//                     height: '20px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     cursor: 'pointer',
//                     fontSize: '10px'
//                   }}
//                   title="Clear search"
//                 >
//                   ✕
//                 </button>
//               )}
//             </div>
//           </div>


//           {/* NOTIFICATIONS */}

//           <div className="notif-scroll-area">

//             {loading && (

//               <div className="notif-empty-state">

//                 Loading notifications...

//               </div>

//             )}


//             {!loading &&
//               notes.length === 0 && (

//                 <div className="notif-empty-state">

//                   <div className="notif-empty-icon">

//                     <Icon
//                       name="bell"
//                       size={20}
//                     />

//                   </div>

//                   You're all caught up! ✨

//                 </div>

//               )}


//             {!loading &&
//               notes.length > 0 &&
//               filteredNotes.length === 0 && (

//                 <div className="notif-empty-state">
//                   No matching notifications found.
//                 </div>

//               )}


//             {!loading &&
//               filteredNotes.map((n) => (

//                 <div
//                   key={n.id}
//                   className={
//                     `notif-row-item ${n.is_read
//                       ? ''
//                       : 'unread-row'
//                     }`
//                   }
//                   onClick={(e) =>
//                     markRead(n.id, e)
//                   }
//                 >


//                   {/* LEFT ICON */}

//                   <NotificationTypeIcon
//                     message={n.message}
//                   />


//                   {/* MESSAGE */}

//                   <div className="notif-content">

//                     <div className="notif-row-msg">
//                       {n.message}
//                     </div>

//                     <div className="notif-row-time">

//                       <span className="notif-calendar">
//                         ▦
//                       </span>

//                       {/* {new Date(
//                         n.created_at
//                       ).toLocaleString()} */}

//                       {formatNotificationDateTime(n.created_at)}

//                     </div>

//                   </div>


//                   {/* DELETE */}

//                   <button
//                     className="notif-delete-btn"
//                     onClick={(e) =>
//                       deleteNotification(
//                         n.id,
//                         e
//                       )
//                     }
//                     title="Delete notification"
//                     aria-label="Delete notification"
//                   >

//                     <Icon
//                       name="trash"
//                       size={15}
//                     />

//                   </button>

//                 </div>

//               ))}

//           </div>

//         </div>

//       )}

//     </div>

//   );
// }










import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { apiRequest } from '../api';
import { useToast } from '../context/ToastContext';
import Icon from './Icon';

/* ============================================================
   DATE / TIME HELPERS
   ============================================================ */

function formatNotificationDateTime(value) {
  if (!value) return '';

  const raw = String(value).trim();

  // Backend is sending UTC without timezone information.
  // If timezone is already present, keep it unchanged.
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);

  const utcValue = hasTimezone
    ? raw
    : `${raw.replace(' ', 'T')}Z`;

  const date = new Date(utcValue);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}


const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// Only reschedule notifications carry a UTC time in the message text.
// All other notifications are returned exactly as received.
function formatNotificationMessage(message) {
  if (!message) return '';

  const isRescheduleMessage = /interview schedule was updated/i.test(message);
  if (!isRescheduleMessage) return message;

  return message.replace(
    /(\d{1,2})\s([A-Za-z]{3})\s(\d{4}),\s(\d{1,2}):(\d{2})\s?(AM|PM)/gi,
    (match, d, mon, y, h, m, ap) => {
      const month = MONTHS[mon.toLowerCase()];
      if (month === undefined) return match;

      let hour = Number(h) % 12;
      if (ap.toUpperCase() === 'PM') hour += 12;

      // The time in a reschedule message is UTC
      const date = new Date(
        Date.UTC(Number(y), month, Number(d), hour, Number(m))
      );
      if (Number.isNaN(date.getTime())) return match;

      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
          .formatToParts(date)
          .map((p) => [p.type, p.value])
      );

      return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} ${parts.dayPeriod.toUpperCase()}`;
    }
  );
}


/* ============================================================
   NOTIFICATION TYPE ICON
   ============================================================ */

function NotificationTypeIcon({ message }) {
  const text = (message || '').toLowerCase();

  // Rejected
  if (text.includes('rejected')) {
    return (
      <div className="notification-type-icon notification-rejected">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Selected
  if (text.includes('selected')) {
    return (
      <div className="notification-type-icon notification-selected">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Interview
  if (text.includes('interview')) {
    return (
      <div className="notification-type-icon notification-interview">
        <svg viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="17"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <path
            d="M16 2V6M8 2V6M3 10H21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          <path
            d="M8 14H8.01M12 14H12.01M16 14H16.01"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // AI Screening
  if (text.includes('screening')) {
    return (
      <div className="notification-type-icon notification-screening">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L14.2 8.8L20 11L14.2 13.2L12 19L9.8 13.2L4 11L9.8 8.8L12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // Default
  return (
    <div className="notification-type-icon notification-default">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8A6 6 0 006 8C6 15 3 15 3 17H21C21 15 18 15 18 8Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        <path
          d="M10 21H14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}


/* ============================================================
   NOTIFICATION BELL
   ============================================================ */

export default function NotificationBell() {

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const wrapRef = useRef(null);

  const toast = useToast();


  /* ============================================================
     REFRESH UNREAD COUNT
     ============================================================ */

  const refreshBadge = useCallback(async () => {
    try {
      const data = await apiRequest(
        '/notifications/mine/unread-count'
      );

      setUnread(data.unread || 0);

    } catch (_) {
      // Silent
    }
  }, []);


  /* ============================================================
     INITIAL BADGE + AUTO REFRESH
     ============================================================ */

  useEffect(() => {

    refreshBadge();

    const id = setInterval(
      refreshBadge,
      20000
    );

    return () => clearInterval(id);

  }, [refreshBadge]);


  /* ============================================================
     CLOSE WHEN CLICKING OUTSIDE
     ============================================================ */

  useEffect(() => {

    function onDocClick(e) {

      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target)
      ) {
        setOpen(false);
      }

    }

    document.addEventListener(
      'click',
      onDocClick
    );

    return () => {
      document.removeEventListener(
        'click',
        onDocClick
      );
    };

  }, []);


  /* ============================================================
     LOAD NOTIFICATIONS
     ============================================================ */

  const loadNotes = useCallback(async () => {

    setLoading(true);

    try {

      const data = await apiRequest(
        '/notifications/mine'
      );

      setNotes(data);

    } catch (_) {

      setNotes([]);

    } finally {

      setLoading(false);

    }

  }, []);


  /* ============================================================
     TOGGLE NOTIFICATION PANEL
     ============================================================ */

  async function toggle() {

    const next = !open;

    setOpen(next);

    if (next) {
      setSearchQuery('');
      await loadNotes();
    }

  }


  /* ============================================================
     MARK SINGLE NOTIFICATION READ
     ============================================================ */

  async function markRead(id, e) {

    if (e) {
      e.stopPropagation();
    }

    try {

      await apiRequest(
        `/notifications/${id}/read`,
        {
          method: 'PATCH'
        }
      );

      setNotes(prev =>
        prev.map(n =>
          n.id === id
            ? { ...n, is_read: true }
            : n
        )
      );

      refreshBadge();

    } catch (_) {
      // Silent
    }

  }


  /* ============================================================
     DELETE NOTIFICATION
     ============================================================ */

  async function deleteNotification(id, e) {

    e.stopPropagation();

    try {

      await apiRequest(
        `/notifications/${id}`,
        {
          method: 'DELETE'
        }
      );

      setNotes(prev =>
        prev.filter(n => n.id !== id)
      );

      refreshBadge();

      toast(
        'Notification removed',
        'success'
      );

    } catch (_) {

      toast(
        'Could not delete notification',
        'error'
      );

    }

  }


  /* ============================================================
     MARK ALL READ
     ============================================================ */

  async function markAllRead() {

    try {

      await apiRequest(
        '/notifications/read-all',
        {
          method: 'PATCH'
        }
      );

      await loadNotes();

      refreshBadge();

    } catch (_) {

      toast(
        'Could not mark notifications read',
        'error'
      );

    }

  }


  /* ============================================================
     FILTERED NOTIFICATIONS
     ============================================================ */

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase().trim();
    return notes.filter((n) => {
      const msg = formatNotificationMessage(n.message).toLowerCase();
      const dateStr = formatNotificationDateTime(n.created_at).toLowerCase();
      return msg.includes(q) || dateStr.includes(q);
    });
  }, [notes, searchQuery]);


  /* ============================================================
     JSX
     ============================================================ */

  return (

    <div
      className="notif-bell-wrap"
      ref={wrapRef}
    >

      <style>{`

        /* =====================================================
           BELL BUTTON
           ===================================================== */

        .notif-bell-wrap {
          position: relative;
          display: inline-block;
        }

        .notif-bell-btn {

          position: relative;

          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              145deg,
              rgba(30, 20, 56, .90),
              rgba(8, 12, 27, .98)
            );

          border: 1px solid
            rgba(139, 92, 246, .35);

          border-radius: 12px;

          color: #cbd5e1;

          cursor: pointer;

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease,
            color .25s ease;

          box-shadow:
            0 8px 25px rgba(0,0,0,.35),
            inset 0 0 20px
              rgba(139,92,246,.04);

          overflow: visible;
        }

        .notif-bell-btn:hover {

          transform: translateY(-1px);

          color: #ffffff;

          border-color:
            rgba(168,85,247,.8);

          box-shadow:
            0 10px 30px
              rgba(139,92,246,.25),
            inset 0 0 20px
              rgba(139,92,246,.08);
        }


        /* =====================================================
           UNREAD BADGE
           ===================================================== */

        .notif-unread-badge {

          position: absolute;

          top: -6px;
          right: -6px;

          min-width: 19px;
          height: 19px;

          padding: 0 5px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #ef4444,
              #ec4899
            );

          color: white;

          font-family: monospace;

          font-size: 10px;
          font-weight: 800;

          border-radius: 10px;

          border: 2px solid #080b18;

          box-shadow:
            0 3px 12px
              rgba(239,68,68,.55);

          z-index: 10;

          pointer-events: none;
        }


        /* =====================================================
           DROPDOWN
           ===================================================== */

        .notif-dropdown-pane {

          position: absolute;

          right: 0;

          top: calc(100% + 12px);

          width: 430px;

          max-width:
            calc(100vw - 24px);

          background:

            radial-gradient(
              circle at 90% 0%,
              rgba(168,85,247,.10),
              transparent 32%
            ),

            linear-gradient(
              145deg,
              rgba(16,19,40,.98),
              rgba(7,10,23,.99)
            );

          border:
            1px solid
            rgba(139,92,246,.38);

          border-radius: 20px;

          overflow: hidden;

          z-index: 99999;

          backdrop-filter: blur(22px);

          box-shadow:

            0 30px 80px
              rgba(0,0,0,.70),

            0 0 45px
              rgba(139,92,246,.12),

            inset 0 1px 0
              rgba(255,255,255,.05);

          animation:
            notifSlideDown
            .22s cubic-bezier(
              .16,1,.3,1
            );
        }


        @keyframes notifSlideDown {

          from {
            opacity: 0;
            transform:
              translateY(-10px)
              scale(.97);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }


        /* =====================================================
           HEADER
           ===================================================== */

        .notif-dropdown-header {

          height: 66px;

          padding:
            0 18px 0 22px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-bottom:
            1px solid
            rgba(255,255,255,.07);

          background:
            linear-gradient(
              90deg,
              rgba(139,92,246,.08),
              transparent
            );
        }


        .notif-title-wrap {

          display: flex;
          align-items: center;

          gap: 10px;
        }


        .notif-title-dot {

          width: 8px;
          height: 8px;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #a855f7,
              #ec4899
            );

          box-shadow:
            0 0 12px
              rgba(168,85,247,.8);
        }


        .notif-title {

          font-family:
            var(--font-display, Inter, sans-serif);

          font-size: 16px;

          font-weight: 800;

          color: #f8fafc;

          letter-spacing: -.2px;
        }


        .notif-count {

          font-family:
            var(--font-mono, monospace);

          font-size: 10px;

          color: #94a3b8;

          margin-left: 4px;
        }


        .notif-mark-all {

          border: 1px solid
            rgba(139,92,246,.25);

          background:
            rgba(139,92,246,.08);

          color: #c4b5fd;

          font-size: 11px;

          font-weight: 700;

          padding:
            7px 11px;

          border-radius: 9px;

          cursor: pointer;

          transition: all .2s ease;
        }


        .notif-mark-all:hover {

          color: white;

          border-color:
            rgba(168,85,247,.55);

          background:
            rgba(139,92,246,.18);

          box-shadow:
            0 0 18px
              rgba(139,92,246,.12);
        }


        /* =====================================================
           SEARCH BAR
           ===================================================== */

        .notif-search-container {
          padding: 12px 18px 4px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(12, 10, 24, 0.4);
        }

        .notif-search-input-box {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .notif-search-input-box input {
          width: 100%;
          background: rgba(12, 10, 24, 0.9);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 10px 36px 10px 42px;
          color: #fff;
          font-size: 13px;
          box-sizing: border-box;
          outline: none;
          font-family: Inter, sans-serif;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
          height: 40px;
        }

        .notif-search-input-box input:focus {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.3);
        }

        .notif-search-icon-badge {
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          pointer-events: none;
        }


        /* =====================================================
           SCROLL AREA
           ===================================================== */

        .notif-scroll-area {

          max-height: 380px;

          overflow-y: auto;

          scrollbar-width: thin;

          scrollbar-color:
            rgba(139,92,246,.45)
            transparent;
        }


        .notif-scroll-area::-webkit-scrollbar {
          width: 5px;
        }


        .notif-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }


        .notif-scroll-area::-webkit-scrollbar-thumb {

          background:
            linear-gradient(
              #8b5cf6,
              #ec4899
            );

          border-radius: 10px;
        }


        /* ======================================================
          NOTIFICATION ROWS
        ====================================================== */

        .notif-row-item {
          position: relative;

          display: flex;
          align-items: flex-start;
          gap: 14px;

          padding: 18px 18px 18px 20px;

          border-bottom: 1px solid rgba(255, 255, 255, 0.055);

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        /* EVEN ROW */
        .notif-row-item:nth-child(even) {
          background:
            linear-gradient(
              90deg,
              rgba(30, 27, 75, 0.48),
              rgba(18, 20, 43, 0.72)
            );
        }

        /* ODD ROW */
        .notif-row-item:nth-child(odd) {
          background:
            linear-gradient(
              90deg,
              rgba(12, 18, 38, 0.72),
              rgba(8, 12, 27, 0.90)
            );
        }

        /* HOVER */
        .notif-row-item:hover {
          background:
            linear-gradient(
              90deg,
              rgba(124, 58, 237, 0.18),
              rgba(236, 72, 153, 0.06),
              rgba(10, 14, 30, 0.85)
            );

          transform: translateX(2px);
        }

        /* UNREAD ODD */
        .notif-row-item.unread-row:nth-child(odd) {
          background:
            linear-gradient(
              90deg,
              rgba(88, 28, 135, 0.16),
              rgba(17, 20, 43, 0.88)
            );
        }

        /* UNREAD EVEN */
        .notif-row-item.unread-row:nth-child(even) {
          background:
            linear-gradient(
              90deg,
              rgba(67, 56, 202, 0.18),
              rgba(25, 24, 55, 0.88)
            );
        }

        /* UNREAD LEFT ACCENT */
        .notif-row-item.unread-row::before {
          content: '';

          position: absolute;

          left: 0;
          top: 14px;
          bottom: 14px;

          width: 3px;

          border-radius: 0 5px 5px 0;

          background:
            linear-gradient(
              180deg,
              #8b5cf6,
              #ec4899
            );

          box-shadow:
            0 0 12px rgba(168, 85, 247, 0.55);
        }


        /* =====================================================
           TYPE ICON
           ===================================================== */

        .notification-type-icon {

          width: 50px;
          height: 50px;

          min-width: 50px;

          border-radius: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;

          background:
            rgba(15,23,42,.78);

          border:
            1px solid
            rgba(148,163,184,.16);

          box-shadow:
            inset 0 0 20px
              rgba(255,255,255,.015),

            0 8px 25px
              rgba(0,0,0,.18);

          transition:
            transform .25s ease,
            border-color .25s ease,
            box-shadow .25s ease;
        }


        .notification-type-icon svg {

          width: 24px;
          height: 24px;

        }


        .notification-screening {

          color: #c084fc;

          border-color:
            rgba(168,85,247,.45);

          background:
            linear-gradient(
              145deg,
              rgba(168,85,247,.15),
              rgba(79,70,229,.04)
            );

          box-shadow:
            0 0 25px
              rgba(168,85,247,.13),

            inset 0 0 18px
              rgba(168,85,247,.06);
        }


        .notification-selected {

          color: #22d3ee;

          border-color:
            rgba(34,211,238,.45);

          background:
            linear-gradient(
              145deg,
              rgba(34,211,238,.13),
              rgba(16,185,129,.04)
            );

          box-shadow:
            0 0 25px
              rgba(34,211,238,.12);
        }


        .notification-rejected {

          color: #fb7185;

          border-color:
            rgba(244,63,94,.48);

          background:
            linear-gradient(
              145deg,
              rgba(244,63,94,.13),
              rgba(127,29,29,.04)
            );

          box-shadow:
            0 0 25px
              rgba(244,63,94,.12);
        }


        .notification-interview {

          color: #60a5fa;

          border-color:
            rgba(59,130,246,.48);

          background:
            linear-gradient(
              145deg,
              rgba(59,130,246,.14),
              rgba(37,99,235,.04)
            );

          box-shadow:
            0 0 25px
              rgba(59,130,246,.12);
        }


        .notification-default {

          color: #a78bfa;

          border-color:
            rgba(139,92,246,.4);
        }


        .notif-row-item:hover
        .notification-type-icon {

          transform:
            translateY(-2px)
            scale(1.035);
        }


        /* =====================================================
           CONTENT
           ===================================================== */

        .notif-content {

          flex: 1;

          min-width: 0;

          padding-top: 1px;
        }


        .notif-row-msg {

          font-family:
            var(--font-display, Inter, sans-serif);

          font-size: 13px;

          line-height: 1.48;

          font-weight: 650;

          color: #e2e8f0;

          letter-spacing: -.05px;

          overflow-wrap: anywhere;
        }


        .notif-row-item:hover
        .notif-row-msg {

          color: #ffffff;
        }


        .notif-row-time {

          display: flex;

          align-items: center;

          margin-top: 8px;

          font-family:
            var(--font-mono, monospace);

          font-size: 10px;

          color: #71809b;

          letter-spacing: .15px;
        }


        .notif-calendar {

          color: #a78bfa;

          font-size: 12px;

          margin-right: 7px;

          opacity: .9;
        }


        /* =====================================================
           DELETE BUTTON
           ===================================================== */

        .notif-delete-btn {

          width: 32px;
          height: 32px;

          min-width: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          border: 1px solid
            transparent;

          background: transparent;

          color: #64748b;

          cursor: pointer;

          opacity: .55;

          transition:
            opacity .2s ease,
            color .2s ease,
            background .2s ease,
            border-color .2s ease,
            transform .2s ease;
        }


        .notif-row-item:hover
        .notif-delete-btn {

          opacity: 1;
        }


        .notif-delete-btn:hover {

          color: #fb7185;

          background:
            rgba(244,63,94,.10);

          border-color:
            rgba(244,63,94,.25);

          transform: scale(1.05);

          box-shadow:
            0 0 16px
              rgba(244,63,94,.12);
        }


        /* =====================================================
           EMPTY / LOADING
           ===================================================== */

        .notif-empty-state {

          min-height: 180px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-direction: column;

          padding: 30px 20px;

          text-align: center;

          color: #64748b;

          font-family:
            var(--font-mono, monospace);

          font-size: 12px;
        }


        .notif-empty-icon {

          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          margin-bottom: 12px;

          color: #a78bfa;

          background:
            rgba(139,92,246,.08);

          border:
            1px solid
            rgba(139,92,246,.2);
        }


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 520px) {

          .notif-dropdown-pane {

            position: fixed;

            top: 70px;

            left: 12px;
            right: 12px;

            width: auto;

            max-width: none;

            border-radius: 18px;
          }

          .notif-row-item {

            padding:
              14px 12px 14px 15px;

          }

          .notification-type-icon {

            width: 44px;
            height: 44px;
            min-width: 44px;

            border-radius: 13px;
          }

          .notification-type-icon svg {

            width: 21px;
            height: 21px;
          }

        }

      `}</style>


      {/* ======================================================
          BELL BUTTON
          ====================================================== */}

      <button
        className="notif-bell-btn"
        onClick={toggle}
        title="Notifications"
        aria-label="Notifications"
      >

        <Icon
          name="bell"
          size={18}
        />

        {unread > 0 && (

          <span className="notif-unread-badge">

            {unread > 9
              ? '9+'
              : unread}

          </span>

        )}

      </button>


      {/* ======================================================
          NOTIFICATION PANEL
          ====================================================== */}

      {open && (

        <div className="notif-dropdown-pane">


          {/* HEADER */}

          <div className="notif-dropdown-header">

            <div className="notif-title-wrap">

              <span className="notif-title-dot" />

              <span className="notif-title">
                Notifications
              </span>

              {notes.length > 0 && (

                <span className="notif-count">
                  {notes.length}
                </span>

              )}

            </div>


            <button
              className="notif-mark-all"
              onClick={markAllRead}
            >
              Mark all read
            </button>

          </div>


          {/* SEARCH BAR */}

          <div className="notif-search-container">
            <div className="notif-search-input-box">
              <span className="notif-search-icon-badge">
                <Icon name="search" size={13} />
              </span>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '0',
                    bottom: '0',
                    margin: 'auto',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8',
                    borderRadius: '6px',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>


          {/* NOTIFICATIONS */}

          <div className="notif-scroll-area">

            {loading && (

              <div className="notif-empty-state">

                Loading notifications...

              </div>

            )}


            {!loading &&
              notes.length === 0 && (

                <div className="notif-empty-state">

                  <div className="notif-empty-icon">

                    <Icon
                      name="bell"
                      size={20}
                    />

                  </div>

                  You're all caught up! ✨

                </div>

              )}


            {!loading &&
              notes.length > 0 &&
              filteredNotes.length === 0 && (

                <div className="notif-empty-state">
                  No matching notifications found.
                </div>

              )}


            {!loading &&
              filteredNotes.map((n) => (

                <div
                  key={n.id}
                  className={
                    `notif-row-item ${n.is_read
                      ? ''
                      : 'unread-row'
                    }`
                  }
                  onClick={(e) =>
                    markRead(n.id, e)
                  }
                >


                  {/* LEFT ICON */}

                  <NotificationTypeIcon
                    message={n.message}
                  />


                  {/* MESSAGE */}

                  <div className="notif-content">

                    <div className="notif-row-msg">
                      {formatNotificationMessage(n.message)}
                    </div>

                    <div className="notif-row-time">

                      <span className="notif-calendar">
                        ▦
                      </span>

                      {formatNotificationDateTime(n.created_at)}

                    </div>

                  </div>


                  {/* DELETE */}

                  <button
                    className="notif-delete-btn"
                    onClick={(e) =>
                      deleteNotification(
                        n.id,
                        e
                      )
                    }
                    title="Delete notification"
                    aria-label="Delete notification"
                  >

                    <Icon
                      name="trash"
                      size={15}
                    />

                  </button>

                </div>

              ))}

          </div>

        </div>

      )}

    </div>

  );
}

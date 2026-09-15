



// import { useState, useEffect, useMemo } from 'react';
// import { apiRequest } from '../../api';
// import { useToast } from '../../context/ToastContext';
// import Icon from '../../components/Icon';
// import Modal from '../../components/Modal';

// const TYPE_COLOR = { hr: 'violet', technical: 'blue', behavioral: 'teal' };

// function formatTime24Hour(isoString) {
//   if (!isoString) return '';
//   if (isoString.includes('T')) {
//     const timePart = isoString.split('T')[1].replace('Z', '').split('.')[0];
//     const [h, m] = timePart.split(':');
//     const hourNum = parseInt(h, 10);
//     const minute = m || '00';
//     const ampm = hourNum >= 12 ? 'pm' : 'am';
//     const hour12 = hourNum % 12 || 12;
//     return `${hour12}:${minute} ${ampm}`;
//   }
//   const d = new Date(isoString);
//   return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
// }

// function formatFullInterviewDate(isoString) {
//   if (!isoString) return '';
//   if (isoString.includes('T')) {
//     const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
//     const d = new Date(year, month - 1, day);
//     return d.toLocaleDateString('en-GB', {
//       weekday: 'long',
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//     });
//   }
//   const d = new Date(isoString);
//   return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
// }

// function formatDateIndian(isoString) {
//   if (!isoString) return '';
//   if (isoString.includes('T')) {
//     const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
//     return `${day}/${month}/${year}`;
//   }
//   const d = new Date(isoString);
//   return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' });
// }

// function getGoogleCalendarUrl(interview, jobTitle) {
//   if (!interview || !interview.scheduled_at) return '#';
//   try {
//     const start = new Date(interview.scheduled_at);
//     const end = new Date(start.getTime() + 45 * 60 * 1000);
//     const formatGDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
//     const title = encodeURIComponent(`${interview.interview_type?.toUpperCase()} Interview - ${jobTitle}`);
//     const details = encodeURIComponent(
//       `Interview scheduled on HireMind.\nType: ${interview.interview_type}\nJoin Link: ${interview.meeting_link || 'Provided prior to call'}\nNotes: ${interview.notes || 'None'}`
//     );
//     return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGDate(start)}/${formatGDate(end)}&details=${details}`;
//   } catch {
//     return '#';
//   }
// }

// function MiniCalendar({ scheduledAt }) {
//   let year, month, dayNum;

//   if (scheduledAt && scheduledAt.includes('T')) {
//     const [y, m, d] = scheduledAt.split('T')[0].split('-').map(Number);
//     year = y;
//     month = m - 1;
//     dayNum = d;
//   } else {
//     const d = new Date(scheduledAt);
//     year = d.getFullYear();
//     month = d.getMonth();
//     dayNum = d.getDate();
//   }

//   const firstDayIndex = new Date(year, month, 1).getDay();
//   const totalDays = new Date(year, month + 1, 0).getDate();

//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December',
//   ];
//   const monthName = monthNames[month];

//   const days = [];
//   for (let i = 0; i < firstDayIndex; i++) days.push(null);
//   for (let i = 1; i <= totalDays; i++) days.push(i);

//   return (
//     <div className="cal-card-wrapper">
//       <div className="cal-header-row">
//         <div className="cal-month-title">
//           <span className="cal-header-icon">
//             <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
//               <line x1="16" y1="2" x2="16" y2="6" />
//               <line x1="8" y1="2" x2="8" y2="6" />
//               <line x1="3" y1="10" x2="21" y2="10" />
//             </svg>
//           </span>
//           {monthName} {year}
//         </div>
//         <div className="cal-schedule-pill">Schedule</div>
//       </div>

//       <div className="cal-days-header">
//         <span className="weekend-label">SU</span>
//         <span>MO</span>
//         <span>TU</span>
//         <span>WE</span>
//         <span>TH</span>
//         <span>FR</span>
//         <span className="weekend-label">SA</span>
//       </div>

//       <div className="cal-grid">
//         {days.map((day, idx) => {
//           const isSelected = day === dayNum;
//           const colIndex = idx % 7;
//           const isWeekend = (colIndex === 0 || colIndex === 6) && !isSelected;

//           let cellClass = 'cal-day-cell';
//           if (isSelected) cellClass += ' day-interview-active';
//           if (isWeekend) cellClass += ' day-weekend';

//           return (
//             <div key={idx} className={cellClass}>
//               {day || ''}
//               {isSelected && <span className="cal-dot dot-orange" />}
//             </div>
//           );
//         })}
//       </div>

//       <div className="cal-legend-wrapper">
//         <span className="legend-dot" />
//         <span>Interview Day</span>
//       </div>
//     </div>
//   );
// }

// export default function Interviews() {
//   const [interviews, setInterviews] = useState(null);
//   const [jobMap, setJobMap] = useState({});
//   const [selectedInterview, setSelectedInterview] = useState(null);
//   const [showCalendarModal, setShowCalendarModal] = useState(false);
//   const [calendarTarget, setCalendarTarget] = useState(null);
//   const [showAllModal, setShowAllModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [modalSearchQuery, setModalSearchQuery] = useState('');
//   const [activeTab, setActiveTab] = useState('ALL');

//   // Reschedule state
//   const [rescheduleTarget, setRescheduleTarget] = useState(null);
//   const [rescheduleSlot1, setRescheduleSlot1] = useState('');
//   const [rescheduleSlot2, setRescheduleSlot2] = useState('');
//   const [rescheduleReason, setRescheduleReason] = useState('');
//   const [submittingReschedule, setSubmittingReschedule] = useState(false);

//   // AI Prep Practice State
//   const [prepTarget, setPrepTarget] = useState(null);
//   const [mockAnswer, setMockAnswer] = useState('');
//   const [aiTip, setAiTip] = useState('');

//   const toast = useToast();

//   const loadData = () => {
//     apiRequest('/interviews/mine').then(setInterviews).catch(() => setInterviews([]));
//     apiRequest('/jobs')
//       .then((jobs) => {
//         const map = {};
//         (jobs || []).forEach((j) => {
//           map[j.id] = j.title;
//         });
//         setJobMap(map);
//       })
//       .catch(() => {});
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   async function handleSendReschedule(e) {
//     e.preventDefault();
//     if (!rescheduleSlot1.trim() || !rescheduleReason.trim()) {
//       toast('Please enter your primary slot and reason.', 'error');
//       return;
//     }
//     setSubmittingReschedule(true);
//     try {
//       await apiRequest(`/interviews/${rescheduleTarget.id}/reschedule-request`, {
//         method: 'POST',
//         body: {
//           preferred_time_1: rescheduleSlot1.trim(),
//           preferred_time_2: rescheduleSlot2.trim() || undefined,
//           reason: rescheduleReason.trim(),
//         },
//       });
//       toast('Reschedule request sent to the recruiter!', 'success');
//       setRescheduleTarget(null);
//       setRescheduleSlot1('');
//       setRescheduleSlot2('');
//       setRescheduleReason('');
//       loadData();
//     } catch (err) {
//       toast(err.message || 'Could not send request', 'error');
//     } finally {
//       setSubmittingReschedule(false);
//     }
//   }

//   function handleEvaluatePrep() {
//     if (!mockAnswer.trim()) {
//       toast('Please write down your bullet points first', 'error');
//       return;
//     }
//     setAiTip(
//       `Strong answer structure! Recommended enhancement: Frame your answer around an obstacle encountered, your specific technical role, and quantitative results produced.`
//     );
//   }

//   const counts = useMemo(() => {
//     if (!interviews) return { ALL: 0, HR: 0, TECHNICAL: 0, BEHAVIORAL: 0, RESCHEDULE: 0, COMPLETED: 0 };
//     return {
//       ALL: interviews.length,
//       HR: interviews.filter((iv) => iv.interview_type === 'hr').length,
//       TECHNICAL: interviews.filter((iv) => iv.interview_type === 'technical').length,
//       BEHAVIORAL: interviews.filter((iv) => iv.interview_type === 'behavioral').length,
//       RESCHEDULE: interviews.filter((iv) => iv.status === 'reschedule_requested').length,
//       COMPLETED: interviews.filter((iv) => iv.status === 'completed').length,
//     };
//   }, [interviews]);

//   const filteredInterviews = useMemo(() => {
//     if (!interviews) return [];
//     const q = searchQuery.toLowerCase().trim();

//     return interviews.filter((iv) => {
//       const jobTitle = (jobMap[iv.job_id] || iv.job_title || '').toLowerCase();
//       const type = (iv.interview_type || '').toLowerCase();
//       const status = (iv.status || '').toLowerCase();
//       const matchesSearch = !q || jobTitle.includes(q) || type.includes(q) || status.includes(q);

//       let matchesTab = true;
//       if (activeTab === 'HR') matchesTab = iv.interview_type === 'hr';
//       else if (activeTab === 'TECHNICAL') matchesTab = iv.interview_type === 'technical';
//       else if (activeTab === 'BEHAVIORAL') matchesTab = iv.interview_type === 'behavioral';
//       else if (activeTab === 'RESCHEDULE') matchesTab = iv.status === 'reschedule_requested';
//       else if (activeTab === 'COMPLETED') matchesTab = iv.status === 'completed';

//       return matchesSearch && matchesTab;
//     });
//   }, [interviews, searchQuery, activeTab, jobMap]);

//   const modalFilteredInterviews = useMemo(() => {
//     if (!interviews) return [];
//     if (!modalSearchQuery.trim()) return interviews;
//     const q = modalSearchQuery.toLowerCase();
//     return interviews.filter((iv) => {
//       const jobTitle = (jobMap[iv.job_id] || iv.job_title || '').toLowerCase();
//       const type = (iv.interview_type || '').toLowerCase();
//       const status = (iv.status || '').toLowerCase();
//       const dateStr = formatDateIndian(iv.scheduled_at).toLowerCase();
//       return jobTitle.includes(q) || type.includes(q) || status.includes(q) || dateStr.includes(q);
//     });
//   }, [interviews, modalSearchQuery, jobMap]);

//   return (
//     <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
//       <style>{`
//         .modal-close,
//         .modal-box > button:first-child:has(svg),
//         .modal-box .close-btn {
//           display: none !important;
//         }

//         .modal-box {
//           overflow: visible !important;
//           background: transparent !important;
//           border: none !important;
//           padding: 0 !important;
//           box-shadow: none !important;
//         }

//         .interview-listing-row {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
//           border-radius: 18px;
//           padding: 22px 26px;
//           margin-bottom: 18px;
//           transition: all 0.2s ease;
//           box-sizing: border-box;
//         }
//         .interview-listing-row.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .interview-listing-row.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .interview-listing-row.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .interview-listing-row.c-reschedule { border-color: rgba(249, 115, 22, 0.6); background: linear-gradient(135deg, rgba(35, 18, 20, 0.6) 0%, rgba(12, 10, 22, 0.9) 100%); }

//         /* Borderless Segmented Neon Capsule Bar */
//         .neon-capsule-bar {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           padding: 2px 0 12px 0;
//           margin-bottom: 22px;
//           overflow-x: auto;
//           white-space: nowrap;
//           scrollbar-width: none;
//           -webkit-overflow-scrolling: touch;
//           box-sizing: border-box;
//           background: transparent !important;
//           border: none !important;
//           box-shadow: none !important;
//         }
//         .neon-capsule-bar::-webkit-scrollbar { display: none; }

//         /* Glassmorphism Pill Button Matching Screenshot */
//         .neon-pill-btn {
//           position: relative;
//           display: inline-flex;
//           align-items: center;
//           gap: 9px;
//           padding: 8px 16px;
//           border-radius: 9999px;
//           font-family: var(--font-display, inherit);
//           font-size: 11.5px;
//           font-weight: 700;
//           letter-spacing: 0.04em;
//           text-transform: uppercase;
//           cursor: pointer;
//           border: 1px solid transparent;
//           color: #94a3b8;
//           transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
//           user-select: none;
//           flex-shrink: 0;
//         }

//         .neon-icon-badge {
//           width: 22px;
//           height: 22px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 11px;
//           transition: all 0.22s ease;
//         }

//         .neon-count-badge {
//           min-width: 20px;
//           height: 20px;
//           padding: 0 5px;
//           border-radius: 9999px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 10px;
//           font-family: var(--font-mono, monospace);
//           font-weight: 800;
//           background: rgba(255, 255, 255, 0.06);
//           color: #cbd5e1;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           transition: all 0.22s ease;
//         }

//         /* Category Color Variants matching image */
//         .neon-pill-btn.v-violet { border-color: rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.06); }
//         .neon-pill-btn.v-violet .neon-icon-badge { background: rgba(168, 85, 247, 0.2); color: #c084fc; }

//         .neon-pill-btn.v-blue { border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.06); }
//         .neon-pill-btn.v-blue .neon-icon-badge { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }

//         .neon-pill-btn.v-teal { border-color: rgba(45, 212, 191, 0.3); background: rgba(45, 212, 191, 0.06); }
//         .neon-pill-btn.v-teal .neon-icon-badge { background: rgba(45, 212, 191, 0.2); color: #2dd4bf; }

//         .neon-pill-btn.v-orange { border-color: rgba(249, 115, 22, 0.3); background: rgba(249, 115, 22, 0.06); }
//         .neon-pill-btn.v-orange .neon-icon-badge { background: rgba(249, 115, 22, 0.2); color: #fb923c; }

//         .neon-pill-btn:hover:not(.active) {
//           color: #f1f5f9;
//           transform: translateY(-1px);
//           border-color: rgba(255, 255, 255, 0.3);
//         }

//         /* Active glowing states matching reference */
//         .neon-pill-btn.v-violet.active {
//           background: linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(126, 34, 206, 0.55) 100%);
//           border-color: #c084fc;
//           color: #ffffff;
//           box-shadow: 0 0 18px rgba(168, 85, 247, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
//         }
//         .neon-pill-btn.v-blue.active {
//           background: linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(29, 78, 216, 0.55) 100%);
//           border-color: #60a5fa;
//           color: #ffffff;
//           box-shadow: 0 0 18px rgba(59, 130, 246, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
//         }
//         .neon-pill-btn.v-teal.active {
//           background: linear-gradient(135deg, rgba(45, 212, 191, 0.4) 0%, rgba(15, 118, 110, 0.55) 100%);
//           border-color: #2dd4bf;
//           color: #ffffff;
//           box-shadow: 0 0 18px rgba(45, 212, 191, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
//         }
//         .neon-pill-btn.v-orange.active {
//           background: linear-gradient(135deg, rgba(249, 115, 22, 0.4) 0%, rgba(194, 65, 12, 0.55) 100%);
//           border-color: #fb923c;
//           color: #ffffff;
//           box-shadow: 0 0 18px rgba(249, 115, 22, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
//         }

//         .neon-pill-btn.active .neon-icon-badge {
//           background: rgba(255, 255, 255, 0.25);
//           color: #ffffff;
//         }
//         .neon-pill-btn.active .neon-count-badge {
//           background: rgba(0, 0, 0, 0.4);
//           color: #ffffff;
//           border-color: rgba(255, 255, 255, 0.35);
//         }

//         .neon-join-btn {
//           background: linear-gradient(135deg, #10b981 0%, #059669 100%);
//           border: 1px solid rgba(16, 185, 129, 0.6);
//           color: #ffffff;
//           padding: 8px 16px;
//           border-radius: 10px;
//           font-family: var(--font-display);
//           font-weight: 700;
//           font-size: 12px;
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           cursor: pointer;
//           box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
//           text-decoration: none;
//           transition: all 0.2s ease;
//         }
//         .neon-join-btn:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 16px rgba(16, 185, 129, 0.55);
//         }

//         .cal-shortcut-btn {
//           background: rgba(255, 255, 255, 0.05);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           color: #c084fc;
//           padding: 8px 12px;
//           border-radius: 10px;
//           font-family: var(--font-mono);
//           font-size: 11.5px;
//           font-weight: 600;
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           text-decoration: none;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }
//         .cal-shortcut-btn:hover {
//           background: rgba(139, 92, 246, 0.2);
//           border-color: #c084fc;
//           color: #fff;
//         }

//         .interview-arrow-btn {
//           width: 42px;
//           height: 42px;
//           border-radius: 12px;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           display: inline-flex;
//           align-items: center;
//           justify-content: center;
//           color: #cbd5e1;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }
//         .interview-arrow-btn:hover {
//           background: rgba(168, 85, 247, 0.2);
//           border-color: rgba(168, 85, 247, 0.5);
//           color: #fff;
//         }

//         .right-status-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           padding: 9px 16px;
//           border-radius: 12px;
//           font-family: var(--font-mono, monospace);
//           font-size: 12px;
//           font-weight: 600;
//           height: 42px;
//           box-sizing: border-box;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }
//         .c-violet .right-status-badge { background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.35); color: #c084fc; }
//         .c-blue .right-status-badge { background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); color: #60a5fa; }
//         .c-teal .right-status-badge { background: rgba(20, 184, 166, 0.12); border: 1px solid rgba(20, 184, 166, 0.35); color: #2dd4bf; }
//         .c-reschedule .right-status-badge { background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.5); color: #fb923c; }

//         .aesthetic-search-wrapper {
//           background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
//           border-radius: 18px;
//           padding: 16px 20px;
//           margin-bottom: 16px;
//           box-sizing: border-box;
//           width: 100%;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }
//         .aesthetic-search-input-box {
//           position: relative;
//           width: 100%;
//           display: flex;
//           align-items: center;
//         }
//         .aesthetic-search-input-box input {
//           width: 100%;
//           background: rgba(12, 10, 24, 0.9);
//           border: 1.5px solid rgba(139, 92, 246, 0.35);
//           border-radius: 12px;
//           padding: 12px 42px 12px 48px;
//           color: #fff;
//           font-size: 13.5px;
//           box-sizing: border-box;
//           outline: none;
//           font-family: Inter, sans-serif;
//           height: 46px;
//         }
//         .aesthetic-search-icon-badge {
//           position: absolute;
//           left: 10px;
//           top: 0;
//           bottom: 0;
//           margin: auto;
//           width: 28px;
//           height: 28px;
//           border-radius: 8px;
//           background: rgba(139, 92, 246, 0.15);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #c084fc;
//           pointer-events: none;
//         }

//         .atm-modal-container {
//           background: #080d1a;
//           border: 1.5px solid rgba(139, 92, 246, 0.28);
//           border-radius: 24px;
//           padding: 22px 20px 20px;
//           box-shadow: 0 24px 80px rgba(0, 0, 0, 0.95);
//           color: #ffffff;
//           position: relative;
//           box-sizing: border-box;
//           width: 100%;
//         }
//         .atm-top-header {
//           position: relative;
//           text-align: center;
//           margin-bottom: 16px;
//           padding: 0 36px;
//         }
//         .atm-main-title {
//           font-family: var(--font-display, "Inter", sans-serif);
//           font-size: 18px;
//           font-weight: 700;
//           color: #ffffff;
//           margin: 0;
//         }
//         .atm-spark-divider {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 10px;
//           margin-top: 6px;
//         }
//         .atm-spark-line {
//           height: 1px;
//           width: 50px;
//           background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent);
//         }
//         .atm-spark-star {
//           color: #f59e0b;
//           font-size: 10px;
//         }
//         .atm-close-x {
//           position: absolute;
//           right: 0px;
//           top: -2px;
//           width: 30px;
//           height: 30px;
//           border-radius: 9px;
//           background: #141c2e;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           color: #cbd5e1;
//           display: flex !important;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           padding: 0;
//         }
//         .atm-close-x:hover {
//           background: rgba(244, 63, 94, 0.25);
//           color: #ffffff;
//         }

//         .cal-card-wrapper {
//           background: #0b1122;
//           border: 1px solid rgba(139, 92, 246, 0.22);
//           border-radius: 18px;
//           padding: 14px;
//         }
//         .cal-header-row {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 12px;
//         }
//         .cal-month-title {
//           font-family: var(--font-display, sans-serif);
//           font-size: 15px;
//           font-weight: 700;
//           color: #ffffff;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }
//         .cal-schedule-pill {
//           display: inline-flex;
//           align-items: center;
//           gap: 6px;
//           background: rgba(99, 102, 241, 0.12);
//           border: 1px solid rgba(99, 102, 241, 0.3);
//           padding: 4px 10px;
//           border-radius: 9px;
//           font-size: 11px;
//           font-weight: 600;
//           color: #a78bfa;
//         }
//         .cal-days-header {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           text-align: center;
//           font-size: 11.5px;
//           font-weight: 600;
//           color: #64748b;
//           margin-bottom: 6px;
//         }
//         .weekend-label { color: #f87171 !important; }
//         .cal-grid {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           gap: 5px;
//           text-align: center;
//         }
//         .cal-day-cell {
//           height: 36px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           background: rgba(255, 255, 255, 0.02);
//           border: 1px solid rgba(255, 255, 255, 0.04);
//           border-radius: 9px;
//           font-size: 12.5px;
//           color: #cbd5e1;
//           position: relative;
//         }
//         .day-weekend { color: #ef4444; }
//         .day-interview-active {
//           background: linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #f97316 100%) !important;
//           border: 1px solid rgba(249, 115, 22, 0.8) !important;
//           color: #ffffff !important;
//           font-weight: 700 !important;
//           box-shadow: 0 0 16px rgba(217, 70, 239, 0.6) !important;
//         }
//         .cal-dot {
//           width: 4px;
//           height: 4px;
//           border-radius: 50%;
//           position: absolute;
//           bottom: 3px;
//         }
//         .dot-orange { background: #fde047; box-shadow: 0 0 5px #fde047; }
//         .cal-legend-wrapper {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 6px;
//           margin-top: 10px;
//           font-size: 11px;
//           color: #94a3b8;
//           font-family: var(--font-mono, monospace);
//         }
//         .legend-dot {
//           width: 7px;
//           height: 7px;
//           border-radius: 50%;
//           background: #f97316;
//           box-shadow: 0 0 6px #f97316;
//         }

//         .atm-info-card {
//           margin-top: 10px;
//           background: #0b1122;
//           border: 1px solid rgba(139, 92, 246, 0.2);
//           border-radius: 14px;
//           padding: 10px 14px;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }
//         .atm-info-badge {
//           width: 32px;
//           height: 32px;
//           border-radius: 9px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           background: rgba(168, 85, 247, 0.15);
//           color: #c084fc;
//           border: 1px solid rgba(168, 85, 247, 0.3);
//         }
//         .atm-time-block {
//           display: flex;
//           flex-direction: column;
//           gap: 2px;
//           text-align: left;
//         }
//         .atm-label-time {
//           color: #c084fc;
//           font-weight: 600;
//           font-size: 11px;
//           text-transform: uppercase;
//           font-family: var(--font-mono, monospace);
//         }
//         .atm-full-date {
//           color: #ffffff;
//           font-size: 13px;
//           font-weight: 700;
//         }
//         .atm-time-text {
//           color: #94a3b8;
//           font-size: 11.5px;
//           font-family: var(--font-mono, monospace);
//         }

//         .atm-close-button {
//           width: 100%;
//           margin-top: 10px;
//           background: linear-gradient(135deg, #4c1d95 0%, #312e81 100%);
//           border: 1px solid rgba(139, 92, 246, 0.35);
//           border-radius: 10px;
//           padding: 8px 14px;
//           color: #ffffff;
//           font-size: 13px;
//           font-weight: 600;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 6px;
//           cursor: pointer;
//         }

//         @media (max-width: 800px) {
//           .interview-row-layout {
//             flex-direction: column;
//             align-items: flex-start !important;
//             gap: 16px;
//           }
//           .interview-right-actions {
//             width: 100%;
//             justify-content: space-between;
//             border-top: 1px solid rgba(255,255,255,0.06);
//             padding-top: 12px;
//             flex-wrap: wrap;
//           }
//         }
//       `}</style>

//       {/* Page Header */}
//       <div className="page-header" style={{ marginBottom: 18 }}>
//         <div className="page-eyebrow">ATS pipeline</div>
//         <h1 className="page-title"><span className="hl">Interviews</span></h1>
//         <p className="page-sub">Direct access to your scheduled meeting links, Google Calendar sync, and AI mock prep.</p>
//       </div>

//       {/* Search Bar */}
//       <div className="aesthetic-search-wrapper">
//         <div className="aesthetic-search-input-box">
//           <span className="aesthetic-search-icon-badge">
//             <Icon name="search" size={14} />
//           </span>
//           <input
//             type="text"
//             placeholder="Search interviews by role, type (hr, technical), or status..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           {searchQuery && (
//             <button
//               onClick={() => setSearchQuery('')}
//               style={{
//                 position: 'absolute',
//                 right: '12px',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: '1px solid rgba(255,255,255,0.1)',
//                 color: '#94a3b8',
//                 borderRadius: '6px',
//                 width: '24px',
//                 height: '24px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 fontSize: '11px',
//               }}
//               title="Clear search"
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Borderless Segmented Neon Pill Filters Matching Screenshot */}
//       <div className="neon-capsule-bar">
//         {[
//           { id: 'ALL', label: 'All Interviews', variant: 'v-violet', icon: '🗓️', count: counts.ALL },
//           { id: 'HR', label: 'HR Rounds', variant: 'v-violet', icon: '👥', count: counts.HR },
//           { id: 'TECHNICAL', label: 'Technical', variant: 'v-blue', icon: '💻', count: counts.TECHNICAL },
//           { id: 'BEHAVIORAL', label: 'Behavioral', variant: 'v-teal', icon: '🎯', count: counts.BEHAVIORAL },
//           { id: 'RESCHEDULE', label: 'Reschedule Requested', variant: 'v-orange', icon: '⚠️', count: counts.RESCHEDULE },
//           { id: 'COMPLETED', label: 'Completed', variant: 'v-violet', icon: '✓', count: counts.COMPLETED },
//         ].map((tab) => (
//           <button
//             key={tab.id}
//             type="button"
//             className={`neon-pill-btn ${tab.variant} ${activeTab === tab.id ? 'active' : ''}`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             <span className="neon-icon-badge">{tab.icon}</span>
//             <span>{tab.label}</span>
//             <span className="neon-count-badge">{tab.count}</span>
//           </button>
//         ))}
//       </div>

//       {interviews === null && (
//         <>
//           <div className="skeleton sk-row" />
//           <div className="skeleton sk-row" />
//         </>
//       )}

//       {interviews && filteredInterviews.length === 0 && (
//         <div className="card empty-state">
//           <div className="es-icon"><Icon name="interviews" size={22} /></div>
//           <div className="es-title">{interviews.length === 0 ? 'No interviews scheduled' : 'No interviews match your criteria'}</div>
//           <div className="es-sub">Recruiters schedule these once you are shortlisted and pass screening.</div>
//         </div>
//       )}

//       {filteredInterviews.map((iv) => {
//         let day, mon;
//         if (iv.scheduled_at && iv.scheduled_at.includes('T')) {
//           const [y, m, d] = iv.scheduled_at.split('T')[0].split('-').map(Number);
//           day = d;
//           mon = new Date(y, m - 1, d).toLocaleString('default', { month: 'short' }).toUpperCase();
//         } else {
//           const d = new Date(iv.scheduled_at);
//           day = d.getDate();
//           mon = d.toLocaleString('default', { month: 'short' }).toUpperCase();
//         }

//         const time = formatTime24Hour(iv.scheduled_at);
//         const isReschedule = iv.status === 'reschedule_requested';
//         const color = isReschedule ? 'reschedule' : (TYPE_COLOR[iv.interview_type] || 'violet');
//         const jobTitle = jobMap[iv.job_id] || iv.job_title || `Job #${iv.job_id}`;
//         const gCalLink = getGoogleCalendarUrl(iv, jobTitle);

//         return (
//           <div className={`interview-listing-row c-${color}`} key={iv.id}>
//             <div className="interview-row-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 14 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
//                 <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid rgba(139, 92, 246, 0.3)`, borderRadius: '14px', padding: '12px 16px', textAlign: 'center', minWidth: 60, flexShrink: 0 }}>
//                   <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1.1 }}>{day}</div>
//                   <div style={{ fontSize: 10.5, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.8px', marginTop: 3 }}>{mon}</div>
//                 </div>

//                 <div className={`icon-badge ${isReschedule ? 'orange' : color}`} style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', flexShrink: 0 }}>
//                   <Icon name={iv.interview_type === 'technical' ? 'code' : 'users'} size={20} />
//                 </div>

//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
//                     <span style={{ flexShrink: 0 }}>{iv.interview_type} interview</span>
//                     <span style={{ color: '#94a3b8', flexShrink: 0 }}>&middot;</span>
//                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{jobTitle}</span>
//                   </div>
//                   <div className="muted mono" style={{ fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', flexWrap: 'wrap' }}>
//                     <span><Icon name="interviews" size={12} /> {time}</span>
//                     <span>&bull;</span>
//                     <span style={{ color: isReschedule ? '#fb923c' : `var(--${color})`, fontWeight: 700 }}>
//                       {isReschedule ? 'RESCHEDULE PENDING' : iv.status.toUpperCase()}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="interview-right-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
//                 {iv.meeting_link && !isReschedule && (
//                   <a
//                     href={iv.meeting_link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="neon-join-btn"
//                     title="Open live interview call link"
//                   >
//                     <span>🎥</span> Join Call
//                   </a>
//                 )}

//                 <a
//                   href={gCalLink}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="cal-shortcut-btn"
//                   title="Add to Google Calendar"
//                 >
//                   <span>📅</span> +Cal
//                 </a>

//                 <div
//                   className="right-status-badge"
//                   onClick={() => { setCalendarTarget(iv); setShowCalendarModal(true); }}
//                   title="View mini calendar & time"
//                 >
//                   <Icon name="interviews" size={13} /> {isReschedule ? 'PENDING' : iv.status.toUpperCase()}
//                 </div>

//                 <button
//                   type="button"
//                   className="interview-arrow-btn"
//                   onClick={() => setSelectedInterview(iv)}
//                   title="View schedule details & AI Prep"
//                 >
//                   <span style={{ fontSize: 16, fontWeight: 'bold' }}>&gt;</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       })}

//       {interviews && interviews.length > 0 && (
//         <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
//           <div
//             className="card total-summary-card"
//             onClick={() => { setModalSearchQuery(''); setShowAllModal(true); }}
//             style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.7) 0%, rgba(8, 10, 22, 0.95) 100%)', borderColor: 'rgba(139, 92, 246, 0.35)', borderRadius: '16px', padding: '14px 22px', boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.05)', cursor: 'pointer', width: 380, maxWidth: '100%' }}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//               <div className="icon-badge violet" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}><Icon name="interviews" size={16} /></div>
//               <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: '#f8fafc' }}>Total interviews scheduled</div>
//             </div>
//             <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--violet)', paddingRight: 4, borderLeft: '1px solid rgba(139,92,246,0.3)', paddingLeft: 18 }}>{interviews.length}</div>
//           </div>
//         </div>
//       )}

//       {/* Mini Calendar Modal */}
//       <Modal open={showCalendarModal} onClose={() => setShowCalendarModal(false)} maxWidth={400}>
//         {calendarTarget && (
//           <div className="atm-modal-container">
//             <div className="atm-top-header">
//               <h2 className="atm-main-title">Interview Schedule</h2>
//               <div className="atm-spark-divider">
//                 <div className="atm-spark-line" />
//                 <span className="atm-spark-star">✦</span>
//                 <div className="atm-spark-line" />
//               </div>
//               <button
//                 type="button"
//                 className="atm-close-x"
//                 onClick={() => setShowCalendarModal(false)}
//                 aria-label="Close"
//               >
//                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                   <line x1="18" y1="6" x2="6" y2="18" />
//                   <line x1="6" y1="6" x2="18" y2="18" />
//                 </svg>
//               </button>
//             </div>

//             <MiniCalendar scheduledAt={calendarTarget.scheduled_at} />

//             <div className="atm-info-card">
//               <span className="atm-info-badge">
//                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <circle cx="12" cy="12" r="10" />
//                   <polyline points="12 6 12 12 16 14" />
//                 </svg>
//               </span>
//               <div className="atm-time-block">
//                 <span className="atm-label-time">Scheduled Time:</span>
//                 <span className="atm-full-date">{formatFullInterviewDate(calendarTarget.scheduled_at)}</span>
//                 <span className="atm-time-text">at {formatTime24Hour(calendarTarget.scheduled_at)}</span>
//               </div>
//             </div>

//             <button
//               type="button"
//               className="atm-close-button"
//               onClick={() => setShowCalendarModal(false)}
//             >
//               Close
//             </button>
//           </div>
//         )}
//       </Modal>

//       {/* Interview Details & Prep Modal */}
//       <Modal open={selectedInterview !== null} onClose={() => setSelectedInterview(null)} maxWidth={480}>
//         {selectedInterview && (() => {
//           const jobTitle = jobMap[selectedInterview.job_id] || selectedInterview.job_title || `Job #${selectedInterview.job_id}`;
//           const timeFormatted = formatTime24Hour(selectedInterview.scheduled_at);
//           const fullDateFormatted = formatFullInterviewDate(selectedInterview.scheduled_at);

//           return (
//             <div className="atm-modal-container">
//               <div className="atm-top-header">
//                 <h2 className="atm-main-title">Interview Details</h2>
//                 <div className="atm-spark-divider">
//                   <div className="atm-spark-line" />
//                   <span className="atm-spark-star">✦</span>
//                   <div className="atm-spark-line" />
//                 </div>
//                 <button
//                   type="button"
//                   className="atm-close-x"
//                   onClick={() => setSelectedInterview(null)}
//                   aria-label="Close"
//                 >
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                     <line x1="18" y1="6" x2="6" y2="18" />
//                     <line x1="6" y1="6" x2="18" y2="18" />
//                   </svg>
//                 </button>
//               </div>

//               <div style={{ background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.22)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: '#cbd5e1' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
//                   <span style={{ color: '#94a3b8' }}>Type</span>
//                   <span style={{ color: '#fff', fontWeight: 600, textTransform: 'uppercase' }}>{selectedInterview.interview_type}</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
//                   <span style={{ color: '#94a3b8' }}>Role</span>
//                   <span style={{ color: '#a78bfa', fontWeight: 600 }}>{jobTitle}</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
//                   <span style={{ color: '#94a3b8' }}>Date</span>
//                   <span style={{ color: '#fff' }}>{fullDateFormatted}</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
//                   <span style={{ color: '#94a3b8' }}>Time</span>
//                   <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{timeFormatted}</span>
//                 </div>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
//                   <span style={{ color: '#94a3b8' }}>Status</span>
//                   <span style={{ color: selectedInterview.status === 'reschedule_requested' ? '#fb923c' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
//                     {selectedInterview.status.replace('_', ' ')}
//                   </span>
//                 </div>
//                 {selectedInterview.meeting_link && (
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <span style={{ color: '#94a3b8' }}>Meeting Link</span>
//                     <a href={selectedInterview.meeting_link} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Open Room</a>
//                   </div>
//                 )}
//                 {selectedInterview.notes && (
//                   <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
//                     <span style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Notes & Instructions:</span>
//                     <div style={{ fontSize: 12, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{selectedInterview.notes}</div>
//                   </div>
//                 )}
//               </div>

//               <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
//                 <button
//                   type="button"
//                   style={{
//                     flex: 1,
//                     background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(126, 34, 206, 0.4) 100%)',
//                     border: '1px solid rgba(192, 132, 252, 0.5)',
//                     color: '#fff',
//                     borderRadius: 10,
//                     padding: '9px 12px',
//                     fontSize: 12,
//                     fontWeight: 700,
//                     cursor: 'pointer',
//                   }}
//                   onClick={() => {
//                     setPrepTarget(selectedInterview);
//                     setMockAnswer('');
//                     setAiTip('');
//                   }}
//                 >
//                   ⚡ AI Mock Prep
//                 </button>

//                 <button
//                   type="button"
//                   style={{
//                     flex: 1,
//                     background: 'rgba(255, 255, 255, 0.05)',
//                     border: '1px solid rgba(255, 255, 255, 0.15)',
//                     color: '#fdba74',
//                     borderRadius: 10,
//                     padding: '9px 12px',
//                     fontSize: 12,
//                     fontWeight: 600,
//                     cursor: 'pointer',
//                   }}
//                   onClick={() => {
//                     setRescheduleTarget(selectedInterview);
//                     setSelectedInterview(null);
//                   }}
//                 >
//                   🗓️ Reschedule
//                 </button>
//               </div>

//               <button
//                 type="button"
//                 className="atm-close-button"
//                 onClick={() => setSelectedInterview(null)}
//               >
//                 Close
//               </button>
//             </div>
//           );
//         })()}
//       </Modal>

//       {/* AI Mock Prep Modal */}
//       <Modal open={prepTarget !== null} onClose={() => setPrepTarget(null)} maxWidth={500}>
//         {prepTarget && (
//           <div className="atm-modal-container">
//             <div className="atm-top-header">
//               <h2 className="atm-main-title">AI Round Practice</h2>
//               <div style={{ fontSize: 11, color: '#c084fc', marginTop: 4, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
//                 {prepTarget.interview_type} interview round
//               </div>
//             </div>

//             <div style={{ background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
//               <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Simulated Question</div>
//               <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>
//                 {prepTarget.interview_type === 'technical'
//                   ? 'Explain how you design scalable architectures or debug complex performance bottlenecks.'
//                   : 'Tell me about a time you handled competing deadlines and resolved misaligned stakeholder priorities.'}
//               </div>
//             </div>

//             <textarea
//               rows={4}
//               placeholder="Type your response outline or bullet points..."
//               value={mockAnswer}
//               onChange={(e) => setMockAnswer(e.target.value)}
//               style={{
//                 width: '100%',
//                 background: '#0b1122',
//                 border: '1px solid rgba(139, 92, 246, 0.35)',
//                 borderRadius: 10,
//                 padding: 10,
//                 color: '#fff',
//                 fontSize: 13,
//                 outline: 'none',
//                 boxSizing: 'border-box',
//               }}
//             />

//             {aiTip && (
//               <div style={{ background: 'rgba(45, 212, 191, 0.08)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: 10, padding: 12, color: '#cbd5e1', fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
//                 <strong style={{ color: '#2dd4bf' }}>💡 Evaluation:</strong> {aiTip}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
//               <button
//                 type="button"
//                 className="atm-close-button"
//                 style={{ background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)', flex: 1 }}
//                 onClick={handleEvaluatePrep}
//               >
//                 Analyze Answer
//               </button>
//               <button
//                 type="button"
//                 className="atm-close-button"
//                 style={{ width: 80, background: '#141c2e' }}
//                 onClick={() => setPrepTarget(null)}
//               >
//                 Done
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Reschedule Request Modal */}
//       <Modal open={rescheduleTarget !== null} onClose={() => setRescheduleTarget(null)} maxWidth={460}>
//         {rescheduleTarget && (
//           <form onSubmit={handleSendReschedule} className="atm-modal-container">
//             <div className="atm-top-header">
//               <h2 className="atm-main-title">Request Reschedule</h2>
//               <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '4px 0 0' }}>Propose 1 or 2 alternative time slots for the recruiter.</p>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
//               <div>
//                 <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
//                   Preferred Slot 1 (Required)
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="e.g. Next Monday, 3:00 PM - 4:00 PM"
//                   value={rescheduleSlot1}
//                   onChange={(e) => setRescheduleSlot1(e.target.value)}
//                   style={{ width: '100%', background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
//                   required
//                 />
//               </div>

//               <div>
//                 <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
//                   Preferred Slot 2 (Optional)
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="e.g. Next Tuesday, 11:00 AM"
//                   value={rescheduleSlot2}
//                   onChange={(e) => setRescheduleSlot2(e.target.value)}
//                   style={{ width: '100%', background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
//                 />
//               </div>

//               <div>
//                 <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
//                   Reason for Reschedule
//                 </label>
//                 <textarea
//                   rows={3}
//                   placeholder="Briefly describe your schedule conflict..."
//                   value={rescheduleReason}
//                   onChange={(e) => setRescheduleReason(e.target.value)}
//                   style={{ width: '100%', background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
//                   required
//                 />
//               </div>
//             </div>

//             <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
//               <button
//                 type="submit"
//                 className="atm-close-button"
//                 style={{ background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)', flex: 1 }}
//                 disabled={submittingReschedule}
//               >
//                 {submittingReschedule ? 'Sending...' : 'Send Request'}
//               </button>
//               <button
//                 type="button"
//                 className="atm-close-button"
//                 style={{ width: 80, background: '#141c2e' }}
//                 onClick={() => setRescheduleTarget(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         )}
//       </Modal>

//       {/* All Scheduled Interviews Modal */}
//       <Modal open={showAllModal} onClose={() => setShowAllModal(false)} maxWidth={560}>
//         <div className="atm-modal-container">
//           <div className="atm-top-header">
//             <h2 className="atm-main-title">
//               All Scheduled Interviews ({modalFilteredInterviews.length})
//             </h2>
//             <div className="atm-spark-divider">
//               <div className="atm-spark-line" />
//               <span className="atm-spark-star">✦</span>
//               <div className="atm-spark-line" />
//             </div>
//             <button
//               type="button"
//               className="atm-close-x"
//               onClick={() => setShowAllModal(false)}
//               aria-label="Close"
//             >
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <line x1="18" y1="6" x2="6" y2="18" />
//                 <line x1="6" y1="6" x2="18" y2="18" />
//               </svg>
//             </button>
//           </div>

//           <div style={{ position: 'relative', width: '100%', marginBottom: 14 }}>
//             <span style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', color: '#94a3b8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
//               <Icon name="search" size={14} />
//             </span>
//             <input
//               type="text"
//               placeholder="Search by role, interview type, or date..."
//               value={modalSearchQuery}
//               onChange={(e) => setModalSearchQuery(e.target.value)}
//               style={{
//                 width: '100%',
//                 background: '#0b1122',
//                 border: '1px solid rgba(139, 92, 246, 0.3)',
//                 borderRadius: '12px',
//                 padding: '10px 36px 10px 40px',
//                 fontSize: '13px',
//                 color: '#fff',
//                 outline: 'none',
//                 boxSizing: 'border-box',
//                 fontFamily: 'Inter, sans-serif',
//               }}
//             />
//           </div>

//           {modalFilteredInterviews.length === 0 ? (
//             <div style={{ padding: '36px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
//               No matching interviews found.
//             </div>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
//               {modalFilteredInterviews.map((iv) => {
//                 const jobTitle = jobMap[iv.job_id] || iv.job_title || `Job #${iv.job_id}`;
//                 const timeFormatted = formatTime24Hour(iv.scheduled_at);
//                 const dateDisplay = formatDateIndian(iv.scheduled_at);

//                 return (
//                   <div
//                     key={iv.id}
//                     style={{
//                       background: '#0b1122',
//                       border: '1px solid rgba(139, 92, 246, 0.22)',
//                       borderRadius: '14px',
//                       padding: '14px 16px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'space-between',
//                       gap: '12px',
//                       boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35) inset',
//                       boxSizing: 'border-box',
//                     }}
//                   >
//                     <div style={{ minWidth: 0, flex: 1 }}>
//                       <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
//                         <span style={{ color: '#c084fc', textTransform: 'uppercase', flexShrink: 0 }}>{iv.interview_type}</span>
//                         <span style={{ color: '#64748b', flexShrink: 0 }}>&middot;</span>
//                         <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{jobTitle}</span>
//                       </div>
//                       <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono, monospace)' }}>
//                         <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
//                           <Icon name="interviews" size={11} /> {dateDisplay}
//                         </span>
//                         <span style={{ color: '#64748b' }}>&bull;</span>
//                         <span>{timeFormatted}</span>
//                       </div>
//                     </div>

//                     <span
//                       style={{
//                         fontSize: '11px',
//                         padding: '4px 10px',
//                         borderRadius: '8px',
//                         flexShrink: 0,
//                         fontWeight: 600,
//                         textTransform: 'uppercase',
//                         background: iv.status === 'reschedule_requested' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(168, 85, 247, 0.15)',
//                         border: `1px solid ${iv.status === 'reschedule_requested' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(168, 85, 247, 0.3)'}`,
//                         color: iv.status === 'reschedule_requested' ? '#fb923c' : '#c084fc',
//                       }}
//                     >
//                       {iv.status.replace('_', ' ')}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           <button
//             type="button"
//             className="atm-close-button"
//             onClick={() => setShowAllModal(false)}
//           >
//             Close
//           </button>
//         </div>
//       </Modal>
//     </div>
//   );
// }











import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';

const TYPE_COLOR = { hr: 'violet', technical: 'blue', behavioral: 'teal' };

function formatTime24Hour(isoString) {
  if (!isoString) return '';
  if (isoString.includes('T')) {
    const timePart = isoString.split('T')[1].replace('Z', '').split('.')[0];
    const [h, m] = timePart.split(':');
    const hourNum = parseInt(h, 10);
    const minute = m || '00';
    const ampm = hourNum >= 12 ? 'pm' : 'am';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  }
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatFullInterviewDate(isoString) {
  if (!isoString) return '';
  if (isoString.includes('T')) {
    const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateIndian(isoString) {
  if (!isoString) return '';
  if (isoString.includes('T')) {
    const [year, month, day] = isoString.split('T')[0].split('-').map(Number);
    return `${day}/${month}/${year}`;
  }
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function getGoogleCalendarUrl(interview, jobTitle) {
  if (!interview || !interview.scheduled_at) return '#';
  try {
    const start = new Date(interview.scheduled_at);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    const formatGDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`${interview.interview_type?.toUpperCase()} Interview - ${jobTitle}`);
    const details = encodeURIComponent(
      `Interview scheduled on HireMind.\nType: ${interview.interview_type}\nJoin Link: ${interview.meeting_link || 'Provided prior to call'}\nNotes: ${interview.notes || 'None'}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGDate(start)}/${formatGDate(end)}&details=${details}`;
  } catch {
    return '#';
  }
}

function getInterviewCardVariant(iv, jobTitle = '') {
  const t = (iv.interview_type || '').toLowerCase();
  const jt = jobTitle.toLowerCase();

  if (iv.status === 'reschedule_requested') return 'variant-amber';
  if (jt.includes('full-stack') || jt.includes('fullstack')) return 'variant-amber';
  if (t === 'behavioral' || jt.includes('machine learning') || jt.includes('data')) return 'variant-cyan';
  if (jt.includes('java')) return 'variant-purple';
  if (t === 'technical' || jt.includes('frontend')) return 'variant-blue';
  if (t === 'hr' || jt.includes('backend')) return 'variant-indigo';
  return 'variant-indigo';
}

function renderTechIcon(variant) {
  switch (variant) {
    case 'variant-indigo':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'variant-blue':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'variant-purple':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case 'variant-cyan':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z" />
        </svg>
      );
    case 'variant-amber':
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
  }
}

function MiniCalendar({ scheduledAt }) {
  let year, month, dayNum;

  if (scheduledAt && scheduledAt.includes('T')) {
    const [y, m, d] = scheduledAt.split('T')[0].split('-').map(Number);
    year = y;
    month = m - 1;
    dayNum = d;
  } else {
    const d = new Date(scheduledAt);
    year = d.getFullYear();
    month = d.getMonth();
    dayNum = d.getDate();
  }

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
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
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <span className="weekend-label">SU</span>
        <span>MO</span>
        <span>TU</span>
        <span>WE</span>
        <span>TH</span>
        <span>FR</span>
        <span className="weekend-label">SA</span>
      </div>

      <div className="cal-grid">
        {days.map((day, idx) => {
          const isSelected = day === dayNum;
          const colIndex = idx % 7;
          const isWeekend = (colIndex === 0 || colIndex === 6) && !isSelected;

          let cellClass = 'cal-day-cell';
          if (isSelected) cellClass += ' day-interview-active';
          if (isWeekend) cellClass += ' day-weekend';

          return (
            <div key={idx} className={cellClass}>
              {day || ''}
              {isSelected && <span className="cal-dot dot-orange" />}
            </div>
          );
        })}
      </div>

      <div className="cal-legend-wrapper">
        <span className="legend-dot" />
        <span>Interview Day</span>
      </div>
    </div>
  );
}

export default function Interviews() {
  const [interviews, setInterviews] = useState(null);
  const [jobMap, setJobMap] = useState({});
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [cameFromAllModal, setCameFromAllModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  // Reschedule state
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleSlot1, setRescheduleSlot1] = useState('');
  const [rescheduleSlot2, setRescheduleSlot2] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // AI Prep Practice State
  const [prepTarget, setPrepTarget] = useState(null);
  const [mockAnswer, setMockAnswer] = useState('');
  const [aiTip, setAiTip] = useState('');

  const toast = useToast();

  const loadData = () => {
    apiRequest('/interviews/mine').then(setInterviews).catch(() => setInterviews([]));
    apiRequest('/jobs')
      .then((jobs) => {
        const map = {};
        (jobs || []).forEach((j) => {
          map[j.id] = j.title;
        });
        setJobMap(map);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleSendReschedule(e) {
    e.preventDefault();
    if (!rescheduleSlot1.trim() || !rescheduleReason.trim()) {
      toast('Please enter your primary slot and reason.', 'error');
      return;
    }
    setSubmittingReschedule(true);
    try {
      await apiRequest(`/interviews/${rescheduleTarget.id}/reschedule-request`, {
        method: 'POST',
        body: {
          preferred_time_1: rescheduleSlot1.trim(),
          preferred_time_2: rescheduleSlot2.trim() || undefined,
          reason: rescheduleReason.trim(),
        },
      });
      toast('Reschedule request sent to the recruiter!', 'success');
      setRescheduleTarget(null);
      setRescheduleSlot1('');
      setRescheduleSlot2('');
      setRescheduleReason('');
      loadData();
    } catch (err) {
      toast(err.message || 'Could not send request', 'error');
    } finally {
      setSubmittingReschedule(false);
    }
  }

  function handleEvaluatePrep() {
    if (!mockAnswer.trim()) {
      toast('Please write down your bullet points first', 'error');
      return;
    }
    setAiTip(
      `Strong answer structure! Recommended enhancement: Frame your answer around an obstacle encountered, your specific technical role, and quantitative results produced.`
    );
  }

  const counts = useMemo(() => {
    if (!interviews) return { ALL: 0, HR: 0, TECHNICAL: 0, BEHAVIORAL: 0, RESCHEDULE: 0, COMPLETED: 0 };
    return {
      ALL: interviews.length,
      HR: interviews.filter((iv) => iv.interview_type === 'hr').length,
      TECHNICAL: interviews.filter((iv) => iv.interview_type === 'technical').length,
      BEHAVIORAL: interviews.filter((iv) => iv.interview_type === 'behavioral').length,
      RESCHEDULE: interviews.filter((iv) => iv.status === 'reschedule_requested').length,
      COMPLETED: interviews.filter((iv) => iv.status === 'completed').length,
    };
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    if (!interviews) return [];
    const q = searchQuery.toLowerCase().trim();

    return interviews.filter((iv) => {
      const jobTitle = (jobMap[iv.job_id] || iv.job_title || '').toLowerCase();
      const type = (iv.interview_type || '').toLowerCase();
      const status = (iv.status || '').toLowerCase();
      const matchesSearch = !q || jobTitle.includes(q) || type.includes(q) || status.includes(q);

      let matchesTab = true;
      if (activeTab === 'HR') matchesTab = iv.interview_type === 'hr';
      else if (activeTab === 'TECHNICAL') matchesTab = iv.interview_type === 'technical';
      else if (activeTab === 'BEHAVIORAL') matchesTab = iv.interview_type === 'behavioral';
      else if (activeTab === 'RESCHEDULE') matchesTab = iv.status === 'reschedule_requested';
      else if (activeTab === 'COMPLETED') matchesTab = iv.status === 'completed';

      return matchesSearch && matchesTab;
    });
  }, [interviews, searchQuery, activeTab, jobMap]);

  const modalFilteredInterviews = useMemo(() => {
    if (!interviews) return [];
    if (!modalSearchQuery.trim()) return interviews;
    const q = modalSearchQuery.toLowerCase();
    return interviews.filter((iv) => {
      const jobTitle = (jobMap[iv.job_id] || iv.job_title || '').toLowerCase();
      const type = (iv.interview_type || '').toLowerCase();
      const status = (iv.status || '').toLowerCase();
      const dateStr = formatDateIndian(iv.scheduled_at).toLowerCase();
      return jobTitle.includes(q) || type.includes(q) || status.includes(q) || dateStr.includes(q);
    });
  }, [interviews, modalSearchQuery, jobMap]);

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .modal-close,
        .modal-box > button.close-btn {
          display: none !important;
        }

        .modal-box {
          overflow: visible !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        /* Listing Row */
        .interview-listing-row {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 18px 22px;
          margin-bottom: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
          width: 100%;
        }
        .interview-listing-row.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .interview-listing-row.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .interview-listing-row.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .interview-listing-row.c-reschedule { border-color: rgba(249, 115, 22, 0.6); background: linear-gradient(135deg, rgba(35, 18, 20, 0.6) 0%, rgba(12, 10, 22, 0.9) 100%); }

        /* Modern responsive layout for outer card */
        .interview-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 16px;
        }

        .interview-left-section {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .interview-date-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 14px;
          padding: 10px 14px;
          text-align: center;
          min-width: 54px;
          flex-shrink: 0;
        }
        .interview-date-num {
          font-size: 20px;
          font-weight: 700;
          font-family: var(--font-display, sans-serif);
          color: #fff;
          line-height: 1.1;
        }
        .interview-date-month {
          font-size: 10.5px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.8px;
          margin-top: 3px;
        }

        .interview-title-text {
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 15.5px;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }
        .interview-meta-details {
          font-size: 12px;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
        }

        .interview-right-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Segmented Capsule Bar */
        .neon-capsule-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 0 12px 0;
          margin-bottom: 22px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .neon-capsule-bar::-webkit-scrollbar { display: none; }

        .neon-pill-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 16px;
          border-radius: 9999px;
          font-family: var(--font-display, inherit);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid transparent;
          color: #94a3b8;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          flex-shrink: 0;
        }

        .neon-icon-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          transition: all 0.22s ease;
        }

        .neon-count-badge {
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-family: var(--font-mono, monospace);
          font-weight: 800;
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.22s ease;
        }

        .neon-pill-btn.v-violet { border-color: rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.06); }
        .neon-pill-btn.v-violet .neon-icon-badge { background: rgba(168, 85, 247, 0.2); color: #c084fc; }

        .neon-pill-btn.v-blue { border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.06); }
        .neon-pill-btn.v-blue .neon-icon-badge { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }

        .neon-pill-btn.v-teal { border-color: rgba(45, 212, 191, 0.3); background: rgba(45, 212, 191, 0.06); }
        .neon-pill-btn.v-teal .neon-icon-badge { background: rgba(45, 212, 191, 0.2); color: #2dd4bf; }

        .neon-pill-btn.v-orange { border-color: rgba(249, 115, 22, 0.3); background: rgba(249, 115, 22, 0.06); }
        .neon-pill-btn.v-orange .neon-icon-badge { background: rgba(249, 115, 22, 0.2); color: #fb923c; }

        .neon-pill-btn:hover:not(.active) {
          color: #f1f5f9;
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .neon-pill-btn.v-violet.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(126, 34, 206, 0.55) 100%);
          border-color: #c084fc;
          color: #ffffff;
          box-shadow: 0 0 18px rgba(168, 85, 247, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }
        .neon-pill-btn.v-blue.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(29, 78, 216, 0.55) 100%);
          border-color: #60a5fa;
          color: #ffffff;
          box-shadow: 0 0 18px rgba(59, 130, 246, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }
        .neon-pill-btn.v-teal.active {
          background: linear-gradient(135deg, rgba(45, 212, 191, 0.4) 0%, rgba(15, 118, 110, 0.55) 100%);
          border-color: #2dd4bf;
          color: #ffffff;
          box-shadow: 0 0 18px rgba(45, 212, 191, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }
        .neon-pill-btn.v-orange.active {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.4) 0%, rgba(194, 65, 12, 0.55) 100%);
          border-color: #fb923c;
          color: #ffffff;
          box-shadow: 0 0 18px rgba(249, 115, 22, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }

        .neon-join-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: 1px solid rgba(16, 185, 129, 0.6);
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 10px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .neon-join-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.55);
        }

        .cal-shortcut-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #c084fc;
          padding: 8px 12px;
          border-radius: 10px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .cal-shortcut-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: #c084fc;
          color: #fff;
        }

        .interview-arrow-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .interview-arrow-btn:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: rgba(168, 85, 247, 0.5);
          color: #fff;
        }

        .right-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-family: var(--font-mono, monospace);
          font-size: 11.5px;
          font-weight: 600;
          height: 38px;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .c-violet .right-status-badge { background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.35); color: #c084fc; }
        .c-blue .right-status-badge { background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); color: #60a5fa; }
        .c-teal .right-status-badge { background: rgba(20, 184, 166, 0.12); border: 1px solid rgba(20, 184, 166, 0.35); color: #2dd4bf; }
        .c-reschedule .right-status-badge { background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.5); color: #fb923c; }

        .aesthetic-search-wrapper {
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 16px 20px;
          margin-bottom: 16px;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
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
          padding: 12px 42px 12px 48px;
          color: #fff;
          font-size: 13.5px;
          box-sizing: border-box;
          outline: none;
          font-family: Inter, sans-serif;
          height: 46px;
        }
        .aesthetic-search-icon-badge {
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          pointer-events: none;
        }

        .atm-modal-container {
          background: #080d1a;
          border: 1.5px solid rgba(139, 92, 246, 0.28);
          border-radius: 24px;
          padding: 24px 22px 22px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.95);
          color: #ffffff;
          position: relative;
          box-sizing: border-box;
          width: 100%;
          max-height: 88vh;
          overflow-y: auto;
        }
        .atm-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          margin-bottom: 18px;
          min-height: 34px;
        }
        .atm-main-title {
          font-family: var(--font-display, "Inter", sans-serif);
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .atm-custom-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: #141c2e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          display: flex !important;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s ease;
          padding: 0;
        }
        .atm-custom-close-btn:hover {
          background: rgba(244, 63, 94, 0.25);
          border-color: rgba(244, 63, 94, 0.4);
          color: #ffffff;
        }
        .atm-custom-close-btn svg {
          stroke: currentColor;
          width: 15px;
          height: 15px;
          display: block;
        }

        .cal-card-wrapper {
          background: #0b1122;
          border: 1px solid rgba(139, 92, 246, 0.22);
          border-radius: 18px;
          padding: 14px;
        }
        .cal-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .cal-month-title {
          font-family: var(--font-display, sans-serif);
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cal-schedule-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 4px 10px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 600;
          color: #a78bfa;
        }
        .cal-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 11.5px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 6px;
        }
        .weekend-label { color: #f87171 !important; }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          text-align: center;
        }
        .cal-day-cell {
          height: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 9px;
          font-size: 12.5px;
          color: #cbd5e1;
          position: relative;
        }
        .day-weekend { color: #ef4444; }
        .day-interview-active {
          background: linear-gradient(135deg, #a855f7 0%, #d946ef 50%, #f97316 100%) !important;
          border: 1px solid rgba(249, 115, 22, 0.8) !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          box-shadow: 0 0 16px rgba(217, 70, 239, 0.6) !important;
        }
        .cal-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          position: absolute;
          bottom: 3px;
        }
        .dot-orange { background: #fde047; box-shadow: 0 0 5px #fde047; }
        .cal-legend-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 11px;
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
        }
        .legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f97316;
          box-shadow: 0 0 6px #f97316;
        }

        .atm-info-card {
          margin-top: 10px;
          background: #0b1122;
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 14px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .atm-info-badge {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.3);
        }
        .atm-time-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }
        .atm-label-time {
          color: #c084fc;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          font-family: var(--font-mono, monospace);
        }
        .atm-full-date {
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
        }
        .atm-time-text {
          color: #94a3b8;
          font-size: 11.5px;
          font-family: var(--font-mono, monospace);
        }

        .atm-close-button {
          width: 100%;
          margin-top: 14px;
          background: linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%);
          border: 1px solid rgba(139, 92, 246, 0.45);
          border-radius: 12px;
          padding: 11px 16px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(124, 58, 237, 0.4);
          transition: all 0.2s ease;
        }
        .atm-close-button:hover {
          opacity: 0.94;
          transform: translateY(-1px);
        }

        .atm-back-button {
          width: 100%;
          margin-top: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 10px 16px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .atm-back-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        /* All Scheduled Interviews Modal */
        .all-interviews-modal-shell {
          background: #060919;
          border: 1.5px solid #2563eb;
          border-radius: 24px;
          padding: 26px 22px 20px;
          box-shadow: 0 0 35px rgba(37, 99, 235, 0.35), 0 24px 80px rgba(0, 0, 0, 0.95);
          color: #ffffff;
          box-sizing: border-box;
          width: 100%;
          position: relative;
        }

        .all-interviews-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .all-interviews-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
          flex: 1;
        }

        .all-interviews-main-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.1) 70%);
          border: 1.5px solid rgba(59, 130, 246, 0.6);
          color: #60a5fa;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.35);
          flex-shrink: 0;
        }

        .all-interviews-header-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .all-interviews-header-text h2 {
          font-family: var(--font-display, "Inter", sans-serif);
          font-size: 19px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .all-interviews-header-text p {
          margin: 5px 0 0 0;
          font-size: 12px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .all-interviews-search-bar {
          position: relative;
          width: 100%;
          margin-bottom: 16px;
        }
        .all-interviews-search-bar input {
          width: 100%;
          background: rgba(11, 17, 34, 0.85);
          border: 1.5px solid rgba(59, 130, 246, 0.35);
          border-radius: 12px;
          padding: 11px 16px 11px 42px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .all-interviews-search-bar input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 14px rgba(59, 130, 246, 0.35);
        }

        .all-interviews-list-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
        }
        .all-interviews-list-container::-webkit-scrollbar {
          width: 5px;
        }
        .all-interviews-list-container::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }

        /* ── Modern Glowing Interview Cards with Responsive Grid ── */
        .modal-interview-item-card {
          border-radius: 16px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-sizing: border-box;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .modal-interview-item-card:hover {
          transform: translateY(-1px);
        }

        .modal-interview-item-card.variant-indigo {
          background: linear-gradient(135deg, rgba(28, 26, 68, 0.75) 0%, rgba(12, 14, 34, 0.9) 100%);
          border: 1.5px solid rgba(129, 140, 248, 0.45);
          box-shadow: 0 4px 18px rgba(129, 140, 248, 0.12);
        }
        .modal-interview-item-card.variant-indigo .item-tech-icon-box {
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(129, 140, 248, 0.5);
          color: #a5b4fc;
        }
        .modal-interview-item-card.variant-indigo .item-type-label { color: #a5b4fc; }
        .modal-interview-item-card.variant-indigo .item-status-pill {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
        }

        .modal-interview-item-card.variant-blue {
          background: linear-gradient(135deg, rgba(14, 38, 70, 0.75) 0%, rgba(8, 18, 38, 0.9) 100%);
          border: 1.5px solid rgba(56, 189, 248, 0.45);
          box-shadow: 0 4px 18px rgba(56, 189, 248, 0.12);
        }
        .modal-interview-item-card.variant-blue .item-tech-icon-box {
          background: rgba(56, 189, 248, 0.2);
          border: 1px solid rgba(56, 189, 248, 0.5);
          color: #38bdf8;
        }
        .modal-interview-item-card.variant-blue .item-type-label { color: #38bdf8; }
        .modal-interview-item-card.variant-blue .item-status-pill {
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(2, 132, 199, 0.4);
        }

        .modal-interview-item-card.variant-purple {
          background: linear-gradient(135deg, rgba(38, 18, 62, 0.75) 0%, rgba(16, 10, 32, 0.9) 100%);
          border: 1.5px solid rgba(192, 132, 252, 0.45);
          box-shadow: 0 4px 18px rgba(192, 132, 252, 0.12);
        }
        .modal-interview-item-card.variant-purple .item-tech-icon-box {
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(192, 132, 252, 0.5);
          color: #c084fc;
        }
        .modal-interview-item-card.variant-purple .item-type-label { color: #c084fc; }
        .modal-interview-item-card.variant-purple .item-status-pill {
          background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(126, 34, 206, 0.4);
        }

        .modal-interview-item-card.variant-cyan {
          background: linear-gradient(135deg, rgba(10, 42, 48, 0.75) 0%, rgba(6, 20, 26, 0.9) 100%);
          border: 1.5px solid rgba(45, 212, 191, 0.45);
          box-shadow: 0 4px 18px rgba(45, 212, 191, 0.12);
        }
        .modal-interview-item-card.variant-cyan .item-tech-icon-box {
          background: rgba(20, 184, 166, 0.2);
          border: 1px solid rgba(45, 212, 191, 0.5);
          color: #2dd4bf;
        }
        .modal-interview-item-card.variant-cyan .item-type-label { color: #2dd4bf; }
        .modal-interview-item-card.variant-cyan .item-status-pill {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(13, 148, 136, 0.4);
        }

        .modal-interview-item-card.variant-amber {
          background: linear-gradient(135deg, rgba(46, 32, 14, 0.75) 0%, rgba(22, 16, 8, 0.9) 100%);
          border: 1.5px solid rgba(245, 158, 11, 0.45);
          box-shadow: 0 4px 18px rgba(245, 158, 11, 0.12);
        }
        .modal-interview-item-card.variant-amber .item-tech-icon-box {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.5);
          color: #fbbf24;
        }
        .modal-interview-item-card.variant-amber .item-type-label { color: #fbbf24; }
        .modal-interview-item-card.variant-amber .item-status-pill {
          background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(180, 83, 9, 0.4);
        }

        .item-tech-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-content-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-title-row {
          font-family: var(--font-display, "Inter", sans-serif);
          font-weight: 700;
          font-size: 14.5px;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-type-label {
          font-weight: 800;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .item-role-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #f8fafc;
        }

        .item-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #cbd5e1;
          font-family: var(--font-mono, monospace);
          flex-wrap: wrap;
        }
        .item-meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .item-right-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .item-status-pill {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 6px 14px;
          border-radius: 9999px;
          text-transform: uppercase;
          font-family: var(--font-display, sans-serif);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .item-chevron-btn {
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .modal-interview-item-card:hover .item-chevron-btn {
          color: #ffffff;
          transform: translateX(2px);
        }

        /* ══════════════════════════════════════════════════════════
           CRITICAL RESPONSIVE BREAKPOINTS (FIXES OVERLAP IN IMAGE)
           ══════════════════════════════════════════════════════════ */
        @media (max-width: 640px) {
          .interview-listing-row {
            padding: 16px;
          }
          .interview-card-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .interview-left-section {
            width: 100%;
            align-items: flex-start;
          }
          .interview-title-text {
            white-space: normal;
            word-break: break-word;
          }
          .interview-right-actions {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            padding-top: 12px;
            margin-top: 2px;
            gap: 8px;
            flex-wrap: wrap;
          }
          .neon-join-btn,
          .cal-shortcut-btn,
          .right-status-badge {
            font-size: 11px;
            padding: 6px 10px;
            height: 34px;
          }
          .interview-arrow-btn {
            width: 34px;
            height: 34px;
          }
        }

        @media (max-width: 560px) {
          .all-interviews-modal-shell {
            padding: 20px 14px 16px;
          }
          .all-interviews-main-icon {
            width: 44px;
            height: 44px;
          }
          .all-interviews-header-text h2 {
            font-size: 16px;
          }

          .modal-interview-item-card {
            display: grid;
            grid-template-columns: 40px 1fr auto;
            grid-template-rows: auto auto;
            row-gap: 8px;
            column-gap: 10px;
            padding: 12px;
            align-items: center;
          }
          
          .item-tech-icon-box {
            grid-column: 1;
            grid-row: 1;
            width: 40px;
            height: 40px;
          }

          .item-content-info {
            grid-column: 2 / span 2;
            grid-row: 1;
          }

          .item-title-row {
            font-size: 13.5px;
          }

          .item-meta-row {
            grid-column: 1 / span 2;
            grid-row: 2;
            font-size: 11px;
            gap: 8px;
          }

          .item-right-actions {
            grid-column: 3;
            grid-row: 2;
            justify-self: end;
            gap: 6px;
          }

          .item-status-pill {
            font-size: 9.5px;
            padding: 4px 10px;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div className="page-eyebrow">ATS pipeline</div>
        <h1 className="page-title"><span className="hl">Interviews</span></h1>
        <p className="page-sub">Direct access to your scheduled meeting links, Google Calendar sync, and AI mock prep.</p>
      </div>

      {/* Search Bar */}
      <div className="aesthetic-search-wrapper">
        <div className="aesthetic-search-input-box">
          <span className="aesthetic-search-icon-badge">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Search interviews by role, type (hr, technical), or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                borderRadius: '6px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '11px',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Borderless Segmented Neon Pill Filters */}
      <div className="neon-capsule-bar">
        {[
          { id: 'ALL', label: 'All Interviews', variant: 'v-violet', icon: '🗓️', count: counts.ALL },
          { id: 'HR', label: 'HR Rounds', variant: 'v-violet', icon: '👥', count: counts.HR },
          { id: 'TECHNICAL', label: 'Technical', variant: 'v-blue', icon: '💻', count: counts.TECHNICAL },
          { id: 'BEHAVIORAL', label: 'Behavioral', variant: 'v-teal', icon: '🎯', count: counts.BEHAVIORAL },
          { id: 'RESCHEDULE', label: 'Reschedule Requested', variant: 'v-orange', icon: '⚠️', count: counts.RESCHEDULE },
          { id: 'COMPLETED', label: 'Completed', variant: 'v-violet', icon: '✓', count: counts.COMPLETED },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`neon-pill-btn ${tab.variant} ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="neon-icon-badge">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="neon-count-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {interviews === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {interviews && filteredInterviews.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="interviews" size={22} /></div>
          <div className="es-title">{interviews.length === 0 ? 'No interviews scheduled' : 'No interviews match your criteria'}</div>
          <div className="es-sub">Recruiters schedule these once you are shortlisted and pass screening.</div>
        </div>
      )}

      {filteredInterviews.map((iv) => {
        let day, mon;
        if (iv.scheduled_at && iv.scheduled_at.includes('T')) {
          const [y, m, d] = iv.scheduled_at.split('T')[0].split('-').map(Number);
          day = d;
          mon = new Date(y, m - 1, d).toLocaleString('default', { month: 'short' }).toUpperCase();
        } else {
          const d = new Date(iv.scheduled_at);
          day = d.getDate();
          mon = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        }

        const time = formatTime24Hour(iv.scheduled_at);
        const isReschedule = iv.status === 'reschedule_requested';
        const color = isReschedule ? 'reschedule' : (TYPE_COLOR[iv.interview_type] || 'violet');
        const jobTitle = jobMap[iv.job_id] || iv.job_title || `Job #${iv.job_id}`;
        const gCalLink = getGoogleCalendarUrl(iv, jobTitle);

        return (
          <div className={`interview-listing-row c-${color}`} key={iv.id}>
            <div className="interview-card-content">
              {/* Left Section: Date Box, Icon, and Info */}
              <div className="interview-left-section">
                <div className="interview-date-box">
                  <div className="interview-date-num">{day}</div>
                  <div className="interview-date-month">{mon}</div>
                </div>

                <div className={`icon-badge ${isReschedule ? 'orange' : color}`} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0 }}>
                  <Icon name={iv.interview_type === 'technical' ? 'code' : 'users'} size={19} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="interview-title-text">
                    <span style={{ flexShrink: 0 }}>{iv.interview_type} interview</span>
                    <span style={{ color: '#64748b', flexShrink: 0 }}>&middot;</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, color: '#e2e8f0' }}>{jobTitle}</span>
                  </div>
                  <div className="interview-meta-details">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="interviews" size={11} /> {time}
                    </span>
                    <span style={{ color: '#64748b' }}>&bull;</span>
                    <span style={{ color: isReschedule ? '#fb923c' : `var(--${color})`, fontWeight: 700 }}>
                      {isReschedule ? 'RESCHEDULE PENDING' : iv.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section: Actions cleanly separated */}
              <div className="interview-right-actions">
                {iv.meeting_link && !isReschedule && (
                  <a
                    href={iv.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neon-join-btn"
                    title="Open live interview call link"
                  >
                    <span>🎥</span> Join Call
                  </a>
                )}

                <a
                  href={gCalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cal-shortcut-btn"
                  title="Add to Google Calendar"
                >
                  <span>📅</span> +Cal
                </a>

                <div
                  className="right-status-badge"
                  onClick={() => { setCalendarTarget(iv); setShowCalendarModal(true); }}
                  title="View mini calendar & time"
                >
                  <Icon name="interviews" size={13} /> {isReschedule ? 'PENDING' : iv.status.toUpperCase()}
                </div>

                <button
                  type="button"
                  className="interview-arrow-btn"
                  onClick={() => {
                    setCameFromAllModal(false);
                    setSelectedInterview(iv);
                  }}
                  title="View schedule details & AI Prep"
                >
                  <span style={{ fontSize: 16, fontWeight: 'bold' }}>&gt;</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {interviews && interviews.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
          <div
            className="card total-summary-card"
            onClick={() => { setModalSearchQuery(''); setShowAllModal(true); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(20, 15, 38, 0.7) 0%, rgba(8, 10, 22, 0.95) 100%)', borderColor: 'rgba(139, 92, 246, 0.35)', borderRadius: '16px', padding: '14px 22px', boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.05)', cursor: 'pointer', width: 380, maxWidth: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="icon-badge violet" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}><Icon name="interviews" size={16} /></div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: '#f8fafc' }}>Total interviews scheduled</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--violet)', paddingRight: 4, borderLeft: '1px solid rgba(139,92,246,0.3)', paddingLeft: 18 }}>{interviews.length}</div>
          </div>
        </div>
      )}

      {/* Mini Calendar Modal */}
      <Modal open={showCalendarModal} onClose={() => setShowCalendarModal(false)} maxWidth={400}>
        {calendarTarget && (
          <div className="atm-modal-container">
            <div className="atm-top-header">
              <h2 className="atm-main-title">Interview Schedule</h2>
              <button
                type="button"
                className="atm-custom-close-btn"
                onClick={() => setShowCalendarModal(false)}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <MiniCalendar scheduledAt={calendarTarget.scheduled_at} />

            <div className="atm-info-card">
              <span className="atm-info-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <div className="atm-time-block">
                <span className="atm-label-time">Scheduled Time:</span>
                <span className="atm-full-date">{formatFullInterviewDate(calendarTarget.scheduled_at)}</span>
                <span className="atm-time-text">at {formatTime24Hour(calendarTarget.scheduled_at)}</span>
              </div>
            </div>

            <button
              type="button"
              className="atm-close-button"
              onClick={() => setShowCalendarModal(false)}
            >
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Interview Details & Prep Modal */}
      <Modal open={selectedInterview !== null} onClose={() => setSelectedInterview(null)} maxWidth={480}>
        {selectedInterview && (() => {
          const jobTitle = jobMap[selectedInterview.job_id] || selectedInterview.job_title || `Job #${selectedInterview.job_id}`;
          const timeFormatted = formatTime24Hour(selectedInterview.scheduled_at);
          const fullDateFormatted = formatFullInterviewDate(selectedInterview.scheduled_at);

          return (
            <div className="atm-modal-container">
              <div className="atm-top-header">
                <h2 className="atm-main-title">Interview Details</h2>
                <button
                  type="button"
                  className="atm-custom-close-btn"
                  onClick={() => {
                    setSelectedInterview(null);
                    if (cameFromAllModal) setShowAllModal(true);
                  }}
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div style={{ background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.22)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: '#cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Type</span>
                  <span style={{ color: '#fff', fontWeight: 600, textTransform: 'uppercase' }}>{selectedInterview.interview_type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Role</span>
                  <span style={{ color: '#a78bfa', fontWeight: 600 }}>{jobTitle}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Date</span>
                  <span style={{ color: '#fff' }}>{fullDateFormatted}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Time</span>
                  <span style={{ color: '#2dd4bf', fontWeight: 600 }}>{timeFormatted}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Status</span>
                  <span style={{ color: selectedInterview.status === 'reschedule_requested' ? '#fb923c' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
                    {selectedInterview.status.replace('_', ' ')}
                  </span>
                </div>
                {selectedInterview.meeting_link && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Meeting Link</span>
                    <a href={selectedInterview.meeting_link} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Open Room</a>
                  </div>
                )}
                {selectedInterview.notes && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <span style={{ color: '#94a3b8', display: 'block', marginBottom: 4 }}>Notes & Instructions:</span>
                    <div style={{ fontSize: 12, color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{selectedInterview.notes}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(126, 34, 206, 0.4) 100%)',
                    border: '1px solid rgba(192, 132, 252, 0.5)',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setPrepTarget(selectedInterview);
                    setMockAnswer('');
                    setAiTip('');
                  }}
                >
                  ⚡ AI Mock Prep
                </button>

                <button
                  type="button"
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fdba74',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setRescheduleTarget(selectedInterview);
                    setSelectedInterview(null);
                  }}
                >
                  🗓️ Reschedule
                </button>
              </div>

              {cameFromAllModal ? (
                <button
                  type="button"
                  className="atm-back-button"
                  onClick={() => {
                    setSelectedInterview(null);
                    setShowAllModal(true);
                  }}
                >
                  ← Back to All Interviews
                </button>
              ) : (
                <button
                  type="button"
                  className="atm-close-button"
                  onClick={() => setSelectedInterview(null)}
                >
                  Close
                </button>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* AI Mock Prep Modal */}
      <Modal open={prepTarget !== null} onClose={() => setPrepTarget(null)} maxWidth={500}>
        {prepTarget && (
          <div className="atm-modal-container">
            <div className="atm-top-header">
              <h2 className="atm-main-title">AI Round Practice</h2>
              <button
                type="button"
                className="atm-custom-close-btn"
                onClick={() => setPrepTarget(null)}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ fontSize: 11, color: '#c084fc', marginBottom: 12, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              {prepTarget.interview_type} interview round
            </div>

            <div style={{ background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Simulated Question</div>
              <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>
                {prepTarget.interview_type === 'technical'
                  ? 'Explain how you design scalable architectures or debug complex performance bottlenecks.'
                  : 'Tell me about a time you handled competing deadlines and resolved misaligned stakeholder priorities.'}
              </div>
            </div>

            <textarea
              rows={4}
              placeholder="Type your response outline or bullet points..."
              value={mockAnswer}
              onChange={(e) => setMockAnswer(e.target.value)}
              style={{
                width: '100%',
                background: '#0b1122',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: 10,
                padding: 10,
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {aiTip && (
              <div style={{ background: 'rgba(45, 212, 191, 0.08)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: 10, padding: 12, color: '#cbd5e1', fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
                <strong style={{ color: '#2dd4bf' }}>💡 Evaluation:</strong> {aiTip}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className="atm-close-button"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)', flex: 1 }}
                onClick={handleEvaluatePrep}
              >
                Analyze Answer
              </button>
              <button
                type="button"
                className="atm-close-button"
                style={{ width: 80, background: '#141c2e' }}
                onClick={() => setPrepTarget(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reschedule Request Modal */}
      <Modal open={rescheduleTarget !== null} onClose={() => setRescheduleTarget(null)} maxWidth={460}>
        {rescheduleTarget && (
          <form onSubmit={handleSendReschedule} className="atm-modal-container">
            <div className="atm-top-header">
              <h2 className="atm-main-title">Request Reschedule</h2>
              <button
                type="button"
                className="atm-custom-close-btn"
                onClick={() => setRescheduleTarget(null)}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '0 0 12px 0' }}>Propose 1 or 2 alternative time slots for the recruiter.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
                  Preferred Slot 1 (Required)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next Monday, 3:00 PM - 4:00 PM"
                  value={rescheduleSlot1}
                  onChange={(e) => setRescheduleSlot1(e.target.value)}
                  style={{ width: '100%', background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
                  Preferred Slot 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next Tuesday, 11:00 AM"
                  value={rescheduleSlot2}
                  onChange={(e) => setRescheduleSlot2(e.target.value)}
                  style={{ width: '100%', background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
                  Reason for Reschedule
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your schedule conflict..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  style={{ width: '100%', background: '#0b1122', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                type="submit"
                className="atm-close-button"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #f97316 100%)', flex: 1 }}
                disabled={submittingReschedule}
              >
                {submittingReschedule ? 'Sending...' : 'Send Request'}
              </button>
              <button
                type="button"
                className="atm-close-button"
                style={{ width: 80, background: '#141c2e' }}
                onClick={() => setRescheduleTarget(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* All Scheduled Interviews Modal */}
      <Modal open={showAllModal} onClose={() => setShowAllModal(false)} maxWidth={580}>
        <div className="all-interviews-modal-shell">
          <div className="all-interviews-top-header">
            <div className="all-interviews-header-left">
              <div className="all-interviews-main-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="8" cy="15" r="1" fill="currentColor" />
                  <circle cx="12" cy="15" r="1" fill="currentColor" />
                  <circle cx="16" cy="15" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className="all-interviews-header-text">
                <h2>All Scheduled Interviews ({modalFilteredInterviews.length})</h2>
                <p>View and manage all your upcoming interviews</p>
              </div>
            </div>

            <button
              type="button"
              className="atm-custom-close-btn"
              onClick={() => setShowAllModal(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="all-interviews-search-bar">
            <span style={{ position: 'absolute', left: 14, top: 0, bottom: 0, margin: 'auto', color: '#60a5fa', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <Icon name="search" size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by role, interview type, or date..."
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
            />
          </div>

          {modalFilteredInterviews.length === 0 ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              No matching interviews found.
            </div>
          ) : (
            <div className="all-interviews-list-container">
              {modalFilteredInterviews.map((iv) => {
                const jobTitle = jobMap[iv.job_id] || iv.job_title || `Job #${iv.job_id}`;
                const timeFormatted = formatTime24Hour(iv.scheduled_at);
                const dateDisplay = formatDateIndian(iv.scheduled_at);
                const variantClass = getInterviewCardVariant(iv, jobTitle);

                return (
                  <div
                    key={iv.id}
                    className={`modal-interview-item-card ${variantClass}`}
                    onClick={() => {
                      setCameFromAllModal(true);
                      setShowAllModal(false);
                      setSelectedInterview(iv);
                    }}
                  >
                    <div className="item-tech-icon-box">
                      {renderTechIcon(variantClass)}
                    </div>

                    <div className="item-content-info">
                      <div className="item-title-row">
                        <span className="item-type-label">{iv.interview_type}</span>
                        <span style={{ color: '#64748b' }}>&middot;</span>
                        <span className="item-role-label">{jobTitle}</span>
                      </div>

                      <div className="item-meta-row">
                        <span className="item-meta-pill">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {dateDisplay}
                        </span>
                        <span className="item-meta-pill">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {timeFormatted}
                        </span>
                      </div>
                    </div>

                    <div className="item-right-actions">
                      <span className="item-status-pill">
                        {iv.status.replace('_', ' ')}
                      </span>
                      <span className="item-chevron-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            className="atm-close-button"
            onClick={() => setShowAllModal(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
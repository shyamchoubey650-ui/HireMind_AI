


// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { apiRequest } from '../../api';
// import { useToast } from '../../context/ToastContext';
// import Modal from '../../components/Modal';
// import ScoreRing from '../../components/ScoreRing';
// import SkillTags from '../../components/SkillTags';
// import ProctoringMonitor from './ProctoringMonitor';
// import QuestionBankManager from './QuestionBankManager';
// import SetGeneratorPanel from './SetGeneratorPanel';
// import Icon from '../../components/Icon';
// import { getJobVisual } from '../../lib/jobVisual';

// const STAGES = [
//   {
//     key: 'ai_screening',
//     label: 'AI Screening',
//     platform: 'PLATFORM 1',
//   },
//   {
//     key: 'shortlisted',
//     label: 'Shortlisted',
//     platform: 'PLATFORM 2',
//   },
//   {
//     key: 'assessment',
//     label: 'Assessment',
//     platform: 'PLATFORM 3',
//   },
//   {
//     key: 'interview',
//     label: 'Interview',
//     platform: 'PLATFORM 4',
//   },
//   {
//     key: 'selected',
//     label: 'Selected',
//     platform: 'PLATFORM 5',
//   },
//   {
//     key: 'rejected',
//     label: 'Rejected',
//     platform: 'PLATFORM 6',
//   },
// ];

// /* ============================================================
//    JOB LIST
// ============================================================ */

// function JobList({
//   onSelect,
//   onOpenQuestionBank,
//   onOpenSetGenerator,
// }) {
//   const [jobs, setJobs] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     let mounted = true;

//     async function loadJobs() {
//       try {
//         const data = await apiRequest('/jobs/mine');
//         if (mounted) {
//           setJobs(Array.isArray(data) ? data : []);
//         }
//       } catch (error) {
//         if (mounted) {
//           setJobs([]);
//         }
//       }
//     }

//     loadJobs();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const filteredJobs = useMemo(() => {
//     if (!jobs) return [];

//     if (!searchQuery.trim()) {
//       return jobs;
//     }

//     const q = searchQuery.toLowerCase().trim();

//     return jobs.filter((j) => {
//       const title = (j.title || '').toLowerCase();
//       const location = (j.location || '').toLowerCase();
//       const status = (j.status || '').toLowerCase();

//       const skills = (j.required_skills || []).some((s) =>
//         String(s).toLowerCase().includes(q)
//       );

//       return (
//         title.includes(q) ||
//         location.includes(q) ||
//         status.includes(q) ||
//         skills
//       );
//     });
//   }, [jobs, searchQuery]);

//   return (
//     <div className="pipeline-outer-card">
//       <style>{`
//         .pipeline-outer-card {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.7) 0%, rgba(8, 10, 22, 0.95) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.35);
//           box-shadow: inset 0 0 30px rgba(139, 92, 246, 0.05), 0 10px 40px rgba(0, 0, 0, 0.6);
//           border-radius: 24px;
//           padding: 28px;
//           margin-bottom: 24px;
//           box-sizing: border-box;
//           width: 100%;
//         }

//         .pipeline-job-row {
//           background: linear-gradient(135deg, rgba(22, 17, 44, 0.75) 0%, rgba(10, 12, 26, 0.95) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.3);
//           box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.04), 0 4px 20px rgba(0, 0, 0, 0.4);
//           border-radius: 18px;
//           padding: 18px 24px;
//           margin-bottom: 16px;
//           cursor: pointer;
//           transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
//           box-sizing: border-box;
//         }

//         .pipeline-job-row:hover {
//           transform: translateY(-2px);
//           border-color: rgba(168, 85, 247, 0.7);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.08), 0 8px 30px rgba(0, 0, 0, 0.6);
//         }

//         .pipeline-job-row.c-teal {
//           border-color: rgba(20, 184, 166, 0.4);
//           background: linear-gradient(135deg, rgba(10, 35, 38, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
//         }

//         .pipeline-job-row.c-violet {
//           border-color: rgba(139, 92, 246, 0.45);
//           background: linear-gradient(135deg, rgba(30, 16, 52, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
//         }

//         .pipeline-job-row.c-blue {
//           border-color: rgba(59, 130, 246, 0.4);
//           background: linear-gradient(135deg, rgba(12, 26, 52, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
//         }

//         .pipeline-job-row.c-orange {
//           border-color: rgba(249, 115, 22, 0.4);
//           background: linear-gradient(135deg, rgba(45, 22, 10, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
//         }

//         .pipeline-view-btn {
//           background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
//           border: none;
//           color: #ffffff;
//           padding: 9px 18px;
//           border-radius: 11px;
//           font-family: var(--font-display, sans-serif);
//           font-weight: 700;
//           font-size: 13px;
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           box-shadow: 0 4px 15px rgba(168, 85, 247, 0.35);
//           white-space: nowrap;
//         }

//         .pipeline-view-btn:hover {
//           opacity: 0.92;
//           transform: translateY(-1px);
//           box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
//         }

//         .pipeline-secondary-btn {
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           color: #cbd5e1;
//           padding: 9px 16px;
//           border-radius: 11px;
//           font-family: var(--font-display, sans-serif);
//           font-weight: 600;
//           font-size: 12.5px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           white-space: nowrap;
//         }

//         .pipeline-secondary-btn:hover {
//           background: rgba(139, 92, 246, 0.15);
//           border-color: rgba(168, 85, 247, 0.6);
//           color: #fff;
//           transform: translateY(-1px);
//         }

//         .pipeline-row-inner {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           width: 100%;
//           gap: 16px;
//         }

//         .aesthetic-search-wrapper {
//           background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.35);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
//           border-radius: 16px;
//           padding: 14px 18px;
//           margin-bottom: 22px;
//           box-sizing: border-box;
//           width: 100%;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           position: relative;
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
//           border: 1.5px solid rgba(139, 92, 246, 0.3);
//           border-radius: 11px;
//           padding: 11px 40px 11px 44px;
//           color: #fff;
//           font-size: 13.5px;
//           box-sizing: border-box;
//           outline: none;
//           font-family: Inter, sans-serif;
//           transition: all 0.25s ease;
//           box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
//           height: 44px;
//         }

//         .aesthetic-search-input-box input:focus {
//           border-color: rgba(168, 85, 247, 0.9);
//           box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.3);
//         }

//         .aesthetic-search-icon-badge {
//           position: absolute;
//           left: 10px;
//           top: 0;
//           bottom: 0;
//           margin: auto;
//           width: 26px;
//           height: 26px;
//           border-radius: 7px;
//           background: rgba(139, 92, 246, 0.15);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #c084fc;
//           pointer-events: none;
//         }

//         @media (max-width: 768px) {
//           .pipeline-outer-card {
//             padding: 18px !important;
//           }

//           .pipeline-row-inner {
//             flex-direction: column;
//             align-items: flex-start !important;
//           }

//           .pipeline-action-box {
//             width: 100%;
//             display: flex;
//             justify-content: flex-end;
//             margin-top: 10px;
//           }

//           .pipeline-view-btn,
//           .pipeline-secondary-btn {
//             width: 100%;
//             justify-content: center;
//           }
//         }
//       `}</style>

//       <div
//         className="row"
//         style={{
//           marginBottom: 18,
//           display: 'flex',
//           alignItems: 'center',
//           gap: 12,
//         }}
//       >
//         <div
//           className="icon-badge violet"
//           style={{
//             width: 40,
//             height: 40,
//             borderRadius: 12,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)',
//             border: '1px solid rgba(139, 92, 246, 0.4)',
//           }}
//         >
//           <Icon name="briefcase" size={19} />
//         </div>

//         <h2
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontWeight: 700,
//             fontSize: 18,
//             color: '#f8fafc',
//             margin: 0,
//           }}
//         >
//           Your postings
//         </h2>
//       </div>

//       <div className="aesthetic-search-wrapper">
//         <div className="aesthetic-search-input-box">
//           <span className="aesthetic-search-icon-badge">
//             <Icon name="search" size={14} />
//           </span>

//           <input
//             type="text"
//             placeholder="Search postings by title, location, or status..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />

//           {searchQuery && (
//             <button
//               onClick={() => setSearchQuery('')}
//               style={{
//                 position: 'absolute',
//                 right: '12px',
//                 top: 0,
//                 bottom: 0,
//                 margin: 'auto',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: '1px solid rgba(255,255,255,0.1)',
//                 color: '#94a3b8',
//                 borderRadius: '6px',
//                 width: '22px',
//                 height: '22px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 fontSize: '11px',
//               }}
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {jobs === null && (
//         <>
//           <div className="skeleton sk-row" />
//           <div className="skeleton sk-row" />
//         </>
//       )}

//       {jobs && filteredJobs.length === 0 && (
//         <div className="empty-state">
//           <div className="es-icon">
//             <Icon name="assessments" size={22} />
//           </div>

//           <div className="es-title">
//             {jobs.length === 0
//               ? 'No jobs posted yet'
//               : 'No jobs match your search'}
//           </div>

//           <div className="es-sub">
//             Head to "Post a Job" to create your first listing.
//           </div>
//         </div>
//       )}

//       {filteredJobs.map((j) => {
//         const { icon, color } = getJobVisual(j.title);

//         return (
//           <div
//             className={`pipeline-job-row c-${color}`}
//             onClick={() => onSelect(j.id, j.title)}
//             key={j.id}
//           >
//             <div className="pipeline-row-inner">
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 16,
//                   flex: 1,
//                   minWidth: 0,
//                   width: '100%',
//                 }}
//               >
//                 <div
//                   className={`icon-badge lg ${color}`}
//                   style={{
//                     width: 52,
//                     height: 52,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     borderRadius: '14px',
//                     flexShrink: 0,
//                   }}
//                 >
//                   <Icon name={icon} size={22} />
//                 </div>

//                 <div style={{ minWidth: 0 }}>
//                   <div
//                     style={{
//                       fontFamily: 'var(--font-display)',
//                       fontWeight: 700,
//                       fontSize: 16.5,
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: 8,
//                       color: '#f8fafc',
//                     }}
//                   >
//                     {j.title}

//                     <Icon
//                       name="checkCircle"
//                       size={15}
//                       style={{ color: 'var(--blue)' }}
//                     />
//                   </div>

//                   <div
//                     className="muted mono"
//                     style={{
//                       fontSize: 11.5,
//                       marginTop: 4,
//                       color: '#94a3b8',
//                     }}
//                   >
//                     {j.location} &middot; {j.status} &middot; min{' '}
//                     {j.min_experience} yrs
//                   </div>
//                 </div>
//               </div>

//               <div
//                 className="pipeline-action-box"
//                 style={{
//                   flexShrink: 0,
//                   display: 'flex',
//                   gap: 8,
//                   flexWrap: 'wrap',
//                 }}
//               >
//                 <button
//                   type="button"
//                   className="pipeline-secondary-btn"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onOpenQuestionBank(j.id, j.title);
//                   }}
//                 >
//                   Question Bank
//                 </button>

//                 <button
//                   type="button"
//                   className="pipeline-secondary-btn"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onOpenSetGenerator(
//                       j.id,
//                       j.title,
//                       j.required_skills
//                     );
//                   }}
//                 >
//                   Generate Sets
//                 </button>

//                 <button
//                   type="button"
//                   className="pipeline-view-btn"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onSelect(j.id, j.title);
//                   }}
//                 >
//                   View pipeline
//                   <Icon name="arrowRight" size={14} />
//                 </button>
//               </div>
//             </div>

//             <div
//               style={{
//                 marginTop: 12,
//                 paddingTop: 10,
//                 borderTop: '1px solid rgba(255,255,255,0.04)',
//               }}
//             >
//               <SkillTags skills={j.required_skills} />
//             </div>
//           </div>
//         );
//       })}

//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: 8,
//           marginTop: 22,
//           paddingTop: 14,
//           borderTop: '1px solid rgba(139, 92, 246, 0.2)',
//           textAlign: 'center',
//         }}
//       >
//         <Icon
//           name="spark"
//           size={14}
//           style={{ color: 'var(--violet)' }}
//         />

//         <span
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontSize: 12.5,
//             color: '#a78bfa',
//           }}
//         >
//           AI match score helps you find the best candidates faster.
//         </span>
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    KANBAN CARD
// ============================================================ */

// function KanbanCard({
//   app,
//   onDragStart,
//   onDragEnd,
//   onClick,
// }) {
//   const matchedList = app.matched_skills || [];
//   const missingList = app.missing_skills || [];
//   const score = app.match_score || 0;

//   const matchLabel =
//     score >= 75
//       ? 'Strong Match'
//       : score >= 50
//         ? 'Moderate Match'
//         : 'Low Match';

//   const matchColor =
//     score >= 75
//       ? '#2dd4bf'
//       : score >= 50
//         ? '#f59e0b'
//         : '#f43f5e';

//   const displayName =
//     app.candidate_name ||
//     `Candidate #${app.candidate_id}`;

//   const avatarLabel = app.candidate_name
//     ? app.candidate_name.trim().charAt(0).toUpperCase()
//     : `#${app.candidate_id}`;

//   return (
//     <div
//       className="kanban-card"
//       draggable
//       onDragStart={(e) =>
//         onDragStart(e, app.id)
//       }
//       onDragEnd={onDragEnd}
//       onClick={() => onClick(app.id)}
//       style={{
//         background: 'linear-gradient(135deg, rgba(25, 20, 48, 0.85) 0%, rgba(10, 12, 26, 0.95) 100%)',
//         border: '1px solid rgba(139, 92, 246, 0.35)',
//         boxShadow: 'inset 0 0 15px rgba(139, 92, 246, 0.05)',
//         borderRadius: '14px',
//         padding: '14px 16px',
//         marginBottom: '12px',
//         cursor: 'grab',
//         transition: 'all 0.2s ease',
//         boxSizing: 'border-box',
//       }}
//     >
//       <div
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           marginBottom: '10px',
//           gap: '8px',
//         }}
//       >
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '10px',
//             minWidth: 0,
//           }}
//         >
//           <div
//             style={{
//               width: '30px',
//               height: '30px',
//               borderRadius: '50%',
//               background: 'linear-gradient(135deg, #a855f7, #f97316)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontSize: '11px',
//               fontWeight: 'bold',
//               color: '#fff',
//               flexShrink: 0,
//             }}
//           >
//             {avatarLabel}
//           </div>

//           <div style={{ minWidth: 0 }}>
//             <div
//               style={{
//                 fontFamily: 'var(--font-display)',
//                 fontWeight: 700,
//                 fontSize: '13.5px',
//                 color: '#fff',
//                 whiteSpace: 'nowrap',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//               }}
//             >
//               {displayName}
//             </div>

//             <div
//               style={{
//                 fontSize: '10px',
//                 color: matchColor,
//                 fontFamily: 'var(--font-mono)',
//                 fontWeight: 600,
//               }}
//             >
//               {matchLabel}
//             </div>
//           </div>
//         </div>

//         <div
//           style={{
//             background: 'rgba(245, 158, 11, 0.12)',
//             border: '1px solid rgba(245, 158, 11, 0.3)',
//             color: '#f59e0b',
//             padding: '4px 8px',
//             borderRadius: '8px',
//             fontSize: '12px',
//             fontWeight: '700',
//             fontFamily: 'var(--font-mono)',
//             flexShrink: 0,
//           }}
//         >
//           {score}%
//         </div>
//       </div>

//       <div
//         style={{
//           display: 'flex',
//           gap: '8px',
//           marginBottom: '10px',
//           fontSize: '10.5px',
//           fontFamily: 'var(--font-mono)',
//         }}
//       >
//         <span
//           style={{
//             color: '#2dd4bf',
//             background: 'rgba(45, 212, 191, 0.08)',
//             padding: '2px 6px',
//             borderRadius: '4px',
//             border: '1px solid rgba(45, 212, 191, 0.2)',
//           }}
//         >
//           ✓ {matchedList.length} matched
//         </span>

//         <span
//           style={{
//             color: '#f43f5e',
//             background: 'rgba(244, 63, 94, 0.08)',
//             padding: '2px 6px',
//             borderRadius: '4px',
//             border: '1px solid rgba(244, 63, 94, 0.2)',
//           }}
//         >
//           ✕ {missingList.length} missing
//         </span>
//       </div>

//       <div
//         style={{
//           display: 'flex',
//           flexWrap: 'wrap',
//           gap: '4px',
//         }}
//       >
//         {matchedList.slice(0, 3).map((s) => (
//           <span
//             key={s}
//             style={{
//               fontSize: '10px',
//               background: 'rgba(139, 92, 246, 0.15)',
//               color: '#d8b4fe',
//               padding: '2px 6px',
//               borderRadius: '4px',
//               border: '1px solid rgba(139, 92, 246, 0.3)',
//             }}
//           >
//             {s}
//           </span>
//         ))}

//         {matchedList.length > 3 && (
//           <span
//             style={{
//               fontSize: '10px',
//               color: '#94a3b8',
//               padding: '2px 4px',
//             }}
//           >
//             +{matchedList.length - 3} more
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    KANBAN COLUMN
// ============================================================ */

// function KanbanColumn({
//   stage,
//   apps,
//   onDrop,
//   onDragStart,
//   onDragEnd,
//   onCardClick,
// }) {
//   const [dragOver, setDragOver] = useState(false);

//   return (
//     <div
//       className={`kanban-col${dragOver ? ' drag-over' : ''}`}
//       onDragOver={(e) => {
//         e.preventDefault();
//         setDragOver(true);
//       }}
//       onDragLeave={() => setDragOver(false)}
//       onDrop={(e) => {
//         e.preventDefault();
//         setDragOver(false);
//         onDrop(stage.key);
//       }}
//       style={{
//         background: 'linear-gradient(135deg, rgba(16, 13, 32, 0.7) 0%, rgba(8, 10, 22, 0.9) 100%)',
//         border: '1.5px solid rgba(139, 92, 246, 0.3)',
//         boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.04)',
//         borderRadius: '18px',
//         padding: '16px',
//         minWidth: '280px',
//         flex: '1',
//         display: 'flex',
//         flexDirection: 'column',
//         boxSizing: 'border-box',
//       }}
//     >
//       <div
//         className="kanban-col-head"
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           marginBottom: '14px',
//           borderBottom: '1px solid rgba(255,255,255,0.06)',
//           paddingBottom: '10px',
//         }}
//       >
//         <div>
//           <div
//             className="plat"
//             style={{
//               fontSize: '10px',
//               textTransform: 'uppercase',
//               color: '#94a3b8',
//               letterSpacing: '0.08em',
//               fontFamily: 'var(--font-mono)',
//             }}
//           >
//             {stage.platform}
//           </div>

//           <div
//             className="label"
//             style={{
//               fontFamily: 'var(--font-display)',
//               fontWeight: 700,
//               fontSize: '15px',
//               color: '#fff',
//               marginTop: '2px',
//             }}
//           >
//             {stage.label}
//           </div>
//         </div>

//         <span
//           className="kanban-count"
//           style={{
//             background: 'rgba(139, 92, 246, 0.15)',
//             color: '#c084fc',
//             width: '24px',
//             height: '24px',
//             borderRadius: '50%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '12px',
//             fontWeight: 'bold',
//           }}
//         >
//           {apps.length}
//         </span>
//       </div>

//       <div
//         className="kanban-cards"
//         style={{
//           flex: 1,
//           minHeight: '120px',
//         }}
//       >
//         {apps.length === 0 && (
//           <div
//             className="muted"
//             style={{
//               fontSize: '12px',
//               textAlign: 'center',
//               padding: '24px 4px',
//               color: '#64748b',
//             }}
//           >
//             No candidates
//           </div>
//         )}

//         {apps.map((a) => (
//           <KanbanCard
//             app={a}
//             onDragStart={onDragStart}
//             onDragEnd={onDragEnd}
//             onClick={onCardClick}
//             key={a.id}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    CANDIDATE DETAIL
// ============================================================ */

// function DetailModalBody({
//   app,
//   onMoveStage,
//   onAssignAssessment,
//   onScheduleInterview,
//   onViewProctoring,
// }) {
//   const displayName =
//     app.candidate_name ||
//     `Candidate #${app.candidate_id}`;

//   return (
//     <div>
//       <div
//         className="row"
//         style={{
//           alignItems: 'flex-start',
//           marginBottom: 6,
//           paddingRight: 40,
//         }}
//       >
//         <div>
//           <div
//             style={{
//               fontFamily: 'var(--font-display)',
//               fontWeight: 700,
//               fontSize: 17,
//             }}
//           >
//             {displayName}
//           </div>

//           {app.candidate_email && (
//             <div
//               className="muted mono"
//               style={{
//                 fontSize: 11.5,
//                 marginTop: 3,
//               }}
//             >
//               {app.candidate_email}
//             </div>
//           )}

//           <span
//             className={`status-pill status-${app.status}`}
//             style={{
//               marginTop: 6,
//               display: 'inline-block',
//             }}
//           >
//             {app.status.replace('_', ' ')}
//           </span>
//         </div>

//         <ScoreRing
//           pct={app.match_score}
//           size={64}
//           stroke={5}
//         />
//       </div>

//       <div
//         className="grid-2"
//         style={{ marginTop: 16 }}
//       >
//         <div>
//           <div
//             className="muted mono"
//             style={{
//               fontSize: 10.5,
//               textTransform: 'uppercase',
//               letterSpacing: '.08em',
//               marginBottom: 6,
//             }}
//           >
//             Matched
//           </div>

//           <SkillTags
//             skills={app.matched_skills}
//             cls="matched"
//           />
//         </div>

//         <div>
//           <div
//             className="muted mono"
//             style={{
//               fontSize: 10.5,
//               textTransform: 'uppercase',
//               letterSpacing: '.08em',
//               marginBottom: 6,
//             }}
//           >
//             Missing
//           </div>

//           <SkillTags
//             skills={app.missing_skills}
//             cls="missing"
//           />
//         </div>
//       </div>

//       <div className="divider-label">
//         match breakdown
//       </div>

//       {Object.entries(
//         app.match_breakdown?.components || {}
//       ).map(([k, v]) => (
//         <div
//           className="breakdown-item"
//           key={k}
//         >
//           <div className="bd-top">
//             <span className="bd-label">
//               {k.replace(/_/g, ' ')}{' '}
//               <span
//                 className="mono"
//                 style={{ opacity: 0.6 }}
//               >
//                 ({v.weight_pct}%)
//               </span>
//             </span>

//             <span className="bd-score">
//               {v.score}%
//             </span>
//           </div>

//           <div className="bd-bar-track">
//             <div
//               className="bd-bar-fill"
//               style={{
//                 width: `${v.score}%`,
//               }}
//             />
//           </div>

//           <div className="bd-explain">
//             {v.explanation}
//           </div>
//         </div>
//       ))}

//       <div className="divider-label">
//         AI interview questions
//       </div>

//       <ol className="q-list">
//         {(app.interview_questions || []).map(
//           (q, i) => (
//             <li key={i}>{q}</li>
//           )
//         )}
//       </ol>

//       <div className="divider-label">
//         actions
//       </div>

//       <div
//         className="row"
//         style={{
//           gap: 8,
//           flexWrap: 'wrap',
//         }}
//       >
//         <button
//           className="secondary small"
//           style={{ margin: 0 }}
//           onClick={onAssignAssessment}
//         >
//           Assign assessment
//         </button>

//         <button
//           className="secondary small"
//           style={{ margin: 0 }}
//           onClick={onScheduleInterview}
//         >
//           Schedule interview
//         </button>

//         <button
//           className="secondary small"
//           style={{ margin: 0 }}
//           onClick={onViewProctoring}
//         >
//           View Proctoring
//         </button>
//       </div>

//       <label>Move to stage</label>

//       <select
//         value={app.status}
//         onChange={(e) =>
//           onMoveStage(e.target.value)
//         }
//       >
//         {STAGES.map((s) => (
//           <option
//             value={s.key}
//             key={s.key}
//           >
//             {s.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// /* ============================================================
//    SCHEDULE INTERVIEW
// ============================================================ */

// function ScheduleModalBody({
//   onSchedule,
// }) {
//   const [type, setType] = useState('technical');
//   const [date, setDate] = useState('');
//   const [hour, setHour] = useState('07');
//   const [minute, setMinute] = useState('00');
//   const [ampm, setAmpm] = useState('AM');
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [link, setLink] = useState('');
//   const [notes, setNotes] = useState('');
//   const toast = useToast();

//   const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
//   const minutesList = ['00', '15', '30', '45'];
//   const timeDisplay = `${hour}:${minute} ${ampm}`;

//   function submit() {
//     if (!date || !timeDisplay) {
//       toast('Pick a date & time', 'error');
//       return;
//     }

//     let parsedHours = parseInt(hour, 10);
//     if (ampm === 'PM' && parsedHours < 12) parsedHours += 12;
//     if (ampm === 'AM' && parsedHours === 12) parsedHours = 0;

//     onSchedule({
//       interview_type: type,
//       scheduled_at: `${date}T${String(parsedHours).padStart(2, '0')}:${String(parseInt(minute, 10)).padStart(2, '0')}:00+05:30`,
//       meeting_link: link.trim(),
//       notes: notes.trim(),
//     });
//   }

//   return (
//     <div style={{ fontFamily: 'Inter, sans-serif' }}>
//       <style>{`
//         .sched-modal-wrap label {
//           display: block;
//           font-family: var(--font-mono, monospace);
//           font-size: 10.5px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: #94a3b8;
//           margin-bottom: 6px;
//           margin-top: 14px;
//         }

//         .sched-modal-wrap select,
//         .sched-modal-wrap input,
//         .sched-modal-wrap textarea {
//           width: 100%;
//           background: rgba(15, 15, 32, 0.95);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           border-radius: 12px;
//           padding: 11px 14px;
//           color: #fff;
//           font-size: 13px;
//           outline: none;
//           box-sizing: border-box;
//           font-family: Inter, sans-serif;
//           transition: all 0.25s ease;
//           box-shadow: inset 0 2px 5px rgba(0,0,0,0.4);
//         }

//         .sched-modal-wrap input[type="date"]::-webkit-calendar-picker-indicator {
//           filter: invert(1) brightness(0.8) sepia(1) hue-rotate(220deg) saturate(3);
//           cursor: pointer;
//         }

//         .sched-modal-wrap select:focus,
//         .sched-modal-wrap input:focus,
//         .sched-modal-wrap textarea:focus {
//           border-color: rgba(168, 85, 247, 0.9);
//           box-shadow: 0 0 15px rgba(139, 92, 246, 0.35), inset 0 2px 5px rgba(0,0,0,0.4);
//         }

//         .time-picker-dropdown {
//           position: absolute;
//           top: calc(100% + 6px);
//           left: 0;
//           right: 0;
//           background: linear-gradient(135deg, rgba(22, 16, 42, 0.99) 0%, rgba(10, 12, 26, 0.99) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.6);
//           box-shadow: 0 20px 50px rgba(0,0,0,0.9);
//           border-radius: 14px;
//           padding: 14px;
//           z-index: 99999;
//           display: flex;
//           gap: 12px;
//           align-items: center;
//           justify-content: space-between;
//         }

//         .time-col {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           gap: 4px;
//           max-height: 150px;
//           overflow-y: auto;
//         }

//         .time-item {
//           padding: 8px;
//           text-align: center;
//           border-radius: 8px;
//           font-family: var(--font-mono, monospace);
//           font-size: 13px;
//           color: #cbd5e1;
//           cursor: pointer;
//           background: rgba(255,255,255,0.02);
//           transition: all 0.2s ease;
//         }

//         .time-item:hover,
//         .time-item.active {
//           background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(249, 115, 22, 0.35));
//           color: #fff;
//           font-weight: 700;
//         }

//         .sched-submit-btn {
//           width: 100%;
//           margin-top: 22px;
//           padding: 13px;
//           background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
//           border: none;
//           border-radius: 12px;
//           color: #fff;
//           font-family: var(--font-display, sans-serif);
//           font-weight: 700;
//           font-size: 14px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           box-shadow: 0 6px 20px rgba(168, 85, 247, 0.35);
//         }

//         .sched-submit-btn:hover {
//           opacity: 0.92;
//           transform: translateY(-1px);
//         }
//       `}</style>

//       <div className="sched-modal-wrap">
//         <h2
//           style={{
//             fontFamily: 'var(--font-display)',
//             fontSize: 18,
//             color: '#fff',
//             marginBottom: 2,
//             fontWeight: 700,
//           }}
//         >
//           Schedule interview
//         </h2>

//         <div
//           style={{
//             fontSize: 11.5,
//             color: '#94a3b8',
//             fontFamily: 'var(--font-mono)',
//             marginBottom: 16,
//           }}
//         >
//           Set up a live interview session with the candidate.
//         </div>

//         <label>Interview type</label>

//         <select
//           value={type}
//           onChange={(e) => setType(e.target.value)}
//         >
//           <option value="technical">Technical</option>
//           <option value="hr">HR</option>
//           <option value="behavioral">Behavioral</option>
//         </select>

//         <label>Date</label>

//         <input
//           type="date"
//           value={date}
//           onChange={(e) => setDate(e.target.value)}
//         />

//         <label>Time & Period</label>

//         <div style={{ position: 'relative' }}>
//           <div
//             onClick={() => setShowTimePicker(!showTimePicker)}
//             style={{
//               width: '100%',
//               background: 'rgba(15, 15, 32, 0.95)',
//               border: '1.5px solid rgba(139, 92, 246, 0.4)',
//               borderRadius: '12px',
//               padding: '11px 14px',
//               color: '#fff',
//               fontSize: '13px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               boxSizing: 'border-box',
//               fontFamily: 'Inter, sans-serif',
//               boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.4)',
//             }}
//           >
//             <span
//               style={{
//                 fontFamily: 'var(--font-mono)',
//                 fontWeight: 600,
//                 color: '#f8fafc',
//               }}
//             >
//               {timeDisplay}
//             </span>

//             <span style={{ color: '#a78bfa' }}>🕒</span>
//           </div>

//           {showTimePicker && (
//             <div
//               className="time-picker-dropdown"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="time-col">
//                 <div
//                   style={{
//                     fontSize: '10px',
//                     color: '#94a3b8',
//                     textAlign: 'center',
//                     fontFamily: 'var(--font-mono)',
//                     marginBottom: 4,
//                   }}
//                 >
//                   HOUR
//                 </div>

//                 {hoursList.map((h) => (
//                   <div
//                     key={h}
//                     className={`time-item ${hour === h ? 'active' : ''}`}
//                     onClick={() => setHour(h)}
//                   >
//                     {h}
//                   </div>
//                 ))}
//               </div>

//               <div className="time-col">
//                 <div
//                   style={{
//                     fontSize: '10px',
//                     color: '#94a3b8',
//                     textAlign: 'center',
//                     fontFamily: 'var(--font-mono)',
//                     marginBottom: 4,
//                   }}
//                 >
//                   MIN
//                 </div>

//                 {minutesList.map((m) => (
//                   <div
//                     key={m}
//                     className={`time-item ${minute === m ? 'active' : ''}`}
//                     onClick={() => setMinute(m)}
//                   >
//                     {m}
//                   </div>
//                 ))}
//               </div>

//               <div className="time-col" style={{ flex: 0.8 }}>
//                 <div
//                   style={{
//                     fontSize: '10px',
//                     color: '#94a3b8',
//                     textAlign: 'center',
//                     fontFamily: 'var(--font-mono)',
//                     marginBottom: 4,
//                   }}
//                 >
//                   PERIOD
//                 </div>

//                 <div
//                   className={`time-item ${ampm === 'AM' ? 'active' : ''}`}
//                   onClick={() => setAmpm('AM')}
//                 >
//                   AM
//                 </div>

//                 <div
//                   className={`time-item ${ampm === 'PM' ? 'active' : ''}`}
//                   onClick={() => setAmpm('PM')}
//                 >
//                   PM
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setShowTimePicker(false)}
//                   style={{
//                     marginTop: 8,
//                     padding: '6px',
//                     background: '#8b5cf6',
//                     border: 'none',
//                     borderRadius: '6px',
//                     color: '#fff',
//                     fontSize: '11px',
//                     fontWeight: 'bold',
//                     cursor: 'pointer',
//                   }}
//                 >
//                   Done
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         <label>Meeting link (optional)</label>

//         <input
//           type="text"
//           value={link}
//           onChange={(e) => setLink(e.target.value)}
//           placeholder="https://meet.google.com/..."
//         />

//         <label>Notes (optional)</label>

//         <textarea
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//           placeholder="Panel, focus areas, etc."
//           style={{
//             minHeight: 70,
//             resize: 'vertical',
//           }}
//         />

//         <button
//           type="button"
//           className="sched-submit-btn"
//           onClick={submit}
//         >
//           Schedule
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ============================================================
//    ASSIGN ASSESSMENT MODAL (PREMIUM REDESIGN)
// ============================================================ */

// function AssignModalBody({
//   jobId,
//   onAssignExisting,
//   onGenerateNew,
// }) {
//   const [assessmentGroups, setAssessmentGroups] = useState(null);
//   const [selectedSet, setSelectedSet] = useState(null);
//   const [activeMode, setActiveMode] = useState('sets');
//   const [loading, setLoading] = useState(false);
//   const toast = useToast();

//   useEffect(() => {
//     let cancelled = false;

//     async function loadAssessmentSets() {
//       try {
//         const assessmentResponse = await apiRequest(`/assessments/job/${jobId}`);
//         if (cancelled) return;

//         const assessments = Array.isArray(assessmentResponse)
//           ? assessmentResponse
//           : assessmentResponse?.assessments || assessmentResponse?.items || [];

//         const groups = await Promise.all(
//           assessments.map(async (assessment) => {
//             try {
//               const setResponse = await apiRequest(`/assessments/${assessment.id}/sets`);
//               const sets = Array.isArray(setResponse)
//                 ? setResponse
//                 : setResponse?.sets || setResponse?.items || [];

//               return {
//                 ...assessment,
//                 sets: Array.isArray(sets) ? sets : [],
//               };
//             } catch (e) {
//               return {
//                 ...assessment,
//                 sets: [],
//               };
//             }
//           })
//         );

//         if (cancelled) return;

//         const recruiterAssessments = groups.filter(
//           (assessment) => Array.isArray(assessment.sets) && assessment.sets.length > 0
//         );

//         setAssessmentGroups(recruiterAssessments);

//         if (recruiterAssessments.length > 0) {
//           const firstAssessment = recruiterAssessments[0];
//           const firstSet = firstAssessment.sets[0];

//           if (firstSet) {
//             setSelectedSet({
//               assessmentId: firstAssessment.id,
//               setId: firstSet.id,
//             });
//           }
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setAssessmentGroups([]);
//         }
//       }
//     }

//     loadAssessmentSets();

//     return () => {
//       cancelled = true;
//     };
//   }, [jobId]);

//   async function handleAssignSelected() {
//     if (!selectedSet?.assessmentId || !selectedSet?.setId) {
//       toast('Please choose an assessment set.', 'error');
//       return;
//     }

//     setLoading(true);
//     try {
//       await onAssignExisting(selectedSet.assessmentId, selectedSet.setId);
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (assessmentGroups === null) {
//     return (
//       <div style={{ padding: 28, color: '#94a3b8', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
//         Loading assessment sets...
//       </div>
//     );
//   }

//   return (
//     <div className="assign-modal-wrap">
//       <style>{`
//         .assign-modal-wrap {
//           color: #fff;
//           font-family: Inter, sans-serif;
//           box-sizing: border-box;
//         }

//         .assign-title {
//           font-family: var(--font-display, sans-serif);
//           font-size: 22px;
//           font-weight: 800;
//           margin: 0;
//           color: #ffffff;
//           letter-spacing: -0.02em;
//         }

//         .assign-subtitle {
//           color: #94a3b8;
//           font-size: 13px;
//           line-height: 1.5;
//           margin-top: 6px;
//         }

//         .assign-mode-tabs {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 10px;
//           margin: 22px 0 20px;
//         }

//         .assign-mode-tab {
//           border: 1.5px solid rgba(139, 92, 246, 0.3);
//           background: rgba(18, 14, 38, 0.7);
//           color: #cbd5e1;
//           border-radius: 14px;
//           padding: 12px 14px;
//           cursor: pointer;
//           font-family: var(--font-display, sans-serif);
//           font-weight: 700;
//           font-size: 13px;
//           transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
//           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 6px;
//         }

//         .assign-mode-tab:hover {
//           border-color: rgba(168, 85, 247, 0.7);
//           color: #fff;
//           background: rgba(26, 20, 52, 0.85);
//         }

//         .assign-mode-tab.active {
//           background: linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(249, 115, 22, 0.2) 100%);
//           border-color: #a855f7;
//           color: #ffffff;
//           box-shadow: 0 0 25px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.15);
//         }

//         .section-label {
//           font-family: var(--font-mono, monospace);
//           font-size: 10px;
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           color: #94a3b8;
//           margin-bottom: 8px;
//           font-weight: 600;
//         }

//         .set-scroll-area {
//           max-height: 330px;
//           overflow-y: auto;
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           padding-right: 4px;
//         }

//         .set-scroll-area::-webkit-scrollbar {
//           width: 5px;
//         }

//         .set-scroll-area::-webkit-scrollbar-thumb {
//           background: rgba(139, 92, 246, 0.3);
//           border-radius: 4px;
//         }

//         .assessment-container {
//           border: 1px solid rgba(139, 92, 246, 0.2);
//           background: rgba(13, 10, 28, 0.7);
//           border-radius: 16px;
//           padding: 12px;
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .set-option-card {
//           width: 100%;
//           text-align: left;
//           border: 1.5px solid rgba(139, 92, 246, 0.25);
//           background: linear-gradient(135deg, rgba(20, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
//           border-radius: 14px;
//           padding: 14px 16px;
//           color: #fff;
//           cursor: pointer;
//           transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
//           box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
//           box-sizing: border-box;
//           position: relative;
//         }

//         .set-option-card:hover {
//           border-color: rgba(168, 85, 247, 0.65);
//           transform: translateY(-1px);
//         }

//         .set-option-card.selected {
//           border-color: #c084fc;
//           background: linear-gradient(135deg, rgba(124, 58, 237, 0.28) 0%, rgba(217, 70, 239, 0.14) 100%);
//           box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.1);
//         }

//         .set-option-top {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 10px;
//         }

//         .set-name {
//           font-family: var(--font-display, sans-serif);
//           font-size: 15px;
//           font-weight: 800;
//           color: #ffffff;
//         }

//         .set-badge-tag {
//           font-family: var(--font-mono, monospace);
//           font-size: 9.5px;
//           font-weight: 700;
//           color: #c084fc;
//           border: 1px solid rgba(168, 85, 247, 0.4);
//           background: rgba(139, 92, 246, 0.15);
//           border-radius: 6px;
//           padding: 3px 8px;
//           white-space: nowrap;
//         }

//         .selected-circle {
//           width: 22px;
//           height: 22px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: rgba(45, 212, 191, 0.18);
//           border: 1.5px solid #2dd4bf;
//           color: #2dd4bf;
//           font-size: 12px;
//           font-weight: 900;
//           box-shadow: 0 0 10px rgba(45, 212, 191, 0.4);
//         }

//         .set-description {
//           margin-top: 5px;
//           color: #94a3b8;
//           font-size: 11.5px;
//           line-height: 1.5;
//         }

//         .set-meta-chips {
//           display: flex;
//           gap: 6px;
//           margin-top: 10px;
//           flex-wrap: wrap;
//         }

//         .set-meta-chips span {
//           font-family: var(--font-mono, monospace);
//           font-size: 10px;
//           color: #cbd5e1;
//           padding: 3px 8px;
//           border-radius: 6px;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid rgba(255, 255, 255, 0.08);
//         }

//         .assign-primary-btn {
//           width: 100%;
//           margin-top: 18px;
//           padding: 14px;
//           border: none;
//           border-radius: 13px;
//           color: #ffffff;
//           font-family: var(--font-display, sans-serif);
//           font-size: 14px;
//           font-weight: 800;
//           cursor: pointer;
//           background: linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f97316 100%);
//           box-shadow: 0 6px 25px rgba(168, 85, 247, 0.45);
//           transition: all 0.25s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//         }

//         .assign-primary-btn:hover:not(:disabled) {
//           transform: translateY(-1px);
//           box-shadow: 0 8px 30px rgba(249, 115, 22, 0.55);
//           filter: brightness(1.05);
//         }

//         .assign-primary-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//           transform: none;
//         }

//         .ai-generate-card {
//           border: 1.5px solid rgba(168, 85, 247, 0.35);
//           border-radius: 18px;
//           padding: 22px;
//           background: linear-gradient(135deg, rgba(30, 18, 56, 0.6) 0%, rgba(10, 12, 26, 0.95) 100%);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.08);
//         }

//         .ai-header-icon {
//           width: 44px;
//           height: 44px;
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(249, 115, 22, 0.25) 100%);
//           border: 1px solid rgba(168, 85, 247, 0.5);
//           color: #ffffff;
//           margin-bottom: 12px;
//           box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
//         }

//         .ai-feature-items {
//           margin: 14px 0 0;
//           padding: 0;
//           list-style: none;
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }

//         .ai-feature-items li {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           color: #cbd5e1;
//           font-size: 11.5px;
//         }

//         .ai-check-icon {
//           color: #2dd4bf;
//           font-weight: 800;
//         }
//       `}</style>

//       <h2 className="assign-title">Assign assessment</h2>
//       <div className="assign-subtitle">
//         Choose an exact recruiter-created assessment set or generate a completely new AI assessment for this candidate.
//       </div>

//       <div className="assign-mode-tabs">
//         <button
//           type="button"
//           className={`assign-mode-tab ${activeMode === 'sets' ? 'active' : ''}`}
//           onClick={() => setActiveMode('sets')}
//         >
//           Recruiter Sets
//         </button>

//         <button
//           type="button"
//           className={`assign-mode-tab ${activeMode === 'ai' ? 'active' : ''}`}
//           onClick={() => setActiveMode('ai')}
//         >
//           ✨ AI Generate
//         </button>
//       </div>

//       {activeMode === 'sets' && (
//         <div>
//           {assessmentGroups.length === 0 ? (
//             <div style={{ textAlign: 'center', padding: '24px 10px', border: '1.5px dashed rgba(139,92,246,0.3)', borderRadius: 14, color: '#94a3b8' }}>
//               <div style={{ fontSize: 24, marginBottom: 8 }}>📚</div>
//               No recruiter-created assessment sets are available for this job yet.
//               <div style={{ marginTop: 6, color: '#64748b', fontSize: '11px' }}>
//                 Use "Generate Sets" on the job card to create assessment sets first.
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="section-label">Select an exact assessment set</div>

//               <div className="set-scroll-area">
//                 {assessmentGroups.map((assessment) => (
//                   <div className="assessment-container" key={assessment.id}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
//                       <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
//                         {assessment.title || 'Skills Assessment'}
//                       </span>
//                       <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#a78bfa' }}>
//                         {assessment.sets.length} SETS
//                       </span>
//                     </div>

//                     {assessment.sets.map((set, index) => {
//                       const setNumber = set.set_number ?? set.set_no ?? set.set_index ?? index + 1;
//                       const questionCount = Array.isArray(set.questions)
//                         ? set.questions.length
//                         : set.question_count ?? set.questions_count ?? 0;
//                       const totalMarks = set.total_marks ?? set.marks;

//                       const isSelected =
//                         String(selectedSet?.assessmentId) === String(assessment.id) &&
//                         String(selectedSet?.setId) === String(set.id);

//                       return (
//                         <div
//                           key={set.id}
//                           className={`set-option-card ${isSelected ? 'selected' : ''}`}
//                           onClick={() =>
//                             setSelectedSet({
//                               assessmentId: assessment.id,
//                               setId: set.id,
//                             })
//                           }
//                         >
//                           <div className="set-option-top">
//                             <span className="set-name">
//                               {set.set_name || `Set ${setNumber}`}
//                             </span>

//                             {isSelected ? (
//                               <div className="selected-circle">✓</div>
//                             ) : (
//                               <span className="set-badge-tag">SET {setNumber}</span>
//                             )}
//                           </div>

//                           <div className="set-description">
//                             {questionCount} questions from this recruiter-generated set.
//                           </div>

//                           <div className="set-meta-chips">
//                             <span>{questionCount} questions</span>
//                             {totalMarks != null && <span>{totalMarks} marks</span>}
//                             <span>Set ID: {set.id}</span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>

//               <button
//                 type="button"
//                 className="assign-primary-btn"
//                 disabled={!selectedSet || loading}
//                 onClick={handleAssignSelected}
//               >
//                 {loading ? 'Assigning selected set...' : 'Assign selected set'}
//               </button>
//             </>
//           )}
//         </div>
//       )}

//       {activeMode === 'ai' && (
//         <div className="ai-generate-card">
//           <div className="ai-header-icon">
//             <Icon name="spark" size={20} />
//           </div>

//           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#fff' }}>
//             Generate a new AI assessment
//           </div>

//           <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>
//             AI will create assessment questions automatically using this job's title and required skills, then assign the generated assessment directly to this candidate.
//           </div>

//           <ul className="ai-feature-items">
//             <li><span className="ai-check-icon">✓</span> Questions generated from job skills</li>
//             <li><span className="ai-check-icon">✓</span> Assessment created automatically</li>
//             <li><span className="ai-check-icon">✓</span> Assessment assigned immediately</li>
//             <li><span className="ai-check-icon">✓</span> Candidate moved to Assessment stage</li>
//           </ul>

//           <button
//             type="button"
//             className="assign-primary-btn"
//             disabled={loading}
//             onClick={async () => {
//               setLoading(true);
//               try {
//                 await onGenerateNew();
//               } finally {
//                 setLoading(false);
//               }
//             }}
//           >
//             {loading ? 'Generating & assigning...' : '✨ Generate AI assessment & assign'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ============================================================
//    MAIN PIPELINE
// ============================================================ */

// export default function Pipeline() {
//   const [job, setJob] = useState(null);
//   const [apps, setApps] = useState(null);
//   const [draggedId, setDraggedId] = useState(null);
//   const [detailAppId, setDetailAppId] = useState(null);
//   const [scheduleAppId, setScheduleAppId] = useState(null);
//   const [assignAppId, setAssignAppId] = useState(null);
//   const [monitorAppId, setMonitorAppId] = useState(null);
//   const [qbankJob, setQbankJob] = useState(null);
//   const [setgenJob, setSetgenJob] = useState(null);
//   const toast = useToast();

//   const selectJob = useCallback(
//     async (jobId, jobTitle) => {
//       setJob({ id: jobId, title: jobTitle });
//       setApps(null);
//       try {
//         const data = await apiRequest(`/jobs/${jobId}/applicants`);
//         setApps(data);
//       } catch (e) {
//         toast(e.message, 'error');
//       }
//     },
//     [toast]
//   );

//   function updateAppLocally(appId, patch) {
//     setApps((prev) => {
//       if (!prev) return prev;
//       return prev.map((a) =>
//         a.id === appId ? { ...a, ...patch } : a
//       );
//     });
//   }

//   async function handleDrop(newStatus) {
//     if (draggedId == null) return;
//     const app = apps?.find((a) => a.id === draggedId);
//     if (!app || app.status === newStatus) {
//       setDraggedId(null);
//       return;
//     }

//     const prevStatus = app.status;
//     updateAppLocally(draggedId, { status: newStatus });

//     try {
//       await apiRequest(`/applications/${draggedId}/status`, {
//         method: 'PATCH',
//         body: { status: newStatus },
//       });
//       toast(`Moved to ${newStatus.replace('_', ' ')}`, 'success', 2200);
//     } catch (err) {
//       updateAppLocally(draggedId, { status: prevStatus });
//       toast('Could not update status: ' + err.message, 'error');
//     }

//     setDraggedId(null);
//   }

//   async function moveStage(appId, status) {
//     const app = apps?.find((a) => a.id === appId);
//     if (!app) return;
//     const prev = app.status;
//     updateAppLocally(appId, { status });

//     try {
//       await apiRequest(`/applications/${appId}/status`, {
//         method: 'PATCH',
//         body: { status },
//       });
//       toast(`Moved to ${status.replace('_', ' ')}`, 'success', 2200);
//       setDetailAppId(null);
//     } catch (e) {
//       updateAppLocally(appId, { status: prev });
//       toast('Could not update: ' + e.message, 'error');
//     }
//   }

//   async function scheduleInterview(payload) {
//     try {
//       await apiRequest('/interviews', {
//         method: 'POST',
//         body: { application_id: scheduleAppId, ...payload },
//       });
//       toast('Interview scheduled', 'success');
//       updateAppLocally(scheduleAppId, { status: 'interview' });
//       setScheduleAppId(null);
//       setDetailAppId(null);
//     } catch (e) {
//       toast(e.message, 'error');
//     }
//   }

//   async function assignExisting(assessmentId, setId) {
//     try {
//       if (!assessmentId) throw new Error('No assessment selected.');
//       if (!setId) throw new Error('No assessment set selected.');
//       if (!assignAppId) throw new Error('No candidate selected.');

//       await apiRequest(`/assessments/${assessmentId}/assign-set`, {
//         method: 'POST',
//         body: {
//           application_id: assignAppId,
//           set_id: setId,
//         },
//       });

//       finishAssign('Selected assessment set assigned');
//     } catch (e) {
//       toast(e.message || 'Could not assign assessment set.', 'error');
//       throw e;
//     }
//   }

//   async function generateAndAssign() {
//     try {
//       if (!job?.id) throw new Error('No job selected.');
//       if (!assignAppId) throw new Error('No candidate selected.');

//       const assessment = await apiRequest('/assessments', {
//         method: 'POST',
//         body: {
//           job_id: job.id,
//           title: `${job.title} — AI Skills Assessment`,
//           auto_generate: true,
//           num_questions: 6,
//         },
//       });

//       if (!assessment || !assessment.id) {
//         throw new Error('AI assessment was created but no assessment ID was returned.');
//       }

//       await apiRequest(`/assessments/${assessment.id}/assign-random-set`, {
//         method: 'POST',
//         body: { application_id: assignAppId },
//       });

//       finishAssign('AI assessment generated and assigned');
//     } catch (e) {
//       toast(e.message || 'Could not generate AI assessment.', 'error');
//       throw e;
//     }
//   }

//   function finishAssign(message = 'Assessment assigned') {
//     toast(message, 'success');
//     updateAppLocally(assignAppId, { status: 'assessment' });
//     setAssignAppId(null);
//     setDetailAppId(null);
//   }

//   const detailApp = apps?.find((a) => a.id === detailAppId);

//   return (
//     <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
//       <style>{`
//         .kanban-board-container {
//           display: flex;
//           gap: 16px;
//           overflow-x: auto;
//           padding-bottom: 16px;
//           width: 100%;
//           box-sizing: border-box;
//         }

//         .kanban-board-container::-webkit-scrollbar {
//           height: 6px;
//         }

//         .kanban-board-container::-webkit-scrollbar-thumb {
//           background: rgba(139, 92, 246, 0.35);
//           border-radius: 4px;
//         }
//       `}</style>

//       {/* HEADER */}
//       <div className="page-header">
//         <div className="page-eyebrow">Pipeline</div>
//         <h1 className="page-title">
//           Jobs & <span className="hl">pipeline</span>
//         </h1>
//         <p className="page-sub">
//           Select a job to see candidates ranked by AI match score. Drag cards between stages to update status.
//         </p>
//       </div>

//       {/* JOB LIST */}
//       <JobList
//         onSelect={selectJob}
//         onOpenQuestionBank={(id, title) => setQbankJob({ id, title })}
//         onOpenSetGenerator={(id, title, requiredSkills) => setSetgenJob({ id, title, requiredSkills })}
//       />

//       {/* PIPELINE KANBAN */}
//       {job && (
//         <div>
//           <div className="page-header" style={{ marginTop: 10 }}>
//             <h2 className="page-title" style={{ fontSize: 19 }}>
//               Pipeline — {job.title}
//             </h2>
//           </div>

//           <div className="kanban-board-container">
//             {apps === null
//               ? STAGES.map((s) => (
//                   <div
//                     className="kanban-col"
//                     key={s.key}
//                     style={{ minWidth: '280px', flex: 1 }}
//                   >
//                     <div className="kanban-col-head">
//                       <span className="plat">{s.platform}</span>
//                     </div>
//                     <div className="kanban-cards">
//                       <div className="skeleton" style={{ height: 70 }} />
//                     </div>
//                   </div>
//                 ))
//               : STAGES.map((s) => (
//                   <KanbanColumn
//                     key={s.key}
//                     stage={s}
//                     apps={apps.filter((a) => a.status === s.key)}
//                     onDrop={handleDrop}
//                     onDragStart={(e, id) => setDraggedId(id)}
//                     onDragEnd={() => {}}
//                     onCardClick={setDetailAppId}
//                   />
//                 ))}
//           </div>
//         </div>
//       )}

//       {/* CANDIDATE DETAIL MODAL */}
//       <Modal open={!!detailApp} onClose={() => setDetailAppId(null)}>
//         {detailApp && (
//           <DetailModalBody
//             app={detailApp}
//             onMoveStage={(status) => moveStage(detailApp.id, status)}
//             onAssignAssessment={() => setAssignAppId(detailApp.id)}
//             onScheduleInterview={() => setScheduleAppId(detailApp.id)}
//             onViewProctoring={() => setMonitorAppId(detailApp.id)}
//           />
//         )}
//       </Modal>

//       {/* PROCTORING */}
//       <ProctoringMonitor
//         applicationId={monitorAppId}
//         open={!!monitorAppId}
//         onClose={() => setMonitorAppId(null)}
//       />

//       {/* QUESTION BANK */}
//       <QuestionBankManager
//         jobId={qbankJob?.id}
//         jobTitle={qbankJob?.title}
//         open={!!qbankJob}
//         onClose={() => setQbankJob(null)}
//       />

//       {/* SET GENERATOR */}
//       <SetGeneratorPanel
//         jobId={setgenJob?.id}
//         jobTitle={setgenJob?.title}
//         requiredSkills={setgenJob?.requiredSkills}
//         open={!!setgenJob}
//         onClose={() => setSetgenJob(null)}
//       />

//       {/* SCHEDULE MODAL */}
//       <Modal open={scheduleAppId !== null} onClose={() => setScheduleAppId(null)} maxWidth={420}>
//         <ScheduleModalBody onSchedule={scheduleInterview} />
//       </Modal>

//       {/* ASSIGN ASSESSMENT MODAL */}
//       <Modal open={assignAppId !== null} onClose={() => setAssignAppId(null)} maxWidth={480}>
//         {job && assignAppId !== null && (
//           <AssignModalBody
//             jobId={job.id}
//             onAssignExisting={assignExisting}
//             onGenerateNew={generateAndAssign}
//           />
//         )}
//       </Modal>
//     </div>
//   );
// }





















import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ScoreRing from '../../components/ScoreRing';
import SkillTags from '../../components/SkillTags';
import ProctoringMonitor from './ProctoringMonitor';
import QuestionBankManager from './QuestionBankManager';
import SetGeneratorPanel from './SetGeneratorPanel';
import Icon from '../../components/Icon';
import { getJobVisual } from '../../lib/jobVisual';


const STAGES = [
  {
    key: 'ai_screening',
    label: 'AI Screening',
    platform: 'PLATFORM 1',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    platform: 'PLATFORM 2',
  },
  {
    key: 'assessment',
    label: 'Assessment',
    platform: 'PLATFORM 3',
  },
  {
    key: 'interview',
    label: 'Interview',
    platform: 'PLATFORM 4',
  },
  {
    key: 'selected',
    label: 'Selected',
    platform: 'PLATFORM 5',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    platform: 'PLATFORM 6',
  },
];

/* ============================================================
   JOB LIST
============================================================ */

function JobList({
  onSelect,
  onOpenQuestionBank,
  onOpenSetGenerator,
  onToggleJobStatus,
}) {
  const [jobs, setJobs] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let mounted = true;

    async function loadJobs() {
      try {
        const data = await apiRequest('/jobs/mine');
        if (mounted) {
          setJobs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (mounted) {
          setJobs([]);
        }
      }
    }

    loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  const handleStatusChange = async (e, jobId, currentStatus) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await onToggleJobStatus(jobId, nextStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
      );
    } catch (_) {}
  };

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    const q = searchQuery.toLowerCase().trim();

    return jobs.filter((j) => {
      const title = (j.title || '').toLowerCase();
      const location = (j.location || '').toLowerCase();
      const status = (j.status || '').toLowerCase();

      const matchesStatus =
        statusFilter === 'all' || status === statusFilter;

      const skills = (j.required_skills || []).some((s) =>
        String(s).toLowerCase().includes(q)
      );

      const matchesSearch =
        !q ||
        title.includes(q) ||
        location.includes(q) ||
        status.includes(q) ||
        skills;

      return matchesStatus && matchesSearch;
    });
  }, [jobs, searchQuery, statusFilter]);

  return (
    <div className="pipeline-outer-card">
      <style>{`
        .pipeline-outer-card {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.7) 0%, rgba(8, 10, 22, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          box-shadow: inset 0 0 30px rgba(139, 92, 246, 0.05), 0 10px 40px rgba(0, 0, 0, 0.6);
          border-radius: 24px;
          padding: 28px;
          margin-bottom: 24px;
          box-sizing: border-box;
          width: 100%;
        }

        .pipeline-job-row {
          background: linear-gradient(135deg, rgba(22, 17, 44, 0.75) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.3);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.04), 0 4px 20px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 18px 24px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        .pipeline-job-row:hover {
          transform: translateY(-2px);
          border-color: rgba(168, 85, 247, 0.7);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.08), 0 8px 30px rgba(0, 0, 0, 0.6);
        }

        .pipeline-job-row.c-teal {
          border-color: rgba(20, 184, 166, 0.4);
          background: linear-gradient(135deg, rgba(10, 35, 38, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
        }

        .pipeline-job-row.c-violet {
          border-color: rgba(139, 92, 246, 0.45);
          background: linear-gradient(135deg, rgba(30, 16, 52, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
        }

        .pipeline-job-row.c-blue {
          border-color: rgba(59, 130, 246, 0.4);
          background: linear-gradient(135deg, rgba(12, 26, 52, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
        }

        .pipeline-job-row.c-orange {
          border-color: rgba(249, 115, 22, 0.4);
          background: linear-gradient(135deg, rgba(45, 22, 10, 0.65) 0%, rgba(8, 10, 22, 0.95) 100%);
        }

        .status-badge-toggle {
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge-toggle.open {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.35);
        }

        .status-badge-toggle.open:hover {
          background: rgba(34, 197, 94, 0.25);
          border-color: #4ade80;
        }

        .status-badge-toggle.closed {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.35);
        }

        .status-badge-toggle.closed:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: #f87171;
        }

        .pipeline-close-job-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 9px 14px;
          border-radius: 11px;
          font-family: var(--font-display, sans-serif);
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pipeline-close-job-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #f87171;
          color: #fff;
          transform: translateY(-1px);
        }

        .pipeline-reopen-job-btn {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
          padding: 9px 14px;
          border-radius: 11px;
          font-family: var(--font-display, sans-serif);
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pipeline-reopen-job-btn:hover {
          background: rgba(34, 197, 94, 0.2);
          border-color: #4ade80;
          color: #fff;
          transform: translateY(-1px);
        }

        .pipeline-view-btn {
          background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
          border: none;
          color: #ffffff;
          padding: 9px 18px;
          border-radius: 11px;
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.35);
          white-space: nowrap;
        }

        .pipeline-view-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45);
        }

        .pipeline-secondary-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #cbd5e1;
          padding: 9px 16px;
          border-radius: 11px;
          font-family: var(--font-display, sans-serif);
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .pipeline-secondary-btn:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(168, 85, 247, 0.6);
          color: #fff;
          transform: translateY(-1px);
        }

        .pipeline-row-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 16px;
        }

        .aesthetic-search-wrapper {
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          padding: 14px 18px;
          margin-bottom: 22px;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
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
          border: 1.5px solid rgba(139, 92, 246, 0.3);
          border-radius: 11px;
          padding: 11px 40px 11px 44px;
          color: #fff;
          font-size: 13.5px;
          box-sizing: border-box;
          outline: none;
          font-family: Inter, sans-serif;
          transition: all 0.25s ease;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
          height: 44px;
        }

        .aesthetic-search-input-box input:focus {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.3);
        }

        .aesthetic-search-icon-badge {
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .pipeline-outer-card {
            padding: 18px !important;
          }

          .pipeline-row-inner {
            flex-direction: column;
            align-items: flex-start !important;
          }

          .pipeline-action-box {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
          }

          .pipeline-view-btn,
          .pipeline-secondary-btn,
          .pipeline-close-job-btn,
          .pipeline-reopen-job-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div
        className="row"
        style={{
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="icon-badge violet"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          >
            <Icon name="briefcase" size={19} />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: '#f8fafc',
              margin: 0,
            }}
          >
            Your postings
          </h2>
        </div>

        {/* Quick Filter Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'open', 'closed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                background: statusFilter === st ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: statusFilter === st ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255, 255, 255, 0.08)',
                color: statusFilter === st ? '#c084fc' : '#94a3b8',
                transition: 'all 0.2s ease',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="aesthetic-search-wrapper">
        <div className="aesthetic-search-input-box">
          <span className="aesthetic-search-icon-badge">
            <Icon name="search" size={14} />
          </span>

          <input
            type="text"
            placeholder="Search postings by title, location, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: 0,
                bottom: 0,
                margin: 'auto',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                borderRadius: '6px',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {jobs === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {jobs && filteredJobs.length === 0 && (
        <div className="empty-state">
          <div className="es-icon">
            <Icon name="assessments" size={22} />
          </div>

          <div className="es-title">
            {jobs.length === 0
              ? 'No jobs posted yet'
              : 'No jobs match your search'}
          </div>

          <div className="es-sub">
            Head to "Post a Job" to create your first listing.
          </div>
        </div>
      )}

      {filteredJobs.map((j) => {
        const { icon, color } = getJobVisual(j.title);
        const isOpen = j.status?.toLowerCase() === 'open';

        return (
          <div
            className={`pipeline-job-row c-${color}`}
            onClick={() => onSelect(j.id, j.title)}
            key={j.id}
          >
            <div className="pipeline-row-inner">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  flex: 1,
                  minWidth: 0,
                  width: '100%',
                }}
              >
                <div
                  className={`icon-badge lg ${color}`}
                  style={{
                    width: 52,
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '14px',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={icon} size={22} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 16.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#f8fafc',
                    }}
                  >
                    {j.title}

                    <Icon
                      name="checkCircle"
                      size={15}
                      style={{ color: 'var(--blue)' }}
                    />
                  </div>

                  <div
                    className="muted mono"
                    style={{
                      fontSize: 11.5,
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      color: '#94a3b8',
                    }}
                  >
                    <span>{j.location}</span>
                    <span>&middot;</span>
                    <span
                      className={`status-badge-toggle ${isOpen ? 'open' : 'closed'}`}
                      onClick={(e) => handleStatusChange(e, j.id, j.status)}
                      title={`Click to ${isOpen ? 'close' : 'reopen'} job`}
                    >
                      {j.status || 'open'} ⇄
                    </span>
                    <span>&middot;</span>
                    <span>min {j.min_experience} yrs</span>
                  </div>
                </div>
              </div>

              <div
                className="pipeline-action-box"
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {isOpen ? (
                  <button
                    type="button"
                    className="pipeline-close-job-btn"
                    onClick={(e) => handleStatusChange(e, j.id, j.status)}
                    title="Close this job posting"
                  >
                    <Icon name="xCircle" size={13} /> Close Job
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pipeline-reopen-job-btn"
                    onClick={(e) => handleStatusChange(e, j.id, j.status)}
                    title="Reopen this job posting"
                  >
                    <Icon name="checkCircle" size={13} /> Reopen Job
                  </button>
                )}

                <button
                  type="button"
                  className="pipeline-secondary-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQuestionBank(j.id, j.title);
                  }}
                >
                  Question Bank
                </button>

                <button
                  type="button"
                  className="pipeline-secondary-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSetGenerator(
                      j.id,
                      j.title,
                      j.required_skills
                    );
                  }}
                >
                  Generate Sets
                </button>

                <button
                  type="button"
                  className="pipeline-view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(j.id, j.title);
                  }}
                >
                  View pipeline
                  <Icon name="arrowRight" size={14} />
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <SkillTags skills={j.required_skills} />
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 22,
          paddingTop: 14,
          borderTop: '1px solid rgba(139, 92, 246, 0.2)',
          textAlign: 'center',
        }}
      >
        <Icon
          name="spark"
          size={14}
          style={{ color: 'var(--violet)' }}
        />

        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12.5,
            color: '#a78bfa',
          }}
        >
          AI match score helps you find the best candidates faster.
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   KANBAN CARD
============================================================ */

function KanbanCard({
  app,
  rescheduleInterview,
  onDragStart,
  onDragEnd,
  onClick,
  onOpenRescheduleReview,
}) {
  const matchedList = app.matched_skills || [];
  const missingList = app.missing_skills || [];
  const score = app.match_score || 0;

  const matchLabel =
    score >= 75
      ? 'Strong Match'
      : score >= 50
        ? 'Moderate Match'
        : 'Low Match';

  const matchColor =
    score >= 75
      ? '#2dd4bf'
      : score >= 50
        ? '#f59e0b'
        : '#f43f5e';

  const displayName =
    app.candidate_name ||
    `Candidate #${app.candidate_id}`;

  const avatarLabel = app.candidate_name
    ? app.candidate_name.trim().charAt(0).toUpperCase()
    : `#${app.candidate_id}`;

  const isReschedule = !!rescheduleInterview;

  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) =>
        onDragStart(e, app.id)
      }
      onDragEnd={onDragEnd}
      onClick={() => onClick(app.id)}
      style={{
        background: isReschedule
          ? 'linear-gradient(135deg, rgba(42, 20, 24, 0.9) 0%, rgba(18, 12, 28, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(25, 20, 48, 0.85) 0%, rgba(10, 12, 26, 0.95) 100%)',
        border: isReschedule
          ? '1.5px solid rgba(249, 115, 22, 0.7)'
          : '1px solid rgba(139, 92, 246, 0.35)',
        boxShadow: isReschedule
          ? '0 0 16px rgba(249, 115, 22, 0.25), inset 0 0 15px rgba(249, 115, 22, 0.1)'
          : 'inset 0 0 15px rgba(139, 92, 246, 0.05)',
        borderRadius: '14px',
        padding: '14px 16px',
        marginBottom: '12px',
        cursor: 'grab',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Reschedule Requested Warning Pill */}
      {isReschedule && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenRescheduleReview(rescheduleInterview, displayName);
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%)',
            border: '1px solid #f97316',
            color: '#fdba74',
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)',
          }}
          title="Click to review proposed time slots"
        >
          <span>⚠️ Reschedule Requested</span>
          <span style={{ fontSize: '10px', textDecoration: 'underline' }}>Review →</span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: isReschedule
                ? 'linear-gradient(135deg, #f97316, #ef4444)'
                : 'linear-gradient(135deg, #a855f7, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {avatarLabel}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '13.5px',
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </div>

            <div
              style={{
                fontSize: '10px',
                color: matchColor,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              {matchLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
          }}
        >
          {score}%
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '10px',
          fontSize: '10.5px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <span
          style={{
            color: '#2dd4bf',
            background: 'rgba(45, 212, 191, 0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(45, 212, 191, 0.2)',
          }}
        >
          ✓ {matchedList.length} matched
        </span>

        <span
          style={{
            color: '#f43f5e',
            background: 'rgba(244, 63, 94, 0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid rgba(244, 63, 94, 0.2)',
          }}
        >
          ✕ {missingList.length} missing
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
        }}
      >
        {matchedList.slice(0, 3).map((s) => (
          <span
            key={s}
            style={{
              fontSize: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#d8b4fe',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            {s}
          </span>
        ))}

        {matchedList.length > 3 && (
          <span
            style={{
              fontSize: '10px',
              color: '#94a3b8',
              padding: '2px 4px',
            }}
          >
            +{matchedList.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   KANBAN COLUMN
============================================================ */

function KanbanColumn({
  stage,
  apps,
  rescheduleMap,
  onDrop,
  onDragStart,
  onDragEnd,
  onCardClick,
  onOpenRescheduleReview,
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`kanban-col${dragOver ? ' drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop(stage.key);
      }}
      style={{
        background: 'linear-gradient(135deg, rgba(16, 13, 32, 0.7) 0%, rgba(8, 10, 22, 0.9) 100%)',
        border: '1.5px solid rgba(139, 92, 246, 0.3)',
        boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.04)',
        borderRadius: '18px',
        padding: '16px',
        minWidth: '280px',
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="kanban-col-head"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: '10px',
        }}
      >
        <div>
          <div
            className="plat"
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {stage.platform}
          </div>

          <div
            className="label"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '15px',
              color: '#fff',
              marginTop: '2px',
            }}
          >
            {stage.label}
          </div>
        </div>

        <span
          className="kanban-count"
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            color: '#c084fc',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {apps.length}
        </span>
      </div>

      <div
        className="kanban-cards"
        style={{
          flex: 1,
          minHeight: '120px',
        }}
      >
        {apps.length === 0 && (
          <div
            className="muted"
            style={{
              fontSize: '12px',
              textAlign: 'center',
              padding: '24px 4px',
              color: '#64748b',
            }}
          >
            No candidates
          </div>
        )}

        {apps.map((a) => (
          <KanbanCard
            app={a}
            rescheduleInterview={rescheduleMap[a.id]}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onCardClick}
            onOpenRescheduleReview={onOpenRescheduleReview}
            key={a.id}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   CANDIDATE DETAIL
============================================================ */

function DetailModalBody({
  app,
  onMoveStage,
  onAssignAssessment,
  onScheduleInterview,
  onViewProctoring,
}) {
  const displayName =
    app.candidate_name ||
    `Candidate #${app.candidate_id}`;

  return (
    <div>
      <div
        className="row"
        style={{
          alignItems: 'flex-start',
          marginBottom: 6,
          paddingRight: 40,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            {displayName}
          </div>

          {app.candidate_email && (
            <div
              className="muted mono"
              style={{
                fontSize: 11.5,
                marginTop: 3,
              }}
            >
              {app.candidate_email}
            </div>
          )}

          <span
            className={`status-pill status-${app.status}`}
            style={{
              marginTop: 6,
              display: 'inline-block',
            }}
          >
            {app.status.replace('_', ' ')}
          </span>
        </div>

        <ScoreRing
          pct={app.match_score}
          size={64}
          stroke={5}
        />
      </div>

      <div
        className="grid-2"
        style={{ marginTop: 16 }}
      >
        <div>
          <div
            className="muted mono"
            style={{
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              marginBottom: 6,
            }}
          >
            Matched
          </div>

          <SkillTags
            skills={app.matched_skills}
            cls="matched"
          />
        </div>

        <div>
          <div
            className="muted mono"
            style={{
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              marginBottom: 6,
            }}
          >
            Missing
          </div>

          <SkillTags
            skills={app.missing_skills}
            cls="missing"
          />
        </div>
      </div>

      <div className="divider-label">
        match breakdown
      </div>

      {Object.entries(
        app.match_breakdown?.components || {}
      ).map(([k, v]) => (
        <div
          className="breakdown-item"
          key={k}
        >
          <div className="bd-top">
            <span className="bd-label">
              {k.replace(/_/g, ' ')}{' '}
              <span
                className="mono"
                style={{ opacity: 0.6 }}
              >
                ({v.weight_pct}%)
              </span>
            </span>

            <span className="bd-score">
              {v.score}%
            </span>
          </div>

          <div className="bd-bar-track">
            <div
              className="bd-bar-fill"
              style={{
                width: `${v.score}%`,
              }}
            />
          </div>

          <div className="bd-explain">
            {v.explanation}
          </div>
        </div>
      ))}

      <div className="divider-label">
        AI interview questions
      </div>

      <ol className="q-list">
        {(app.interview_questions || []).map(
          (q, i) => (
            <li key={i}>{q}</li>
          )
        )}
      </ol>

      <div className="divider-label">
        actions
      </div>

      <div
        className="row"
        style={{
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="secondary small"
          style={{ margin: 0 }}
          onClick={onAssignAssessment}
        >
          Assign assessment
        </button>

        <button
          className="secondary small"
          style={{ margin: 0 }}
          onClick={onScheduleInterview}
        >
          Schedule interview
        </button>

        <button
          className="secondary small"
          style={{ margin: 0 }}
          onClick={onViewProctoring}
        >
          View Proctoring
        </button>
      </div>

      <label>Move to stage</label>

      <select
        value={app.status}
        onChange={(e) =>
          onMoveStage(e.target.value)
        }
      >
        {STAGES.map((s) => (
          <option
            value={s.key}
            key={s.key}
          >
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================
   SCHEDULE INTERVIEW
============================================================ */

function ScheduleModalBody({
  onSchedule,
}) {
  const [type, setType] = useState('technical');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const toast = useToast();

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '15', '30', '45'];
  const timeDisplay = `${hour}:${minute} ${ampm}`;

  function submit() {
    if (!date || !timeDisplay) {
      toast('Pick a date & time', 'error');
      return;
    }

    let parsedHours = parseInt(hour, 10);
    if (ampm === 'PM' && parsedHours < 12) parsedHours += 12;
    if (ampm === 'AM' && parsedHours === 12) parsedHours = 0;

    onSchedule({
      interview_type: type,
      scheduled_at: `${date}T${String(parsedHours).padStart(2, '0')}:${String(parseInt(minute, 10)).padStart(2, '0')}:00+05:30`,
      meeting_link: link.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .sched-modal-wrap label {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 6px;
          margin-top: 14px;
        }

        .sched-modal-wrap select,
        .sched-modal-wrap input,
        .sched-modal-wrap textarea {
          width: 100%;
          background: rgba(15, 15, 32, 0.95);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          border-radius: 12px;
          padding: 11px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          font-family: Inter, sans-serif;
          transition: all 0.25s ease;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.4);
        }

        .sched-modal-wrap input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(0.8) sepia(1) hue-rotate(220deg) saturate(3);
          cursor: pointer;
        }

        .sched-modal-wrap select:focus,
        .sched-modal-wrap input:focus,
        .sched-modal-wrap textarea:focus {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.35), inset 0 2px 5px rgba(0,0,0,0.4);
        }

        .time-picker-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.99) 0%, rgba(10, 12, 26, 0.99) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.6);
          box-shadow: 0 20px 50px rgba(0,0,0,0.9);
          border-radius: 14px;
          padding: 14px;
          z-index: 99999;
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
        }

        .time-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 150px;
          overflow-y: auto;
        }

        .time-item {
          padding: 8px;
          text-align: center;
          border-radius: 8px;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          color: #cbd5e1;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: all 0.2s ease;
        }

        .time-item:hover,
        .time-item.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(249, 115, 22, 0.35));
          color: #fff;
          font-weight: 700;
        }

        .sched-submit-btn {
          width: 100%;
          margin-top: 22px;
          padding: 13px;
          background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(168, 85, 247, 0.35);
        }

        .sched-submit-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="sched-modal-wrap">
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            color: '#fff',
            marginBottom: 2,
            fontWeight: 700,
          }}
        >
          Schedule interview
        </h2>

        <div
          style={{
            fontSize: 11.5,
            color: '#94a3b8',
            fontFamily: 'var(--font-mono)',
            marginBottom: 16,
          }}
        >
          Set up a live interview session with the candidate.
        </div>

        <label>Interview type</label>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="technical">Technical</option>
          <option value="hr">HR</option>
          <option value="behavioral">Behavioral</option>
        </select>

        <label>Date</label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>Time & Period</label>

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowTimePicker(!showTimePicker)}
            style={{
              width: '100%',
              background: 'rgba(15, 15, 32, 0.95)',
              border: '1.5px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '12px',
              padding: '11px 14px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.4)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: '#f8fafc',
              }}
            >
              {timeDisplay}
            </span>

            <span style={{ color: '#a78bfa' }}>🕒</span>
          </div>

          {showTimePicker && (
            <div
              className="time-picker-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="time-col">
                <div
                  style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: 4,
                  }}
                >
                  HOUR
                </div>

                {hoursList.map((h) => (
                  <div
                    key={h}
                    className={`time-item ${hour === h ? 'active' : ''}`}
                    onClick={() => setHour(h)}
                  >
                    {h}
                  </div>
                ))}
              </div>

              <div className="time-col">
                <div
                  style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: 4,
                  }}
                >
                  MIN
                </div>

                {minutesList.map((m) => (
                  <div
                    key={m}
                    className={`time-item ${minute === m ? 'active' : ''}`}
                    onClick={() => setMinute(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>

              <div className="time-col" style={{ flex: 0.8 }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: 4,
                  }}
                >
                  PERIOD
                </div>

                <div
                  className={`time-item ${ampm === 'AM' ? 'active' : ''}`}
                  onClick={() => setAmpm('AM')}
                >
                  AM
                </div>

                <div
                  className={`time-item ${ampm === 'PM' ? 'active' : ''}`}
                  onClick={() => setAmpm('PM')}
                >
                  PM
                </div>

                <button
                  type="button"
                  onClick={() => setShowTimePicker(false)}
                  style={{
                    marginTop: 8,
                    padding: '6px',
                    background: '#8b5cf6',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        <label>Meeting link (optional)</label>

        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://meet.google.com/..."
        />

        <label>Notes (optional)</label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Panel, focus areas, etc."
          style={{
            minHeight: 70,
            resize: 'vertical',
          }}
        />

        <button
          type="button"
          className="sched-submit-btn"
          onClick={submit}
        >
          Schedule
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ASSIGN ASSESSMENT MODAL
============================================================ */

function AssignModalBody({
  jobId,
  onAssignExisting,
  onGenerateNew,
}) {
  const [assessmentGroups, setAssessmentGroups] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [activeMode, setActiveMode] = useState('sets');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;

    async function loadAssessmentSets() {
      try {
        const assessmentResponse = await apiRequest(`/assessments/job/${jobId}`);
        if (cancelled) return;

        const assessments = Array.isArray(assessmentResponse)
          ? assessmentResponse
          : assessmentResponse?.assessments || assessmentResponse?.items || [];

        const groups = await Promise.all(
          assessments.map(async (assessment) => {
            try {
              const setResponse = await apiRequest(`/assessments/${assessment.id}/sets`);
              const sets = Array.isArray(setResponse)
                ? setResponse
                : setResponse?.sets || setResponse?.items || [];

              return {
                ...assessment,
                sets: Array.isArray(sets) ? sets : [],
              };
            } catch (e) {
              return {
                ...assessment,
                sets: [],
              };
            }
          })
        );

        if (cancelled) return;

        const recruiterAssessments = groups.filter(
          (assessment) => Array.isArray(assessment.sets) && assessment.sets.length > 0
        );

        setAssessmentGroups(recruiterAssessments);

        if (recruiterAssessments.length > 0) {
          const firstAssessment = recruiterAssessments[0];
          const firstSet = firstAssessment.sets[0];

          if (firstSet) {
            setSelectedSet({
              assessmentId: firstAssessment.id,
              setId: firstSet.id,
            });
          }
        }
      } catch (e) {
        if (!cancelled) {
          setAssessmentGroups([]);
        }
      }
    }

    loadAssessmentSets();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  async function handleAssignSelected() {
    if (!selectedSet?.assessmentId || !selectedSet?.setId) {
      toast('Please choose an assessment set.', 'error');
      return;
    }

    setLoading(true);
    try {
      await onAssignExisting(selectedSet.assessmentId, selectedSet.setId);
    } finally {
      setLoading(false);
    }
  }

  if (assessmentGroups === null) {
    return (
      <div style={{ padding: 28, color: '#94a3b8', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        Loading assessment sets...
      </div>
    );
  }

  return (
    <div className="assign-modal-wrap">
      <style>{`
        .assign-modal-wrap {
          color: #fff;
          font-family: Inter, sans-serif;
          box-sizing: border-box;
        }

        .assign-title {
          font-family: var(--font-display, sans-serif);
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .assign-subtitle {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 6px;
        }

        .assign-mode-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 22px 0 20px;
        }

        .assign-mode-tab {
          border: 1.5px solid rgba(139, 92, 246, 0.3);
          background: rgba(18, 14, 38, 0.7);
          color: #cbd5e1;
          border-radius: 14px;
          padding: 12px 14px;
          cursor: pointer;
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 13px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .assign-mode-tab:hover {
          border-color: rgba(168, 85, 247, 0.7);
          color: #fff;
          background: rgba(26, 20, 52, 0.85);
        }

        .assign-mode-tab.active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(249, 115, 22, 0.2) 100%);
          border-color: #a855f7;
          color: #ffffff;
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.15);
        }

        .section-label {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .set-scroll-area {
          max-height: 330px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-right: 4px;
        }

        .set-scroll-area::-webkit-scrollbar {
          width: 5px;
        }

        .set-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }

        .assessment-container {
          border: 1px solid rgba(139, 92, 246, 0.2);
          background: rgba(13, 10, 28, 0.7);
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .set-option-card {
          width: 100%;
          text-align: left;
          border: 1.5px solid rgba(139, 92, 246, 0.25);
          background: linear-gradient(135deg, rgba(20, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border-radius: 14px;
          padding: 14px 16px;
          color: #fff;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          box-sizing: border-box;
          position: relative;
        }

        .set-option-card:hover {
          border-color: rgba(168, 85, 247, 0.65);
          transform: translateY(-1px);
        }

        .set-option-card.selected {
          border-color: #c084fc;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.28) 0%, rgba(217, 70, 239, 0.14) 100%);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.1);
        }

        .set-option-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .set-name {
          font-family: var(--font-display, sans-serif);
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
        }

        .set-badge-tag {
          font-family: var(--font-mono, monospace);
          font-size: 9.5px;
          font-weight: 700;
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.4);
          background: rgba(139, 92, 246, 0.15);
          border-radius: 6px;
          padding: 3px 8px;
          white-space: nowrap;
        }

        .selected-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(45, 212, 191, 0.18);
          border: 1.5px solid #2dd4bf;
          color: #2dd4bf;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 0 10px rgba(45, 212, 191, 0.4);
        }

        .set-description {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 11.5px;
          line-height: 1.5;
        }

        .set-meta-chips {
          display: flex;
          gap: 6px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .set-meta-chips span {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: #cbd5e1;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .assign-primary-btn {
          width: 100%;
          margin-top: 18px;
          padding: 14px;
          border: none;
          border-radius: 13px;
          color: #ffffff;
          font-family: var(--font-display, sans-serif);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f97316 100%);
          box-shadow: 0 6px 25px rgba(168, 85, 247, 0.45);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .assign-primary-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(249, 115, 22, 0.55);
          filter: brightness(1.05);
        }

        .assign-primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .ai-generate-card {
          border: 1.5px solid rgba(168, 85, 247, 0.35);
          border-radius: 18px;
          padding: 22px;
          background: linear-gradient(135deg, rgba(30, 18, 56, 0.6) 0%, rgba(10, 12, 26, 0.95) 100%);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.08);
        }

        .ai-header-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(249, 115, 22, 0.25) 100%);
          border: 1px solid rgba(168, 85, 247, 0.5);
          color: #ffffff;
          margin-bottom: 12px;
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }

        .ai-feature-items {
          margin: 14px 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ai-feature-items li {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cbd5e1;
          font-size: 11.5px;
        }

        .ai-check-icon {
          color: #2dd4bf;
          font-weight: 800;
        }
      `}</style>

      <h2 className="assign-title">Assign assessment</h2>
      <div className="assign-subtitle">
        Choose an exact recruiter-created assessment set or generate a completely new AI assessment for this candidate.
      </div>

      <div className="assign-mode-tabs">
        <button
          type="button"
          className={`assign-mode-tab ${activeMode === 'sets' ? 'active' : ''}`}
          onClick={() => setActiveMode('sets')}
        >
          Recruiter Sets
        </button>

        <button
          type="button"
          className={`assign-mode-tab ${activeMode === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveMode('ai')}
        >
          ✨ AI Generate
        </button>
      </div>

      {activeMode === 'sets' && (
        <div>
          {assessmentGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px', border: '1.5px dashed rgba(139,92,246,0.3)', borderRadius: 14, color: '#94a3b8' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📚</div>
              No recruiter-created assessment sets are available for this job yet.
              <div style={{ marginTop: 6, color: '#64748b', fontSize: '11px' }}>
                Use "Generate Sets" on the job card to create assessment sets first.
              </div>
            </div>
          ) : (
            <>
              <div className="section-label">Select an exact assessment set</div>

              <div className="set-scroll-area">
                {assessmentGroups.map((assessment) => (
                  <div className="assessment-container" key={assessment.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                        {assessment.title || 'Skills Assessment'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#a78bfa' }}>
                        {assessment.sets.length} SETS
                      </span>
                    </div>

                    {assessment.sets.map((set, index) => {
                      const setNumber = set.set_number ?? set.set_no ?? set.set_index ?? index + 1;
                      const questionCount = Array.isArray(set.questions)
                        ? set.questions.length
                        : set.question_count ?? set.questions_count ?? 0;
                      const totalMarks = set.total_marks ?? set.marks;

                      const isSelected =
                        String(selectedSet?.assessmentId) === String(assessment.id) &&
                        String(selectedSet?.setId) === String(set.id);

                      return (
                        <div
                          key={set.id}
                          className={`set-option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() =>
                            setSelectedSet({
                              assessmentId: assessment.id,
                              setId: set.id,
                            })
                          }
                        >
                          <div className="set-option-top">
                            <span className="set-name">
                              {set.set_name || `Set ${setNumber}`}
                            </span>

                            {isSelected ? (
                              <div className="selected-circle">✓</div>
                            ) : (
                              <span className="set-badge-tag">SET {setNumber}</span>
                            )}
                          </div>

                          <div className="set-description">
                            {questionCount} questions from this recruiter-generated set.
                          </div>

                          <div className="set-meta-chips">
                            <span>{questionCount} questions</span>
                            {totalMarks != null && <span>{totalMarks} marks</span>}
                            <span>Set ID: {set.id}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="assign-primary-btn"
                disabled={!selectedSet || loading}
                onClick={handleAssignSelected}
              >
                {loading ? 'Assigning selected set...' : 'Assign selected set'}
              </button>
            </>
          )}
        </div>
      )}

      {activeMode === 'ai' && (
        <div className="ai-generate-card">
          <div className="ai-header-icon">
            <Icon name="spark" size={20} />
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#fff' }}>
            Generate a new AI assessment
          </div>

          <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>
            AI will create assessment questions automatically using this job's title and required skills, then assign the generated assessment directly to this candidate.
          </div>

          <ul className="ai-feature-items">
            <li><span className="ai-check-icon">✓</span> Questions generated from job skills</li>
            <li><span className="ai-check-icon">✓</span> Assessment created automatically</li>
            <li><span className="ai-check-icon">✓</span> Assessment assigned immediately</li>
            <li><span className="ai-check-icon">✓</span> Candidate moved to Assessment stage</li>
          </ul>

          <button
            type="button"
            className="assign-primary-btn"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await onGenerateNew();
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Generating & assigning...' : '✨ Generate AI assessment & assign'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   REVERT & ACCEPT RESCHEDULE MODAL (FIXED WITH CALENDAR & AM/PM)
============================================================ */

function RescheduleReviewModalBody({
  target,
  onAcceptReschedule,
}) {
  const [newDate, setNewDate] = useState('');
  const [hour, setHour] = useState('03');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('PM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [meetingLink, setMeetingLink] = useState(target?.interview?.meeting_link || '');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '15', '30', '45'];
  const timeDisplay = `${hour}:${minute} ${ampm}`;

  async function handleConfirm() {
    if (!newDate) {
      toast('Please choose a date from the calendar', 'error');
      return;
    }

    let parsedHours = parseInt(hour, 10);
    if (ampm === 'PM' && parsedHours < 12) parsedHours += 12;
    if (ampm === 'AM' && parsedHours === 12) parsedHours = 0;

    const formattedTime = `${String(parsedHours).padStart(2, '0')}:${String(parseInt(minute, 10)).padStart(2, '0')}:00+05:30`;

    setLoading(true);
    try {
      await onAcceptReschedule(target.interview.id, {
        scheduled_at: `${newDate}T${formattedTime}`,
        meeting_link: meetingLink.trim(),
        status: 'scheduled',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .resched-form-input {
          width: 100%;
          background: rgba(15, 15, 32, 0.95);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          border-radius: 12px;
          padding: 11px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          font-family: Inter, sans-serif;
          transition: all 0.25s ease;
          box-shadow: inset 0 2px 5px rgba(0,0,0,0.4);
        }

        .resched-form-input::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(0.8) sepia(1) hue-rotate(220deg) saturate(3);
          cursor: pointer;
        }

        .resched-form-input:focus {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.35), inset 0 2px 5px rgba(0,0,0,0.4);
        }

        .time-picker-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.99) 0%, rgba(10, 12, 26, 0.99) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.6);
          box-shadow: 0 20px 50px rgba(0,0,0,0.9);
          border-radius: 14px;
          padding: 14px;
          z-index: 99999;
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
        }

        .time-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-height: 150px;
          overflow-y: auto;
        }

        .time-item {
          padding: 8px;
          text-align: center;
          border-radius: 8px;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          color: #cbd5e1;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          transition: all 0.2s ease;
        }

        .time-item:hover,
        .time-item.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(249, 115, 22, 0.35));
          color: #fff;
          font-weight: 700;
        }
      `}</style>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Action Required
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff', margin: '4px 0 0' }}>
          Reschedule Request: {target?.candidateName}
        </h2>
      </div>

      <div style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '12px', padding: '14px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#fb923c', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          Candidate's Requested Slots & Reason:
        </div>
        <div style={{ fontSize: 12.5, color: '#f8fafc', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
          {target?.interview?.notes || 'No detailed reason provided.'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Date Selector with Visible Calendar Icon */}
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Select New Date
          </label>
          <input
            type="date"
            className="resched-form-input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>

        {/* Custom 12-Hour AM/PM Time Selector */}
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Select New Time & Period
          </label>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowTimePicker(!showTimePicker)}
              className="resched-form-input"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f8fafc' }}>
                {timeDisplay}
              </span>
              <span style={{ color: '#a78bfa' }}>🕒</span>
            </div>

            {showTimePicker && (
              <div
                className="time-picker-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="time-col">
                  <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                    HOUR
                  </div>
                  {hoursList.map((h) => (
                    <div
                      key={h}
                      className={`time-item ${hour === h ? 'active' : ''}`}
                      onClick={() => setHour(h)}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                <div className="time-col">
                  <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                    MIN
                  </div>
                  {minutesList.map((m) => (
                    <div
                      key={m}
                      className={`time-item ${minute === m ? 'active' : ''}`}
                      onClick={() => setMinute(m)}
                    >
                      {m}
                    </div>
                  ))}
                </div>

                <div className="time-col" style={{ flex: 0.8 }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                    PERIOD
                  </div>
                  <div
                    className={`time-item ${ampm === 'AM' ? 'active' : ''}`}
                    onClick={() => setAmpm('AM')}
                  >
                    AM
                  </div>
                  <div
                    className={`time-item ${ampm === 'PM' ? 'active' : ''}`}
                    onClick={() => setAmpm('PM')}
                  >
                    PM
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTimePicker(false)}
                    style={{
                      marginTop: 8,
                      padding: '6px',
                      background: '#8b5cf6',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Link */}
        <div>
          <label style={{ display: 'block', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Meeting Room Link (Optional)
          </label>
          <input
            type="text"
            className="resched-form-input"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
          />
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleConfirm}
        style={{
          width: '100%',
          marginTop: 20,
          padding: '13px',
          background: 'linear-gradient(135deg, #f97316 0%, #a855f7 100%)',
          border: 'none',
          borderRadius: '12px',
          color: '#fff',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 13.5,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
        }}
      >
        {loading ? 'Updating schedule...' : 'Confirm & Notify Candidate'}
      </button>
    </div>
  );
}

/* ============================================================
   MAIN PIPELINE
============================================================ */

export default function Pipeline() {
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState(null);
  const [jobInterviews, setJobInterviews] = useState([]);
  const [draggedId, setDraggedId] = useState(null);
  const [detailAppId, setDetailAppId] = useState(null);
  const [scheduleAppId, setScheduleAppId] = useState(null);
  const [assignAppId, setAssignAppId] = useState(null);
  const [monitorAppId, setMonitorAppId] = useState(null);
  const [qbankJob, setQbankJob] = useState(null);
  const [setgenJob, setSetgenJob] = useState(null);
  const [rescheduleReviewTarget, setRescheduleReviewTarget] = useState(null);
  const toast = useToast();

  const loadJobInterviews = useCallback(async (jobId) => {
    try {
      const data = await apiRequest(`/interviews/job/${jobId}`);
      setJobInterviews(Array.isArray(data) ? data : []);
    } catch {
      setJobInterviews([]);
    }
  }, []);

  const selectJob = useCallback(
    async (jobId, jobTitle) => {
      setJob({ id: jobId, title: jobTitle });
      setApps(null);
      try {
        const [applicantsData] = await Promise.all([
          apiRequest(`/jobs/${jobId}/applicants`),
          loadJobInterviews(jobId),
        ]);
        setApps(applicantsData);
      } catch (e) {
        toast(e.message, 'error');
      }
    },
    [toast, loadJobInterviews]
  );

  async function toggleJobStatus(jobId, newStatus) {
    try {
      await apiRequest(`/jobs/${jobId}`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      toast(`Job status updated to ${newStatus.toUpperCase()}`, 'success', 2200);
    } catch (err) {
      toast(err.message || 'Could not update job status', 'error');
      throw err;
    }
  }

  function updateAppLocally(appId, patch) {
    setApps((prev) => {
      if (!prev) return prev;
      return prev.map((a) =>
        a.id === appId ? { ...a, ...patch } : a
      );
    });
  }

  async function handleDrop(newStatus) {
    if (draggedId == null) return;
    const app = apps?.find((a) => a.id === draggedId);
    if (!app || app.status === newStatus) {
      setDraggedId(null);
      return;
    }

    const prevStatus = app.status;
    updateAppLocally(draggedId, { status: newStatus });

    try {
      await apiRequest(`/applications/${draggedId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      toast(`Moved to ${newStatus.replace('_', ' ')}`, 'success', 2200);
    } catch (err) {
      updateAppLocally(draggedId, { status: prevStatus });
      toast('Could not update status: ' + err.message, 'error');
    }

    setDraggedId(null);
  }

  async function moveStage(appId, status) {
    const app = apps?.find((a) => a.id === appId);
    if (!app) return;
    const prev = app.status;
    updateAppLocally(appId, { status });

    try {
      await apiRequest(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: { status },
      });
      toast(`Moved to ${status.replace('_', ' ')}`, 'success', 2200);
      setDetailAppId(null);
    } catch (e) {
      updateAppLocally(appId, { status: prev });
      toast('Could not update: ' + e.message, 'error');
    }
  }

  async function scheduleInterview(payload) {
    try {
      await apiRequest('/interviews', {
        method: 'POST',
        body: { application_id: scheduleAppId, ...payload },
      });
      toast('Interview scheduled', 'success');
      updateAppLocally(scheduleAppId, { status: 'interview' });
      setScheduleAppId(null);
      setDetailAppId(null);
      if (job?.id) loadJobInterviews(job.id);
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function handleAcceptReschedule(interviewId, payload) {
    try {
      await apiRequest(`/interviews/${interviewId}`, {
        method: 'PATCH',
        body: payload,
      });
      toast('Interview rescheduled & candidate notified', 'success');
      setRescheduleReviewTarget(null);
      if (job?.id) loadJobInterviews(job.id);
    } catch (e) {
      toast(e.message || 'Could not reschedule', 'error');
    }
  }

  async function assignExisting(assessmentId, setId) {
    try {
      if (!assessmentId) throw new Error('No assessment selected.');
      if (!setId) throw new Error('No assessment set selected.');
      if (!assignAppId) throw new Error('No candidate selected.');

      await apiRequest(`/assessments/${assessmentId}/assign-set`, {
        method: 'POST',
        body: {
          application_id: assignAppId,
          set_id: setId,
        },
      });

      finishAssign('Selected assessment set assigned');
    } catch (e) {
      toast(e.message || 'Could not assign assessment set.', 'error');
      throw e;
    }
  }

  async function generateAndAssign() {
    try {
      if (!job?.id) throw new Error('No job selected.');
      if (!assignAppId) throw new Error('No candidate selected.');

      const assessment = await apiRequest('/assessments', {
        method: 'POST',
        body: {
          job_id: job.id,
          title: `${job.title} — AI Skills Assessment`,
          auto_generate: true,
          num_questions: 6,
        },
      });

      if (!assessment || !assessment.id) {
        throw new Error('AI assessment was created but no assessment ID was returned.');
      }

      await apiRequest(`/assessments/${assessment.id}/assign-random-set`, {
        method: 'POST',
        body: { application_id: assignAppId },
      });

      finishAssign('AI assessment generated and assigned');
    } catch (e) {
      toast(e.message || 'Could not generate AI assessment.', 'error');
      throw e;
    }
  }

  function finishAssign(message = 'Assessment assigned') {
    toast(message, 'success');
    updateAppLocally(assignAppId, { status: 'assessment' });
    setAssignAppId(null);
    setDetailAppId(null);
  }

  const rescheduleMap = useMemo(() => {
    const map = {};
    (jobInterviews || []).forEach((iv) => {
      if (iv.status === 'reschedule_requested') {
        map[iv.application_id] = iv;
      }
    });
    return map;
  }, [jobInterviews]);

  const detailApp = apps?.find((a) => a.id === detailAppId);

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .kanban-board-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          width: 100%;
          boxSizing: border-box;
        }

        .kanban-board-container::-webkit-scrollbar {
          height: 6px;
        }

        .kanban-board-container::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.35);
          border-radius: 4px;
        }
      `}</style>

      {/* HEADER */}
      <div className="page-header">
        <div className="page-eyebrow">Pipeline</div>
        <h1 className="page-title">
          Jobs & <span className="hl">pipeline</span>
        </h1>
        <p className="page-sub">
          Select a job to see candidates ranked by AI match score. Drag cards between stages to update status.
        </p>
      </div>

      {/* JOB LIST */}
      <JobList
        onSelect={selectJob}
        onOpenQuestionBank={(id, title) => setQbankJob({ id, title })}
        onOpenSetGenerator={(id, title, requiredSkills) => setSetgenJob({ id, title, requiredSkills })}
        onToggleJobStatus={toggleJobStatus}
      />

      {/* PIPELINE KANBAN */}
      {job && (
        <div>
          <div className="page-header" style={{ marginTop: 10 }}>
            <h2 className="page-title" style={{ fontSize: 19 }}>
              Pipeline — {job.title}
            </h2>
          </div>

          <div className="kanban-board-container">
            {apps === null
              ? STAGES.map((s) => (
                  <div
                    className="kanban-col"
                    key={s.key}
                    style={{ minWidth: '280px', flex: 1 }}
                  >
                    <div className="kanban-col-head">
                      <span className="plat">{s.platform}</span>
                    </div>
                    <div className="kanban-cards">
                      <div className="skeleton" style={{ height: 70 }} />
                    </div>
                  </div>
                ))
              : STAGES.map((s) => (
                  <KanbanColumn
                    key={s.key}
                    stage={s}
                    apps={apps.filter((a) => a.status === s.key)}
                    rescheduleMap={rescheduleMap}
                    onDrop={handleDrop}
                    onDragStart={(e, id) => setDraggedId(id)}
                    onDragEnd={() => {}}
                    onCardClick={setDetailAppId}
                    onOpenRescheduleReview={(interview, candidateName) => {
                      setRescheduleReviewTarget({ interview, candidateName });
                    }}
                  />
                ))}
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL MODAL */}
      <Modal open={!!detailApp} onClose={() => setDetailAppId(null)}>
        {detailApp && (
          <DetailModalBody
            app={detailApp}
            onMoveStage={(status) => moveStage(detailApp.id, status)}
            onAssignAssessment={() => setAssignAppId(detailApp.id)}
            onScheduleInterview={() => setScheduleAppId(detailApp.id)}
            onViewProctoring={() => setMonitorAppId(detailApp.id)}
          />
        )}
      </Modal>

      {/* REVIEW RESCHEDULE REQUEST MODAL */}
      <Modal open={!!rescheduleReviewTarget} onClose={() => setRescheduleReviewTarget(null)} maxWidth={460}>
        {rescheduleReviewTarget && (
          <RescheduleReviewModalBody
            target={rescheduleReviewTarget}
            onAcceptReschedule={handleAcceptReschedule}
          />
        )}
      </Modal>

      {/* PROCTORING */}
      <ProctoringMonitor
        applicationId={monitorAppId}
        open={!!monitorAppId}
        onClose={() => setMonitorAppId(null)}
      />

      {/* QUESTION BANK */}
      <QuestionBankManager
        jobId={qbankJob?.id}
        jobTitle={qbankJob?.title}
        open={!!qbankJob}
        onClose={() => setQbankJob(null)}
      />

      {/* SET GENERATOR */}
      <SetGeneratorPanel
        jobId={setgenJob?.id}
        jobTitle={setgenJob?.title}
        requiredSkills={setgenJob?.requiredSkills}
        open={!!setgenJob}
        onClose={() => setSetgenJob(null)}
      />

      {/* SCHEDULE MODAL */}
      <Modal open={scheduleAppId !== null} onClose={() => setScheduleAppId(null)} maxWidth={420}>
        <ScheduleModalBody onSchedule={scheduleInterview} />
      </Modal>

      {/* ASSIGN ASSESSMENT MODAL */}
      <Modal open={assignAppId !== null} onClose={() => setAssignAppId(null)} maxWidth={480}>
        {job && assignAppId !== null && (
          <AssignModalBody
            jobId={job.id}
            onAssignExisting={assignExisting}
            onGenerateNew={generateAndAssign}
          />
        )}
      </Modal>
    </div>
  );
}
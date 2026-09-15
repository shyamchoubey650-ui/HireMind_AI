// import { useState, useEffect, useMemo } from 'react';
// import { apiRequest } from '../../api';
// import ChartCanvas from '../../components/ChartCanvas';
// import Icon from '../../components/Icon';
// import Modal from '../../components/Modal';

// const STAGES = [
//   { key: 'ai_screening', label: 'AI Screening' },
//   { key: 'shortlisted', label: 'Shortlisted' },
//   { key: 'assessment', label: 'Assessment' },
//   { key: 'interview', label: 'Interview' },
//   { key: 'selected', label: 'Selected' },
//   { key: 'rejected', label: 'Rejected' },
// ];
// const COLORS = ['#a78bfa', '#8b5cf6', '#60a5fa', '#ffb020', '#2dd4bf', '#ef6a56'];
// const VERTICAL_COLORS = ['#2563eb', '#f97316', '#451a03', '#dc2626', '#0d9488', '#9333ea'];

// function scoreTier(score) {
//   if (score >= 70) return 'tier-high';
//   if (score >= 40) return 'tier-mid';
//   return 'tier-low';
// }

// // function timeAgo(iso) {
// //   const diffMs = Date.now() - new Date(iso).getTime();
// //   const mins = Math.floor(diffMs / 60000);
// //   if (mins < 1) return 'just now';
// //   if (mins < 60) return `${mins}m ago`;
// //   const hrs = Math.floor(mins / 60);
// //   if (hrs < 24) return `${hrs}h ago`;
// //   return `${Math.floor(hrs / 24)}d ago`;
// // }


// function timeAgo(value) {
//   if (!value) return '';

//   let dateString = String(value).trim();

//   // Treat timezone-less backend timestamps as UTC
//   if (
//     !/[zZ]$/.test(dateString) &&
//     !/[+-]\d{2}:\d{2}$/.test(dateString)
//   ) {
//     dateString = dateString.replace(' ', 'T') + 'Z';
//   }

//   const createdTime = new Date(dateString).getTime();

//   if (Number.isNaN(createdTime)) return '';

//   const diffMs = Math.max(0, Date.now() - createdTime);
//   const mins = Math.floor(diffMs / 60000);

//   if (mins < 1) return 'just now';
//   if (mins < 60) return `${mins}m ago`;

//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;

//   return `${Math.floor(hrs / 24)}d ago`;
// }

// export default function Analytics() {
//   const [data, setData] = useState(null);
//   const [jobsList, setJobsList] = useState(null);
//   const [applicationsList, setApplicationsList] = useState(null);
//   const [interviews, setInterviews] = useState(null);
//   const [notifications, setNotifications] = useState(null);
//   const [candidateMap, setCandidateMap] = useState({});
//   const [jobMap, setJobMap] = useState({});
//   const [selectedInterview, setSelectedInterview] = useState(null);
//   const [expandedCard, setExpandedCard] = useState(null);
  
//   // Toggle state for switching between standard doughnut/bar chart and vertical bar chart
//   const [showVerticalStageChart, setShowVerticalStageChart] = useState(false);

//   // Search states for dropdown cards
//   const [jobSearchQuery, setJobSearchQuery] = useState('');
//   const [appSearchQuery, setAppSearchQuery] = useState('');
//   const [scoreSearchQuery, setScoreSearchQuery] = useState('');
//   const [selectedSearchQuery, setSelectedSearchQuery] = useState('');

//   // Search states for bottom cards
//   const [showTopCandidateSearch, setShowTopCandidateSearch] = useState(false);
//   const [topCandidateSearchQuery, setTopCandidateSearchQuery] = useState('');

//   const [showInterviewSearch, setShowInterviewSearch] = useState(false);
//   const [interviewSearchQuery, setInterviewSearchQuery] = useState('');

//   const [showActivitySearch, setShowActivitySearch] = useState(false);
//   const [activitySearchQuery, setActivitySearchQuery] = useState('');

//   useEffect(() => {
//     apiRequest('/applications/analytics/overview').then(setData).catch(() => setData(null));
//     apiRequest('/interviews/mine').then(setInterviews).catch(() => setInterviews([]));
//     apiRequest('/notifications/mine').then((n) => setNotifications(n.slice(0, 6))).catch(() => setNotifications([]));
    
//     apiRequest('/jobs/mine').then((jobs) => {
//       setJobsList(jobs || []);
//       const map = {};
//       (jobs || []).forEach((j) => { map[j.id] = j.title; });
//       setJobMap(map);
//     }).catch(() => setJobsList([]));

//     apiRequest('/admin/users').then((users) => {
//       const map = {};
//       (users || []).forEach((u) => { map[u.id] = { name: u.full_name, email: u.email }; });
//       setCandidateMap(map);
//     }).catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (jobsList && jobsList.length > 0) {
//       Promise.all(jobsList.map(j => apiRequest(`/jobs/${j.id}/applicants`).catch(() => [])))
//         .then((results) => {
//           const allApps = results.flat();
//           setApplicationsList(allApps);
//         });
//     }
//   }, [jobsList]);

//   function resolveJobTitle(jobId) {
//     return jobMap[jobId] || `Job #${jobId}`;
//   }

//   function resolveCandidateInfo(app) {
//     const cid = app.candidate_id || app.user_id;
//     const userObj = candidateMap[cid] || {};
//     return {
//       name: app.candidate_name || app.full_name || userObj.name || `Candidate #${cid || 'U'}`,
//       email: app.candidate_email || userObj.email || 'No email provided'
//     };
//   }

//   function getTopCandidateName(c) {
//     if (applicationsList) {
//       const foundApp = applicationsList.find(app => app.id === c.application_id);
//       if (foundApp) {
//         return resolveCandidateInfo(foundApp).name;
//       }
//     }
//     return `Candidate #${c.application_id}`;
//   }

//   const chartConfig = useMemo(() => {
//     if (!data) return null;
//     const values = STAGES.map((s) => data.status_breakdown[s.key] || 0);
//     const maxVal = Math.max(...values, 5);

//     if (showVerticalStageChart) {
//       return {
//         type: 'bar',
//         data: {
//           labels: STAGES.map((s) => s.label),
//           datasets: [{ data: values, backgroundColor: VERTICAL_COLORS, borderRadius: 6, barThickness: 24 }],
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: { 
//             legend: { display: false },
//             tooltip: {
//               backgroundColor: 'rgba(15, 17, 32, 0.95)',
//               titleColor: '#fff',
//               bodyColor: '#cbd5e1',
//               borderColor: 'rgba(139, 92, 246, 0.4)',
//               borderWidth: 1,
//               padding: 12,
//               callbacks: {
//                 title: (tooltipItems) => `Stage: ${tooltipItems[0].label}`,
//                 label: (context) => ` Count: ${context.raw} candidate(s)`
//               }
//             }
//           },
//           scales: {
//             x: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { family: 'Inter', size: 10, weight: '600' } } },
//             y: { 
//               beginAtZero: true, 
//               suggestedMax: Math.max(maxVal * 1.25, 10), 
//               ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 }, precision: 0 }, 
//               grid: { color: '#172038' } 
//             },
//           },
//         },
//       };
//     } else {
//       return {
//         type: 'bar',
//         data: {
//           labels: STAGES.map((s) => s.label),
//           datasets: [{ data: values, backgroundColor: COLORS, borderRadius: 6, barThickness: 20 }],
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: { 
//             legend: { display: false },
//             tooltip: {
//               backgroundColor: 'rgba(15, 17, 32, 0.95)',
//               titleColor: '#fff',
//               bodyColor: '#cbd5e1',
//               borderColor: 'rgba(139, 92, 246, 0.4)',
//               borderWidth: 1,
//               padding: 12,
//               callbacks: {
//                 title: (tooltipItems) => `Stage: ${tooltipItems[0].label}`,
//                 label: (context) => ` ${context.raw} candidate${context.raw === 1 ? '' : 's'}`
//               }
//             }
//           },
//           scales: {
//             x: { grid: { display: false }, ticks: { color: '#8892b0', font: { family: 'JetBrains Mono', size: 9 } } },
//             y: { beginAtZero: true, ticks: { color: '#8892b0', stepSize: 1, font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: '#172038' } },
//           },
//         },
//       };
//     }
//   }, [data, showVerticalStageChart]);

//   const filteredTopCandidates = useMemo(() => {
//     if (!data || !data.top_candidates) return [];
//     if (!topCandidateSearchQuery.trim()) return data.top_candidates;
//     const q = topCandidateSearchQuery.toLowerCase().trim();
//     return data.top_candidates.filter((c, i) => {
//       const candidateName = getTopCandidateName(c).toLowerCase();
//       const jobTitle = resolveJobTitle(c.job_id).toLowerCase();
//       const score = String(c.match_score);
//       const rank = String(i + 1);
//       return candidateName.includes(q) || jobTitle.includes(q) || score.includes(q) || rank.includes(q);
//     });
//   }, [data, topCandidateSearchQuery, applicationsList, jobMap]);

//   const upcomingInterviews = useMemo(() => {
//     if (!interviews) return null;
//     const now = Date.now();
//     let list = interviews
//       .filter((iv) => new Date(iv.scheduled_at).getTime() >= now && iv.status === 'scheduled')
//       .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

//     if (interviewSearchQuery.trim()) {
//       const q = interviewSearchQuery.toLowerCase();
//       list = list.filter((iv) => {
//         const jobTitle = resolveJobTitle(iv.job_id).toLowerCase();
//         const candidateName = (iv.candidate_name || candidateMap[iv.candidate_id]?.name || '').toLowerCase();
//         const type = (iv.interview_type || '').toLowerCase();
//         const dateStr = new Date(iv.scheduled_at).toLocaleString().toLowerCase();
//         return jobTitle.includes(q) || candidateName.includes(q) || type.includes(q) || dateStr.includes(q);
//       });
//     }

//     return list.slice(0, 5);
//   }, [interviews, interviewSearchQuery, jobMap, candidateMap]);

//   const filteredNotifications = useMemo(() => {
//     if (!notifications) return [];
//     if (!activitySearchQuery.trim()) return notifications;
//     const q = activitySearchQuery.toLowerCase().trim();
//     return notifications.filter((n) => {
//       const msg = (n.message || '').toLowerCase();
//       const time = timeAgo(n.created_at).toLowerCase();
//       return msg.includes(q) || time.includes(q);
//     });
//   }, [notifications, activitySearchQuery]);

//   const toggleExpand = (e, cardKey) => {
//     e.stopPropagation();
//     setExpandedCard(expandedCard === cardKey ? null : cardKey);
//   };

//   return (
//     <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
//       <style>{`
//         .analytics-card {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.05), 0 8px 30px rgba(0, 0, 0, 0.4);
//           border-radius: 20px;
//           padding: 20px;
//           margin-bottom: 20px;
//           position: relative;
//           overflow: hidden;
//         }
//         .stats-grid-container {
//           display: grid;
//           grid-template-columns: repeat(4, 1fr);
//           gap: 16px;
//           margin-bottom: 20px;
//           align-items: start;
//         }
//         .two-column-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//           margin-bottom: 20px;
//         }
//         .stat-card-box {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.95) 0%, rgba(10, 12, 26, 0.98) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 6px 20px rgba(0, 0, 0, 0.4);
//           border-radius: 18px;
//           padding: 18px;
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           position: relative;
//         }
//         .stat-card-box.s-amber { border-color: rgba(245, 158, 11, 0.4); }
//         .stat-card-box.s-cyan { border-color: rgba(20, 184, 166, 0.4); }
//         .stat-card-box.s-violet { border-color: rgba(139, 92, 246, 0.4); }
//         .stat-card-box.s-teal { border-color: rgba(239, 68, 68, 0.4); }

//         .stat-top-row {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           width: 100%;
//         }
//         .expand-toggle-btn {
//           width: 28px;
//           height: 28px;
//           border-radius: 8px;
//           background: rgba(255, 255, 255, 0.05);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           color: #a78bfa;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           flex-shrink: 0;
//         }
//         .expand-toggle-btn:hover {
//           background: rgba(168, 85, 247, 0.25);
//           color: #fff;
//         }
        
//         .stat-floating-overlay {
//           position: absolute;
//           top: calc(100% + 8px);
//           left: 0;
//           right: 0;
//           width: 100%;
//           background: linear-gradient(135deg, rgba(22, 16, 42, 0.98) 0%, rgba(10, 12, 26, 0.99) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.5);
//           box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85), inset 0 0 25px rgba(139, 92, 246, 0.08);
//           border-radius: 16px;
//           padding: 12px;
//           max-height: 280px;
//           overflow-y: auto;
//           overflow-x: hidden;
//           display: flex;
//           flex-direction: column;
//           gap: 10px;
//           z-index: 9999;
//           box-sizing: border-box;
//         }

//         .stat-search-bar-wrap {
//           position: relative;
//           width: 100%;
//           margin-bottom: 2px;
//         }
//         .stat-search-input {
//           width: 100%;
//           background: rgba(15, 15, 32, 0.95);
//           border: 1.5px solid rgba(139, 92, 246, 0.45);
//           border-radius: 10px;
//           padding: 7px 10px 7px 32px;
//           font-size: 11.5px;
//           color: #f9f5f5;
//           outline: none;
//           box-sizing: border-box;
//           font-family: Inter, sans-serif;
//           transition: all 0.2s ease;
//         }
//         .stat-search-input:focus {
//           border-color: rgba(168, 85, 247, 0.8);
//           box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
//         }
        
//         .stat-detail-row {
//           background: linear-gradient(135deg, rgba(30, 20, 56, 0.6) 0%, rgba(15, 15, 32, 0.8) 100%);
//           border: 1px solid rgba(139, 92, 246, 0.25);
//           border-radius: 12px;
//           padding: 12px 14px;
//           font-size: 12px;
//           color: #e2e8f0;
//           width: 100%;
//           box-sizing: border-box;
//           word-break: break-word;
//           overflow-wrap: break-word;
//           transition: all 0.2s ease;
//         }
//         .stat-detail-row:hover {
//           border-color: rgba(168, 85, 247, 0.6);
//           background: linear-gradient(135deg, rgba(40, 25, 75, 0.7) 0%, rgba(18, 18, 40, 0.9) 100%);
//         }
        
//         .card-header-action {
//           width: 36px;
//           height: 36px;
//           border-radius: 10px;
//           background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(249, 115, 22, 0.25));
//           border: 1.5px solid rgba(10, 255, 112, 0.7);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #f3e8ff;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           box-shadow: inset 0px 0px 35px #079f5d;
//         }
//         .card-header-action:hover {
//           background: linear-gradient(135deg, rgba(168, 85, 247, 0.45), rgba(249, 115, 22, 0.4));
//           border-color: rgba(168, 85, 247, 1);
//           color: #fff;
//           transform: translateY(-1px);
//           box-shadow: inset 0px 0px 35px #079f5d;
//         }
//         .card-header-action.active-search {
//           background: linear-gradient(135deg, rgba(168, 85, 247, 0.55), rgba(249, 115, 22, 0.5));
//           border-color: #c084fc;
//           box-shadow: inset 0px 0px 35px #079f5d;
//           color: #fff;
//         }

//         .live-dot-indicator {
//           width: 8px;
//           height: 8px;
//           background-color: #2dd4bf;
//           border-radius: 50%;
//           display: inline-block;
//           box-shadow: 0 0 8px #2dd4bf;
//           margin-right: 6px;
//         }
//         .interview-item-row {
//           background: rgba(255, 255, 255, 0.02);
//           border: 1px solid rgba(139, 92, 246, 0.2);
//           border-radius: 14px;
//           padding: 12px 14px;
//           display: flex;
//           align-items: center;
//           gap: 14px;
//           margin-bottom: 12px;
//         }
//         .interview-action-btn {
//           width: 28px;
//           height: 28px;
//           border-radius: 8px;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #cbd5e1;
//           cursor: pointer;
//           flex-shrink: 0;
//           transition: all 0.2s ease;
//         }
//         .interview-action-btn:hover {
//           background: rgba(168, 85, 247, 0.2);
//           border-color: rgba(168, 85, 247, 0.5);
//           color: #fff;
//         }
//         .activity-timeline-item {
//           display: flex;
//           gap: 14px;
//           position: relative;
//           padding-bottom: 16px;
//         }
//         .activity-timeline-item:not(:last-child):before {
//           content: '';
//           position: absolute;
//           left: 17px;
//           top: 34px;
//           bottom: -4px;
//           width: 2px;
//           background: rgba(139, 92, 246, 0.25);
//         }

//         @media (max-width: 1024px) {
//           .stats-grid-container {
//             grid-template-columns: repeat(2, 1fr) !important;
//           }
//           .two-column-grid {
//             grid-template-columns: 1fr !important;
//           }
//         }
//         @media (max-width: 600px) {
//           .stats-grid-container {
//             grid-template-columns: 1fr !important;
//           }
//           .analytics-card {
//             padding: 16px !important;
//           }
//         }
//       `}</style>

//       <div className="page-header" style={{ marginBottom: 20 }}>
//         <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center' }}>
//           <span className="live-dot-indicator" /> LIVE
//         </div>
//         <h1 className="page-title"><span className="hl">Analytics</span></h1>
//         <p className="page-sub">Aggregate performance across every job you've posted.</p>
//       </div>

//       {!data && (
//         <div className="stats-grid-container">
//           <div className="card skeleton" style={{ height: 108 }} />
//           <div className="card skeleton" style={{ height: 108 }} />
//           <div className="card skeleton" style={{ height: 108 }} />
//           <div className="card skeleton" style={{ height: 108 }} />
//         </div>
//       )}

//       {data && (
//         <>
//           <div className="stats-grid-container">
//             {/* 1. TOTAL JOBS CARD */}
//             <div className="stat-card-box s-amber">
//               <div className="stat-top-row">
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, overflow: 'hidden' }}>
//                   <div className="icon-badge lg amber" style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                     <Icon name="briefcase" size={20} />
//                   </div>
//                   <div style={{ minWidth: 0 }}>
//                     <div className="stat-label" style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Total jobs</div>
//                     <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
//                       <div className="stat-num" style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>{data.total_jobs}</div>
//                       <div className="stat-delta" style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>{data.open_jobs} open</div>
//                     </div>
//                   </div>
//                 </div>
//                 <button type="button" className="expand-toggle-btn" onClick={(e) => { toggleExpand(e, 'jobs'); setJobSearchQuery(''); }} title="Toggle details">
//                   <span style={{ fontWeight: 'bold', fontSize: 11 }}>{expandedCard === 'jobs' ? '▲' : '▼'}</span>
//                 </button>
//               </div>

//               {expandedCard === 'jobs' && (
//                 <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
//                   <div className="stat-search-bar-wrap">
//                     <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
//                     <input 
//                       type="text" 
//                       className="stat-search-input" 
//                       placeholder="Search jobs..." 
//                       value={jobSearchQuery} 
//                       onChange={(e) => setJobSearchQuery(e.target.value)} 
//                     />
//                   </div>
//                   {jobsList && jobsList.length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No jobs posted yet</div>
//                   ) : jobsList.filter(j => j.title.toLowerCase().includes(jobSearchQuery.toLowerCase())).length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching jobs</div>
//                   ) : (
//                     jobsList.filter(j => j.title.toLowerCase().includes(jobSearchQuery.toLowerCase())).map((j) => (
//                       <div className="stat-detail-row" key={j.id}>
//                         <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
//                           <span style={{ color: '#f59e0b' }}>💼</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</span>
//                         </div>
//                         <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                           <span>📍 {j.location || 'Remote'}</span>
//                           <span>&bull;</span>
//                           <span style={{ color: '#2dd4bf', textTransform: 'uppercase', fontWeight: 600 }}>Status: {j.status}</span>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* 2. APPLICATIONS CARD */}
//             <div className="stat-card-box s-cyan">
//               <div className="stat-top-row">
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, overflow: 'hidden' }}>
//                   <div className="icon-badge lg cyan" style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                     <Icon name="applications" size={20} />
//                   </div>
//                   <div style={{ minWidth: 0 }}>
//                     <div className="stat-label" style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Applications</div>
//                     <div className="stat-num" style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>{data.total_applications}</div>
//                   </div>
//                 </div>
//                 <button type="button" className="expand-toggle-btn" onClick={(e) => { toggleExpand(e, 'applications'); setAppSearchQuery(''); }} title="Toggle details">
//                   <span style={{ fontWeight: 'bold', fontSize: 11 }}>{expandedCard === 'applications' ? '▲' : '▼'}</span>
//                 </button>
//               </div>

//               {expandedCard === 'applications' && (
//                 <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
//                   <div className="stat-search-bar-wrap">
//                     <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
//                     <input 
//                       type="text" 
//                       className="stat-search-input" 
//                       placeholder="Search applications..." 
//                       value={appSearchQuery} 
//                       onChange={(e) => setAppSearchQuery(e.target.value)} 
//                     />
//                   </div>
//                   {!applicationsList ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div>
//                   ) : applicationsList.length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No applications received</div>
//                   ) : applicationsList.filter(app => {
//                     const c = resolveCandidateInfo(app);
//                     return c.name.toLowerCase().includes(appSearchQuery.toLowerCase()) || c.email.toLowerCase().includes(appSearchQuery.toLowerCase());
//                   }).length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching applications</div>
//                   ) : (
//                     applicationsList.filter(app => {
//                       const c = resolveCandidateInfo(app);
//                       return c.name.toLowerCase().includes(appSearchQuery.toLowerCase()) || c.email.toLowerCase().includes(appSearchQuery.toLowerCase());
//                     }).map((app) => {
//                       const candidate = resolveCandidateInfo(app);
//                       return (
//                         <div className="stat-detail-row" key={app.id}>
//                           <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
//                             <span style={{ color: '#14b8a6' }}>👤</span> {candidate.name}
//                           </div>
//                           <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                             <span>✉️ {candidate.email}</span>
//                             <span>&bull;</span>
//                             <span style={{ color: '#a78bfa', fontWeight: 600 }}>Score: {app.match_score}%</span>
//                           </div>
//                         </div>
//                       );
//                     })
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* 3. AVG. AI SCORE CARD */}
//             <div className="stat-card-box s-violet">
//               <div className="stat-top-row">
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, overflow: 'hidden' }}>
//                   <div className="icon-badge lg violet" style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                     <Icon name="zap" size={20} />
//                   </div>
//                   <div style={{ minWidth: 0 }}>
//                     <div className="stat-label" style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Avg. AI score</div>
//                     <div className="stat-num" style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>{data.avg_match_score}%</div>
//                   </div>
//                 </div>
//                 <button type="button" className="expand-toggle-btn" onClick={(e) => { toggleExpand(e, 'score'); setScoreSearchQuery(''); }} title="Toggle details">
//                   <span style={{ fontWeight: 'bold', fontSize: 11 }}>{expandedCard === 'score' ? '▲' : '▼'}</span>
//                 </button>
//               </div>

//               {expandedCard === 'score' && (
//                 <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
//                   <div className="stat-search-bar-wrap">
//                     <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
//                     <input 
//                       type="text" 
//                       className="stat-search-input" 
//                       placeholder="Search candidates or scores..." 
//                       value={scoreSearchQuery} 
//                       onChange={(e) => setScoreSearchQuery(e.target.value)} 
//                     />
//                   </div>
//                   {!applicationsList ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div>
//                   ) : applicationsList.length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No scores available</div>
//                   ) : applicationsList.sort((a,b) => b.match_score - a.match_score).filter(app => {
//                     const c = resolveCandidateInfo(app);
//                     const jTitle = resolveJobTitle(app.job_id);
//                     const q = scoreSearchQuery.toLowerCase();
//                     return c.name.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q) || String(app.match_score).includes(q);
//                   }).length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching scores</div>
//                   ) : (
//                     applicationsList.sort((a,b) => b.match_score - a.match_score).filter(app => {
//                       const c = resolveCandidateInfo(app);
//                       const jTitle = resolveJobTitle(app.job_id);
//                       const q = scoreSearchQuery.toLowerCase();
//                       return c.name.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q) || String(app.match_score).includes(q);
//                     }).map((app) => {
//                       const candidate = resolveCandidateInfo(app);
//                       return (
//                         <div className="stat-detail-row" key={app.id}>
//                           <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
//                             <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}><span style={{ color: '#a78bfa' }}>⚡</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.name}</span></span>
//                             <span style={{ color: '#a78bfa', fontWeight: 700, flexShrink: 0 }}>{app.match_score}%</span>
//                           </div>
//                           <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
//                             <span>💼</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{resolveJobTitle(app.job_id)}</span>
//                           </div>
//                         </div>
//                       );
//                     })
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* 4. SELECTED CANDIDATES CARD */}
//             <div className="stat-card-box s-teal">
//               <div className="stat-top-row">
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, overflow: 'hidden' }}>
//                   <div className="icon-badge lg teal" style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                     <Icon name="applications" size={20} />
//                   </div>
//                   <div style={{ minWidth: 0 }}>
//                     <div className="stat-label" style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Selected</div>
//                     <div className="stat-num" style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>{data.status_breakdown.selected || 0}</div>
//                   </div>
//                 </div>
//                 <button type="button" className="expand-toggle-btn" onClick={(e) => { toggleExpand(e, 'selected'); setSelectedSearchQuery(''); }} title="Toggle details">
//                   <span style={{ fontWeight: 'bold', fontSize: 11 }}>{expandedCard === 'selected' ? '▲' : '▼'}</span>
//                 </button>
//               </div>

//               {expandedCard === 'selected' && (
//                 <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
//                   <div className="stat-search-bar-wrap">
//                     <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
//                     <input 
//                       type="text" 
//                       className="stat-search-input" 
//                       placeholder="Search selected candidates..." 
//                       value={selectedSearchQuery} 
//                       onChange={(e) => setSelectedSearchQuery(e.target.value)} 
//                     />
//                   </div>
//                   {!applicationsList ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div>
//                   ) : applicationsList.filter(app => app.status === 'selected').length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No selected candidates yet</div>
//                   ) : applicationsList.filter(app => app.status === 'selected').filter(app => {
//                     const c = resolveCandidateInfo(app);
//                     const jTitle = resolveJobTitle(app.job_id);
//                     const q = selectedSearchQuery.toLowerCase();
//                     return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q);
//                   }).length === 0 ? (
//                     <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching selected candidates</div>
//                   ) : (
//                     applicationsList.filter(app => app.status === 'selected').filter(app => {
//                       const c = resolveCandidateInfo(app);
//                       const jTitle = resolveJobTitle(app.job_id);
//                       const q = selectedSearchQuery.toLowerCase();
//                       return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q);
//                     }).map((app) => {
//                       const candidate = resolveCandidateInfo(app);
//                       return (
//                         <div className="stat-detail-row" key={app.id}>
//                           <div style={{ fontWeight: 700, color: '#2dd4bf', fontSize: '13px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
//                             <span>⭐</span> {candidate.name}
//                           </div>
//                           <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
//                             <span>✉️ {candidate.email}</span>
//                             <span>&bull;</span>
//                             <span>💼 {resolveJobTitle(app.job_id)}</span>
//                           </div>
//                         </div>
//                       );
//                     })
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="two-column-grid">
//             {/* APPLICATIONS BY STAGE CARD WITH VERTICAL BAR CHART TOGGLE */}
//             <div className="analytics-card" style={{ marginBottom: 0 }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
//                 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', margin: 0 }}>Applications by stage</h2>
//                 <div 
//                   className={`card-header-action ${showVerticalStageChart ? 'active-search' : ''}`}
//                   onClick={() => setShowVerticalStageChart(!showVerticalStageChart)}
//                   title="Toggle Vertical Bar Chart View"
//                 >
//                   <Icon name="analytics" size={16} />
//                 </div>
//               </div>
//               <div style={{ position: 'relative', width: '100%', height: '180px' }}>
//                 {chartConfig && <ChartCanvas config={chartConfig} height={180} />}
//               </div>
//             </div>

//             {/* TOP CANDIDATES CARD WITH HIGHLIGHTED SEARCH ICON */}
//             <div className="analytics-card card-flex" style={{ marginBottom: 0 }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
//                 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', margin: 0 }}>Top candidates</h2>
                
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   {showTopCandidateSearch && (
//                     <div style={{ position: 'relative', width: '180px' }}>
//                       <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center' }}>🔍</span>
//                       <input
//                         type="text"
//                         placeholder="Search candidates..."
//                         value={topCandidateSearchQuery}
//                         onChange={(e) => setTopCandidateSearchQuery(e.target.value)}
//                         autoFocus
//                         style={{
//                           width: '100%',
//                           background: 'rgba(15, 15, 32, 0.95)',
//                           border: '1.5px solid rgba(139, 92, 246, 0.6)',
//                           borderRadius: '9px',
//                           padding: '6px 10px 6px 30px',
//                           fontSize: '11.5px',
//                           color: '#fff',
//                           outline: 'none',
//                           boxSizing: 'border-box',
//                           fontFamily: 'Inter, sans-serif',
//                           boxShadow: '0 0 10px rgba(139, 92, 246, 0.25)'
//                         }}
//                       />
//                     </div>
//                   )}
//                   <div 
//                     className={`card-header-action ${showTopCandidateSearch ? 'active-search' : ''}`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowTopCandidateSearch(!showTopCandidateSearch);
//                       if (showTopCandidateSearch) setTopCandidateSearchQuery('');
//                     }}
//                     title="Toggle top candidates search"
//                   >
//                     <Icon name="search" size={16} />
//                   </div>
//                 </div>
//               </div>

//               {data.top_candidates.length === 0 ? (
//                 <div className="empty-state" style={{ padding: '30px 0' }}>
//                   <div className="es-icon"><Icon name="analytics" size={20} /></div>
//                   <div className="es-title" style={{ fontSize: 14 }}>No applications yet</div>
//                   <div className="es-sub" style={{ fontSize: 12 }}>Post a job to start receiving AI-scored candidates.</div>
//                 </div>
//               ) : filteredTopCandidates.length === 0 ? (
//                 <div className="empty-state" style={{ padding: '30px 0' }}>
//                   <div className="es-title" style={{ fontSize: 14 }}>No matching candidates</div>
//                 </div>
//               ) : (
//                 <div className="scroll-panel-tight" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '180px', overflowY: 'auto' }}>
//                   {filteredTopCandidates.map((c, i) => {
//                     const candidateName = getTopCandidateName(c);
//                     const jobTitle = resolveJobTitle(c.job_id);
//                     return (
//                       <div className="ranked-bar-row" key={c.application_id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '10px 14px' }}>
//                         <div className="ranked-bar-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '12px' }}>
//                           <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                             <span className="mono" style={{ color: '#a78bfa' }}>#{i + 1}</span> {candidateName} &middot; {jobTitle}
//                           </span>
//                           <span className="ranked-bar-value mono" style={{ fontWeight: 700, color: '#fff', flexShrink: 0, marginLeft: 8 }}>{c.match_score}%</span>
//                         </div>
//                         <div className="ranked-bar-track" style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
//                           <div className={`ranked-bar-fill ${scoreTier(c.match_score)}`} style={{ width: `${c.match_score}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #f97316)', borderRadius: '3px' }} />
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="two-column-grid">
//             {/* UPCOMING INTERVIEWS CARD WITH HIGHLIGHTED SEARCH ICON */}
//             <div className="analytics-card" style={{ marginBottom: 0 }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
//                 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', margin: 0 }}>Upcoming interviews</h2>
                
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   {showInterviewSearch && (
//                     <div style={{ position: 'relative', width: '180px' }}>
//                       <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center' }}>🔍</span>
//                       <input
//                         type="text"
//                         placeholder="Search interviews..."
//                         value={interviewSearchQuery}
//                         onChange={(e) => setInterviewSearchQuery(e.target.value)}
//                         autoFocus
//                         style={{
//                           width: '100%',
//                           background: 'rgba(15, 15, 32, 0.95)',
//                           border: '1.5px solid rgba(139, 92, 246, 0.6)',
//                           borderRadius: '9px',
//                           padding: '6px 10px 6px 30px',
//                           fontSize: '11.5px',
//                           color: '#fff',
//                           outline: 'none',
//                           boxSizing: 'border-box',
//                           fontFamily: 'Inter, sans-serif',
//                           boxShadow: '0 0 10px rgba(139, 92, 246, 0.25)'
//                         }}
//                       />
//                     </div>
//                   )}
//                   <div 
//                     className={`card-header-action ${showInterviewSearch ? 'active-search' : ''}`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowInterviewSearch(!showInterviewSearch);
//                       if (showInterviewSearch) setInterviewSearchQuery('');
//                     }}
//                     title="Toggle interview search"
//                   >
//                     <Icon name="search" size={16} />
//                   </div>
//                 </div>
//               </div>

//               {upcomingInterviews === null && <div className="skeleton sk-row" />}
//               {upcomingInterviews && upcomingInterviews.length === 0 && (
//                 <div className="empty-state" style={{ padding: '30px 0' }}>
//                   <div className="es-icon"><Icon name="interviews" size={20} /></div>
//                   <div className="es-title" style={{ fontSize: 14 }}>Nothing scheduled</div>
//                   <div className="es-sub" style={{ fontSize: 12 }}>Interviews you schedule will show up here.</div>
//                 </div>
//               )}
//               {upcomingInterviews && upcomingInterviews.length > 0 && (
//                 <div className="scroll-panel-tight" style={{ maxHeight: '240px', overflowY: 'auto' }}>
//                   {upcomingInterviews.map((iv) => {
//                     const d = new Date(iv.scheduled_at);
//                     const jobTitle = resolveJobTitle(iv.job_id);
//                     const candidateName = iv.candidate_name || candidateMap[iv.candidate_id]?.name || `Candidate #${iv.candidate_id}`;
//                     return (
//                       <div className="interview-item-row" key={iv.id}>
//                         <div className="iv-date" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', minWidth: 50, flexShrink: 0 }}>
//                           <div className="day" style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1 }}>{d.getDate()}</div>
//                           <div className="mon" style={{ fontSize: 9.5, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.5px', marginTop: 2 }}>{d.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                             {iv.interview_type} &middot; {jobTitle}
//                           </div>
//                           <div className="muted mono" style={{ fontSize: 11, marginTop: 3, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
//                             <span>⏰ {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
//                             <span>&bull;</span>
//                             <span>👤 {candidateName}</span>
//                           </div>
//                         </div>
//                         <button 
//                           type="button"
//                           className="interview-action-btn"
//                           onClick={() => setSelectedInterview(iv)}
//                           title="View interview details"
//                         >
//                           <span style={{ fontSize: 13, fontWeight: 'bold' }}>&gt;</span>
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* RECENT ACTIVITY CARD WITH HIGHLIGHTED SEARCH ICON */}
//             <div className="analytics-card" style={{ marginBottom: 0 }}>
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
//                 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', margin: 0 }}>Recent activity</h2>
                
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   {showActivitySearch && (
//                     <div style={{ position: 'relative', width: '180px' }}>
//                       <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center' }}>🔍</span>
//                       <input
//                         type="text"
//                         placeholder="Search activity..."
//                         value={activitySearchQuery}
//                         onChange={(e) => setActivitySearchQuery(e.target.value)}
//                         autoFocus
//                         style={{
//                           width: '100%',
//                           background: 'rgba(15, 15, 32, 0.95)',
//                           border: '1.5px solid rgba(139, 92, 246, 0.6)',
//                           borderRadius: '9px',
//                           padding: '6px 10px 6px 30px',
//                           fontSize: '11.5px',
//                           color: '#fff',
//                           outline: 'none',
//                           boxSizing: 'border-box',
//                           fontFamily: 'Inter, sans-serif',
//                           boxShadow: '0 0 10px rgba(139, 92, 246, 0.25)'
//                         }}
//                       />
//                     </div>
//                   )}
//                   <div 
//                     className={`card-header-action ${showActivitySearch ? 'active-search' : ''}`}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowActivitySearch(!showActivitySearch);
//                       if (showActivitySearch) setActivitySearchQuery('');
//                     }}
//                     title="Toggle activity search"
//                   >
//                     <Icon name="search" size={16} />
//                   </div>
//                 </div>
//               </div>

//               {notifications === null && <div className="skeleton sk-row" />}
//               {filteredNotifications.length === 0 ? (
//                 <div className="empty-state" style={{ padding: '30px 0' }}>
//                   <div className="es-icon"><Icon name="bell" size={20} /></div>
//                   <div className="es-title" style={{ fontSize: 14 }}>No activity found</div>
//                 </div>
//               ) : (
//                 <div className="scroll-panel-tight" style={{ maxHeight: '240px', overflowY: 'auto', paddingLeft: 4 }}>
//                   {filteredNotifications.map((n) => (
//                     <div className="activity-timeline-item" key={n.id}>
//                       <div className="icon-badge" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.4)', color: '#c084fc', zIndex: 2 }}>
//                         <Icon name={n.type === 'interview' ? 'interviews' : n.type === 'assessment' ? 'assessments' : 'applications'} size={13} />
//                       </div>
//                       <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
//                         <div style={{ fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.35 }}>{n.message}</div>
//                         <div className="muted mono" style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{timeAgo(n.created_at)}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}

//       {/* Premium Interview Details Modal */}
//       <Modal open={selectedInterview !== null} onClose={() => setSelectedInterview(null)} maxWidth={480}>
//         {selectedInterview && (() => {
//           const dt = new Date(selectedInterview.scheduled_at);
//           const jobTitle = resolveJobTitle(selectedInterview.job_id);
//           const candidateName = selectedInterview.candidate_name || candidateMap[selectedInterview.candidate_id]?.name || `Candidate #${selectedInterview.candidate_id}`;
//           return (
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
//                 <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 10px #a78bfa', flexShrink: 0 }} />
//                 <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: '#fff', margin: 0 }}>Interview Details</h2>
//               </div>
//               <div style={{ background: 'linear-gradient(135deg, rgba(25, 18, 45, 0.7) 0%, rgba(10, 12, 26, 0.9) 100%)', border: '1.5px solid rgba(139, 92, 246, 0.35)', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-mono, monospace)', fontSize: '13px', color: '#cbd5e1', boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.05)', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
                
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', gap: '12px' }}>
//                   <span style={{ color: '#94a3b8', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, minWidth: '85px' }}>Type:</span>
//                   <span style={{ color: '#fff', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedInterview.interview_type}</span>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', gap: '12px' }}>
//                   <span style={{ color: '#94a3b8', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, minWidth: '85px' }}>Role:</span>
//                   <span style={{ color: '#a78bfa', fontWeight: 600, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>💼 {jobTitle}</span>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', gap: '12px' }}>
//                   <span style={{ color: '#94a3b8', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, minWidth: '85px' }}>Candidate:</span>
//                   <span style={{ color: '#fff', fontWeight: 600, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>👤 {candidateName}</span>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', gap: '12px' }}>
//                   <span style={{ color: '#94a3b8', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, minWidth: '85px' }}>Date:</span>
//                   <span style={{ color: '#fff', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📅 {dt.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px', gap: '12px' }}>
//                   <span style={{ color: '#94a3b8', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, minWidth: '85px' }}>Time:</span>
//                   <span style={{ color: '#2dd4bf', fontWeight: 600, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>⏰ {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
//                 </div>

//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
//                   <span style={{ color: '#94a3b8', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, minWidth: '85px' }}>Status:</span>
//                   <span style={{ color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedInterview.status}</span>
//                 </div>

//               </div>
//               <button className="secondary" style={{ width: '100%', marginTop: 22 }} onClick={() => setSelectedInterview(null)}>Close</button>
//             </div>
//           );
//         })()}
//       </Modal>
//     </div>
//   );
// }




import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import ChartCanvas from '../../components/ChartCanvas';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';

const STAGES = [
  { key: 'ai_screening', label: 'AI Screening', icon: '🤖', color: '#a855f7', gradient: 'linear-gradient(180deg, #c084fc 0%, #9333ea 100%)', glow: 'rgba(168, 85, 247, 0.45)' },
  { key: 'shortlisted', label: 'Shortlisted', icon: '👤', color: '#6366f1', gradient: 'linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)', glow: 'rgba(99, 102, 241, 0.45)' },
  { key: 'assessment', label: 'Assessment', icon: '📑', color: '#38bdf8', gradient: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)', glow: 'rgba(56, 189, 248, 0.45)' },
  { key: 'interview', label: 'Interview', icon: '📅', color: '#fbbf24', gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)', glow: 'rgba(251, 191, 36, 0.45)' },
  { key: 'selected', label: 'Selected', icon: '✔', color: '#2dd4bf', gradient: 'linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)', glow: 'rgba(45, 212, 191, 0.45)' },
  { key: 'rejected', label: 'Rejected', icon: '✖', color: '#f87171', gradient: 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)', glow: 'rgba(248, 113, 113, 0.45)' },
];

const COLORS = ['#a78bfa', '#8b5cf6', '#60a5fa', '#ffb020', '#2dd4bf', '#ef6a56'];
const VERTICAL_COLORS = ['#2563eb', '#f97316', '#451a03', '#dc2626', '#0d9488', '#9333ea'];

const TIMELINE_GRADIENTS = [
  'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
  'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)'
];

function scoreTier(score) {
  if (score >= 70) return 'tier-high';
  if (score >= 40) return 'tier-mid';
  return 'tier-low';
}

function timeAgo(value) {
  if (!value) return '';

  let dateString = String(value).trim();

  if (
    !/[zZ]$/.test(dateString) &&
    !/[+-]\d{2}:\d{2}$/.test(dateString)
  ) {
    dateString = dateString.replace(' ', 'T') + 'Z';
  }

  const createdTime = new Date(dateString).getTime();

  if (Number.isNaN(createdTime)) return '';

  const diffMs = Math.max(0, Date.now() - createdTime);
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name) {
  if (!name) return 'CN';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [jobsList, setJobsList] = useState(null);
  const [applicationsList, setApplicationsList] = useState(null);
  const [interviews, setInterviews] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [candidateMap, setCandidateMap] = useState({});
  const [jobMap, setJobMap] = useState({});
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const [showVerticalStageChart, setShowVerticalStageChart] = useState(false);

  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [scoreSearchQuery, setScoreSearchQuery] = useState('');
  const [selectedSearchQuery, setSelectedSearchQuery] = useState('');

  const [showTopCandidateSearch, setShowTopCandidateSearch] = useState(false);
  const [topCandidateSearchQuery, setTopCandidateSearchQuery] = useState('');

  const [showInterviewSearch, setShowInterviewSearch] = useState(false);
  const [interviewSearchQuery, setInterviewSearchQuery] = useState('');

  const [showActivitySearch, setShowActivitySearch] = useState(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  useEffect(() => {
    apiRequest('/applications/analytics/overview').then(setData).catch(() => setData(null));
    apiRequest('/interviews/mine').then(setInterviews).catch(() => setInterviews([]));
    apiRequest('/notifications/mine').then((n) => setNotifications(n || [])).catch(() => setNotifications([]));
    
    apiRequest('/jobs/mine').then((jobs) => {
      setJobsList(jobs || []);
      const map = {};
      (jobs || []).forEach((j) => { map[j.id] = j.title; });
      setJobMap(map);
    }).catch(() => setJobsList([]));

    apiRequest('/admin/users').then((users) => {
      const map = {};
      (users || []).forEach((u) => { map[u.id] = { name: u.full_name, email: u.email }; });
      setCandidateMap(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobsList && jobsList.length > 0) {
      Promise.all(jobsList.map(j => apiRequest(`/jobs/${j.id}/applicants`).catch(() => [])))
        .then((results) => {
          const allApps = results.flat();
          setApplicationsList(allApps);
        });
    }
  }, [jobsList]);

  function resolveJobTitle(jobId) {
    return jobMap[jobId] || `Job #${jobId}`;
  }

  function resolveCandidateInfo(app) {
    const cid = app.candidate_id || app.user_id;
    const userObj = candidateMap[cid] || {};
    return {
      name: app.candidate_name || app.full_name || userObj.name || `Candidate #${cid || 'U'}`,
      email: app.candidate_email || userObj.email || 'No email provided'
    };
  }

  function getTopCandidateName(c) {
    if (applicationsList) {
      const foundApp = applicationsList.find(app => app.id === c.application_id);
      if (foundApp) {
        return resolveCandidateInfo(foundApp).name;
      }
    }
    return `Candidate #${c.application_id}`;
  }

  function getTopCandidateEmail(c) {
    if (applicationsList) {
      const foundApp = applicationsList.find(app => app.id === c.application_id);
      if (foundApp) {
        return resolveCandidateInfo(foundApp).email;
      }
    }
    return 'No email provided';
  }

  function getInterviewCandidateEmail(iv) {
    if (iv.candidate_email) return iv.candidate_email;
    const userObj = candidateMap[iv.candidate_id] || {};
    if (userObj.email) return userObj.email;
    if (applicationsList) {
      const foundApp = applicationsList.find(app => (app.candidate_id === iv.candidate_id || app.user_id === iv.candidate_id));
      if (foundApp) {
        return resolveCandidateInfo(foundApp).email;
      }
    }
    return 'No email provided';
  }

  const stageValues = useMemo(() => {
    if (!data?.status_breakdown) return STAGES.map(() => 0);
    return STAGES.map(s => data.status_breakdown[s.key] || 0);
  }, [data]);

  const maxStageVal = useMemo(() => {
    const maxVal = Math.max(...stageValues, 1);
    return Math.max(Math.ceil(maxVal * 1.2), 8);
  }, [stageValues]);

  const chartConfig = useMemo(() => {
    if (!data) return null;
    const values = STAGES.map((s) => data.status_breakdown[s.key] || 0);
    const maxVal = Math.max(...values, 5);

    return {
      type: 'bar',
      data: {
        labels: STAGES.map((s) => s.label),
        datasets: [{ data: values, backgroundColor: VERTICAL_COLORS, borderRadius: 6, barThickness: 20 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 17, 32, 0.95)',
            titleColor: '#fff',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(139, 92, 246, 0.4)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              title: (tooltipItems) => `Stage: ${tooltipItems[0].label}`,
              label: (context) => ` Count: ${context.raw} candidate(s)`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { family: 'Inter', size: 9, weight: '600' } } },
          y: { 
            beginAtZero: true, 
            suggestedMax: Math.max(maxVal * 1.25, 10), 
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 9 }, precision: 0 }, 
            grid: { color: '#172038' } 
          },
        },
      },
    };
  }, [data]);

  const filteredTopCandidates = useMemo(() => {
    if (!data || !data.top_candidates) return [];
    let list = [...data.top_candidates];

    if (topCandidateSearchQuery.trim()) {
      const q = topCandidateSearchQuery.toLowerCase().trim();
      list = list.filter((c, i) => {
        const candidateName = getTopCandidateName(c).toLowerCase();
        const jobTitle = resolveJobTitle(c.job_id).toLowerCase();
        const score = String(c.match_score);
        const rank = String(i + 1);
        return candidateName.includes(q) || jobTitle.includes(q) || score.includes(q) || rank.includes(q);
      });
    }

    list.sort((a, b) => b.match_score - a.match_score);
    return list;
  }, [data, topCandidateSearchQuery, applicationsList, jobMap]);

  const allScheduledInterviews = useMemo(() => {
    if (!interviews) return [];
    const now = Date.now();
    return interviews
      .filter((iv) => new Date(iv.scheduled_at).getTime() >= now && iv.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  }, [interviews]);

  const upcomingInterviews = useMemo(() => {
    let list = [...allScheduledInterviews];
    if (interviewSearchQuery.trim()) {
      const q = interviewSearchQuery.toLowerCase();
      list = list.filter((iv) => {
        const jobTitle = resolveJobTitle(iv.job_id).toLowerCase();
        const candidateName = (iv.candidate_name || candidateMap[iv.candidate_id]?.name || '').toLowerCase();
        const type = (iv.interview_type || '').toLowerCase();
        const dateStr = new Date(iv.scheduled_at).toLocaleString().toLowerCase();
        return jobTitle.includes(q) || candidateName.includes(q) || type.includes(q) || dateStr.includes(q);
      });
    }
    return list.slice(0, 5);
  }, [allScheduledInterviews, interviewSearchQuery, jobMap, candidateMap]);

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    if (!activitySearchQuery.trim()) return notifications;
    const q = activitySearchQuery.toLowerCase().trim();
    return notifications.filter((n) => {
      const msg = (n.message || '').toLowerCase();
      const time = timeAgo(n.created_at).toLowerCase();
      return msg.includes(q) || time.includes(q);
    });
  }, [notifications, activitySearchQuery]);

  const toggleExpand = (e, cardKey) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === cardKey ? null : cardKey);
  };

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .analytics-card {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.65) 0%, rgba(8, 10, 22, 0.92) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.05), 0 10px 35px rgba(0, 0, 0, 0.45);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
        }
        .stats-grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
          align-items: start;
          position: relative;
          z-index: 10;
        }
        .two-column-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .stat-card-box {
          position: relative;
          border-radius: 18px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
          min-height: 104px;
          z-index: 1;
        }
        .stat-card-box:hover { transform: translateY(-1px); }
        .stat-card-box.is-active-dropdown { z-index: 1000 !important; }

        .stat-card-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .stat-icon-badge {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card-box.s-amber {
          background: #19120a;
          border: 1.5px solid rgba(245, 158, 11, 0.45);
        }
        .stat-card-box.s-amber .stat-icon-badge {
          background: rgba(245, 158, 11, 0.22);
          border: 1.5px solid rgba(245, 158, 11, 0.6);
          color: #fbbf24;
        }

        .stat-card-box.s-cyan {
          background: #06161c;
          border: 1.5px solid rgba(20, 184, 166, 0.45);
        }
        .stat-card-box.s-cyan .stat-icon-badge {
          background: rgba(20, 184, 166, 0.22);
          border: 1.5px solid rgba(20, 184, 166, 0.6);
          color: #2dd4bf;
        }

        .stat-card-box.s-violet {
          background: #0a1124;
          border: 1.5px solid rgba(139, 92, 246, 0.45);
        }
        .stat-card-box.s-violet .stat-icon-badge {
          background: rgba(37, 99, 235, 0.22);
          border: 1.5px solid rgba(59, 130, 246, 0.6);
          color: #93c5fd;
        }

        .stat-card-box.s-teal {
          background: #1c0c16;
          border: 1.5px solid rgba(236, 72, 153, 0.45);
        }
        .stat-card-box.s-teal .stat-icon-badge {
          background: rgba(236, 72, 153, 0.22);
          border: 1.5px solid rgba(236, 72, 153, 0.6);
          color: #f472b6;
        }

        .stat-info-wrap {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .stat-label-text {
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 500;
        }
        .stat-main-number {
          font-size: 24px;
          font-weight: 800;
          font-family: var(--font-display, sans-serif);
          color: #ffffff;
          line-height: 1.15;
          margin-top: 2px;
        }
        .stat-badge-sub {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 3px;
        }
        .stat-card-box.s-amber .stat-badge-sub { color: #f59e0b; }
        .stat-card-box.s-cyan .stat-badge-sub { color: #2dd4bf; }
        .stat-card-box.s-violet .stat-badge-sub { color: #a78bfa; }
        .stat-card-box.s-teal .stat-badge-sub { color: #f87171; }

        .stat-dropdown-toggle {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #94a3b8;
          transition: transform 0.15s ease;
          flex-shrink: 0;
        }
        .stat-card-box:hover .stat-dropdown-toggle { color: #ffffff; }
        .stat-dropdown-toggle.is-expanded { transform: rotate(180deg); color: #ffffff; }
        
        .stat-floating-overlay {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          width: 100%;
          min-width: 280px;
          background: #0b0f20 !important;
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 14px;
          padding: 12px;
          max-height: 260px;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 999999 !important;
          box-sizing: border-box;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8);
          cursor: default;
        }

        .stat-search-bar-wrap {
          position: relative;
          width: 100%;
          margin-bottom: 2px;
        }
        .stat-search-input {
          width: 100%;
          background: #10162a;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 9px;
          padding: 8px 12px 8px 32px;
          font-size: 12.5px;
          color: #fff;
          outline: none;
          box-sizing: border-box;
        }
        .stat-search-input:focus {
          border-color: rgba(168, 85, 247, 0.8);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }
        
        .stat-detail-row {
          background: #11182e;
          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 9px;
          padding: 9px 12px;
          font-size: 12px;
          color: #e2e8f0;
          width: 100%;
          box-sizing: border-box;
          word-break: break-word;
          overflow-wrap: break-word;
          transition: all 0.2s ease;
        }
        .stat-detail-row:hover {
          border-color: rgba(168, 85, 247, 0.6);
          background: linear-gradient(135deg, rgba(40, 25, 75, 0.7) 0%, rgba(18, 18, 40, 0.9) 100%);
        }
        
        .card-header-action {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(249, 115, 22, 0.25));
          border: 1.5px solid rgba(10, 255, 112, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f3e8ff;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: inset 0px 0px 35px #079f5d;
        }
        .card-header-action:hover {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.45), rgba(249, 115, 22, 0.4));
          border-color: rgba(168, 85, 247, 1);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: inset 0px 0px 35px #079f5d;
        }
        .card-header-action.active-search {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.55), rgba(249, 115, 22, 0.5));
          border-color: #c084fc;
          box-shadow: inset 0px 0px 35px #079f5d;
          color: #fff;
        }

        .live-dot-indicator {
          width: 8px;
          height: 8px;
          background-color: #2dd4bf;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px #2dd4bf;
          margin-right: 6px;
        }

        .interview-card-neon {
          background: linear-gradient(135deg, rgba(18, 16, 38, 0.8) 0%, rgba(8, 10, 24, 0.95) 100%);
          border-radius: 14px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
        }
        .interview-card-neon:hover {
          transform: translateY(-1px);
        }

        .activity-item-card {
          background: linear-gradient(135deg, rgba(18, 16, 38, 0.75) 0%, rgba(8, 10, 24, 0.9) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 7px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          transition: all 0.2s ease;
          cursor: pointer;
          flex: 1;
          min-width: 0;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }
        .activity-item-card:hover {
          border-color: rgba(168, 85, 247, 0.55);
          background: linear-gradient(135deg, rgba(28, 22, 54, 0.85) 0%, rgba(12, 14, 32, 0.95) 100%);
          transform: translateY(-1px);
        }

        .chevron-action-btn {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 11px;
          font-weight: bold;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .activity-item-card:hover .chevron-action-btn {
          background: rgba(168, 85, 247, 0.25);
          border-color: rgba(168, 85, 247, 0.6);
          color: #fff;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
        }

        /* DYNAMIC NEON BAR CHART STYLING */
        .chart-bar-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
          position: relative;
          flex: 1;
          min-width: 0;
          padding: 0 4px;
        }
        .chart-bar-pillar {
          width: 32px;
          max-width: 90%;
          border-radius: 8px 8px 3px 3px;
          position: relative;
          transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          min-height: 6px;
        }
        .chart-badge-tag {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1px 8px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          white-space: nowrap;
        }

        @media (max-width: 1024px) {
          .stats-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .two-column-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .stats-grid-container {
            grid-template-columns: 1fr !important;
          }
          .analytics-card {
            padding: 12px 14px !important;
          }
          .interview-card-neon {
            flex-direction: row !important;
            align-items: center !important;
            padding: 6px 10px !important;
            gap: 8px !important;
          }
          .interview-card-neon .iv-right-actions {
            width: auto !important;
            margin-top: 0 !important;
          }
          .activity-timeline-row {
            gap: 8px !important;
          }
          .activity-item-card {
            padding: 6px 10px !important;
          }
          .chart-bar-pillar {
            width: 20px !important;
          }
        }
      `}</style>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="live-dot-indicator" /> LIVE
        </div>
        <h1 className="page-title"><span className="hl">Analytics</span></h1>
        <p className="page-sub">Aggregate performance across every job you've posted.</p>
      </div>

      {!data && (
        <div className="stats-grid-container">
          <div className="card skeleton" style={{ height: 104 }} />
          <div className="card skeleton" style={{ height: 104 }} />
          <div className="card skeleton" style={{ height: 104 }} />
          <div className="card skeleton" style={{ height: 104 }} />
        </div>
      )}

      {data && (
        <>
          <div className="stats-grid-container">
            {/* 1. TOTAL JOBS CARD */}
            <div 
              className={`stat-card-box s-amber ${expandedCard === 'jobs' ? 'is-active-dropdown' : ''}`}
              onClick={(e) => { toggleExpand(e, 'jobs'); setJobSearchQuery(''); }}
            >
              <div className="stat-card-left">
                <div className="stat-icon-badge">
                  <Icon name="briefcase" size={22} />
                </div>
                <div className="stat-info-wrap">
                  <span className="stat-label-text">Total jobs</span>
                  <span className="stat-main-number">{data.total_jobs}</span>
                  <span className="stat-badge-sub">
                    <span>{data.open_jobs} open</span>
                  </span>
                </div>
              </div>

              <div className={`stat-dropdown-toggle ${expandedCard === 'jobs' ? 'is-expanded' : ''}`} title="View details">
                ▼
              </div>

              {expandedCard === 'jobs' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div className="stat-search-bar-wrap">
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
                    <input 
                      type="text" 
                      className="stat-search-input" 
                      placeholder="Search jobs..." 
                      value={jobSearchQuery} 
                      onChange={(e) => setJobSearchQuery(e.target.value)} 
                    />
                  </div>
                  {jobsList && jobsList.length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No jobs posted yet</div>
                  ) : jobsList.filter(j => j.title.toLowerCase().includes(jobSearchQuery.toLowerCase())).length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching jobs</div>
                  ) : (
                    jobsList.filter(j => j.title.toLowerCase().includes(jobSearchQuery.toLowerCase())).map((j) => (
                      <div className="stat-detail-row" key={j.id}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: '#f59e0b' }}>💼</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span>📍 {j.location || 'Remote'}</span>
                          <span>&bull;</span>
                          <span style={{ color: '#2dd4bf', textTransform: 'uppercase', fontWeight: 600 }}>Status: {j.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 2. APPLICATIONS CARD */}
            <div 
              className={`stat-card-box s-cyan ${expandedCard === 'applications' ? 'is-active-dropdown' : ''}`}
              onClick={(e) => { toggleExpand(e, 'applications'); setAppSearchQuery(''); }}
            >
              <div className="stat-card-left">
                <div className="stat-icon-badge">
                  <Icon name="applications" size={22} />
                </div>
                <div className="stat-info-wrap">
                  <span className="stat-label-text">Applications</span>
                  <span className="stat-main-number">{data.total_applications}</span>
                  <span className="stat-badge-sub">
                    <span>Total received</span>
                  </span>
                </div>
              </div>

              <div className={`stat-dropdown-toggle ${expandedCard === 'applications' ? 'is-expanded' : ''}`} title="View details">
                ▼
              </div>

              {expandedCard === 'applications' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div className="stat-search-bar-wrap">
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
                    <input 
                      type="text" 
                      className="stat-search-input" 
                      placeholder="Search applications..." 
                      value={appSearchQuery} 
                      onChange={(e) => setAppSearchQuery(e.target.value)} 
                    />
                  </div>
                  {!applicationsList ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div>
                  ) : applicationsList.length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No applications received</div>
                  ) : applicationsList.filter(app => {
                    const c = resolveCandidateInfo(app);
                    return c.name.toLowerCase().includes(appSearchQuery.toLowerCase()) || c.email.toLowerCase().includes(appSearchQuery.toLowerCase());
                  }).length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching applications</div>
                  ) : (
                    applicationsList.filter(app => {
                      const c = resolveCandidateInfo(app);
                      return c.name.toLowerCase().includes(appSearchQuery.toLowerCase()) || c.email.toLowerCase().includes(appSearchQuery.toLowerCase());
                    }).map((app) => {
                      const candidate = resolveCandidateInfo(app);
                      return (
                        <div className="stat-detail-row" key={app.id}>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#14b8a6' }}>👤</span> {candidate.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span>✉️ {candidate.email}</span>
                            <span>&bull;</span>
                            <span style={{ color: '#a78bfa', fontWeight: 600 }}>Score: {app.match_score}%</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 3. AVG. AI SCORE CARD */}
            <div 
              className={`stat-card-box s-violet ${expandedCard === 'score' ? 'is-active-dropdown' : ''}`}
              onClick={(e) => { toggleExpand(e, 'score'); setScoreSearchQuery(''); }}
            >
              <div className="stat-card-left">
                <div className="stat-icon-badge">
                  <Icon name="zap" size={22} />
                </div>
                <div className="stat-info-wrap">
                  <span className="stat-label-text">Avg. AI score</span>
                  <span className="stat-main-number">{data.avg_match_score}%</span>
                  <span className="stat-badge-sub">
                    <span>Platform avg</span>
                  </span>
                </div>
              </div>

              <div className={`stat-dropdown-toggle ${expandedCard === 'score' ? 'is-expanded' : ''}`} title="View details">
                ▼
              </div>

              {expandedCard === 'score' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div className="stat-search-bar-wrap">
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
                    <input 
                      type="text" 
                      className="stat-search-input" 
                      placeholder="Search candidates or scores..." 
                      value={scoreSearchQuery} 
                      onChange={(e) => setScoreSearchQuery(e.target.value)} 
                    />
                  </div>
                  {!applicationsList ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div>
                  ) : applicationsList.length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No scores available</div>
                  ) : applicationsList.sort((a,b) => b.match_score - a.match_score).filter(app => {
                    const c = resolveCandidateInfo(app);
                    const jTitle = resolveJobTitle(app.job_id);
                    const q = scoreSearchQuery.toLowerCase();
                    return c.name.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q) || String(app.match_score).includes(q);
                  }).length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching scores</div>
                  ) : (
                    applicationsList.sort((a,b) => b.match_score - a.match_score).filter(app => {
                      const c = resolveCandidateInfo(app);
                      const jTitle = resolveJobTitle(app.job_id);
                      const q = scoreSearchQuery.toLowerCase();
                      return c.name.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q) || String(app.match_score).includes(q);
                    }).map((app) => {
                      const candidate = resolveCandidateInfo(app);
                      return (
                        <div className="stat-detail-row" key={app.id}>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}><span style={{ color: '#a78bfa' }}>⚡</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidate.name}</span></span>
                            <span style={{ color: '#a78bfa', fontWeight: 700, flexShrink: 0 }}>{app.match_score}%</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>💼</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{resolveJobTitle(app.job_id)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 4. SELECTED CANDIDATES CARD */}
            <div 
              className={`stat-card-box s-teal ${expandedCard === 'selected' ? 'is-active-dropdown' : ''}`}
              onClick={(e) => { toggleExpand(e, 'selected'); setSelectedSearchQuery(''); }}
            >
              <div className="stat-card-left">
                <div className="stat-icon-badge">
                  <Icon name="applications" size={22} />
                </div>
                <div className="stat-info-wrap">
                  <span className="stat-label-text">Selected</span>
                  <span className="stat-main-number">{data.status_breakdown.selected || 0}</span>
                  <span className="stat-badge-sub">
                    <span>Hires made</span>
                  </span>
                </div>
              </div>

              <div className={`stat-dropdown-toggle ${expandedCard === 'selected' ? 'is-expanded' : ''}`} title="View details">
                ▼
              </div>

              {expandedCard === 'selected' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div className="stat-search-bar-wrap">
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
                    <input 
                      type="text" 
                      className="stat-search-input" 
                      placeholder="Search selected candidates..." 
                      value={selectedSearchQuery} 
                      onChange={(e) => setSelectedSearchQuery(e.target.value)} 
                    />
                  </div>
                  {!applicationsList ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div>
                  ) : applicationsList.filter(app => app.status === 'selected').length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No selected candidates yet</div>
                  ) : applicationsList.filter(app => app.status === 'selected').filter(app => {
                    const c = resolveCandidateInfo(app);
                    const jTitle = resolveJobTitle(app.job_id);
                    const q = selectedSearchQuery.toLowerCase();
                    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q);
                  }).length === 0 ? (
                    <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No matching selected candidates</div>
                  ) : (
                    applicationsList.filter(app => app.status === 'selected').filter(app => {
                      const c = resolveCandidateInfo(app);
                      const jTitle = resolveJobTitle(app.job_id);
                      const q = selectedSearchQuery.toLowerCase();
                      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || jTitle.toLowerCase().includes(q);
                    }).map((app) => {
                      const candidate = resolveCandidateInfo(app);
                      return (
                        <div className="stat-detail-row" key={app.id}>
                          <div style={{ fontWeight: 700, color: '#2dd4bf', fontSize: '13px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>⭐</span> {candidate.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span>✉️ {candidate.email}</span>
                            <span>&bull;</span>
                            <span>💼 {resolveJobTitle(app.job_id)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="two-column-grid">
            {/* APPLICATIONS BY STAGE CARD (WITH DYNAMIC SWITCH BETWEEN CHARTCANVAS & CUSTOM NEON VIEW) */}
            <div className="analytics-card" style={{ marginBottom: 0, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.45), inset 0 0 8px rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <Icon name="analytics" size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.2px' }}>
                      Applications by Stage
                    </h2>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0 0' }}>
                      Track how many applications are in each stage of the hiring pipeline.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div 
                    className={`card-header-action ${showVerticalStageChart ? 'active-search' : ''}`}
                    onClick={() => setShowVerticalStageChart(!showVerticalStageChart)}
                    title="Toggle Bar Chart View"
                    style={{ width: 34, height: 34, borderRadius: '10px' }}
                  >
                    <Icon name="analytics" size={15} />
                  </div>
                </div>
              </div>

              {/* View 1: Custom Glowing Neon Dynamic Visualizer */}
              {!showVerticalStageChart && (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '210px',
                  background: 'rgba(8, 11, 26, 0.6)',
                  border: '1px solid rgba(139, 92, 246, 0.18)',
                  borderRadius: '16px',
                  padding: '12px 14px 10px 30px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                }}>
                  {/* Y-Axis Guidelines & Numbers */}
                  <div style={{ position: 'absolute', top: 12, bottom: 42, left: 8, right: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    {[...Array(5)].map((_, i) => {
                      const stepVal = Math.round(maxStageVal - (i * (maxStageVal / 4)));
                      return (
                        <div key={i} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 9.5, color: '#64748b', fontFamily: 'JetBrains Mono', width: 14, textAlign: 'right' }}>{stepVal}</span>
                          <div style={{ flex: 1, height: '1px', borderBottom: '1px dashed rgba(255, 255, 255, 0.08)' }} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Bars Rendering Section */}
                  <div style={{ position: 'relative', flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', zIndex: 2, paddingBottom: '4px' }}>
                    {STAGES.map((s) => {
                      const count = data?.status_breakdown ? (data.status_breakdown[s.key] || 0) : 0;
                      const heightPercent = Math.max((count / maxStageVal) * 100, count > 0 ? 10 : 3);

                      return (
                        <div key={s.key} className="chart-bar-column">
                          <div
                            className="chart-bar-pillar"
                            style={{
                              height: `${heightPercent}%`,
                              background: s.gradient,
                              boxShadow: count > 0 ? `0 0 16px ${s.glow}` : 'none'
                            }}
                          >
                            <div className="chart-badge-tag">
                              {count}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-Axis Baseline & Labels with Icons */}
                  <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', justifyContent: 'space-around', paddingTop: 6, zIndex: 2 }}>
                    {STAGES.map((s) => (
                      <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                        <span style={{ fontSize: 13, color: s.color, lineHeight: 1 }}>{s.icon}</span>
                        <span style={{ fontSize: 9.5, color: '#94a3b8', fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55px', textAlign: 'center' }}>
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 2: ChartCanvas View with Hover Tooltip Functionality */}
              {showVerticalStageChart && (
                <div style={{ position: 'relative', width: '100%', height: '210px', boxSizing: 'border-box', overflow: 'hidden' }}>
                  {chartConfig && <ChartCanvas config={chartConfig} height={210} />}
                </div>
              )}
            </div>

            {/* COMPRESSED TOP CANDIDATES CARD */}
            <div className="analytics-card" style={{ marginBottom: 0, padding: '16px 20px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <Icon name="applications" size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Top <span style={{ background: 'linear-gradient(90deg, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Candidates</span>
                    </h2>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Track top talent from assessments</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {showTopCandidateSearch && (
                    <div style={{ position: 'relative', width: '140px' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#94a3b8' }}>🔍</span>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={topCandidateSearchQuery}
                        onChange={(e) => setTopCandidateSearchQuery(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: 'rgba(15, 15, 32, 0.95)',
                          border: '1.5px solid rgba(139, 92, 246, 0.6)',
                          borderRadius: '8px',
                          padding: '5px 8px 5px 26px',
                          fontSize: '11px',
                          color: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      />
                    </div>
                  )}
                  <div 
                    className={`card-header-action ${showTopCandidateSearch ? 'active-search' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTopCandidateSearch(!showTopCandidateSearch);
                      if (showTopCandidateSearch) setTopCandidateSearchQuery('');
                    }}
                    title="Toggle search"
                    style={{ width: 36, height: 36, borderRadius: '10px' }}
                  >
                    <Icon name="search" size={15} />
                  </div>
                </div>
              </div>

              {data.top_candidates.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 0' }}>
                  <div className="es-icon"><Icon name="analytics" size={18} /></div>
                  <div className="es-title" style={{ fontSize: 13 }}>No applications yet</div>
                  <div className="es-sub" style={{ fontSize: 11 }}>Post a job to start receiving AI-scored candidates.</div>
                </div>
              ) : filteredTopCandidates.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 0' }}>
                  <div className="es-title" style={{ fontSize: 13 }}>No matching candidates</div>
                </div>
              ) : (
                <div className="scroll-panel-tight" style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '210px', overflowY: 'auto', paddingRight: 2 }}>
                  {filteredTopCandidates.map((c, i) => {
                    const candidateName = getTopCandidateName(c);
                    const jobTitle = resolveJobTitle(c.job_id);
                    const initials = getInitials(candidateName);
                    const isFirst = i === 0;

                    return (
                      <div 
                        key={c.application_id} 
                        onClick={() => setSelectedCandidate(c)}
                        style={{ 
                          background: isFirst 
                            ? 'linear-gradient(135deg, rgba(35, 24, 55, 0.9) 0%, rgba(12, 14, 30, 0.95) 100%)' 
                            : 'linear-gradient(135deg, rgba(20, 16, 38, 0.75) 0%, rgba(8, 10, 24, 0.9) 100%)', 
                          border: isFirst ? '1.5px solid rgba(245, 158, 11, 0.7)' : '1.5px solid rgba(139, 92, 246, 0.3)', 
                          borderRadius: '12px', 
                          padding: '8px 12px', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          transition: 'all 0.2s ease',
                          boxShadow: isFirst 
                            ? '0 6px 20px rgba(245, 158, 11, 0.12), inset 0 0 12px rgba(245, 158, 11, 0.06)' 
                            : '0 3px 12px rgba(0,0,0,0.25)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = isFirst ? '#fbbf24' : 'rgba(168, 85, 247, 0.7)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = isFirst ? 'rgba(245, 158, 11, 0.7)' : 'rgba(139, 92, 246, 0.3)'}
                      >
                        {/* Left: Rank & Initials Avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <div style={{
                            width: 30,
                            height: 30,
                            borderRadius: '9px',
                            background: isFirst ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isFirst ? '0 0 12px rgba(245, 158, 11, 0.5)' : '0 0 8px rgba(37, 99, 235, 0.3)',
                            color: '#fff',
                            flexShrink: 0,
                            position: 'relative'
                          }}>
                            {isFirst && (
                              <span style={{ position: 'absolute', top: -8, fontSize: 10 }}>👑</span>
                            )}
                            <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-display)' }}>#{i + 1}</span>
                          </div>

                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 11,
                            flexShrink: 0,
                            boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
                          }}>
                            {initials}
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                              {candidateName}
                            </div>
                            <div style={{ fontSize: 10.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span>💻</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobTitle}</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Progress Bar */}
                        <div style={{ flex: 1, maxWidth: '120px', display: 'flex', flexDirection: 'column', gap: 4, padding: '0 6px' }}>
                          <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <div style={{ width: `${c.match_score}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #38bdf8)', borderRadius: '3px', boxShadow: '0 0 8px rgba(168, 85, 247, 0.4)' }} />
                          </div>
                        </div>

                        {/* Right: Score Pill & Arrow Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <div style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '16px',
                            padding: '3px 9px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#34d399',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)'
                          }}>
                            <span>↗</span> {c.match_score}%
                          </div>

                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#cbd5e1',
                            fontSize: 12,
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                          }}>
                            &gt;
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* COMPACT & EXTENDED UPCOMING INTERVIEWS & RECENT ACTIVITY GRID */}
          <div className="two-column-grid">
            {/* 1. UPCOMING INTERVIEWS CARD */}
            <div className="analytics-card" style={{ marginBottom: 0, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '300px' }}>
              <div>
                {/* Header with Search Icon Toggle Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '11px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 16px rgba(59, 130, 246, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.3)',
                      color: '#fff',
                      flexShrink: 0
                    }}>
                      <Icon name="interviews" size={17} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Upcoming Interviews
                      </h2>
                      <p style={{ fontSize: 10.5, color: '#94a3b8', margin: '1px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stay prepared. Your next opportunity is on the way.</p>
                    </div>
                  </div>

                  {/* Search toggle container */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {showInterviewSearch && (
                      <div style={{ position: 'relative', width: '130px' }}>
                        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#94a3b8' }}>🔍</span>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={interviewSearchQuery}
                          onChange={(e) => setInterviewSearchQuery(e.target.value)}
                          autoFocus
                          style={{
                            width: '100%',
                            background: 'rgba(15, 17, 34, 0.85)',
                            border: '1.5px solid rgba(139, 92, 246, 0.5)',
                            borderRadius: '10px',
                            padding: '4px 8px 4px 24px',
                            fontSize: '10.5px',
                            color: '#fff',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                      </div>
                    )}
                    <div 
                      className={`card-header-action ${showInterviewSearch ? 'active-search' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInterviewSearch(!showInterviewSearch);
                        if (showInterviewSearch) setInterviewSearchQuery('');
                      }}
                      title="Toggle interview search"
                      style={{ width: 34, height: 34, borderRadius: '10px' }}
                    >
                      <Icon name="search" size={15} />
                    </div>
                  </div>
                </div>

                {/* Content List */}
                {upcomingInterviews === null && <div className="skeleton sk-row" />}
                {upcomingInterviews && upcomingInterviews.length === 0 && (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <div className="es-icon"><Icon name="interviews" size={18} /></div>
                    <div className="es-title" style={{ fontSize: 12.5 }}>Nothing scheduled</div>
                    <div className="es-sub" style={{ fontSize: 10.5 }}>Interviews you schedule will show up here.</div>
                  </div>
                )}
                {upcomingInterviews && upcomingInterviews.length > 0 && (
                  <div className="scroll-panel-tight" style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: '215px', overflowY: 'auto', paddingRight: 2 }}>
                    {upcomingInterviews.map((iv, index) => {
                      const d = new Date(iv.scheduled_at);
                      const jobTitle = resolveJobTitle(iv.job_id);
                      const candidateName = iv.candidate_name || candidateMap[iv.candidate_id]?.name || `Candidate #${iv.candidate_id}`;
                      const isTealAccent = index % 2 === 1;

                      return (
                        <div 
                          key={iv.id} 
                          className="interview-card-neon"
                          onClick={() => setSelectedInterview(iv)}
                          style={{
                            border: isTealAccent ? '1.5px solid rgba(20, 184, 166, 0.45)' : '1.5px solid rgba(59, 130, 246, 0.45)',
                            boxShadow: isTealAccent ? '0 0 12px rgba(20, 184, 166, 0.1)' : '0 0 12px rgba(59, 130, 246, 0.1)'
                          }}
                        >
                          {/* Left: Date Block & Role Info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                            {/* Date Badge */}
                            <div style={{
                              width: 38,
                              height: 42,
                              borderRadius: '9px',
                              background: isTealAccent 
                                ? 'linear-gradient(180deg, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.5) 100%)' 
                                : 'linear-gradient(180deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.5) 100%)',
                              border: isTealAccent ? '1.5px solid rgba(20, 184, 166, 0.6)' : '1.5px solid rgba(59, 130, 246, 0.6)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: '#fff',
                              boxShadow: isTealAccent ? '0 0 8px rgba(20, 184, 166, 0.25)' : '0 0 8px rgba(59, 130, 246, 0.25)'
                            }}>
                              <span style={{ fontSize: 8, opacity: 0.8 }}>📅</span>
                              <span style={{ fontSize: 12.5, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1, marginTop: 1 }}>{d.getDate()}</span>
                              <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.4px', color: isTealAccent ? '#5eead4' : '#93c5fd', textTransform: 'uppercase' }}>
                                {d.toLocaleString('default', { month: 'short' })}
                              </span>
                            </div>

                            {/* Interview Details */}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                                {iv.interview_type} <span style={{ color: '#94a3b8', fontWeight: 400 }}>&middot;</span> {jobTitle}
                              </div>
                              <div style={{ fontSize: 9.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                                <span>⏰ {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                <span>📹 Online</span>
                                <span>👤 {candidateName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Upcoming Status & Circular Arrow Button */}
                          <div className="iv-right-actions" style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                            <div style={{
                              background: 'rgba(20, 184, 166, 0.15)',
                              border: '1px solid rgba(20, 184, 166, 0.45)',
                              borderRadius: '14px',
                              padding: '2px 7px',
                              fontSize: '9.5px',
                              color: '#2dd4bf',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3.5,
                              boxShadow: '0 0 6px rgba(20, 184, 166, 0.15)'
                            }}>
                              <span style={{ width: 4.5, height: 4.5, borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 4px #2dd4bf' }} /> Upcoming
                            </div>

                            <button 
                              type="button"
                              style={{
                                width: 26,
                                height: 26,
                                minWidth: 26,
                                minHeight: 26,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 11,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                padding: 0,
                                boxShadow: '0 0 6px rgba(59, 130, 246, 0.2)'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInterview(iv);
                              }}
                            >
                              &rarr;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Interview Count Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 10.5, color: '#94a3b8', fontWeight: 500 }}>
                <span>📅</span> {allScheduledInterviews.length} upcoming interviews
              </div>
            </div>

            {/* 2. RECENT ACTIVITY CARD (WITH SEARCH ICON AND CLICKABLE DETAILS MODAL) */}
            <div className="analytics-card" style={{ marginBottom: 0, padding: '16px 18px', minHeight: '300px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(168, 85, 247, 0.4), inset 0 0 6px rgba(255, 255, 255, 0.3)',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <Icon name="zap" size={17} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Recent Activity
                    </h2>
                    <p style={{ fontSize: 10.5, color: '#94a3b8', margin: '1px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stay updated with submissions & progress.</p>
                  </div>
                </div>

                {/* Search toggle container */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {showActivitySearch && (
                    <div style={{ position: 'relative', width: '130px' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#94a3b8' }}>🔍</span>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={activitySearchQuery}
                        onChange={(e) => setActivitySearchQuery(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: 'rgba(15, 17, 34, 0.85)',
                          border: '1.5px solid rgba(139, 92, 246, 0.5)',
                          borderRadius: '10px',
                          padding: '4px 8px 4px 24px',
                          fontSize: '10.5px',
                          color: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      />
                    </div>
                  )}
                  <div 
                    className={`card-header-action ${showActivitySearch ? 'active-search' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActivitySearch(!showActivitySearch);
                      if (showActivitySearch) setActivitySearchQuery('');
                    }}
                    title="Toggle activity search"
                    style={{ width: 34, height: 34, borderRadius: '10px' }}
                  >
                    <Icon name="search" size={15} />
                  </div>
                </div>
              </div>

              {/* Compressed Connected Timeline Activity Items */}
              {notifications === null && <div className="skeleton sk-row" />}
              {filteredNotifications.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="es-icon"><Icon name="bell" size={18} /></div>
                  <div className="es-title" style={{ fontSize: 12.5 }}>No activity found</div>
                </div>
              ) : (
                <div className="scroll-panel-tight" style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: '235px', overflowY: 'auto', paddingRight: 3 }}>
                  {filteredNotifications.map((n, idx) => {
                    const gradient = TIMELINE_GRADIENTS[idx % TIMELINE_GRADIENTS.length];
                    const isLast = idx === filteredNotifications.length - 1;

                    return (
                      <div key={n.id} className="activity-timeline-row" style={{ display: 'flex', alignItems: 'center', gap: 9, position: 'relative' }}>
                        {/* Compact Timeline Node Icon & Connector Line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', alignSelf: 'stretch', justifyContent: 'center' }}>
                          <div style={{
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            minHeight: 28,
                            borderRadius: '50%',
                            background: gradient,
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            flexShrink: 0,
                            boxShadow: '0 0 8px rgba(168, 85, 247, 0.3)',
                            zIndex: 2
                          }}>
                            <Icon name={n.type === 'interview' ? 'interviews' : n.type === 'assessment' ? 'assessments' : 'applications'} size={12} />
                          </div>

                          {!isLast && (
                            <div style={{
                              position: 'absolute',
                              top: '28px',
                              bottom: '-7px',
                              width: '1.5px',
                              background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.45) 0%, rgba(59, 130, 246, 0.2) 100%)',
                              zIndex: 1
                            }} />
                          )}
                        </div>

                        {/* Activity Row Content Card (Clickable to open detailed modal) */}
                        <div 
                          className="activity-item-card"
                          onClick={() => setSelectedActivity(n)}
                        >
                          <div style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
                            <div style={{ fontSize: 11.5, color: '#f8fafc', fontWeight: 500, lineHeight: 1.3, wordBreak: 'break-word' }}>
                              {n.message}
                            </div>
                            <div style={{ marginTop: 2 }}>
                              <span style={{
                                background: 'rgba(147, 51, 234, 0.18)',
                                border: '1px solid rgba(147, 51, 234, 0.4)',
                                borderRadius: '8px',
                                padding: '1px 5px',
                                fontSize: '8.5px',
                                color: '#d8b4fe',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.25px'
                              }}>
                                {n.type ? n.type.replace('_', ' ') : 'ASSESSMENT'}
                              </span>
                            </div>
                          </div>

                          {/* Time Ago & Interactive Chevron */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 2.5 }}>
                              ⏰ {timeAgo(n.created_at)}
                            </span>
                            <div className="chevron-action-btn" title="View activity details">
                              &gt;
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Premium Interview Details Modal with Email ID */}
      <Modal open={selectedInterview !== null} onClose={() => setSelectedInterview(null)} maxWidth={520}>
        {selectedInterview && (() => {
          const dt = new Date(selectedInterview.scheduled_at);
          const jobTitle = resolveJobTitle(selectedInterview.job_id);
          const candidateName = selectedInterview.candidate_name || candidateMap[selectedInterview.candidate_id]?.name || `Candidate #${selectedInterview.candidate_id}`;
          const candidateEmail = getInterviewCandidateEmail(selectedInterview);
          return (
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(168, 85, 247, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.4)',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <Icon name="interviews" size={24} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.3px', textShadow: '0 2px 10px rgba(168,85,247,0.4)' }}>
                    Interview <span style={{ background: 'linear-gradient(90deg, #c084fc, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Details</span>
                  </h2>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0 0' }}>View complete interview information</p>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(22, 16, 42, 0.95) 0%, rgba(8, 10, 24, 0.98) 100%)',
                border: '1.5px solid rgba(168, 85, 247, 0.5)',
                borderRadius: '22px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.25), inset 0 0 30px rgba(168, 85, 247, 0.12)',
                boxSizing: 'border-box',
                width: '100%',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(139, 92, 246, 0.06) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0, boxShadow: '0 0 10px rgba(168,85,247,0.3)' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>T</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Type</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {String(selectedInterview.interview_type).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(168, 85, 247, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#d8b4fe', fontWeight: 600, flexShrink: 0, boxShadow: '0 0 12px rgba(168,85,247,0.25)' }}>
                    HR Interview
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(59, 130, 246, 0.06) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0, boxShadow: '0 0 10px rgba(59,130,246,0.3)' }}>
                      <Icon name="briefcase" size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Role</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobTitle}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.18)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#93c5fd', fontWeight: 600, flexShrink: 0, boxShadow: '0 0 12px rgba(59,130,246,0.25)' }}>
                    Technical Role
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(147, 51, 234, 0.06) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(147, 51, 234, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d8b4fe', flexShrink: 0, boxShadow: '0 0 10px rgba(147,51,234,0.3)' }}>
                      <Icon name="applications" size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Candidate</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidateName}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(20, 184, 166, 0.18)', border: '1px solid rgba(20, 184, 166, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#2dd4bf', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, boxShadow: '0 0 12px rgba(20,184,166,0.25)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 8px #2dd4bf' }} /> Candidate
                  </div>
                </div>

                {/* Candidate Email Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(20, 184, 166, 0.06) 100%)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', flexShrink: 0 }}>
                      ✉️
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Candidate Email</div>
                      <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidateEmail}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(20, 184, 166, 0.18)', border: '1px solid rgba(20, 184, 166, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#2dd4bf', fontWeight: 600, flexShrink: 0 }}>
                    Contact
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(20, 184, 166, 0.06) 100%)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', flexShrink: 0, boxShadow: '0 0 10px rgba(20,184,166,0.3)' }}>
                      <Icon name="interviews" size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Date</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dt.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(20, 184, 166, 0.18)', border: '1px solid rgba(20, 184, 166, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#2dd4bf', fontWeight: 600, flexShrink: 0, boxShadow: '0 0 12px rgba(20,184,166,0.25)' }}>
                    {dt.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(245, 158, 11, 0.06) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', flexShrink: 0, boxShadow: '0 0 10px rgba(245,158,11,0.3)' }}>
                      <span style={{ fontSize: 15 }}>⏰</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Time</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, boxShadow: '0 0 12px rgba(245,158,11,0.25)' }}>
                    <span>⏰</span> {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(16, 185, 129, 0.06) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0, boxShadow: '0 0 10px rgba(16,185,129,0.3)' }}>
                      <Icon name="analytics" size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Status</div>
                      <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 3, textTransform: 'uppercase', boxShadow: '0 0 10px rgba(16,185,129,0.25)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} /> {selectedInterview.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, opacity: 0.9 }}>
                    <div style={{ width: 2.5, height: 10, background: '#34d399', borderRadius: 2, boxShadow: '0 0 6px #34d399' }} />
                    <div style={{ width: 2.5, height: 18, background: '#34d399', borderRadius: 2, boxShadow: '0 0 6px #34d399' }} />
                    <div style={{ width: 2.5, height: 8, background: '#34d399', borderRadius: 2, boxShadow: '0 0 6px #34d399' }} />
                    <div style={{ width: 2.5, height: 22, background: '#34d399', borderRadius: 2, boxShadow: '0 0 6px #34d399' }} />
                    <div style={{ width: 2.5, height: 12, background: '#34d399', borderRadius: 2, boxShadow: '0 0 6px #34d399' }} />
                    <div style={{ width: 2.5, height: 16, background: '#34d399', borderRadius: 2, boxShadow: '0 0 6px #34d399' }} />
                    <div style={{ width: 2.5, height: 10, background: '#34d399', borderRadius: 2, boxShadow: '0 0 6px #34d399' }} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  marginTop: 20,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(249, 115, 22, 0.45) 100%)',
                  border: '1.5px solid rgba(168, 85, 247, 0.9)',
                  borderRadius: '14px',
                  padding: '13px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedInterview(null)}
              >
                <span style={{ fontSize: 16 }}>&times;</span> Close
              </button>
            </div>
          );
        })()}
      </Modal>

      {/* Premium Top Candidate Details Modal */}
      <Modal open={selectedCandidate !== null} onClose={() => setSelectedCandidate(null)} maxWidth={520}>
        {selectedCandidate && (() => {
          const candidateName = getTopCandidateName(selectedCandidate);
          const candidateEmail = getTopCandidateEmail(selectedCandidate);
          const jobTitle = resolveJobTitle(selectedCandidate.job_id);
          return (
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.4)',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <Icon name="applications" size={24} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.3px', textShadow: '0 2px 10px rgba(16,185,129,0.4)' }}>
                    Candidate <span style={{ background: 'linear-gradient(90deg, #34d399, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Profile</span>
                  </h2>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0 0' }}>AI Match Analysis & Application Details</p>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(22, 16, 42, 0.95) 0%, rgba(8, 10, 24, 0.98) 100%)',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '22px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(16, 185, 129, 0.2), inset 0 0 30px rgba(16, 185, 129, 0.08)',
                boxSizing: 'border-box',
                width: '100%',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(16, 185, 129, 0.06) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
                      👤
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Candidate Name</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidateName}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#34d399', fontWeight: 600, flexShrink: 0 }}>
                    Verified
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(20, 184, 166, 0.06) 100%)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', flexShrink: 0 }}>
                      ✉️
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Candidate Email</div>
                      <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{candidateEmail}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(20, 184, 166, 0.18)', border: '1px solid rgba(20, 184, 166, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#2dd4bf', fontWeight: 600, flexShrink: 0 }}>
                    Contact
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(59, 130, 246, 0.06) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.2)', border: '1px solid rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>
                      💼
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Applied Role</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{jobTitle}</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.18)', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#93c5fd', fontWeight: 600, flexShrink: 0 }}>
                    Active Job
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(168, 85, 247, 0.06) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                      ⚡
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>AI Match Score</div>
                      <div style={{ fontSize: 16, color: '#34d399', fontWeight: 800, marginTop: 1 }}>{selectedCandidate.match_score}% Match</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(168, 85, 247, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#d8b4fe', fontWeight: 600, flexShrink: 0 }}>
                    Tier: {scoreTier(selectedCandidate.match_score).replace('tier-', '').toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  marginTop: 20,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.45) 0%, rgba(59, 130, 246, 0.45) 100%)',
                  border: '1.5px solid rgba(16, 185, 129, 0.9)',
                  borderRadius: '14px',
                  padding: '13px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedCandidate(null)}
              >
                <span style={{ fontSize: 16 }}>&times;</span> Close
              </button>
            </div>
          );
        })()}
      </Modal>

      {/* Premium Activity Details Modal with 12-Hour AM/PM Formatted Timestamp */}
      <Modal open={selectedActivity !== null} onClose={() => setSelectedActivity(null)} maxWidth={520}>
        {selectedActivity && (() => {
          const dt = new Date(selectedActivity.created_at);
          const datePart = dt.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
          const timePart = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          const formattedTimestamp = `${datePart}, ${timePart}`;

          return (
            <div style={{ fontFamily: 'Inter, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(168, 85, 247, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.4)',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <Icon name={selectedActivity.type === 'interview' ? 'interviews' : selectedActivity.type === 'assessment' ? 'assessments' : 'applications'} size={24} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.3px', textShadow: '0 2px 10px rgba(168,85,247,0.4)' }}>
                    Activity <span style={{ background: 'linear-gradient(90deg, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Log</span>
                  </h2>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0 0' }}>Comprehensive submission and status details</p>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(22, 16, 42, 0.95) 0%, rgba(8, 10, 24, 0.98) 100%)',
                border: '1.5px solid rgba(168, 85, 247, 0.5)',
                borderRadius: '22px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(168, 85, 247, 0.25), inset 0 0 30px rgba(168, 85, 247, 0.12)',
                boxSizing: 'border-box',
                width: '100%',
                overflow: 'hidden'
              }}>
                {/* Event Category */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(168, 85, 247, 0.06) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                      ⚡
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Event Type</div>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 1, textTransform: 'uppercase' }}>
                        {selectedActivity.type ? selectedActivity.type.replace('_', ' ') : 'NOTIFICATION'}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(168, 85, 247, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#d8b4fe', fontWeight: 600, flexShrink: 0 }}>
                    Automated Log
                  </div>
                </div>

                {/* Message Log */}
                <div style={{ background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(59, 130, 246, 0.06) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 6 }}>Activity Summary</div>
                  <div style={{ fontSize: 13, color: '#f8fafc', lineHeight: 1.5, fontWeight: 500, wordBreak: 'break-word' }}>
                    {selectedActivity.message}
                  </div>
                </div>

                {/* Date & Time Log (12-hour format with AM/PM) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(20, 184, 166, 0.06) 100%)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', flexShrink: 0 }}>
                      🕒
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Timestamp</div>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginTop: 1 }}>
                        {formattedTimestamp}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(20, 184, 166, 0.18)', border: '1px solid rgba(20, 184, 166, 0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11.5px', color: '#2dd4bf', fontWeight: 600, flexShrink: 0 }}>
                    {timeAgo(selectedActivity.created_at)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  marginTop: 20,
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(236, 72, 153, 0.45) 100%)',
                  border: '1.5px solid rgba(168, 85, 247, 0.9)',
                  borderRadius: '14px',
                  padding: '13px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedActivity(null)}
              >
                <span style={{ fontSize: 16 }}>&times;</span> Close
              </button>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
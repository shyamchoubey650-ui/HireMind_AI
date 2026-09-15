// import { useState, useEffect, useMemo } from 'react';
// import { apiRequest } from '../../api';
// import SkillTags from '../../components/SkillTags';
// import Icon from '../../components/Icon';
// import Modal from '../../components/Modal';
// import { getJobVisual } from '../../lib/jobVisual';

// export default function AllJobs() {
//   const [jobs, setJobs] = useState(null);
//   const [search, setSearch] = useState('');
//   const [pipelineSearch, setPipelineSearch] = useState('');
//   const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
//   const [applicantsList, setApplicantsList] = useState([]);
//   const [loadingApplicants, setLoadingApplicants] = useState(false);

//   useEffect(() => {
//     apiRequest('/admin/jobs').then((data) => {
//       setJobs(data);
//     }).catch(() => setJobs([]));
//   }, []);

//   async function handleOpenApplicants(job) {
//     setSelectedJobForApplicants(job);
//     setPipelineSearch(''); // Reset modal search on open
//     setLoadingApplicants(true);
//     try {
//       const apps = await apiRequest(`/jobs/${job.id}/applicants`);
//       setApplicantsList(apps || []);
//     } catch (_) {
//       setApplicantsList([]);
//     } finally {
//       setLoadingApplicants(false);
//     }
//   }

//   const filtered = useMemo(() => {
//     if (!jobs) return [];
//     const s = search.toLowerCase().trim();
//     if (!s) return jobs;
//     return jobs.filter((j) =>
//       j.title.toLowerCase().includes(s) ||
//       (j.recruiter_name && j.recruiter_name.toLowerCase().includes(s)) ||
//       (j.required_skills || []).some((sk) => sk.toLowerCase().includes(s))
//     );
//   }, [jobs, search]);

//   const filteredPipelineApplicants = useMemo(() => {
//     if (!applicantsList) return [];
//     const s = pipelineSearch.toLowerCase().trim();
//     if (!s) return applicantsList;
//     return applicantsList.filter((app) =>
//       (app.candidate_name || '').toLowerCase().includes(s) ||
//       (app.candidate_email || '').toLowerCase().includes(s) ||
//       (app.status || '').toLowerCase().includes(s) ||
//       (app.matched_skills || []).some((sk) => sk.toLowerCase().includes(s))
//     );
//   }, [applicantsList, pipelineSearch]);

//   return (
//     <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
//       <style>{`
//         .alljobs-main-container {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.95) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.45);
//           box-shadow: inset 0 0 30px rgba(139, 92, 246, 0.06), 0 10px 40px rgba(0, 0, 0, 0.5);
//           border-radius: 22px;
//           padding: 28px;
//           margin-bottom: 24px;
//           box-sizing: border-box;
//           width: 100%;
//         }
//         .alljobs-search-bar {
//           position: relative;
//           width: 100%;
//           margin-bottom: 22px;
//         }
//         .alljobs-search-bar input {
//           width: 100%;
//           background: rgba(12, 10, 24, 0.8);
//           border: 1px solid rgba(139, 92, 246, 0.35);
//           border-radius: 12px;
//           padding: 12px 16px 12px 42px;
//           color: #fff;
//           font-size: 14px;
//           box-sizing: border-box;
//           outline: none;
//           transition: border-color 0.2s;
//         }
//         .alljobs-search-bar input:focus {
//           border-color: rgba(168, 85, 247, 0.8);
//         }
//         .alljobs-search-bar .search-icon-fixed {
//           position: absolute;
//           left: 14px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #94a3b8;
//           pointer-events: none;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
//         .alljobs-row-card {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.7) 0%, rgba(8, 10, 22, 0.9) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
//           border-radius: 16px;
//           padding: 20px 24px;
//           margin-bottom: 16px;
//           transition: all 0.2s ease;
//           box-sizing: border-box;
//         }
//         .alljobs-row-card.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .alljobs-row-card.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .alljobs-row-card.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .alljobs-row-card.c-orange { border-color: rgba(249, 115, 22, 0.45); background: linear-gradient(135deg, rgba(45, 22, 10, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }

//         .alljobs-content-layout {
//           display: flex;
//           align-items: flex-start;
//           justify-content: space-between;
//           width: 100%;
//           gap: 20px;
//         }
//         .alljobs-stats-group {
//           display: flex;
//           gap: 12px;
//           flex-shrink: 0;
//         }
//         .alljobs-stat-box {
//           background: rgba(255, 255, 255, 0.03);
//           border: 1px solid rgba(127, 76, 245, 0.25);
//           border-radius: 12px;
//           padding: 10px 16px;
//           text-align: center;
//           min-width: 90px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }
//         .alljobs-stat-box:hover {
//           background: rgba(139, 92, 246, 0.15);
//           border-color: rgba(168, 85, 247, 0.6);
//           transform: translateY(-2px);
//         }
//         .open-pill, .closed-pill {
//           padding: 2px 8px;
//           border-radius: 6px;
//           font-size: 10.5px;
//           font-weight: 600;
//           text-transform: uppercase;
//         }
//         .open-pill { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);}
//         .closed-pill { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

//         .applicant-modal-card {
//           background: linear-gradient(135deg, rgba(25, 18, 48, 0.85) 0%, rgba(10, 12, 26, 0.95) 100%);
//           border: 1.5px solid rgba(129, 78, 238, 0.35);
//           box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.06), 0 6px 20px rgba(0, 0, 0, 0.4);
//           border-radius: 14px;
//           padding: 14px 16px;
//           transition: all 0.2s ease;
//         }
//         .applicant-modal-card:hover {
//           border-color: rgba(168, 85, 247, 0.65);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.12), 0 8px 25px rgba(0, 0, 0, 0.5);
//           transform: translateY(-1px);
//         }

//         @media (max-width: 768px) {
//           .alljobs-main-container { padding: 18px !important; }
//           .alljobs-content-layout {
//             flex-direction: column;
//             align-items: flex-start !important;
//           }
//           .alljobs-stats-group {
//             width: 100%;
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 10px;
//             margin-top: 12px;
//           }
//           .alljobs-stat-box {
//             width: 100%;
//           }
//         }
//       `}</style>

//       <div className="page-header" style={{ marginBottom: 20 }}>
//         <div className="page-eyebrow">Moderation</div>
//         <h1 className="page-title">All job <span className="hl">postings</span></h1>
//         <p className="page-sub">Every job posted by every recruiter on the platform. Click applicant stats to inspect candidates.</p>
//       </div>

//       <div className="alljobs-main-container">
//         <div className="alljobs-search-bar">
//           <span className="search-icon-fixed">
//             <Icon name="search" size={16} />
//           </span>
//           <input
//             type="text" placeholder="Search by title, skill, or recruiter..."
//             value={search} onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         {jobs === null && (<><div className="skeleton sk-row" /><div className="skeleton sk-row" /></>)}

//         {jobs && filtered.length === 0 && (
//           <div className="card empty-state" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
//             <div className="es-icon"><Icon name="building" size={22} /></div>
//             <div className="es-title">{jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your search'}</div>
//           </div>
//         )}

//         {filtered.map((j) => {
//           const { icon, color } = getJobVisual(j.title);
//           const applicantsCount = j.applications_count ?? j.applicant_count ?? j.applications?.length ?? 0;
//           const avgMatch = j.avg_match_score ?? j.average_match ?? 0;

//           return (
//             <div className={`alljobs-row-card c-${color}`} key={j.id}>
//               <div className="alljobs-content-layout">
//                 <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1, minWidth: 0, width: '100%' }}>
//                   <div className={`icon-badge lg ${color}`} style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', flexShrink: 0 }}>
//                     <Icon name={icon} size={24} />
//                   </div>
//                   <div style={{ minWidth: 0 }}>
//                     <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#f8fafc' }}>{j.title}</div>
//                     <div className="muted mono" style={{ fontSize: 11.5, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: '#94a3b8' }}>
//                       <span>{j.location}</span>
//                       <span>&bull;</span>
//                       <span className={j.status === 'open' ? 'open-pill' : 'closed-pill'}>{j.status}</span>
//                       <span>&bull;</span>
//                       <span>min {j.min_experience} yrs</span>
//                     </div>
//                     <div className="muted" style={{ fontSize: 12.5, marginTop: 8, color: '#cbd5e1' }}>
//                       Posted by <strong style={{ color: '#fff' }}>{j.recruiter_name}</strong> <span className="mono" style={{ opacity: 0.7, fontSize: '11px' }}>({j.recruiter_email})</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="alljobs-stats-group">
//                   <div className="alljobs-stat-box" onClick={() => handleOpenApplicants(j)} title="Click to view applicants">
//                     <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>{applicantsCount}</div>
//                     <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>applicants</div>
//                   </div>
//                   <div className="alljobs-stat-box" onClick={() => handleOpenApplicants(j)} title="Click to view match breakdowns">
//                     <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>{avgMatch}%</div>
//                     <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>avg match</div>
//                   </div>
//                 </div>
//               </div>

//               <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
//                 <SkillTags skills={j.required_skills} />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Compressed Premium Applicants Pipeline Modal with Bottom Search Bar */}
//       <Modal open={!!selectedJobForApplicants} onClose={() => setSelectedJobForApplicants(null)} maxWidth={580}>
//         {selectedJobForApplicants && (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
//                 <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(59,130,246,0.25))', border: '1px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
//                   <Icon name="users" size={18} />
//                 </div>
//                 <div style={{ minWidth: 0 }}>
//                   <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff', margin: 0 }}>
//                     Applicants Pipeline
//                   </h2>
//                   <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
//                     <span style={{ color: '#fff' }}>{selectedJobForApplicants.title}</span> &bull; <span style={{ color: '#a78bfa' }}>{filteredPipelineApplicants.length} candidate(s)</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {loadingApplicants ? (
//               <div style={{ padding: '35px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Loading candidate pipeline...</div>
//             ) : filteredPipelineApplicants.length === 0 ? (
//               <div style={{ padding: '35px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>No matching applicants found.</div>
//             ) : (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '340px', overflowY: 'auto', paddingRight: 4 }}>
//                 {filteredPipelineApplicants.map((app) => {
//                   const initials = (app.candidate_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
//                   const stageUpper = (app.status || 'screening').toUpperCase();
//                   return (
//                     <div key={app.id} className="applicant-modal-card">
//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
//                         <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
//                           <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 3px 12px rgba(168,85,247,0.3)' }}>
//                             {initials}
//                             <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '2px solid #0d0f1d' }} />
//                           </div>
//                           <div style={{ minWidth: 0 }}>
//                             <div style={{ fontWeight: 700, color: '#fff', fontSize: '14.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-display)' }}>
//                               {app.candidate_name}
//                             </div>
//                             <div className="mono" style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
//                               <span>✉️</span> {app.candidate_email}
//                             </div>
//                           </div>
//                         </div>

//                         <div style={{ textAlign: 'right', flexShrink: 0, background: 'linear-gradient(135deg, rgba(30, 20, 56, 0.9), rgba(15, 15, 35, 0.95))', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '6px 12px', borderRadius: '12px' }}>
//                           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#c084fc' }}>{app.match_score}%</div>
//                           <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>AI Match</div>
//                         </div>
//                       </div>

//                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 8 }}>
//                         <div className="mono" style={{ fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
//                           <span>Stage:</span> 
//                           <span style={{ color: '#2dd4bf', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(45, 212, 191, 0.12)', border: '1px solid rgba(45, 212, 191, 0.3)', padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.04em' }}>
//                             {stageUpper}
//                           </span>
//                         </div>
//                         <div className="mono" style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
//                           <span>📅</span> Applied: {new Date(app.created_at || app.applied_at || Date.now()).toLocaleDateString()}
//                         </div>
//                       </div>

//                       {app.matched_skills && app.matched_skills.length > 0 && (
//                         <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
//                           <SkillTags skills={app.matched_skills} cls="matched" />
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Modal Search Bar placed at the bottom */}
//             <div style={{ position: 'relative', width: '100%', marginTop: 4 }}>
//               <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center' }}>🔍</span>
//               <input 
//                 type="text" 
//                 style={{ width: '100%', background: 'rgba(15, 15, 32, 0.95)', border: '1.5px solid rgba(139, 92, 246, 0.45)', borderRadius: '10px', padding: '10px 12px 10px 36px', fontSize: '13px', color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
//                 placeholder="Search candidate name, email, or stage..." 
//                 value={pipelineSearch} 
//                 onChange={(e) => setPipelineSearch(e.target.value)} 
//               />
//             </div>

//             <button 
//               style={{ width: '100%', marginTop: 4, padding: '12px', borderRadius: '12px', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '13.5px', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))', border: '1px solid rgba(139,92,246,0.5)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 15px rgba(139,92,246,0.2)' }} 
//               onClick={() => setSelectedJobForApplicants(null)}
//             >
//               <Icon name="arrowRight" size={15} /> Close Pipeline
//             </button>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }












import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import { getJobVisual } from '../../lib/jobVisual';

const STAGES = [
  { id: 'ALL', label: 'All Candidates', icon: '✦' },
  { id: 'AI_SCREENING', label: 'AI Screening', icon: '⚡' },
  { id: 'ASSESSMENT', label: 'Assessment', icon: '◈' },
  { id: 'INTERVIEW', label: 'Interview', icon: '❖' },
  { id: 'OFFERED', label: 'Offered', icon: '★' },
  { id: 'REJECTED', label: 'Rejected', icon: '✕' }
];

export default function AllJobs() {
  const [jobs, setJobs] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pipeline Modal States
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('match');
  const [updatingAppId, setUpdatingAppId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const data = await apiRequest('/admin/jobs');
      setJobs(data);
    } catch {
      setJobs([]);
    }
  }

  async function handleOpenApplicants(job) {
    setSelectedJobForApplicants(job);
    setPipelineSearch('');
    setActiveStageFilter('ALL');
    setLoadingApplicants(true);
    try {
      const apps = await apiRequest(`/jobs/${job.id}/applicants`);
      setApplicantsList(apps || []);
    } catch (_) {
      setApplicantsList([]);
    } finally {
      setLoadingApplicants(false);
    }
  }

  async function handleToggleJobStatus(jobId, currentStatus) {
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await apiRequest(`/jobs/${jobId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
      );
    } catch (err) {
      alert('Job status can be changed by only recruiter.');
    }
  }

  async function handleUpdateApplicantStage(appId, newStage) {
    setUpdatingAppId(appId);
    try {
      await apiRequest(`/applicants/${appId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStage })
      });
      setApplicantsList((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStage } : app))
      );
    } catch (err) {
      alert('Applicant stage can be changed by only recruiter.');
    } finally {
      setUpdatingAppId(null);
    }
  }

  function handleExportCSV() {
    if (!filteredPipelineApplicants.length || !selectedJobForApplicants) return;
    const headers = ['Candidate Name,Email,Match Score,Stage,Applied Date'];
    const rows = filteredPipelineApplicants.map(
      (a) =>
        `"${a.candidate_name}","${a.candidate_email}","${a.match_score}%","${a.status || 'AI_SCREENING'}","${new Date(a.created_at || a.applied_at || Date.now()).toLocaleDateString()}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedJobForApplicants.title.replace(/\s+/g, '_')}_applicants.csv`;
    link.click();
  }

  const filtered = useMemo(() => {
    if (!jobs) return [];
    const s = search.toLowerCase().trim();
    return jobs.filter((j) => {
      const matchSearch =
        !s ||
        j.title.toLowerCase().includes(s) ||
        (j.recruiter_name && j.recruiter_name.toLowerCase().includes(s)) ||
        (j.required_skills || []).some((sk) => sk.toLowerCase().includes(s));

      const matchStatus =
        statusFilter === 'all' || j.status?.toLowerCase() === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [jobs, search, statusFilter]);

  // Stage candidate counts for badges
  const stageCounts = useMemo(() => {
    const counts = { ALL: applicantsList.length };
    applicantsList.forEach((app) => {
      const st = (app.status || 'AI_SCREENING').toUpperCase();
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [applicantsList]);

  const filteredPipelineApplicants = useMemo(() => {
    if (!applicantsList) return [];
    const s = pipelineSearch.toLowerCase().trim();

    return applicantsList
      .filter((app) => {
        const appStage = (app.status || 'AI_SCREENING').toUpperCase();
        const stageMatch = activeStageFilter === 'ALL' || appStage === activeStageFilter;

        const textMatch =
          !s ||
          (app.candidate_name || '').toLowerCase().includes(s) ||
          (app.candidate_email || '').toLowerCase().includes(s) ||
          (app.status || '').toLowerCase().includes(s) ||
          (app.matched_skills || []).some((sk) => sk.toLowerCase().includes(s));

        return stageMatch && textMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return (b.match_score || 0) - (a.match_score || 0);
        }
        return (
          new Date(b.created_at || b.applied_at || 0) -
          new Date(a.created_at || a.applied_at || 0)
        );
      });
  }, [applicantsList, pipelineSearch, activeStageFilter, sortBy]);

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        /* Custom Dark Scrollbars */
        .modal-filter-tabs,
        .modal-candidates-scroll,
        .status-filter-scroll {
          scrollbar-width: thin;
          scrollbar-color: #2e3656 transparent;
        }

        .modal-filter-tabs::-webkit-scrollbar,
        .modal-candidates-scroll::-webkit-scrollbar,
        .status-filter-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
          background: transparent;
        }

        .modal-filter-tabs::-webkit-scrollbar-track,
        .modal-candidates-scroll::-webkit-scrollbar-track,
        .status-filter-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-filter-tabs::-webkit-scrollbar-thumb,
        .modal-candidates-scroll::-webkit-scrollbar-thumb,
        .status-filter-scroll::-webkit-scrollbar-thumb {
          background: #2e3656;
          border-radius: 9999px;
        }

        .modal-filter-tabs::-webkit-scrollbar-thumb:hover,
        .modal-candidates-scroll::-webkit-scrollbar-thumb:hover,
        .status-filter-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }

        .modal-filter-tabs::-webkit-scrollbar-button,
        .modal-candidates-scroll::-webkit-scrollbar-button,
        .status-filter-scroll::-webkit-scrollbar-button {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Glassmorphism Premium Pill Buttons */
        .premium-tab-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 9999px;
          font-family: var(--font-display, inherit);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          color: #94a3b8;
          background: linear-gradient(135deg, rgba(25, 20, 48, 0.7) 0%, rgba(14, 15, 30, 0.8) 100%);
          border: 1px solid rgba(139, 92, 246, 0.22);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        .premium-tab-btn:hover {
          color: #e2e8f0;
          border-color: rgba(168, 85, 247, 0.5);
          background: linear-gradient(135deg, rgba(42, 28, 80, 0.8) 0%, rgba(20, 22, 45, 0.9) 100%);
          box-shadow: 0 4px 14px rgba(168, 85, 247, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .premium-tab-btn.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(99, 102, 241, 0.3) 100%);
          border-color: rgba(192, 132, 252, 0.85);
          box-shadow: 
            0 0 0 1px rgba(192, 132, 252, 0.4),
            0 4px 20px rgba(168, 85, 247, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.25);
          text-shadow: 0 0 12px rgba(192, 132, 252, 0.6);
        }

        .tab-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 9999px;
          font-size: 9.5px;
          font-weight: 700;
          font-family: var(--font-mono, monospace);
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.2s ease;
        }

        .premium-tab-btn.active .tab-badge {
          background: rgba(192, 132, 252, 0.3);
          color: #f3e8ff;
          border-color: rgba(216, 180, 254, 0.5);
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.35);
        }

        .alljobs-main-container {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.45);
          box-shadow: inset 0 0 30px rgba(139, 92, 246, 0.06), 0 10px 40px rgba(0, 0, 0, 0.5);
          border-radius: 22px;
          padding: 28px;
          margin-bottom: 24px;
          box-sizing: border-box;
          width: 100%;
        }
        .alljobs-search-bar {
          position: relative;
          width: 100%;
          margin-bottom: 14px;
        }
        .alljobs-search-bar input {
          width: 100%;
          background: rgba(12, 10, 24, 0.8);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 12px 16px 12px 42px;
          color: #fff;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .alljobs-search-bar input:focus {
          border-color: rgba(168, 85, 247, 0.8);
        }
        .alljobs-search-bar .search-icon-fixed {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .alljobs-row-card {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.7) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .alljobs-row-card.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .alljobs-row-card.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .alljobs-row-card.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .alljobs-row-card.c-orange { border-color: rgba(249, 115, 22, 0.45); background: linear-gradient(135deg, rgba(45, 22, 10, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }

        .alljobs-content-layout {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          width: 100%;
          gap: 20px;
        }
        .alljobs-stats-group {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }
        .alljobs-stat-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(127, 76, 245, 0.25);
          border-radius: 12px;
          padding: 10px 16px;
          text-align: center;
          min-width: 90px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .alljobs-stat-box:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(168, 85, 247, 0.6);
          transform: translateY(-2px);
        }
        .open-pill, .closed-pill {
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 600;
          text-transform: uppercase;
          cursor: pointer;
        }
        .open-pill { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .closed-pill { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

        .applicant-modal-card {
          background: linear-gradient(135deg, rgba(25, 18, 48, 0.85) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(129, 78, 238, 0.35);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.06), 0 6px 20px rgba(0, 0, 0, 0.4);
          border-radius: 14px;
          padding: 14px 16px;
          transition: all 0.2s ease;
        }

        .modal-header-container {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-right: 36px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 12px;
        }

        .modal-filter-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          white-space: nowrap;
          padding: 4px 2px 8px 2px;
          -webkit-overflow-scrolling: touch;
        }

        .sort-filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .stage-select {
          background: rgba(15, 15, 30, 0.9);
          color: #2dd4bf;
          border: 1px solid rgba(45, 212, 191, 0.4);
          border-radius: 6px;
          padding: 3px 6px;
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }
        .stage-select option {
          background: #0f101f;
          color: #fff;
        }

        @media (max-width: 768px) {
          .alljobs-main-container { padding: 18px !important; }
          .alljobs-content-layout {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .alljobs-stats-group {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
          }
          .alljobs-stat-box {
            width: 100%;
          }
          .modal-header-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .modal-header-container button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-eyebrow">Moderation</div>
        <h1 className="page-title">All job <span className="hl">postings</span></h1>
        <p className="page-sub">Every job posted on the platform. Filter by status or inspect candidate pipelines.</p>
      </div>

      <div className="alljobs-main-container">
        <div className="alljobs-search-bar">
          <span className="search-icon-fixed">
            <Icon name="search" size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by title, skill, or recruiter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Global Job Status Filter */}
        <div className="status-filter-scroll" style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 6 }}>
          {['all', 'open', 'closed'].map((st) => (
            <button
              key={st}
              className={`premium-tab-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              <span>{st}</span>
              <span className="tab-badge">{st === 'all' ? jobs?.length || 0 : (jobs?.filter(j => j.status?.toLowerCase() === st).length || 0)}</span>
            </button>
          ))}
        </div>

        {jobs === null && (<><div className="skeleton sk-row" /><div className="skeleton sk-row" /></>)}

        {jobs && filtered.length === 0 && (
          <div className="card empty-state" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <div className="es-icon"><Icon name="building" size={22} /></div>
            <div className="es-title">{jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your search'}</div>
          </div>
        )}

        {filtered.map((j) => {
          const { icon, color } = getJobVisual(j.title);
          const applicantsCount = j.applications_count ?? j.applicant_count ?? j.applications?.length ?? 0;
          const avgMatch = j.avg_match_score ?? j.average_match ?? 0;

          return (
            <div className={`alljobs-row-card c-${color}`} key={j.id}>
              <div className="alljobs-content-layout">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1, minWidth: 0, width: '100%' }}>
                  <div className={`icon-badge lg ${color}`} style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', flexShrink: 0 }}>
                    <Icon name={icon} size={24} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#f8fafc' }}>{j.title}</div>
                    <div className="muted mono" style={{ fontSize: 11.5, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: '#94a3b8' }}>
                      <span>{j.location}</span>
                      <span>&bull;</span>
                      <span
                        className={j.status === 'open' ? 'open-pill' : 'closed-pill'}
                        onClick={() => handleToggleJobStatus(j.id, j.status)}
                        title="Click to toggle status"
                      >
                        {j.status} ⇄
                      </span>
                      <span>&bull;</span>
                      <span>min {j.min_experience} yrs</span>
                    </div>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 8, color: '#cbd5e1' }}>
                      Posted by <strong style={{ color: '#fff' }}>{j.recruiter_name}</strong> <span className="mono" style={{ opacity: 0.7, fontSize: '11px' }}>({j.recruiter_email})</span>
                    </div>
                  </div>
                </div>

                <div className="alljobs-stats-group">
                  <div className="alljobs-stat-box" onClick={() => handleOpenApplicants(j)} title="Click to view applicants">
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>{applicantsCount}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>applicants</div>
                  </div>
                  <div className="alljobs-stat-box" onClick={() => handleOpenApplicants(j)} title="Click to view match breakdowns">
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>{avgMatch}%</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>avg match</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <SkillTags skills={j.required_skills} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidates Modal */}
      <Modal open={!!selectedJobForApplicants} onClose={() => setSelectedJobForApplicants(null)} maxWidth={620}>
        {selectedJobForApplicants && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Modal Header */}
            <div className="modal-header-container">
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff', margin: 0 }}>
                  Applicants Pipeline
                </h2>
                <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  <span style={{ color: '#fff' }}>{selectedJobForApplicants.title}</span> &bull; <span style={{ color: '#a78bfa' }}>{filteredPipelineApplicants.length} showing</span>
                </div>
              </div>
              <button
                onClick={handleExportCSV}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0
                }}
              >
                📥 Export CSV
              </button>
            </div>

            {/* Glowing Premium Segmented Tabs */}
            <div className="modal-filter-tabs">
              {STAGES.map((st) => {
                const count = stageCounts[st.id] || 0;
                return (
                  <button
                    key={st.id}
                    className={`premium-tab-btn ${activeStageFilter === st.id ? 'active' : ''}`}
                    onClick={() => setActiveStageFilter(st.id)}
                  >
                    <span style={{ fontSize: '11px', opacity: 0.85 }}>{st.icon}</span>
                    <span>{st.label}</span>
                    <span className="tab-badge">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Sort Row */}
            <div className="sort-filter-row">
              <span style={{ fontSize: '11.5px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: '#0d0e1d',
                  border: '1px solid rgba(139,92,246,0.3)',
                  color: '#c084fc',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  padding: '4px 8px',
                  outline: 'none'
                }}
              >
                <option value="match">Match Score (High to Low)</option>
                <option value="date">Date Applied (Newest)</option>
              </select>
            </div>

            {/* Pipeline List */}
            {loadingApplicants ? (
              <div style={{ padding: '35px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Loading candidate pipeline...</div>
            ) : filteredPipelineApplicants.length === 0 ? (
              <div style={{ padding: '35px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>No matching applicants found.</div>
            ) : (
              <div className="modal-candidates-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '320px', overflowY: 'auto', paddingRight: 4 }}>
                {filteredPipelineApplicants.map((app) => {
                  const initials = (app.candidate_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const match = app.match_score || 0;
                  const matchColor = match >= 75 ? '#4ade80' : match >= 45 ? '#c084fc' : '#94a3b8';

                  return (
                    <div key={app.id} className="applicant-modal-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                        <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initials}
                            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '2px solid #0d0f1d' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {app.candidate_name}
                            </div>
                            <div className="mono" style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span>✉️</span> {app.candidate_email}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0, background: 'rgba(255,255,255,0.03)', border: `1px solid ${matchColor}40`, padding: '4px 10px', borderRadius: '10px' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: matchColor }}>{match}%</div>
                          <div style={{ fontSize: '8.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Match</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 8 }}>
                        <div className="mono" style={{ fontSize: 11, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>Stage:</span>
                          <select
                            className="stage-select"
                            value={(app.status || 'AI_SCREENING').toUpperCase()}
                            disabled={updatingAppId === app.id}
                            onChange={(e) => handleUpdateApplicantStage(app.id, e.target.value)}
                          >
                            <option value="AI_SCREENING">AI SCREENING</option>
                            <option value="ASSESSMENT">ASSESSMENT</option>
                            <option value="INTERVIEW">INTERVIEW</option>
                            <option value="OFFERED">OFFERED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </div>
                        <div className="mono" style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                          📅 {new Date(app.created_at || app.applied_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>

                      {app.matched_skills && app.matched_skills.length > 0 && (
                        <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <SkillTags skills={app.matched_skills} cls="matched" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Pipeline Search */}
            <div style={{ position: 'relative', width: '100%', marginTop: 2 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>🔍</span>
              <input
                type="text"
                style={{ width: '100%', background: 'rgba(15, 15, 32, 0.95)', border: '1.5px solid rgba(139, 92, 246, 0.45)', borderRadius: '10px', padding: '10px 12px 10px 36px', fontSize: '12.5px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Search candidate name, email, or stage..."
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
              />
            </div>

            <button
              style={{ width: '100%', padding: '11px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3))', border: '1px solid rgba(139,92,246,0.5)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={() => setSelectedJobForApplicants(null)}
            >
              <Icon name="arrowRight" size={14} /> Close Pipeline
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// import { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { apiRequest } from '../../api';
// import { useToast } from '../../context/ToastContext';
// import SkillTags from '../../components/SkillTags';
// import Icon from '../../components/Icon';
// import { getJobVisual } from '../../lib/jobVisual';

// export default function Jobs() {
//   const [jobs, setJobs] = useState(null);
//   const [applyingId, setApplyingId] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const toast = useToast();
//   const navigate = useNavigate();

//   async function loadJobs() {
//     try {
//       const data = await apiRequest('/jobs');
//       setJobs(data);
//     } catch (e) {
//       toast(e.message, 'error');
//       setJobs([]);
//     }
//   }

//   useEffect(() => { loadJobs(); }, []);

//   async function applyToJob(jobId) {
//     setApplyingId(jobId);
//     try {
//       await apiRequest('/applications', { method: 'POST', body: { job_id: jobId } });
//       toast('Applied — AI match score computed', 'success');
//       navigate('/candidate/applications');
//     } catch (e) {
//       toast('Could not apply: ' + e.message, 'error');
//       setApplyingId(null);
//     }
//   }

//   const filteredJobs = useMemo(() => {
//     if (!jobs) return [];
//     if (!searchQuery.trim()) return jobs;
//     const q = searchQuery.toLowerCase().trim();
//     return jobs.filter((j) => {
//       const title = (j.title || '').toLowerCase();
//       const location = (j.location || '').toLowerCase();
//       const description = (j.description || '').toLowerCase();
//       const skills = (j.required_skills || []).some(s => s.toLowerCase().includes(q));
//       return title.includes(q) || location.includes(q) || description.includes(q) || skills;
//     });
//   }, [jobs, searchQuery]);

//   return (
//     <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
//       <style>{`
//         .job-listing-row {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
//           border-radius: 16px;
//           padding: 18px 24px;
//           margin-bottom: 14px;
//           transition: all 0.2s ease;
//           box-sizing: border-box;
//         }
//         .job-listing-row.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .job-listing-row.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .job-listing-row.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .job-listing-row.c-orange { border-color: rgba(249, 115, 22, 0.45); background: linear-gradient(135deg, rgba(45, 22, 10, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        
//         .job-apply-gradient-btn {
//           background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
//           border: none;
//           color: #ffffff;
//           padding: 8px 18px;
//           border-radius: 10px;
//           font-family: var(--font-display, sans-serif);
//           font-weight: 600;
//           font-size: 13.5px;
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
//           white-space: nowrap;
//         }
//         .job-apply-gradient-btn:hover:not(:disabled) {
//           opacity: 0.92;
//           transform: translateY(-1px);
//           box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
//         }
//         .job-apply-gradient-btn:disabled { opacity: 0.6; cursor: not-allowed; }

//         .job-row-inner {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           width: 100%;
//           gap: 16px;
//         }

//         /* Aesthetic Search Bar Styles */
//         .aesthetic-search-wrapper {
//           background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
//           border-radius: 18px;
//           padding: 16px 20px;
//           margin-bottom: 22px;
//           box-sizing: border-box;
//           width: 100%;
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           position: relative;
//           backdrop-filter: blur(12px);
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
//           transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
//           box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
//           display: flex;
//           align-items: center;
//           height: 46px;
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

//         /* Mobile Viewports */
//         @media (max-width: 768px) {
//           .job-row-inner {
//             flex-direction: column;
//             align-items: flex-start !important;
//           }
//           .job-action-container {
//             width: 100%;
//             display: flex;
//             justify-content: flex-end;
//             margin-top: 10px;
//           }
//           .job-apply-gradient-btn {
//             width: 100%;
//             justify-content: center;
//           }
//         }
//       `}</style>

//       <div className="page-header">
//         <div className="page-eyebrow">Step 2 of 3</div>
//         <h1 className="page-title">Open <span className="hl">roles</span></h1>
//         <p className="page-sub">Apply and the AI instantly computes an explainable match score against your parsed profile.</p>
//       </div>

//       {/* Aesthetic Search Bar */}
//       <div className="aesthetic-search-wrapper">
//         <div className="aesthetic-search-input-box">
//           <span className="aesthetic-search-icon-badge">
//             <Icon name="search" size={14} />
//           </span>
//           <input
//             type="text"
//             placeholder="Search open roles by title, location, or required skills..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           {searchQuery && (
//             <button
//               onClick={() => setSearchQuery('')}
//               style={{
//                 position: 'absolute',
//                 right: '12px',
//                 top: '0',
//                 bottom: '0',
//                 margin: 'auto',
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
//                 transition: 'all 0.2s ease'
//               }}
//               title="Clear search"
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
//           <div className="skeleton sk-row" />
//         </>
//       )}

//       {jobs && filteredJobs.length === 0 && (
//         <div className="card empty-state">
//           <div className="es-icon"><Icon name="briefcase" size={22} /></div>
//           <div className="es-title">{jobs.length === 0 ? 'No open roles yet' : 'No roles match your search'}</div>
//           <div className="es-sub">Check back soon — recruiters are posting new positions.</div>
//         </div>
//       )}

//       {filteredJobs.map((j, i) => {
//         const { icon, color } = getJobVisual(j.title);
//         return (
//           <div className={`job-listing-row c-${color}`} style={{ animationDelay: `${i * 0.04}s` }} key={j.id}>
//             <div className="job-row-inner">
//               <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0, width: '100%' }}>
//                 <div className={`icon-badge lg ${color}`} style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', flexShrink: 0 }}>
//                   <Icon name={icon} size={28} />
//                 </div>
                
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5, color: '#f8fafc' }}>
//                     {j.title}
//                   </div>
//                   <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2, color: '#94a3b8' }}>
//                     {j.location} &middot; min {j.min_experience} yrs experience
//                   </div>
//                   <p className="muted" style={{ margin: '6px 0 8px', fontSize: 13, lineHeight: 1.4, maxWidth: 640, color: '#cbd5e1' }}>
//                     {j.description.length > 200 ? j.description.slice(0, 200) + '...' : j.description}
//                   </p>
//                   <div><SkillTags skills={j.required_skills} /></div>
//                 </div>
//               </div>

//               <div className="job-action-container" style={{ flexShrink: 0 }}>
//                 <button 
//                   className="job-apply-gradient-btn"
//                   disabled={applyingId === j.id} 
//                   onClick={() => applyToJob(j.id)}
//                 >
//                   {applyingId === j.id ? 'Matching...' : 'Apply'} <Icon name="arrowRight" size={14} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }






import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import { getJobVisual } from '../../lib/jobVisual';

export default function Jobs() {
  const [jobs, setJobs] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('hiremind_saved_jobs');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  const [applyingId, setApplyingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [jobsData, profileData, appsData] = await Promise.allSettled([
        apiRequest('/jobs'),
        apiRequest('/candidates/me'),
        apiRequest('/applications/mine')
      ]);

      if (jobsData.status === 'fulfilled') {
        setJobs(Array.isArray(jobsData.value) ? jobsData.value : []);
      } else {
        setJobs([]);
      }

      if (profileData.status === 'fulfilled') {
        setCandidateProfile(profileData.value);
      }

      if (appsData.status === 'fulfilled' && Array.isArray(appsData.value)) {
        const ids = new Set(appsData.value.map((app) => app.job_id));
        setAppliedJobIds(ids);
      }
    } catch (e) {
      toast(e.message, 'error');
      setJobs([]);
    }
  }

  function toggleBookmark(e, jobId) {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        toast('Job removed from saved roles', 'info', 1500);
      } else {
        next.add(jobId);
        toast('Job saved to your bookmarks', 'success', 1500);
      }
      localStorage.setItem('hiremind_saved_jobs', JSON.stringify([...next]));
      return next;
    });
  }

  async function applyToJob(jobId) {
    setApplyingId(jobId);
    try {
      await apiRequest('/applications', { method: 'POST', body: { job_id: jobId } });
      toast('Applied — AI match score computed', 'success');
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
      if (selectedJobDetail?.id === jobId) setSelectedJobDetail(null);
      navigate('/candidate/applications');
    } catch (e) {
      toast('Could not apply: ' + e.message, 'error');
      setApplyingId(null);
    }
  }

  const userSkills = useMemo(() => {
    return (candidateProfile?.skills || []).map((s) => s.toLowerCase().trim());
  }, [candidateProfile]);

  const jobsWithMeta = useMemo(() => {
    if (!jobs) return [];
    return jobs.map((job) => {
      const reqSkills = Array.isArray(job.required_skills) ? job.required_skills : [];
      let matchedCount = 0;
      const matched = [];
      const missing = [];

      reqSkills.forEach((sk) => {
        const normalized = sk.toLowerCase().trim();
        if (userSkills.includes(normalized)) {
          matchedCount += 1;
          matched.push(sk);
        } else {
          missing.push(sk);
        }
      });

      const matchPct = reqSkills.length > 0 
        ? Math.round((matchedCount / reqSkills.length) * 100)
        : 75;

      return {
        ...job,
        computedMatch: matchPct,
        matchedSkills: matched,
        missingSkills: missing,
        isApplied: appliedJobIds.has(job.id),
        isBookmarked: bookmarkedIds.has(job.id)
      };
    });
  }, [jobs, userSkills, appliedJobIds, bookmarkedIds]);

  const filteredJobs = useMemo(() => {
    if (!jobsWithMeta) return [];
    const q = searchQuery.toLowerCase().trim();

    return jobsWithMeta.filter((j) => {
      const title = (j.title || '').toLowerCase();
      const location = (j.location || '').toLowerCase();
      const description = (j.description || '').toLowerCase();
      const skillsMatch = (j.required_skills || []).some((s) => s.toLowerCase().includes(q));

      const matchesSearch = !q || title.includes(q) || location.includes(q) || description.includes(q) || skillsMatch;

      let matchesFilter = true;
      if (activeFilter === 'HIGH_MATCH') matchesFilter = j.computedMatch >= 70;
      else if (activeFilter === 'REMOTE') matchesFilter = (j.location || '').toLowerCase().includes('remote');
      else if (activeFilter === 'SAVED') matchesFilter = j.isBookmarked;
      else if (activeFilter === 'APPLIED') matchesFilter = j.isApplied;

      return matchesSearch && matchesFilter;
    });
  }, [jobsWithMeta, searchQuery, activeFilter]);

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        /* Borderless Filter Row Container */
        .neon-capsule-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 0 10px 0;
          margin-bottom: 18px;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .neon-capsule-bar::-webkit-scrollbar {
          display: none;
        }

        /* Glassmorphism Pill Button */
        .neon-pill-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 9999px;
          font-family: var(--font-display, inherit);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.03em;
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
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9.5px;
          font-family: var(--font-mono, monospace);
          font-weight: 800;
          background: rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.22s ease;
        }

        /* Inactive states */
        .neon-pill-btn.v-violet { border-color: rgba(168, 85, 247, 0.25); background: rgba(168, 85, 247, 0.06); }
        .neon-pill-btn.v-violet .neon-icon-badge { background: rgba(168, 85, 247, 0.18); color: #c084fc; }

        .neon-pill-btn.v-orange { border-color: rgba(249, 115, 22, 0.25); background: rgba(249, 115, 22, 0.06); }
        .neon-pill-btn.v-orange .neon-icon-badge { background: rgba(249, 115, 22, 0.18); color: #fb923c; }

        .neon-pill-btn.v-cyan { border-color: rgba(6, 182, 212, 0.25); background: rgba(6, 182, 212, 0.06); }
        .neon-pill-btn.v-cyan .neon-icon-badge { background: rgba(6, 182, 212, 0.18); color: #22d3ee; }

        .neon-pill-btn.v-amber { border-color: rgba(245, 158, 11, 0.25); background: rgba(245, 158, 11, 0.06); }
        .neon-pill-btn.v-amber .neon-icon-badge { background: rgba(245, 158, 11, 0.18); color: #fbbf24; }

        .neon-pill-btn.v-indigo { border-color: rgba(139, 92, 246, 0.25); background: rgba(139, 92, 246, 0.06); }
        .neon-pill-btn.v-indigo .neon-icon-badge { background: rgba(139, 92, 246, 0.18); color: #a78bfa; }

        .neon-pill-btn:hover:not(.active) {
          color: #f1f5f9;
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Active glowing states */
        .neon-pill-btn.v-violet.active {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(126, 34, 206, 0.45) 100%);
          border-color: #c084fc;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(168, 85, 247, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-pill-btn.v-orange.active {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.35) 0%, rgba(194, 65, 12, 0.45) 100%);
          border-color: #fb923c;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(249, 115, 22, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-pill-btn.v-cyan.active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.35) 0%, rgba(14, 116, 144, 0.45) 100%);
          border-color: #22d3ee;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-pill-btn.v-amber.active {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(180, 83, 9, 0.45) 100%);
          border-color: #fbbf24;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-pill-btn.v-indigo.active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(91, 33, 182, 0.45) 100%);
          border-color: #a78bfa;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }

        .neon-pill-btn.active .neon-icon-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .neon-pill-btn.active .neon-count-badge {
          background: rgba(0, 0, 0, 0.35);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Job Row Cards */
        .job-listing-row {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 14px;
          transition: all 0.22s ease;
          box-sizing: border-box;
          cursor: pointer;
          position: relative;
        }
        .job-listing-row:hover {
          transform: translateY(-2px);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.1), 0 8px 30px rgba(0, 0, 0, 0.5);
          border-color: rgba(168, 85, 247, 0.65);
        }
        .job-listing-row.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .job-listing-row.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .job-listing-row.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .job-listing-row.c-orange { border-color: rgba(249, 115, 22, 0.45); background: linear-gradient(135deg, rgba(45, 22, 10, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        
        .job-apply-gradient-btn {
          background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
          border: none;
          color: #ffffff;
          padding: 8px 18px;
          border-radius: 10px;
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
          white-space: nowrap;
        }
        .job-apply-gradient-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
        }
        .job-apply-gradient-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .applied-badge-btn {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          color: #4ade80;
          padding: 8px 16px;
          border-radius: 10px;
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 12.5px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: default;
          white-space: nowrap;
        }

        .bookmark-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bookmark-btn:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: rgba(168, 85, 247, 0.5);
          color: #fff;
        }
        .bookmark-btn.active {
          background: rgba(245, 158, 11, 0.15);
          border-color: rgba(245, 158, 11, 0.5);
          color: #fbbf24;
        }

        /* Aesthetic Search Bar */
        .aesthetic-search-wrapper {
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 14px 18px;
          margin-bottom: 16px;
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
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 11px 40px 11px 44px;
          color: #fff;
          font-size: 13.5px;
          box-sizing: border-box;
          outline: none;
          font-family: Inter, sans-serif;
          transition: all 0.2s ease;
          height: 44px;
        }
        .aesthetic-search-input-box input:focus {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
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

        .match-indicator-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .modal-detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-right: 44px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 12px;
        }

        @media (max-width: 768px) {
          .job-row-inner {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .job-action-container {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 14px;
          }
          .modal-detail-header {
            flex-direction: column;
            padding-right: 36px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div className="page-eyebrow">Discover Roles</div>
        <h1 className="page-title">Browse open <span className="hl">positions</span></h1>
        <p className="page-sub">
          Review live openings with real-time AI skill match indicators calibrated to your profile.
        </p>
      </div>

      {/* Aesthetic Search Bar */}
      <div className="aesthetic-search-wrapper">
        <div className="aesthetic-search-input-box">
          <span className="aesthetic-search-icon-badge">
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            placeholder="Search open roles by title, location, or required skills..."
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
                width: '22px',
                height: '22px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Borderless Segmented Neon Pills */}
      <div className="neon-capsule-bar">
        {[
          {
            id: 'ALL',
            label: 'All Roles',
            icon: '👥',
            variant: 'v-violet',
            count: jobs?.length || 0
          },
          {
            id: 'HIGH_MATCH',
            label: 'High Fit (≥70%)',
            icon: '⚡',
            variant: 'v-orange',
            count: jobsWithMeta.filter((j) => j.computedMatch >= 70).length
          },
          {
            id: 'REMOTE',
            label: 'Remote Only',
            icon: '🌐',
            variant: 'v-cyan',
            count: jobsWithMeta.filter((j) => (j.location || '').toLowerCase().includes('remote')).length
          },
          {
            id: 'SAVED',
            label: 'Saved Roles',
            icon: '⭐',
            variant: 'v-amber',
            count: bookmarkedIds.size
          },
          {
            id: 'APPLIED',
            label: 'Applied',
            icon: '✓',
            variant: 'v-indigo',
            count: appliedJobIds.size
          }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`neon-pill-btn ${tab.variant} ${activeFilter === tab.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab.id)}
          >
            <span className="neon-icon-badge">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="neon-count-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {jobs === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {jobs && filteredJobs.length === 0 && (
        <div className="card empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="es-icon" style={{ margin: '0 auto 12px' }}><Icon name="briefcase" size={26} /></div>
          <div className="es-title" style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            {jobs.length === 0 ? 'No open roles posted yet' : 'No roles match your filters'}
          </div>
          <div className="es-sub" style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
            Try resetting your search query or switching the filter tabs.
          </div>
        </div>
      )}

      {filteredJobs.map((j) => {
        const { icon, color } = getJobVisual(j.title);
        const matchPct = j.computedMatch;
        const matchColor = matchPct >= 75 ? '#4ade80' : matchPct >= 50 ? '#c084fc' : '#94a3b8';

        return (
          <div 
            className={`job-listing-row c-${color}`} 
            key={j.id}
            onClick={() => setSelectedJobDetail(j)}
          >
            <div className="job-row-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1, minWidth: 0, width: '100%' }}>
                <div 
                  className={`icon-badge lg ${color}`} 
                  style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', flexShrink: 0 }}
                >
                  <Icon name={icon} size={26} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5, color: '#f8fafc' }}>
                      {j.title}
                    </span>
                    
                    <span 
                      className="match-indicator-badge"
                      style={{ 
                        background: `${matchColor}18`, 
                        color: matchColor, 
                        border: `1px solid ${matchColor}40` 
                      }}
                      title="Estimated AI match against your parsed profile"
                    >
                      ✦ {matchPct}% Match
                    </span>
                  </div>

                  <div className="muted mono" style={{ fontSize: 11.5, marginTop: 4, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>📍 {j.location}</span>
                    <span>&middot;</span>
                    <span>⏳ min {j.min_experience} yrs exp</span>
                    {j.recruiter_name && (
                      <>
                        <span>&middot;</span>
                        <span>👤 {j.recruiter_name}</span>
                      </>
                    )}
                  </div>

                  <p className="muted" style={{ margin: '8px 0 10px', fontSize: 13, lineHeight: 1.45, maxWidth: 660, color: '#cbd5e1' }}>
                    {j.description?.length > 180 ? j.description.slice(0, 180) + '...' : j.description}
                  </p>

                  {j.required_skills && j.required_skills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {j.required_skills.slice(0, 5).map((sk) => {
                        const isMatched = j.matchedSkills.includes(sk);
                        return (
                          <span
                            key={sk}
                            style={{
                              fontSize: '11px',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: isMatched ? 'rgba(45, 212, 191, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                              color: isMatched ? '#2dd4bf' : '#94a3b8',
                              border: isMatched ? '1px solid rgba(45, 212, 191, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            {isMatched ? `✓ ${sk}` : sk}
                          </span>
                        );
                      })}
                      {j.required_skills.length > 5 && (
                        <span style={{ fontSize: '11px', color: '#94a3b8', padding: '2px 4px' }}>
                          +{j.required_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>General Engineering</span>
                  )}
                </div>
              </div>

              <div className="job-action-container" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <button
                  type="button"
                  className={`bookmark-btn ${j.isBookmarked ? 'active' : ''}`}
                  onClick={(e) => toggleBookmark(e, j.id)}
                  title={j.isBookmarked ? 'Remove bookmark' : 'Save role'}
                >
                  {j.isBookmarked ? '★' : '☆'}
                </button>

                {j.isApplied ? (
                  <div className="applied-badge-btn" title="You already applied to this role">
                    ✓ Applied
                  </div>
                ) : (
                  <button 
                    type="button"
                    className="job-apply-gradient-btn"
                    disabled={applyingId === j.id} 
                    onClick={(e) => {
                      e.stopPropagation();
                      applyToJob(j.id);
                    }}
                  >
                    {applyingId === j.id ? 'Matching...' : 'Apply'} <Icon name="arrowRight" size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Detailed Role Inspection Modal */}
      <Modal open={!!selectedJobDetail} onClose={() => setSelectedJobDetail(null)} maxWidth={580}>
        {selectedJobDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'Inter, sans-serif' }}>
            <div className="modal-detail-header">
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', margin: 0 }}>
                  {selectedJobDetail.title}
                </h2>
                <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  📍 {selectedJobDetail.location} &bull; min {selectedJobDetail.min_experience} yrs exp
                </div>
              </div>
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))', 
                  border: '1px solid rgba(168,85,247,0.4)', 
                  padding: '5px 10px', 
                  borderRadius: '10px',
                  textAlign: 'center',
                  flexShrink: 0
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: '#c084fc' }}>
                  {selectedJobDetail.computedMatch}%
                </div>
                <div style={{ fontSize: '8.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI Fit Score
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6 }}>
                Job Description
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line', maxHeight: '180px', overflowY: 'auto' }}>
                {selectedJobDetail.description}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6 }}>
                Required Skills Breakdown
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedJobDetail.required_skills?.map((sk) => {
                  const isMatched = selectedJobDetail.matchedSkills.includes(sk);
                  return (
                    <span
                      key={sk}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: isMatched ? 'rgba(45, 212, 191, 0.15)' : 'rgba(244, 63, 94, 0.12)',
                        color: isMatched ? '#2dd4bf' : '#f87171',
                        border: isMatched ? '1px solid rgba(45, 212, 191, 0.4)' : '1px solid rgba(244, 63, 94, 0.35)'
                      }}
                    >
                      {isMatched ? `✓ ${sk} (Matched)` : `✕ ${sk} (Missing)`}
                    </span>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {selectedJobDetail.isApplied ? (
                <div style={{ width: '100%', padding: '12px', textAlign: 'center', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#4ade80', borderRadius: '12px', fontWeight: 700, fontSize: '13px' }}>
                  ✓ Application Submitted
                </div>
              ) : (
                <button
                  type="button"
                  className="job-apply-gradient-btn"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                  disabled={applyingId === selectedJobDetail.id}
                  onClick={() => applyToJob(selectedJobDetail.id)}
                >
                  {applyingId === selectedJobDetail.id ? 'Processing Application...' : 'Submit Instant Application'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
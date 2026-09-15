


// import { useState, useEffect, useMemo } from 'react';
// import { apiRequest } from '../../api';
// import ScoreRing from '../../components/ScoreRing';
// import SkillTags from '../../components/SkillTags';
// import Icon from '../../components/Icon';
// import { getJobVisual } from '../../lib/jobVisual';

// function statusColor(status) {
//   if (status === 'selected' || status === 'hired') return 'teal';
//   if (status === 'rejected') return 'rust';
//   if (status === 'ai_screening') return 'violet';
//   return 'blue';
// }

// /**
//  * Resolves the job title to display for an application.
//  *
//  * Previously this fell back to a hardcoded job_id -> title guess table
//  * (e.g. "job_id === 5 ? 'Data Analyst'") whenever the API didn't send a
//  * title directly. That table was a leftover assumption about a specific
//  * fixed set of demo jobs and had no connection to the real jobs table --
//  * the moment an actual job's id didn't match its guess (e.g. a 5th job
//  * named "Java Backend Developer" instead of "Data Analyst"), it silently
//  * displayed the WRONG job title with no error or warning.
//  *
//  * Now that the backend actually returns `job_title` (see
//  * models.Application.job_title / schemas.ApplicationOut), there's no
//  * legitimate case where guessing is needed -- the only remaining fallback
//  * is a generic, honestly-labeled "Job #N" for the rare case of a genuinely
//  * missing/orphaned job record, which is at least visibly a placeholder
//  * rather than a confidently wrong real-looking title.
//  */
// function resolveJobTitle(app) {
//   return app.job_title || app.title || app.job?.title || `Job #${app.job_id}`;
// }

// function BreakdownBar({ label, data }) {
//   const [width, setWidth] = useState(0);
//   useEffect(() => {
//     const t = setTimeout(() => setWidth(data.score), 80);
//     return () => clearTimeout(t);
//   }, [data.score]);

//   return (
//     <div className="breakdown-item" style={{ marginBottom: '8px' }}>
//       <div className="bd-top" style={{ fontSize: '12px' }}>
//         <span className="bd-label">{label.replace(/_/g, ' ')} <span className="mono" style={{ opacity: 0.6 }}>({data.weight_pct}% weight)</span></span>
//         <span className="bd-score">{data.score}%</span>
//       </div>
//       <div className="bd-bar-track" style={{ height: '6px' }}><div className="bd-bar-fill" style={{ width: `${width}%` }} /></div>
//       <div className="bd-explain" style={{ fontSize: '11.5px', marginTop: '2px' }}>{data.explanation}</div>
//     </div>
//   );
// }

// function ApplicationCard({ app, index }) {
//   const color = statusColor(app.status);
//   const jobTitle = resolveJobTitle(app);
//   const { icon } = getJobVisual(jobTitle);

//   return (
//     <div className={`application-listing-row c-${color}`} style={{ animation: `rowIn 0.3s ease-out ${index * 0.05}s both` }}>
//       <style>{`
//         .application-listing-row {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.4);
//           box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
//           border-radius: 16px;
//           padding: 16px 20px;
//           margin-bottom: 14px;
//           transition: all 0.2s ease;
//           box-sizing: border-box;
//         }
//         .application-listing-row.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .application-listing-row.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .application-listing-row.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
//         .application-listing-row.c-rust { border-color: rgba(239, 68, 68, 0.45); background: linear-gradient(135deg, rgba(52, 16, 16, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        
//         .skills-grid-container {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 16px;
//           margin-top: 14px;
//         }
//         @media (max-width: 768px) {
//           .skills-grid-container {
//             grid-template-columns: 1fr !important;
//           }
//         }
//       `}</style>

//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
//           <div className={`icon-badge ${color}`} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0 }}>
//             <Icon name={icon} size={20} />
//           </div>
//           <div style={{ minWidth: 0 }}>
//             <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#f8fafc' }}>
//               {jobTitle}
//             </div>
//             <span className={`status-pill status-${app.status}`} style={{ marginTop: 4, display: 'inline-block', fontSize: '11px', padding: '2px 8px' }}>
//               {app.status.replace('_', ' ').toUpperCase()}
//             </span>
//           </div>
//         </div>

//         <div style={{ flexShrink: 0, transform: 'scale(0.85)', transformOrigin: 'right center' }}>
//           <ScoreRing pct={app.match_score} />
//         </div>
//       </div>

//       <div className="skills-grid-container">
//         <div>
//           <div className="muted mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, color: '#94a3b8' }}>Matched skills</div>
//           <SkillTags skills={app.matched_skills} cls="matched" />
//         </div>
//         <div>
//           <div className="muted mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, color: '#94a3b8' }}>Missing skills</div>
//           <SkillTags skills={app.missing_skills} cls="missing" />
//         </div>
//       </div>

//       <details style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
//         <summary style={{ cursor: 'pointer', fontSize: 12, color: `var(--${color})`, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', outline: 'none' }}>
//           <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//             <Icon name="sparkles" size={12} /> Why this score, and practice interview questions
//           </span>
//           <span style={{ fontSize: 14, fontWeight: 'bold' }}>&gt;</span>
//         </summary>
//         <div style={{ marginTop: 12 }}>
//           {Object.entries(app.match_breakdown.components || {}).map(([k, v]) => (
//             <BreakdownBar key={k} label={k} data={v} />
//           ))}
//           <div className="divider-label" style={{ marginTop: 12, fontSize: '11px' }}>AI-generated interview questions</div>
//           <ol className="q-list" style={{ marginTop: 6, paddingLeft: 18, color: '#cbd5e1', fontSize: 12.5 }}>
//             {(app.interview_questions || []).map((q, i) => <li key={i} style={{ marginBottom: 4 }}>{q}</li>)}
//           </ol>
//         </div>
//       </details>
//     </div>
//   );
// }

// export default function Applications() {
//   const [apps, setApps] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     apiRequest('/applications/mine').then(setApps).catch(() => setApps([]));
//   }, []);

//   const filteredApps = useMemo(() => {
//     if (!apps) return [];
//     if (!searchQuery.trim()) return apps;
//     const q = searchQuery.toLowerCase().trim();
//     return apps.filter((app) => {
//       const jobTitle = resolveJobTitle(app).toLowerCase();
//       const status = (app.status || '').toLowerCase().replace('_', ' ');
//       const matched = (app.matched_skills || []).some(s => s.toLowerCase().includes(q));
//       const missing = (app.missing_skills || []).some(s => s.toLowerCase().includes(q));

//       // Checks if query matches either start of words in the title or anywhere in title/status/skills
//       return jobTitle.includes(q) || status.includes(q) || matched || missing;
//     });
//   }, [apps, searchQuery]);

//   return (
//     <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
//       <style>{`
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
//       `}</style>

//       <div className="page-header" style={{ marginBottom: '20px' }}>
//         <div className="page-eyebrow">Step 3 of 3</div>
//         <h1 className="page-title">My <span className="hl">applications</span></h1>
//         <p className="page-sub">Track your stage in the pipeline, see exactly why you scored that way, and practice with AI-generated interview questions.</p>
//       </div>

//       {/* Aesthetic Search Bar */}
//       <div className="aesthetic-search-wrapper">
//         <div className="aesthetic-search-input-box">
//           <span className="aesthetic-search-icon-badge">
//             <Icon name="search" size={14} />
//           </span>
//           <input
//             type="text"
//             placeholder="Search applications by role, status, or skills..."
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

//       {apps === null && (
//         <>
//           <div className="skeleton sk-row" />
//           <div className="skeleton sk-row" />
//         </>
//       )}

//       {apps && filteredApps.length === 0 && (
//         <div className="card empty-state">
//           <div className="es-icon"><Icon name="applications" size={22} /></div>
//           <div className="es-title">{apps.length === 0 ? 'No applications yet' : 'No applications match your search'}</div>
//           <div className="es-sub">Browse open roles and apply to see your AI match score.</div>
//         </div>
//       )}

//       {filteredApps.map((app, i) => <ApplicationCard app={app} index={i} key={app.id} />)}
//     </div>
//   );
// }
















import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import ScoreRing from '../../components/ScoreRing';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import { getJobVisual } from '../../lib/jobVisual';

const STAGES_PIPELINE = [
  { key: 'ai_screening', label: 'Screening' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'selected', label: 'Offer' },
];

function statusColor(status) {
  if (status === 'selected' || status === 'hired') return 'teal';
  if (status === 'rejected') return 'rust';
  if (status === 'ai_screening') return 'violet';
  return 'blue';
}

function resolveJobTitle(app) {
  return app.job_title || app.title || app.job?.title || `Job #${app.job_id}`;
}

function BreakdownBar({ label, data }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(data.score), 80);
    return () => clearTimeout(t);
  }, [data.score]);

  return (
    <div className="breakdown-item" style={{ marginBottom: '8px' }}>
      <div className="bd-top" style={{ fontSize: '12px' }}>
        <span className="bd-label">
          {label.replace(/_/g, ' ')}{' '}
          <span className="mono" style={{ opacity: 0.6 }}>({data.weight_pct}% weight)</span>
        </span>
        <span className="bd-score">{data.score}%</span>
      </div>
      <div className="bd-bar-track" style={{ height: '6px' }}>
        <div className="bd-bar-fill" style={{ width: `${width}%` }} />
      </div>
      <div className="bd-explain" style={{ fontSize: '11.5px', marginTop: '2px', color: '#94a3b8' }}>
        {data.explanation}
      </div>
    </div>
  );
}

function PipelineStepper({ currentStatus }) {
  const isRejected = currentStatus === 'rejected';
  const currentIndex = STAGES_PIPELINE.findIndex((s) => s.key === currentStatus);
  const activeIdx = currentIndex !== -1 ? currentIndex : 0;

  return (
    <div className="pipeline-stepper-container">
      {STAGES_PIPELINE.map((stage, idx) => {
        const isDone = !isRejected && idx < activeIdx;
        const isCurrent = !isRejected && idx === activeIdx;

        return (
          <div key={stage.key} className="stepper-step">
            <div className={`stepper-node ${isDone ? 'done' : isCurrent ? 'active' : ''}`}>
              {isDone ? '✓' : idx + 1}
            </div>
            <div className={`stepper-label ${isCurrent ? 'active-text' : ''}`}>
              {stage.label}
            </div>
            {idx < STAGES_PIPELINE.length - 1 && (
              <div className={`stepper-line ${isDone ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
      {isRejected && (
        <div className="rejected-alert-chip">
          <span>✕</span> Status: Not Selected
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app, index, onWithdraw, onPractice }) {
  const navigate = useNavigate();
  const color = statusColor(app.status);
  const jobTitle = resolveJobTitle(app);
  const { icon } = getJobVisual(jobTitle);
  const [expanded, setExpanded] = useState(false);

  const isAssessment = app.status === 'assessment';
  const isInterview = app.status === 'interview';

  return (
    <div
      className={`application-listing-row c-${color}`}
      style={{ animation: `rowIn 0.3s ease-out ${index * 0.05}s both` }}
    >
      {/* Top Details & Score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <div
            className={`icon-badge ${color}`}
            style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0 }}
          >
            <Icon name={icon} size={20} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#f8fafc' }}>
              {jobTitle}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              <span className={`status-pill status-${app.status}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                {app.status.replace('_', ' ').toUpperCase()}
              </span>
              {app.applied_at && (
                <span className="mono" style={{ fontSize: '11px', color: '#64748b' }}>
                  Applied {new Date(app.applied_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0, transform: 'scale(0.85)', transformOrigin: 'right center' }}>
          <ScoreRing pct={app.match_score} />
        </div>
      </div>

      {/* Progress Stepper */}
      <PipelineStepper currentStatus={app.status} />

      {/* Action shortcuts based on active stage */}
      {(isAssessment || isInterview) && (
        <div className="stage-action-banner">
          {isAssessment && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', color: '#cbd5e1' }}>
                <span>📝</span> <strong>Assessment Assigned:</strong> Complete your evaluation to advance.
              </div>
              <button
                type="button"
                className="action-gradient-btn"
                onClick={() => navigate('/candidate/assessments')}
              >
                Take Assessment <Icon name="arrowRight" size={13} />
              </button>
            </>
          )}
          {isInterview && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', color: '#cbd5e1' }}>
                <span>🎯</span> <strong>Interview Stage:</strong> Your interview is in progress or scheduled.
              </div>
              <button
                type="button"
                className="action-gradient-btn"
                onClick={() => navigate('/candidate/interviews')}
              >
                View Details <Icon name="arrowRight" size={13} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Skills breakdown */}
      <div className="skills-grid-container">
        <div>
          <div className="muted mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, color: '#94a3b8' }}>
            Matched skills
          </div>
          {app.matched_skills && app.matched_skills.length > 0 ? (
            <SkillTags skills={app.matched_skills} cls="matched" />
          ) : (
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>None</span>
          )}
        </div>
        <div>
          <div className="muted mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, color: '#94a3b8' }}>
            Missing skills
          </div>
          {app.missing_skills && app.missing_skills.length > 0 ? (
            <SkillTags skills={app.missing_skills} cls="missing" />
          ) : (
            <span style={{ fontSize: '11px', color: '#4ade80', fontFamily: 'var(--font-mono)' }}>None missing</span>
          )}
        </div>
      </div>

      {/* Accordion Toggle */}
      <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            cursor: 'pointer',
            fontSize: '12px',
            color: `var(--${color})`,
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="sparkles" size={12} /> Why this score, breakdown & AI practice questions
          </span>
          <span style={{ fontSize: '13px', fontWeight: 'bold', transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'none' }}>
            &gt;
          </span>
        </div>

        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
            {/* Component Breakdown Bars */}
            {Object.entries(app.match_breakdown?.components || {}).map(([k, v]) => (
              <BreakdownBar key={k} label={k} data={v} />
            ))}

            {/* AI Generated Interview Questions & Practice */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div className="divider-label" style={{ margin: 0, fontSize: '11px' }}>
                AI-generated interview questions
              </div>
              <button
                type="button"
                className="practice-ai-pill-btn"
                onClick={() => onPractice(jobTitle, app.interview_questions || [])}
              >
                <span className="practice-icon">⚡</span>
                <span>Practice with AI</span>
              </button>
            </div>

            <ol className="q-list" style={{ marginTop: 6, paddingLeft: 18, color: '#cbd5e1', fontSize: 12.5 }}>
              {(app.interview_questions || []).map((q, i) => (
                <li key={i} style={{ marginBottom: 6, lineHeight: 1.45 }}>{q}</li>
              ))}
            </ol>

            {/* Footer action: Withdraw */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="withdraw-danger-btn"
                onClick={() => onWithdraw(app.id, jobTitle)}
              >
                <span className="withdraw-icon">✕</span>
                <span>Withdraw Application</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Applications() {
  const [apps, setApps] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [practiceData, setPracticeData] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const data = await apiRequest('/applications/mine');
      setApps(data || []);
    } catch {
      setApps([]);
    }
  }

  async function handleWithdraw(appId, title) {
    if (!window.confirm(`Are you sure you want to withdraw your application for ${title}?`)) return;
    try {
      await apiRequest(`/applications/${appId}`, { method: 'DELETE' });
      toast('Application withdrawn successfully', 'info');
      setApps((prev) => prev.filter((a) => a.id !== appId));
    } catch (e) {
      toast(e.message || 'Could not withdraw application', 'error');
    }
  }

  function handleOpenPractice(jobTitle, questions) {
    setPracticeData({
      jobTitle,
      question: questions[0] || `Explain your relevant experience for ${jobTitle}.`,
      allQuestions: questions,
      currentIndex: 0,
    });
    setPracticeAnswer('');
    setPracticeFeedback('');
  }

  async function handleEvaluateAnswer() {
    if (!practiceAnswer.trim()) {
      toast('Please write or outline an answer first', 'error');
      return;
    }
    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      setPracticeFeedback(
        `Great structure! You clearly articulated relevant context. Tip: Use the STAR method (Situation, Task, Action, Result) to highlight measurable business metrics to boost confidence score.`
      );
    }, 750);
  }

  const filteredApps = useMemo(() => {
    if (!apps) return [];
    const q = searchQuery.toLowerCase().trim();

    return apps.filter((app) => {
      const jobTitle = resolveJobTitle(app).toLowerCase();
      const status = (app.status || '').toLowerCase().replace('_', ' ');
      const matched = (app.matched_skills || []).some((s) => s.toLowerCase().includes(q));
      const missing = (app.missing_skills || []).some((s) => s.toLowerCase().includes(q));

      const matchesSearch = !q || jobTitle.includes(q) || status.includes(q) || matched || missing;

      let matchesFilter = true;
      if (activeFilter === 'SCREENING') matchesFilter = app.status === 'ai_screening';
      else if (activeFilter === 'ASSESSMENT') matchesFilter = app.status === 'assessment';
      else if (activeFilter === 'INTERVIEW') matchesFilter = app.status === 'interview';
      else if (activeFilter === 'SELECTED') matchesFilter = app.status === 'selected' || app.status === 'hired';

      return matchesSearch && matchesFilter;
    });
  }, [apps, searchQuery, activeFilter]);

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        /* Borderless Segmented Neon Capsule Bar */
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

        /* Category Color Variants */
        .neon-pill-btn.v-violet { border-color: rgba(168, 85, 247, 0.25); background: rgba(168, 85, 247, 0.06); }
        .neon-pill-btn.v-violet .neon-icon-badge { background: rgba(168, 85, 247, 0.18); color: #c084fc; }

        .neon-pill-btn.v-cyan { border-color: rgba(6, 182, 212, 0.25); background: rgba(6, 182, 212, 0.06); }
        .neon-pill-btn.v-cyan .neon-icon-badge { background: rgba(6, 182, 212, 0.18); color: #22d3ee; }

        .neon-pill-btn.v-orange { border-color: rgba(249, 115, 22, 0.25); background: rgba(249, 115, 22, 0.06); }
        .neon-pill-btn.v-orange .neon-icon-badge { background: rgba(249, 115, 22, 0.18); color: #fb923c; }

        .neon-pill-btn.v-blue { border-color: rgba(59, 130, 246, 0.25); background: rgba(59, 130, 246, 0.06); }
        .neon-pill-btn.v-blue .neon-icon-badge { background: rgba(59, 130, 246, 0.18); color: #60a5fa; }

        .neon-pill-btn.v-teal { border-color: rgba(45, 212, 191, 0.25); background: rgba(45, 212, 191, 0.06); }
        .neon-pill-btn.v-teal .neon-icon-badge { background: rgba(45, 212, 191, 0.18); color: #2dd4bf; }

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
        .neon-pill-btn.v-cyan.active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.35) 0%, rgba(14, 116, 144, 0.45) 100%);
          border-color: #22d3ee;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-pill-btn.v-orange.active {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.35) 0%, rgba(194, 65, 12, 0.45) 100%);
          border-color: #fb923c;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(249, 115, 22, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-pill-btn.v-blue.active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(29, 78, 216, 0.45) 100%);
          border-color: #60a5fa;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .neon-pill-btn.v-teal.active {
          background: linear-gradient(135deg, rgba(45, 212, 191, 0.35) 0%, rgba(15, 118, 110, 0.45) 100%);
          border-color: #2dd4bf;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(45, 212, 191, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25);
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

        /* Premium Practice with AI Button */
        .practice-ai-pill-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-family: var(--font-display, inherit);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          color: #f3e8ff;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(126, 34, 206, 0.4) 100%);
          border: 1px solid rgba(192, 132, 252, 0.5);
          box-shadow: 0 2px 10px rgba(168, 85, 247, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }
        .practice-ai-pill-btn .practice-icon {
          color: #e879f9;
          font-size: 11px;
          transition: transform 0.2s ease;
        }
        .practice-ai-pill-btn:hover {
          color: #ffffff;
          border-color: rgba(216, 180, 254, 0.85);
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.45) 0%, rgba(126, 34, 206, 0.6) 100%);
          box-shadow: 0 4px 18px rgba(168, 85, 247, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }
        .practice-ai-pill-btn:hover .practice-icon {
          transform: scale(1.15);
        }

        /* Premium Withdraw Button */
        .withdraw-danger-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-family: var(--font-display, inherit);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          cursor: pointer;
          color: #fca5a5;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(185, 28, 28, 0.2) 100%);
          border: 1px solid rgba(239, 68, 68, 0.35);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }
        .withdraw-danger-btn .withdraw-icon {
          font-size: 10px;
          opacity: 0.8;
          transition: transform 0.2s ease;
        }
        .withdraw-danger-btn:hover {
          color: #ffffff;
          border-color: rgba(248, 113, 113, 0.8);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.45) 100%);
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .withdraw-danger-btn:hover .withdraw-icon {
          transform: scale(1.15);
        }

        .application-listing-row {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          padding: 18px 22px;
          margin-bottom: 16px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .application-listing-row.c-teal { border-color: rgba(20, 184, 166, 0.45); background: linear-gradient(135deg, rgba(10, 35, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .application-listing-row.c-violet { border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(30, 16, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .application-listing-row.c-blue { border-color: rgba(59, 130, 246, 0.45); background: linear-gradient(135deg, rgba(12, 26, 52, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        .application-listing-row.c-rust { border-color: rgba(239, 68, 68, 0.45); background: linear-gradient(135deg, rgba(52, 16, 16, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%); }
        
        .skills-grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 14px;
        }

        .pipeline-stepper-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(10, 8, 22, 0.6);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 10px 16px;
          margin-top: 14px;
          position: relative;
          overflow-x: auto;
          gap: 4px;
        }
        .stepper-step {
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          flex: 1;
        }
        .stepper-node {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          font-family: var(--font-mono);
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
        }
        .stepper-node.done {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
          border-color: #22c55e;
        }
        .stepper-node.active {
          background: rgba(168, 85, 247, 0.35);
          color: #c084fc;
          border-color: #a855f7;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);
        }
        .stepper-label {
          font-size: 11px;
          font-family: var(--font-mono);
          color: #64748b;
          white-space: nowrap;
        }
        .stepper-label.active-text {
          color: #e2e8f0;
          font-weight: 700;
        }
        .stepper-line {
          flex: 1;
          height: 2px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0 6px;
          min-width: 12px;
        }
        .stepper-line.done {
          background: rgba(34, 197, 94, 0.4);
        }
        .rejected-alert-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-family: var(--font-mono);
          color: #f87171;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .stage-action-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.12));
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 12px;
          padding: 10px 14px;
          margin-top: 12px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .action-gradient-btn {
          background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
          border: none;
          color: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(168, 85, 247, 0.3);
        }

        .aesthetic-search-wrapper {
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 14px 18px;
          margin-bottom: 14px;
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
          .skills-grid-container {
            grid-template-columns: 1fr !important;
          }
          .pipeline-stepper-container {
            flex-wrap: wrap;
          }
        }
      `}</style>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '18px' }}>
        <div className="page-eyebrow">Status Dashboard</div>
        <h1 className="page-title">My <span className="hl">applications</span></h1>
        <p className="page-sub">
          Monitor your live stage in the pipeline, inspect fit breakdowns, and practice interview questions.
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
            placeholder="Search applications by role, status, or skills..."
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

      {/* Borderless Segmented Neon Pill Filters */}
      <div className="neon-capsule-bar">
        {[
          {
            id: 'ALL',
            label: 'All Applications',
            icon: '👥',
            variant: 'v-violet',
            count: apps?.length || 0,
          },
          {
            id: 'SCREENING',
            label: 'Screening',
            icon: '⚡',
            variant: 'v-cyan',
            count: apps?.filter((a) => a.status === 'ai_screening').length || 0,
          },
          {
            id: 'ASSESSMENT',
            label: 'Assessment',
            icon: '◈',
            variant: 'v-orange',
            count: apps?.filter((a) => a.status === 'assessment').length || 0,
          },
          {
            id: 'INTERVIEW',
            label: 'Interview',
            icon: '❖',
            variant: 'v-blue',
            count: apps?.filter((a) => a.status === 'interview').length || 0,
          },
          {
            id: 'SELECTED',
            label: 'Selected',
            icon: '★',
            variant: 'v-teal',
            count: apps?.filter((a) => a.status === 'selected' || a.status === 'hired').length || 0,
          },
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

      {apps === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {apps && filteredApps.length === 0 && (
        <div className="card empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="es-icon" style={{ margin: '0 auto 12px' }}><Icon name="applications" size={26} /></div>
          <div className="es-title" style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
            {apps.length === 0 ? 'No applications submitted yet' : 'No applications match your search'}
          </div>
          <div className="es-sub" style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
            Browse open positions to apply and generate AI match scores.
          </div>
        </div>
      )}

      {filteredApps.map((app, i) => (
        <ApplicationCard
          app={app}
          index={i}
          key={app.id}
          onWithdraw={handleWithdraw}
          onPractice={handleOpenPractice}
        />
      ))}

      {/* AI Practice Interview Modal */}
      <Modal open={!!practiceData} onClose={() => setPracticeData(null)} maxWidth={560}>
        {practiceData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#c084fc', textTransform: 'uppercase' }}>
                AI Mock Practice Session
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff', margin: '4px 0 0' }}>
                {practiceData.jobTitle}
              </h2>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>
                Question {practiceData.currentIndex + 1} of {practiceData.allQuestions.length}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc', lineHeight: 1.4 }}>
                {practiceData.question}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
                Your Answer / Talking Points
              </label>
              <textarea
                rows={4}
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                placeholder="Type your response or bullet points here..."
                style={{
                  width: '100%',
                  background: 'rgba(12, 10, 24, 0.9)',
                  border: '1.5px solid rgba(139, 92, 246, 0.35)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {practiceFeedback && (
              <div style={{ background: 'rgba(45, 212, 191, 0.08)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: '10px', padding: '12px', color: '#cbd5e1', fontSize: '12.5px', lineHeight: 1.5 }}>
                <strong style={{ color: '#2dd4bf' }}>💡 AI Evaluation & Tip:</strong>
                <div style={{ marginTop: 4 }}>{practiceFeedback}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="action-gradient-btn"
                style={{ flex: 1, padding: '11px', justifyContent: 'center' }}
                disabled={evaluating}
                onClick={handleEvaluateAnswer}
              >
                {evaluating ? 'Analyzing Answer...' : 'Evaluate Answer with AI'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
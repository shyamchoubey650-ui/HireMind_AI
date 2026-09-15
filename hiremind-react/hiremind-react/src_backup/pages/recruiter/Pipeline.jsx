import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ScoreRing from '../../components/ScoreRing';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';

const STAGES = [
  { key: 'ai_screening', label: 'AI Screening', platform: 'Platform 1' },
  { key: 'shortlisted', label: 'Shortlisted', platform: 'Platform 2' },
  { key: 'assessment', label: 'Assessment', platform: 'Platform 3' },
  { key: 'interview', label: 'Interview', platform: 'Platform 4' },
  { key: 'selected', label: 'Selected', platform: 'Platform 5' },
  { key: 'rejected', label: 'Rejected', platform: 'Platform 6' },
];

function scoreTier(score) {
  if (score >= 70) return 'tier-high';
  if (score >= 40) return 'tier-mid';
  return 'tier-low';
}

/* ---------------- Job list ---------------- */

function JobList({ onSelect }) {
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    apiRequest('/jobs/mine').then(setJobs).catch(() => setJobs([]));
  }, []);

  return (
    <div className="card">
      <h2>Your postings</h2>
      {jobs === null && (<><div className="skeleton sk-row" /><div className="skeleton sk-row" /></>)}
      {jobs && jobs.length === 0 && (
        <div className="empty-state">
          <div className="es-icon"><Icon name="assessments" size={22} /></div>
          <div className="es-title">No jobs posted yet</div>
          <div className="es-sub">Head to "Post a Job" to create your first listing.</div>
        </div>
      )}
      {jobs && jobs.length > 0 && (
        jobs.map((j) => (
          <div className="listing-row" style={{ cursor: 'pointer' }} onClick={() => onSelect(j.id, j.title)} key={j.id}>
            <div className="row">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5 }}>{j.title}</div>
                <div className="muted mono" style={{ fontSize: 11, marginTop: 3 }}>{j.location} &middot; {j.status} &middot; min {j.min_experience} yrs</div>
              </div>
              <button className="small secondary">View pipeline &rarr;</button>
            </div>
            <div style={{ marginTop: 8 }}><SkillTags skills={j.required_skills} /></div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------------- Kanban card ---------------- */

function KanbanCard({ app, onDragStart, onDragEnd, onClick }) {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, app.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(app.id)}
    >
      <div className="kc-top">
        <div className="kc-identity">
          <div className="kc-avatar">{String(app.candidate_id).slice(-2)}</div>
          <span className="kc-id">Candidate {app.candidate_id}</span>
        </div>
        <span className={`kc-score ${scoreTier(app.match_score)}`}>{app.match_score}%</span>
      </div>
      <div className="kc-skills">
        {(app.matched_skills || []).slice(0, 3).map((s) => <span className="tag matched" key={s}>{s}</span>)}
      </div>
    </div>
  );
}

/* ---------------- Kanban column ---------------- */

function KanbanColumn({ stage, apps, onDrop, onDragStart, onDragEnd, onCardClick }) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      className={`kanban-col${dragOver ? ' drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(stage.key); }}
    >
      <div className="kanban-col-head">
        <div><span className="plat">{stage.platform}</span><span className="label">{stage.label}</span></div>
        <span className="kanban-count">{apps.length}</span>
      </div>
      <div className="kanban-cards">
        {apps.length === 0 && <div className="muted" style={{ fontSize: 11.5, textAlign: 'center', padding: '16px 4px' }}>No candidates</div>}
        {apps.map((a) => (
          <KanbanCard app={a} onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onCardClick} key={a.id} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Candidate detail modal body ----------------
   Fix: previously the whole panel (name, score ring, matched/missing,
   breakdown, questions, actions) scrolled as one block inside the modal,
   so once you scrolled past the identity header it was gone — and on a
   long list of matched skills it could look "stuck" with nothing visibly
   moving. Now the identity/score header stays pinned (position: sticky)
   at the top of the modal while the rest of the content scrolls under it,
   and the breakdown/skills area has its own bounded, independently
   scrollable region. */

function DetailModalBody({ app, onMoveStage, onAssignAssessment, onScheduleInterview }) {
  return (
    <div>
      <div className="modal-sticky-head">
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Candidate {app.candidate_id}</div>
          <span className={`status-pill status-${app.status}`} style={{ marginTop: 6, display: 'inline-block' }}>{app.status.replace('_', ' ')}</span>
        </div>
        <ScoreRing pct={app.match_score} size={64} stroke={5} />
      </div>

      <div className="modal-scroll-body">
        <div className="grid-2" style={{ marginTop: 4 }}>
          <div>
            <div className="muted mono" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Matched</div>
            <SkillTags skills={app.matched_skills} cls="matched" />
          </div>
          <div>
            <div className="muted mono" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Missing</div>
            <SkillTags skills={app.missing_skills} cls="missing" />
          </div>
        </div>

        <div className="divider-label">match breakdown</div>
        {Object.entries(app.match_breakdown.components || {}).map(([k, v]) => (
          <div className="breakdown-item" key={k}>
            <div className="bd-top">
              <span className="bd-label">{k.replace(/_/g, ' ')} <span className="mono" style={{ opacity: 0.6 }}>({v.weight_pct}%)</span></span>
              <span className="bd-score">{v.score}%</span>
            </div>
            <div className="bd-bar-track"><div className="bd-bar-fill" style={{ width: `${v.score}%` }} /></div>
            <div className="bd-explain">{v.explanation}</div>
          </div>
        ))}

        <div className="divider-label">AI interview questions</div>
        <ol className="q-list">
          {(app.interview_questions || []).map((q, i) => <li key={i}>{q}</li>)}
        </ol>

        <div className="divider-label">actions</div>
        <div className="row" style={{ gap: 8 }}>
          <button className="secondary small" style={{ margin: 0 }} onClick={onAssignAssessment}>Assign assessment</button>
          <button className="secondary small" style={{ margin: 0 }} onClick={onScheduleInterview}>Schedule interview</button>
        </div>

        <label>Move to stage</label>
        <select value={app.status} onChange={(e) => onMoveStage(e.target.value)}>
          {STAGES.map((s) => <option value={s.key} key={s.key}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ---------------- Schedule interview modal body ---------------- */

function ScheduleModalBody({ onSchedule }) {
  const [type, setType] = useState('technical');
  const [datetime, setDatetime] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const toast = useToast();

  function submit() {
    if (!datetime) { toast('Pick a date & time', 'error'); return; }
    onSchedule({ interview_type: type, scheduled_at: new Date(datetime).toISOString(), meeting_link: link.trim(), notes: notes.trim() });
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14 }}>Schedule interview</h2>
      <label>Interview type</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="technical">Technical</option>
        <option value="hr">HR</option>
        <option value="behavioral">Behavioral</option>
      </select>
      <label>Date &amp; time</label>
      <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
      <label>Meeting link (optional)</label>
      <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/..." />
      <label>Notes (optional)</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Panel, focus areas, etc." style={{ minHeight: 70 }} />
      <button style={{ width: '100%' }} onClick={submit}>Schedule</button>
    </div>
  );
}

/* ---------------- Assign assessment modal body ---------------- */

function AssignModalBody({ jobId, onAssignExisting, onGenerateNew }) {
  const [assessments, setAssessments] = useState(null);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    apiRequest(`/assessments/job/${jobId}`).then((data) => {
      setAssessments(data);
      if (data.length > 0) setSelectedId(String(data[0].id));
    }).catch(() => setAssessments([]));
  }, [jobId]);

  if (assessments === null) return <div className="muted">Loading...</div>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 14 }}>Assign assessment</h2>
      {assessments.length === 0 ? (
        <>
          <p className="muted" style={{ fontSize: 13 }}>No assessment exists for this job yet. Generate one automatically from the job's required skills:</p>
          <button style={{ width: '100%' }} onClick={onGenerateNew}>Generate AI assessment &amp; assign</button>
        </>
      ) : (
        <>
          <label>Choose an assessment</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {assessments.map((a) => (
              <option value={a.id} key={a.id}>{a.title} ({a.questions.length} questions)</option>
            ))}
          </select>
          <button style={{ width: '100%' }} onClick={() => onAssignExisting(selectedId)}>Assign to candidate</button>
          <div className="divider-label">or</div>
          <button className="secondary" style={{ width: '100%' }} onClick={onGenerateNew}>Generate a new AI assessment</button>
        </>
      )}
    </div>
  );
}

/* ---------------- Main Pipeline page ---------------- */

export default function Pipeline() {
  const [job, setJob] = useState(null); // { id, title }
  const [apps, setApps] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [detailAppId, setDetailAppId] = useState(null);
  const [scheduleAppId, setScheduleAppId] = useState(null);
  const [assignAppId, setAssignAppId] = useState(null);
  const toast = useToast();

  const selectJob = useCallback(async (jobId, jobTitle) => {
    setJob({ id: jobId, title: jobTitle });
    setApps(null);
    try {
      const data = await apiRequest(`/jobs/${jobId}/applicants`);
      setApps(data);
    } catch (e) {
      toast(e.message, 'error');
    }
  }, [toast]);

  function updateAppLocally(appId, patch) {
    setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, ...patch } : a)));
  }

  async function handleDrop(newStatus) {
    if (draggedId == null) return;
    const app = apps.find((a) => a.id === draggedId);
    if (!app || app.status === newStatus) { setDraggedId(null); return; }
    const prevStatus = app.status;
    updateAppLocally(draggedId, { status: newStatus });
    try {
      await apiRequest(`/applications/${draggedId}/status`, { method: 'PATCH', body: { status: newStatus } });
      toast(`Moved to ${newStatus.replace('_', ' ')}`, 'success', 2200);
    } catch (err) {
      updateAppLocally(draggedId, { status: prevStatus });
      toast('Could not update status: ' + err.message, 'error');
    }
    setDraggedId(null);
  }

  async function moveStage(appId, status) {
    const app = apps.find((a) => a.id === appId);
    const prev = app.status;
    updateAppLocally(appId, { status });
    try {
      await apiRequest(`/applications/${appId}/status`, { method: 'PATCH', body: { status } });
      toast(`Moved to ${status.replace('_', ' ')}`, 'success', 2200);
      setDetailAppId(null);
    } catch (e) {
      updateAppLocally(appId, { status: prev });
      toast('Could not update: ' + e.message, 'error');
    }
  }

  async function scheduleInterview(payload) {
    try {
      await apiRequest('/interviews', { method: 'POST', body: { application_id: scheduleAppId, ...payload } });
      toast('Interview scheduled', 'success');
      updateAppLocally(scheduleAppId, { status: 'interview' });
      setScheduleAppId(null);
      setDetailAppId(null);
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function assignExisting(assessmentId) {
    try {
      await apiRequest(`/assessments/${assessmentId}/assign`, { method: 'POST', body: { application_id: assignAppId } });
      finishAssign();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function generateAndAssign() {
    try {
      const assessment = await apiRequest('/assessments', {
        method: 'POST',
        body: { job_id: job.id, title: `${job.title} — Skills Assessment`, auto_generate: true, num_questions: 20 },
      });
      await apiRequest(`/assessments/${assessment.id}/assign`, { method: 'POST', body: { application_id: assignAppId } });
      finishAssign();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  function finishAssign() {
    toast('Assessment assigned', 'success');
    updateAppLocally(assignAppId, { status: 'assessment' });
    setAssignAppId(null);
    setDetailAppId(null);
  }

  const detailApp = apps?.find((a) => a.id === detailAppId);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Pipeline</div>
        <h1 className="page-title">Jobs &amp; pipeline</h1>
        <p className="page-sub">Select a job to see candidates ranked by AI match score. Drag cards between stages to update status.</p>
      </div>

      <JobList onSelect={selectJob} />

      {job && (
        <div>
          <div className="page-header" style={{ marginTop: 10 }}>
            <h2 className="page-title" style={{ fontSize: 18 }}>Pipeline — {job.title}</h2>
          </div>
          <div className="kanban">
            {apps === null
              ? STAGES.map((s) => (
                  <div className="kanban-col" key={s.key}>
                    <div className="kanban-col-head"><span className="plat">{s.platform}</span></div>
                    <div className="kanban-cards"><div className="skeleton" style={{ height: 70 }} /></div>
                  </div>
                ))
              : STAGES.map((s) => (
                  <KanbanColumn
                    key={s.key}
                    stage={s}
                    apps={apps.filter((a) => a.status === s.key)}
                    onDrop={handleDrop}
                    onDragStart={(e, id) => setDraggedId(id)}
                    onDragEnd={() => {}}
                    onCardClick={setDetailAppId}
                  />
                ))}
          </div>
        </div>
      )}

      <Modal open={!!detailApp} onClose={() => setDetailAppId(null)}>
        {detailApp && (
          <DetailModalBody
            app={detailApp}
            onMoveStage={(status) => moveStage(detailApp.id, status)}
            onAssignAssessment={() => setAssignAppId(detailApp.id)}
            onScheduleInterview={() => setScheduleAppId(detailApp.id)}
          />
        )}
      </Modal>

      <Modal open={scheduleAppId !== null} onClose={() => setScheduleAppId(null)} maxWidth={420}>
        <ScheduleModalBody onSchedule={scheduleInterview} />
      </Modal>

      <Modal open={assignAppId !== null} onClose={() => setAssignAppId(null)} maxWidth={420}>
        {job && assignAppId !== null && (
          <AssignModalBody jobId={job.id} onAssignExisting={assignExisting} onGenerateNew={generateAndAssign} />
        )}
      </Modal>
    </div>
  );
}

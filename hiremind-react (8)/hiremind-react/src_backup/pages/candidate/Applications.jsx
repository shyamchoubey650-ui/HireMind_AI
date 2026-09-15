import { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import ScoreRing from '../../components/ScoreRing';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';

function BreakdownBar({ label, data }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(data.score), 80);
    return () => clearTimeout(t);
  }, [data.score]);

  return (
    <div className="breakdown-item">
      <div className="bd-top">
        <span className="bd-label">{label.replace(/_/g, ' ')} <span className="mono" style={{ opacity: 0.6 }}>({data.weight_pct}% weight)</span></span>
        <span className="bd-score">{data.score}%</span>
      </div>
      <div className="bd-bar-track"><div className="bd-bar-fill" style={{ width: `${width}%` }} /></div>
      <div className="bd-explain">{data.explanation}</div>
    </div>
  );
}

function ApplicationCard({ app }) {
  return (
    <div className="card compact tight" style={{ marginBottom: 10 }}>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Job #{app.job_id}</div>
          <span className={`status-pill status-${app.status}`} style={{ marginTop: 4, display: 'inline-block' }}>{app.status}</span>
        </div>
        <ScoreRing pct={app.match_score} size={46} stroke={4} />
      </div>

      <div className="grid-2" style={{ marginTop: 8 }}>
        <div>
          <div className="muted mono" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Matched skills</div>
          <SkillTags skills={app.matched_skills} cls="matched tight" />
        </div>
        <div>
          <div className="muted mono" style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Missing skills</div>
          <SkillTags skills={app.missing_skills} cls="missing tight" />
        </div>
      </div>

      <details style={{ marginTop: 8 }}>
        <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          ▾ Why this score, and practice interview questions
        </summary>
        <div style={{ marginTop: 10 }}>
          {Object.entries(app.match_breakdown.components || {}).map(([k, v]) => (
            <BreakdownBar key={k} label={k} data={v} />
          ))}
          <div className="divider-label">AI-generated interview questions</div>
          <ol className="q-list">
            {(app.interview_questions || []).map((q, i) => <li key={i}>{q}</li>)}
          </ol>
        </div>
      </details>
    </div>
  );
}

export default function Applications() {
  const [apps, setApps] = useState(null);

  useEffect(() => {
    apiRequest('/applications/mine').then(setApps).catch(() => setApps([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Step 3 of 3</div>
        <h1 className="page-title">My applications</h1>
        <p className="page-sub">Track your stage in the pipeline, see exactly why you scored that way, and practice with AI-generated interview questions.</p>
      </div>

      {apps === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {apps && apps.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="applications" size={22} /></div>
          <div className="es-title">No applications yet</div>
          <div className="es-sub">Browse open roles and apply to see your AI match score.</div>
        </div>
      )}

      {apps && apps.length > 0 && (
        apps.map((app) => <ApplicationCard app={app} key={app.id} />)
      )}
    </div>
  );
}

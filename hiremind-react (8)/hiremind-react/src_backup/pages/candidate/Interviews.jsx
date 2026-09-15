import { useState, useEffect } from 'react';
import { apiRequest } from '../../api';
import Icon from '../../components/Icon';

export default function Interviews() {
  const [interviews, setInterviews] = useState(null);

  useEffect(() => {
    apiRequest('/interviews/mine').then(setInterviews).catch(() => setInterviews([]));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">ATS pipeline</div>
        <h1 className="page-title">Interviews</h1>
        <p className="page-sub">Scheduled interviews across all your applications.</p>
      </div>

      {interviews === null && (<><div className="skeleton sk-row" /><div className="skeleton sk-row" /></>)}

      {interviews && interviews.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="interviews" size={22} /></div>
          <div className="es-title">No interviews scheduled</div>
          <div className="es-sub">Recruiters schedule these once you're shortlisted and screened.</div>
        </div>
      )}

      {interviews && interviews.length > 0 && (
        interviews.map((iv) => {
          const d = new Date(iv.scheduled_at);
          const day = d.getDate();
          const mon = d.toLocaleString('default', { month: 'short' });
          const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div className="card interview-card" key={iv.id}>
              <div className="iv-date"><div className="day">{day}</div><div className="mon">{mon}</div></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5 }}>
                  {iv.interview_type} interview &middot; Job #{iv.job_id}
                </div>
                <div className="muted mono" style={{ fontSize: 11.5, marginTop: 4 }}>
                  {time} &middot; <span className={`status-pill status-${iv.status}`}>{iv.status}</span>
                </div>
                {iv.meeting_link && (
                  <div style={{ marginTop: 6 }}><a href={iv.meeting_link} target="_blank" rel="noreferrer">{iv.meeting_link}</a></div>
                )}
                {iv.notes && <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>{iv.notes}</div>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

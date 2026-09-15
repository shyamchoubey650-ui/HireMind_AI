import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import ChartCanvas from '../../components/ChartCanvas';
import Icon from '../../components/Icon';

const STAGES = [
  { key: 'ai_screening', label: 'AI Screening' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'selected', label: 'Selected' },
  { key: 'rejected', label: 'Rejected' },
];
const COLORS = ['#8a93b8', '#8b7cf6', '#4fb3e8', '#ffb020', '#2dd4bf', '#ef6a56'];

function scoreTier(score) {
  if (score >= 70) return 'tier-high';
  if (score >= 40) return 'tier-mid';
  return 'tier-low';
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [interviews, setInterviews] = useState(null);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    apiRequest('/applications/analytics/overview').then(setData).catch(() => setData(null));
    apiRequest('/interviews/mine').then(setInterviews).catch(() => setInterviews([]));
    apiRequest('/notifications/mine').then((n) => setNotifications(n.slice(0, 6))).catch(() => setNotifications([]));
  }, []);

  const chartConfig = useMemo(() => {
    if (!data) return null;
    const values = STAGES.map((s) => data.status_breakdown[s.key] || 0);
    return {
      type: 'bar',
      data: {
        labels: STAGES.map((s) => s.label),
        datasets: [{ data: values, backgroundColor: COLORS, borderRadius: 6, barThickness: 24 }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8a93b8', font: { family: 'JetBrains Mono', size: 10 } } },
          y: { beginAtZero: true, ticks: { color: '#8a93b8', stepSize: 1, font: { family: 'JetBrains Mono', size: 10.5 } }, grid: { color: '#1c2440' } },
        },
      },
    };
  }, [data]);

  const upcomingInterviews = useMemo(() => {
    if (!interviews) return null;
    const now = Date.now();
    return interviews
      .filter((iv) => new Date(iv.scheduled_at).getTime() >= now && iv.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  }, [interviews]);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Live</div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-sub">Aggregate performance across every job you've posted.</p>
      </div>

      {!data && (
        <div className="grid-4">
          <div className="card skeleton" style={{ height: 96 }} />
          <div className="card skeleton" style={{ height: 96 }} />
          <div className="card skeleton" style={{ height: 96 }} />
          <div className="card skeleton" style={{ height: 96 }} />
        </div>
      )}

      {data && (
        <>
          <div className="grid-4">
            <div className="card stat-box-row">
              <div className="icon-badge lg violet"><Icon name="briefcase" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Total jobs</div>
                <div className="stat-num">{data.total_jobs}</div>
                <div className="stat-delta">{data.open_jobs} open</div>
              </div>
            </div>
            <div className="card stat-box-row">
              <div className="icon-badge lg teal"><Icon name="applications" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Applications</div>
                <div className="stat-num">{data.total_applications}</div>
              </div>
            </div>
            <div className="card stat-box-row">
              <div className="icon-badge lg"><Icon name="zap" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Avg. AI match score</div>
                <div className="stat-num">{data.avg_match_score}%</div>
              </div>
            </div>
            <div className="card stat-box-row">
              <div className="icon-badge lg rust"><Icon name="applications" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Selected</div>
                <div className="stat-num">{data.status_breakdown.selected || 0}</div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card" style={{ paddingBottom: 12 }}>
              <h2>Applications by stage</h2>
              {chartConfig && <ChartCanvas config={chartConfig} height={150} />}
            </div>

            <div className="card">
              <h2>Top candidates by match score</h2>
              {data.top_candidates.length === 0 ? (
                <div className="empty-state">
                  <div className="es-icon"><Icon name="analytics" size={22} /></div>
                  <div className="es-title">No applications yet</div>
                  <div className="es-sub">Post a job to start receiving AI-scored candidates.</div>
                </div>
              ) : (
                <div className="scroll-panel" style={{ maxHeight: 200 }}>
                  {data.top_candidates.map((c, i) => (
                    <div className="ranked-bar-row" key={c.application_id}>
                      <div className="ranked-bar-label">
                        <span className="mono">#{i + 1}</span> Application {c.application_id} &middot; Job {c.job_id}
                      </div>
                      <div className="ranked-bar-track">
                        <div
                          className={`ranked-bar-fill ${scoreTier(c.match_score)}`}
                          style={{ width: `${c.match_score}%` }}
                        />
                      </div>
                      <span className="ranked-bar-value mono">{c.match_score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2>Upcoming interviews</h2>
              {upcomingInterviews === null && <div className="skeleton sk-row" />}
              {upcomingInterviews && upcomingInterviews.length === 0 && (
                <div className="empty-state">
                  <div className="es-icon"><Icon name="interviews" size={22} /></div>
                  <div className="es-title">Nothing scheduled</div>
                  <div className="es-sub">Interviews you schedule from the pipeline will show up here.</div>
                </div>
              )}
              {upcomingInterviews && upcomingInterviews.length > 0 && (
                <div className="scroll-panel" style={{ maxHeight: 280 }}>
                  {upcomingInterviews.map((iv) => {
                    const d = new Date(iv.scheduled_at);
                    return (
                      <div className="interview-card" style={{ marginBottom: 10 }} key={iv.id}>
                        <div className="iv-date">
                          <div className="day">{d.getDate()}</div>
                          <div className="mon">{d.toLocaleString('default', { month: 'short' })}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5 }}>
                            {iv.interview_type} interview &middot; Job #{iv.job_id}
                          </div>
                          <div className="muted mono" style={{ fontSize: 11 }}>
                            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &middot; Candidate {iv.candidate_id}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card">
              <h2>Recent activity</h2>
              {notifications === null && <div className="skeleton sk-row" />}
              {notifications && notifications.length === 0 && (
                <div className="empty-state">
                  <div className="es-icon"><Icon name="bell" size={22} /></div>
                  <div className="es-title">No activity yet</div>
                </div>
              )}
              {notifications && notifications.length > 0 && (
                <div className="scroll-panel" style={{ maxHeight: 280 }}>
                  {notifications.map((n) => (
                    <div className="activity-row" key={n.id}>
                      <div className="icon-badge" style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0 }}>
                        <Icon name={n.type === 'interview' ? 'interviews' : n.type === 'assessment' ? 'assessments' : 'applications'} size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5 }}>{n.message}</div>
                        <div className="muted mono" style={{ fontSize: 10.5, marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

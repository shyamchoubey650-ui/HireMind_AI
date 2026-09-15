import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import ChartCanvas from '../../components/ChartCanvas';
import Odometer from '../../components/Odometer';
import Icon from '../../components/Icon';

const STAGES = [
  { key: 'ai_screening', label: 'AI Screening' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'interview', label: 'Interview' },
  { key: 'selected', label: 'Selected' },
  { key: 'rejected', label: 'Rejected' },
];
const STAGE_COLORS = ['#8a93b8', '#8b7cf6', '#4fb3e8', '#ffb020', '#2dd4bf', '#ef6a56'];

export default function Overview() {
  const [data, setData] = useState(null);
  const [topJobs, setTopJobs] = useState(null);

  useEffect(() => {
    apiRequest('/admin/analytics/overview').then(setData).catch(() => setData(null));
    apiRequest('/admin/jobs').then((jobs) => {
      const sorted = [...jobs].sort((a, b) => b.applications_count - a.applications_count).slice(0, 6);
      setTopJobs(sorted);
    }).catch(() => setTopJobs([]));
  }, []);

  const stageChartConfig = useMemo(() => {
    if (!data) return null;
    const values = STAGES.map((s) => data.status_breakdown[s.key] || 0);
    const hasData = values.some((v) => v > 0);
    return {
      type: 'doughnut',
      data: {
        labels: STAGES.map((s) => s.label),
        datasets: [{ data: hasData ? values : [1], backgroundColor: hasData ? STAGE_COLORS : ['#1c2440'], borderWidth: 0 }],
      },
      options: {
        plugins: {
          legend: { position: 'right', labels: { color: '#8a93b8', font: { family: 'Inter', size: 10 }, boxWidth: 8, padding: 8 } },
          tooltip: { enabled: hasData },
        },
        cutout: '68%',
      },
    };
  }, [data]);

  const roleChartConfig = useMemo(() => {
    if (!data) return null;
    const hasData = (data.total_candidates + data.total_recruiters) > 0;
    return {
      type: 'bar',
      data: {
        labels: ['Candidates', 'Recruiters'],
        datasets: [{
          data: hasData ? [data.total_candidates, data.total_recruiters] : [0, 0],
          backgroundColor: ['#2dd4bf', '#ffb020'],
          borderRadius: 8, barThickness: 46,
        }],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, ticks: { color: '#8a93b8', stepSize: 1, font: { family: 'JetBrains Mono', size: 10.5 } }, grid: { color: '#1c2440' } },
          y: { ticks: { color: '#8a93b8', font: { family: 'Inter', size: 12 } }, grid: { display: false } },
        },
      },
    };
  }, [data]);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Platform-wide &middot; live</div>
        <h1 className="page-title">Overview</h1>
        <p className="page-sub">Aggregate stats across every recruiter, job, and candidate on HireMind AI.</p>
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
              <div className="icon-badge lg"><Icon name="users" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Total users</div>
                <div className="stat-num"><Odometer value={data.total_users} /></div>
                <div className="stat-delta">{data.total_candidates} candidates &middot; {data.total_recruiters} recruiters</div>
              </div>
            </div>
            <div className="card stat-box-row">
              <div className="icon-badge lg violet"><Icon name="briefcase" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Jobs posted</div>
                <div className="stat-num"><Odometer value={data.total_jobs} /></div>
                <div className="stat-delta">{data.open_jobs} open</div>
              </div>
            </div>
            <div className="card stat-box-row">
              <div className="icon-badge lg teal"><Icon name="applications" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Applications</div>
                <div className="stat-num"><Odometer value={data.total_applications} /></div>
                <div className="stat-delta">avg match {data.avg_match_score}%</div>
              </div>
            </div>
            <div className="card stat-box-row">
              <div className="icon-badge lg rust"><Icon name="interviews" size={22} /></div>
              <div className="stat-body">
                <div className="stat-label">Interviews scheduled</div>
                <div className="stat-num"><Odometer value={data.total_interviews} /></div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card" style={{ paddingBottom: 12 }}>
              <h2>Applications by stage</h2>
              {stageChartConfig && <ChartCanvas config={stageChartConfig} height={150} />}
            </div>
            <div className="card" style={{ paddingBottom: 12 }}>
              <h2>User composition</h2>
              {roleChartConfig && <ChartCanvas config={roleChartConfig} height={150} />}
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h2>Top jobs by applicants</h2>
              {topJobs === null && <div className="skeleton sk-row" />}
              {topJobs && topJobs.length === 0 && (
                <div className="empty-state">
                  <div className="es-icon"><Icon name="briefcase" size={22} /></div>
                  <div className="es-title">No jobs posted yet</div>
                </div>
              )}
              {topJobs && topJobs.length > 0 && (
                <div className="scroll-panel" style={{ maxHeight: 190 }}>
                  {topJobs.map((j) => {
                    const max = Math.max(...topJobs.map((t) => t.applications_count), 1);
                    return (
                      <div className="ranked-bar-row" key={j.id}>
                        <div className="ranked-bar-label">{j.title} <span className="muted mono" style={{ fontSize: 10.5 }}>by {j.recruiter_name || 'unknown'}</span></div>
                        <div className="ranked-bar-track">
                          <div className="ranked-bar-fill tier-high" style={{ width: `${(j.applications_count / max) * 100}%` }} />
                        </div>
                        <span className="ranked-bar-value mono">{j.applications_count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card">
              <h2>Platform activity</h2>
              <div className="row" style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span className="muted">Assessments assigned</span><span className="mono">{data.total_assessments_assigned}</span>
              </div>
              <div className="row" style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span className="muted">Interviews scheduled</span><span className="mono">{data.total_interviews}</span>
              </div>
              <div className="row" style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <span className="muted">Candidates currently in pipeline</span>
                <span className="mono">{Object.values(data.status_breakdown).reduce((a, b) => a + b, 0)}</span>
              </div>
              <div className="row" style={{ padding: '9px 0' }}>
                <span className="muted">Avg. AI match score</span><span className="mono">{data.avg_match_score}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

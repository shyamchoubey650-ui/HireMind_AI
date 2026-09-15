import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';

export default function AllJobs() {
  const [jobs, setJobs] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiRequest('/admin/jobs').then(setJobs).catch(() => setJobs([]));
  }, []);

  const filtered = useMemo(() => {
    if (!jobs) return [];
    const s = search.toLowerCase().trim();
    if (!s) return jobs;
    return jobs.filter((j) =>
      j.title.toLowerCase().includes(s) ||
      j.recruiter_name.toLowerCase().includes(s) ||
      (j.required_skills || []).some((sk) => sk.toLowerCase().includes(s))
    );
  }, [jobs, search]);

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Moderation</div>
        <h1 className="page-title">All job postings</h1>
        <p className="page-sub">Every job posted by every recruiter on the platform, with live applicant stats.</p>
      </div>

      <input
        type="text" placeholder="Search by title, skill, or recruiter..." style={{ marginBottom: 16 }}
        value={search} onChange={(e) => setSearch(e.target.value)}
      />

      {jobs === null && (<><div className="skeleton sk-row" /><div className="skeleton sk-row" /></>)}

      {jobs && filtered.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="building" size={22} /></div>
          <div className="es-title">{jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your search'}</div>
        </div>
      )}

      {jobs && filtered.length > 0 && (
        filtered.map((j) => (
          <div className="listing-row compact" key={j.id}>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5 }}>{j.title}</div>
                <div className="muted mono" style={{ fontSize: 10.5, marginTop: 3 }}>
                  {j.location} &middot; <span className={`status-pill status-${j.status === 'open' ? 'selected' : 'rejected'}`}>{j.status}</span> &middot; min {j.min_experience} yrs
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 5 }}>
                  Posted by <strong>{j.recruiter_name || 'Unknown recruiter'}</strong>
                  {j.recruiter_email && <span className="mono" style={{ opacity: 0.7 }}> ({j.recruiter_email})</span>}
                </div>
              </div>
              <div className="row" style={{ gap: 14 }}>
                <div className="stat-box" style={{ textAlign: 'center' }}>
                  <div className="stat-num" style={{ fontSize: 17 }}>{j.applications_count ?? 0}</div>
                  <div className="stat-label" style={{ fontSize: 9 }}>applicants</div>
                </div>
                <div className="stat-box" style={{ textAlign: 'center' }}>
                  <div className="stat-num" style={{ fontSize: 17, color: 'var(--teal)' }}>
                    {typeof j.avg_match_score === 'number' ? `${j.avg_match_score}%` : '—'}
                  </div>
                  <div className="stat-label" style={{ fontSize: 9 }}>avg match</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 7 }}><SkillTags skills={j.required_skills} /></div>
          </div>
        ))
      )}
    </div>
  );
}

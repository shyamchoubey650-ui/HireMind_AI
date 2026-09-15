import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';

export default function Jobs() {
  const [jobs, setJobs] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  async function loadJobs() {
    try {
      const data = await apiRequest('/jobs');
      setJobs(data);
    } catch (e) {
      toast(e.message, 'error');
      setJobs([]);
    }
  }

  useEffect(() => { loadJobs(); }, []);

  async function applyToJob(jobId) {
    setApplyingId(jobId);
    try {
      await apiRequest('/applications', { method: 'POST', body: { job_id: jobId } });
      toast('Applied — AI match score computed', 'success');
      navigate('/candidate/applications');
    } catch (e) {
      toast('Could not apply: ' + e.message, 'error');
      setApplyingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Step 2 of 3</div>
        <h1 className="page-title">Open roles</h1>
        <p className="page-sub">Apply and the AI instantly computes an explainable match score against your parsed profile.</p>
      </div>

      {jobs === null && (
        <>
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
          <div className="skeleton sk-row" />
        </>
      )}

      {jobs && jobs.length === 0 && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="briefcase" size={22} /></div>
          <div className="es-title">No open roles yet</div>
          <div className="es-sub">Check back soon — recruiters are posting new positions.</div>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        jobs.map((j) => (
          <div className="listing-row compact" key={j.id}>
            <div className="row">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{j.title}</div>
                <div className="muted mono" style={{ fontSize: 10.5, marginTop: 3 }}>{j.location} &middot; min {j.min_experience} yrs experience</div>
              </div>
              <button className="small" disabled={applyingId === j.id} onClick={() => applyToJob(j.id)}>
                {applyingId === j.id ? 'Matching...' : 'Apply'}
              </button>
            </div>
            <p className="muted" style={{ margin: '8px 0 6px', fontSize: 12, lineHeight: 1.45 }}>
              {j.description.length > 150 ? j.description.slice(0, 150) + '…' : j.description}
            </p>
            <div><SkillTags skills={j.required_skills} /></div>
          </div>
        ))
      )}
    </div>
  );
}

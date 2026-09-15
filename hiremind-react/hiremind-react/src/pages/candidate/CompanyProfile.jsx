import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import Icon from '../../components/Icon';
import ScoreRing from '../../components/ScoreRing';
import SkillTags from '../../components/SkillTags';
import { getJobVisual } from '../../lib/jobVisual';

// Experience Level filter, backed by the real Job.min_experience column
// (via the min_experience_gte / max_experience params added to GET
// /api/jobs). No Industry / Work Mode / Job Type / Salary Range filters
// here — none of those exist anywhere in the schema, so rather than show
// filter controls that silently do nothing, they're simply not built.
const EXPERIENCE_FILTERS = [
  { key: 'all', label: 'All levels' },
  { key: 'entry', label: 'Entry (0–2 yrs)', gte: 0, lte: 2 },
  { key: 'mid', label: 'Mid (2–5 yrs)', gte: 2, lte: 5 },
  { key: 'senior', label: 'Senior (5+ yrs)', gte: 5, lte: undefined },
];

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function CompanyProfile() {
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [company, setCompany] = useState(undefined); // undefined = loading, null = not found
  const [jobs, setJobs] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [candidateProfile, setCandidateProfile] = useState(null);

  const [jobSearchInput, setJobSearchInput] = useState('');
  const [debouncedJobSearch, setDebouncedJobSearch] = useState('');
  const [experienceKey, setExperienceKey] = useState('all');

  const [selectedJob, setSelectedJob] = useState(null);
  const [applyStep, setApplyStep] = useState('details'); // details | confirm | submitting | success
  const [applyResult, setApplyResult] = useState(null);

  const jobsSectionRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/companies/${companyId}`)
      .then((data) => { if (!cancelled) setCompany(data); })
      .catch(() => { if (!cancelled) setCompany(null); });
    return () => { cancelled = true; };
  }, [companyId]);

  useEffect(() => {
    apiRequest('/applications/mine')
      .then((apps) => setAppliedJobIds(new Set((apps || []).map((a) => a.job_id))))
      .catch(() => {});
    apiRequest('/candidates/me/profile').then(setCandidateProfile).catch(() => {});
  }, []);

  useEffect(() => {
    if (jobs && searchParams.get('focus') === 'jobs' && jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [jobs, searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedJobSearch(jobSearchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [jobSearchInput]);

  const loadJobs = useCallback(async () => {
    setJobs(null);
    try {
      const filter = EXPERIENCE_FILTERS.find((f) => f.key === experienceKey);
      const qs = new URLSearchParams({ recruiter_id: companyId });
      if (debouncedJobSearch) qs.set('search', debouncedJobSearch);
      if (filter?.gte !== undefined) qs.set('min_experience_gte', String(filter.gte));
      if (filter?.lte !== undefined) qs.set('max_experience', String(filter.lte));
      const data = await apiRequest(`/jobs?${qs.toString()}`);
      setJobs(data);
    } catch (e) {
      toast(e.message, 'error');
      setJobs([]);
    }
  }, [companyId, debouncedJobSearch, experienceKey, toast]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  function openJobDetails(job) {
    setSelectedJob(job);
    setApplyStep('details');
    setApplyResult(null);
  }

  function openJobToApply(job) {
    setSelectedJob(job);
    setApplyStep('confirm');
    setApplyResult(null);
  }

  function closeModal() {
    setSelectedJob(null);
  }

  async function submitApplication() {
    if (!selectedJob) return;
    setApplyStep('submitting');
    try {
      // Same endpoint, same payload shape, as the existing Browse Jobs
      // apply flow (Jobs.jsx) -- no parallel application system.
      const app = await apiRequest('/applications', { method: 'POST', body: { job_id: selectedJob.id } });
      setApplyResult(app);
      setAppliedJobIds((prev) => new Set(prev).add(selectedJob.id));
      setApplyStep('success');
    } catch (e) {
      toast('Could not apply: ' + e.message, 'error');
      setApplyStep('confirm');
    }
  }

  function jobButtonState(job) {
    if (job.status !== 'open') return 'closed';
    if (appliedJobIds.has(job.id)) return 'applied';
    return 'open';
  }

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .aesthetic-search-wrapper {
          background: linear-gradient(135deg, rgba(22, 16, 42, 0.8) 0%, rgba(10, 12, 26, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.06), 0 8px 30px rgba(0, 0, 0, 0.4);
          border-radius: 18px;
          padding: 16px 20px;
          margin-bottom: 18px;
          box-sizing: border-box;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          backdrop-filter: blur(12px);
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
          padding: 12px 42px 12px 48px;
          color: #fff;
          font-size: 13.5px;
          box-sizing: border-box;
          outline: none;
          font-family: Inter, sans-serif;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          height: 46px;
        }
        .aesthetic-search-input-box input:focus {
          border-color: rgba(168, 85, 247, 0.9);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.3);
        }
        .aesthetic-search-icon-badge {
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          pointer-events: none;
        }

        .company-profile-header {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.7) 0%, rgba(8, 10, 22, 0.95) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          border-radius: 20px;
          padding: 26px;
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 24px;
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .experience-pill-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .experience-pill {
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-family: var(--font-mono);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .experience-pill.active {
          background: var(--primary-grad);
          color: #fff;
          border-color: transparent;
        }
        .company-job-row {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.4);
          border-radius: 16px;
          padding: 18px 22px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .apply-state-btn.applied {
          background: var(--panel-raised);
          color: var(--teal);
          border: 1px solid rgba(45, 212, 191, 0.4);
          box-shadow: none;
          cursor: default;
        }
        .apply-state-btn.closed {
          background: var(--panel-raised);
          color: var(--muted);
          border: 1px solid var(--line);
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.7;
        }

        @media (max-width: 700px) {
          .company-job-row { flex-direction: column; align-items: flex-start !important; }
          .company-job-row > div:last-child { width: 100%; }
          .company-job-row > div:last-child button { flex: 1; }
          .company-profile-header { flex-direction: column; text-align: center; }
        }
      `}</style>

      <button type="button" className="secondary small" style={{ marginBottom: 18 }} onClick={() => navigate('/candidate/companies')}>
        &larr; Back to companies
      </button>

      {company === undefined && <div className="skeleton sk-row" style={{ height: 110 }} />}

      {company === null && (
        <div className="card empty-state">
          <div className="es-icon"><Icon name="building" size={22} /></div>
          <div className="es-title">Company not found</div>
          <div className="es-sub">It may have been removed, or no longer has any postings.</div>
        </div>
      )}

      {company && (
        <>
          <div className="company-profile-header">
            <div className="icon-badge violet" style={{ width: 64, height: 64, borderRadius: 18, flexShrink: 0 }}>
              <Icon name="building" size={30} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#fff' }}>{company.name}</div>
              <div className="muted mono" style={{ fontSize: 12, marginTop: 4 }}>
                On HireMind since {formatDate(company.member_since)} &middot; {company.open_jobs_count} open position{company.open_jobs_count === 1 ? '' : 's'} &middot; {company.total_jobs_count} posted in total
              </div>
            </div>
          </div>

          <div ref={jobsSectionRef}>
            <div className="page-header" style={{ marginBottom: 18 }}>
              <h2 className="page-title" style={{ fontSize: 22 }}>Open <span className="hl">Positions</span></h2>
            </div>

            <div className="aesthetic-search-wrapper">
              <div className="aesthetic-search-input-box">
                <span className="aesthetic-search-icon-badge"><Icon name="search" size={14} /></span>
                <input
                  type="text"
                  placeholder="Search this company's jobs by title or skill..."
                  value={jobSearchInput}
                  onChange={(e) => setJobSearchInput(e.target.value)}
                />
              </div>
            </div>

            <div className="experience-pill-row">
              {EXPERIENCE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`experience-pill${experienceKey === f.key ? ' active' : ''}`}
                  onClick={() => setExperienceKey(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {jobs === null && (<><div className="skeleton sk-row" /><div className="skeleton sk-row" /></>)}

            {jobs && jobs.length === 0 && (
              <div className="card empty-state">
                <div className="es-icon"><Icon name="briefcase" size={22} /></div>
                <div className="es-title">No active jobs available for this company.</div>
              </div>
            )}

            {jobs && jobs.map((job) => {
              const { icon, color } = getJobVisual(job.title);
              const state = jobButtonState(job);
              return (
                <div className="company-job-row" key={job.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <div className={`icon-badge ${color}`} style={{ width: 48, height: 48, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={icon} size={20} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, color: '#f8fafc' }}>{job.title}</div>
                      <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>
                        {job.location} &middot; min {job.min_experience} yrs &middot; posted {formatDate(job.created_at)}
                      </div>
                      <div style={{ marginTop: 6 }}><SkillTags skills={job.required_skills} /></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button type="button" className="secondary small" onClick={() => openJobDetails(job)}>View Details</button>
                    {state === 'open' && <button type="button" className="small" onClick={() => openJobToApply(job)}>Apply Now</button>}
                    {state === 'applied' && <button type="button" className="small apply-state-btn applied" disabled>Already Applied</button>}
                    {state === 'closed' && <button type="button" className="small apply-state-btn closed" disabled>Application Closed</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal open={!!selectedJob} onClose={closeModal} maxWidth={520}>
        {selectedJob && applyStep === 'details' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: '#fff', margin: '0 0 6px' }}>{selectedJob.title}</h2>
            <div className="muted mono" style={{ fontSize: 12, marginBottom: 16 }}>
              {company?.name} &middot; {selectedJob.location} &middot; min {selectedJob.min_experience} yrs experience
            </div>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6, color: '#cbd5e1' }}>{selectedJob.description}</p>
            <div style={{ margin: '14px 0' }}><SkillTags skills={selectedJob.required_skills} /></div>
            {jobButtonState(selectedJob) === 'open' && (
              <button type="button" style={{ width: '100%' }} onClick={() => setApplyStep('confirm')}>Apply Now</button>
            )}
            {jobButtonState(selectedJob) === 'applied' && (
              <button type="button" style={{ width: '100%' }} className="secondary" disabled>Already Applied</button>
            )}
            {jobButtonState(selectedJob) === 'closed' && (
              <button type="button" style={{ width: '100%' }} className="secondary" disabled>Application Closed</button>
            )}
          </div>
        )}

        {selectedJob && applyStep === 'confirm' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', margin: '0 0 16px' }}>Review your application</h2>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 12, padding: 16, fontSize: 13, color: '#cbd5e1', marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Name:</strong> {user?.full_name}</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Email:</strong> {user?.email}</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Phone:</strong> {candidateProfile?.phone || 'Not provided'}</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Resume:</strong> {candidateProfile?.resume_filename || 'None uploaded'}</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Education:</strong> {candidateProfile?.education || 'Not provided'}</div>
              <div><strong style={{ color: '#a78bfa' }}>Skills:</strong> {(candidateProfile?.skills || []).join(', ') || 'None on file'}</div>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16, fontSize: 13.5, color: '#cbd5e1' }}>
              You are applying for<br />
              <strong style={{ color: '#fff', fontSize: 16 }}>{selectedJob.title}</strong><br />
              at <strong style={{ color: '#a78bfa' }}>{company?.name}</strong>
            </div>
            <button type="button" style={{ width: '100%' }} onClick={submitApplication}>Submit Application</button>
          </div>
        )}

        {selectedJob && applyStep === 'submitting' && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>Submitting application...</div>
        )}

        {selectedJob && applyStep === 'success' && applyResult && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <ScoreRing pct={applyResult.match_score} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff', margin: '0 0 16px' }}>Application Submitted Successfully</h2>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: 12, padding: 16, fontSize: 13, color: '#cbd5e1', marginBottom: 20, textAlign: 'left' }}>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Company:</strong> {company?.name}</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Position:</strong> {selectedJob.title}</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#a78bfa' }}>Application ID:</strong> #{applyResult.id}</div>
              <div><strong style={{ color: '#a78bfa' }}>Status:</strong> {applyResult.status.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={() => navigate('/candidate/applications')}>View Application</button>
              <button type="button" className="secondary" onClick={() => navigate('/candidate/applications')}>My Applications</button>
              <button type="button" className="secondary" onClick={() => navigate('/candidate/jobs')}>Browse More Jobs</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

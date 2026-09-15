import { useState } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import SkillTags from '../../components/SkillTags';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [minExp, setMinExp] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [resultSkills, setResultSkills] = useState(null);
  const toast = useToast();

  async function createJob() {
    setError('');
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    try {
      const job = await apiRequest('/jobs', {
        method: 'POST',
        body: { title: title.trim(), location: location.trim() || 'Remote', min_experience: parseFloat(minExp) || 0, description: description.trim() },
      });
      toast(`Job posted: ${job.title}`, 'success');
      setResultSkills(job.required_skills);
      setTitle('');
      setDescription('');
      setMinExp('');
    } catch (e) {
      setError(e.message);
      toast(e.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">New posting</div>
        <h1 className="page-title">Post a job</h1>
        <p className="page-sub">Paste the JD — the AI extracts required skills and infers minimum experience automatically.</p>
      </div>

      <div className="card">
        <label><span className="step-num">1</span>Job title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Engineer" />

        <div className="grid-2">
          <div>
            <label><span className="step-num">2</span>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / Bengaluru / Hybrid" />
          </div>
          <div>
            <label><span className="step-num">3</span>Minimum experience (yrs, optional)</label>
            <input type="number" value={minExp} onChange={(e) => setMinExp(e.target.value)} placeholder="AI infers if left blank" min="0" step="0.5" />
          </div>
        </div>

        <label><span className="step-num">4</span>Job description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Paste the full JD here..." style={{ minHeight: 160 }} />
        <button style={{ width: '100%' }} onClick={createJob}>Post job — AI extracts required skills</button>
        {error && <div className="error">{error}</div>}
      </div>

      {resultSkills && (
        <div className="card">
          <h2>&#10003; Job posted — AI-extracted skills</h2>
          <SkillTags skills={resultSkills} cls="matched" />
        </div>
      )}
    </div>
  );
}

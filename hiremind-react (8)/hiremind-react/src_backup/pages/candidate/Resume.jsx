import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import SkillTags from '../../components/SkillTags';

export default function Resume() {
  const [profile, setProfile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const toast = useToast();

  async function loadProfile() {
    try {
      const data = await apiRequest('/candidates/me/profile');
      if (data.skills && data.skills.length > 0) setProfile(data);
    } catch (_) { /* no profile yet */ }
  }

  useEffect(() => { loadProfile(); }, []);

  function handleFileSelect(files) {
    if (files && files.length) setSelectedFile(files[0]);
  }

  async function uploadFile() {
    setMsg({ type: '', text: '' });
    if (!selectedFile) { setMsg({ type: 'error', text: 'Choose a file first.' }); return; }
    const formData = new FormData();
    formData.append('file', selectedFile);
    setUploading(true);
    try {
      await apiRequest('/candidates/me/resume/upload', { method: 'POST', body: formData, isForm: true });
      toast('Resume parsed successfully', 'success');
      await loadProfile();
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function uploadText() {
    if (!resumeText.trim()) { toast('Paste resume text first.', 'error'); return; }
    try {
      await apiRequest('/candidates/me/resume/text', { method: 'POST', body: { resume_text: resumeText.trim() } });
      toast('Resume parsed successfully', 'success');
      await loadProfile();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Step 1 of 3</div>
        <h1 className="page-title">Upload &amp; parse your resume</h1>
        <p className="page-sub">Drop a file or paste text — the AI extracts skills, years of experience, and education so it can match you against every open role automatically.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Upload file</h2>
          <div
            className={`dropzone${dragActive ? ' drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files); }}
          >
            <div className="dz-icon">↑</div>
            <div className="dz-title">Drop your resume here</div>
            <div className="dz-sub">PDF · DOCX · TXT — or click to browse</div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          {selectedFile && (
            <div className="muted mono" style={{ marginTop: 10, fontSize: 12 }}>Selected: {selectedFile.name}</div>
          )}
          <button style={{ width: '100%' }} onClick={uploadFile} disabled={!selectedFile || uploading}>
            {uploading ? 'Parsing...' : 'Parse resume'}
          </button>
          {msg.text && <div className={msg.type === 'error' ? 'error' : 'success-msg'}>{msg.text}</div>}
        </div>

        <div className="card">
          <h2>Or paste resume text</h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            style={{ minHeight: 150 }}
          />
          <button className="secondary" style={{ width: '100%' }} onClick={uploadText}>Parse pasted text</button>
        </div>
      </div>

      {profile && (
        <div className="card">
          <h2>Parsed profile</h2>
          <div className="grid-3" style={{ marginBottom: 4 }}>
            <div className="stat-box">
              <div className="stat-label">Experience</div>
              <div className="stat-num">{profile.years_experience}<span style={{ fontSize: 16 }}>yrs</span></div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Education</div>
              <div className="stat-num" style={{ fontSize: 18 }}>{profile.education || '—'}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Skills detected</div>
              <div className="stat-num">{profile.skills.length}</div>
            </div>
          </div>
          <div className="divider-label">extracted skills</div>
          <SkillTags skills={profile.skills} cls="matched" />
        </div>
      )}
    </div>
  );
}

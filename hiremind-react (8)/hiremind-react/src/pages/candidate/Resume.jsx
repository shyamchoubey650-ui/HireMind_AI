// import { useState, useEffect, useRef } from 'react';
// import { apiRequest } from '../../api';
// import { useToast } from '../../context/ToastContext';
// import SkillTags from '../../components/SkillTags';
// import Icon from '../../components/Icon';

// export default function Resume() {
//   const [profile, setProfile] = useState(null);
//   const [resumeText, setResumeText] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [msg, setMsg] = useState({ type: '', text: '' });
//   const fileInputRef = useRef(null);
//   const toast = useToast();

//   async function loadProfile() {
//     try {
//       const data = await apiRequest('/candidates/me/profile');
//       if (data.skills && data.skills.length > 0) setProfile(data);
//     } catch (_) { /* no profile yet */ }
//   }
//   useEffect(() => { loadProfile(); }, []);

//   function handleFileSelect(files) {
//     if (files && files.length) setSelectedFile(files[0]);
//   }

//   async function uploadFile() {
//     setMsg({ type: '', text: '' });
//     if (!selectedFile) { setMsg({ type: 'error', text: 'Choose a file first.' }); return; }
//     const formData = new FormData();
//     formData.append('file', selectedFile);
//     setUploading(true);
//     try {
//       await apiRequest('/candidates/me/resume/upload', { method: 'POST', body: formData, isForm: true });
//       toast('Resume parsed successfully', 'success');
//       await loadProfile();
//     } catch (e) {
//       setMsg({ type: 'error', text: e.message });
//       toast(e.message, 'error');
//     } finally {
//       setUploading(false);
//     }
//   }

//   async function uploadText() {
//     if (!resumeText.trim()) { toast('Paste resume text first.', 'error'); return; }
//     try {
//       await apiRequest('/candidates/me/resume/text', { method: 'POST', body: { resume_text: resumeText.trim() } });
//       toast('Resume parsed successfully', 'success');
//       await loadProfile();
//     } catch (e) {
//       toast(e.message, 'error');
//     }
//   }

//   return (
//     <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
//       <style>{`
//         .resume-main-card {
//           background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
//           border: 1.5px solid rgba(139, 92, 246, 0.5);
//           box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.08), 0 8px 30px rgba(0, 0, 0, 0.4);
//           border-radius: 20px;
//           padding: 24px;
//           transition: all 0.2s ease;
//           box-sizing: border-box;
//         }
//         .resume-dropzone {
//           border: 1.5px dashed rgba(249, 115, 22, 0.6);
//           background: rgba(15, 12, 30, 0.4);
//           box-shadow: inset 0 0 15px rgba(249, 115, 22, 0.04);
//           border-radius: 16px;
//           padding: 28px 16px;
//           text-align: center;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }
//         .resume-dropzone:hover, .resume-dropzone.drag-active {
//           border-color: rgba(249, 115, 22, 1);
//           background: rgba(30, 18, 45, 0.6);
//           box-shadow: inset 0 0 20px rgba(249, 115, 22, 0.1);
//         }
//         .gradient-action-btn {
//           background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
//           border: none;
//           color: #ffffff;
//           padding: 12px 20px;
//           border-radius: 12px;
//           font-family: var(--font-display, sans-serif);
//           font-weight: 600;
//           font-size: 14px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           box-shadow: 0 4px 18px rgba(168, 85, 247, 0.35);
//           width: 100%;
//         }
//         .gradient-action-btn:hover:not(:disabled) {
//           opacity: 0.92;
//           transform: translateY(-1px);
//           box-shadow: 0 6px 22px rgba(249, 115, 22, 0.45);
//         }
//         .gradient-action-btn:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }
//         .profile-stat-box {
//           background: linear-gradient(135deg, rgba(18, 22, 45, 0.8) 0%, rgba(10, 12, 24, 0.95) 100%);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           box-shadow: inset 0 0 15px rgba(139, 92, 246, 0.05);
//           border-radius: 14px;
//           padding: 16px;
//           display: flex;
//           align-items: center;
//           gap: 14px;
//         }
//         .resume-grid-2 {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 20px;
//           margin-bottom: 24px;
//         }
//         .profile-stats-grid {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 16px;
//           margin-bottom: 22px;
//         }

//         /* Mobile Breakpoints */
//         @media (max-width: 900px) {
//           .resume-grid-2 {
//             grid-template-columns: 1fr !important;
//           }
//           .profile-stats-grid {
//             grid-template-columns: 1fr !important;
//           }
//         }
//       `}</style>

//       <div className="page-header" style={{ marginBottom: 24 }}>
//         <div className="row" style={{ justifyContent: 'flex-start', gap: 12 }}>
//           <div className="icon-badge violet" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}><Icon name="resume" size={22} /></div>
//           <h1 className="page-title" style={{ fontSize: 'clamp(22px, 5vw, 28px)' }}>Upload & parse your <span className="hl">resume</span></h1>
//         </div>
//         <p className="page-sub" style={{ marginTop: 6 }}>Drop a file or paste text — the AI extracts skills, years of experience, and education so it can match you against every open role automatically.</p>
//       </div>

//       <div className="resume-grid-2">
//         <div className="resume-main-card">
//           <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, marginBottom: 18, color: '#f8fafc' }}>
//             <Icon name="upload" size={18} style={{ color: 'var(--violet)' }} /> Upload file
//           </h2>
//           <div
//             className={`resume-dropzone${dragActive ? ' drag-active' : ''}`}
//             onClick={() => fileInputRef.current?.click()}
//             onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
//             onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
//             onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
//             onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files); }}
//           >
//             <div className="dz-icon" style={{ marginBottom: 8 }}><Icon name="upload" size={32} style={{ color: '#f97316' }} /></div>
//             <div className="dz-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff' }}>Drop your resume here</div>
//             <div className="dz-sub" style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>PDF &middot; DOCX &middot; TXT &mdash; or click to browse</div>
//           </div>
//           <input type="file" ref={fileInputRef} accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
//           {selectedFile && (
//             <div className="muted mono" style={{ marginTop: 12, fontSize: 12, color: '#c084fc', wordBreak: 'break-all' }}>Selected: {selectedFile.name}</div>
//           )}
//           <div style={{ marginTop: 18 }}>
//             <button className="gradient-action-btn" onClick={uploadFile} disabled={!selectedFile || uploading}>
//               <Icon name="upload" size={16} /> {uploading ? 'Parsing...' : 'Parse resume'}
//             </button>
//           </div>
//           {msg.text && <div className={msg.type === 'error' ? 'error' : 'success-msg'} style={{ marginTop: 12 }}>{msg.text}</div>}
//         </div>

//         <div className="resume-main-card">
//           <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, marginBottom: 18, color: '#f8fafc' }}>
//             <Icon name="resume" size={18} style={{ color: 'var(--violet)' }} /> Or paste resume text
//           </h2>
//           <textarea 
//             value={resumeText} 
//             onChange={(e) => setResumeText(e.target.value)} 
//             placeholder="Paste your resume text here..." 
//             style={{ minHeight: 148, background: 'rgba(15, 12, 30, 0.4)', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)', borderRadius: '14px', padding: '14px', color: '#fff', width: '100%', resize: 'vertical', boxSizing: 'border-box' }} 
//           />
//           <div style={{ marginTop: 18 }}>
//             <button className="gradient-action-btn" onClick={uploadText}>
//               <Icon name="sparkles" size={16} /> Parse pasted text
//             </button>
//           </div>
//         </div>
//       </div>

//       {profile && (
//         <div className="resume-main-card">
//           <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, marginBottom: 20, color: '#f8fafc' }}>
//             <div className="icon-badge violet" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="checkCircle" size={16} /></div>
//             Parsed profile
//           </h2>
//           <div className="profile-stats-grid">
//             <div className="profile-stat-box">
//               <div className="icon-badge blue" style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="briefcase" size={18} /></div>
//               <div className="stat-body">
//                 <div className="stat-label" style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Experience</div>
//                 <div className="stat-num" style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>{profile.years_experience}<span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}> yrs</span></div>
//               </div>
//             </div>
//             <div className="profile-stat-box">
//               <div className="icon-badge teal" style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="checkCircle" size={18} /></div>
//               <div className="stat-body" style={{ width: '100%', minWidth: 0 }}>
//                 <div className="stat-label" style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Education</div>
//                 <div className="stat-num" style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.education || '—'}</div>
//               </div>
//             </div>
//             <div className="profile-stat-box">
//               <div className="icon-badge amber" style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="spark" size={18} /></div>
//               <div className="stat-body">
//                 <div className="stat-label" style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skills detected</div>
//                 <div className="stat-num" style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>{profile.skills.length}</div>
//               </div>
//             </div>
//           </div>
//           <div className="divider-label" style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>extracted skills</div>
//           <SkillTags skills={profile.skills} cls="matched" />
//         </div>
//       )}
//     </div>
//   );
// }















import { useState, useEffect, useRef, useMemo } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';

export default function Resume() {
  const [profile, setProfile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Persisted state for custom edited highlights
  const [customSkills, setCustomSkills] = useState(() => {
    try {
      const saved = localStorage.getItem('hiremind_custom_skills');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  const [customExp, setCustomExp] = useState(() => {
    return localStorage.getItem('hiremind_custom_exp') === 'true';
  });

  // Inline editing modal state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editExp, setEditExp] = useState(0);
  const [editEdu, setEditEdu] = useState('');

  const fileInputRef = useRef(null);
  const toast = useToast();

  async function loadProfile() {
    try {
      const data = await apiRequest('/candidates/me/profile');
      if (data) {
        setProfile(data);
        setEditExp(data.years_experience || 0);
        setEditEdu(data.education || '');
      }
    } catch (_) {
      /* no profile yet */
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleFileSelect(files) {
    if (files && files.length) setSelectedFile(files[0]);
  }

  async function uploadFile() {
    if (!selectedFile) {
      toast('Choose a file first.', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    setUploading(true);
    try {
      await apiRequest('/candidates/me/resume/upload', {
        method: 'POST',
        body: formData,
        isForm: true,
      });
      toast('Resume parsed successfully', 'success');
      setCustomSkills(new Set());
      setCustomExp(false);
      localStorage.removeItem('hiremind_custom_skills');
      localStorage.removeItem('hiremind_custom_exp');
      await loadProfile();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function uploadText() {
    if (!resumeText.trim()) {
      toast('Paste resume text first.', 'error');
      return;
    }
    try {
      await apiRequest('/candidates/me/resume/text', {
        method: 'POST',
        body: { resume_text: resumeText.trim() },
      });
      toast('Resume parsed successfully', 'success');
      setCustomSkills(new Set());
      setCustomExp(false);
      localStorage.removeItem('hiremind_custom_skills');
      localStorage.removeItem('hiremind_custom_exp');
      await loadProfile();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  // Persist Skill Add to Database & localStorage
  async function handleAddSkill(e) {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = newSkillInput.trim();
      if (!val) return;

      const existing = (profile?.skills || []).some(
        (s) => s.toLowerCase() === val.toLowerCase()
      );
      if (existing) {
        toast(`"${val}" is already added to your skills.`, 'error');
        return;
      }

      const updatedSkills = [...(profile?.skills || []), val];

      setProfile((prev) => ({ ...prev, skills: updatedSkills }));
      setNewSkillInput('');

      const nextCustom = new Set([...customSkills, val.toLowerCase()]);
      setCustomSkills(nextCustom);
      localStorage.setItem('hiremind_custom_skills', JSON.stringify([...nextCustom]));

      try {
        await apiRequest('/candidates/me/profile', {
          method: 'PATCH',
          body: { skills: updatedSkills },
        });
        toast(`Added & saved "${val}"`, 'success', 1800);
      } catch (err) {
        toast(`Added locally: ${err.message}`, 'info', 1800);
      }
    }
  }

  // Persist Skill Remove to Database & localStorage
  async function handleRemoveSkill(skillToRemove) {
    const updatedSkills = (profile?.skills || []).filter((s) => s !== skillToRemove);

    setProfile((prev) => ({ ...prev, skills: updatedSkills }));

    const nextCustom = new Set(customSkills);
    nextCustom.delete(skillToRemove.toLowerCase());
    setCustomSkills(nextCustom);
    localStorage.setItem('hiremind_custom_skills', JSON.stringify([...nextCustom]));

    try {
      await apiRequest('/candidates/me/profile', {
        method: 'PATCH',
        body: { skills: updatedSkills },
      });
      toast(`Removed "${skillToRemove}"`, 'info', 1500);
    } catch (err) {
      toast(`Removed locally`, 'info', 1500);
    }
  }

  // Persist Experience & Education to Database
  async function handleSaveProfileEdits() {
    const newYears = parseFloat(editExp) || 0;
    const isDifferent = profile && profile.years_experience !== newYears;
    const updatedPayload = {
      years_experience: newYears,
      education: editEdu.trim(),
      skills: profile?.skills || [],
    };

    setProfile((prev) => ({
      ...prev,
      ...updatedPayload,
    }));

    if (isDifferent) {
      setCustomExp(true);
      localStorage.setItem('hiremind_custom_exp', 'true');
    }

    try {
      await apiRequest('/candidates/me/profile', {
        method: 'PATCH',
        body: updatedPayload,
      });
      setIsEditingProfile(false);
      toast('Profile details updated and saved to database', 'success');
    } catch (err) {
      setIsEditingProfile(false);
      toast('Saved locally', 'success');
    }
  }

  const resumeScore = useMemo(() => {
    if (!profile) return 0;
    let score = 30;
    if (profile.resume_filename) score += 20;
    if (profile.skills && profile.skills.length >= 5) score += 25;
    else if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.education && profile.education.length > 2) score += 15;
    if (profile.years_experience > 0) score += 10;
    return Math.min(score, 100);
  }, [profile]);

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .resume-main-card {
          background: linear-gradient(135deg, rgba(20, 15, 38, 0.6) 0%, rgba(8, 10, 22, 0.9) 100%);
          border: 1.5px solid rgba(139, 92, 246, 0.45);
          box-shadow: inset 0 0 25px rgba(139, 92, 246, 0.08), 0 8px 30px rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .resume-dropzone {
          border: 1.5px dashed rgba(249, 115, 22, 0.6);
          background: rgba(15, 12, 30, 0.4);
          box-shadow: inset 0 0 15px rgba(249, 115, 22, 0.04);
          border-radius: 16px;
          padding: 28px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .resume-dropzone:hover, .resume-dropzone.drag-active {
          border-color: rgba(249, 115, 22, 1);
          background: rgba(30, 18, 45, 0.6);
          box-shadow: inset 0 0 20px rgba(249, 115, 22, 0.1);
        }
        .gradient-action-btn {
          background: linear-gradient(135deg, #a855f7 0%, #f97316 100%);
          border: none;
          color: #ffffff;
          padding: 12px 20px;
          border-radius: 12px;
          font-family: var(--font-display, sans-serif);
          font-weight: 700;
          font-size: 13.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 18px rgba(168, 85, 247, 0.35);
          width: 100%;
        }
        .gradient-action-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(249, 115, 22, 0.45);
        }
        .gradient-action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resume-secondary-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #cbd5e1;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .resume-secondary-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #fff;
          border-color: rgba(168, 85, 247, 0.6);
        }

        .profile-stat-box {
          background: linear-gradient(135deg, rgba(18, 22, 45, 0.8) 0%, rgba(10, 12, 24, 0.95) 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: inset 0 0 15px rgba(139, 92, 246, 0.05);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.25s ease;
        }

        .profile-stat-box.exp-custom {
          background: linear-gradient(135deg, rgba(30, 20, 52, 0.85) 0%, rgba(20, 14, 38, 0.95) 100%);
          border-color: rgba(249, 115, 22, 0.6);
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.15), inset 0 0 15px rgba(249, 115, 22, 0.08);
        }

        .interactive-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(45, 212, 191, 0.1);
          border: 1px solid rgba(45, 212, 191, 0.35);
          color: #2dd4bf;
          border-radius: 8px;
          padding: 5px 10px 5px 12px;
          font-size: 11.5px;
          font-family: var(--font-mono);
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }
        .interactive-tag:hover {
          background: rgba(45, 212, 191, 0.18);
          border-color: #2dd4bf;
          box-shadow: 0 0 12px rgba(45, 212, 191, 0.3);
          transform: translateY(-1px);
        }

        .interactive-tag.custom-added {
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.18) 0%, rgba(236, 72, 153, 0.15) 100%);
          border: 1px solid rgba(249, 115, 22, 0.6);
          color: #fdba74;
          box-shadow: 0 0 10px rgba(249, 115, 22, 0.25);
        }
        .interactive-tag.custom-added:hover {
          border-color: #fb923c;
          box-shadow: 0 0 16px rgba(249, 115, 22, 0.45);
          color: #ffffff;
        }

        .interactive-tag-del {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .interactive-tag-del:hover {
          background: rgba(239, 68, 68, 0.35);
          color: #f87171;
          transform: scale(1.15);
        }

        /* Perfectly Centered Neon Skill Add Bar */
        .neon-skill-add-bar {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 520px;
          height: 55px;
          background: linear-gradient(135deg, rgba(14, 11, 30, 0.95) 0%, rgba(8, 9, 22, 0.98) 100%);
          border-radius: 15px;
          padding: 0 8px 0 20px;
          box-sizing: border-box;
          border: 1.5px solid rgba(168, 85, 247, 0.5);
          box-shadow: 
            0 0 20px rgba(168, 85, 247, 0.25),
            0 8px 30px rgba(0, 0, 0, 0.8),
            inset 0 1px 2px rgba(255, 255, 255, 0.25),
            inset 0 0 12px rgba(168, 85, 247, 0.1);
          backdrop-filter: blur(16px);
          transition: all 0.25s ease;
        }

        .neon-skill-add-bar:focus-within {
          border-color: rgba(244, 114, 182, 0.85);
          box-shadow: 
            0 0 25px rgba(244, 114, 182, 0.4),
            0 0 15px rgba(168, 85, 247, 0.35),
            inset 0 1px 2px rgba(255, 255, 255, 0.4);
        }

        .neon-sparkle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 14px;
          flex-shrink: 0;
        }

        .neon-skill-divider {
          width: 1.5px;
          height: 22px;
          background: rgba(139, 92, 246, 0.35);
          margin-right: 16px;
          flex-shrink: 0;
        }

        .neon-skill-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 14px;
          font-family: var(--font-mono, monospace);
          letter-spacing: 0.02em;
          min-width: 0;
        }
        .neon-skill-input::placeholder {
          color: #71717a;
          font-family: var(--font-mono, monospace);
          font-size: 13.5px;
        }

        /* Housing Frame */
        .neon-button-housing {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(168, 85, 247, 0.35);
          background: rgba(10, 8, 24, 0.85);
          box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.7);
          flex-shrink: 0;
          box-sizing: border-box;
          margin-left: 10px;
        }

        /* Centered Inner Button */
        .neon-skill-plus-btn {
          width: 64px;
          height: 28px;
          border-radius: 8px;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(236, 72, 153, 0.7) 48%, rgba(249, 115, 22, 0.65) 100%);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 
            0 0 15px rgba(236, 72, 153, 0.6),
            0 0 6px rgba(249, 115, 22, 0.4),
            inset 0 1px 1px rgba(255, 255, 255, 0.7);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(8px);
          padding: 0;
          margin: 0;
          line-height: 1;
        }

        .neon-skill-plus-btn:hover {
          transform: scale(1.03);
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.75) 0%, rgba(236, 72, 153, 0.85) 48%, rgba(249, 115, 22, 0.8) 100%);
          box-shadow: 
            0 0 22px rgba(236, 72, 153, 0.8),
            0 0 10px rgba(249, 115, 22, 0.6),
            inset 0 1px 2px rgba(255, 255, 255, 0.9);
        }

        .neon-skill-plus-btn:active {
          transform: scale(0.96);
        }

        .neon-plus-symbol {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 300;
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          line-height: 1;
          height: 100%;
        }

        .resume-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        @media (max-width: 960px) {
          .resume-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .profile-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 580px) {
          .profile-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .neon-skill-add-bar {
            max-width: 100%;
          }
        }
      `}</style>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="row" style={{ justifyContent: 'flex-start', gap: 12 }}>
          <div className="icon-badge violet" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }}>
            <Icon name="resume" size={22} />
          </div>
          <h1 className="page-title" style={{ fontSize: 'clamp(22px, 5vw, 28px)' }}>
            Upload & parse your <span className="hl">resume</span>
          </h1>
        </div>
        <p className="page-sub" style={{ marginTop: 6 }}>
          Drop a file or paste text — the AI extracts skills, experience, and education to compute explainable match scores across all postings automatically.
        </p>
      </div>

      {/* Upload and Text Parsing Boxes */}
      <div className="resume-grid-2">
        <div className="resume-main-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, marginBottom: 18, color: '#f8fafc' }}>
            <Icon name="upload" size={18} style={{ color: 'var(--violet)' }} /> Upload file
          </h2>
          <div
            className={`resume-dropzone${dragActive ? ' drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files); }}
          >
            <div className="dz-icon" style={{ marginBottom: 8 }}>
              <Icon name="upload" size={32} style={{ color: '#f97316' }} />
            </div>
            <div className="dz-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#fff' }}>
              Drop your resume here
            </div>
            <div className="dz-sub" style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              PDF &middot; DOCX &middot; TXT &mdash; or click to browse
            </div>
          </div>
          <input type="file" ref={fileInputRef} accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
          {selectedFile && (
            <div className="muted mono" style={{ marginTop: 12, fontSize: 12, color: '#c084fc', wordBreak: 'break-all' }}>
              Selected: {selectedFile.name}
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            <button className="gradient-action-btn" onClick={uploadFile} disabled={!selectedFile || uploading}>
              <Icon name="upload" size={16} /> {uploading ? 'Parsing...' : 'Parse resume'}
            </button>
          </div>
        </div>

        <div className="resume-main-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 17, marginBottom: 18, color: '#f8fafc' }}>
            <Icon name="resume" size={18} style={{ color: 'var(--violet)' }} /> Or paste resume text
          </h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            style={{
              minHeight: 148,
              background: 'rgba(15, 12, 30, 0.4)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)',
              borderRadius: '14px',
              padding: '14px',
              color: '#fff',
              width: '100%',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <div style={{ marginTop: 18 }}>
            <button className="gradient-action-btn" onClick={uploadText}>
              <Icon name="sparkles" size={16} /> Parse pasted text
            </button>
          </div>
        </div>
      </div>

      {/* Parsed Profile Overview Section */}
      {profile && (
        <div className="resume-main-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: '#f8fafc', margin: 0 }}>
              <div className="icon-badge violet" style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="checkCircle" size={16} />
              </div>
              Parsed profile
            </h2>
            <button
              type="button"
              className="resume-secondary-btn"
              onClick={() => setIsEditingProfile(true)}
            >
              ✏️ Edit Details
            </button>
          </div>

          <div className="profile-stats-grid">
            <div className={`profile-stat-box ${customExp ? 'exp-custom' : ''}`}>
              <div className={`icon-badge ${customExp ? 'orange' : 'blue'}`} style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="briefcase" size={18} />
              </div>
              <div className="stat-body">
                <div className="stat-label" style={{ fontSize: 10.5, color: customExp ? '#fdba74' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {customExp ? 'Experience (Edited)' : 'Experience'}
                </div>
                <div className="stat-num" style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: customExp ? '#fdba74' : '#fff' }}>
                  {profile.years_experience}
                  <span style={{ fontSize: 13, fontWeight: 500, color: customExp ? '#fdba74' : '#94a3b8' }}> yrs</span>
                </div>
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="icon-badge teal" style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="checkCircle" size={18} />
              </div>
              <div className="stat-body" style={{ width: '100%', minWidth: 0 }}>
                <div className="stat-label" style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Education</div>
                <div className="stat-num" style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profile.education || '—'}
                </div>
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="icon-badge amber" style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="spark" size={18} />
              </div>
              <div className="stat-body">
                <div className="stat-label" style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skills Detected</div>
                <div className="stat-num" style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>
                  {profile.skills?.length || 0}
                </div>
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="icon-badge violet" style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
              </div>
              <div className="stat-body">
                <div className="stat-label" style={{ fontSize: 10.5, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resume Strength</div>
                <div className="stat-num" style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#c084fc' }}>
                  {resumeScore}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div className="divider-label" style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Extracted Skills ({profile.skills?.length || 0})
            </div>

            <div className="neon-skill-add-bar">
              <div className="neon-sparkle-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
                    fill="url(#starGradient)"
                  />
                  <defs>
                    <linearGradient id="starGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f472b6" />
                      <stop offset="0.6" stopColor="#ec4899" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="neon-skill-divider" />

              <input
                type="text"
                className="neon-skill-input"
                placeholder="Add missing skill..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />

              <div className="neon-button-housing">
                <button
                  type="button"
                  className="neon-skill-plus-btn"
                  onClick={handleAddSkill}
                  title="Add Skill"
                >
                  <span className="neon-plus-symbol">+</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(profile.skills || []).map((skill) => {
              const isCustom = customSkills.has(skill.toLowerCase());
              return (
                <span
                  key={skill}
                  className={`interactive-tag ${isCustom ? 'custom-added' : ''}`}
                >
                  <span>{isCustom ? `✦ ${skill}` : skill}</span>
                  <span
                    className="interactive-tag-del"
                    onClick={() => handleRemoveSkill(skill)}
                    title={`Remove ${skill}`}
                  >
                    ✕
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal open={isEditingProfile} onClose={() => setIsEditingProfile(false)} maxWidth={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff', margin: 0 }}>
              Edit Profile Details
            </h2>
            <div style={{ fontSize: 11.5, color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
              Adjust details if the AI parser extracted approximate information.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
              Years of Experience
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={editExp}
              onChange={(e) => setEditExp(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(12, 10, 24, 0.9)',
                border: '1.5px solid rgba(139, 92, 246, 0.35)',
                borderRadius: '10px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
              Education / Degree
            </label>
            <input
              type="text"
              value={editEdu}
              onChange={(e) => setEditEdu(e.target.value)}
              placeholder="e.g. B.Tech Computer Science"
              style={{
                width: '100%',
                background: 'rgba(12, 10, 24, 0.9)',
                border: '1.5px solid rgba(139, 92, 246, 0.35)',
                borderRadius: '10px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              className="gradient-action-btn"
              onClick={handleSaveProfileEdits}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
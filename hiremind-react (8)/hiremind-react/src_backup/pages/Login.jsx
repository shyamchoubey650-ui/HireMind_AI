import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, homeRouteForRole } from '../api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import LogoMark from '../components/LogoMark';

const SAMPLE_ROWS = [
  { role: 'Backend Engineer', score: 92, skills: '7/8', status: 'HIRED', matched: true },
  { role: 'Frontend Developer', score: 78, skills: '5/7', status: 'INTERVIEW', matched: false },
  { role: 'Data Analyst', score: 64, skills: '4/6', status: 'SHORTLISTED', matched: false },
  { role: 'DevOps Engineer', score: 88, skills: '6/7', status: 'INTERVIEW', matched: true },
  { role: 'Product Designer', score: 55, skills: '3/6', status: 'APPLIED', matched: false },
];

const FEATURES = [
  { icon: 'zap', tone: 'amber', title: 'AI-powered matching', desc: 'TF-IDF semantic similarity + skill overlap, weighted into one explainable score.' },
  { icon: 'chart', tone: 'teal', title: 'Explainable, not a black box', desc: 'Every score breaks down into the exact components behind it — no mystery number.' },
  { icon: 'shield', tone: 'violet', title: 'Runs entirely locally', desc: 'FastAPI + SQLite on your machine. No external API keys, nothing leaves your device.' },
];

export default function Login() {
  const [tab, setTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [regRole, setRegRole] = useState('candidate');
  const [regError, setRegError] = useState('');

  const [rows, setRows] = useState(SAMPLE_ROWS);
  const [boardVisible, setBoardVisible] = useState(true);

  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) navigate(homeRouteForRole(user.role), { replace: true });
  }, [user, token, navigate]);

  useEffect(() => {
    const id = setInterval(() => {
      setBoardVisible(false);
      setTimeout(() => {
        setRows((prev) => {
          const next = [...prev];
          next.push(next.shift());
          return next;
        });
        setBoardVisible(true);
      }, 260);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  async function doLogin() {
    setLoginError('');
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: loginEmail, password: loginPassword },
      });
      login(data.user, data.access_token);
      navigate(homeRouteForRole(data.user.role));
    } catch (e) {
      setLoginError(e.message);
    }
  }

  async function doRegister() {
    setRegError('');
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { full_name: regName, email: regEmail, password: regPassword, role: regRole },
      });
      login(data.user, data.access_token);
      navigate(homeRouteForRole(data.user.role));
    } catch (e) {
      setRegError(e.message);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div className="ambient-glow g1" />
        <div className="ambient-glow g2" />

        <div className="auth-brand" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={30} /> Hire<span className="dot">Mind</span> AI
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="auth-tagline">
            Every candidate,<br />
            <span className="hl">scored, ranked, and explained</span><br />
            before you open one resume.
          </div>

          <div className="board" style={{ marginTop: 30, maxWidth: 520, opacity: boardVisible ? 1 : 0, transition: 'opacity 0.25s' }}>
            <div className="board-head">
              <span>Role</span><span>Score</span><span>Skills matched</span><span>Status</span>
            </div>
            {rows.map((row) => (
              <div className="board-row" key={row.role + row.status}>
                <span>{row.role}</span>
                <span className="mono">{row.score}%</span>
                <span className="mono">{row.skills}</span>
                <span className={`status ${row.matched ? 'matched' : ''}`}>{row.status}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 22, maxWidth: 520, background: 'var(--panel)' }}>
            {FEATURES.map((f) => (
              <div className="feature-row" key={f.title}>
                <div className={`icon-badge ${f.tone}`}><Icon name={f.icon} size={18} /></div>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trust-strip" style={{ position: 'relative', zIndex: 1 }}>
          <div className="icon-badge teal"><Icon name={'shield'} size={14} /></div>
          No external API keys required — everything runs on your machine.
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-tabs">
            <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Log in</button>
            <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Create account</button>
          </div>

          {tab === 'login' && (
            <div>
              <label>Email</label>
              <div className="input-icon-wrap">
                <Icon name="mail" size={16} />
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" />
              </div>
              <label>Password</label>
              <div className="input-icon-wrap">
                <Icon name="lock" size={16} />
                <input type={showLoginPw ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                <button className="toggle-visibility" onClick={() => setShowLoginPw((v) => !v)} type="button">
                  <Icon name={showLoginPw ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
              <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}} onClick={doLogin}>
                Log in <Icon name="arrowRight" size={15} />
              </button>
              {loginError && <div className="error">{loginError}</div>}
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label>Full name</label>
              <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Jane Doe" autoComplete="off" />
              <label>Email</label>
              <div className="input-icon-wrap">
                <Icon name="mail" size={16} />
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" autoComplete="off" />
              </div>
              <label>Password</label>
              <div className="input-icon-wrap">
                <Icon name="lock" size={16} />
                <input type={showRegPw ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="min 6 characters" autoComplete="new-password" />
                <button className="toggle-visibility" onClick={() => setShowRegPw((v) => !v)} type="button">
                  <Icon name={showRegPw ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
              <label>Confirm password</label>
              <div className="input-icon-wrap">
                <Icon name="lock" size={16} />
                <input type={showRegPw ? 'text' : 'password'} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="repeat password" autoComplete="new-password" />
              </div>
              <div className="password-checklist">
                <span className={regPassword.length >= 6 ? 'ok' : ''}>
                  <Icon name="checkCircle" size={13} /> At least 6 characters
                </span>
                <span className={regConfirm.length > 0 && regConfirm === regPassword ? 'ok' : ''}>
                  <Icon name="checkCircle" size={13} /> Passwords match
                </span>
              </div>

              <label>I am a</label>
              <div className="role-select-grid">
                <div
                  className={`role-select-card${regRole === 'candidate' ? ' selected' : ''}`}
                  onClick={() => setRegRole('candidate')}
                >
                  <span className="rsc-radio" />
                  <div className="icon-badge violet"><Icon name="resume" size={18} /></div>
                  <div>
                    <div className="rsc-title">Candidate</div>
                    <div className="rsc-sub">I'm looking for a job</div>
                  </div>
                </div>
                <div
                  className={`role-select-card${regRole === 'recruiter' ? ' selected' : ''}`}
                  onClick={() => setRegRole('recruiter')}
                >
                  <span className="rsc-radio" />
                  <div className="icon-badge amber"><Icon name="briefcase" size={18} /></div>
                  <div>
                    <div className="rsc-title">Recruiter</div>
                    <div className="rsc-sub">I'm hiring for my company</div>
                  </div>
                </div>
              </div>

              <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}} onClick={doRegister}>
                Create account <Icon name="arrowRight" size={15} />
              </button>
              {regError && <div className="error">{regError}</div>}
            </div>
          )}

          <div className="divider-label">prototype</div>
          <p className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
            Runs entirely on your machine — FastAPI backend, SQLite storage, scikit-learn matching. No external API keys required.
          </p>
        </div>
      </div>
    </div>
  );
}

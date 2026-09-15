// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { apiRequest, homeRouteForRole } from '../api';
// import { useAuth } from '../context/AuthContext';
// import Icon from '../components/Icon';
// import LogoMark from '../components/LogoMark';

// const SAMPLE_ROWS = [
//   { role: 'Data Analyst', score: 64, skills: '4/6', status: 'SHORTLISTED', matched: false, icon: 'chart' },
//   { role: 'DevOps Engineer', score: 88, skills: '6/7', status: 'INTERVIEW', matched: true, icon: 'code' },
//   { role: 'Product Designer', score: 55, skills: '3/6', status: 'APPLIED', matched: false, icon: 'edit' },
//   { role: 'Backend Engineer', score: 92, skills: '7/8', status: 'HIRED', matched: true, icon: 'server' },
//   { role: 'Frontend Developer', score: 78, skills: '5/7', status: 'INTERVIEW', matched: false, icon: 'layout' },
// ];

// const FEATURES = [
//   { icon: 'zap', tone: 'amber', title: 'AI-Powered Matching', desc: 'TF-IDF semantic similarity + skill overlap, weighted into one explainable score.' },
//   { icon: 'chart', tone: 'teal', title: 'Explainable, Not a Black Box', desc: 'Every score breaks down into exact components behind it — no mystery number.' },
//   { icon: 'shield', tone: 'violet', title: 'Runs Entirely Locally', desc: 'FastAPI + SQLite on your machine. No external API keys, nothing leaves your device.' },
// ];

// export default function Login() {
//   const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
//   const [loginEmail, setLoginEmail] = useState('');
//   const [loginPassword, setLoginPassword] = useState('');
//   const [showLoginPw, setShowLoginPw] = useState(false);
//   const [loginError, setLoginError] = useState('');

//   const [regName, setRegName] = useState('');
//   const [regEmail, setRegEmail] = useState('');
//   const [regPassword, setRegPassword] = useState('');
//   const [regConfirm, setRegConfirm] = useState('');
//   const [showRegPw, setShowRegPw] = useState(false);
//   const [regRole, setRegRole] = useState('candidate');
//   const [regError, setRegError] = useState('');

//   // Forgot Password States
//   const [forgotEmail, setForgotEmail] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [forgotError, setForgotError] = useState('');
//   const [forgotSuccess, setForgotSuccess] = useState('');

//   const [rows, setRows] = useState(SAMPLE_ROWS);
//   const [boardVisible, setBoardVisible] = useState(true);

//   const { user, token, login } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user && token) navigate(homeRouteForRole(user.role), { replace: true });
//   }, [user, token, navigate]);

//   useEffect(() => {
//     const id = setInterval(() => {
//       setBoardVisible(false);
//       setTimeout(() => {
//         setRows((prev) => {
//           const next = [...prev];
//           next.push(next.shift());
//           return next;
//         });
//         setBoardVisible(true);
//       }, 260);
//     }, 3200);
//     return () => clearInterval(id);
//   }, []);

//   async function doLogin() {
//     setLoginError('');
//     if (!loginEmail || !loginPassword) {
//       setLoginError('Please enter both email and password.');
//       return;
//     }
//     try {
//       const data = await apiRequest('/auth/login', {
//         method: 'POST',
//         body: { email: loginEmail, password: loginPassword },
//       });
//       if (data && data.access_token) {
//         login(data.user, data.access_token);
//         navigate(homeRouteForRole(data.user.role));
//       } else {
//         setLoginError('Invalid server response structure.');
//       }
//     } catch (e) {
//       setLoginError(e.message || 'Login failed. Check your credentials.');
//     }
//   }

//   async function doRegister() {
//     setRegError('');
//     if (regPassword.length < 6) {
//       setRegError('Password must be at least 6 characters.');
//       return;
//     }
//     if (regPassword !== regConfirm) {
//       setRegError('Passwords do not match.');
//       return;
//     }
//     try {
//       const data = await apiRequest('/auth/register', {
//         method: 'POST',
//         body: { full_name: regName, email: regEmail, password: regPassword, role: regRole },
//       });
//       login(data.user, data.access_token);
//       navigate(homeRouteForRole(data.user.role));
//     } catch (e) {
//       setRegError(e.message || 'Registration failed.');
//     }
//   }

//   async function handleResetPassword(e) {
//     if (e && typeof e.preventDefault === 'function') e.preventDefault();
//     setForgotError('');
//     setForgotSuccess('');

//     if (!forgotEmail) {
//       setForgotError('Please enter your account email.');
//       return;
//     }
//     if (newPassword.length < 6) {
//       setForgotError('New password must be at least 6 characters.');
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       setForgotError('New passwords do not match.');
//       return;
//     }

//     try {
//       await apiRequest('/auth/reset-password', {
//         method: 'POST',
//         body: { email: forgotEmail, new_password: newPassword },
//       });

//       setForgotSuccess('Password updated successfully in database! Redirecting...');
//       setTimeout(() => {
//         setTab('login');
//         setLoginEmail(forgotEmail);
//         setLoginPassword('');
//         setForgotSuccess('');
//         setNewPassword('');
//         setConfirmNewPassword('');
//         setForgotEmail('');
//       }, 2000);
//     } catch (e) {
//       setForgotError(e.message || 'Failed to update password on server.');
//     }
//   }

//   return (
//     <div className="auth-layout-container">
//       <style>{`
//         .auth-layout-container {
//           width: 100vw;
//           height: 100vh;
//           max-height: 100vh;
//           background: #03050d;
//           background-image: 
//             radial-gradient(circle at 10% 20%, rgba(109, 40, 217, 0.18) 0%, transparent 45%),
//             radial-gradient(circle at 90% 85%, rgba(249, 115, 22, 0.1) 0%, transparent 45%),
//             linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
//             linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
//           background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
//           display: grid;
//           grid-template-columns: 1.15fr 0.85fr;
//           align-items: center;
//           padding: 20px 40px;
//           gap: 35px;
//           box-sizing: border-box;
//           font-family: var(--font-sans, sans-serif);
//           color: #f8fafc;
//           position: relative;
//           overflow: hidden;
//           z-index: 0;
//         }

//         .auth-layout-container::before {
//           content: '';
//           position: absolute;
//           right: 35%;
//           top: -20%;
//           width: 500px;
//           height: 140%;
//           background: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.18) 0%, transparent 70%);
//           transform: rotate(-25deg);
//           pointer-events: none;
//           z-index: 1;
//         }

//         .neon-wave-svg {
//           position: absolute;
//           right: 28%;
//           top: 0;
//           height: 100%;
//           width: 400px;
//           pointer-events: none;
//           z-index: 1;
//           opacity: 0.4;
//         }

//         .auth-layout-container::after {
//           content: '';
//           position: absolute;
//           right: 48%;
//           top: 10%;
//           width: 1.5px;
//           height: 80%;
//           background: linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.3), rgba(249, 115, 22, 0.3), transparent);
//           pointer-events: none;
//           z-index: 1;
//         }

//         .left-hero-section {
//           display: flex;
//           flex-direction: column;
//           gap: 12px;
//           position: relative;
//           z-index: 10;
//           max-width: 680px;
//         }

//         .auth-brand-logo {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           font-family: var(--font-display);
//           font-weight: 800;
//           font-size: 18px;
//           color: #fff;
//         }

//         .auth-main-headline {
//           font-family: var(--font-display);
//           font-size: 35px;
//           font-weight: 800;
//           line-height: 1.15;
//           letter-spacing: -1px;
//           color: #fff;
//           margin: 0;
//         }

//         .hl-gradient {
//           background: linear-gradient(90deg, #c084fc, #ec4899, #fb923c);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//         }

//         .auth-subtext {
//           font-size: 12.5px;
//           color: #94a3b8;
//           margin: 0;
//           font-weight: 400;
//         }

//         .analytics-board {
//           position: relative;
//           isolation: isolate;
//           border: 1.5px solid rgba(168, 85, 247, 0.9);
//           border-radius: 14px;
//           background: linear-gradient(135deg, rgba(15, 13, 30, 0.95) 0%, rgba(7, 9, 20, 0.98) 100%);
//           padding: 8px 14px;
//           margin-top: 10px;
//           margin-bottom: 10px;
//           box-shadow: 0px 0px 0px rgba(168, 85, 247, 0.9), inset 0px 0px 12px rgba(110, 76, 155, 0.9);
//           // box-shadow: 
//           //   0 0 0 1px rgba(168, 85, 247, 0.25),
//           //   0 0 20px rgba(139, 92, 246, 0.22),
//           //   0 12px 35px rgba(0, 0, 0, 0.6),
//           //   inset 0 1px 1px rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(12px);
//           transition: all 0.3s ease;
//           z-index: 10;
//         }

//         .board-header-row {
//           display: grid;
//           grid-template-columns: 2fr 1fr 1fr 1.2fr;
//           font-family: var(--font-mono);
//           font-size: 12px;
//           color: #f4f4be;
//           padding-bottom: 4px;
//           border-bottom: 1px solid rgba(255,255,255,0.06);
//           letter-spacing: 0.5px;
//           text-transform: uppercase;
//         }
//         .board-header-row span:last-child {
//           text-align: center;
//         }

//         .board-data-row {
//           display: grid;
//           grid-template-columns: 2fr 1fr 1fr 1.2fr;
//           align-items: center;
//           font-size: 11.5px;
//           color: #f8fafc;
//           padding: 5px 0;
//           border-bottom: 1px solid rgba(255,255,255,0.03);
//         }
//         .board-data-row:last-child {
//           border-bottom: none;
//           padding-bottom: 0;
//         }

//         .table-role-cell {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           font-weight: 600;
//         }

//         .role-icon-box {
//           width: 26px;
//           height: 26px;
//           border-radius: 6px;
//           background: rgba(139, 92, 246, 0.08);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: #2dd4bf;
//         }

//         .mono-text {
//           font-family: var(--font-mono);
//           font-weight: 600;
//         }

//         .status-cell-center {
//           display: flex;
//           justify-content: center;
//           align-items: center;

//         }

//         .badge-status {
//           font-family: var(--font-mono);
//           font-size: 8.5px;
//           font-weight: 700;
//           letter-spacing: 0.5px;
//           padding: 2px 8px;
//           border-radius: 5px;
//           display: inline-block;
//           text-align: center;

//         }
//         .badge-status.shortlisted { color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.05); box-shadow: -1.7px 1px 0px, inset 0px 0px 2px}
//         .badge-status.interview { color: #2dd4bf; border: 1px solid rgba(45, 212, 191, 0.4); background: rgba(45, 212, 191, 0.05); box-shadow: -1.7px 1px 0px, inset 0px 0px 0px}
//         .badge-status.applied { color: #f97316; border: 1px solid rgba(249, 115, 22, 0.4); background: rgba(249, 115, 22, 0.05); box-shadow: -1.7px 1px 0px, inset 0px 0px 2px}
//         .badge-status.hired { color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); background: rgba(52, 211, 153, 0.05); box-shadow:-1.7px 1px 0px, inset 0px 0px 0px}

//         .features-grid-box {
//           display: grid;
//           grid-template-columns: repeat(3, 1fr);
//           gap: 8px;
//           margin-bottom: 10px;
//           z-index: 10;
//           position: relative;
//         }

//         .feature-mini-card {
//           background: linear-gradient(145deg, rgba(24, 18, 48, 0.85) 0%, rgba(10, 12, 26, 0.95) 100%);
//           border: 1.5px solid rgba(168, 85, 247, 0.9);
//           border-radius: 10px;
//           padding: 10px 11px;
//           display: flex;
//           flex-direction: column;
//           gap: 7px;
//           backdrop-filter: blur(10px);
//           box-shadow: 0px 0px 0px rgba(168, 85, 247, 0.9), inset 0px 0px 12px rgba(117, 76, 155, 0.9);
//         }

//         .feature-mini-title {
//           font-weight: 700;
//           font-size: 10px;
//           color: #fff;
//           margin-top: 8px;
//           text-shadow: 0px 0px 100px rgba(3, 0, 6, 0.9);
//         }

//         .feature-mini-desc {
//           font-size: 9px;
//           color: #e1ed08;
//           line-height: 1.25;
//           margin-top: 5px;
//           text-shadow: 0px 0px -100px rgba(3, 0, 6, 0.9);
//         }

//         .icon-box {

//           width: 32px;
//           height: 32px;
//           border-radius: 6px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           flex-shrink: 0;
//           cursor: pointer;
//           transition: all 0.25s ease;

//         }
//         .icon-box:hover {
//           border-color: rgba(10, 251, 74, 0.95);
//           box-shadow: 0 0 15px rgba(168, 85, 247, 0.9), 0 8px 20px rgba(139, 92, 246, 0.25);
//           transform: scale(1.08);
//         }

//         .icon-box.amber { background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.45); color: #f59e0b; }
//         .icon-box.teal { background: rgba(45, 212, 191, 0.18); border: 1px solid rgba(45, 212, 191, 0.45); color: #2dd4bf; }
//         .icon-box.violet { background: rgba(139, 92, 246, 0.18); border: 1px solid rgba(139, 92, 246, 0.45); color: #c084fc; }

//         .secure-trust-strip {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-family: var(--font-mono);
//           font-size: 9.5px;
//           color: #0af39e;
//           background: rgba(52, 211, 153, 0.05);
//           padding: 5px 10px;
//           border-radius: 6px;
//           width: fit-content;
//           position: relative;
//           z-index: 10;
//           border: 1.5px solid #34d399;
//           box-shadow: -1px 0px 5px #34d399, inset 0px 0px 35px #035336;
//           text-shadow: 0px 0px -1000px rgba(3, 0, 6, 0.9);
//         }

//         .auth-right-container {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           position: relative;
//           z-index: 10;
//         }

//         .glass-auth-outer-glow {
//           width: 100%;
//           max-width: 400px;
//           border-radius: 30px;
//           padding: 1.5px;
//           background: linear-gradient(135deg, rgba(167, 139, 250, 0.8) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(249, 115, 22, 0.8) 100%);
//           box-shadow: -2px -1px 0px rgba(168, 85, 247, 0.9), inset 0px 0px 0px rgba(117, 76, 155, 0.9);
//         }

//         .glass-auth-wrapper {
//           width: 100%;
//           background: linear-gradient(135deg, rgba(14, 11, 26, 0.98) 0%, rgba(6, 8, 18, 0.99) 100%);
//           border-radius: 28px;
//           padding: 12px;
//           box-sizing: border-box;
//           border: 1px solid rgba(139, 92, 246, 0.25);
//         }

//         .glass-auth-card {
//           width: 100%;
//           background: linear-gradient(135deg, rgba(22, 16, 42, 0.96) 0%, rgba(9, 11, 24, 0.99) 100%);
//           border-radius: 20px;
//           padding: 20px 22px;
//           box-sizing: border-box;
//           position: relative;
//           border: 2px solid rgba(139, 92, 246, 0.4);
//           box-shadow: 2px 1px 0px rgba(168, 85, 247, 0.9), inset 0.7px 0.7px 0px rgba(249, 115, 22, 0.8);
//         }

//         .auth-tabs-switches {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           background: #000105;
//           border-radius: 9px;
//           padding: 3px;
//           margin-bottom: 14px;
//           border: 1.5px solid rgba(3, 104, 94, 0.96);
//           gap: 4px;
//           align-items: center;
//           box-shadow: 1px 1px  1px rgb(7, 1, 18), inset 1px 1px 1px rgba(4, 0, 14, 0.9);

//         }

//         .auth-tabs-switches button {
//           background: #0a0b19;
//           border: 2px solid rgba(9, 9, 9, 0.05);
//           color: #eff0ee;
//           padding: 8px 10px;
//           border-radius: 7px;
//           font-weight: 600;
//           font-size: 12px;
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 5px;
//           height: 34px;
//           box-sizing: border-box;
//           box-shadow: 0px 0px 0px rgba(168, 85, 247, 0.9), inset 0px 0px 40px rgba(117, 76, 155, 0.9);
//         }

//         .auth-tabs-switches button.active {
//           background: linear-gradient(135deg, rgba(22, 16, 42, 0.95), rgba(9, 11, 24, 0.98));
//           color: #fff;
//           box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
//           border: 1.5px solid #a78bfa;
//         }

//         .glass-auth-card label {
//           display: block;
//           font-family: var(--font-mono);
//           font-size: 10px;
//           color: #04e2ff;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           margin-bottom: 3px;
//         }

//         .glass-auth-card input[type="email"],
//         .glass-auth-card input[type="password"],
//         .glass-auth-card input[type="text"] {
//           width: 100%;
//           background: #060712 !important;
//           border: 1px solid rgb(5, 100, 103);
//           border-radius: 8px;
//           padding: 8px 12px;
//           color: #fff !important;
//           font-size: 12px;
//           outline: none;
//           box-sizing: border-box;
//           margin-bottom: 9px;
//           box-shadow: -2px 0px 0px rgb(13, 215, 255), inset 0px 0px 500px rgba(3, 2, 6, 0.8);
//         }

//         .glass-auth-card input:focus {
//           border: 1px solid rgb(5, 100, 103);
//           box-shadow: 2px 0px 0px rgb(13, 215, 255), inset 0px 0px 500px rgba(3, 2, 6, 0.8);
//         }

//         .input-icon-box {
//           position: relative;
//           display: flex;
//           align-items: center;
//           width: 100%;
//           margin-bottom: 9px;
//         }

//         .input-icon-box input {
//           margin-bottom: 0 !important;
//           padding-left: 34px !important;
//           padding-right: 34px !important;
//         }

//         .input-icon-box > svg:first-of-type {
//           position: absolute;
//           left: 11px;
//           top: 0;
//           bottom: 0;
//           margin: auto;
//           color: #22d6ea;
//           pointer-events: none;
//         }

//         .pw-hide-btn {
//           position: absolute;
//           right: 11px;
//           top: 0;
//           bottom: 0;
//           margin: auto;
//           background: none;
//           border: none;
//           color: #17edf5;
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 0;
//           height: max-content;
//         }

//         .primary-action-btn {
//           width: 100%;
//           padding: 10px;
//           background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%);
//           border: none;
//           border-radius: 8px;
//           color: #fff;
//           font-weight: 700;
//           font-size: 12.5px;
//           cursor: pointer;
//           box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 5px;
//           margin-top: 3px;
//         }

//         .password-checklist-box {
//           display: flex;
//           gap: 10px;
//           font-size: 10px;
//           color: #64748b;
//           margin-bottom: 9px;
//           font-family: var(--font-mono);
//         }
//         .password-checklist-box span { display: flex; align-items: center; gap: 4px; }
//         .password-checklist-box span.ok { color: #34d399; }

//         .role-grid-container {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 5px;
//           margin-bottom: 15px;
//         }

//         .role-picker-card {
//           background: #0a0c1a;
//           border: 1.5px solid rgba(139, 92, 246, 0.25);
//           border-radius: 8px;
//           padding: 9px;
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           gap: 5px;
//           position: relative;
//           transition: all 0.2s ease;
//         }
//         .role-picker-card.selected {
//           background: rgba(139, 92, 246, 0.15);
//           border-color: #a78bfa;
//           box-shadow: 0 0 10px rgba(139,92,246,0.2);
//         }
//         .rpc-radio-circle {
//           width: 10px;
//           height: 10px;
//           border-radius: 50%;
//           border: 1.5px solid #64748b;
//           position: absolute;
//           right: 8px;
//           top: 10px;
//         }
//         .role-picker-card.selected .rpc-radio-circle {
//           border-color: #a78bfa;
//           background: #8b5cf6;
//           box-shadow: 0 0 4px #8b5cf6;
//         }

//         .card-divider-label {
//           font-family: var(--font-mono);
//           font-size: 8px;
//           color: #64748b;
//           text-transform: uppercase;
//           text-align: center;
//           letter-spacing: 1px;
//           margin: 10px 0 5px 0;
//           position: relative;
//         }
//         .card-divider-label::before, .card-divider-label::after {
//           content: '';
//           position: absolute;
//           top: 50%;
//           width: 30%;
//           height: 1px;
//           background: rgba(255,255,255,0.08);
//         }
//         .card-divider-label::before { left: 0; }
//         .card-divider-label::after { right: 0; }

//         .auth-error-alert {
//           background: rgba(244, 63, 94, 0.1);
//           border: 1px solid rgba(244, 63, 94, 0.3);
//           color: #f43f5e;
//           padding: 6px 10px;
//           border-radius: 6px;
//           font-size: 10.5px;
//           margin-top: 8px;
//           font-family: var(--font-mono);
//         }

//         .auth-success-alert {
//           background: rgba(52, 211, 153, 0.1);
//           border: 1px solid rgba(52, 211, 153, 0.3);
//           color: #34d399;
//           padding: 6px 10px;
//           border-radius: 6px;
//           font-size: 10.5px;
//           margin-top: 8px;
//           font-family: var(--font-mono);
//         }

//         @media (max-width: 1100px) {
//           .auth-layout-container {
//             grid-template-columns: 1fr;
//             height: auto;
//             min-height: 100vh;
//             overflow-y: auto;
//             padding: 25px 20px;
//           }
//         }
//       `}</style>

//       {/* Background Graphic */}
//       <svg className="neon-wave-svg" viewBox="0 0 300 900" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M50 -50 C250 250 -50 650 180 950" stroke="url(#paint0_linear)" strokeWidth="2.5" strokeLinecap="round" />
//         <path d="M120 -50 C320 300 20 700 250 950" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
//         <defs>
//           <linearGradient id="paint0_linear" x1="50" y1="-50" x2="180" y2="950" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#a78bfa" stopOpacity="0.8" />
//             <stop offset="0.5" stopColor="#ec4899" stopOpacity="0.4" />
//             <stop offset="1" stopColor="#f97316" stopOpacity="0.9" />
//           </linearGradient>
//           <linearGradient id="paint1_linear" x1="120" y1="-50" x2="250" y2="950" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#c084fc" stopOpacity="0.6" />
//             <stop offset="1" stopColor="#fb923c" stopOpacity="0.5" />
//           </linearGradient>
//         </defs>
//       </svg>

//       {/* LEFT SECTION */}
//       <div className="left-hero-section">
//         <div className="auth-brand-logo">
//           <LogoMark size={26} /> Hire<span className="hl-gradient">Mind</span> AI
//         </div>

//         <div>
//           <h1 className="auth-main-headline">
//             Every candidate,<br />
//             <span className="hl-gradient">scored, ranked, and explained</span><br />
//             before you open one resume.
//           </h1>
//           <p className="auth-subtext">AI that removes guesswork from hiring.</p>
//         </div>

//         {/* CANDIDATE TABLE */}
//         <div className="analytics-board" style={{ opacity: boardVisible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
//           <div className="board-header-row">
//             <span>Role</span>
//             <span>Score</span>
//             <span>Skills matched</span>
//             <span>Status</span>
//           </div>
//           {rows.map((row) => {
//             const statusLower = row.status.toLowerCase();
//             return (
//               <div className="board-data-row" key={row.role + row.status}>
//                 <div className="table-role-cell">
//                   <div className="role-icon-box">
//                     <Icon name={row.icon} size={14} />
//                   </div>
//                   <span style={{ fontWeight: 600 }}>{row.role}</span>
//                 </div>
//                 <span className="mono-text">{row.score}%</span>
//                 <span className="mono-text" style={{ color: '#94a3b8' }}>{row.skills}</span>
//                 <div className="status-cell-center">
//                   <span className={`badge-status ${statusLower}`}>{row.status}</span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* 3 FEATURE CARDS */}
//         <div className="features-grid-box">
//           {FEATURES.map((f) => (
//             <div className="feature-mini-card" key={f.title}>
//               <div className={`icon-box ${f.tone}`}><Icon name={f.icon} size={13} /></div>
//               <div className="feature-mini-title">{f.title}</div>
//               <div className="feature-mini-desc">{f.desc}</div>
//             </div>
//           ))}
//         </div>

//         <div className="secure-trust-strip">
//           <div className="icon-box teal" style={{ width: 20, height: 20 }}><Icon name={'shield'} size={10} /></div>
//           No external API keys required — everything runs on your machine.
//         </div>
//       </div>

//       {/* RIGHT AUTH PANEL SECTION */}
//       <div className="auth-right-container">
//         <div className="glass-auth-outer-glow">
//           <div className="glass-auth-wrapper">
//             <div className="glass-auth-card">

//               {tab !== 'forgot' && (
//                 <div className="auth-tabs-switches">
//                   <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')} type="button">
//                     <Icon name="user" size={13} /> Log in
//                   </button>
//                   <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')} type="button">
//                     <Icon name="userPlus" size={13} /> Create account
//                   </button>
//                 </div>
//               )}

//               {/* LOGIN VIEW */}
//               {tab === 'login' && (
//                 <div>
//                   <label>Email</label>
//                   <div className="input-icon-box">
//                     <Icon name="mail" size={14} />
//                     <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" />
//                   </div>

//                   <label>Password</label>
//                   <div className="input-icon-box">
//                     <Icon name="lock" size={14} />
//                     <input type={showLoginPw ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
//                     <button className="pw-hide-btn" onClick={() => setShowLoginPw((v) => !v)} type="button">
//                       <Icon name={showLoginPw ? 'eyeOff' : 'eye'} size={15} />
//                     </button>
//                   </div>

//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
//                     <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textTransform: 'none', margin: 0 }}>
//                       <input type="checkbox" defaultChecked style={{ accentColor: '#08d612', width: '13px', height: '13px' }} /> Remember me
//                     </label>
//                     <span style={{ color: '#47e309', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setTab('forgot'); setForgotEmail(loginEmail); }}>
//                       Forgot password?
//                     </span>
//                   </div>

//                   <button className="primary-action-btn" onClick={doLogin} type="button">
//                     Log in <span style={{ fontSize: '15px' }}>→</span>
//                   </button>
//                   {loginError && <div className="auth-error-alert">{loginError}</div>}
//                 </div>
//               )}

//               {/* REGISTER VIEW */}
//               {tab === 'register' && (
//                 <div>
//                   <label>Full name</label>
//                   <div className="input-icon-box">
//                     <Icon name="user" size={14} />
//                     <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Shyam Choubey " autoComplete="off" />
//                   </div>

//                   <label>Email</label>
//                   <div className="input-icon-box">
//                     <Icon name="mail" size={14} />
//                     <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" autoComplete="off" />
//                   </div>

//                   <label>Password</label>
//                   <div className="input-icon-box">
//                     <Icon name="lock" size={14} />
//                     <input type={showRegPw ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="min 6 characters" autoComplete="new-password" />
//                     <button className="pw-hide-btn" onClick={() => setShowRegPw((v) => !v)} type="button">
//                       <Icon name={showRegPw ? 'eyeOff' : 'eye'} size={15} />
//                     </button>
//                   </div>

//                   <label>Confirm password</label>
//                   <div className="input-icon-box">
//                     <Icon name="lock" size={14} />
//                     <input type={showRegPw ? 'text' : 'password'} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="repeat password" autoComplete="new-password" />
//                   </div>

//                   <div className="password-checklist-box">
//                     <span className={regPassword.length >= 6 ? 'ok' : ''}>
//                       <Icon name="checkCircle" size={11} /> At least 6 chars
//                     </span>
//                     <span className={regConfirm.length > 0 && regConfirm === regPassword ? 'ok' : ''}>
//                       <Icon name="checkCircle" size={11} /> Passwords match
//                     </span>
//                   </div>

//                   <label>I am a</label>
//                   <div className="role-grid-container">
//                     <div className={`role-picker-card${regRole === 'candidate' ? ' selected' : ''}`} onClick={() => setRegRole('candidate')}>
//                       <span className="rpc-radio-circle" />
//                       <div className="icon-box violet" style={{ width: 28, height: 28 }}><Icon name="resume" size={16} /></div>
//                       <div>
//                         <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff' }}>Candidate</div>
//                         <div style={{ fontSize: '9px', color: '#94a3b8' }}>Looking for job</div>
//                       </div>
//                     </div>
//                     <div className={`role-picker-card${regRole === 'recruiter' ? ' selected' : ''}`} onClick={() => setRegRole('recruiter')}>
//                       <span className="rpc-radio-circle" />
//                       <div className="icon-box amber" style={{ width: 28, height: 28 }}><Icon name="briefcase" size={16} /></div>
//                       <div>
//                         <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff' }}>Recruiter</div>
//                         <div style={{ fontSize: '9px', color: '#94a3b8' }}>Hiring talent</div>
//                       </div>
//                     </div>
//                   </div>

//                   <button className="primary-action-btn" onClick={doRegister} type="button">
//                     Create account <span style={{ fontSize: '15px' }}>→</span>
//                   </button>
//                   {regError && <div className="auth-error-alert">{regError}</div>}
//                 </div>
//               )}

//               {/* FORGOT / RESET PASSWORD VIEW */}
//               {tab === 'forgot' && (
//                 <div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//                     <label style={{ margin: 0, color: '#c084fc' }}>Reset Password</label>
//                     <span style={{ fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setTab('login')}>
//                       ← Back to login
//                     </span>
//                   </div>

//                   <label>Account Email</label>
//                   <div className="input-icon-box">
//                     <Icon name="mail" size={14} />
//                     <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" />
//                   </div>

//                   <label>New Password</label>
//                   <div className="input-icon-box">
//                     <Icon name="lock" size={14} />
//                     <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="min 6 characters" />
//                   </div>

//                   <label>Confirm New Password</label>
//                   <div className="input-icon-box">
//                     <Icon name="lock" size={14} />
//                     <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="repeat new password" />
//                   </div>

//                   <button className="primary-action-btn" onClick={handleResetPassword} type="button">
//                     Update Password <span style={{ fontSize: '15px' }}>→</span>
//                   </button>

//                   {forgotError && <div className="auth-error-alert">{forgotError}</div>}
//                   {forgotSuccess && <div className="auth-success-alert">{forgotSuccess}</div>}
//                 </div>
//               )}

//               <div className="card-divider-label">prototype</div>
//               <p style={{ fontSize: '9.5px', color: '#94a3b8', lineHeight: 1.3, textAlign: 'center', margin: 0 }}>
//                 Runs entirely on your machine — FastAPI backend, SQLite storage, scikit-learn matching. No external API keys required.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest, homeRouteForRole } from '../api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import LogoMark from '../components/LogoMark';
import Modal from '../components/Modal';

const SAMPLE_ROWS = [
  { role: 'Product Designer', score: 55, skills: '3/6', status: 'APPLIED', icon: 'edit', skillsList: ['Figma', 'Prototyping', 'Design Systems'], tfidf: 0.52 },
  { role: 'Backend Engineer', score: 92, skills: '7/8', status: 'HIRED', icon: 'server', skillsList: ['FastAPI', 'PostgreSQL', 'Redis', 'Python', 'Docker', 'Microservices'], tfidf: 0.94 },
  { role: 'Frontend Developer', score: 78, skills: '5/7', status: 'INTERVIEW', icon: 'layout', skillsList: ['React', 'JavaScript', 'CSS', 'Redux', 'TypeScript'], tfidf: 0.76 },
  { role: 'Data Analyst', score: 64, skills: '4/6', status: 'SHORTLISTED', icon: 'chart', skillsList: ['SQL', 'Python', 'PowerBI', 'Pandas'], tfidf: 0.61 },
  { role: 'DevOps Engineer', score: 88, skills: '6/7', status: 'INTERVIEW', icon: 'code', skillsList: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'], tfidf: 0.89 },
];

const FEATURES = [
  { icon: 'zap', tone: 'amber', title: 'AI-Powered Matching', desc: 'TF-IDF semantic similarity + skill overlap, weighted into one explainable score.' },
  { icon: 'chart', tone: 'teal', title: 'Explainable, Not a Black Box', desc: 'Every score breaks down into exact components behind it — no mystery number.' },
  { icon: 'shield', tone: 'violet', title: 'Runs Entirely Locally', desc: 'FastAPI + SQLite on your machine. No external API keys, nothing leaves your device.' },
];

export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [searchParams, setSearchParams] = useSearchParams();

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loadingDemo, setLoadingDemo] = useState('');
  const [savedAccounts, setSavedAccounts] = useState([]);

  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [regRole, setRegRole] = useState('candidate');
  const [regError, setRegError] = useState('');

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Interactive Live Scoring Showcase State
  const [selectedDemoRow, setSelectedDemoRow] = useState(null);
  const [rows, setRows] = useState(SAMPLE_ROWS);
  const [boardVisible, setBoardVisible] = useState(true);

  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  // Catch incoming OAuth tokens and error redirects from backend
  useEffect(() => {
    const oauthToken = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (oauthToken) {
      localStorage.setItem('hiremind_token', oauthToken);
      apiRequest('/auth/me')
        .then((userData) => {
          saveProfileLocally(userData);
          login(userData, oauthToken);
          navigate(homeRouteForRole(userData.role), { replace: true });
        })
        .catch(() => {
          setLoginError('OAuth token verification failed. Please try logging in again.');
          setSearchParams({});
        });
    } else if (oauthError) {
      setLoginError(`OAuth sign-in error: ${oauthError}`);
      setSearchParams({});
    }
  }, [searchParams, login, navigate, setSearchParams]);

  // Redirect if session is already active
  useEffect(() => {
    if (user && token) navigate(homeRouteForRole(user.role), { replace: true });
  }, [user, token, navigate]);

  // Load Saved Accounts & Last Remembered Email
  useEffect(() => {
    const savedEmail = localStorage.getItem('hiremind_saved_email');
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }

    try {
      const storedProfiles = JSON.parse(localStorage.getItem('hiremind_saved_profiles') || '[]');
      if (Array.isArray(storedProfiles)) {
        setSavedAccounts(storedProfiles);
      }
    } catch (_) {
      setSavedAccounts([]);
    }
  }, []);

  // Board Carousel Animation
  useEffect(() => {
    if (selectedDemoRow) return;
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
    }, 3800);
    return () => clearInterval(id);
  }, [selectedDemoRow]);

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: '', color: '#64748b' };
    let score = 0;
    if (regPassword.length >= 6) score += 25;
    if (regPassword.length >= 10) score += 25;
    if (/[0-9]/.test(regPassword)) score += 25;
    if (/[^A-Za-z0-9]/.test(regPassword)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: '#fb7185' };
    if (score <= 50) return { score, label: 'Fair', color: '#f59e0b' };
    if (score <= 75) return { score, label: 'Good', color: '#60a5fa' };
    return { score, label: 'Strong', color: '#34d399' };
  }, [regPassword]);

  function saveProfileLocally(userData) {
    if (!userData || !userData.email) return;
    try {
      const existing = JSON.parse(localStorage.getItem('hiremind_saved_profiles') || '[]');
      const filtered = existing.filter((p) => p.email.toLowerCase() !== userData.email.toLowerCase());
      const updated = [
        {
          name: userData.full_name || userData.name || userData.email.split('@')[0],
          email: userData.email,
          role: userData.role || 'candidate',
          savedAt: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, 3);
      localStorage.setItem('hiremind_saved_profiles', JSON.stringify(updated));
      setSavedAccounts(updated);
    } catch (_) {}
  }

  function removeSavedProfile(emailToRemove, e) {
    if (e) e.stopPropagation();
    try {
      const updated = savedAccounts.filter((p) => p.email.toLowerCase() !== emailToRemove.toLowerCase());
      localStorage.setItem('hiremind_saved_profiles', JSON.stringify(updated));
      setSavedAccounts(updated);
      if (loginEmail === emailToRemove) {
        setLoginEmail('');
        localStorage.removeItem('hiremind_saved_email');
      }
    } catch (_) {}
  }

  async function doLogin() {
    setLoginError('');
    setLoginSuccess('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email: loginEmail.trim(), password: loginPassword },
      });
      if (data && data.access_token) {
        if (rememberMe) {
          localStorage.setItem('hiremind_saved_email', loginEmail.trim());
        } else {
          localStorage.removeItem('hiremind_saved_email');
        }
        saveProfileLocally(data.user);
        login(data.user, data.access_token);
        navigate(homeRouteForRole(data.user.role));
      } else {
        setLoginError('Invalid server response structure.');
      }
    } catch (e) {
      setLoginError(e.message || 'Login failed. Check your credentials.');
    }
  }

  async function handleDemoLogin(role) {
    setLoginError('');
    setLoginSuccess('');
    setLoadingDemo(role);
    try {
      const data = await apiRequest('/auth/demo-login', {
        method: 'POST',
        body: { role },
      });
      if (data && data.access_token) {
        saveProfileLocally(data.user);
        login(data.user, data.access_token);
        navigate(homeRouteForRole(data.user.role));
      }
    } catch (e) {
      setLoginError(e.message || 'Demo login failed.');
    } finally {
      setLoadingDemo('');
    }
  }

  async function doRegister() {
    setRegError('');
    if (!regName.trim()) {
      setRegError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Please enter your email address.');
      return;
    }
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
        body: { full_name: regName.trim(), email: regEmail.trim(), password: regPassword, role: regRole },
      });
      saveProfileLocally(data.user);
      localStorage.setItem('hiremind_saved_email', regEmail.trim());
      login(data.user, data.access_token);
      navigate(homeRouteForRole(data.user.role));
    } catch (e) {
      setRegError(e.message || 'Registration failed.');
    }
  }

  async function handleResetPassword(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail) {
      setForgotError('Please enter your account email.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { email: forgotEmail.trim(), new_password: newPassword },
      });

      setForgotSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        setTab('login');
        setLoginEmail(forgotEmail.trim());
        setLoginPassword('');
        setForgotSuccess('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotEmail('');
      }, 1600);
    } catch (e) {
      setForgotError(e.message || 'Failed to update password.');
    }
  }

  return (
    <div className="auth-layout-container">
      <style>{`
        .modal-close,
        .modal-box > button:first-child:has(svg),
        .modal-box .close-btn { display: none !important; }
        .modal-box {
          overflow: visible !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .auth-layout-container {
          width: 100vw;
          min-height: 100vh;
          background: #04060f;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.2) 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, rgba(249, 115, 22, 0.14) 0%, transparent 45%),
            linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          padding: 28px clamp(20px, 4vw, 60px);
          gap: clamp(24px, 4vw, 56px);
          box-sizing: border-box;
          font-family: var(--font-sans, sans-serif);
          color: #f8fafc;
          position: relative;
          overflow-x: hidden;
        }

        .neon-wave-svg {
          position: absolute;
          right: 25%;
          top: 0;
          height: 100%;
          width: 420px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.35;
        }

        .left-hero-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          z-index: 10;
          max-width: 680px;
        }

        .auth-brand-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 19px;
          color: #fff;
        }

        .auth-main-headline {
          font-family: var(--font-display);
          font-size: clamp(26px, 3.2vw, 38px);
          font-weight: 800;
          line-height: 1.16;
          letter-spacing: -0.025em;
          color: #fff;
          margin: 0;
        }

        .hl-gradient {
          background: linear-gradient(90deg, #c084fc 0%, #ec4899 50%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-subtext {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          font-weight: 400;
          line-height: 1.5;
        }

        .analytics-board {
          position: relative;
          border: 1.5px solid rgba(139, 92, 246, 0.45);
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(16, 13, 34, 0.85) 0%, rgba(8, 10, 24, 0.95) 100%);
          padding: 10px 16px;
          margin: 4px 0 6px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), inset 0 0 16px rgba(139, 92, 246, 0.08);
          backdrop-filter: blur(14px);
          transition: all 0.3s ease;
          z-index: 10;
        }

        .board-header-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          color: #cbd5e1;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .board-header-row span:last-child {
          text-align: center;
        }

        .board-data-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          align-items: center;
          font-size: 12px;
          color: #f8fafc;
          padding: 7px 6px;
          border-radius: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .board-data-row:hover {
          background: rgba(139, 92, 246, 0.16);
          transform: translateX(2px);
        }
        .board-data-row:last-child {
          border-bottom: none;
        }

        .table-role-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .role-icon-box {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c084fc;
          flex-shrink: 0;
        }

        .mono-text {
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .status-cell-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .badge-status {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 3px 9px;
          border-radius: 6px;
          display: inline-block;
          text-align: center;
          white-space: nowrap;
        }
        .badge-status.shortlisted { color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.1); }
        .badge-status.interview { color: #2dd4bf; border: 1px solid rgba(45, 212, 191, 0.5); background: rgba(45, 212, 191, 0.1); }
        .badge-status.applied { color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.5); background: rgba(249, 115, 22, 0.1); }
        .badge-status.hired { color: #34d399; border: 1px solid rgba(52, 211, 153, 0.5); background: rgba(52, 211, 153, 0.1); }

        .features-grid-box {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 2px;
          z-index: 10;
          position: relative;
        }

        .feature-mini-card {
          background: linear-gradient(145deg, rgba(20, 16, 42, 0.8) 0%, rgba(10, 12, 28, 0.92) 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          backdrop-filter: blur(10px);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .feature-mini-card:hover {
          transform: translateY(-2px);
          border-color: rgba(168, 85, 247, 0.6);
        }

        .feature-mini-title {
          font-weight: 700;
          font-size: 11.5px;
          color: #fff;
        }

        .feature-mini-desc {
          font-size: 10.5px;
          color: #94a3b8;
          line-height: 1.35;
        }

        .icon-box {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-box.amber { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; }
        .icon-box.teal { background: rgba(45, 212, 191, 0.15); border: 1px solid rgba(45, 212, 191, 0.4); color: #2dd4bf; }
        .icon-box.violet { background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); color: #c084fc; }

        .secure-trust-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: #34d399;
          background: rgba(16, 185, 129, 0.08);
          padding: 7px 14px;
          border-radius: 8px;
          width: fit-content;
          border: 1px solid rgba(16, 185, 129, 0.3);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.12);
        }

        /* Right Auth Panel Container */
        .auth-right-container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 10;
          width: 100%;
        }

        .glass-auth-outer-glow {
          width: 100%;
          max-width: 440px;
          border-radius: 28px;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.7) 0%, rgba(139, 92, 246, 0.25) 50%, rgba(249, 115, 22, 0.7) 100%);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
        }

        .glass-auth-wrapper {
          width: 100%;
          background: linear-gradient(135deg, rgba(16, 12, 32, 0.97) 0%, rgba(8, 10, 22, 0.99) 100%);
          border-radius: 26px;
          padding: 8px;
          box-sizing: border-box;
        }

        .glass-auth-card {
          width: 100%;
          background: linear-gradient(135deg, rgba(22, 17, 44, 0.95) 0%, rgba(10, 12, 26, 0.98) 100%);
          border-radius: 20px;
          padding: 24px;
          box-sizing: border-box;
          border: 1px solid rgba(139, 92, 246, 0.35);
        }

        .auth-tabs-switches {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(8, 10, 22, 0.8);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 14px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          gap: 4px;
        }

        .auth-tabs-switches button {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 8px 10px;
          border-radius: 9px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 36px;
          transition: all 0.2s ease;
        }

        .auth-tabs-switches button.active {
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          color: #ffffff;
          box-shadow: 0 0 16px rgba(124, 58, 237, 0.5);
        }

        /* 1-Click Saved Accounts Strip */
        .saved-accounts-box {
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .saved-accounts-label {
          font-size: 10px;
          color: #94a3b8;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .saved-account-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 10px;
          padding: 7px 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .saved-account-chip:hover {
          background: rgba(139, 92, 246, 0.24);
          border-color: #a78bfa;
          transform: translateY(-1px);
        }

        .saved-acc-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .saved-acc-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
        }

        .saved-acc-text {
          font-size: 11.5px;
          color: #f8fafc;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .saved-acc-del-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 13px;
          padding: 2px 6px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }
        .saved-acc-del-btn:hover {
          color: #fb7185;
        }

        /* Demo Strip */
        .demo-login-strip {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .demo-action-btn {
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 10px;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 700;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .demo-action-btn:hover {
          background: rgba(139, 92, 246, 0.28);
          border-color: #c084fc;
          color: #ffffff;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.35);
        }

        .glass-auth-card label {
          display: block;
          font-family: var(--font-mono);
          font-size: 10.5px;
          color: #c084fc;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .glass-auth-card input[type="email"],
        .glass-auth-card input[type="password"],
        .glass-auth-card input[type="text"] {
          width: 100%;
          background: rgba(10, 8, 24, 0.85) !important;
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 10px;
          padding: 9px 12px;
          color: #fff !important;
          font-size: 12.5px;
          outline: none;
          box-sizing: border-box;
          margin-bottom: 12px;
          transition: all 0.2s;
        }

        .glass-auth-card input:focus {
          border-color: #a855f7;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.35);
        }

        .input-icon-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          margin-bottom: 12px;
        }

        .input-icon-box input {
          margin-bottom: 0 !important;
          padding-left: 36px !important;
          padding-right: 36px !important;
        }

        .input-icon-box > svg:first-of-type {
          position: absolute;
          left: 12px;
          top: 0;
          bottom: 0;
          margin: auto;
          color: #a78bfa;
          pointer-events: none;
        }

        .pw-hide-btn {
          position: absolute;
          right: 12px;
          top: 0;
          bottom: 0;
          margin: auto;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .pw-hide-btn:hover { color: #fff; }

        .primary-action-btn {
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(168, 85, 247, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 6px;
          transition: all 0.2s ease;
        }
        .primary-action-btn:hover {
          opacity: 0.94;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(168, 85, 247, 0.6);
        }

        /* Password Live Strength Bar */
        .pw-strength-bar-box {
          margin-bottom: 12px;
        }
        .pw-strength-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 4px;
        }
        .pw-strength-fill {
          height: 100%;
          border-radius: 99px;
          transition: all 0.3s ease;
        }

        .password-checklist-box {
          display: flex;
          gap: 12px;
          font-size: 10.5px;
          color: #64748b;
          margin-bottom: 12px;
          font-family: var(--font-mono);
        }
        .password-checklist-box span { display: flex; align-items: center; gap: 4px; }
        .password-checklist-box span.ok { color: #34d399; }

        .role-grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }

        .role-picker-card {
          background: #0a0c1a;
          border: 1.5px solid rgba(139, 92, 246, 0.25);
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          transition: all 0.2s ease;
        }
        .role-picker-card.selected {
          background: rgba(139, 92, 246, 0.16);
          border-color: #a78bfa;
          box-shadow: 0 0 14px rgba(139, 92, 246, 0.25);
        }
        .rpc-radio-circle {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1.5px solid #64748b;
          position: absolute;
          right: 8px;
          top: 10px;
        }
        .role-picker-card.selected .rpc-radio-circle {
          border-color: #a78bfa;
          background: #8b5cf6;
          box-shadow: 0 0 4px #8b5cf6;
        }

        .card-divider-label {
          font-family: var(--font-mono);
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          text-align: center;
          letter-spacing: 1.5px;
          margin: 14px 0 6px 0;
          position: relative;
        }
        .card-divider-label::before, .card-divider-label::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 28%;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .card-divider-label::before { left: 0; }
        .card-divider-label::after { right: 0; }

        .auth-error-alert {
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.35);
          color: #fb7185;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11px;
          margin-top: 10px;
          font-family: var(--font-mono);
        }

        .auth-success-alert {
          background: rgba(52, 211, 153, 0.12);
          border: 1px solid rgba(52, 211, 153, 0.35);
          color: #34d399;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11px;
          margin-top: 10px;
          font-family: var(--font-mono);
        }

        .showcase-modal-box {
          background: #080d1a;
          border: 1.5px solid rgba(139, 92, 246, 0.35);
          border-radius: 20px;
          padding: 24px;
          color: #fff;
          box-shadow: 0 24px 80px rgba(0,0,0,0.95);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1080px) {
          .auth-layout-container {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
            padding: 36px 20px;
            gap: 36px;
          }
          .left-hero-section {
            max-width: 100%;
          }
        }

        @media (max-width: 580px) {
          .features-grid-box {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .board-header-row,
          .board-data-row {
            grid-template-columns: 1.8fr 1fr 1fr 1fr;
            font-size: 11px;
          }
          .role-icon-box {
            display: none;
          }
        }
      `}</style>

      {/* Background Graphic */}
      <svg className="neon-wave-svg" viewBox="0 0 300 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 -50 C250 250 -50 650 180 950" stroke="url(#paint0_linear)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M120 -50 C320 300 20 700 250 950" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <defs>
          <linearGradient id="paint0_linear" x1="50" y1="-50" x2="180" y2="950" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="paint1_linear" x1="120" y1="-50" x2="250" y2="950" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="1" stopColor="#fb923c" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>

      {/* LEFT SHOWCASE SECTION */}
      <div className="left-hero-section">
        <div className="auth-brand-logo">
          <LogoMark size={26} /> Hire<span className="hl-gradient">Mind</span> AI
        </div>

        <div>
          <h1 className="auth-main-headline">
            Every candidate,<br />
            <span className="hl-gradient">scored, ranked, and explained</span><br />
            before you open one resume.
          </h1>
          <p className="auth-subtext">AI that removes guesswork from hiring. Click any role below for a live breakdown.</p>
        </div>

        {/* CANDIDATE SCORING TABLE */}
        <div className="analytics-board" style={{ opacity: boardVisible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
          <div className="board-header-row">
            <span>Role (Click to Inspect)</span>
            <span>Score</span>
            <span>Skills matched</span>
            <span>Status</span>
          </div>
          {rows.map((row) => {
            const statusLower = row.status.toLowerCase();
            return (
              <div
                className="board-data-row"
                key={row.role + row.status}
                onClick={() => setSelectedDemoRow(row)}
                title="Click to view explainable matching breakdown"
              >
                <div className="table-role-cell">
                  <div className="role-icon-box">
                    <Icon name={row.icon} size={14} />
                  </div>
                  <span style={{ fontWeight: 600 }}>{row.role}</span>
                </div>
                <span className="mono-text">{row.score}%</span>
                <span className="mono-text" style={{ color: '#94a3b8' }}>{row.skills}</span>
                <div className="status-cell-center">
                  <span className={`badge-status ${statusLower}`}>{row.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 FEATURE CARDS */}
        <div className="features-grid-box">
          {FEATURES.map((f) => (
            <div className="feature-mini-card" key={f.title}>
              <div className={`icon-box ${f.tone}`}><Icon name={f.icon} size={14} /></div>
              <div className="feature-mini-title">{f.title}</div>
              <div className="feature-mini-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="secure-trust-strip">
          <div className="icon-box teal" style={{ width: 18, height: 18 }}><Icon name="shield" size={11} /></div>
          No external API keys required — everything runs on your machine.
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className="auth-right-container">
        <div className="glass-auth-outer-glow">
          <div className="glass-auth-wrapper">
            <div className="glass-auth-card">
              
              {tab !== 'forgot' && (
                <>
                  <div className="auth-tabs-switches">
                    <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')} type="button">
                      <Icon name="user" size={13} /> Log in
                    </button>
                    <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')} type="button">
                      <Icon name="userPlus" size={13} /> Create account
                    </button>
                  </div>

                  {/* 1-Click Fast Demo Logins */}
                  <div className="demo-login-strip">
                    <button
                      type="button"
                      className="demo-action-btn"
                      onClick={() => handleDemoLogin('recruiter')}
                      disabled={Boolean(loadingDemo)}
                    >
                      ⚡ Recruiter Demo
                    </button>
                    <button
                      type="button"
                      className="demo-action-btn"
                      onClick={() => handleDemoLogin('candidate')}
                      disabled={Boolean(loadingDemo)}
                    >
                      ⚡ Candidate Demo
                    </button>
                  </div>
                </>
              )}

              {/* LOGIN VIEW */}
              {tab === 'login' && (
                <div>
                  {/* Saved 1-Click Accounts Strip */}
                  {savedAccounts.length > 0 && (
                    <div className="saved-accounts-box">
                      <div className="saved-accounts-label">Quick Sign-in</div>
                      {savedAccounts.map((acc) => (
                        <div
                          key={acc.email}
                          className="saved-account-chip"
                          onClick={() => {
                            setLoginEmail(acc.email);
                            const passwordInput = document.querySelector('input[type="password"]');
                            if (passwordInput) passwordInput.focus();
                          }}
                        >
                          <div className="saved-acc-left">
                            <div className="saved-acc-avatar">{acc.name.charAt(0).toUpperCase()}</div>
                            <div style={{ minWidth: 0 }}>
                              <div className="saved-acc-text">{acc.name}</div>
                              <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>{acc.email}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="saved-acc-del-btn"
                            onClick={(e) => removeSavedProfile(acc.email, e)}
                            title="Remove saved account"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label>Email</label>
                  <div className="input-icon-box">
                    <Icon name="mail" size={14} />
                    <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" />
                  </div>

                  <label>Password</label>
                  <div className="input-icon-box">
                    <Icon name="lock" size={14} />
                    <input type={showLoginPw ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                    <button className="pw-hide-btn" onClick={() => setShowLoginPw((v) => !v)} type="button">
                      <Icon name={showLoginPw ? 'eyeOff' : 'eye'} size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', marginBottom: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', textTransform: 'none', margin: 0 }}>
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#08d612', width: '13px', height: '13px' }} /> Remember me
                    </label>
                    <span style={{ color: '#47e309', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setTab('forgot'); setForgotEmail(loginEmail); }}>
                      Forgot password?
                    </span>
                  </div>

                  <button className="primary-action-btn" onClick={doLogin} type="button">
                    Log in <span style={{ fontSize: '15px' }}>→</span>
                  </button>

                  {loginError && <div className="auth-error-alert">{loginError}</div>}
                  {loginSuccess && <div className="auth-success-alert">{loginSuccess}</div>}
                </div>
              )}

              {/* REGISTER VIEW */}
              {tab === 'register' && (
                <div>
                  <label>Full name</label>
                  <div className="input-icon-box">
                    <Icon name="user" size={14} />
                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Shyam Choubey" autoComplete="off" />
                  </div>

                  <label>Email</label>
                  <div className="input-icon-box">
                    <Icon name="mail" size={14} />
                    <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" autoComplete="off" />
                  </div>

                  <label>Password</label>
                  <div className="input-icon-box">
                    <Icon name="lock" size={14} />
                    <input type={showRegPw ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="min 6 characters" autoComplete="new-password" />
                    <button className="pw-hide-btn" onClick={() => setShowRegPw((v) => !v)} type="button">
                      <Icon name={showRegPw ? 'eyeOff' : 'eye'} size={15} />
                    </button>
                  </div>

                  {/* Real-time Password Strength Meter */}
                  {regPassword.length > 0 && (
                    <div className="pw-strength-bar-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#94a3b8' }}>Strength:</span>
                        <span style={{ color: passwordStrength.color, fontWeight: 700 }}>{passwordStrength.label}</span>
                      </div>
                      <div className="pw-strength-track">
                        <div className="pw-strength-fill" style={{ width: `${passwordStrength.score}%`, background: passwordStrength.color }} />
                      </div>
                    </div>
                  )}

                  <label>Confirm password</label>
                  <div className="input-icon-box">
                    <Icon name="lock" size={14} />
                    <input type={showRegPw ? 'text' : 'password'} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} placeholder="repeat password" autoComplete="new-password" />
                  </div>

                  <div className="password-checklist-box">
                    <span className={regPassword.length >= 6 ? 'ok' : ''}>
                      <Icon name="checkCircle" size={11} /> At least 6 chars
                    </span>
                    <span className={regConfirm.length > 0 && regConfirm === regPassword ? 'ok' : ''}>
                      <Icon name="checkCircle" size={11} /> Passwords match
                    </span>
                  </div>

                  <label>I am a</label>
                  <div className="role-grid-container">
                    <div className={`role-picker-card${regRole === 'candidate' ? ' selected' : ''}`} onClick={() => setRegRole('candidate')}>
                      <span className="rpc-radio-circle" />
                      <div className="icon-box violet" style={{ width: 28, height: 28 }}><Icon name="resume" size={16} /></div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff' }}>Candidate</div>
                        <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>Looking for job</div>
                      </div>
                    </div>
                    <div className={`role-picker-card${regRole === 'recruiter' ? ' selected' : ''}`} onClick={() => setRegRole('recruiter')}>
                      <span className="rpc-radio-circle" />
                      <div className="icon-box amber" style={{ width: 28, height: 28 }}><Icon name="briefcase" size={16} /></div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#fff' }}>Recruiter</div>
                        <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>Hiring talent</div>
                      </div>
                    </div>
                  </div>

                  <button className="primary-action-btn" onClick={doRegister} type="button">
                    Create account <span style={{ fontSize: '15px' }}>→</span>
                  </button>

                  {regError && <div className="auth-error-alert">{regError}</div>}
                </div>
              )}

              {/* FORGOT / RESET PASSWORD VIEW */}
              {tab === 'forgot' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, color: '#c084fc' }}>Reset Password</label>
                    <span style={{ fontSize: '11px', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setTab('login')}>
                      ← Back to login
                    </span>
                  </div>

                  <label>Account Email</label>
                  <div className="input-icon-box">
                    <Icon name="mail" size={14} />
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" />
                  </div>

                  <label>New Password</label>
                  <div className="input-icon-box">
                    <Icon name="lock" size={14} />
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="min 6 characters" />
                  </div>

                  <label>Confirm New Password</label>
                  <div className="input-icon-box">
                    <Icon name="lock" size={14} />
                    <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="repeat new password" />
                  </div>

                  <button className="primary-action-btn" onClick={handleResetPassword} type="button">
                    Update Password <span style={{ fontSize: '15px' }}>→</span>
                  </button>

                  {forgotError && <div className="auth-error-alert">{forgotError}</div>}
                  {forgotSuccess && <div className="auth-success-alert">{forgotSuccess}</div>}
                </div>
              )}

              <div className="card-divider-label">prototype</div>
              <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4, textAlign: 'center', margin: 0 }}>
                Runs entirely on your machine — FastAPI backend, SQLite storage, scikit-learn matching. No external API keys required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Explainable AI Match Modal */}
      <Modal open={Boolean(selectedDemoRow)} onClose={() => setSelectedDemoRow(null)} maxWidth={440}>
        {selectedDemoRow && (
          <div className="showcase-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{selectedDemoRow.role}</h3>
                <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>AI Explainable Match Breakdown</span>
              </div>
              <span className={`badge-status ${selectedDemoRow.status.toLowerCase()}`}>{selectedDemoRow.status}</span>
            </div>

            <div style={{ background: '#03050d', padding: '12px', borderRadius: '10px', border: '1.5px solid rgba(139,92,246,0.2)', marginBottom: '12px', fontSize: '12px', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Overall Match Score:</span>
                <strong style={{ color: '#2dd4bf' }}>{selectedDemoRow.score}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>TF-IDF Semantic Match:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(selectedDemoRow.tfidf * 100)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Key Skill Overlap:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedDemoRow.skills} matched</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 6, fontWeight: 700 }}>Matched Core Competencies:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedDemoRow.skillsList.map((sk) => (
                  <span key={sk} style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c084fc', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="primary-action-btn"
              onClick={() => setSelectedDemoRow(null)}
            >
              Close Preview
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
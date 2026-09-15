// import { useState, useRef, useEffect } from 'react';
// import { apiRequest } from '../../api';
// import { useToast } from '../../context/ToastContext';
// import SkillTags from '../../components/SkillTags';
// import Icon from '../../components/Icon';
// import LocationMapModal from './LocationMapModal';
// import './LocationPicker.css';

// const FEATURES = [
//   { icon: 'sparkles', color: 'violet', title: 'AI-Powered', desc: 'Extracts key skills' },
//   { icon: 'shield', color: 'blue', title: 'Smart Detection', desc: 'Identifies experience' },
//   { icon: 'zap', color: 'rust', title: 'Saves Time', desc: 'Automated analysis' },
// ];

// const JOB_TITLE_PRESETS = [
//   {
//     label: 'Engineering & Tech',
//     items: [
//       { name: 'Full Stack Engineer', badge: 'purple' },
//       { name: 'Frontend Engineer', badge: 'cyan' },
//       { name: 'Backend Engineer', badge: 'blue' },
//       { name: 'DevOps / Cloud Engineer', badge: 'orange' },
//       { name: 'Mobile App Developer (iOS/Android)', badge: 'pink' },
//       { name: 'QA / Automation Engineer', badge: 'green' },
//       { name: 'Security Engineer', badge: 'blue' },
//     ],
//   },
//   {
//     label: 'Data & AI',
//     items: [
//       { name: 'AI / Machine Learning Engineer', badge: 'purple' },
//       { name: 'Data Scientist', badge: 'cyan' },
//       { name: 'Data Engineer', badge: 'blue' },
//       { name: 'Data Analyst', badge: 'green' },
//     ],
//   },
//   {
//     label: 'Product & Design',
//     items: [
//       { name: 'Product Manager', badge: 'orange' },
//       { name: 'Technical Project Manager', badge: 'purple' },
//       { name: 'UI/UX Designer', badge: 'pink' },
//       { name: 'Product Designer', badge: 'cyan' },
//     ],
//   },
//   {
//     label: 'Marketing, Sales & Growth',
//     items: [
//       { name: 'Growth Marketing Manager', badge: 'orange' },
//       { name: 'Digital Marketing Specialist', badge: 'pink' },
//       { name: 'Business Development Representative (BDR)', badge: 'blue' },
//       { name: 'Account Executive', badge: 'green' },
//     ],
//   },
//   {
//     label: 'Operations, Finance & HR',
//     items: [
//       { name: 'HR Manager / Tech Recruiter', badge: 'pink' },
//       { name: 'Operations Manager', badge: 'cyan' },
//       { name: 'Financial Analyst', badge: 'green' },
//     ],
//   },
// ];

// const LOCATION_PRESETS = [
//   {
//     label: 'Work type',
//     items: [
//       { name: 'Remote', type: 'remote' },
//       { name: 'Hybrid', type: 'hybrid' },
//       { name: 'On-site', type: 'onsite' },
//     ],
//   },
//   {
//     label: 'Popular cities',
//     items: [
//       { name: 'Bengaluru', type: 'city-purple' },
//       { name: 'Mumbai', type: 'city-blue' },
//       { name: 'Delhi NCR', type: 'city-cyan' },
//       { name: 'Pune', type: 'city-pink' },
//       { name: 'Hyderabad', type: 'city-purple' },
//       { name: 'Chennai', type: 'city-blue' },
//       { name: 'Kolkata', type: 'city-cyan' },
//       { name: 'Gurugram', type: 'city-pink' },
//       { name: 'Noida', type: 'city-purple' },
//       { name: 'Ahmedabad', type: 'city-blue' },
//     ],
//   },
// ];

// const EXPERIENCE_PRESETS = [
//   {
//     label: 'Seniority Level',
//     items: [
//       { label: 'Entry Level (Fresher)', value: 0, sub: '0 years', badge: 'green' },
//       { label: 'Junior', value: 1, sub: '1 - 2 years', badge: 'blue' },
//       { label: 'Mid-Level', value: 3, sub: '3 - 5 years', badge: 'purple' },
//       { label: 'Senior', value: 5, sub: '5 - 8 years', badge: 'orange' },
//       { label: 'Lead / Principal', value: 8, sub: '8+ years', badge: 'pink' },
//     ],
//   },
//   {
//     label: 'Specific Years',
//     items: [
//       { label: '1 Year', value: 1, sub: '', badge: 'blue' },
//       { label: '2 Years', value: 2, sub: '', badge: 'blue' },
//       { label: '3 Years', value: 3, sub: '', badge: 'purple' },
//       { label: '4 Years', value: 4, sub: '', badge: 'purple' },
//       { label: '5 Years', value: 5, sub: '', badge: 'orange' },
//       { label: '7 Years', value: 7, sub: '', badge: 'orange' },
//       { label: '10+ Years', value: 10, sub: '', badge: 'pink' },
//     ],
//   },
// ];

// function RenderPresetIcon({ type }) {
//   switch (type) {
//     case 'remote':
//       return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
//           <line x1="8" y1="21" x2="16" y2="21" />
//           <line x1="12" y1="17" x2="12" y2="21" />
//         </svg>
//       );
//     case 'hybrid':
//       return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//           <polyline points="9 22 9 12 15 12 15 22" />
//         </svg>
//       );
//     case 'onsite':
//       return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
//           <line x1="9" y1="22" x2="9" y2="22.01" />
//           <line x1="15" y1="22" x2="15.01" y2="22" />
//           <line x1="9" y1="6" x2="9.01" y2="6" />
//           <line x1="15" y1="6" x2="15.01" y2="6" />
//           <line x1="9" y1="10" x2="9.01" y2="10" />
//           <line x1="15" y1="10" x2="15.01" y2="10" />
//           <line x1="9" y1="14" x2="9.01" y2="14" />
//           <line x1="15" y1="14" x2="15.01" y2="14" />
//         </svg>
//       );
//     default:
//       return (
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//           <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
//           <circle cx="12" cy="10" r="3" />
//         </svg>
//       );
//   }
// }

// export default function PostJob() {
//   const [title, setTitle] = useState('');
//   const [location, setLocation] = useState('Remote');
//   const [minExp, setMinExp] = useState('');
//   const [description, setDescription] = useState('');
//   const [error, setError] = useState('');
//   const [resultSkills, setResultSkills] = useState(null);
//   const [posting, setPosting] = useState(false);

//   const [showTitleDropdown, setShowTitleDropdown] = useState(false);
//   const [showLocationDropdown, setShowLocationDropdown] = useState(false);
//   const [showExpDropdown, setShowExpDropdown] = useState(false);
//   const [showMapPicker, setShowMapPicker] = useState(false);

//   const toast = useToast();
//   const titleFieldRef = useRef(null);
//   const locationFieldRef = useRef(null);
//   const expFieldRef = useRef(null);

//   // Close dropdowns on outside click
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (titleFieldRef.current && !titleFieldRef.current.contains(e.target)) {
//         setShowTitleDropdown(false);
//       }
//       if (locationFieldRef.current && !locationFieldRef.current.contains(e.target)) {
//         setShowLocationDropdown(false);
//       }
//       if (expFieldRef.current && !expFieldRef.current.contains(e.target)) {
//         setShowExpDropdown(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   async function createJob() {
//     setError('');
//     if (!title.trim() || !description.trim()) {
//       setError('Title and description are required.');
//       return;
//     }
//     setPosting(true);
//     try {
//       const job = await apiRequest('/jobs', {
//         method: 'POST',
//         body: {
//           title: title.trim(),
//           location: location.trim() || 'Remote',
//           min_experience: parseFloat(minExp) || 0,
//           description: description.trim(),
//         },
//       });
//       toast(`Job posted: ${job.title}`, 'success');
//       setResultSkills(job.required_skills);
//       setTitle('');
//       setDescription('');
//       setMinExp('');
//     } catch (e) {
//       setError(e.message);
//       toast(e.message, 'error');
//     } finally {
//       setPosting(false);
//     }
//   }

//   return (
//     <div className="postjob-page">
//       <div className="page-header">
//         <div className="postjob-badge">
//           <Icon name="sparkles" size={11} /> New posting
//         </div>
//         <h1 className="page-title" style={{ marginTop: 10 }}>
//           Post a <span className="hl">job</span>
//         </h1>
//         <p className="page-sub">
//           Paste the JD — the AI extracts required skills and infers minimum experience automatically.
//         </p>
//       </div>

//       <div className="postjob-dots" />
//       <div className="postjob-lines" />

//       <div className="card postjob-card">
//         {/* STEP 1: JOB TITLE */}
//         <label className="postjob-label">
//           <span className="step-num">1</span>
//           <Icon name="briefcase" size={14} /> Job title
//         </label>
//         <div className="input-icon-trail" ref={titleFieldRef}>
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="e.g. Backend Engineer"
//             onClick={() => setShowTitleDropdown((prev) => !prev)}
//             style={{ cursor: 'pointer' }}
//           />
//           <Icon
//             name="briefcase"
//             size={15}
//             className="pj-exp-clock-btn"
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowTitleDropdown((prev) => !prev);
//             }}
//             role="button"
//             tabIndex={0}
//             aria-label="Toggle corporate job options"
//           />

//           {showTitleDropdown && (
//             <div className="pj-loc-dropdown pj-title-dropdown">
//               {JOB_TITLE_PRESETS.map((group) => (
//                 <div className="pj-loc-group" key={group.label}>
//                   <div className="pj-loc-group-label">{group.label}</div>
//                   {group.items.map((item) => {
//                     const isSelected = title.trim().toLowerCase() === item.name.toLowerCase();
//                     return (
//                       <button
//                         type="button"
//                         key={item.name}
//                         className={`pj-loc-item ${isSelected ? 'selected' : ''}`}
//                         onClick={() => {
//                           setTitle(item.name);
//                           setShowTitleDropdown(false);
//                         }}
//                       >
//                         <div className="pj-loc-item-left">
//                           <span className={`pj-loc-icon icon-${item.badge}`}>
//                             <Icon name="briefcase" size={15} />
//                           </span>
//                           <span className="pj-loc-text">{item.name}</span>
//                         </div>

//                         {isSelected && (
//                           <span className="pj-loc-check">
//                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
//                               <polyline points="20 6 9 17 4 12" />
//                             </svg>
//                           </span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* STEP 2 & 3: LOCATION & EXPERIENCE */}
//         <div className="grid-2">
//           {/* LOCATION */}
//           <div>
//             <label className="postjob-label">
//               <span className="step-num">2</span>
//               <Icon name="pin" size={14} /> Location
//             </label>
//             <div
//               className="input-icon-trail two-icons"
//               ref={locationFieldRef}
//             >
//               <input
//                 type="text"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 placeholder="Remote / Bengaluru / Hybrid"
//                 onClick={() => setShowLocationDropdown((prev) => !prev)}
//                 style={{ cursor: 'pointer' }}
//               />

//               <Icon
//                 name="chevronDown"
//                 size={13}
//                 className="pj-loc-chevron"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowLocationDropdown((prev) => !prev);
//                 }}
//                 role="button"
//                 tabIndex={0}
//                 aria-label="Choose from presets"
//               />
//               <Icon
//                 name="pin"
//                 size={15}
//                 className="pj-loc-pin"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowLocationDropdown(false);
//                   setShowMapPicker(true);
//                 }}
//                 role="button"
//                 tabIndex={0}
//                 aria-label="Pick location on map"
//               />

//               {showLocationDropdown && (
//                 <div className="pj-loc-dropdown">
//                   {LOCATION_PRESETS.map((group) => (
//                     <div className="pj-loc-group" key={group.label}>
//                       <div className="pj-loc-group-label">{group.label}</div>
//                       {group.items.map((item) => {
//                         const isSelected = location.trim().toLowerCase() === item.name.toLowerCase();
//                         return (
//                           <button
//                             type="button"
//                             key={item.name}
//                             className={`pj-loc-item ${isSelected ? 'selected' : ''}`}
//                             onClick={() => {
//                               setLocation(item.name);
//                               setShowLocationDropdown(false);
//                             }}
//                           >
//                             <div className="pj-loc-item-left">
//                               <span className={`pj-loc-icon icon-${item.type}`}>
//                                 <RenderPresetIcon type={item.type} />
//                               </span>
//                               <span className="pj-loc-text">{item.name}</span>
//                             </div>

//                             {isSelected && (
//                               <span className="pj-loc-check">
//                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
//                                   <polyline points="20 6 9 17 4 12" />
//                                 </svg>
//                               </span>
//                             )}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* EXPERIENCE */}
//           <div>
//             <label className="postjob-label">
//               <span className="step-num">3</span>
//               <Icon name="clock" size={14} /> Minimum experience (yrs, optional)
//             </label>
//             <div
//               className="input-icon-trail"
//               ref={expFieldRef}
//             >
//               <input
//                 type="number"
//                 value={minExp}
//                 onChange={(e) => setMinExp(e.target.value)}
//                 placeholder="AI infers if left blank"
//                 min="0"
//                 step="0.5"
//                 onClick={() => setShowExpDropdown((prev) => !prev)}
//                 style={{ cursor: 'pointer' }}
//               />
//               <Icon
//                 name="clock"
//                 size={15}
//                 className="pj-exp-clock-btn"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setShowExpDropdown((prev) => !prev);
//                 }}
//                 role="button"
//                 tabIndex={0}
//                 aria-label="Toggle experience level"
//               />

//               {showExpDropdown && (
//                 <div className="pj-loc-dropdown pj-exp-dropdown">
//                   {EXPERIENCE_PRESETS.map((group) => (
//                     <div className="pj-loc-group" key={group.label}>
//                       <div className="pj-loc-group-label">{group.label}</div>
//                       {group.items.map((item) => {
//                         const isSelected = minExp !== '' && parseFloat(minExp) === item.value;
//                         return (
//                           <button
//                             type="button"
//                             key={item.label}
//                             className={`pj-loc-item ${isSelected ? 'selected' : ''}`}
//                             onClick={() => {
//                               setMinExp(item.value.toString());
//                               setShowExpDropdown(false);
//                             }}
//                           >
//                             <div className="pj-loc-item-left">
//                               <span className={`pj-loc-icon icon-${item.badge}`}>
//                                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <circle cx="12" cy="12" r="10" />
//                                   <polyline points="12 6 12 12 16 14" />
//                                 </svg>
//                               </span>
//                               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
//                                 <span className="pj-loc-text">{item.label}</span>
//                                 {item.sub && <span className="pj-exp-subtext">{item.sub}</span>}
//                               </div>
//                             </div>

//                             {isSelected && (
//                               <span className="pj-loc-check">
//                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
//                                   <polyline points="20 6 9 17 4 12" />
//                                 </svg>
//                               </span>
//                             )}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* STEP 4: JOB DESCRIPTION */}
//         <label className="postjob-label">
//           <span className="step-num">4</span>
//           <Icon name="resume" size={14} /> Job description
//         </label>
//         <div className="textarea-icon-wrap">
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             placeholder="Paste the full JD here..."
//             style={{ minHeight: 160 }}
//           />
//           <Icon name="resume" size={15} />
//         </div>

//         <div className="postjob-footer-row">
//           <div className="postjob-features">
//             {FEATURES.map((f) => (
//               <div className="postjob-feature-item" key={f.title}>
//                 <div
//                   className={`icon-badge ${f.color}`}
//                   style={{ width: 36, height: 36, borderRadius: 9 }}
//                 >
//                   <Icon name={f.icon} size={16} />
//                 </div>
//                 <div>
//                   <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5 }}>
//                     {f.title}
//                   </div>
//                   <div className="muted" style={{ fontSize: 11 }}>
//                     {f.desc}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <button className="postjob-submit" onClick={createJob} disabled={posting}>
//             <Icon name="rocket" size={16} />{' '}
//             {posting ? 'Posting...' : 'Post job — AI extracts required skills'}{' '}
//             <Icon name="arrowRight" size={15} />
//           </button>
//         </div>
//         {error && <div className="error">{error}</div>}
//       </div>

//       {resultSkills && (
//         <div className="card">
//           <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <Icon name="checkCircle" size={18} style={{ color: 'var(--teal)' }} /> Job posted — AI-extracted skills
//           </h2>
//           <SkillTags skills={resultSkills} cls="matched" />
//         </div>
//       )}

//       {showMapPicker && (
//         <LocationMapModal
//           onClose={() => setShowMapPicker(false)}
//           onSelect={(address) => {
//             setLocation(address);
//             setShowMapPicker(false);
//           }}
//         />
//       )}

//       <div className="postjob-dots" />
//       <svg className="postjob-lines" viewBox="0 0 460 380" fill="none" aria-hidden="true">
//         <defs>
//           <linearGradient id="pjLineA" x1="460" y1="10" x2="60" y2="300" gradientUnits="userSpaceOnUse">
//             <stop offset="0%" stopColor="#f97316" />
//             <stop offset="45%" stopColor="#d946ef" />
//             <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="pjLineB" x1="460" y1="60" x2="110" y2="360" gradientUnits="userSpaceOnUse">
//             <stop offset="0%" stopColor="#fb923c" />
//             <stop offset="55%" stopColor="#a78bfa" />
//             <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
//           </linearGradient>
//         </defs>
//         <path
//           d="M480 -10 C 380 70, 340 110, 230 190 C 150 250, 90 300, 20 360"
//           stroke="url(#pjLineA)"
//           strokeWidth="1.6"
//           opacity="0.6"
//         />
//         <path
//           d="M480 50 C 400 110, 360 150, 260 220 C 180 280, 120 330, 60 380"
//           stroke="url(#pjLineB)"
//           strokeWidth="1.3"
//           opacity="0.4"
//         />
//       </svg>
//     </div>
//   );
// }











import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import SkillTags from '../../components/SkillTags';
import Icon from '../../components/Icon';
import LocationMapModal from './LocationMapModal';
import './LocationPicker.css';

const FEATURES = [
  { icon: 'sparkles', color: 'violet', title: 'AI-Powered', desc: 'Extracts key skills' },
  { icon: 'shield', color: 'blue', title: 'Smart Detection', desc: 'Identifies experience' },
  { icon: 'zap', color: 'rust', title: 'Saves Time', desc: 'Automated analysis' },
];

const JOB_TITLE_PRESETS = [
  {
    label: 'Engineering & Tech',
    items: [
      { name: 'Full Stack Engineer', badge: 'purple' },
      { name: 'Frontend Engineer', badge: 'cyan' },
      { name: 'Backend Engineer', badge: 'blue' },
      { name: 'DevOps / Cloud Engineer', badge: 'orange' },
      { name: 'Mobile App Developer (iOS/Android)', badge: 'pink' },
      { name: 'QA / Automation Engineer', badge: 'green' },
      { name: 'Security Engineer', badge: 'blue' },
    ],
  },
  {
    label: 'Data & AI',
    items: [
      { name: 'AI / Machine Learning Engineer', badge: 'purple' },
      { name: 'Data Scientist', badge: 'cyan' },
      { name: 'Data Engineer', badge: 'blue' },
      { name: 'Data Analyst', badge: 'green' },
    ],
  },
  {
    label: 'Product & Design',
    items: [
      { name: 'Product Manager', badge: 'orange' },
      { name: 'Technical Project Manager', badge: 'purple' },
      { name: 'UI/UX Designer', badge: 'pink' },
      { name: 'Product Designer', badge: 'cyan' },
    ],
  },
  {
    label: 'Marketing, Sales & Growth',
    items: [
      { name: 'Growth Marketing Manager', badge: 'orange' },
      { name: 'Digital Marketing Specialist', badge: 'pink' },
      { name: 'Business Development Representative (BDR)', badge: 'blue' },
      { name: 'Account Executive', badge: 'green' },
    ],
  },
  {
    label: 'Operations, Finance & HR',
    items: [
      { name: 'HR Manager / Tech Recruiter', badge: 'pink' },
      { name: 'Operations Manager', badge: 'cyan' },
      { name: 'Financial Analyst', badge: 'green' },
    ],
  },
];

const LOCATION_PRESETS = [
  {
    label: 'Work type',
    items: [
      { name: 'Remote', type: 'remote' },
      { name: 'Hybrid', type: 'hybrid' },
      { name: 'On-site', type: 'onsite' },
    ],
  },
  {
    label: 'Popular cities',
    items: [
      { name: 'Bengaluru', type: 'city-purple' },
      { name: 'Mumbai', type: 'city-blue' },
      { name: 'Delhi NCR', type: 'city-cyan' },
      { name: 'Pune', type: 'city-pink' },
      { name: 'Hyderabad', type: 'city-purple' },
      { name: 'Chennai', type: 'city-blue' },
      { name: 'Kolkata', type: 'city-cyan' },
      { name: 'Gurugram', type: 'city-pink' },
      { name: 'Noida', type: 'city-purple' },
      { name: 'Ahmedabad', type: 'city-blue' },
    ],
  },
];

const EXPERIENCE_PRESETS = [
  {
    label: 'Seniority Level',
    items: [
      { label: 'Entry Level (Fresher)', value: 0, sub: '0 years', badge: 'green' },
      { label: 'Junior', value: 1, sub: '1 - 2 years', badge: 'blue' },
      { label: 'Mid-Level', value: 3, sub: '3 - 5 years', badge: 'purple' },
      { label: 'Senior', value: 5, sub: '5 - 8 years', badge: 'orange' },
      { label: 'Lead / Principal', value: 8, sub: '8+ years', badge: 'pink' },
    ],
  },
  {
    label: 'Specific Years',
    items: [
      { label: '1 Year', value: 1, sub: '', badge: 'blue' },
      { label: '2 Years', value: 2, sub: '', badge: 'blue' },
      { label: '3 Years', value: 3, sub: '', badge: 'purple' },
      { label: '4 Years', value: 4, sub: '', badge: 'purple' },
      { label: '5 Years', value: 5, sub: '', badge: 'orange' },
      { label: '7 Years', value: 7, sub: '', badge: 'orange' },
      { label: '10+ Years', value: 10, sub: '', badge: 'pink' },
    ],
  },
];

function RenderPresetIcon({ type }) {
  switch (type) {
    case 'remote':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'hybrid':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'onsite':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="9" y2="22.01" />
          <line x1="15" y1="22" x2="15.01" y2="22" />
          <line x1="9" y1="6" x2="9.01" y2="6" />
          <line x1="15" y1="6" x2="15.01" y2="6" />
          <line x1="9" y1="10" x2="9.01" y2="10" />
          <line x1="15" y1="10" x2="15.01" y2="10" />
          <line x1="9" y1="14" x2="9.01" y2="14" />
          <line x1="15" y1="14" x2="15.01" y2="14" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
  }
}

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [minExp, setMinExp] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [resultSkills, setResultSkills] = useState(null);
  const [posting, setPosting] = useState(false);
  const [livePreviewSkills, setLivePreviewSkills] = useState([]);

  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const toast = useToast();
  const titleFieldRef = useRef(null);
  const locationFieldRef = useRef(null);
  const expFieldRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (titleFieldRef.current && !titleFieldRef.current.contains(e.target)) {
        setShowTitleDropdown(false);
      }
      if (locationFieldRef.current && !locationFieldRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
      if (expFieldRef.current && !expFieldRef.current.contains(e.target)) {
        setShowExpDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function createJob() {
    setError('');
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setPosting(true);
    try {
      const job = await apiRequest('/jobs', {
        method: 'POST',
        body: {
          title: title.trim(),
          location: location.trim() || 'Remote',
          min_experience: parseFloat(minExp) || 0,
          description: description.trim(),
        },
      });
      toast(`Job posted: ${job.title}`, 'success');
      setResultSkills(job.required_skills);
      setTitle('');
      setDescription('');
      setMinExp('');
      setLivePreviewSkills([]);
    } catch (e) {
      setError(e.message);
      toast(e.message, 'error');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="postjob-page">
      <div className="page-header">
        <div className="postjob-badge">
          <Icon name="sparkles" size={11} /> New posting
        </div>
        <h1 className="page-title" style={{ marginTop: 10 }}>
          Post a <span className="hl">job</span>
        </h1>
        <p className="page-sub">
          Paste the JD — the AI extracts required skills and infers minimum experience automatically.
        </p>
      </div>

      <div className="postjob-dots" />
      <div className="postjob-lines" />

      <div className="card postjob-card">
        {/* STEP 1: JOB TITLE */}
        <label className="postjob-label">
          <span className="step-num">1</span>
          <Icon name="briefcase" size={14} /> Job title
        </label>
        <div className="input-icon-trail" ref={titleFieldRef}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Backend Engineer"
            onClick={() => setShowTitleDropdown((prev) => !prev)}
            style={{ cursor: 'pointer' }}
          />
          <Icon
            name="briefcase"
            size={15}
            className="pj-exp-clock-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowTitleDropdown((prev) => !prev);
            }}
            role="button"
            tabIndex={0}
            aria-label="Toggle corporate job options"
          />

          {showTitleDropdown && (
            <div className="pj-loc-dropdown pj-title-dropdown">
              {JOB_TITLE_PRESETS.map((group) => (
                <div className="pj-loc-group" key={group.label}>
                  <div className="pj-loc-group-label">{group.label}</div>
                  {group.items.map((item) => {
                    const isSelected = title.trim().toLowerCase() === item.name.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={item.name}
                        className={`pj-loc-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setTitle(item.name);
                          setShowTitleDropdown(false);
                        }}
                      >
                        <div className="pj-loc-item-left">
                          <span className={`pj-loc-icon icon-${item.badge}`}>
                            <Icon name="briefcase" size={15} />
                          </span>
                          <span className="pj-loc-text">{item.name}</span>
                        </div>

                        {isSelected && (
                          <span className="pj-loc-check">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STEP 2 & 3: LOCATION & EXPERIENCE */}
        <div className="grid-2">
          {/* LOCATION */}
          <div>
            <label className="postjob-label">
              <span className="step-num">2</span>
              <Icon name="pin" size={14} /> Location
            </label>
            <div
              className="input-icon-trail two-icons"
              ref={locationFieldRef}
            >
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote / Bengaluru / Hybrid"
                onClick={() => setShowLocationDropdown((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              />

              <Icon
                name="chevronDown"
                size={13}
                className="pj-loc-chevron"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLocationDropdown((prev) => !prev);
                }}
                role="button"
                tabIndex={0}
                aria-label="Choose from presets"
              />
              <Icon
                name="pin"
                size={15}
                className="pj-loc-pin"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLocationDropdown(false);
                  setShowMapPicker(true);
                }}
                role="button"
                tabIndex={0}
                aria-label="Pick location on map"
              />

              {showLocationDropdown && (
                <div className="pj-loc-dropdown">
                  {LOCATION_PRESETS.map((group) => (
                    <div className="pj-loc-group" key={group.label}>
                      <div className="pj-loc-group-label">{group.label}</div>
                      {group.items.map((item) => {
                        const isSelected = location.trim().toLowerCase() === item.name.toLowerCase();
                        return (
                          <button
                            type="button"
                            key={item.name}
                            className={`pj-loc-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setLocation(item.name);
                              setShowLocationDropdown(false);
                            }}
                          >
                            <div className="pj-loc-item-left">
                              <span className={`pj-loc-icon icon-${item.type}`}>
                                <RenderPresetIcon type={item.type} />
                              </span>
                              <span className="pj-loc-text">{item.name}</span>
                            </div>

                            {isSelected && (
                              <span className="pj-loc-check">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* EXPERIENCE */}
          <div>
            <label className="postjob-label">
              <span className="step-num">3</span>
              <Icon name="clock" size={14} /> Minimum experience (yrs, optional)
            </label>
            <div
              className="input-icon-trail"
              ref={expFieldRef}
            >
              <input
                type="number"
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                placeholder="AI infers if left blank"
                min="0"
                step="0.5"
                onClick={() => setShowExpDropdown((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              />
              <Icon
                name="clock"
                size={15}
                className="pj-exp-clock-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExpDropdown((prev) => !prev);
                }}
                role="button"
                tabIndex={0}
                aria-label="Toggle experience level"
              />

              {showExpDropdown && (
                <div className="pj-loc-dropdown pj-exp-dropdown">
                  {EXPERIENCE_PRESETS.map((group) => (
                    <div className="pj-loc-group" key={group.label}>
                      <div className="pj-loc-group-label">{group.label}</div>
                      {group.items.map((item) => {
                        const isSelected = minExp !== '' && parseFloat(minExp) === item.value;
                        return (
                          <button
                            type="button"
                            key={item.label}
                            className={`pj-loc-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setMinExp(item.value.toString());
                              setShowExpDropdown(false);
                            }}
                          >
                            <div className="pj-loc-item-left">
                              <span className={`pj-loc-icon icon-${item.badge}`}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                                <span className="pj-loc-text">{item.label}</span>
                                {item.sub && <span className="pj-exp-subtext">{item.sub}</span>}
                              </div>
                            </div>

                            {isSelected && (
                              <span className="pj-loc-check">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 4: JOB DESCRIPTION */}
        <label className="postjob-label">
          <span className="step-num">4</span>
          <Icon name="resume" size={14} /> Job description
        </label>
        <div className="textarea-icon-wrap">
          <textarea
            value={description}
            onChange={(e) => {
              const val = e.target.value;
              setDescription(val);
              // Live keyword extraction preview logic
              const text = val.toLowerCase();
              const commonSkills = ['python', 'fastapi', 'react', 'docker', 'sql', 'figma', 'aws', 'kubernetes', 'typescript', 'node'];
              const matched = commonSkills.filter(sk => text.includes(sk));
              setLivePreviewSkills(matched);
            }}
            placeholder="Paste the full JD here..."
            style={{ minHeight: 160 }}
          />
          <Icon name="resume" size={15} />
        </div>

        {/* LIVE AI SKILL PARSING PREVIEW */}
        {description.length > 20 && (
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px dashed rgba(139, 92, 246, 0.4)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '12px',
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: '#c084fc', fontWeight: 700 }}>⚡ Live AI Parsing Preview</span>
              <span style={{ color: '#2dd4bf' }}>Est. Local Match Pool: ~{Math.max(3, livePreviewSkills.length * 4)} Candidates</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {livePreviewSkills.length > 0 ? (
                livePreviewSkills.map(skill => (
                  <span key={skill} style={{
                    background: 'rgba(45, 212, 191, 0.12)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    color: '#2dd4bf',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase'
                  }}>
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                  Type technical keywords (Python, React, Docker...) to preview extracted skills...
                </span>
              )}
            </div>
          </div>
        )}

        {/* NEW FEATURE: AI ROLE CALIBRATION & SENIORITY PREVIEW */}
        {description.length > 30 && (
          <div style={{
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="sparkles" size={12} /> AI Role Calibration Preview
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '10.5px', color: '#94a3b8' }}>
              <div>
                <span style={{ color: '#fff', fontWeight: 600 }}>Detected Seniority:</span>{' '}
                <span style={{ color: '#2dd4bf' }}>
                  {description.toLowerCase().includes('senior') || description.toLowerCase().includes('lead') ? 'Senior / Lead' : 'Mid-Level / General'}
                </span>
              </div>
              <div>
                <span style={{ color: '#fff', fontWeight: 600 }}>Matching Weight:</span>{' '}
                <span style={{ color: '#fbbf24' }}>Strict (TF-IDF + Skills)</span>
              </div>
            </div>
          </div>
        )}

        <div className="postjob-footer-row">
          <div className="postjob-features">
            {FEATURES.map((f) => (
              <div className="postjob-feature-item" key={f.title}>
                <div
                  className={`icon-badge ${f.color}`}
                  style={{ width: 36, height: 36, borderRadius: 9 }}
                >
                  <Icon name={f.icon} size={16} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12.5 }}>
                    {f.title}
                  </div>
                  <div className="muted" style={{ fontSize: 11 }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="postjob-submit" onClick={createJob} disabled={posting}>
            <Icon name="rocket" size={16} />{' '}
            {posting ? 'Posting...' : 'Post job — AI extracts required skills'}{' '}
            <Icon name="arrowRight" size={15} />
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {resultSkills && (
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="checkCircle" size={18} style={{ color: 'var(--teal)' }} /> Job posted — AI-extracted skills
          </h2>
          <SkillTags skills={resultSkills} cls="matched" />
        </div>
      )}

      {showMapPicker && (
        <LocationMapModal
          onClose={() => setShowMapPicker(false)}
          onSelect={(address) => {
            setLocation(address);
            setShowMapPicker(false);
          }}
        />
      )}

      <div className="postjob-dots" />
      <svg className="postjob-lines" viewBox="0 0 460 380" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="pjLineA" x1="460" y1="10" x2="60" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="45%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pjLineB" x1="460" y1="60" x2="110" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="55%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M480 -10 C 380 70, 340 110, 230 190 C 150 250, 90 300, 20 360"
          stroke="url(#pjLineA)"
          strokeWidth="1.6"
          opacity="0.6"
        />
        <path
          d="M480 50 C 400 110, 360 150, 260 220 C 180 280, 120 330, 60 380"
          stroke="url(#pjLineB)"
          strokeWidth="1.3"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
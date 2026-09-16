


import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import ChartCanvas from '../../components/ChartCanvas';
import Odometer from '../../components/Odometer';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import SkillTags from '../../components/SkillTags';
import { getJobVisual } from '../../lib/jobVisual';

const STAGE_OPTIONS = [
  {
    key: 'ai_screening',
    label: 'AI Screening',
    desc: 'Automated screening using AI',
    color: '#a855f7',
    border: 'rgba(168, 85, 247, 0.4)',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconBorder: 'rgba(168, 85, 247, 0.6)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
      </svg>
    ),
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    desc: 'Candidate has been shortlisted',
    color: '#2dd4bf',
    border: 'rgba(45, 212, 191, 0.4)',
    iconBg: 'rgba(45, 212, 191, 0.15)',
    iconBorder: 'rgba(45, 212, 191, 0.6)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: 'assessment',
    label: 'Assessment',
    desc: 'Candidate has completed assessment',
    color: '#c084fc',
    border: 'rgba(192, 132, 252, 0.4)',
    iconBg: 'rgba(192, 132, 252, 0.15)',
    iconBorder: 'rgba(192, 132, 252, 0.6)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'interview',
    label: 'Interview',
    desc: 'Candidate is in interview stage',
    color: '#3b82f6',
    border: 'rgba(59, 130, 246, 0.4)',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconBorder: 'rgba(59, 130, 246, 0.6)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    key: 'selected',
    label: 'Selected',
    desc: 'Candidate has been selected',
    color: '#f97316',
    border: 'rgba(249, 115, 22, 0.4)',
    iconBg: 'rgba(249, 115, 22, 0.15)',
    iconBorder: 'rgba(249, 115, 22, 0.6)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
  },
  {
    key: 'rejected',
    label: 'Rejected',
    desc: 'Candidate has been rejected',
    color: '#ef4444',
    border: 'rgba(239, 68, 68, 0.4)',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconBorder: 'rgba(239, 68, 68, 0.6)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
];

const STAGE_COLORS = ['#a78bfa', '#8b5cf6', '#60a5fa', '#ffb020', '#2dd4bf', '#ef6a56'];
const VERTICAL_STAGE_COLORS = ['#2563eb', '#f97316', '#451a03', '#dc2626', '#0d9488', '#9333ea'];
const COLOR_HEX = { violet: '#a78bfa', blue: '#60a5fa', teal: '#2dd4bf', amber: '#ffb020', rust: '#ef6a56', pink: '#f472b6', green: '#4ade80' };

export default function Overview() {
  const [data, setData] = useState(null);
  const [topJobs, setTopJobs] = useState(null);
  const [usersList, setUsersList] = useState(null);
  const [jobsList, setJobsList] = useState(null);
  const [appsList, setAppsList] = useState(null);
  const [interviewsList, setInterviewsList] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  // Search query states
  const [userSearch, setUserSearch] = useState('');
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [pipelineSearch, setPipelineSearch] = useState('');

  // Top jobs search state
  const [showTopJobSearch, setShowTopJobSearch] = useState(false);
  const [topJobSearchQuery, setTopJobSearchQuery] = useState('');

  // Chart toggles
  const [showActivityChart, setShowActivityChart] = useState(false);
  const [showVerticalRoleChart, setShowVerticalRoleChart] = useState(false);
  const [showVerticalStageChart, setShowVerticalStageChart] = useState(false);

  // Modal & Action states
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [activeCandidateMenuId, setActiveCandidateMenuId] = useState(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);
  const [stagePickerCandidate, setStagePickerCandidate] = useState(null);

  useEffect(() => {
    apiRequest('/admin/analytics/overview').then(setData).catch(() => setData(null));
    apiRequest('/admin/users').then(setUsersList).catch(() => setUsersList([]));
    apiRequest('/admin/jobs').then((jobs) => {
      const sorted = [...(jobs || [])].sort((a, b) => b.applications_count - a.applications_count);
      setTopJobs(sorted);
      setJobsList(jobs || []);
    }).catch(() => { setTopJobs([]); setJobsList([]); });

    apiRequest('/admin/applications').then(setAppsList).catch(() => setAppsList([]));
    apiRequest('/admin/interviews').then(setInterviewsList).catch(() => setInterviewsList([]));
  }, []);

  async function handleOpenJobApplicants(job) {
    setSelectedJobForApplicants(job);
    setPipelineSearch('');
    setActiveCandidateMenuId(null);
    setLoadingApplicants(true);
    try {
      const apps = await apiRequest(`/jobs/${job.id}/applicants`);
      setApplicantsList(apps || []);
    } catch (_) {
      setApplicantsList([]);
    } finally {
      setLoadingApplicants(false);
    }
  }

  function handleOpenStagePicker(app) {
    setStagePickerCandidate(app);
    setActiveCandidateMenuId(null);
  }

  async function handleSelectStage(nextStage) {
    if (!stagePickerCandidate) return;
    const candidateId = stagePickerCandidate.application_id || stagePickerCandidate.id || stagePickerCandidate.candidate_id;
    const stageKey = nextStage.toLowerCase();

    // 1. Instantly update local UI state
    setApplicantsList((prev) =>
      prev.map((app) => {
        const currentId = app.application_id || app.id || app.candidate_id;
        if (currentId === candidateId) {
          return { ...app, status: stageKey, stage: stageKey };
        }
        return app;
      })
    );
    setStagePickerCandidate(null);

    // 2. Dispatch network request with endpoint fallbacks
    try {
      const endpoints = [
        `/admin/applications/${candidateId}/status`,
        `/applications/${candidateId}/status`,
        `/admin/applications/${candidateId}`,
        `/applications/${candidateId}`
      ];

      let success = false;
      for (const ep of endpoints) {
        try {
          await apiRequest(ep, {
            method: 'PATCH',
            body: JSON.stringify({ status: stageKey, stage: stageKey })
          });
          success = true;
          break;
        } catch (_) {
          try {
            await apiRequest(ep, {
              method: 'PUT',
              body: JSON.stringify({ status: stageKey, stage: stageKey })
            });
            success = true;
            break;
          } catch (__) { }
        }
      }

      if (success) {
        apiRequest('/admin/analytics/overview').then(setData).catch(() => { });
      }
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  }

  const weeklyStats = useMemo(() => {
    if (!usersList || usersList.length === 0) {
      return { total: 2, recruiters: 1, candidates: 1, admins: 0 };
    }
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = usersList.filter(u => new Date(u.created_at || Date.now()).getTime() >= oneWeekAgo);
    return {
      total: recent.length,
      recruiters: recent.filter(u => (u.role || '').toLowerCase() === 'recruiter').length,
      candidates: recent.filter(u => (u.role || '').toLowerCase() === 'candidate').length,
      admins: recent.filter(u => (u.role || '').toLowerCase() === 'admin').length,
    };
  }, [usersList]);

  const adminsCount = useMemo(() => {
    if (!usersList) return (data?.total_users || 0) - (data?.total_recruiters || 0) - (data?.total_candidates || 0);
    return usersList.filter(u => (u.role || '').toLowerCase() === 'admin').length || 1;
  }, [usersList, data]);

  const filteredUsers = useMemo(() => {
    if (!usersList) return [];
    if (!userSearch.trim()) return usersList;
    const q = userSearch.toLowerCase();
    return usersList.filter(u => (u.full_name || u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q));
  }, [usersList, userSearch]);

  const filteredRecruiters = useMemo(() => {
    if (!usersList) return [];
    const list = usersList.filter(u => (u.role || '').toLowerCase() === 'recruiter');
    if (!recruiterSearch.trim()) return list;
    const q = recruiterSearch.toLowerCase();
    return list.filter(u => (u.full_name || u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }, [usersList, recruiterSearch]);

  const filteredCandidates = useMemo(() => {
    if (!usersList) return [];
    const list = usersList.filter(u => (u.role || '').toLowerCase() === 'candidate');
    if (!candidateSearch.trim()) return list;
    const q = candidateSearch.toLowerCase();
    return list.filter(u => (u.full_name || u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }, [usersList, candidateSearch]);

  const filteredAdmins = useMemo(() => {
    if (!usersList) return [];
    const list = usersList.filter(u => (u.role || '').toLowerCase() === 'admin');
    if (!adminSearch.trim()) return list;
    const q = adminSearch.toLowerCase();
    return list.filter(u => (u.full_name || u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
  }, [usersList, adminSearch]);

  const filteredTopJobs = useMemo(() => {
    if (!topJobs) return [];
    if (!topJobSearchQuery.trim()) return topJobs;
    const q = topJobSearchQuery.toLowerCase().trim();
    return topJobs.filter(j => (j.title || '').toLowerCase().includes(q) || (j.recruiter_name || '').toLowerCase().includes(q) || String(j.applications_count).includes(q));
  }, [topJobs, topJobSearchQuery]);

  const filteredPipelineApplicants = useMemo(() => {
    if (!applicantsList) return [];
    if (!pipelineSearch.trim()) return applicantsList;
    const q = pipelineSearch.toLowerCase();
    return applicantsList.filter(app => {
      const name = (app.candidate_name || '').toLowerCase();
      const email = (app.candidate_email || '').toLowerCase();
      const stage = (app.status || app.stage || '').toLowerCase();
      const skillsMatch = app.matched_skills && app.matched_skills.some(s => s.toLowerCase().includes(q));
      return name.includes(q) || email.includes(q) || stage.includes(q) || skillsMatch;
    });
  }, [applicantsList, pipelineSearch]);

  const stageChartConfig = useMemo(() => {
    if (!data) return null;

    const values = STAGE_OPTIONS.map(
      (s) => data.status_breakdown?.[s.key] || 0
    );

    const totalCount = values.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...values, 5);
    const hasData = totalCount > 0;

    if (showVerticalStageChart) {
      return {
        type: 'bar',
        data: {
          labels: STAGE_OPTIONS.map((s) => s.label),
          datasets: [{
            data: values,
            backgroundColor: VERTICAL_STAGE_COLORS,
            borderRadius: 6,
            barThickness: 24,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0c1224',
              titleFont: { family: 'Inter', size: 12 },
              bodyFont: { family: 'JetBrains Mono', size: 11 },
              padding: 10,
              callbacks: {
                label: (ctx) => ` Count: ${ctx.raw} candidate(s)`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#cbd5e1',
                font: {
                  family: 'Inter',
                  size: 10,
                  weight: '600',
                },
              },
            },
            y: {
              beginAtZero: true,
              suggestedMax: Math.max(maxVal * 1.25, 10),
              ticks: {
                color: '#94a3b8',
                font: {
                  family: 'JetBrains Mono',
                  size: 10,
                },
                precision: 0,
              },
              grid: { color: '#172038' },
            },
          },
        },
      };
    }

    return {
      type: 'doughnut',
      data: {
        labels: STAGE_OPTIONS.map((s) => s.label),
        datasets: [{
          data: hasData ? values : [1],
          backgroundColor: hasData ? STAGE_COLORS : ['#1c2440'],
          borderWidth: 2,
          borderColor: '#0b0e1c',
          hoverOffset: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 800,
        },
        /*
         * Keep the doughnut completely controlled by its
         * parent wrapper. The custom legend is outside
         * Chart.js, so Chart.js cannot create extra space.
         */
        layout: {
          padding: 0,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: hasData,
            backgroundColor: '#0c1224',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'JetBrains Mono', size: 11 },
            padding: 10,
            borderColor: 'rgba(139, 92, 246, 0.4)',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw || 0;
                const pct = totalCount > 0
                  ? ((val / totalCount) * 100).toFixed(1)
                  : 0;
                return ` ${ctx.label}: ${val} candidate(s) (${pct}%)`;
              },
            },
          },
        },
        cutout: '64%',
      },
      plugins: [{
        id: 'centerTotalTextPerfect',
        afterDraw(chart) {
          const { ctx } = chart;
          const meta = chart.getDatasetMeta(0);

          if (!meta || !meta.data || meta.data.length === 0) return;

          // Use the first arc's actual center. This keeps the
          // number perfectly centered inside the doughnut.
          const centerX = meta.data[0].x;
          const centerY = meta.data[0].y;

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.font = '700 22px Inter, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(totalCount.toString(), centerX, centerY - 7);

          ctx.font = '500 11px Inter, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Total', centerX, centerY + 12);

          ctx.restore();
        },
      }],
    };
  }, [data, showVerticalStageChart]);

  const roleChartConfig = useMemo(() => {
    if (!data) return null;
    const candidatesCount = data.total_candidates || 0;
    const recruitersCount = data.total_recruiters || 0;
    const hasData = (candidatesCount + recruitersCount) > 0;
    const maxVal = Math.max(candidatesCount, recruitersCount, 1);

    if (showVerticalRoleChart) {
      return {
        type: 'bar',
        data: {
          labels: ['Candidates', 'Recruiters'],
          datasets: [{
            data: hasData ? [candidatesCount, recruitersCount] : [0, 0],
            backgroundColor: ['#22d3ee', '#ffb020'],
            borderRadius: 8,
            barThickness: 32,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800 },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: hasData, callbacks: { label: (ctx) => ` Count: ${ctx.raw} user(s)` } },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#cbd5e1', font: { family: 'Inter', size: 11, weight: '600' } }
            },
            y: {
              beginAtZero: true,
              suggestedMax: maxVal * 1.25,
              ticks: { color: '#8892b0', font: { family: 'JetBrains Mono', size: 10 }, precision: 0 },
              grid: { color: '#172038' }
            }
          }
        }
      };
    } else {
      return {
        type: 'bar',
        data: {
          labels: ['Candidates', 'Recruiters'],
          datasets: [{
            data: hasData ? [candidatesCount, recruitersCount] : [0, 0],
            backgroundColor: ['#22d3ee', '#ffb020'],
            borderRadius: 8,
            barThickness: 26,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800 },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: hasData, callbacks: { label: (ctx) => ` Count: ${ctx.raw} user(s)` } },
          },
          scales: {
            x: {
              beginAtZero: true,
              suggestedMax: maxVal * 1.25,
              ticks: { color: '#8892b0', font: { family: 'JetBrains Mono', size: 10 }, precision: 0 },
              grid: { color: '#172038' },
            },
            y: {
              ticks: { color: '#cbd5e1', font: { family: 'Inter', size: 11, weight: '500' } },
              grid: { display: false },
            },
          },
        },
        plugins: [{
          id: 'barValuesAtEnd',
          afterDraw(chart) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);
            if (!meta || !meta.data) return;
            ctx.save();
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            meta.data.forEach((bar, index) => {
              const val = [candidatesCount, recruitersCount][index];
              ctx.fillText(val.toString(), bar.x + 8, bar.y);
            });
            ctx.restore();
          }
        }],
      };
    }
  }, [data, showVerticalRoleChart]);

  const activityChartConfig = useMemo(() => {
    if (!data) return null;
    const totalPipeline = Object.values(data.status_breakdown || {}).reduce((a, b) => a + b, 0);
    const maxVal = Math.max(data.total_assessments_assigned || 0, data.total_interviews || 0, totalPipeline, 10);
    const dynamicMax = Math.max(maxVal * 1.25, 100);

    return {
      type: 'bar',
      data: {
        labels: ['Assessments', 'Interviews', 'Pipeline', 'Match Score %'],
        datasets: [{
          data: [
            data.total_assessments_assigned || 0,
            data.total_interviews || 0,
            totalPipeline,
            data.avg_match_score || 0
          ],
          backgroundColor: ['#a78bfa', '#60a5fa', '#2dd4bf', '#ffb020'],
          borderRadius: 8,
          barThickness: 22,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0c1224',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'JetBrains Mono', size: 11 },
            padding: 10,
            callbacks: {
              label: (ctx) => {
                const label = ctx.label;
                const val = ctx.raw;
                if (label === 'Match Score %') return ` Avg Match: ${val}%`;
                return ` Count: ${val}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { family: 'Inter', size: 9.5, weight: '600' } } },
          y: {
            beginAtZero: true,
            suggestedMax: dynamicMax,
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } },
            grid: { color: '#172038' }
          }
        }
      }
    };
  }, [data]);

  const toggleCard = (cardKey) => {
    setExpandedCard((prev) => (prev === cardKey ? null : cardKey));
  };

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box', paddingBottom: '4px' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="aiMatchRadialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }

        .overview-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 18px;
          align-items: stretch;
          position: relative;
          z-index: 10;
        }

        .neon-stat-card {
          position: relative;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
          min-height: 104px;
          z-index: 1;
        }

        .neon-stat-card:hover { transform: translateY(-1px); }
        .neon-stat-card.is-active-dropdown { z-index: 1000 !important; }

        .neon-card-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .neon-dropdown-toggle {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #94a3b8;
          transition: transform 0.15s ease;
          flex-shrink: 0;
        }

        .neon-stat-card:hover .neon-dropdown-toggle { color: #ffffff; }
        .neon-dropdown-toggle.is-expanded { transform: rotate(180deg); color: #ffffff; }

        .neon-stat-card.card-blue {
          background: #0a1124;
          border: 1px solid rgba(59, 130, 246, 0.35);
        }
        .neon-stat-card.card-blue .neon-icon-badge {
          background: rgba(37, 99, 235, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: #93c5fd;
        }

        .neon-stat-card.card-green {
          background: #06161c;
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .neon-stat-card.card-green .neon-icon-badge {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
        }

        .neon-stat-card.card-amber {
          background: #19120a;
          border: 1px solid rgba(245, 158, 11, 0.35);
        }
        .neon-stat-card.card-amber .neon-icon-badge {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
        }

        .neon-stat-card.card-pink {
          background: #1c0c16;
          border: 1px solid rgba(236, 72, 153, 0.35);
        }
        .neon-stat-card.card-pink .neon-icon-badge {
          background: rgba(236, 72, 153, 0.15);
          border: 1px solid rgba(236, 72, 153, 0.4);
          color: #f472b6;
        }

        .neon-icon-badge {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .neon-stat-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .neon-stat-label {
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 500;
        }

        .neon-stat-number {
          font-size: 24px;
          font-weight: 800;
          font-family: var(--font-display, sans-serif);
          color: #ffffff;
          line-height: 1.15;
          margin-top: 2px;
        }

        .neon-stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 3px;
        }

        .trend-up { color: #34d399; }
        .trend-neutral { color: #94a3b8; }

        .overview-card {
          background: #0a0e1c;
          border: 1px solid rgba(139, 92, 246, 0.22);
          border-radius: 18px;
          padding: 25px 25px;
          margin-bottom: 16px;
          box-sizing: border-box;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        .overview-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
          align-items: stretch;
          position: relative;
          z-index: 1;
        }

        .stat-floating-overlay {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          width: 100%;
          min-width: 280px;
          background: #0b0f20 !important;
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 14px;
          padding: 12px;
          max-height: 260px;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 999999 !important;
          box-sizing: border-box;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8);
          cursor: default;
        }

        .stat-search-input {
          width: 100%;
          background: #10162a;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 9px;
          padding: 8px 12px 8px 32px;
          font-size: 12.5px;
          color: #fff;
          outline: none;
          box-sizing: border-box;
        }

        .stat-detail-row {
          background: #11182e;
          border: 1px solid rgba(139, 92, 246, 0.18);
          border-radius: 9px;
          padding: 9px 12px;
          font-size: 12px;
          color: #e2e8f0;
          width: 100%;
          box-sizing: border-box;
          word-break: break-word;
        }

        .card-header-action {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: inset 0px 0px 35px #079f5d;
        }
        .card-header-action:hover { border-color: #a855f7; color: #fff; }
        .card-header-action.active-search { background: rgba(168, 85, 247, 0.2); border-color: #c084fc; color: #fff; }

        .live-dot-indicator {
          width: 8px;
          height: 8px;
          background-color: #2dd4bf;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        .ranked-job-row { transition: all 0.15s ease; }
        .ranked-job-row:hover { background: rgba(139, 92, 246, 0.08) !important; }

        /* ========================================================
           APPLICANTS PIPELINE COMPACT MODAL
           ======================================================== */
        .pipeline-modal-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 100%;
        }

        .pipeline-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 4px;
        }

        .pipeline-header-title-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pipeline-gradient-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .pipeline-title-text {
          font-size: 19px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .pipeline-title-highlight {
          color: #a855f7;
          margin-left: 4px;
        }

        .pipeline-subtitle-text {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
          font-family: var(--font-mono, monospace);
        }

        .pipeline-subtitle-highlight {
          color: #a78bfa;
          font-weight: 600;
        }

        .pipeline-cards-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .pipeline-candidate-card {
          background: #080d1e;
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          transition: border-color 0.15s ease;
        }

        .pipeline-candidate-card:hover { border-color: rgba(168, 85, 247, 0.5); }

        .pipeline-card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
        }

        .pipeline-card-top-row > .pipeline-candidate-identity {
          flex: 1 1 auto;
          min-width: 0;
        }

        .pipeline-candidate-identity {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .pipeline-avatar-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          color: #ffffff;
          flex-shrink: 0;
        }

        .pipeline-avatar-dot {
          position: absolute;
          bottom: 0px;
          right: 0px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          border: 1.5px solid #090e1f;
        }

        .pipeline-candidate-name {
          font-size: 14.5px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pipeline-candidate-identity-info {
          min-width: 0;
          flex: 1 1 auto;
          width: 0;
          overflow: hidden;
        }

        .pipeline-candidate-email {
          display: flex;
          align-items: center;
          gap: 5px;
          width: 100%;
          min-width: 0;
          max-width: 100%;
          font-size: 12px;
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
          margin-top: 2px;
          overflow: hidden;
        }

        .pipeline-candidate-email svg {
          flex: 0 0 auto;
        }

        .pipeline-candidate-email span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pipeline-match-badge-box {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .pipeline-radial-score-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0d1428;
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 10px;
          padding: 5px 10px;
        }

        .pipeline-radial-gauge {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
        }

        .pipeline-score-details {
          display: flex;
          flex-direction: column;
        }

        .pipeline-score-num {
          font-size: 13.5px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .pipeline-score-label {
          font-size: 8.5px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-family: var(--font-mono, monospace);
        }

        .pipeline-more-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #0d1428;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: all 0.15s ease;
        }

        .pipeline-more-btn:hover { background: #1a243f; color: #ffffff; }

        /* ========================================================
           EXACT POPOVER MENU (3 OPTIONS: PROFILE, STAGE, EMAIL)
           ======================================================== */
        .pipeline-premium-popover {
          position: absolute;
          top: 38px;
          right: 0;
          background: #080c1b;
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 12px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 230px;
          z-index: 10000;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.85);
        }

        .popover-card-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 8px;
          background: #0b1124;
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
          text-align: left;
          width: 100%;
          box-shadow: none;
        }

        .popover-card-btn.pcard-profile { border: 1px solid rgba(168, 85, 247, 0.4); }
        .popover-card-btn.pcard-profile:hover { background: #121832; border-color: #a855f7; }
        .popover-card-btn.pcard-profile .popover-icon-box { background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.5); color: #c084fc; }

        .popover-card-btn.pcard-stage { border: 1px solid rgba(59, 130, 246, 0.4); }
        .popover-card-btn.pcard-stage:hover { background: #0d1632; border-color: #3b82f6; }
        .popover-card-btn.pcard-stage .popover-icon-box { background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.5); color: #60a5fa; }

        .popover-card-btn.pcard-email { border: 1px solid rgba(20, 184, 166, 0.4); }
        .popover-card-btn.pcard-email:hover { background: #08171f; border-color: #2dd4bf; }
        .popover-card-btn.pcard-email .popover-icon-box { background: rgba(20, 184, 166, 0.12); border: 1px solid rgba(20, 184, 166, 0.5); color: #2dd4bf; }

        .popover-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .popover-icon-box {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .popover-item-text {
          display: flex;
          flex-direction: column;
        }

        .popover-item-title {
          font-size: 13px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.15;
        }

        .popover-item-subtitle {
          font-size: 10.5px;
          color: #94a3b8;
          margin-top: 1px;
        }

        .popover-chevron-right {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        /* ========================================================
           EXACT STAGE SELECTOR
           ======================================================== */
        .stage-modal-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 100%;
        }

        .stage-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 4px;
        }

        .stage-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stage-header-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .stage-header-title {
          font-size: 17.5px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .stage-header-highlight {
          color: #a855f7;
          margin: 0 4px;
        }

        .stage-header-subtitle {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .stage-header-subtitle strong { color: #ffffff; }

        .stage-options-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stage-select-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 10px;
          background: #080d1e;
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
          width: 100%;
          text-align: left;
          box-shadow: none;
        }

        .stage-select-card:hover { background: #0f152d; }
        .stage-select-card.is-active { background: #111532; }

        .stage-card-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stage-badge-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stage-text-meta {
          display: flex;
          flex-direction: column;
        }

        .stage-card-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.15;
        }

        .stage-card-desc {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 1px;
        }

        .stage-radio-circle {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: transparent;
        }

        .stage-radio-circle.is-checked {
          background: #a855f7;
          border-color: #a855f7;
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 800;
        }

        .pipeline-card-meta-row {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #080d1e;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 8px 12px;
          flex-wrap: wrap;
        }

        .pipeline-meta-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #94a3b8;
        }

        .pipeline-stage-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 10px;
        }

        .pipeline-stage-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #34d399;
        }

        .pipeline-meta-divider {
          width: 1px;
          height: 14px;
          background: rgba(255, 255, 255, 0.08);
        }

        .pipeline-skills-row {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .pipeline-skill-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.06);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
        }

        .pipeline-search-bar {
          position: relative;
          width: 100%;
        }

        .pipeline-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 13px;
          pointer-events: none;
        }

        .pipeline-search-input {
          width: 100%;
          height: 40px;
          background: #090e20;
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 10px;
          padding: 0 14px 0 36px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }

        .pipeline-search-input:focus { border-color: #3b82f6; }

        .pipeline-close-btn-gradient {
          width: 100%;
          height: 42px;
          background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
          border: none;
          border-radius: 10px;
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .pipeline-close-btn-gradient:hover { opacity: 0.95; }

        @media (max-width: 1024px) {
          .overview-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .overview-two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 380px) {
          .pipeline-card-top-row {
            gap: 6px;
          }

          .pipeline-candidate-identity {
            gap: 8px;
          }

          .pipeline-avatar-wrapper {
            width: 38px;
            height: 38px;
          }

          .pipeline-radial-score-box {
            padding: 4px 7px;
            gap: 6px;
          }

          .pipeline-radial-gauge {
            width: 26px;
            height: 26px;
          }

          .pipeline-score-num {
            font-size: 13px;
          }

          .pipeline-score-label {
            font-size: 8px;
          }
        }

        @media (max-width: 600px) {
          .overview-stats-grid { grid-template-columns: 1fr !important; }
          .overview-card { padding: 14px !important; }

          /*
           * MOBILE PIPELINE FIX
           *
           * Keep the candidate identity in the remaining flexible space.
           * The email is ellipsized before it can reach the AI-match box.
           */
          .pipeline-candidate-card {
            padding: 12px;
            min-width: 0;
          }

          .pipeline-card-top-row {
            width: 100%;
            gap: 8px;
            min-width: 0;
            align-items: center;
          }

          .pipeline-candidate-identity {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            width: 0;
            gap: 9px;
          }

          .pipeline-candidate-identity-info {
            flex: 1 1 0;
            min-width: 0;
            width: 0;
            max-width: 100%;
          }

          .pipeline-candidate-name {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .pipeline-candidate-email {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: hidden;
          }

          .pipeline-candidate-email span {
            display: block;
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .pipeline-match-badge-box {
            flex: 0 0 auto;
            min-width: 0;
            gap: 6px;
          }

          .pipeline-radial-score-box {
            flex: 0 0 auto;
            padding: 5px 8px;
          }

          .pipeline-more-btn {
            flex: 0 0 auto;
          }
        }
      `}</style>

      <div className="page-header" style={{ marginBottom: 14 }}>
        <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="live-dot-indicator" /> Platform-wide &middot; LIVE
        </div>
        <h1 className="page-title"><span className="hl">Platform Overview</span></h1>
        <p className="page-sub">Aggregate stats across every recruiter, job, and candidate on HireMind AI.</p>
      </div>

      {!data && (
        <div className="overview-stats-grid">
          <div className="overview-card skeleton" style={{ height: 100 }} />
          <div className="overview-card skeleton" style={{ height: 100 }} />
          <div className="overview-card skeleton" style={{ height: 100 }} />
          <div className="overview-card skeleton" style={{ height: 100 }} />
        </div>
      )}

      {data && (
        <>
          <div className="overview-stats-grid">
            {/* 1. TOTAL USERS */}
            <div
              className={`neon-stat-card card-blue ${expandedCard === 'users' ? 'is-active-dropdown' : ''}`}
              onClick={() => toggleCard('users')}
            >
              <div className="neon-card-left">
                <div className="neon-icon-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="neon-stat-info">
                  <span className="neon-stat-label">Total Users</span>
                  <span className="neon-stat-number"><Odometer value={data.total_users || 0} /></span>
                  <span className="neon-stat-trend trend-up">
                    <span>▲</span> +{weeklyStats.total} this week
                  </span>
                </div>
              </div>

              <div className={`neon-dropdown-toggle ${expandedCard === 'users' ? 'is-expanded' : ''}`} title="View all users">
                ▼
              </div>

              {expandedCard === 'users' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div style={{ position: 'relative', marginBottom: 2 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>🔍</span>
                    <input
                      type="text"
                      className="stat-search-input"
                      placeholder="Search all users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  {!usersList ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div> : filteredUsers.length === 0 ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No users found</div> : filteredUsers.map((u) => (
                    <div className="stat-detail-row" key={u.id}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>👤 {u.full_name || u.name}</span>
                        <span style={{ color: '#60a5fa', fontSize: '10px', textTransform: 'uppercase' }}>{u.role}</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{u.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. RECRUITERS */}
            <div
              className={`neon-stat-card card-green ${expandedCard === 'recruiters' ? 'is-active-dropdown' : ''}`}
              onClick={() => toggleCard('recruiters')}
            >
              <div className="neon-card-left">
                <div className="neon-icon-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                  </svg>
                </div>
                <div className="neon-stat-info">
                  <span className="neon-stat-label">Recruiters</span>
                  <span className="neon-stat-number"><Odometer value={data.total_recruiters || 0} /></span>
                  <span className="neon-stat-trend trend-up">
                    <span>▲</span> +{weeklyStats.recruiters} this week
                  </span>
                </div>
              </div>

              <div className={`neon-dropdown-toggle ${expandedCard === 'recruiters' ? 'is-expanded' : ''}`} title="View all recruiters">
                ▼
              </div>

              {expandedCard === 'recruiters' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div style={{ position: 'relative', marginBottom: 2 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>🔍</span>
                    <input
                      type="text"
                      className="stat-search-input"
                      placeholder="Search recruiters..."
                      value={recruiterSearch}
                      onChange={(e) => setRecruiterSearch(e.target.value)}
                    />
                  </div>
                  {!usersList ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div> : filteredRecruiters.length === 0 ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No recruiters found</div> : filteredRecruiters.map((u) => (
                    <div className="stat-detail-row" key={u.id}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px' }}>🏢 {u.full_name || u.name}</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{u.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. CANDIDATES */}
            <div
              className={`neon-stat-card card-amber ${expandedCard === 'candidates' ? 'is-active-dropdown' : ''}`}
              onClick={() => toggleCard('candidates')}
            >
              <div className="neon-card-left">
                <div className="neon-icon-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
                  </svg>
                </div>
                <div className="neon-stat-info">
                  <span className="neon-stat-label">Candidates</span>
                  <span className="neon-stat-number"><Odometer value={data.total_candidates || 0} /></span>
                  <span className="neon-stat-trend trend-up">
                    <span>▲</span> +{weeklyStats.candidates} this week
                  </span>
                </div>
              </div>

              <div className={`neon-dropdown-toggle ${expandedCard === 'candidates' ? 'is-expanded' : ''}`} title="View all candidates">
                ▼
              </div>

              {expandedCard === 'candidates' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div style={{ position: 'relative', marginBottom: 2 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>🔍</span>
                    <input
                      type="text"
                      className="stat-search-input"
                      placeholder="Search candidates..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                    />
                  </div>
                  {!usersList ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div> : filteredCandidates.length === 0 ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No candidates found</div> : filteredCandidates.map((u) => (
                    <div className="stat-detail-row" key={u.id}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px' }}>👤 {u.full_name || u.name}</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{u.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. ADMINS */}
            <div
              className={`neon-stat-card card-pink ${expandedCard === 'admins' ? 'is-active-dropdown' : ''}`}
              onClick={() => toggleCard('admins')}
            >
              <div className="neon-card-left">
                <div className="neon-icon-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="neon-stat-info">
                  <span className="neon-stat-label">Admins</span>
                  <span className="neon-stat-number"><Odometer value={adminsCount} /></span>
                  <span className="neon-stat-trend trend-neutral">
                    <span>▾</span> {weeklyStats.admins} this week
                  </span>
                </div>
              </div>

              <div className={`neon-dropdown-toggle ${expandedCard === 'admins' ? 'is-expanded' : ''}`} title="View all admins">
                ▼
              </div>

              {expandedCard === 'admins' && (
                <div className="stat-floating-overlay" onClick={(e) => e.stopPropagation()}>
                  <div style={{ position: 'relative', marginBottom: 2 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>🔍</span>
                    <input
                      type="text"
                      className="stat-search-input"
                      placeholder="Search admins..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                    />
                  </div>
                  {!usersList ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Loading...</div> : filteredAdmins.length === 0 ? <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No admins found</div> : filteredAdmins.map((u) => (
                    <div className="stat-detail-row" key={u.id}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px' }}>🛡️ {u.full_name || u.name}</div>
                      <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 2 }}>{u.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overview-two-col">
            {/* APPLICATIONS BY STAGE */}
            <div
              className="overview-card"
              style={{
                marginBottom: 0,
                overflow: 'hidden',
                minWidth: 0,
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  minWidth: 0,
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 14.5,
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  Applications by stage
                </h2>

                <div
                  className={`card-header-action ${showVerticalStageChart ? 'active-search' : ''}`}
                  onClick={() =>
                    setShowVerticalStageChart(!showVerticalStageChart)
                  }
                  title="Toggle Vertical Bar Chart View"
                  style={{
                    flexShrink: 0,
                  }}
                >
                  <Icon name="analytics" size={15} />
                </div>
              </div>

              {!showVerticalStageChart ? (
                /*
                 * BALANCED DOUGHNUT VIEW
                 *
                 * The chart + legend are treated as ONE centered group.
                 * This is the important change: the group is centered in
                 * the entire card, which keeps the left and right outer
                 * spacing visually equal at every viewport width.
                 */
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                    overflow: 'hidden',
                    padding: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  <div

                    style={{
                      width: '100%',
                      maxWidth: '360px',
                      height: '160px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'clamp(45px, 6vw, 70px)',
                      minWidth: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* DOUGHNUT */}
                    {/* DOUGHNUT */}
                    <div
                      style={{
                        position: 'relative',
                        width: 'clamp(165px, 34vw, 160px)',
                        height: 'clamp(100px, 34vw, 160px)',
                        minWidth: 0,
                        minHeight: 0,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stageChartConfig && (
                        <ChartCanvas
                          config={stageChartConfig}
                          height={160}
                        />
                      )}
                    </div>

                    {/* LEGEND */}
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '8px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {STAGE_OPTIONS.map((stage, index) => (
                        <div
                          key={stage.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            minWidth: 0,
                            height: '15px',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              minWidth: '10px',
                              borderRadius: '1px',
                              background: STAGE_COLORS[index],
                              display: 'block',
                              flexShrink: 0,
                            }}
                          />

                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '11px',
                              fontWeight: 500,
                              lineHeight: '15px',
                              color: '#aeb8cc',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              minWidth: 0,
                            }}
                          >
                            {stage.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* VERTICAL BAR VIEW */
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '160px',
                    minWidth: 0,
                    margin: 0,
                  }}
                >
                  {stageChartConfig && (
                    <ChartCanvas
                      config={stageChartConfig}
                      height={160}
                    />
                  )}
                </div>
              )}
            </div>

            {/* USER COMPOSITION */}
            <div className="overview-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, color: '#fff', margin: 0 }}>User composition</h2>
                <div
                  className={`card-header-action ${showVerticalRoleChart ? 'active-search' : ''}`}
                  onClick={() => setShowVerticalRoleChart(!showVerticalRoleChart)}
                  title="Toggle Vertical Bar Chart View"
                >
                  <Icon name="analytics" size={15} />
                </div>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                {roleChartConfig && <ChartCanvas config={roleChartConfig} height={150} />}
              </div>
            </div>
          </div>

          <div className="overview-two-col" style={{ marginBottom: 0 }}>
            {/* Top Jobs Card */}
            <div className="overview-card card-flex" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, color: '#fff', margin: 0 }}>Top jobs by applicants</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {showTopJobSearch && (
                    <div style={{ position: 'relative', width: '150px' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94a3b8' }}>🔍</span>
                      <input
                        type="text"
                        placeholder="Search jobs..."
                        value={topJobSearchQuery}
                        onChange={(e) => setTopJobSearchQuery(e.target.value)}
                        autoFocus
                        style={{
                          width: '100%',
                          background: '#111827',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '7px',
                          padding: '4px 8px 4px 26px',
                          fontSize: '11px',
                          color: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      />
                    </div>
                  )}
                  <div
                    className={`card-header-action ${showTopJobSearch ? 'active-search' : ''}`}
                    onClick={() => {
                      setShowTopJobSearch(!showTopJobSearch);
                      if (showTopJobSearch) setTopJobSearchQuery('');
                    }}
                    title="Toggle top jobs search"
                  >
                    <Icon name="search" size={15} />
                  </div>
                </div>
              </div>

              {topJobs === null && <div className="skeleton sk-row" />}
              {topJobs && topJobs.length === 0 && (
                <div className="empty-state" style={{ padding: '15px 0' }}>
                  <div className="es-icon"><Icon name="briefcase" size={16} /></div>
                  <div className="es-title" style={{ fontSize: 12 }}>No jobs posted yet</div>
                </div>
              )}
              {topJobs && topJobs.length > 0 && filteredTopJobs.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>No matching jobs found</div>
              )}
              {topJobs && topJobs.length > 0 && filteredTopJobs.length > 0 && (
                <div className="scroll-panel-tight" style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: '200px', overflowY: 'auto', paddingBottom: 2 }}>
                  {filteredTopJobs.map((j) => {
                    const max = Math.max(...topJobs.map((t) => t.applications_count), 1);
                    const { icon, color } = getJobVisual(j.title);
                    const hex = COLOR_HEX[color] || '#a78bfa';
                    return (
                      <div className="ranked-job-row" key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '8px', padding: '6px 10px' }}>
                        <div className={`icon-badge ranked-job-icon ${color}`} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name={icon} size={13} />
                        </div>
                        <div className="ranked-job-body" style={{ flex: 1, minWidth: 0 }}>
                          <div className="ranked-job-title" style={{ fontSize: 11.5, fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {j.title} <span className="muted mono" style={{ fontSize: 9.5, color: '#94a3b8' }}>by {j.recruiter_name}</span>
                          </div>
                          <div className="ranked-job-bar-track" style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: 3, overflow: 'hidden' }}>
                            <div className="ranked-job-bar-fill" style={{ width: `${(j.applications_count / max) * 100}%`, height: '100%', background: hex, borderRadius: '2px' }} />
                          </div>
                        </div>
                        <span
                          className="ranked-job-count mono"
                          onClick={() => handleOpenJobApplicants(j)}
                          title="Click to view applicants"
                          style={{ color: hex, fontWeight: 700, fontSize: '12px', flexShrink: 0, marginLeft: 6, cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
                        >
                          {j.applications_count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platform Activity Card */}
            <div className="overview-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '290px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, color: '#fff', margin: 0 }}>Platform activity</h2>
                <div
                  className={`card-header-action ${showActivityChart ? 'active-search' : ''}`}
                  onClick={() => setShowActivityChart(!showActivityChart)}
                  title="Toggle activity chart"
                >
                  <Icon name="analytics" size={15} />
                </div>
              </div>

              {showActivityChart ? (
                <div style={{ flex: 1, position: 'relative', width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activityChartConfig && <ChartCanvas config={activityChartConfig} height={200} />}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                  <div className="stat-detail-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94a3b8', fontSize: 12.5 }}>
                      <span style={{ color: '#a78bfa' }}>📝</span> Assessments assigned
                    </span>
                    <span className="mono" style={{ color: '#fff', fontWeight: 700, fontSize: '12.5px' }}>{data.total_assessments_assigned}</span>
                  </div>
                  <div className="stat-detail-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#60a5fa', fontSize: 12.5 }}>
                      <span style={{ color: '#60a5fa' }}>📅</span> Interviews scheduled
                    </span>
                    <span className="mono" style={{ color: '#fff', fontWeight: 700, fontSize: '12.5px' }}>{data.total_interviews}</span>
                  </div>
                  <div className="stat-detail-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94a3b8', fontSize: 12.5 }}>
                      <span style={{ color: '#2dd4bf' }}>👥</span> Candidates in pipeline
                    </span>
                    <span className="mono" style={{ color: '#fff', fontWeight: 700, fontSize: '12.5px' }}>{Object.values(data.status_breakdown).reduce((a, b) => a + b, 0)}</span>
                  </div>
                  <div className="stat-detail-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94a3b8', fontSize: 12.5 }}>
                      <span style={{ color: '#ffb020' }}>⚡</span> Avg. AI match score
                    </span>
                    <span className="mono" style={{ color: '#ffb020', fontWeight: 700, fontSize: '12.5px' }}>{data.avg_match_score}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Applicants Pipeline Modal */}
      <Modal open={!!selectedJobForApplicants} onClose={() => setSelectedJobForApplicants(null)} maxWidth={540}>
        {selectedJobForApplicants && (
          <div className="pipeline-modal-root" onClick={() => setActiveCandidateMenuId(null)}>
            <div className="pipeline-modal-header">
              <div className="pipeline-header-title-box">
                <div className="pipeline-gradient-icon-badge">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h2 className="pipeline-title-text">
                    Applicants<span className="pipeline-title-highlight">Pipeline</span>
                  </h2>
                  <div className="pipeline-subtitle-text">
                    {selectedJobForApplicants.title} &bull; <span className="pipeline-subtitle-highlight">{filteredPipelineApplicants.length} candidate(s)</span>
                  </div>
                </div>
              </div>
            </div>

            {loadingApplicants ? (
              <div style={{ padding: '25px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Loading candidate pipeline...
              </div>
            ) : filteredPipelineApplicants.length === 0 ? (
              <div style={{ padding: '25px 0', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                No matching applicants found.
              </div>
            ) : (
              <div className="pipeline-cards-container">
                {filteredPipelineApplicants.map((app) => {
                  const initials = (app.candidate_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                  const stageUpper = (app.status || app.stage || 'screening').toUpperCase();
                  const score = app.match_score ?? 48.4;
                  const skills = app.matched_skills && app.matched_skills.length > 0
                    ? app.matched_skills
                    : ['Machine Learning'];
                  const appliedDate = app.created_at || app.applied_at ? new Date(app.created_at || app.applied_at).toLocaleDateString('en-GB') : '18/08/2026';
                  const candidateUniqueId = app.application_id || app.id || app.candidate_id;

                  return (
                    <div key={candidateUniqueId} className="pipeline-candidate-card">
                      <div className="pipeline-card-top-row">
                        <div className="pipeline-candidate-identity">
                          <div className="pipeline-avatar-wrapper">
                            {initials}
                            <span className="pipeline-avatar-dot" />
                          </div>
                          <div className="pipeline-candidate-identity-info">
                            <div className="pipeline-candidate-name">{app.candidate_name}</div>
                            <div className="pipeline-candidate-email">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                              </svg>
                              <span>{app.candidate_email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pipeline-match-badge-box">
                          <div className="pipeline-radial-score-box">
                            <div className="pipeline-radial-gauge">
                              <svg width="26" height="26" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#1e293b"
                                  strokeWidth="3.5"
                                />
                                <path
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="url(#aiMatchRadialGradient)"
                                  strokeWidth="3.5"
                                  strokeDasharray={`${score}, 100`}
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <div className="pipeline-score-details">
                              <span className="pipeline-score-num">{score}%</span>
                              <span className="pipeline-score-label">AI MATCH</span>
                            </div>
                          </div>

                          {/* 3-Dot Action Button */}
                          <div style={{ position: 'relative' }}>
                            <button
                              type="button"
                              className="pipeline-more-btn"
                              title="Actions"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCandidateMenuId(activeCandidateMenuId === candidateUniqueId ? null : candidateUniqueId);
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>

                            {/* Dropdown Popover (3 Options: View Profile, Update Stage, Send Email) */}
                            {activeCandidateMenuId === candidateUniqueId && (
                              <div className="pipeline-premium-popover" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="popover-card-btn pcard-profile"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCandidateDetail(app);
                                    setActiveCandidateMenuId(null);
                                  }}
                                >
                                  <div className="popover-item-left">
                                    <div className="popover-icon-box">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                      </svg>
                                    </div>
                                    <div className="popover-item-text">
                                      <span className="popover-item-title">View Profile</span>
                                      <span className="popover-item-subtitle">See complete details</span>
                                    </div>
                                  </div>
                                  <span className="popover-chevron-right">&gt;</span>
                                </button>

                                <button
                                  type="button"
                                  className="popover-card-btn pcard-stage"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStagePicker(app);
                                  }}
                                >
                                  <div className="popover-item-left">
                                    <div className="popover-icon-box">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                      </svg>
                                    </div>
                                    <div className="popover-item-text">
                                      <span className="popover-item-title">Update Stage</span>
                                      <span className="popover-item-subtitle">Change application stage</span>
                                    </div>
                                  </div>
                                  <span className="popover-chevron-right">&gt;</span>
                                </button>

                                <button
                                  type="button"
                                  className="popover-card-btn pcard-email"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(app.candidate_email)}&su=${encodeURIComponent(`Application update for ${selectedJobForApplicants.title}`)}`;
                                    window.open(emailUrl, '_blank');
                                    setActiveCandidateMenuId(null);
                                  }}
                                >
                                  <div className="popover-item-left">
                                    <div className="popover-icon-box">
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                      </svg>
                                    </div>
                                    <div className="popover-item-text">
                                      <span className="popover-item-title">Send Email</span>
                                      <span className="popover-item-subtitle">Contact the candidate</span>
                                    </div>
                                  </div>
                                  <span className="popover-chevron-right">&gt;</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pipeline-card-meta-row">
                        <div className="pipeline-meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                          <span>Stage:</span>
                          <span className="pipeline-stage-badge">
                            <span className="pipeline-stage-dot" />
                            {stageUpper}
                          </span>
                        </div>

                        <span className="pipeline-meta-divider" />

                        <div className="pipeline-meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>Applied: <strong style={{ color: '#cbd5e1', fontWeight: 500 }}>{appliedDate}</strong></span>
                        </div>
                      </div>

                      <div className="pipeline-skills-row">
                        {skills.map((sk, idx) => (
                          <div key={idx} className="pipeline-skill-pill">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
                              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
                            </svg>
                            <span>{sk}</span>
                            <span style={{ fontSize: 9.5, opacity: 0.8 }}>&gt;</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pipeline-search-bar">
              <span className="pipeline-search-icon">🔍</span>
              <input
                type="text"
                className="pipeline-search-input"
                placeholder="Search candidate name, email, or stage..."
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="pipeline-close-btn-gradient"
              onClick={() => setSelectedJobForApplicants(null)}
            >
              <span>&rarr;</span> Close Pipeline
            </button>
          </div>
        )}
      </Modal>

      {/* Modal 1: Candidate Profile Inspector */}
      <Modal open={!!selectedCandidateDetail} onClose={() => setSelectedCandidateDetail(null)} maxWidth={400}>
        {selectedCandidateDetail && (
          <div style={{ color: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                {(selectedCandidateDetail.candidate_name || 'U').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{selectedCandidateDetail.candidate_name}</h3>
                <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{selectedCandidateDetail.candidate_email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: '#0b1124', padding: 8, borderRadius: 7, border: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>AI Match</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#c084fc', marginTop: 1 }}>{selectedCandidateDetail.match_score || 48.4}%</div>
              </div>
              <div style={{ background: '#0b1124', padding: 8, borderRadius: 7, border: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Current Stage</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginTop: 1 }}>{selectedCandidateDetail.status || selectedCandidateDetail.stage || 'Screening'}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Matched Skills</div>
              <SkillTags skills={selectedCandidateDetail.matched_skills || ['Machine Learning']} />
            </div>

            <button
              type="button"
              style={{ width: '100%', padding: '8px', borderRadius: '7px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '12.5px' }}
              onClick={() => setSelectedCandidateDetail(null)}
            >
              Close Details
            </button>
          </div>
        )}
      </Modal>

      {/* Modal 2: Update Candidate Stage Picker */}
      <Modal open={!!stagePickerCandidate} onClose={() => setStagePickerCandidate(null)} maxWidth={420}>
        {stagePickerCandidate && (
          <div className="stage-modal-container">
            <div className="stage-modal-header">
              <div className="stage-header-left">
                <div className="stage-header-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="stage-header-title">
                    Update<span className="stage-header-highlight">Candidate</span>Stage
                  </h3>
                  <div className="stage-header-subtitle">
                    Select a new hiring stage for <strong>{stagePickerCandidate.candidate_name}</strong>:
                  </div>
                </div>
              </div>
            </div>

            <div className="stage-options-list">
              {STAGE_OPTIONS.map((opt) => {
                const isActive = (stagePickerCandidate.status || stagePickerCandidate.stage || '').toLowerCase() === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`stage-select-card ${isActive ? 'is-active' : ''}`}
                    style={{
                      border: isActive ? `1.5px solid ${opt.color}` : `1px solid ${opt.border}`,
                    }}
                    onClick={() => handleSelectStage(opt.key)}
                  >
                    <div className="stage-card-left">
                      <div
                        className="stage-badge-icon"
                        style={{
                          border: `1px solid ${opt.iconBorder}`,
                          background: opt.iconBg,
                          color: opt.color,
                        }}
                      >
                        {opt.icon}
                      </div>
                      <div className="stage-text-meta">
                        <span className="stage-card-title">{opt.label}</span>
                        <span className="stage-card-desc">{opt.desc}</span>
                      </div>
                    </div>

                    <div className={`stage-radio-circle ${isActive ? 'is-checked' : ''}`}>
                      {isActive && <span>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
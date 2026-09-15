import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';

const NAV_ITEMS = [
  { to: '/candidate', label: 'My Resume', icon: 'resume', end: true },
  { to: '/candidate/jobs', label: 'Browse Jobs', icon: 'briefcase' },
  { to: '/candidate/applications', label: 'My Applications', icon: 'applications' },
  { to: '/candidate/assessments', label: 'Assessments', icon: 'assessments' },
  { to: '/candidate/interviews', label: 'Interviews', icon: 'interviews' },
];

export default function CandidateLayout() {
  return (
    <div className="app-shell">
      <Sidebar roleTag="Candidate console" roleLabel="Candidate" items={NAV_ITEMS} />
      <div className="main">
        <div className="topbar"><NotificationBell /></div>
        <Outlet />
      </div>
    </div>
  );
}

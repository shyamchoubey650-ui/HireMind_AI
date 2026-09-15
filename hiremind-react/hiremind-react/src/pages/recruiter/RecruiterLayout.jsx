import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';

const NAV_ITEMS = [
  { to: '/recruiter', label: 'Analytics', icon: 'analytics', end: true },
  { to: '/recruiter/post-job', label: 'Post a Job', icon: 'assessments' },
  { to: '/recruiter/pipeline', label: 'Jobs & Pipeline', icon: 'applications' },
];

export default function RecruiterLayout() {
  return (
    <div className="app-shell">
      <Sidebar roleTag="Recruiter console" roleLabel="Recruiter" items={NAV_ITEMS} />
      <div className="main">
        <div className="topbar"><NotificationBell /></div>
        <Outlet />
      </div>
    </div>
  );
}

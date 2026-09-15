import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';

const NAV_ITEMS = [
  { to: '/admin', label: 'Platform Overview', icon: 'analytics', end: true },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/jobs', label: 'All Jobs', icon: 'building' },
];

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Sidebar roleTag="Admin console" roleLabel="Admin" items={NAV_ITEMS} />
      <div className="main">
        <div className="topbar"><NotificationBell /></div>
        <Outlet />
      </div>
    </div>
  );
}

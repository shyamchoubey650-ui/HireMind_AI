import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
];

function getAvatarGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return '30/08/2026';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '30/08/2026';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '30/08/2026';
  }
}

function formatDateTimeWithAmPm(dateString) {
  if (!dateString) return '30/08/2026, 04:39:35 AM';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '30/08/2026, 04:39:35 AM';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year}, ${strHours}:${minutes}:${seconds} ${ampm}`;
  } catch {
    return '30/08/2026, 04:39:35 AM';
  }
}

function UserDetail({ user, onToggle }) {
  const roleLower = (user.role || 'candidate').toLowerCase();
  const roleDescriptions = {
    recruiter: 'Can manage jobs, candidates and hiring process.',
    candidate: 'Can apply for jobs, take assessments and track applications.',
    admin: 'Full administrative access to manage all users and settings.',
  };

  const statusDescription = user.is_active
    ? 'User can access the platform and perform all actions.'
    : 'User account is deactivated and blocked from platform access.';

  return (
    <div className="premium-user-modal-content">
      <div className="pmodal-header">
        <div className="pmodal-avatar-wrapper">
          <div
            className="pmodal-avatar-inner"
            style={{ background: getAvatarGradient(user.full_name) }}
          >
            {getInitials(user.full_name)}
          </div>
          <span className={`pmodal-status-indicator ${user.is_active ? 'active' : 'inactive'}`} />
        </div>

        <div className="pmodal-identity">
          <div className="pmodal-name-row">
            <h2 className="pmodal-user-name">{user.full_name}</h2>
            <span className="pmodal-verified-shield" title="Verified Account">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </span>
          </div>

          <div className="pmodal-email-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span>{user.email}</span>
          </div>

          <div className="pmodal-role-pill-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}</span>
          </div>
        </div>
      </div>

      <div className="pmodal-grid-two">
        <div className="pmodal-card">
          <div className="pmodal-card-top">
            <div className="pmodal-icon-badge role-badge-color">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="pmodal-card-heading">
              <span className="pmodal-tiny-eyebrow">ASSIGNED ROLE</span>
              <div className="pmodal-stat-title">
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Recruiter'}
              </div>
            </div>
            <span className="pmodal-chevron">&gt;</span>
          </div>
          <p className="pmodal-card-desc">{roleDescriptions[roleLower] || roleDescriptions.recruiter}</p>
        </div>

        <div className={`pmodal-card ${user.is_active ? 'active-border' : 'inactive-border'}`}>
          <div className="pmodal-card-top">
            <div className="pmodal-icon-badge status-badge-color">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="pmodal-card-heading">
              <span className="pmodal-tiny-eyebrow">ACCOUNT STATUS</span>
              <div className="pmodal-status-badge-chip">
                <span className="pmodal-green-dot" />
                <span>{user.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
            <span className="pmodal-chevron">&gt;</span>
          </div>
          <p className="pmodal-card-desc">{statusDescription}</p>
        </div>
      </div>

      <div className="pmodal-card activity-variant">
        <div className="pmodal-activity-header">
          <div className="pmodal-icon-badge activity-badge-color">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h4 className="pmodal-activity-title">Activity &amp; Registration</h4>
        </div>

        <div className="pmodal-activity-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{user.stat_label || 'User has standard active permissions on the platform.'}</span>
        </div>

        <div className="pmodal-activity-item divider-border">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>
            Joined: <strong style={{ color: '#fff', fontWeight: 600 }}>{formatDateTimeWithAmPm(user.created_at)}</strong>
          </span>
        </div>
      </div>

      {user.role !== 'admin' && (
        <button
          type="button"
          className={`pmodal-action-btn ${user.is_active ? 'btn-deactivate' : 'btn-activate'}`}
          onClick={onToggle}
        >
          <div className="pmodal-btn-content-left">
            {user.is_active ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            <span className="pmodal-btn-divider" />
            <span>{user.is_active ? 'Deactivate this account' : 'Activate this account'}</span>
          </div>
          <span className="pmodal-btn-chevron">&gt;</span>
        </button>
      )}
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const pageSize = 5;
  const toast = useToast();

  async function load() {
    try {
      const data = await apiRequest('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      toast(e.message || 'Failed to load users', 'error');
      setUsers([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleClearFilters() {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setSelectedIds(new Set());
    setCurrentPage(1);
  }

  const filtered = useMemo(() => {
    if (!users) return [];
    const s = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !s ||
        (u.full_name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.role || '').toLowerCase().includes(s);

      const matchesRole = roleFilter === 'all' || (u.role || '').toLowerCase() === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'inactive' && !u.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const allOnPageSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedIds.has(u.id));

  function toggleSelectAll() {
    const next = new Set(selectedIds);
    if (allOnPageSelected) {
      paginatedUsers.forEach((u) => next.delete(u.id));
    } else {
      paginatedUsers.forEach((u) => next.add(u.id));
    }
    setSelectedIds(next);
  }

  function toggleSelectRow(id, e) {
    if (e) e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  async function toggleUser(userId, isActive) {
    try {
      const action = isActive ? 'deactivate' : 'activate';
      await apiRequest(`/admin/users/${userId}/${action}`, { method: 'PATCH' });
      toast(`User ${action}d successfully`, 'success');
      await load();
      setSelectedUser(null);
    } catch (e) {
      toast(e.message || 'Operation failed', 'error');
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }

        .users-panel-wrapper {
          background: #080d1a;
          border: 1px solid rgba(59, 130, 246, 0.18);
          border-radius: 18px;
          padding: 24px;
          box-shadow: none !important;
          color: #f8fafc;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          width: 100%;
        }

        /* Desktop Grid Toolbar */
        .users-filter-toolbar {
          display: grid;
          grid-template-columns: 1fr 140px 140px auto;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          width: 100%;
        }

        .users-search-bar {
          position: relative;
          width: 100%;
          min-width: 0;
        }

        .search-lens-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-bar-input {
          width: 100%;
          height: 42px;
          background: #0c1427;
          border: 1px solid rgba(59, 130, 246, 0.22);
          border-radius: 10px;
          padding: 0 16px 0 42px;
          color: #f8fafc;
          font-size: 13.5px;
          outline: none;
          box-shadow: none !important;
          filter: none !important;
          transition: border-color 0.2s ease;
        }

        .search-bar-input:focus {
          border-color: #3b82f6;
        }

        .users-dropdown {
          width: 100%;
          height: 42px;
          background: #0c1427;
          border: 1px solid rgba(59, 130, 246, 0.22);
          border-radius: 10px;
          padding: 0 14px;
          color: #cbd5e1;
          font-size: 13px;
          outline: none;
          cursor: pointer;
          box-shadow: none !important;
          filter: none !important;
          white-space: nowrap;
          transition: border-color 0.2s ease;
        }

        .users-dropdown:focus {
          border-color: #3b82f6;
        }

        .clear-filters-btn {
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #0c1427;
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 10px;
          padding: 0 18px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: none !important;
          filter: none !important;
          outline: none;
          white-space: nowrap;
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .clear-filters-btn:hover {
          background: #131f38;
          border-color: #3b82f6;
          color: #ffffff;
        }

        /* Mobile Viewport: Stack all 4 items vertically */
        @media (max-width: 768px) {
          .users-panel-wrapper {
            padding: 16px;
          }

          .users-filter-toolbar {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-bottom: 18px;
          }

          .users-search-bar,
          .users-dropdown,
          .clear-filters-btn {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box;
          }

          .clear-filters-btn {
            justify-content: center;
          }
        }

        /* Table Structure */
        .table-responsive-box {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .user-modern-table {
          width: 100%;
          min-width: 680px;
          border-collapse: separate;
          border-spacing: 0 8px;
          text-align: left;
        }

        .user-modern-table thead th {
          padding: 10px 16px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
          white-space: nowrap;
        }

        .user-modern-table tbody tr {
          background: #0b1326;
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: background-color 0.15s ease;
          cursor: pointer;
          box-shadow: none !important;
          filter: none !important;
        }

        .user-modern-table tbody tr:hover {
          background: #101c36;
        }

        .user-modern-table tbody tr.is-row-active {
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.18) 0%, #0b1326 100%);
          border-left: 3px solid #3b82f6;
        }

        .user-modern-table tbody td {
          padding: 14px 16px;
          vertical-align: middle;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .user-modern-table tbody td:first-child {
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
          border-left: 1px solid rgba(255, 255, 255, 0.03);
        }

        .user-modern-table tbody td:last-child {
          border-top-right-radius: 10px;
          border-bottom-right-radius: 10px;
          border-right: 1px solid rgba(255, 255, 255, 0.03);
        }

        /* Checkbox */
        .select-checkbox {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          border: 1px solid rgba(148, 163, 184, 0.4);
          background: rgba(15, 23, 42, 0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none !important;
        }

        .select-checkbox.checked {
          background: #3b82f6;
          border-color: #3b82f6;
        }

        /* User Profile Info */
        .user-cell-flex {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
        }

        .user-avatar-badge {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          color: #ffffff;
          flex-shrink: 0;
          box-shadow: none !important;
          filter: none !important;
        }

        .user-name-title {
          font-weight: 700;
          color: #f8fafc;
          font-size: 14px;
        }

        .user-subtitle {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 1px;
          text-transform: capitalize;
        }

        /* Role Pills */
        .role-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
          box-shadow: none !important;
          filter: none !important;
        }

        .role-pill.recruiter {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #f59e0b;
        }

        .role-pill.candidate {
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #60a5fa;
        }

        .role-pill.admin {
          background: rgba(168, 85, 247, 0.08);
          border: 1px solid rgba(168, 85, 247, 0.35);
          color: #c084fc;
        }

        /* Status Pills */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: none !important;
          filter: none !important;
        }

        .status-pill.active {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .status-pill.inactive {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .status-pill .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          box-shadow: none !important;
        }

        .status-pill.active .dot {
          background: #34d399;
        }

        .status-pill.inactive .dot {
          background: #f87171;
        }

        /* Action Buttons */
        .actions-cell-group {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
        }

        .action-round-btn {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          background: #0f182c;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          box-shadow: none !important;
          filter: none !important;
          outline: none;
          flex-shrink: 0;
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .action-round-btn:hover {
          background: #1c2a47;
          border-color: rgba(59, 130, 246, 0.5);
          color: #ffffff;
        }

        /* Pagination */
        .pagination-row-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 20px;
          color: #94a3b8;
          font-size: 13px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pagination-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .page-step-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #0c1427;
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: #94a3b8;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none !important;
          filter: none !important;
          outline: none;
          transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
        }

        .page-step-btn:hover:not(:disabled) {
          border-color: #3b82f6;
          color: #ffffff;
        }

        .page-step-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #ffffff;
        }

        .page-step-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* Modal Styles */
        .premium-user-modal-content {
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 100%;
        }

        .pmodal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .pmodal-avatar-wrapper {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          flex-shrink: 0;
          box-shadow: none !important;
        }

        .pmodal-avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 19px;
          color: #ffffff;
          border: 2px solid #090e1f;
        }

        .pmodal-status-indicator {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10b981;
          border: 2px solid #090e1f;
        }

        .pmodal-status-indicator.inactive {
          background: #ef4444;
        }

        .pmodal-identity {
          flex: 1;
          min-width: 0;
        }

        .pmodal-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pmodal-user-name {
          font-size: 21px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .pmodal-verified-shield {
          display: inline-flex;
          align-items: center;
        }

        .pmodal-email-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #94a3b8;
          font-family: var(--font-mono, monospace);
          margin-top: 3px;
        }

        .pmodal-role-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 16px;
          background: rgba(30, 58, 138, 0.35);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #93c5fd;
          font-size: 11px;
          font-weight: 600;
          margin-top: 7px;
        }

        .pmodal-grid-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .pmodal-card {
          background: #0b1324;
          border: 1px solid rgba(59, 130, 246, 0.18);
          border-radius: 12px;
          padding: 14px;
          box-shadow: none !important;
        }

        .pmodal-card.active-border {
          border-color: rgba(16, 185, 129, 0.3);
        }

        .pmodal-card.inactive-border {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .pmodal-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 8px;
          gap: 8px;
        }

        .pmodal-icon-badge {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .role-badge-color {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.25);
          color: #60a5fa;
        }

        .status-badge-color {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #34d399;
        }

        .activity-badge-color {
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
        }

        .pmodal-card-heading {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 4px;
        }

        .pmodal-tiny-eyebrow {
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.08em;
        }

        .pmodal-stat-title {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          margin-top: 1px;
        }

        .pmodal-status-badge-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.04em;
          width: fit-content;
          margin-top: 3px;
        }

        .pmodal-green-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #34d399;
        }

        .pmodal-chevron {
          color: #64748b;
          font-size: 14px;
          font-weight: 700;
          margin-left: auto;
        }

        .pmodal-card-desc {
          margin: 0;
          font-size: 11.5px;
          color: #94a3b8;
          line-height: 1.4;
        }

        .pmodal-card.activity-variant {
          padding: 14px 16px;
          margin-bottom: 16px;
        }

        .pmodal-activity-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .pmodal-activity-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .pmodal-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: #cbd5e1;
          line-height: 1.4;
        }

        .pmodal-activity-item.divider-border {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pmodal-action-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 700;
          border: none;
          outline: none;
          box-shadow: none !important;
          transition: background-color 0.15s ease;
        }

        .pmodal-action-btn.btn-deactivate {
          background: #9f1239;
          color: #ffffff;
        }

        .pmodal-action-btn.btn-deactivate:hover {
          background: #be123c;
        }

        .pmodal-action-btn.btn-activate {
          background: #065f46;
          color: #ffffff;
        }

        .pmodal-action-btn.btn-activate:hover {
          background: #047857;
        }

        .pmodal-btn-content-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pmodal-btn-divider {
          width: 1.5px;
          height: 16px;
          background: rgba(255, 255, 255, 0.2);
        }

        .pmodal-btn-chevron {
          font-size: 14px;
          font-weight: 800;
        }
      `}</style>

      <div className="users-panel-wrapper">
        {/* Controls Toolbar with 4-item column stack on mobile */}
        <div className="users-filter-toolbar">
          <div className="users-search-bar">
            <span className="search-lens-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search by name, email, role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="users-dropdown"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Roles</option>
            <option value="recruiter">Recruiter</option>
            <option value="candidate">Candidate</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="users-dropdown"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearFilters}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Clear Filters
          </button>
        </div>

        {/* Users Table */}
        <div className="table-responsive-box">
          <table className="user-modern-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <div
                    className={`select-checkbox ${allOnPageSelected ? 'checked' : ''}`}
                    onClick={toggleSelectAll}
                  >
                    {allOnPageSelected && <span style={{ fontSize: 11, color: '#fff' }}>✓</span>}
                  </div>
                </th>
                <th>User</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users === null ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Loading users directory...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, index) => {
                  const isSelected = selectedIds.has(u.id);
                  const isTopActive = index === 0 && currentPage === 1 && !selectedIds.size;
                  const initials = getInitials(u.full_name);
                  const gradient = getAvatarGradient(u.full_name);
                  const roleLower = (u.role || 'candidate').toLowerCase();

                  return (
                    <tr
                      key={u.id}
                      className={isSelected || isTopActive ? 'is-row-active' : ''}
                      onClick={() => setSelectedUser(u)}
                    >
                      <td>
                        <div
                          className={`select-checkbox ${isSelected ? 'checked' : ''}`}
                          onClick={(e) => toggleSelectRow(u.id, e)}
                        >
                          {isSelected && <span style={{ fontSize: 11, color: '#fff' }}>✓</span>}
                        </div>
                      </td>

                      {/* User Column */}
                      <td>
                        <div className="user-cell-flex">
                          <div className="user-avatar-badge" style={{ background: gradient }}>
                            {initials}
                          </div>
                          <div>
                            <div className="user-name-title">{u.full_name}</div>
                            <div className="user-subtitle">{u.role || 'Member'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td style={{ color: '#cbd5e1', fontSize: '13.5px' }}>
                        {u.email}
                      </td>

                      {/* Role Pill */}
                      <td>
                        <span className={`role-pill ${roleLower}`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td>
                        <span className={`status-pill ${u.is_active ? 'active' : 'inactive'}`}>
                          <span className="dot" />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1', fontSize: '13px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span>{formatDate(u.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="actions-cell-group">
                          <button
                            type="button"
                            className="action-round-btn"
                            onClick={() => setSelectedUser(u)}
                            title="View Details"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              className="action-round-btn"
                              onClick={() => toggleUser(u.id, u.is_active)}
                              title={u.is_active ? 'Deactivate User' : 'Activate User'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            className="action-round-btn"
                            onClick={() => setSelectedUser(u)}
                            title="More Actions"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        <div className="pagination-row-bar">
          <div>
            Showing {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} users
          </div>

          <div className="pagination-btn-group">
            <button
              type="button"
              className="page-step-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                type="button"
                key={page}
                className={`page-step-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="page-step-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth={480}>
        {selectedUser && (
          <UserDetail
            user={selectedUser}
            onToggle={() => toggleUser(selectedUser.id, selectedUser.is_active)}
          />
        )}
      </Modal>
    </div>
  );
}
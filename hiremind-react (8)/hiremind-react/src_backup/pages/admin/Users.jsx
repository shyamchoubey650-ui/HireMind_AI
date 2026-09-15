import { useState, useEffect, useMemo } from 'react';
import { apiRequest } from '../../api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';

const COLUMNS = [
  { key: 'full_name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: null, label: 'Activity' },
  { key: 'is_active', label: 'Status' },
  { key: 'created_at', label: 'Joined' },
  { key: null, label: '' },
];

// Shared column widths so the sliding row grid lines up under the <thead>.
const ROW_GRID = '1.3fr 1.6fr 0.9fr 1.1fr 0.8fr 0.9fr 0.9fr';

function UserDetail({ user, onToggle }) {
  return (
    <div>
      <div className="row" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
        <div className="row" style={{ gap: 12 }}>
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 17 }}>{user.full_name.charAt(0).toUpperCase()}</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>{user.full_name}</div>
            <div className="muted mono" style={{ fontSize: 12 }}>{user.email}</div>
          </div>
        </div>
      </div>
      <div className="grid-2" style={{ marginBottom: 6 }}>
        <div className="stat-box">
          <div className="stat-label">Role</div>
          <div style={{ marginTop: 4 }}><span className={`role-badge ${user.role}`}>{user.role}</span></div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Status</div>
          <div style={{ marginTop: 4 }}>
            <span className={`pill-toggle ${user.is_active ? 'active-yes' : 'active-no'}`}>{user.is_active ? 'active' : 'inactive'}</span>
          </div>
        </div>
      </div>
      <div className="divider-label">activity</div>
      <div className="muted" style={{ fontSize: 13 }}>{user.stat_label}</div>
      <div className="divider-label">joined</div>
      <div className="muted mono" style={{ fontSize: 12.5 }}>{new Date(user.created_at).toLocaleString()}</div>
      {user.role !== 'admin' && (
        <button style={{ width: '100%' }} className={user.is_active ? 'danger' : 'secondary'} onClick={onToggle}>
          {user.is_active ? 'Deactivate this account' : 'Activate this account'}
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
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const toast = useToast();

  async function load() {
    try {
      const data = await apiRequest('/admin/users');
      setUsers(data);
    } catch (e) {
      toast(e.message, 'error');
      setUsers([]);
    }
  }

  useEffect(() => { load(); }, []);

  function setSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = useMemo(() => {
    if (!users) return [];
    const s = search.toLowerCase().trim();
    let list = users.filter((u) => {
      if (s && !(u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s))) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'inactive' && u.is_active) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'created_at') { va = new Date(va).getTime(); vb = new Date(vb).getTime(); }
      if (sortKey === 'is_active') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, roleFilter, statusFilter, sortKey, sortDir]);

  async function toggleUser(userId, isActive) {
    try {
      const action = isActive ? 'deactivate' : 'activate';
      await apiRequest(`/admin/users/${userId}/${action}`, { method: 'PATCH' });
      toast(`User ${action}d`, 'success');
      await load();
      setSelectedUser(null);
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-eyebrow">Access control</div>
        <h1 className="page-title">Users</h1>
        <p className="page-sub">Deactivate accounts to immediately block login — data is preserved. Click a row for details.</p>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            type="text" placeholder="Search by name or email..." style={{ flex: 1, minWidth: 220 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <select style={{ width: 'auto', minWidth: 150 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="candidate">Candidates</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
          <select style={{ width: 'auto', minWidth: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>

        {users === null && <div className="muted">Loading...</div>}

        {users && filtered.length > 0 && (
          <div className="table-scroll">
            <div className="data-grid">
              <div className="data-grid-head" style={{ gridTemplateColumns: ROW_GRID }}>
                {COLUMNS.map((col) => (
                  <div
                    key={col.label || 'actions'}
                    className={col.key ? 'sortable' : ''}
                    onClick={() => col.key && setSort(col.key)}
                  >
                    {col.label}
                    {col.key && <span className="sort-arrow">{sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>}
                  </div>
                ))}
              </div>

                              {filtered.map((u) => (
                  <div
                    className="data-grid-row"
                    style={{ gridTemplateColumns: ROW_GRID, cursor: 'pointer' }}
                    onClick={() => setSelectedUser(u)}
                    key={u.id}
                  >
                    <div>{u.full_name}</div>
                    <div className="mono" style={{ fontSize: 12 }}>{u.email}</div>
                    <div><span className={`role-badge ${u.role}`}>{u.role}</span></div>
                    <div className="muted" style={{ fontSize: 12 }}>{u.stat_label}</div>
                    <div><span className={`pill-toggle ${u.is_active ? 'active-yes' : 'active-no'}`}>{u.is_active ? 'active' : 'inactive'}</span></div>
                    <div className="muted mono" style={{ fontSize: 11.5 }}>{new Date(u.created_at).toLocaleDateString()}</div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {u.role !== 'admin' && (
                        <button className={`small ${u.is_active ? 'danger' : 'secondary'}`} onClick={() => toggleUser(u.id, u.is_active)}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {users && filtered.length === 0 && (
          <div className="empty-state">
            <div className="es-icon">☰</div>
            <div className="es-title">No users match your filters</div>
            <div className="es-sub">Try clearing the search or filter.</div>
          </div>
        )}
      </div>

      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth={420}>
        {selectedUser && (
          <UserDetail user={selectedUser} onToggle={() => toggleUser(selectedUser.id, selectedUser.is_active)} />
        )}
      </Modal>
    </div>
  );
}

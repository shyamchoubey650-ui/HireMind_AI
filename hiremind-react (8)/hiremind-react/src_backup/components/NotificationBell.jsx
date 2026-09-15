import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../api';
import { useToast } from '../context/ToastContext';
import Icon from './Icon';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const toast = useToast();

  const refreshBadge = useCallback(async () => {
    try {
      const data = await apiRequest('/notifications/mine/unread-count');
      setUnread(data.unread || 0);
    } catch (_) { /* silent */ }
  }, []);

  useEffect(() => {
    refreshBadge();
    const id = setInterval(refreshBadge, 20000);
    return () => clearInterval(id);
  }, [refreshBadge]);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/notifications/mine');
      setNotes(data);
    } catch (_) {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) await loadNotes();
  }

  async function markRead(id) {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      refreshBadge();
    } catch (_) { /* silent */ }
  }

  async function markAllRead() {
    try {
      await apiRequest('/notifications/read-all', { method: 'PATCH' });
      await loadNotes();
      refreshBadge();
    } catch (_) {
      toast('Could not mark notifications read', 'error');
    }
  }

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button className="notif-bell" onClick={toggle}>
        <Icon name="bell" size={16} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-head">
            Notifications
            <button className="secondary small" onClick={markAllRead}>Mark all read</button>
          </div>
          {loading && <div className="notif-empty">Loading...</div>}
          {!loading && notes.length === 0 && <div className="notif-empty">You're all caught up.</div>}
          {!loading && notes.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.is_read ? '' : 'unread'}`}
              onClick={() => markRead(n.id)}
            >
              <div>{n.message}</div>
              <div className="ni-time">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

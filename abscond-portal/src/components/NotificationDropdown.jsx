import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function NotificationDropdown() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = () => {
      ApiClient.get('/students/notifications', {}, getAccessToken, refreshAccessToken)
        .then((data) => {
          if (isMounted) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(() => {});
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [getAccessToken, refreshAccessToken]);



  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (notification) => {
    if (!notification.isRead) {
      try {
        await ApiClient.patch(`/students/notifications/${notification.id}/read`, {}, getAccessToken, refreshAccessToken);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      }
    }
    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await ApiClient.patch('/students/notifications/read-all', {}, getAccessToken, refreshAccessToken);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'result':
        return '📊';
      case 'fee':
        return '💳';
      case 'academic':
        return '📚';
      case 'clinical':
        return '🏥';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="notification-dropdown-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="portal-notification-bell-btn"
        aria-label={`${unreadCount} unread notifications`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          alignItems: 'center',
          backgroundColor: isOpen ? '#e0e7ff' : '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '50%',
          color: '#0047b3',
          cursor: 'pointer',
          display: 'inline-flex',
          height: '40px',
          justifyContent: 'center',
          position: 'relative',
          width: '40px',
          transition: 'all 0.2s ease',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '18px' }}>🔔</span>
        {unreadCount > 0 && (
          <b
            style={{
              alignItems: 'center',
              backgroundColor: '#dc2626',
              borderRadius: '999px',
              color: '#ffffff',
              display: 'inline-flex',
              fontSize: '11px',
              fontWeight: '700',
              height: '18px',
              justifyContent: 'center',
              position: 'absolute',
              right: '-4px',
              top: '-4px',
              minWidth: '18px',
              padding: '0 4px',
              boxShadow: '0 0 0 2px #ffffff',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </b>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-popover-menu"
          style={{
            position: 'absolute',
            right: '0',
            top: '48px',
            width: '360px',
            maxWidth: '90vw',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc',
            }}
          >
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Portal Notifications</strong>
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: '8px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: '600',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0047b3',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '24px', margin: '0 0 8px 0' }}>🎉</p>
                <p style={{ margin: 0, fontSize: '13px' }}>You are all caught up! No notifications.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n)}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => e.key === 'Enter' && handleMarkAsRead(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #f8fafc',
                    backgroundColor: n.isRead ? '#ffffff' : '#f0f7ff',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = n.isRead ? '#f8fafc' : '#e0effe')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.isRead ? '#ffffff' : '#f0f7ff')}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: n.isRead ? '#f1f5f9' : '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {getCategoryIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong
                        style={{
                          fontSize: '13px',
                          color: '#1e293b',
                          fontWeight: n.isRead ? '500' : '700',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginRight: '8px',
                        }}
                      >
                        {n.title}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        color: '#64748b',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#0047b3',
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/portal/announcements');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0047b3',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View Official Campus Circulars →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

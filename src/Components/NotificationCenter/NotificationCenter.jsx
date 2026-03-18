import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, Check } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './NotificationCenter.css';

export default function NotificationCenter({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data || []);
        const unread = (data || []).filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    };

    fetchNotifications();
  }, [session]);

  // Set up realtime subscription for new notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const subscription = supabase
      .channel(`notifications:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add new notification to top of list
            setNotifications((prev) => [payload.new, ...prev.slice(0, 9)]);
            setUnreadCount((prev) => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing notification
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
            if (!payload.old.read && payload.new.read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const markAsRead = async (notificationId, isRead) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: !isRead })
      .eq('id', notificationId);

    if (error) {
      console.error('Error updating notification:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', session.user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_comment':
        return '💬';
      case 'comment_reply':
        return '↩️';
      case 'new_subscriber':
        return '👤';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">{Math.min(unreadCount, 99)}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.read ? 'read' : 'unread'
                  }`}
                >
                  <span className="notification-type-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    {notification.message && (
                      <p className="notification-message">
                        {notification.message}
                      </p>
                    )}
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  </div>
                  <div className="notification-actions">
                    <button
                      className="notification-action-btn"
                      onClick={() =>
                        markAsRead(notification.id, notification.read)
                      }
                      title={notification.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <Check
                        size={16}
                        color={notification.read ? '#4f46e5' : '#9ca3af'}
                      />
                    </button>
                    <button
                      className="notification-action-btn"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

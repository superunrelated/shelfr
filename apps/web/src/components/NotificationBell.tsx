import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiNotification3Line, RiCloseLine } from '@remixicon/react';
import type { Notification } from '../hooks/useNotifications';

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllRead,
  onDismiss,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleNotificationClick(n: Notification) {
    if (!n.read) onMarkAsRead(n.id);
    // Invite notifications go to collections overview (must accept first)
    const target = n.type === 'invite' ? '/shelfs' : n.link;
    if (target) {
      navigate(target);
      setOpen(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <RiNotification3Line size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#2a2d3d] rounded shadow-xl border border-neutral-700 overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-700">
            <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-xs text-neutral-500 py-6 text-center">
                No notifications
              </p>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${n.read ? 'opacity-50' : 'hover:bg-white/5'}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-amber-500'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium leading-snug">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(n.id);
                  }}
                  className="p-0.5 rounded text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  <RiCloseLine size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATIONS = [
  {
    id: 1,
    icon: '🌡️',
    title: 'Automation Insight',
    desc: 'Nest Thermostat detected the AC was left on while you were away. It has been turned off. (-1.2 kg CO₂ saved)',
    time: '2 mins ago',
    read: false,
    color: '#00F2A6'
  },
  {
    id: 2,
    icon: '✅',
    title: 'Action Verified',
    desc: "Your image of 'Recycling' was approved by AI. +50 EcoPoints awarded to your account.",
    time: '1 hour ago',
    read: false,
    color: '#f87171'
  },
  {
    id: 3,
    icon: '💡',
    title: 'Behavioral Nudge',
    desc: 'You have taken 3 car trips this week. Try taking the Metro tomorrow to earn a 2x Streak Bonus!',
    time: '4 hours ago',
    read: false,
    color: '#60a5fa'
  }
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="cc-notif-wrapper" ref={wrapperRef}>
      <button 
        className={`cc-icon-btn ${isOpen ? 'active' : ''}`} 
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>🔔</span>
        {unreadCount > 0 && <span className="cc-icon-dot" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="cc-notif-dropdown"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="cc-notif-header">
              <h3>Insights & Alerts</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button className="cc-notif-mark-read" onClick={markAllRead}>
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button className="cc-notif-mark-read" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
            </div>
            
            <div className="cc-notif-list">
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`cc-notif-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                    style={{ cursor: 'pointer' }}
                  >
                  <div className="cc-notif-icon" style={{ background: `${notif.color}15`, border: `1px solid ${notif.color}30` }}>
                    {notif.icon}
                  </div>
                  <div className="cc-notif-content">
                    <div className="cc-notif-title-row">
                      <span className="cc-notif-title" style={{ color: notif.color }}>{notif.title}</span>
                      <span className="cc-notif-time">{notif.time}</span>
                    </div>
                    <p className="cc-notif-desc">{notif.desc}</p>
                  </div>
                  <button 
                    className="cc-notif-delete-btn"
                    onClick={(e) => deleteNotification(notif.id, e)}
                    title="Delete notification"
                  >
                    ×
                  </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

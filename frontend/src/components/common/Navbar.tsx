import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Building, ShieldCheck, UserCheck, Check, Sparkles } from 'lucide-react';
import { apiRequest } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiRequest('/notices/notifications');
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await apiRequest('/notices/notifications/read-all', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // ignore
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Brand & Context */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2 text-brand-700 font-bold text-xl tracking-tight">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Building className="w-5 h-5" />
          </div>
          <span>Hostel<span className="text-teal-600">Hub</span></span>
        </Link>

        {user?.college && (
          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-200 text-xs text-slate-500 font-medium">
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
              {user.college.code}
            </span>
            <span>{user.college.name}</span>
            {user.hostel && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-brand-700 font-medium">{user.hostel.name}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Verification Portal Shortcut */}
        <Link
          to="/verify-pass"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Security Gate Scanner</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition ${
                        n.isRead ? 'bg-white opacity-70' : 'bg-brand-50/40 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-700 font-semibold mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        {user ? (
          <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {user.fullName}
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center border border-brand-200 shadow-sm">
              {user.fullName.charAt(0)}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

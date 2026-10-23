import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Home,
  CalendarCheck,
  UtensilsCrossed,
  Shirt,
  Sparkles,
  CreditCard,
  MessageSquareWarning,
  FileCheck2,
  BookOpen,
  Dumbbell,
  User,
  Users,
  Bed,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  History,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user } = useAuth();
  if (!user) return null;

  const studentLinks = [
    { to: '/student', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/student/room', label: 'My Hostel & Room', icon: Home },
    { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/student/mess', label: 'Mess Management', icon: UtensilsCrossed },
    { to: '/student/laundry', label: 'Laundry Slots', icon: Shirt },
    { to: '/student/cleaning', label: 'Housekeeping', icon: Sparkles },
    { to: '/student/fees', label: 'Fees & Payments', icon: CreditCard },
    { to: '/student/complaints', label: 'Complaint Center', icon: MessageSquareWarning },
    { to: '/student/leave', label: 'Leave & Gate Pass', icon: FileCheck2 },
    { to: '/student/rules', label: 'Hostel Rules & Fines', icon: BookOpen },
    { to: '/student/facilities', label: 'Campus Facilities', icon: Dumbbell },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const wardenLinks = [
    { to: '/warden', label: 'Overview & Analytics', icon: LayoutDashboard, end: true },
    { to: '/warden/students', label: 'Student Directory & Approvals', icon: Users },
    { to: '/warden/rooms', label: 'Rooms & Bed Allocations', icon: Bed },
    { to: '/warden/attendance', label: 'Attendance Sessions', icon: CalendarCheck },
    { to: '/warden/mess', label: 'Mess Menu Publisher', icon: UtensilsCrossed },
    { to: '/warden/services', label: 'Laundry & Housekeeping', icon: Sparkles },
    { to: '/warden/finance', label: 'Fees, Charges & Fines', icon: CreditCard },
    { to: '/warden/complaints', label: 'Complaint Desk & SLA', icon: MessageSquareWarning },
    { to: '/warden/leave', label: 'Leave Applications', icon: FileCheck2 },
    { to: '/warden/notices', label: 'Publish Notices', icon: Megaphone },
    { to: '/warden/audit', label: 'Hostel Audit Trail', icon: History },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Platform Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/colleges', label: 'Colleges & Verification', icon: Building2 },
    { to: '/admin/audit', label: 'System Audit Logs', icon: History },
  ];

  let links = studentLinks;
  if (user.role === 'WARDEN') links = wardenLinks;
  if (user.role === 'PLATFORM_ADMIN') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          {user.role.replace('_', ' ')} PORTAL
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
            {user.college?.code?.slice(0, 3) || 'HUB'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-800 truncate">
              {user.college?.name || 'Platform Admin'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {user.hostel?.name || 'Multi-College System'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { Role, NotificationItem } from '../types';
import { Bell, Menu, LogOut, Shield, GraduationCap, Briefcase, Activity, ChevronDown, Check, User } from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
  onToggleMobileMenu?: () => void;
  loggedInName?: string;
  onLogout?: () => void;
  id?: string;
}

const roleProfiles: Record<Role, { label: string; name: string; title: string; icon: React.ElementType }> = {
  ADMIN: {
    label: 'Administrator',
    name: 'Dr. Alistair Vance',
    title: 'Campus Director',
    icon: Shield
  },
  TEACHER: {
    label: 'Teacher / Faculty',
    name: 'Sarah Jenkins',
    title: 'Faculty & Class 8A Head',
    icon: Briefcase
  },
  STUDENT: {
    label: 'Student Portal',
    name: 'Aiden Sharma',
    title: 'Grade 8 (STU-8A-01)',
    icon: GraduationCap
  },
  PARENT: {
    label: 'Parent / Guardian',
    name: 'Sunita Sharma',
    title: 'Guardian (STU-8A-01)',
    icon: User
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  notifications,
  onMarkNotificationRead,
  onMarkAllRead,
  onToggleMobileMenu,
  loggedInName,
  onLogout,
  id = "app-header"
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const currentProfile = roleProfiles[currentRole] || roleProfiles.ADMIN;
  const RoleIcon = currentProfile.icon;
  const displayName = loggedInName || currentProfile.name;

  return (
    <header id={id} className="sticky top-0 z-40 w-full bg-[#FFF8EC]/85 backdrop-blur-xl border-b border-[#6B1E2B]/12 shadow-[0_4px_20px_-8px_rgba(107,30,43,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-[#6B1E2B] hover:bg-[#6B1E2B]/10 border border-[#6B1E2B]/15 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-[#6B1E2B] border-2 border-[#FFF8EC] flex items-center justify-center shadow-md shadow-[#6B1E2B]/20">
            <span className="font-mono font-extrabold text-[#FFF8EC] text-base tracking-tighter">
              D<span className="text-[#E8DDCA]">A</span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#2B2020] text-lg tracking-tight font-terminal">
                DEVORA AI
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold tracking-widest text-[#6B1E2B] bg-[#6B1E2B]/10 px-2 py-0.5 rounded border border-[#6B1E2B]/20">
                CAMPUS OS
              </span>
            </div>
            <div className="text-[11px] font-medium text-[#756565] hidden md:block">
              Intelligent Campus Operations Engine
            </div>
          </div>
        </div>

        {/* Center: Interactive Role Switcher with Student Option */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2.5 bg-[#F3EBDD]/90 hover:bg-[#F3EBDD] px-3.5 py-1.5 rounded-xl border border-[#6B1E2B]/15 hover:border-[#6B1E2B]/30 backdrop-blur-md transition-all cursor-pointer shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center">
              <RoleIcon className="w-4 h-4 text-[#6B1E2B]" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#2B2020] leading-none flex items-center gap-1.5">
                <span>{displayName}</span>
                <span className="text-[10px] font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-1.5 py-0.2 rounded">
                  {currentRole}
                </span>
              </div>
              <div className="text-[10px] text-[#756565] font-mono mt-0.5">{currentProfile.title}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[#756565] transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Role Selection Dropdown */}
          {showRoleDropdown && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl bg-[#FFF8EC]/95 backdrop-blur-xl border border-[#6B1E2B]/20 shadow-2xl shadow-[#6B1E2B]/15 z-50 overflow-hidden animate-in fade-in zoom-in duration-100 p-2 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold text-[#756565]">
                Switch Active Role View
              </div>
              {(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] as Role[]).map((r) => {
                const profile = roleProfiles[r];
                const Icon = profile.icon;
                const isSelected = currentRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#6B1E2B] text-white shadow-sm'
                        : 'hover:bg-[#F3EBDD] text-[#2B2020]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#6B1E2B]/10 text-[#6B1E2B]'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-none">{profile.label}</div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#756565]'}`}>
                          {profile.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">


          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="btn-notifications-bell"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl bg-[#FFF8EC]/80 hover:bg-[#FFF8EC] text-[#2B2020] hover:text-[#6B1E2B] border border-[#6B1E2B]/15 transition-all cursor-pointer shadow-xs"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B94A55] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Card */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FFF8EC]/95 backdrop-blur-xl border border-[#6B1E2B]/20 shadow-2xl shadow-[#6B1E2B]/15 z-50 overflow-hidden animate-in fade-in zoom-in duration-100">
                <div className="p-3.5 bg-[#E8DDCA]/70 border-b border-[#6B1E2B]/15 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2B2020]">
                    Notifications ({notifications.length})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-[11px] font-mono font-semibold text-[#6B1E2B] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#6B1E2B]/10 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs font-mono text-[#9A8989]">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onMarkNotificationRead(item.id)}
                        className={`p-3.5 transition-colors cursor-pointer space-y-1 ${
                          item.read ? 'bg-[#FFF8EC]/60 opacity-80' : 'bg-white/80'
                        } hover:bg-[#E8DDCA]/50`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold font-mono ${
                            item.type === 'URGENT' ? 'text-[#B94A55]' :
                            item.type === 'SUCCESS' ? 'text-[#5F8F68]' :
                            item.type === 'WARNING' ? 'text-[#C58A35]' : 'text-[#2B2020]'
                          }`}>
                            {item.title}
                          </span>
                          <span className="text-[10px] text-[#9A8989] font-mono">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[#756565] leading-snug">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          {onLogout && (
            <button
              type="button"
              id="btn-logout"
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-[#FFF8EC]/80 hover:bg-[#B94A55]/10 text-[#756565] hover:text-[#B94A55] border border-[#6B1E2B]/15 hover:border-[#B94A55]/30 transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

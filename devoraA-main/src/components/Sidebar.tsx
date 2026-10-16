import React from 'react';
import {
  LayoutDashboard,
  Wrench,
  Users,
  FileText,
  CalendarCheck,
  GraduationCap,
  Calendar,
  Mail,
  X
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentRole: Role;
  unreadCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  id?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentRole,
  unreadCount = 0,
  isOpenMobile = false,
  onCloseMobile,
  id = "app-sidebar"
}) => {
  interface NavItem {
    id: string;
    label: string;
    icon: React.ForwardRefExoticComponent<any>;
    roles: string[];
    badge?: string | number;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Operations Brief',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
    },
    {
      id: 'maintenance',
      label: 'Campus Facilities',
      icon: Wrench,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
    },
    {
      id: 'attendance',
      label: 'Attendance AI',
      icon: Users,
      roles: ['ADMIN', 'TEACHER']
    },
    {
      id: 'requests',
      label: 'Smart Requests',
      icon: FileText,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
    },
    {
      id: 'leave',
      label: 'Leave Approvals',
      icon: CalendarCheck,
      roles: ['ADMIN', 'TEACHER', 'STUDENT']
    },
    {
      id: 'directory',
      label: 'Roster & Staff',
      icon: GraduationCap,
      roles: ['ADMIN', 'TEACHER']
    },
    {
      id: 'timetable',
      label: 'Timetable & Notices',
      icon: Calendar,
      roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
    },
    {
      id: 'sms',
      label: 'SMTP Mail Gateway',
      icon: Mail,
      roles: ['ADMIN'],
      badge: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  const sidebarContent = (
    <aside
      id={id}
      className="w-64 bg-gradient-to-b from-[#42121C] via-[#521722] to-[#360E16] border-r border-[#6B1E2B]/40 flex flex-col justify-between p-4 shrink-0 shadow-xl text-[#FFF8EC] h-full"
    >
      <div className="space-y-6">
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between lg:hidden pb-2 border-b border-white/10">
          <span className="font-terminal font-bold text-sm tracking-wider text-[#FFF8EC]">
            NAVIGATION
          </span>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg hover:bg-white/10 text-[#E8DDCA] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#E8DDCA]/70 font-semibold px-3">
            Core Modules
          </span>

          <nav className="space-y-1 pt-1.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF8EC] text-[#6B1E2B] font-bold shadow-md shadow-black/15 scale-[1.01]'
                      : 'text-[#E8DDCA]/80 hover:text-white hover:bg-white/10 hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#6B1E2B]' : 'text-[#E8DDCA]/80'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      isActive
                        ? 'bg-[#6B1E2B] text-[#FFF8EC] border-[#6B1E2B]'
                        : 'bg-white/15 text-[#FFF8EC] border-white/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>


    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

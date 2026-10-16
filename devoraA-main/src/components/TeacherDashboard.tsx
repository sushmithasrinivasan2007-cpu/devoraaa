import React from 'react';
import {
  Users, CalendarCheck, FileText, Calendar, Sun, Sunset, Moon,
  ArrowRight, CheckCircle2, Clock, AlertTriangle, Sparkles, TrendingUp
} from 'lucide-react';
import { LeaveRequest, SmartRequest, Student, Announcement, AIDailyBrief } from '../types';

interface TeacherDashboardProps {
  brief: AIDailyBrief;
  loggedInName?: string;
  students: Student[];
  leaveRequests: LeaveRequest[];
  requests: SmartRequest[];
  announcements: Announcement[];
  onNavigateTab?: (tab: string) => void;
}

function getGreeting(): { text: string; icon: React.ElementType; color: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: Sun, color: '#C58A35' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: Sunset, color: '#B94A55' };
  return { text: 'Good Evening', icon: Moon, color: '#6B1E2B' };
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  brief,
  loggedInName,
  students,
  leaveRequests,
  requests,
  announcements,
  onNavigateTab
}) => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const displayName = loggedInName || 'Teacher';

  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING');
  const myRequests = requests.filter(r => r.requester_role === 'TEACHER');
  const lowAttendanceStudents = students.filter(s => s.attendance_rate < 80);
  const recentAnnouncements = announcements
    .filter(a => a.target_audience === 'ALL' || a.target_audience === 'TEACHERS')
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Greeting + Pillars Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#FFF8EC]/95 via-[#F8EFE0]/85 to-[#FFF8EC]/95 border border-[#6B1E2B]/15 p-6 shadow-xl shadow-[#6B1E2B]/5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#6B1E2B]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#A85C68]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Greeting Banner */}
        <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6B1E2B]/8 to-[#A85C68]/5 border border-[#6B1E2B]/15 backdrop-blur-md">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
            style={{ backgroundColor: `${greeting.color}18`, border: `1.5px solid ${greeting.color}30` }}
          >
            <GreetingIcon className="w-5 h-5" style={{ color: greeting.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#756565]">Staff Portal</p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2B2020] tracking-tight leading-tight">
              {greeting.text},{' '}
              <span style={{ color: greeting.color }}>{displayName}</span>! 👋
            </h2>
          </div>
          <div className="ml-auto shrink-0 hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#756565] bg-[#FFF8EC]/70 px-3 py-1.5 rounded-xl border border-[#6B1E2B]/12">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5F8F68] animate-pulse inline-block" />
            <span>Live Campus Feed</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6B1E2B] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#6B1E2B] uppercase">
            DEVORA INTELLIGENCE // TEACHER BRIEF
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2B2020] tracking-tight mb-1">
          Your Classroom &amp; Faculty Summary
        </h2>
        <p className="text-sm text-[#756565] font-medium">
          Real-time overview of your students, pending approvals, and campus notices.
        </p>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div
            onClick={() => onNavigateTab?.('attendance')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">My Students</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2B2020] font-mono">{students.length}</span>
              <span className="text-xs text-[#756565] font-medium">Enrolled</span>
            </div>
            <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
              <span className={`font-semibold block ${lowAttendanceStudents.length > 0 ? 'text-[#B94A55]' : 'text-[#5F8F68]'}`}>
                {lowAttendanceStudents.length > 0 ? `${lowAttendanceStudents.length} Below 80% Attendance` : 'All Above Threshold'}
              </span>
              <span className="text-[11px] text-[#9A8989] line-clamp-1 mt-0.5">Campus avg: {brief.overall_attendance}%</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab?.('leave')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">Leave Queue</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2B2020] font-mono">{pendingLeaves.length}</span>
              <span className="text-xs text-[#756565] font-medium">Pending</span>
            </div>
            <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
              <span className={`font-semibold block ${pendingLeaves.length > 0 ? 'text-[#C58A35]' : 'text-[#5F8F68]'}`}>
                {pendingLeaves.length > 0 ? 'Awaiting Your Review' : 'All Clear'}
              </span>
              <span className="text-[11px] text-[#9A8989] mt-0.5 block">
                {leaveRequests.filter(l => l.status === 'APPROVED').length} approved this cycle
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab?.('requests')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">My Requests</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2B2020] font-mono">{myRequests.length}</span>
              <span className="text-xs text-[#756565] font-medium">Submitted</span>
            </div>
            <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
              <span className="text-[#6B1E2B] font-semibold block">
                {myRequests.filter(r => r.status === 'PENDING').length} Pending Resolution
              </span>
              <span className="text-[11px] text-[#9A8989] mt-0.5 block">Click to track status</span>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab?.('timetable')}
            className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">Today's Schedule</span>
              <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2B2020] font-mono">{recentAnnouncements.length}</span>
              <span className="text-xs text-[#756565] font-medium">Notices</span>
            </div>
            <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
              <span className="text-[#5F8F68] font-semibold block line-clamp-1">
                {recentAnnouncements[0]?.title || 'No active notices'}
              </span>
              <span className="text-[11px] text-[#9A8989] mt-0.5 block">View full timetable →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Two Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Attendance Students */}
        <div className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] transition-all space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#B94A55]" />
              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">Students Needing Attention</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('attendance')}
              className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Full Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {lowAttendanceStudents.length === 0 ? (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#5F8F68]/8 border border-[#5F8F68]/20">
                <CheckCircle2 className="w-4 h-4 text-[#5F8F68] shrink-0" />
                <span className="text-xs font-mono text-[#5F8F68] font-semibold">All students are above the 80% threshold 🎉</span>
              </div>
            ) : (
              lowAttendanceStudents.slice(0, 4).map(s => (
                <div key={s.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 hover:border-[#6B1E2B]/25 transition-all flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-[#2B2020] truncate">{s.name}</h4>
                    <div className="text-[11px] font-mono text-[#756565]">
                      {s.class_grade} – Sec {s.section} · Roll #{s.roll_number}
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    s.attendance_rate < 65
                      ? 'bg-[#B94A55]/15 text-[#B94A55] border-[#B94A55]/30'
                      : 'bg-[#C58A35]/15 text-[#9E671E] border-[#C58A35]/30'
                  }`}>
                    {s.attendance_rate}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] transition-all space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C58A35]" />
              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">Pending Leave Requests</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('leave')}
              className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Review All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {pendingLeaves.length === 0 ? (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-[#5F8F68]/8 border border-[#5F8F68]/20">
                <CheckCircle2 className="w-4 h-4 text-[#5F8F68] shrink-0" />
                <span className="text-xs font-mono text-[#5F8F68] font-semibold">No pending leave requests right now.</span>
              </div>
            ) : (
              pendingLeaves.slice(0, 4).map(l => (
                <div key={l.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 hover:border-[#6B1E2B]/25 transition-all flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-[#2B2020] truncate">{l.applicant_name}</h4>
                    <div className="text-[11px] font-mono text-[#756565]">
                      {l.leave_type} · {l.start_date} → {l.end_date} ({l.days_count}d)
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-[#9E671E] bg-[#C58A35]/15 px-2.5 py-0.5 rounded-full border border-[#C58A35]/30 shrink-0">
                    PENDING
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Campus Notices for Teachers */}
      {recentAnnouncements.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#6B1E2B]/6 to-[#A85C68]/4 border border-[#6B1E2B]/15 backdrop-blur-md shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6B1E2B]" />
            <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">Latest Campus Notices</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentAnnouncements.map(a => (
              <div key={a.id} className="p-3.5 rounded-xl bg-[#FFF8EC]/80 border border-[#6B1E2B]/12 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                    a.priority === 'URGENT'
                      ? 'bg-[#B94A55]/15 text-[#B94A55] border-[#B94A55]/30'
                      : 'bg-[#6B1E2B]/10 text-[#6B1E2B] border-[#6B1E2B]/20'
                  }`}>
                    {a.priority}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#2B2020] leading-snug">{a.title}</h4>
                <p className="text-[11px] text-[#756565] line-clamp-2 leading-relaxed">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

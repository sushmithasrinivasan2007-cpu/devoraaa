import React from 'react';
import { AIDailyBrief } from '../types';
import { Users, AlertTriangle, Wrench, Calendar, Sparkles, CheckCircle2, ArrowRight, Sun, Sunset, Moon } from 'lucide-react';

interface AdminDailyBriefProps {
  brief: AIDailyBrief;
  onNavigateTab?: (tab: string) => void;
  id?: string;
  loggedInName?: string;
  currentRole?: string;
}

function getGreeting(): { text: string; icon: React.ElementType; color: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: Sun, color: '#C58A35' };
  if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: Sunset, color: '#B94A55' };
  return { text: 'Good Evening', icon: Moon, color: '#6B1E2B' };
}

export const AdminDailyBrief: React.FC<AdminDailyBriefProps> = ({
  brief,
  onNavigateTab,
  id = "admin-daily-brief",
  loggedInName,
  currentRole
}) => {
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const displayName = loggedInName || (currentRole === 'STUDENT' ? 'Student' : 'Admin');
  const roleLabel = currentRole === 'STUDENT' ? 'Student' : currentRole === 'TEACHER' ? 'Staff' : 'Admin';
  return (
    <div
      id={id}
      className="rounded-2xl bg-gradient-to-br from-[#FFF8EC]/95 via-[#F8EFE0]/85 to-[#FFF8EC]/95 border border-[#6B1E2B]/15 p-6 shadow-xl shadow-[#6B1E2B]/5 relative overflow-hidden backdrop-blur-xl"
    >
      {/* Decorative ambient subtle glow in Soft Maroon */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#6B1E2B]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-[#A85C68]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Personalized Greeting Banner */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6B1E2B]/8 to-[#A85C68]/5 border border-[#6B1E2B]/15 backdrop-blur-md">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
          style={{ backgroundColor: `${greeting.color}18`, border: `1.5px solid ${greeting.color}30` }}
        >
          <GreetingIcon className="w-5 h-5" style={{ color: greeting.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#756565]">
            {roleLabel} Portal
          </p>
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

      {/* Header Statement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#6B1E2B]/12 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6B1E2B] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#6B1E2B] uppercase">
              DEVORA AUTONOMOUS INTELLIGENCE // BRIEFING ACTIVE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#2B2020] tracking-tight">
            {currentRole === 'STUDENT'
              ? "Here's your personalized campus brief for today."
              : "Today's Executive Operations Dashboard"}
          </h2>
          <p className="text-sm text-[#756565] font-medium mt-0.5">
            Real-time campus operations brief generated from live database state.
          </p>
        </div>


      </div>

      {/* 4 Operations Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* 1. ATTENDANCE */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('attendance')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Attendance
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              {brief.overall_attendance}%
            </span>
            <span className="text-xs text-[#756565] font-medium">Overall</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#C58A35] font-semibold block">
              {brief.absent_count} students absent today
            </span>
            <span className="text-[11px] text-[#9A8989] line-clamp-1 mt-0.5">
              {brief.classes_needing_attention[0] || 'All classes within threshold'}
            </span>
          </div>
        </div>

        {/* 2. REQUESTS */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('requests')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Requests
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              {brief.pending_requests_count}
            </span>
            <span className="text-xs text-[#756565] font-medium">Pending</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#B94A55] font-semibold block">
              {brief.urgent_requests_count} High Priority
            </span>
            <span className="text-[11px] text-[#9A8989] mt-0.5 block">
              Bonafide &amp; ID card queues active
            </span>
          </div>
        </div>

        {/* 3. CAMPUS MAINTENANCE */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('maintenance')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Campus Facilities
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              {brief.open_maintenance_count}
            </span>
            <span className="text-xs text-[#756565] font-medium">Open Issues</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#C58A35] font-semibold block">
              {brief.urgent_maintenance_count} Urgent Action Items
            </span>
            <span className="text-[11px] text-[#9A8989] mt-0.5 block">
              Science Lab 2 &amp; Class 8A
            </span>
          </div>
        </div>

        {/* 4. TODAY'S AGENDA */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('timetable')}
          className="p-4 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 hover:border-[#6B1E2B]/40 hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer group backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-[#756565] uppercase">
              Today Schedule
            </span>
            <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B] group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2B2020] font-mono">
              3
            </span>
            <span className="text-xs text-[#756565] font-medium">Key Events</span>
          </div>
          <div className="mt-2 text-xs text-[#756565] border-t border-[#6B1E2B]/10 pt-2">
            <span className="text-[#5F8F68] font-semibold block">
              1 Pending Leave Approval
            </span>
            <span className="text-[11px] text-[#9A8989] mt-0.5 block">
              03:45 PM Staff Faculty Sync
            </span>
          </div>
        </div>
      </div>

      {/* AI RECOMMENDATION & EXECUTIVE SUMMARY */}
      <div className="rounded-xl bg-[#E8DDCA]/60 border border-[#6B1E2B]/15 p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md shadow-xs">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#6B1E2B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI EXECUTIVE DIRECTIVE</span>
          </div>
          <p className="text-sm text-[#2B2020] font-medium leading-relaxed">
            {brief.executive_summary}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#756565]">
            <span className="font-bold text-[#2B2020]">Action items:</span>
            {brief.action_recommendations.map((rec, idx) => (
              <span key={idx} className="bg-[#FFF8EC] px-2.5 py-0.5 rounded-lg text-[#2B2020] font-medium border border-[#6B1E2B]/15 shadow-2xs">
                {rec}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('terminal')}
          className="self-stretch md:self-auto px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md shadow-[#6B1E2B]/20 hover:-translate-y-0.5"
        >
          <span>Open Terminal Reel</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

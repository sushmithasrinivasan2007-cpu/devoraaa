import React, { useState, useEffect } from 'react';
import { TimetableSlot, Announcement, Role } from '../types';
import { api } from '../services/api';
import { Calendar, Bell, Plus, Send, Clock, User, BookOpen, Sparkles, Mail } from 'lucide-react';

interface TimetableModuleProps {
  announcements: Announcement[];
  currentRole: Role;
  onRefresh: () => void;
  id?: string;
}

export const TimetableModule: React.FC<TimetableModuleProps> = ({
  announcements,
  currentRole,
  onRefresh,
  id = "timetable-module"
}) => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [selectedClass, setSelectedClass] = useState('8');
  const [selectedSection, setSelectedSection] = useState('A');
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  // New announcement state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [audience, setAudience] = useState<'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS'>('ALL');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [emailBroadcast, setEmailBroadcast] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    api.getTimetable(selectedClass, selectedSection).then(setTimetable).catch(console.error);
  }, [selectedClass, selectedSection]);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    setIsPublishing(true);
    try {
      await api.createAnnouncement({
        title: noticeTitle,
        content: noticeContent,
        target_audience: audience,
        priority,
        email_broadcast: emailBroadcast,
        author_name: 'Dr. Alistair Vance'
      });
      setShowNoticeModal(false);
      setNoticeTitle('');
      setNoticeContent('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2020] tracking-tight flex flex-wrap items-center gap-2.5">
            <span>Timetable &amp; Campus Notices</span>
            <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
              Daily Schedule Active
            </span>
          </h1>
          <p className="text-sm text-[#756565] mt-1 font-sans">
            Weekly academic schedule synchronization and instant campus broadcast notices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNoticeModal(true)}
          className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase bg-[#6B1E2B] hover:bg-[#42121C] text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timetable Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6B1E2B]" />
              <span className="text-sm font-bold text-[#2B2020] font-mono uppercase tracking-wider">
                Monday Class Schedule
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#756565]">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-[#F3EBDD]/80 text-[#2B2020] font-medium px-2.5 py-1 rounded-lg border border-[#6B1E2B]/20 outline-none cursor-pointer focus:border-[#6B1E2B]"
              >
                <option value="8">Class 8</option>
                <option value="10">Class 10</option>
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-[#F3EBDD]/80 text-[#6B1E2B] font-bold px-2.5 py-1 rounded-lg border border-[#6B1E2B]/20 outline-none cursor-pointer focus:border-[#6B1E2B]"
              >
                <option value="A">Sec A</option>
                <option value="B">Sec B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timetable.map((slot) => (
              <div
                key={slot.id}
                className="p-4 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_16px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_25px_-6px_rgba(107,30,43,0.12)] hover:border-[#6B1E2B]/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#6B1E2B] font-bold bg-[#6B1E2B]/10 px-2 py-0.5 rounded-md border border-[#6B1E2B]/20">
                    Period {slot.period}
                  </span>
                  <span className="text-[#756565] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-[#6B1E2B]" /> {slot.time_range}
                  </span>
                </div>

                <div className="text-base font-bold text-[#2B2020]">
                  {slot.subject}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#756565] pt-2 border-t border-[#6B1E2B]/10">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#6B1E2B]" /> {slot.teacher_name}
                  </span>
                  <span className="text-[#6B1E2B] font-bold bg-[#6B1E2B]/10 px-2 py-0.5 rounded-md border border-[#6B1E2B]/20">
                    {slot.room}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Campus Notices */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF8EC]/90 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6B1E2B]" />
              <span className="text-sm font-bold text-[#2B2020] font-mono uppercase tracking-wider">
                Active Notices ({announcements.length})
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_16px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_25px_-6px_rgba(107,30,43,0.12)] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                    ann.priority === 'URGENT' ? 'bg-[#B94A55]/15 text-[#B94A55] border border-[#B94A55]/30' : 'bg-[#6B1E2B]/10 text-[#6B1E2B] border border-[#6B1E2B]/20'
                  }`}>
                    {ann.target_audience} AUDIENCE
                  </span>
                  <span className="text-[11px] font-mono text-[#9A8989]">
                    {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#2B2020]">
                  {ann.title}
                </h3>
                <p className="text-xs text-[#756565] leading-relaxed">
                  {ann.content}
                </p>

                <div className="text-[11px] font-mono text-[#756565] flex items-center justify-between pt-2 border-t border-[#6B1E2B]/10">
                  <span>Author: <strong className="text-[#2B2020]">{ann.author_name}</strong></span>
                  {(ann.email_broadcast || ann.sms_broadcast) && (
                    <span className="text-[#3D6B46] font-semibold flex items-center gap-1 bg-[#5F8F68]/10 px-2 py-0.5 rounded border border-[#5F8F68]/20">
                      <Mail className="w-3 h-3" /> Email Dispatched
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BROADCAST NOTICE MODAL */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-[#2B2020]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/20 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#6B1E2B]" />
                <h2 className="text-lg font-bold text-[#2B2020]">Broadcast Campus Notice</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNoticeModal(false)}
                className="text-[#756565] hover:text-[#2B2020] font-mono text-sm w-8 h-8 rounded-lg hover:bg-[#6B1E2B]/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Notice Headline
                </label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Schedule Change for Tomorrow"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                  >
                    <option value="ALL">All Campus</option>
                    <option value="TEACHERS">Faculty Only</option>
                    <option value="STUDENTS">Students</option>
                    <option value="PARENTS">Parents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent Broadcast</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Notice Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Write clear operational instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                />
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-[#F3EBDD]/70 rounded-xl border border-[#6B1E2B]/15">
                <input
                  type="checkbox"
                  id="chk-email-broadcast"
                  checked={emailBroadcast}
                  onChange={(e) => setEmailBroadcast(e.target.checked)}
                  className="w-4 h-4 accent-[#6B1E2B] cursor-pointer"
                />
                <label htmlFor="chk-email-broadcast" className="text-xs font-mono font-medium text-[#2B2020] cursor-pointer">
                  Dispatch instant SMTP email broadcast to target recipients
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/10">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isPublishing ? 'Publishing...' : 'Publish & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

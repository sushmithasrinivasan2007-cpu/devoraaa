import React, { useState } from 'react';
import { LeaveRequest, Role } from '../types';
import { api } from '../services/api';
import { CalendarCheck, Plus, Check, X, Clock, Mail, AlertCircle, Phone } from 'lucide-react';

interface LeaveModuleProps {
  leaves: LeaveRequest[];
  currentRole: Role;
  onRefresh: () => void;
  id?: string;
}

export const LeaveModule: React.FC<LeaveModuleProps> = ({
  leaves,
  currentRole,
  onRefresh,
  id = "leave-module"
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Medical');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [daysCount, setDaysCount] = useState(2);
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState('+15550192832');
  const [email, setEmail] = useState('s.jenkins@devora.edu');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setIsSubmitting(true);
    try {
      await api.createLeaveRequest({
        applicant_name: currentRole === 'TEACHER' ? 'Sarah Jenkins' : currentRole === 'STUDENT' ? 'Liam O\'Connor' : 'Dr. Alistair Vance',
        applicant_role: currentRole,
        applicant_phone: phone,
        applicant_email: email,
        leave_type: leaveType as any,
        start_date: startDate,
        end_date: endDate,
        days_count: Number(daysCount),
        reason
      });
      setShowApplyModal(false);
      setReason('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.updateLeaveStatus(id, status, `Reviewed and marked ${status} by Admin`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2020] tracking-tight flex flex-wrap items-center gap-2.5">
            <span>Leave Administration &amp; Approvals</span>
            <span className="text-xs font-mono font-semibold text-[#3D6B46] bg-[#5F8F68]/15 px-2.5 py-0.5 rounded-full border border-[#5F8F68]/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5F8F68] animate-pulse"></span>
              SMTP Email Automated
            </span>
          </h1>
          <p className="text-sm text-[#756565] mt-1 font-sans">
            Submit faculty &amp; student leave requests. Approvals trigger instant automated SMTP email notifications to registered contacts.
          </p>
        </div>

        <button
          type="button"
          id="btn-apply-leave"
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase bg-[#6B1E2B] hover:bg-[#42121C] text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Leave Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leaves.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] transition-all space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-md border border-[#6B1E2B]/20">
                  {item.leave_type}
                </span>
                <span className="text-xs font-mono text-[#756565] font-medium">
                  {item.days_count} Day{item.days_count > 1 ? 's' : ''}
                </span>
              </div>

              <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                item.status === 'APPROVED' ? 'bg-[#5F8F68]/15 text-[#3D6B46] border border-[#5F8F68]/30' :
                item.status === 'REJECTED' ? 'bg-[#B94A55]/15 text-[#B94A55] border border-[#B94A55]/30' :
                'bg-[#C58A35]/15 text-[#9E671E] border border-[#C58A35]/30'
              }`}>
                {item.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#2B2020]">
                {item.applicant_name} <span className="text-xs font-normal text-[#756565]">({item.applicant_role})</span>
              </h3>
              <div className="text-xs font-mono text-[#756565] flex flex-wrap items-center gap-3 mt-1">
                <span>Duration: <strong className="text-[#2B2020]">{item.start_date}</strong> &rarr; <strong className="text-[#2B2020]">{item.end_date}</strong></span>
                {item.applicant_email && (
                  <span className="text-[#6B1E2B] flex items-center gap-1 font-medium">
                    <Mail className="w-3 h-3" /> {item.applicant_email}
                  </span>
                )}
                {item.applicant_phone && (
                  <span className="text-[#756565] flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3" /> {item.applicant_phone}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-[#2B2020] leading-relaxed bg-[#F3EBDD]/60 p-3 rounded-xl border border-[#6B1E2B]/10 italic">
              &ldquo;{item.reason}&rdquo;
            </p>

            {(item.email_dispatched || item.sms_dispatched) && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#3D6B46] bg-[#5F8F68]/10 px-2.5 py-1 rounded-lg border border-[#5F8F68]/20">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>SMTP email confirmation successfully dispatched to recipient</span>
              </div>
            )}

            {/* Approval Controls */}
            {item.status === 'PENDING' && (
              <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-[#6B1E2B]/10">
                <button
                  type="button"
                  onClick={() => handleReview(item.id, 'REJECTED')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold text-[#B94A55] hover:bg-[#B94A55]/10 border border-[#B94A55]/30 transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(item.id, 'APPROVED')}
                  className="px-4 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#5F8F68] hover:bg-[#4D7A56] text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve &amp; Send Email</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FFF8EC] border border-[#6B1E2B]/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#6B1E2B]" />
                <h2 className="text-lg font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                  Apply For Leave
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg hover:bg-[#F3EBDD] text-[#756565] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                >
                  <option value="Medical">Medical Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Official">Official Duty</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Email for Notifications
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="s.jenkins@devora.edu"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+15550192832"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Reason for Absence
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you require leave and attach any emergency contact notes..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/15">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-[#756565] hover:text-[#2B2020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { MaintenanceIssue, Role, PriorityLevel } from '../types';
import { api } from '../services/api';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, Sparkles, Mail, MapPin, UserCheck, ShieldAlert } from 'lucide-react';

interface MaintenanceModuleProps {
  issues: MaintenanceIssue[];
  currentRole: Role;
  onRefresh: () => void;
  id?: string;
}

export const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({
  issues,
  currentRole,
  onRefresh,
  id = "maintenance-module"
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('Projector not working in Class 8A');
  const [reportDesc, setReportDesc] = useState('The ceiling projector in Class 8A fails to power on and HDMI signal flickers constantly during lectures.');
  const [reportLocation, setReportLocation] = useState('Class 8A (West Wing, 2nd Floor)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPreview, setAiPreview] = useState<{
    category: string;
    priority: PriorityLevel;
    assignedTo: string;
    reasoning: string;
  } | null>(null);

  // Filter tabs
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const openIssuesCount = issues.filter(i => i.status !== 'RESOLVED').length;
  const highPriorityCount = issues.filter(i => i.status !== 'RESOLVED' && (i.priority === 'HIGH' || i.priority === 'URGENT')).length;
  const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;

  const filteredIssues = issues.filter(i => {
    if (statusFilter === 'ALL') return true;
    return i.status === statusFilter;
  });

  const handleRunAIClassification = async () => {
    if (!reportTitle) return;
    try {
      const classification = await api.classifyIssue(reportTitle, reportDesc, reportLocation);
      setAiPreview(classification);
    } catch (err) {
      console.warn('AI classification error:', err);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle) return;
    setIsSubmitting(true);
    try {
      await api.createMaintenance({
        title: reportTitle,
        description: reportDesc,
        location: reportLocation,
        reported_by_name: currentRole === 'TEACHER' ? 'Sarah Jenkins' : 'Campus Admin',
        reported_by_role: currentRole
      });
      setShowReportModal(false);
      setReportTitle('');
      setReportDesc('');
      setReportLocation('');
      setAiPreview(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      await api.updateMaintenanceStatus(id, newStatus, `Status updated to ${newStatus} by ${currentRole}`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2020] tracking-tight flex items-center gap-2">
            Campus Maintenance Operations
            <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
              AI Routing Active
            </span>
          </h1>
          <p className="text-sm text-[#756565]">
            Real-time reporting, automated classification, technician dispatch, and SMTP email notification delivery.
          </p>
        </div>

        <button
          type="button"
          id="btn-report-maintenance"
          onClick={() => {
            setShowReportModal(true);
            handleRunAIClassification();
          }}
          className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#6B1E2B]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report Campus Issue</span>
        </button>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl bg-[#FFF8EC]/90 border cursor-pointer transition-all duration-150 backdrop-blur-md ${
            statusFilter === 'ALL' ? 'border-[#6B1E2B] shadow-md shadow-[#6B1E2B]/10' : 'border-[#6B1E2B]/12 hover:border-[#6B1E2B]/35'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#756565] mb-1 font-mono uppercase font-bold">
            <span>Open Issues</span>
            <Wrench className="w-4 h-4 text-[#6B1E2B]" />
          </div>
          <div className="text-2xl font-bold text-[#2B2020] font-mono">{openIssuesCount}</div>
          <div className="text-xs text-[#9A8989] mt-1 font-medium">Requiring resolution</div>
        </div>

        <div 
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-xl bg-[#FFF8EC]/90 border cursor-pointer transition-all duration-150 backdrop-blur-md ${
            statusFilter === 'PENDING' ? 'border-[#6B1E2B] shadow-md shadow-[#6B1E2B]/10' : 'border-[#6B1E2B]/12 hover:border-[#6B1E2B]/35'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#756565] mb-1 font-mono uppercase font-bold">
            <span>High Priority</span>
            <AlertTriangle className="w-4 h-4 text-[#B94A55]" />
          </div>
          <div className="text-2xl font-bold text-[#B94A55] font-mono">{highPriorityCount}</div>
          <div className="text-xs text-[#9A8989] mt-1 font-medium">Hazard or class blocking</div>
        </div>

        <div 
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-4 rounded-xl bg-[#FFF8EC]/90 border cursor-pointer transition-all duration-150 backdrop-blur-md ${
            statusFilter === 'IN_PROGRESS' ? 'border-[#6B1E2B] shadow-md shadow-[#6B1E2B]/10' : 'border-[#6B1E2B]/12 hover:border-[#6B1E2B]/35'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#756565] mb-1 font-mono uppercase font-bold">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-[#C58A35]" />
          </div>
          <div className="text-2xl font-bold text-[#C58A35] font-mono">{inProgressCount}</div>
          <div className="text-xs text-[#9A8989] mt-1 font-medium">Technician assigned on-site</div>
        </div>

        <div 
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-4 rounded-xl bg-[#FFF8EC]/90 border cursor-pointer transition-all duration-150 backdrop-blur-md ${
            statusFilter === 'RESOLVED' ? 'border-[#6B1E2B] shadow-md shadow-[#6B1E2B]/10' : 'border-[#6B1E2B]/12 hover:border-[#6B1E2B]/35'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#756565] mb-1 font-mono uppercase font-bold">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#5F8F68]" />
          </div>
          <div className="text-2xl font-bold text-[#5F8F68] font-mono">{resolvedCount}</div>
          <div className="text-xs text-[#9A8989] mt-1 font-medium">Completed &amp; verified</div>
        </div>
      </div>

      {/* Issues Table & Workflow View */}
      <div className="rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 overflow-hidden shadow-sm backdrop-blur-md">
        <div className="p-4 border-b border-[#6B1E2B]/12 flex flex-wrap items-center justify-between gap-3 bg-[#E8DDCA]/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#756565] font-bold">Filter View:</span>
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`text-xs font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer font-semibold ${
                  statusFilter === tab
                    ? 'bg-[#6B1E2B] text-[#FFF8EC] border-[#6B1E2B] shadow-xs'
                    : 'bg-[#FFF8EC]/80 text-[#756565] border-[#6B1E2B]/15 hover:text-[#2B2020]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-[#756565]">
            Showing {filteredIssues.length} of {issues.length} campus issues
          </div>
        </div>

        {/* List of Issue Cards */}
        <div className="divide-y divide-[#6B1E2B]/10">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center text-[#9A8989] font-mono text-sm">
              No maintenance issues found for this filter.
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="p-5 hover:bg-[#E8DDCA]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Priority badge */}
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${
                      issue.priority === 'URGENT' ? 'bg-[#B94A55]/15 text-[#B94A55] border-[#B94A55]/30' :
                      issue.priority === 'HIGH' ? 'bg-[#C58A35]/15 text-[#C58A35] border-[#C58A35]/30' :
                      issue.priority === 'MEDIUM' ? 'bg-[#6B1E2B]/10 text-[#6B1E2B] border-[#6B1E2B]/25' :
                      'bg-[#E8DDCA] text-[#756565] border-[#6B1E2B]/15'
                    }`}>
                      {issue.priority}
                    </span>

                    {/* Category */}
                    <span className="text-xs font-mono text-[#6B1E2B] bg-[#6B1E2B]/8 px-2 py-0.5 rounded-md border border-[#6B1E2B]/15 font-semibold">
                      {issue.category}
                    </span>

                    {/* Status badge */}
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                      issue.status === 'RESOLVED' ? 'bg-[#5F8F68]/15 text-[#5F8F68] border border-[#5F8F68]/30' :
                      issue.status === 'IN_PROGRESS' ? 'bg-[#C58A35]/15 text-[#C58A35] border border-[#C58A35]/30' :
                      'bg-[#E8DDCA]/70 text-[#756565] border border-[#6B1E2B]/15'
                    }`}>
                      {issue.status}
                    </span>

                    {(issue.email_sent || issue.sms_sent) && (
                      <span className="text-[10px] font-mono text-[#6B1E2B] font-semibold flex items-center gap-1 bg-[#FFF8EC] px-1.5 py-0.5 rounded-md border border-[#6B1E2B]/20">
                        <Mail className="w-2.5 h-2.5" /> SMTP Dispatched
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#2B2020]">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-[#756565] leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#756565] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#6B1E2B]" />
                      {issue.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#9A8989]" />
                      Assigned: <strong className="text-[#2B2020]">{issue.assigned_to_name}</strong>
                    </span>
                    <span>
                      Reported by {issue.reported_by_name} ({new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="flex sm:flex-col items-end gap-2 shrink-0">
                  {issue.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(issue.id, 'IN_PROGRESS')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#C58A35]/15 hover:bg-[#C58A35]/25 text-[#C58A35] border border-[#C58A35]/30 transition-all cursor-pointer shadow-2xs"
                    >
                      Start Work &rarr; In Progress
                    </button>
                  )}

                  {issue.status === 'IN_PROGRESS' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(issue.id, 'RESOLVED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#5F8F68]/15 hover:bg-[#5F8F68]/25 text-[#5F8F68] border border-[#5F8F68]/30 transition-all cursor-pointer shadow-2xs"
                    >
                      Mark Resolved &amp; Notify
                    </button>
                  )}

                  {issue.status === 'RESOLVED' && (
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#5F8F68]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolved {issue.resolved_at ? new Date(issue.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  )}

                  {issue.status !== 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(issue.id, 'PENDING')}
                      className="text-[11px] font-mono text-[#9A8989] hover:text-[#6B1E2B] underline cursor-pointer"
                    >
                      Revert to Pending
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#FFF8EC] border-2 border-[#6B1E2B]/20 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B]">
                  <Wrench className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#2B2020]">Report Campus Issue</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-[#756565] hover:text-[#2B2020] font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#2B2020] font-bold uppercase mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => {
                    setReportTitle(e.target.value);
                  }}
                  onBlur={handleRunAIClassification}
                  placeholder="e.g. Projector not working in Class 8A"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/20 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2B2020] font-bold uppercase mb-1">
                  Campus Location
                </label>
                <input
                  type="text"
                  required
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  placeholder="e.g. Class 8A (West Wing, 2nd Floor)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/20 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2B2020] font-bold uppercase mb-1">
                  Problem Description
                </label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  onBlur={handleRunAIClassification}
                  placeholder="Describe the issue, symptoms, and urgency..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/20 outline-none font-mono text-sm"
                />
              </div>

              {/* LIVE AI TRIAGE PREVIEW */}
              <div className="p-3.5 rounded-xl bg-[#E8DDCA]/50 border border-[#6B1E2B]/15 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#6B1E2B]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Triage &amp; Routing Engine
                  </span>
                  <button
                    type="button"
                    onClick={handleRunAIClassification}
                    className="text-[11px] underline text-[#6B1E2B] hover:text-[#42121C] cursor-pointer"
                  >
                    Re-Analyze
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                  <div className="bg-[#FFF8EC] p-2 rounded-lg border border-[#6B1E2B]/12">
                    <span className="text-[#9A8989] block text-[10px]">CATEGORY</span>
                    <span className="text-[#2B2020] font-bold">{aiPreview?.category || 'Projector'}</span>
                  </div>
                  <div className="bg-[#FFF8EC] p-2 rounded-lg border border-[#6B1E2B]/12">
                    <span className="text-[#9A8989] block text-[10px]">PRIORITY</span>
                    <span className="text-[#6B1E2B] font-bold">{aiPreview?.priority || 'MEDIUM'}</span>
                  </div>
                  <div className="bg-[#FFF8EC] p-2 rounded-lg border border-[#6B1E2B]/12">
                    <span className="text-[#9A8989] block text-[10px]">ROUTED TO</span>
                    <span className="text-[#2B2020] font-bold truncate block">{aiPreview?.assignedTo || 'Rajesh Kumar'}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#756565] font-mono">
                  {aiPreview?.reasoning || 'Automated hardware issue routing assigned to Facilities & Maintenance lead.'}
                </div>
              </div>

              <div className="text-xs font-mono text-[#756565] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#C58A35]" />
                <span>Submitting triggers in-app alert &amp; SMTP email dispatch to technician.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/15">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-[#756565] hover:text-[#2B2020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] shadow-md shadow-[#6B1E2B]/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Dispatching...' : 'Confirm & Dispatch Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

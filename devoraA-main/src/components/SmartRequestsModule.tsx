import React, { useState } from 'react';
import { SmartRequest, Role, RequestType } from '../types';
import { api } from '../services/api';
import { FileText, Plus, CheckCircle2, Sparkles, Building2, User } from 'lucide-react';

interface SmartRequestsModuleProps {
  requests: SmartRequest[];
  currentRole: Role;
  onRefresh: () => void;
  id?: string;
}

export const SmartRequestsModule: React.FC<SmartRequestsModuleProps> = ({
  requests,
  currentRole,
  onRefresh,
  id = "smart-requests-module"
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reqType, setReqType] = useState<RequestType>('Bonafide request');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  const requestTypes: RequestType[] = [
    'Leave request',
    'Bonafide request',
    'ID card request',
    'Certificate request',
    'Classroom issue',
    'Transport request',
    'IT support',
    'Maintenance issue'
  ];

  const handleAIAnalyze = async () => {
    if (!title) return;
    try {
      const res = await api.classifyIssue(title, description, location);
      setAiPreview(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);
    try {
      await api.createRequest({
        title,
        description,
        location,
        request_type: reqType,
        requester_name: currentRole === 'STUDENT' ? 'Aiden Sharma' : currentRole === 'TEACHER' ? 'Sarah Jenkins' : 'Campus Admin',
        requester_role: currentRole
      });
      setShowSubmitModal(false);
      setTitle('');
      setDescription('');
      setLocation('');
      setAiPreview(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateRequestStatus(id, newStatus, `Updated by ${currentRole}`);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (selectedCategoryFilter === 'ALL') return true;
    return r.status === selectedCategoryFilter;
  });

  return (
    <div id={id} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2020] tracking-tight flex items-center gap-2">
            Smart Operations Requests
            <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
              Autonomous Routing
            </span>
          </h1>
          <p className="text-sm text-[#756565]">
            Submit bonafide, ID replacement, certificates, and campus services with automated department triage.
          </p>
        </div>

        <button
          type="button"
          id="btn-new-request"
          onClick={() => {
            setShowSubmitModal(true);
          }}
          className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#6B1E2B]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 border-b border-[#6B1E2B]/12 pb-3">
        <span className="text-xs font-mono uppercase text-[#756565] font-bold">Status:</span>
        {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map(st => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedCategoryFilter(st)}
            className={`text-xs font-mono px-3 py-1 rounded-lg border transition-all cursor-pointer font-semibold ${
              selectedCategoryFilter === st
                ? 'bg-[#6B1E2B] text-[#FFF8EC] border-[#6B1E2B] shadow-xs'
                : 'bg-[#FFF8EC]/90 text-[#756565] border-[#6B1E2B]/15 hover:text-[#2B2020]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Request Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map(req => (
          <div
            key={req.id}
            className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/15 hover:border-[#6B1E2B]/35 hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between space-y-4 backdrop-blur-md"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
                  {req.request_type}
                </span>

                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                  req.status === 'RESOLVED' ? 'bg-[#5F8F68]/15 text-[#5F8F68] border border-[#5F8F68]/30' :
                  req.status === 'IN_PROGRESS' ? 'bg-[#C58A35]/15 text-[#C58A35] border border-[#C58A35]/30' :
                  'bg-[#E8DDCA]/70 text-[#756565] border border-[#6B1E2B]/15'
                }`}>
                  {req.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#2B2020] leading-snug">
                {req.title}
              </h3>
              <p className="text-xs text-[#756565] line-clamp-3 leading-relaxed">
                {req.description}
              </p>

              {/* AI Auto-triage badge */}
              <div className="pt-2 border-t border-[#6B1E2B]/10 space-y-1.5 text-xs font-mono text-[#756565]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#9A8989]" />
                    Dept: <strong className="text-[#2B2020]">{req.assigned_department}</strong>
                  </span>
                  <span className="text-[10px] font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2 py-0.5 rounded-md border border-[#6B1E2B]/15">
                    {req.ai_priority} PRIORITY
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-[#9A8989]" />
                    By: {req.requester_name}
                  </span>
                  <span>{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Status Control Actions */}
            <div className="pt-3 border-t border-[#6B1E2B]/10 flex items-center justify-between text-xs font-mono">
              {req.status !== 'RESOLVED' ? (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(req.id, req.status === 'PENDING' ? 'IN_PROGRESS' : 'RESOLVED')}
                  className="w-full py-2 rounded-xl font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] shadow-sm transition-all text-center cursor-pointer hover:-translate-y-0.5"
                >
                  {req.status === 'PENDING' ? 'Set to In Progress' : 'Mark Resolved'}
                </button>
              ) : (
                <div className="w-full py-1 text-center text-[#5F8F68] font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Request Completed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT REQUEST MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#FFF8EC] border-2 border-[#6B1E2B]/20 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#6B1E2B]/10 text-[#6B1E2B]">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#2B2020]">Create Smart Request</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-[#756565] hover:text-[#2B2020] font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#2B2020] font-bold uppercase mb-1">
                  Request Type
                </label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as RequestType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/20 outline-none font-mono text-sm cursor-pointer"
                >
                  {requestTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2B2020] font-bold uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleAIAnalyze}
                  placeholder="e.g. Bonafide Certificate for National Science Olympiad"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/20 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2B2020] font-bold uppercase mb-1">
                  Location / Department
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Student Admissions Wing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/20 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#2B2020] font-bold uppercase mb-1">
                  Details &amp; Reason
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleAIAnalyze}
                  placeholder="Provide any required details or urgency reasons..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EC] border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/20 outline-none font-mono text-sm"
                />
              </div>

              {/* AI Auto-Detection Preview */}
              <div className="p-3.5 rounded-xl bg-[#E8DDCA]/50 border border-[#6B1E2B]/15 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#6B1E2B]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Request Classifier</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="bg-[#FFF8EC] p-2 rounded-lg border border-[#6B1E2B]/12">
                    <span className="text-[#9A8989] block text-[10px]">CATEGORY</span>
                    <span className="text-[#2B2020] font-bold">{aiPreview?.category || 'Certificates'}</span>
                  </div>
                  <div className="bg-[#FFF8EC] p-2 rounded-lg border border-[#6B1E2B]/12">
                    <span className="text-[#9A8989] block text-[10px]">PRIORITY</span>
                    <span className="text-[#6B1E2B] font-bold">{aiPreview?.priority || 'MEDIUM'}</span>
                  </div>
                  <div className="bg-[#FFF8EC] p-2 rounded-lg border border-[#6B1E2B]/12">
                    <span className="text-[#9A8989] block text-[10px]">ROUTED TO</span>
                    <span className="text-[#2B2020] font-bold truncate block">{aiPreview?.department || 'Administration'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/15">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-[#756565] hover:text-[#2B2020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#6B1E2B] hover:bg-[#42121C] text-[#FFF8EC] shadow-md shadow-[#6B1E2B]/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Routing...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

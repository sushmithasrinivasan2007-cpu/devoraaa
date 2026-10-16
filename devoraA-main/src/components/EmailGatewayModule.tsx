import React, { useState, useEffect } from 'react';
import { EmailLog, NotificationPreferences } from '../types';
import { api } from '../services/api';
import { Mail, Send, CheckCircle2, Settings, Sparkles, RefreshCw, AlertCircle, Server } from 'lucide-react';

interface EmailGatewayModuleProps {
  logs: EmailLog[];
  preferences: NotificationPreferences;
  onRefresh: () => void;
  id?: string;
}

export const EmailGatewayModule: React.FC<EmailGatewayModuleProps> = ({
  logs,
  preferences,
  onRefresh,
  id = "email-gateway-module"
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(preferences);
  const [testEmail, setTestEmail] = useState('rajesh.k@devora.edu');
  const [testSubject, setTestSubject] = useState('DEVORA ALERT: Science Lab 2 Inspection');
  const [testMessage, setTestMessage] = useState('Science Lab 2 inspection is scheduled for 2:00 PM today. Please confirm equipment check readiness.');
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; connected: boolean; message: string } | null>(null);
  const [isCheckingSmtp, setIsCheckingSmtp] = useState(false);

  useEffect(() => {
    setPrefs(preferences);
  }, [preferences]);

  const checkSmtp = async () => {
    setIsCheckingSmtp(true);
    try {
      const status = await api.getSMTPStatus();
      setSmtpStatus(status);
    } catch (err: any) {
      setSmtpStatus({
        configured: false,
        connected: false,
        message: err.message || 'Failed to query SMTP status'
      });
    } finally {
      setIsCheckingSmtp(false);
    }
  };

  useEffect(() => {
    checkSmtp();
  }, []);

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await api.updatePreferences(updated);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testMessage) return;
    setIsSending(true);
    setSendFeedback(null);
    try {
      const res = await api.sendDirectEmail(testEmail, testMessage, testSubject, 'Admin Manual Test');
      setSendFeedback({
        type: 'success',
        message: `Email dispatched (${res.status}). Event recorded in Devora SMTP Gateway log.`
      });
      onRefresh();
      setTimeout(() => setSendFeedback(null), 5000);
    } catch (err: any) {
      setSendFeedback({
        type: 'error',
        message: `Error: ${err.message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2020] tracking-tight flex flex-wrap items-center gap-2.5">
            <span>SMTP Email Gateway &amp; Audit Logs</span>
            <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
              Nodemailer SMTP
            </span>
          </h1>
          <p className="text-sm text-[#756565] mt-1 font-sans">
            Real-time automated email dispatch monitor for campus leaves, urgent maintenance routing, and broadcast notices.
          </p>
        </div>

        <button
          onClick={checkSmtp}
          disabled={isCheckingSmtp}
          className="flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-semibold shadow-sm bg-white/70 hover:bg-white text-[#2B2020] border-[#6B1E2B]/20"
        >
          <Server className={`w-3.5 h-3.5 ${isCheckingSmtp ? 'animate-spin text-[#6B1E2B]' : 'text-[#3D6B46]'}`} />
          <span>
            {smtpStatus?.configured
              ? smtpStatus.connected ? 'SMTP: Connected' : 'SMTP: Auth Required'
              : 'SMTP: Simulation Mode'}
          </span>
          <RefreshCw className={`w-3 h-3 text-[#756565] ${isCheckingSmtp ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* SMTP Connection Info Banner */}
      {smtpStatus && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-start gap-3 ${
          smtpStatus.connected
            ? 'bg-[#5F8F68]/15 border-[#5F8F68]/30 text-[#2B2020]'
            : smtpStatus.configured
            ? 'bg-[#B08A2E]/15 border-[#B08A2E]/30 text-[#2B2020]'
            : 'bg-[#6B1E2B]/10 border-[#6B1E2B]/20 text-[#2B2020]'
        }`}>
          <div className="mt-0.5 shrink-0">
            {smtpStatus.connected ? (
              <CheckCircle2 className="w-4 h-4 text-[#3D6B46]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#6B1E2B]" />
            )}
          </div>
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>{smtpStatus.connected ? 'SMTP Server Live & Ready' : smtpStatus.configured ? 'SMTP Configured (Checking Connection)' : 'SMTP Simulation Mode Active'}</span>
            </div>
            <p className="text-[#756565] font-sans leading-relaxed">
              {smtpStatus.message} Configure <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#6B1E2B] font-mono">SMTP_HOST</code>, <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#6B1E2B] font-mono">SMTP_USER</code>, and <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#6B1E2B] font-mono">SMTP_PASS</code> in <code className="bg-white/60 px-1.5 py-0.5 rounded text-[#6B1E2B] font-mono">.env</code> for live external mail delivery.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Notification Preferences & Direct Dispatch */}
        <div className="space-y-6">
          {/* Preferences Box */}
          <div className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#6B1E2B]/10 pb-3">
              <Settings className="w-4 h-4 text-[#6B1E2B]" />
              <h2 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                Email Routing Triggers
              </h2>
            </div>

            <div className="space-y-2.5">
              {[
                { 
                  key: 'email_leave_updates', 
                  altKey: 'sms_leave_updates',
                  label: 'Leave Approvals & Rejections', 
                  desc: 'Dispatches automated email to applicant when status updates' 
                },
                { 
                  key: 'email_maintenance_urgent', 
                  altKey: 'sms_maintenance_urgent',
                  label: 'Urgent Maintenance Assignments', 
                  desc: 'Sends detailed dispatch notification to assigned technician' 
                },
                { 
                  key: 'email_emergency_alerts', 
                  altKey: 'sms_emergency_alerts',
                  label: 'Emergency Campus Broadcasts', 
                  desc: 'Dispatches high-priority bulletin emails to campus groups' 
                },
                { 
                  key: 'email_attendance_low', 
                  altKey: 'sms_attendance_low',
                  label: 'Low Attendance Parental Alerts', 
                  desc: 'Alerts guardians when student attendance falls below 80%' 
                },
                { 
                  key: 'email_request_resolved', 
                  altKey: 'sms_request_resolved',
                  label: 'Request Resolution Confirmation', 
                  desc: 'Notifies requester upon campus issue resolution' 
                }
              ].map(({ key, altKey, label, desc }) => {
                const isEnabled = prefs[key as keyof NotificationPreferences] ?? prefs[altKey as keyof NotificationPreferences] ?? true;
                return (
                  <div key={key} className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-[#F3EBDD]/60 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-[#2B2020]">{label}</div>
                      <div className="text-[11px] text-[#756565] mt-0.5">{desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePref(key as keyof NotificationPreferences)}
                      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer shrink-0 mt-0.5 p-0.5 border ${
                        isEnabled
                          ? 'bg-[#6B1E2B] border-[#6B1E2B]'
                          : 'bg-[#E8DDCA] border-[#6B1E2B]/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-transform transform ${
                          isEnabled
                            ? 'translate-x-5 bg-white shadow-sm'
                            : 'translate-x-0 bg-[#756565]'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Test Email Sender */}
          <div className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#6B1E2B]/10 pb-3">
              <Mail className="w-4 h-4 text-[#6B1E2B]" />
              <h2 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                Direct SMTP Dispatch Tester
              </h2>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="rajesh.k@devora.edu"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  required
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  placeholder="Campus Notice Subject"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Email Message Body
                </label>
                <textarea
                  rows={3}
                  required
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-xs transition-all placeholder:text-[#9A8989]"
                />
              </div>

              {sendFeedback && (
                <div className={`text-xs font-mono p-2.5 rounded-xl border ${
                  sendFeedback.type === 'success'
                    ? 'text-[#3D6B46] bg-[#5F8F68]/15 border-[#5F8F68]/30'
                    : 'text-[#6B1E2B] bg-[#6B1E2B]/10 border-[#6B1E2B]/20'
                }`}>
                  {sendFeedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Dispatching via SMTP...' : 'Dispatch Test Email'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Live Email Logs Table */}
        <div className="lg:col-span-2 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#6B1E2B]/10 flex items-center justify-between bg-[#FFF8EC]/90">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#6B1E2B]" />
              <h2 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                Live SMTP Dispatch Audit Log ({logs.length} Events)
              </h2>
            </div>
            <span className="text-xs font-mono text-[#756565] font-medium">
              Auto-refreshed
            </span>
          </div>

          <div className="divide-y divide-[#6B1E2B]/10 overflow-y-auto max-h-[580px]">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-[#756565] font-mono text-sm">
                No email dispatches recorded yet.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#F3EBDD]/50 transition-colors space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#6B1E2B]">
                        {log.recipient_email || log.recipient_phone}
                      </span>
                      {log.recipient_name && (
                        <span className="text-xs font-medium text-[#756565]">
                          ({log.recipient_name})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#756565] bg-[#F3EBDD] px-2 py-0.5 rounded border border-[#6B1E2B]/15">
                        {log.trigger_event}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        log.status === 'DELIVERED' || log.status === 'SENT'
                          ? 'text-[#3D6B46] bg-[#5F8F68]/15 border-[#5F8F68]/30'
                          : log.status === 'SIMULATED'
                          ? 'text-[#6B1E2B] bg-[#6B1E2B]/10 border-[#6B1E2B]/20'
                          : 'text-red-700 bg-red-100 border-red-300'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>

                  {log.subject && (
                    <div className="text-xs font-semibold text-[#2B2020]">
                      Subject: {log.subject}
                    </div>
                  )}

                  <p className="text-xs font-mono text-[#2B2020] bg-[#F3EBDD]/60 p-2.5 rounded-xl border border-[#6B1E2B]/10 leading-relaxed whitespace-pre-line">
                    {log.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#756565] pt-1">
                    <span>Template: <strong className="text-[#2B2020]">{log.template_id || 'DEVORA_STANDARD'}</strong></span>
                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SMSGatewayModule = EmailGatewayModule;

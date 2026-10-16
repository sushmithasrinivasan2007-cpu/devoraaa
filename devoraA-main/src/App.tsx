import React, { useState, useEffect, useCallback } from 'react';
import { Role, AIDailyBrief, MaintenanceIssue, Student, Staff, SmartRequest, LeaveRequest, NotificationItem, SMSLog, NotificationPreferences, Announcement, AttendanceRecord } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AdminDailyBrief } from './components/AdminDailyBrief';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';

import { MaintenanceModule } from './components/MaintenanceModule';
import { AttendanceModule } from './components/AttendanceModule';
import { SmartRequestsModule } from './components/SmartRequestsModule';
import { LeaveModule } from './components/LeaveModule';
import { DirectoryModule } from './components/DirectoryModule';
import { TimetableModule } from './components/TimetableModule';
import { SMSGatewayModule } from './components/SMSGatewayModule';
import { AnalyticsCharts } from './components/AnalyticsCharts';

import { LoginPage } from './components/LoginPage';
import { Sparkles, Wrench, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState<Role>('ADMIN');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInName, setLoggedInName] = useState('');

  const handleLogin = (role: Role, name: string) => {
    setCurrentRole(role);
    setLoggedInName(name);
    setIsLoggedIn(true);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInName('');
    setCurrentTab('dashboard');
  };

  // Core Data State
  const [dailyBrief, setDailyBrief] = useState<AIDailyBrief | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceIssue[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [requests, setRequests] = useState<SmartRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_leave_updates: true,
    email_maintenance_urgent: true,
    email_emergency_alerts: true,
    email_attendance_low: true,
    email_request_resolved: true,
    sms_leave_updates: true,
    sms_maintenance_urgent: true,
    sms_emergency_alerts: true,
    sms_attendance_low: true,
    sms_request_resolved: true
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Load all application data
  const loadData = useCallback(async () => {
    try {
      const [
        overviewRes,
        maintenanceRes,
        studentsRes,
        staffRes,
        requestsRes,
        leaveRes,
        notifRes,
        smsRes,
        prefRes,
        annRes
      ] = await Promise.all([
        api.getOverview(),
        api.getMaintenance(),
        api.getStudents(),
        api.getStaff(),
        api.getRequests(),
        api.getLeaveRequests(),
        api.getNotifications(),
        api.getSMSLogs(),
        api.getPreferences(),
        api.getAnnouncements()
      ]);

      setDailyBrief(overviewRes.brief);
      setMaintenance(maintenanceRes);
      setStudents(studentsRes);
      setStaff(staffRes);
      setRequests(requestsRes);
      setLeaveRequests(leaveRes);
      setNotifications(notifRes);
      setSmsLogs(smsRes);
      setPreferences(prefRes);
      setAnnouncements(annRes);
    } catch (err) {
      console.error("Error loading application state:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F3EBDD] text-[#2B2020] flex flex-col font-sans selection:bg-[#6B1E2B]/20 selection:text-[#6B1E2B] relative overflow-x-hidden">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[550px] h-[550px] bg-[#6B1E2B]/6 rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[550px] h-[550px] bg-[#A85C68]/8 rounded-full blur-[130px] -z-10" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FFF8EC]/60 rounded-full blur-[160px] -z-10" />

      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        loggedInName={loggedInName}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Role-aware Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          currentRole={currentRole}
          unreadCount={notifications.filter(n => !n.read).length}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 font-mono text-[#756565]">
              <div className="w-10 h-10 border-3 border-[#6B1E2B] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold tracking-wider uppercase text-[#6B1E2B]">
                Connecting to Devora Campus Postgres Cluster...
              </span>
            </div>
          ) : (
            <>
              {/* TAB 1: ROLE-AWARE DASHBOARD */}
              {currentTab === 'dashboard' && (
                <>
                  {/* ADMIN Dashboard */}
                  {currentRole === 'ADMIN' && dailyBrief && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      <AdminDailyBrief
                        brief={dailyBrief}
                        onNavigateTab={(tab) => setCurrentTab(tab)}
                        loggedInName={loggedInName}
                        currentRole={currentRole}
                      />

                      {/* Analytics Charts */}
                      <AnalyticsCharts
                        maintenance={maintenance}
                        students={students}
                        attendance={[]}
                      />

                      {/* Quick Glance: Open Maintenance & Pending Requests */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] transition-all space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-[#6B1E2B]" />
                              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                                Active Campus Maintenance Items
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCurrentTab('maintenance')}
                              className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>Manage All</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {maintenance.slice(0, 3).map(m => (
                              <div key={m.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 hover:border-[#6B1E2B]/25 transition-all flex items-center justify-between gap-3">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                      m.priority === 'HIGH' || m.priority === 'URGENT'
                                        ? 'bg-[#B94A55]/15 text-[#B94A55] border border-[#B94A55]/30'
                                        : 'bg-[#C58A35]/15 text-[#9E671E] border border-[#C58A35]/30'
                                    }`}>{m.priority}</span>
                                    <h4 className="text-xs font-bold text-[#2B2020] truncate">{m.title}</h4>
                                  </div>
                                  <div className="text-[11px] font-mono text-[#756565]">
                                    {m.location} · Assigned: <strong className="text-[#2B2020]">{m.assigned_to_name}</strong>
                                  </div>
                                </div>
                                <span className="text-[11px] font-mono text-[#2B2020] font-semibold bg-[#FFF8EC] px-2.5 py-0.5 rounded-md border border-[#6B1E2B]/15 shrink-0">{m.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] transition-all space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-[#6B1E2B]" />
                              <h3 className="text-sm font-mono font-bold text-[#2B2020] uppercase tracking-wider">
                                Pending Smart Requests
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCurrentTab('requests')}
                              className="text-xs font-mono font-bold text-[#6B1E2B] hover:text-[#42121C] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>View Queue</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {requests.slice(0, 3).map(r => (
                              <div key={r.id} className="p-3.5 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/10 hover:border-[#6B1E2B]/25 transition-all flex items-center justify-between gap-3">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2 py-0.5 rounded-md border border-[#6B1E2B]/20">{r.request_type}</span>
                                    <h4 className="text-xs font-bold text-[#2B2020] truncate">{r.title}</h4>
                                  </div>
                                  <div className="text-[11px] font-mono text-[#756565]">
                                    From: <strong className="text-[#2B2020]">{r.requester_name}</strong> ({r.requester_role})
                                  </div>
                                </div>
                                <span className="text-[11px] font-mono font-semibold text-[#9E671E] bg-[#C58A35]/15 px-2.5 py-0.5 rounded-full border border-[#C58A35]/30 shrink-0">{r.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TEACHER Dashboard */}
                  {currentRole === 'TEACHER' && dailyBrief && (
                    <TeacherDashboard
                      brief={dailyBrief}
                      loggedInName={loggedInName}
                      students={students}
                      leaveRequests={leaveRequests}
                      requests={requests}
                      announcements={announcements}
                      onNavigateTab={(tab) => setCurrentTab(tab)}
                    />
                  )}

                  {/* STUDENT / PARENT Dashboard */}
                  {(currentRole === 'STUDENT' || currentRole === 'PARENT') && dailyBrief && (
                    <StudentDashboard
                      brief={dailyBrief}
                      loggedInName={loggedInName}
                      students={students}
                      leaveRequests={leaveRequests}
                      requests={requests}
                      announcements={announcements}
                      onNavigateTab={(tab) => setCurrentTab(tab)}
                    />
                  )}
                </>
              )}


              {/* TAB 3: CAMPUS MAINTENANCE */}
              {currentTab === 'maintenance' && (
                <div className="animate-in fade-in duration-150">
                  <MaintenanceModule
                    issues={maintenance}
                    currentRole={currentRole}
                    onRefresh={loadData}
                  />
                </div>
              )}

              {/* TAB 4: ATTENDANCE AI */}
              {currentTab === 'attendance' && (
                <div className="animate-in fade-in duration-150">
                  <AttendanceModule
                    students={students}
                    currentRole={currentRole}
                    loggedInName={loggedInName}
                    onRefresh={loadData}
                  />
                </div>
              )}

              {/* TAB 5: SMART REQUESTS */}
              {currentTab === 'requests' && (
                <div className="animate-in fade-in duration-150">
                  <SmartRequestsModule
                    requests={requests}
                    currentRole={currentRole}
                    onRefresh={loadData}
                  />
                </div>
              )}

              {/* TAB 6: LEAVE MANAGEMENT */}
              {currentTab === 'leave' && (
                <div className="animate-in fade-in duration-150">
                  <LeaveModule
                    leaves={leaveRequests}
                    currentRole={currentRole}
                    onRefresh={loadData}
                  />
                </div>
              )}

              {/* TAB 7: ROSTER & STAFF DIRECTORY */}
              {currentTab === 'directory' && (
                <div className="animate-in fade-in duration-150">
                  <DirectoryModule
                    students={students}
                    staff={staff}
                    currentRole={currentRole}
                    onRefresh={loadData}
                  />
                </div>
              )}

              {/* TAB 8: TIMETABLE & CAMPUS NOTICES */}
              {currentTab === 'timetable' && (
                <div className="animate-in fade-in duration-150">
                  <TimetableModule
                    announcements={announcements}
                    currentRole={currentRole}
                    onRefresh={loadData}
                  />
                </div>
              )}

              {/* TAB 9: MSG91 SMS GATEWAY & PREFERENCES */}
              {currentTab === 'sms' && (
                <div className="animate-in fade-in duration-150">
                  <SMSGatewayModule
                    logs={smsLogs}
                    preferences={preferences}
                    onRefresh={loadData}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>


    </div>
  );
}

export default App;

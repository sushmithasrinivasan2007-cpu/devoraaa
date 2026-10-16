import {
  Student,
  Staff,
  AttendanceRecord,
  LeaveRequest,
  SmartRequest,
  MaintenanceIssue,
  NotificationItem,
  EmailLog,
  SMSLog,
  NotificationPreferences,
  Announcement,
  TimetableSlot,
  AIDailyBrief,
  TerminalReelConfig,
  Course,
  AcademicYear,
  Semester,
  Section,
  Subject,
  TeacherSubjectAssignment,
  AttendanceSession,
  AttendanceEntry,
  AttendanceSettings,
  StudentAttendanceOverview,
  AdminAttendanceOverview
} from '../types';

export const api = {
  // Overview / Daily Brief
  getOverview: async (): Promise<{ brief: AIDailyBrief; counts: any }> => {
    const res = await fetch('/api/overview');
    if (!res.ok) throw new Error('Failed to load overview');
    return res.json();
  },

  // Terminal Reel AI Query
  askAI: async (question: string, dials: TerminalReelConfig): Promise<{ answer: string }> => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, dials })
    });
    if (!res.ok) throw new Error('AI query failed');
    return res.json();
  },

  // AI Classification
  classifyIssue: async (title: string, description: string, location?: string) => {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, location })
    });
    if (!res.ok) throw new Error('Classification failed');
    return res.json();
  },

  // Students
  getStudents: async (): Promise<Student[]> => {
    const res = await fetch('/api/students');
    return res.json();
  },
  createStudent: async (student: Partial<Student>): Promise<Student> => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return res.json();
  },
  updateStudent: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update student');
    return res.json();
  },

  // Excel Unified Student Directory Import APIs
  getImportPreview: async (): Promise<{ validation: any; sampleStudents: Student[] }> => {
    const res = await fetch('/api/academic/import-preview');
    if (!res.ok) throw new Error('Failed to load Excel import preview');
    return res.json();
  },
  confirmExcelImport: async (): Promise<{ success: boolean; message: string; validation: any; totalStudents: number }> => {
    const res = await fetch('/api/academic/import-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to confirm Excel import');
    return res.json();
  },
  getImportSummary: async (): Promise<any> => {
    const res = await fetch('/api/academic/import-summary');
    return res.json();
  },

  // Monthly & Daily Attendance Summary
  getMonthlyAttendanceSummary: async (params?: { semester_id?: string; section_id?: string; month?: string }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.semester_id) query.set('semester_id', params.semester_id);
    if (params?.section_id) query.set('section_id', params.section_id);
    if (params?.month) query.set('month', params.month);
    const res = await fetch(`/api/attendance/monthly-summary?${query.toString()}`);
    return res.json();
  },

  // Attendance Export Download URL Builder
  getAttendanceExportUrl: (params?: { semester_id?: string; section_id?: string; date?: string; month?: string; format?: 'xlsx' | 'csv' }): string => {
    const query = new URLSearchParams();
    if (params?.semester_id) query.set('semester_id', params.semester_id);
    if (params?.section_id) query.set('section_id', params.section_id);
    if (params?.date) query.set('date', params.date);
    if (params?.month) query.set('month', params.month);
    if (params?.format) query.set('format', params.format);
    return `/api/attendance/export?${query.toString()}`;
  },

  // Staff
  getStaff: async (): Promise<Staff[]> => {
    const res = await fetch('/api/staff');
    return res.json();
  },

  // Attendance
  getAttendance: async (class_grade?: string, section?: string, date?: string) => {
    const params = new URLSearchParams();
    if (class_grade) params.set('class_grade', class_grade);
    if (section) params.set('section', section);
    if (date) params.set('date', date);
    const res = await fetch(`/api/attendance?${params.toString()}`);
    return res.json();
  },
  saveAttendance: async (data: { class_grade: string; section: string; date: string; entries: any[] }) => {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ==========================================
  // DYNAMIC ACADEMIC CONFIGURATION APIS
  // ==========================================

  // Courses
  getCourses: async (): Promise<Course[]> => {
    const res = await fetch('/api/academic/courses');
    return res.json();
  },
  createCourse: async (data: Partial<Course>): Promise<Course> => {
    const res = await fetch('/api/academic/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    const res = await fetch(`/api/academic/courses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Academic Years
  getAcademicYears: async (): Promise<AcademicYear[]> => {
    const res = await fetch('/api/academic/years');
    return res.json();
  },
  createAcademicYear: async (data: Partial<AcademicYear>): Promise<AcademicYear> => {
    const res = await fetch('/api/academic/years', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateAcademicYear: async (id: string, data: Partial<AcademicYear>): Promise<AcademicYear> => {
    const res = await fetch(`/api/academic/years/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Semesters
  getSemesters: async (courseId?: string): Promise<Semester[]> => {
    const params = new URLSearchParams();
    if (courseId) params.set('course_id', courseId);
    const res = await fetch(`/api/academic/semesters?${params.toString()}`);
    return res.json();
  },
  createSemester: async (data: Partial<Semester>): Promise<Semester> => {
    const res = await fetch('/api/academic/semesters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateSemester: async (id: string, data: Partial<Semester>): Promise<Semester> => {
    const res = await fetch(`/api/academic/semesters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Sections
  getSections: async (courseId?: string, semesterId?: string): Promise<Section[]> => {
    const params = new URLSearchParams();
    if (courseId) params.set('course_id', courseId);
    if (semesterId) params.set('semester_id', semesterId);
    const res = await fetch(`/api/academic/sections?${params.toString()}`);
    return res.json();
  },
  createSection: async (data: Partial<Section>): Promise<Section> => {
    const res = await fetch('/api/academic/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateSection: async (id: string, data: Partial<Section>): Promise<Section> => {
    const res = await fetch(`/api/academic/sections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Subjects
  getSubjects: async (courseId?: string, semesterId?: string): Promise<Subject[]> => {
    const params = new URLSearchParams();
    if (courseId) params.set('course_id', courseId);
    if (semesterId) params.set('semester_id', semesterId);
    const res = await fetch(`/api/academic/subjects?${params.toString()}`);
    return res.json();
  },
  createSubject: async (data: Partial<Subject>): Promise<Subject> => {
    const res = await fetch('/api/academic/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateSubject: async (id: string, data: Partial<Subject>): Promise<Subject> => {
    const res = await fetch(`/api/academic/subjects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Teacher Assignments
  getTeacherAssignments: async (teacherId?: string): Promise<TeacherSubjectAssignment[]> => {
    const params = new URLSearchParams();
    if (teacherId) params.set('teacher_id', teacherId);
    const res = await fetch(`/api/academic/assignments?${params.toString()}`);
    return res.json();
  },
  createTeacherAssignment: async (data: Partial<TeacherSubjectAssignment>): Promise<TeacherSubjectAssignment> => {
    const res = await fetch('/api/academic/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteTeacherAssignment: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/academic/assignments/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Enrolled Students Filtered
  getEnrolledStudents: async (params?: { course_id?: string; academic_year_id?: string; semester_id?: string; section_id?: string }): Promise<Student[]> => {
    const query = new URLSearchParams();
    if (params?.course_id) query.set('course_id', params.course_id);
    if (params?.academic_year_id) query.set('academic_year_id', params.academic_year_id);
    if (params?.semester_id) query.set('semester_id', params.semester_id);
    if (params?.section_id) query.set('section_id', params.section_id);
    const res = await fetch(`/api/academic/students?${query.toString()}`);
    return res.json();
  },

  // Attendance Settings
  getAttendanceSettings: async (): Promise<AttendanceSettings> => {
    const res = await fetch('/api/academic/settings');
    return res.json();
  },
  updateAttendanceSettings: async (data: Partial<AttendanceSettings>): Promise<AttendanceSettings> => {
    const res = await fetch('/api/academic/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Student Promotion
  promoteStudents: async (data: {
    from_year_id: string;
    from_semester_id: string;
    from_section_id: string;
    to_year_id: string;
    to_semester_id: string;
    to_section_id: string;
    student_ids: string[];
  }): Promise<{ promoted_count: number; affected_students: Student[] }> => {
    const res = await fetch('/api/academic/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ==========================================
  // DYNAMIC ATTENDANCE MANAGEMENT APIS
  // ==========================================

  getAttendanceSession: async (params: {
    course_id: string;
    academic_year_id: string;
    semester_id: string;
    section_id: string;
    subject_id: string;
    date: string;
    session_name?: string;
  }): Promise<{ session: AttendanceSession | null; entries: AttendanceEntry[] }> => {
    const query = new URLSearchParams();
    query.set('course_id', params.course_id);
    query.set('academic_year_id', params.academic_year_id);
    query.set('semester_id', params.semester_id);
    query.set('section_id', params.section_id);
    query.set('subject_id', params.subject_id);
    query.set('date', params.date);
    if (params.session_name) query.set('session_name', params.session_name);
    const res = await fetch(`/api/attendance/session?${query.toString()}`);
    return res.json();
  },

  saveAttendanceSession: async (data: {
    course_id: string;
    academic_year_id: string;
    semester_id: string;
    section_id: string;
    subject_id: string;
    date: string;
    session_name?: string;
    recorded_by: string;
    recorded_by_name: string;
    entries: Array<{ student_id: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; notes?: string }>;
    force_update?: boolean;
  }): Promise<{ success: boolean; session: AttendanceSession; is_update: boolean; error?: string }> => {
    const res = await fetch('/api/attendance/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.status === 409) {
      const errData = await res.json();
      return { success: false, ...errData };
    }
    return res.json();
  },

  getAdminAttendanceOverview: async (filters?: {
    course_id?: string;
    academic_year_id?: string;
    semester_id?: string;
    section_id?: string;
  }): Promise<AdminAttendanceOverview> => {
    const query = new URLSearchParams();
    if (filters?.course_id) query.set('course_id', filters.course_id);
    if (filters?.academic_year_id) query.set('academic_year_id', filters.academic_year_id);
    if (filters?.semester_id) query.set('semester_id', filters.semester_id);
    if (filters?.section_id) query.set('section_id', filters.section_id);
    const res = await fetch(`/api/attendance/admin-overview?${query.toString()}`);
    return res.json();
  },

  getStudentAttendance: async (studentId: string): Promise<StudentAttendanceOverview> => {
    const res = await fetch(`/api/attendance/student/${encodeURIComponent(studentId)}`);
    if (!res.ok) throw new Error('Failed to load student attendance');
    return res.json();
  },

  getTeacherClasses: async (teacherId: string): Promise<{
    teacher: any;
    assignments: TeacherSubjectAssignment[];
    recent_sessions: AttendanceSession[];
  }> => {
    const res = await fetch(`/api/attendance/teacher/${encodeURIComponent(teacherId)}`);
    return res.json();
  },

  getAIAttendanceInsights: async (): Promise<{ insights: string[] }> => {
    const res = await fetch('/api/attendance/ai-insights');
    return res.json();
  },

  // Maintenance
  getMaintenance: async (): Promise<MaintenanceIssue[]> => {
    const res = await fetch('/api/maintenance');
    return res.json();
  },
  createMaintenance: async (data: Partial<MaintenanceIssue>) => {
    const res = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateMaintenanceStatus: async (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED', notes?: string) => {
    const res = await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  },

  // Requests
  getRequests: async (): Promise<SmartRequest[]> => {
    const res = await fetch('/api/requests');
    return res.json();
  },
  createRequest: async (data: Partial<SmartRequest>) => {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateRequestStatus: async (id: string, status: string, resolution_notes?: string) => {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolution_notes })
    });
    return res.json();
  },

  // Leave
  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    const res = await fetch('/api/leave');
    return res.json();
  },
  createLeaveRequest: async (data: Partial<LeaveRequest>) => {
    const res = await fetch('/api/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateLeaveStatus: async (id: string, status: 'APPROVED' | 'REJECTED', reviewer_notes?: string) => {
    const res = await fetch(`/api/leave/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewer_notes })
    });
    return res.json();
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await fetch('/api/notifications');
    return res.json();
  },
  markNotificationRead: async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    return res.json();
  },
  markAllNotificationsRead: async () => {
    const res = await fetch('/api/notifications/read-all', { method: 'POST' });
    return res.json();
  },

  // SMTP Email Gateway & Preferences
  getEmailLogs: async (): Promise<EmailLog[]> => {
    const res = await fetch('/api/email/logs');
    return res.json();
  },
  getSMSLogs: async (): Promise<SMSLog[]> => {
    const res = await fetch('/api/email/logs');
    return res.json();
  },
  sendDirectEmail: async (recipient_email: string, message: string, subject?: string, trigger_event?: string, recipient_name?: string) => {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_email, message, subject, trigger_event, recipient_name })
    });
    return res.json();
  },
  sendDirectSMS: async (phone_number: string, message: string, trigger_event?: string) => {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_email: phone_number, message, trigger_event })
    });
    return res.json();
  },
  getSMTPStatus: async (): Promise<{ configured: boolean; connected: boolean; message: string }> => {
    const res = await fetch('/api/email/smtp-status');
    return res.json();
  },
  getPreferences: async (): Promise<NotificationPreferences> => {
    const res = await fetch('/api/preferences');
    return res.json();
  },
  updatePreferences: async (prefs: Partial<NotificationPreferences>) => {
    const res = await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    });
    return res.json();
  },

  // Announcements
  getAnnouncements: async (): Promise<Announcement[]> => {
    const res = await fetch('/api/announcements');
    return res.json();
  },
  createAnnouncement: async (data: Partial<Announcement>) => {
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Timetable
  getTimetable: async (class_grade?: string, section?: string): Promise<TimetableSlot[]> => {
    const params = new URLSearchParams();
    if (class_grade) params.set('class_grade', class_grade);
    if (section) params.set('section', section);
    const res = await fetch(`/api/timetable?${params.toString()}`);
    return res.json();
  },

  // Demo Reset
  resetDemoData: async () => {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    return res.json();
  }
};

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  avatar?: string;
  department?: string;
  class_assigned?: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  roll_number: string;
  admission_no?: string;
  register_number?: string;
  uucms_no?: string;
  gender?: 'MALE' | 'FEMALE' | string;
  dob?: string;
  source_program?: 'BCA' | 'BCA+DA' | 'BCOM' | string;
  sl_no?: number;
  phone?: string;
  class_grade: string;
  section: string;
  section_id?: string;
  course_id?: string;
  course_name?: string;
  academic_year_id?: string;
  academic_year?: string;
  semester_id?: string;
  semester_name?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email?: string;
  attendance_rate: number;
  medical_notes?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TRANSFERRED';
}

export interface ImportValidationSummary {
  filePath: string;
  totalFound: number;
  totalImported: number;
  totalSkipped: number;
  totalInvalid: number;
  duplicateUucmsCount: number;
  duplicateAdmissionCount: number;
  sheetBreakdown: {
    sheetName: string;
    count: number;
  }[];
  semesterDistribution: {
    semesterNumber: number;
    semesterName: string;
    studentCount: number;
    sections: {
      sectionName: string;
      studentCount: number;
    }[];
  }[];
}

export interface Staff {
  id: string;
  name: string;
  employee_id: string;
  role_title: 'Teacher' | 'Maintenance Lead' | 'Administration' | 'IT Support' | 'Campus Nurse';
  department: 'Academics' | 'Facilities & Maintenance' | 'Operations' | 'Information Technology' | 'Health Services';
  email: string;
  phone: string;
  status: 'ACTIVE' | 'ON_LEAVE';
  assigned_classes?: string[];
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  class_grade: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  session_id?: string;
  subject_id?: string;
  subject_name?: string;
  course_id?: string;
  academic_year_id?: string;
  semester_id?: string;
  register_number?: string;
}

// ==========================================
// DYNAMIC ACADEMIC CONFIGURATION & ATTENDANCE
// ==========================================

export interface Course {
  id: string;
  code: string; // e.g. BCA, BBA, B.Com, MCA
  name: string;
  description?: string;
  duration_years: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026-27"
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Semester {
  id: string;
  course_id: string;
  number: number;
  name: string; // e.g. "1st Semester"
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Section {
  id: string;
  course_id: string;
  semester_id: string;
  name: string; // e.g. "1st Neo", "1B1", "1B2", "1B3"
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  course_id: string;
  semester_id: string;
  credits?: number;
  hours_per_week?: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface TeacherSubjectAssignment {
  id: string;
  teacher_id: string;
  teacher_name: string;
  course_id: string;
  course_code?: string;
  academic_year_id: string;
  academic_year_name?: string;
  semester_id: string;
  semester_name?: string;
  section_id: string;
  section_name?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AttendanceSession {
  id: string;
  course_id: string;
  course_code?: string;
  academic_year_id: string;
  academic_year_name?: string;
  semester_id: string;
  semester_name?: string;
  section_id: string;
  section_name?: string;
  subject_id: string;
  subject_name?: string;
  date: string; // YYYY-MM-DD
  session_name: string;
  recorded_by: string;
  recorded_by_name: string;
  created_at: string;
  updated_at?: string;
  total_students?: number;
  present_count?: number;
  absent_count?: number;
}

export interface AttendanceEntry {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  register_number: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
}

export interface AttendanceSettings {
  threshold_percentage: number;
  allow_teacher_edit: boolean;
  send_alert_on_low_attendance: boolean;
}

export interface StudentSubjectAttendance {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  present_classes: number;
  total_classes: number;
  percentage: number;
  status: 'GOOD' | 'WARNING' | 'CRITICAL';
}

export interface StudentAttendanceOverview {
  student_id: string;
  student_name: string;
  register_number: string;
  course_name: string;
  academic_year_name: string;
  semester_name: string;
  section_name: string;
  overall_percentage: number;
  total_present: number;
  total_classes: number;
  is_below_threshold: boolean;
  threshold: number;
  subject_breakdown: StudentSubjectAttendance[];
  history: Array<{
    id: string;
    date: string;
    session_name: string;
    subject_name: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    notes?: string;
  }>;
}

export interface AdminAttendanceOverview {
  total_students: number;
  overall_attendance: number;
  students_below_threshold_count: number;
  threshold: number;
  total_sections: number;
  sessions_today: number;
  missing_sessions_today: number;
  semester_breakdown: Array<{
    semester_name: string;
    course_code: string;
    percentage: number;
    total_students: number;
    absent_today: number;
  }>;
  low_attendance_students: Array<{
    id: string;
    name: string;
    register_number: string;
    course: string;
    semester: string;
    section: string;
    attendance_percentage: number;
  }>;
  ai_insights: string[];
}

export interface LeaveRequest {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_role: Role;
  applicant_phone?: string;
  applicant_email?: string;
  leave_type: 'Medical' | 'Casual' | 'Emergency' | 'Official';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewer_notes?: string;
  email_dispatched?: boolean;
  sms_dispatched?: boolean; // legacy alias
  created_at: string;
}

export type RequestCategory = 
  | 'Equipment' 
  | 'Academic Certificate' 
  | 'Student Identity' 
  | 'Transport' 
  | 'IT & Network' 
  | 'Campus Infrastructure' 
  | 'Administrative' 
  | 'Leave & Attendance';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequestType = 
  | 'Leave request'
  | 'Bonafide request'
  | 'ID card request'
  | 'Certificate request'
  | 'Classroom issue'
  | 'Transport request'
  | 'IT support'
  | 'Maintenance issue'
  | 'General request';

export interface SmartRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_role: Role;
  request_type: RequestType;
  title: string;
  description: string;
  location?: string;
  ai_category: RequestCategory;
  ai_priority: PriorityLevel;
  assigned_department: string;
  assigned_to?: string;
  status: 'PENDING' | 'AI_TRIAGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceIssue {
  id: string;
  reported_by_name: string;
  reported_by_role: Role;
  reported_by_email?: string;
  title: string;
  description: string;
  location: string;
  category: 
    | 'Projector' 
    | 'Electrical' 
    | 'Water Leakage' 
    | 'Furniture Damage' 
    | 'Cleaning Issue' 
    | 'Internet Problem' 
    | 'Classroom Equipment' 
    | 'Other';
  priority: PriorityLevel;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  assigned_to_name: string;
  assigned_to_id: string;
  assigned_to_email?: string;
  created_at: string;
  resolved_at?: string;
  notes?: string;
  email_sent: boolean;
  sms_sent?: boolean; // legacy alias
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'URGENT';
  related_type: 'MAINTENANCE' | 'LEAVE' | 'REQUEST' | 'ATTENDANCE' | 'ANNOUNCEMENT';
  related_id?: string;
  read: boolean;
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  message: string;
  template_id?: string;
  status: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED';
  trigger_event: string;
  created_at: string;
  response_payload?: string;
  // Aliases for compatibility
  recipient_phone?: string;
}

// Type alias for backward compatibility
export type SMSLog = EmailLog;

export interface NotificationPreferences {
  email_leave_updates: boolean;
  email_maintenance_urgent: boolean;
  email_emergency_alerts: boolean;
  email_attendance_low: boolean;
  email_request_resolved: boolean;
  // Aliases for compatibility
  sms_leave_updates?: boolean;
  sms_maintenance_urgent?: boolean;
  sms_emergency_alerts?: boolean;
  sms_attendance_low?: boolean;
  sms_request_resolved?: boolean;
}

export interface TimetableSlot {
  id: string;
  class_grade: string;
  section: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  time_range: string;
  subject: string;
  teacher_name: string;
  room: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS';
  priority: 'NORMAL' | 'URGENT';
  author_name: string;
  created_at: string;
  email_broadcast: boolean;
  sms_broadcast?: boolean; // legacy alias
}

export interface TerminalReelConfig {
  style: number; // 0 (Concise) to 100 (Detailed)
  length: number; // 0 (Short) to 100 (Long)
  tone: number; // 0 (Formal) to 100 (Friendly)
  priority: number; // 0 (Normal) to 100 (Urgent)
}

export interface AIDailyBrief {
  generated_at: string;
  overall_attendance: number;
  absent_count: number;
  total_students: number;
  classes_needing_attention: string[];
  pending_requests_count: number;
  urgent_requests_count: number;
  open_maintenance_count: number;
  urgent_maintenance_count: number;
  scheduled_events_today: string[];
  executive_summary: string;
  action_recommendations: string[];
}

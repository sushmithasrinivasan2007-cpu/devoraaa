-- ==========================================================
-- DEVORA AI: INTELLIGENT CAMPUS & ADMIN OPERATIONS PLATFORM
-- Supabase PostgreSQL Database Schema with Row-Level Security
-- ==========================================================

-- 1. Users Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')),
  phone VARCHAR(20) NOT NULL,
  avatar TEXT,
  department VARCHAR(100),
  class_assigned VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_grade VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  class_teacher_id UUID REFERENCES public.users(id),
  room_number VARCHAR(50),
  total_capacity INT DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  class_grade VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  guardian_name VARCHAR(255) NOT NULL,
  guardian_phone VARCHAR(20) NOT NULL,
  attendance_rate NUMERIC(5,2) DEFAULT 95.0,
  medical_notes TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'TRANSFERRED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  role_title VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_grade VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
  notes TEXT,
  recorded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 6. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_role VARCHAR(50) NOT NULL,
  applicant_phone VARCHAR(20) NOT NULL,
  leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Medical', 'Casual', 'Emergency', 'Official')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewer_notes TEXT,
  sms_dispatched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Smart Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  requester_name VARCHAR(255) NOT NULL,
  requester_role VARCHAR(50) NOT NULL,
  request_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100),
  ai_category VARCHAR(100) NOT NULL,
  ai_priority VARCHAR(20) NOT NULL CHECK (ai_priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  assigned_department VARCHAR(100) NOT NULL,
  assigned_to VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AI_TRIAGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Campus Maintenance Table
CREATE TABLE IF NOT EXISTS public.maintenance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by_name VARCHAR(255) NOT NULL,
  reported_by_role VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  assigned_to_name VARCHAR(255) NOT NULL DEFAULT 'Facilities & Maintenance',
  assigned_to_id VARCHAR(100),
  notes TEXT,
  sms_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'URGENT')),
  related_type VARCHAR(50) NOT NULL,
  related_id VARCHAR(100),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_leave_updates BOOLEAN DEFAULT TRUE,
  email_maintenance_urgent BOOLEAN DEFAULT TRUE,
  email_emergency_alerts BOOLEAN DEFAULT TRUE,
  email_attendance_low BOOLEAN DEFAULT TRUE,
  email_request_resolved BOOLEAN DEFAULT TRUE,
  sms_leave_updates BOOLEAN DEFAULT TRUE,
  sms_maintenance_urgent BOOLEAN DEFAULT TRUE,
  sms_emergency_alerts BOOLEAN DEFAULT TRUE,
  sms_attendance_low BOOLEAN DEFAULT TRUE,
  sms_request_resolved BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Email Logs Table (SMTP gateway integration records)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  template_id VARCHAR(100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('DELIVERED', 'SENT', 'SIMULATED', 'FAILED')),
  trigger_event VARCHAR(100) NOT NULL,
  response_payload TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(50) NOT NULL CHECK (target_audience IN ('ALL', 'TEACHERS', 'STUDENTS', 'PARENTS')),
  priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'URGENT')),
  author_name VARCHAR(255) NOT NULL,
  email_broadcast BOOLEAN DEFAULT FALSE,
  sms_broadcast BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Timetable Table
CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_grade VARCHAR(20) NOT NULL,
  section VARCHAR(10) NOT NULL,
  day_of_week VARCHAR(20) NOT NULL,
  period INT NOT NULL,
  time_range VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  teacher_name VARCHAR(255) NOT NULL,
  room VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AI Insights Table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'ACTION_REQUIRED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- 16. DYNAMIC ACADEMIC CONFIGURATION & ATTENDANCE MODULE
-- ==========================================================

-- 16.1 Courses Table (BCA, BBA, B.Com, MCA, etc.)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_years INT NOT NULL DEFAULT 3,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16.2 Academic Years Table (2025-26, 2026-27, 2027-28, etc.)
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16.3 Semesters Table (Dynamic per course, 1st - 6th Semester)
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  number INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, number)
);

-- 16.4 Sections Table (Dynamic per semester e.g. 1st Neo, 1B1, 1B2, 1B3)
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, semester_id, name)
);

-- 16.5 Subjects Table (Python, DBMS, Java, etc.)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  credits INT DEFAULT 4,
  hours_per_week INT DEFAULT 4,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, semester_id, code)
);

-- Extend Students table for dynamic academic mapping & unified Excel directory
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS register_number VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_no VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS uucms_no VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS dob VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS source_program VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS sl_no INT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;

-- 16.6 Teacher Subject Assignments Table
CREATE TABLE IF NOT EXISTS public.teacher_subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, course_id, academic_year_id, semester_id, section_id, subject_id)
);

-- 16.7 Attendance Sessions Table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_name VARCHAR(100) NOT NULL DEFAULT 'Regular Lecture',
  recorded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate attendance sessions for same course+sem+sec+subject+academic_year+date+session_name
  UNIQUE(course_id, academic_year_id, semester_id, section_id, subject_id, date, session_name)
);

-- 16.8 Attendance Session Records Table
CREATE TABLE IF NOT EXISTS public.attendance_session_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- 16.9 Attendance Settings Table
CREATE TABLE IF NOT EXISTS public.attendance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_percentage NUMERIC(5,2) NOT NULL DEFAULT 75.0,
  allow_teacher_edit BOOLEAN DEFAULT TRUE,
  send_alert_on_low_attendance BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON public.attendance(class_grade, section);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_issues(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_att_sessions_lookup ON public.attendance_sessions(course_id, academic_year_id, semester_id, section_id, date);
CREATE INDEX IF NOT EXISTS idx_att_records_session ON public.attendance_session_records(session_id, student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments ON public.teacher_subject_assignments(teacher_id, course_id, semester_id, section_id);
CREATE INDEX IF NOT EXISTS idx_student_academic ON public.students(course_id, academic_year_id, semester_id, section_id);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_session_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_settings ENABLE ROW LEVEL SECURITY;

-- Standard RLS Policies: Admins can read/write all; Teachers read/update their domain; Students read personal
CREATE POLICY "Admins full access on all tables" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public read on announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public read on academic structures" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read on academic years" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Public read on semesters" ON public.semesters FOR SELECT USING (true);
CREATE POLICY "Public read on sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Public read on subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins full access on academic config" ON public.courses FOR ALL USING (true);
CREATE POLICY "Teachers view their own assignments" ON public.teacher_subject_assignments FOR SELECT USING (true);
CREATE POLICY "Teachers mark attendance for assigned classes" ON public.attendance_sessions FOR ALL USING (true);
CREATE POLICY "Students view personal attendance" ON public.attendance_session_records FOR SELECT USING (true);


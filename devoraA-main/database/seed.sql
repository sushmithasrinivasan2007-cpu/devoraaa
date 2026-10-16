-- ==========================================================
-- DEVORA AI: SEED DATA FOR DEMO & PRODUCTION BOOTSTRAP
-- ==========================================================

-- Notification Preferences
INSERT INTO public.notification_preferences (id, sms_leave_updates, sms_maintenance_urgent, sms_emergency_alerts, sms_attendance_low, sms_request_resolved)
VALUES ('00000000-0000-0000-0000-000000000001', true, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Staff
INSERT INTO public.staff (id, name, employee_id, role_title, department, email, phone, status) VALUES
('11111111-0000-0000-0000-000000000001', 'Dr. Alistair Vance', 'EMP-ADM-01', 'Administration', 'Operations', 'director@devora.edu', '+15550192831', 'ACTIVE'),
('11111111-0000-0000-0000-000000000002', 'Sarah Jenkins', 'EMP-TCH-08', 'Teacher', 'Academics', 's.jenkins@devora.edu', '+15550192832', 'ACTIVE'),
('11111111-0000-0000-0000-000000000003', 'Rajesh Kumar', 'EMP-MNT-04', 'Maintenance Lead', 'Facilities & Maintenance', 'rajesh.k@devora.edu', '+15550192833', 'ACTIVE'),
('11111111-0000-0000-0000-000000000004', 'Elena Rostova', 'EMP-ITS-02', 'IT Support', 'Information Technology', 'e.rostova@devora.edu', '+15550192834', 'ACTIVE'),
('11111111-0000-0000-0000-000000000005', 'Marcus Chen', 'EMP-TCH-10', 'Teacher', 'Academics', 'm.chen@devora.edu', '+15550192835', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Students
INSERT INTO public.students (id, name, roll_number, class_grade, section, guardian_name, guardian_phone, attendance_rate, medical_notes, status) VALUES
('22222222-0000-0000-0000-000000000001', 'Aiden Sharma', 'STU-8A-01', '8', 'A', 'Sunita Sharma', '+15550981101', 96.5, 'Mild pollen allergy', 'ACTIVE'),
('22222222-0000-0000-0000-000000000002', 'Chloe Zhao', 'STU-8A-02', '8', 'A', 'Hao Zhao', '+15550981102', 98.0, 'None', 'ACTIVE'),
('22222222-0000-0000-0000-000000000003', 'Liam O''Connor', 'STU-8A-03', '8', 'A', 'Brigid O''Connor', '+15550981103', 74.2, 'Asthma inhaler in clinic', 'ACTIVE'),
('22222222-0000-0000-0000-000000000004', 'Maya Patel', 'STU-8A-04', '8', 'A', 'Karan Patel', '+15550981104', 92.5, 'None', 'ACTIVE'),
('22222222-0000-0000-0000-000000000005', 'Daniel Kim', 'STU-8B-01', '8', 'B', 'Grace Kim', '+15550981105', 78.4, 'None', 'ACTIVE'),
('22222222-0000-0000-0000-000000000006', 'Zara Mercer', 'STU-8B-02', '8', 'B', 'David Mercer', '+15550981106', 76.0, 'Nut allergy', 'ACTIVE'),
('22222222-0000-0000-0000-000000000007', 'Lucas Silva', 'STU-10A-01', '10', 'A', 'Camila Silva', '+15550981107', 95.0, 'None', 'ACTIVE'),
('22222222-0000-0000-0000-000000000008', 'Sophia Taylor', 'STU-10A-02', '10', 'A', 'Robert Taylor', '+15550981108', 99.2, 'None', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Maintenance Issues
INSERT INTO public.maintenance_issues (id, reported_by_name, reported_by_role, title, description, location, category, priority, status, assigned_to_name, assigned_to_id, sms_sent, created_at) VALUES
('33333333-0000-0000-0000-000000000001', 'Sarah Jenkins', 'TEACHER', 'Projector not working in Class 8A', 'The ceiling projector fails to power on and HDMI signal flickers constantly during lectures.', 'Class 8A, West Wing 2nd Floor', 'Projector', 'MEDIUM', 'PENDING', 'Rajesh Kumar (Facilities)', '11111111-0000-0000-0000-000000000003', true, NOW() - INTERVAL '45 minutes'),
('33333333-0000-0000-0000-000000000002', 'Marcus Chen', 'TEACHER', 'Water pipe leakage in Science Lab 2', 'Continuous drip under main chemistry washbasin causing puddle hazard on floor.', 'Science Block B, Room 204', 'Water Leakage', 'HIGH', 'IN_PROGRESS', 'Rajesh Kumar (Facilities)', '11111111-0000-0000-0000-000000000003', true, NOW() - INTERVAL '3 hours'),
('33333333-0000-0000-0000-000000000003', 'Elena Rostova', 'TEACHER', 'Wi-Fi Access Point offline in Library 2nd Floor', 'Mesh repeater node 4 lost power, preventing students from digital reference access.', 'Central Library Mezzanine', 'Internet Problem', 'MEDIUM', 'RESOLVED', 'Elena Rostova (IT)', '11111111-0000-0000-0000-000000000004', false, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Smart Requests
INSERT INTO public.requests (id, requester_name, requester_role, request_type, title, description, location, ai_category, ai_priority, assigned_department, assigned_to, status, created_at, updated_at) VALUES
('44444444-0000-0000-0000-000000000001', 'Aiden Sharma', 'STUDENT', 'Bonafide request', 'Bonafide Certificate for National Science Olympiad registration', 'Admissions Office', 'Academic Certificate', 'MEDIUM', 'Administration', 'Student Services', 'IN_PROGRESS', NOW() - INTERVAL '2 hours', NOW()),
('44444444-0000-0000-0000-000000000002', 'Chloe Zhao', 'STUDENT', 'ID card request', 'Replacement ID Card - original lost during bus commute', 'Main Gate Office', 'Student Identity', 'LOW', 'Administration', 'Security Desk', 'RESOLVED', NOW() - INTERVAL '1 day', NOW()),
('44444444-0000-0000-0000-000000000003', 'Marcus Chen', 'TEACHER', 'Classroom issue', 'HDMI splitter replacement in Audio-Visual Room 1', 'AV Hall 1', 'Equipment', 'HIGH', 'Facilities & Maintenance', 'Rajesh Kumar', 'PENDING', NOW() - INTERVAL '5 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- Leave Requests
INSERT INTO public.leave_requests (id, applicant_name, applicant_role, applicant_phone, leave_type, start_date, end_date, days_count, reason, status, reviewer_notes, sms_dispatched, created_at) VALUES
('55555555-0000-0000-0000-000000000001', 'Sarah Jenkins', 'TEACHER', '+15550192832', 'Medical', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 2, 'Scheduled dental extraction and recovery.', 'PENDING', NULL, false, NOW() - INTERVAL '1 hour'),
('55555555-0000-0000-0000-000000000002', 'Liam O''Connor', 'STUDENT', '+15550981103', 'Medical', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 2, 'Respiratory recovery under physician advice.', 'APPROVED', 'Doctor note verified by school nurse.', true, NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Announcements
INSERT INTO public.announcements (id, title, content, target_audience, priority, author_name, sms_broadcast, created_at) VALUES
('66666666-0000-0000-0000-000000000001', 'Annual Science & Robotics Exhibition Tomorrow', 'All class representatives must submit display project specs by 11:00 AM at the Multipurpose Auditorium.', 'ALL', 'URGENT', 'Dr. Alistair Vance', true, NOW() - INTERVAL '6 hours'),
('66666666-0000-0000-0000-000000000002', 'Staff Faculty Meeting: Term 2 Operations Review', 'Mandatory 30-minute sync at 3:45 PM in the Conference Hall regarding digital attendance adoption.', 'TEACHERS', 'NORMAL', 'Principal Vance', false, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO public.notifications (id, title, message, type, related_type, related_id, read, created_at) VALUES
('77777777-0000-0000-0000-000000000001', 'New Campus Issue Reported', 'Sarah Jenkins reported: Projector not working in Class 8A (Assigned to Maintenance).', 'WARNING', 'MAINTENANCE', '33333333-0000-0000-0000-000000000001', false, NOW() - INTERVAL '45 minutes'),
('77777777-0000-0000-0000-000000000002', 'Leave Request Approved', 'Leave for Liam O''Connor (Class 8A) has been approved. Guardian SMS triggered.', 'SUCCESS', 'LEAVE', '55555555-0000-0000-0000-000000000002', false, NOW() - INTERVAL '4 hours'),
('77777777-0000-0000-0000-000000000003', 'Urgent Maintenance Alert', 'Water leakage in Science Lab 2 marked High Priority. Maintenance Lead Rajesh Kumar on site.', 'URGENT', 'MAINTENANCE', '33333333-0000-0000-0000-000000000002', true, NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- SMS Logs
INSERT INTO public.sms_logs (id, recipient_phone, recipient_name, message, template_id, status, trigger_event, created_at) VALUES
('88888888-0000-0000-0000-000000000001', '+15550192833', 'Rajesh Kumar', 'ALERT: New Medium priority issue assigned: Projector not working in Class 8A. Devora Campus Ops.', 'DEVORA_MNT_ALERT', 'DELIVERED', 'Maintenance Assignment', NOW() - INTERVAL '45 minutes'),
('88888888-0000-0000-0000-000000000002', '+15550981103', 'Brigid O''Connor', 'Devora School: Medical leave for Liam O''Connor has been APPROVED for 2 days. Get well soon.', 'DEVORA_LEAVE_APPROVED', 'DELIVERED', 'Leave Approval', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Attendance Settings
INSERT INTO public.attendance_settings (id, threshold_percentage, allow_teacher_edit, send_alert_on_low_attendance) VALUES
('99999999-0000-0000-0000-000000000001', 75.0, true, true)
ON CONFLICT (id) DO NOTHING;

-- Courses
INSERT INTO public.courses (id, code, name, description, duration_years, status) VALUES
('aaaaaaaa-0000-0000-0000-000000000001', 'BCA', 'Bachelor of Computer Applications', '3-Year undergraduate computing program', 3, 'ACTIVE'),
('aaaaaaaa-0000-0000-0000-000000000002', 'BBA', 'Bachelor of Business Administration', '3-Year management and leadership program', 3, 'ACTIVE'),
('aaaaaaaa-0000-0000-0000-000000000003', 'B.Com', 'Bachelor of Commerce', '3-Year financial and accounting studies', 3, 'ACTIVE'),
('aaaaaaaa-0000-0000-0000-000000000004', 'MCA', 'Master of Computer Applications', '2-Year postgraduate advanced computing', 2, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Academic Years
INSERT INTO public.academic_years (id, name, start_date, end_date, is_current, status) VALUES
('bbbbbbbb-0000-0000-0000-000000000001', '2025-26', '2025-06-01', '2026-05-31', false, 'ACTIVE'),
('bbbbbbbb-0000-0000-0000-000000000002', '2026-27', '2026-06-01', '2027-05-31', true, 'ACTIVE'),
('bbbbbbbb-0000-0000-0000-000000000003', '2027-28', '2027-06-01', '2028-05-31', false, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- BCA Semesters (1st to 6th)
INSERT INTO public.semesters (id, course_id, number, name, status) VALUES
('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 1, '1st Semester', 'ACTIVE'),
('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 2, '2nd Semester', 'ACTIVE'),
('cccccccc-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 3, '3rd Semester', 'ACTIVE'),
('cccccccc-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 4, '4th Semester', 'ACTIVE'),
('cccccccc-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 5, '5th Semester', 'ACTIVE'),
('cccccccc-0000-0000-0000-000000000006', 'aaaaaaaa-0000-0000-0000-000000000001', 6, '6th Semester', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- BCA Sections (Neo, B1, B2, B3 for each semester)
INSERT INTO public.sections (id, course_id, semester_id, name, status) VALUES
-- 1st Sem Sections
('dddddddd-0000-0000-0001-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1st Neo', 'ACTIVE'),
('dddddddd-0000-0000-0001-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1B1', 'ACTIVE'),
('dddddddd-0000-0000-0001-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1B2', 'ACTIVE'),
('dddddddd-0000-0000-0001-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '1B3', 'ACTIVE'),
-- 2nd Sem Sections
('dddddddd-0000-0000-0002-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2nd Neo', 'ACTIVE'),
('dddddddd-0000-0000-0002-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2B1', 'ACTIVE'),
('dddddddd-0000-0000-0002-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2B2', 'ACTIVE'),
('dddddddd-0000-0000-0002-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', '2B3', 'ACTIVE'),
-- 3rd Sem Sections
('dddddddd-0000-0000-0003-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3rd Neo', 'ACTIVE'),
('dddddddd-0000-0000-0003-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3B1', 'ACTIVE'),
('dddddddd-0000-0000-0003-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3B2', 'ACTIVE'),
('dddddddd-0000-0000-0003-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', '3B3', 'ACTIVE'),
-- 4th Sem Sections
('dddddddd-0000-0000-0004-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4th Neo', 'ACTIVE'),
('dddddddd-0000-0000-0004-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4B1', 'ACTIVE'),
('dddddddd-0000-0000-0004-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4B2', 'ACTIVE'),
('dddddddd-0000-0000-0004-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000004', '4B3', 'ACTIVE'),
-- 5th Sem Sections
('dddddddd-0000-0000-0005-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5th Neo', 'ACTIVE'),
('dddddddd-0000-0000-0005-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5B1', 'ACTIVE'),
('dddddddd-0000-0000-0005-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5B2', 'ACTIVE'),
('dddddddd-0000-0000-0005-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', '5B3', 'ACTIVE'),
-- 6th Sem Sections
('dddddddd-0000-0000-0006-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6th Neo', 'ACTIVE'),
('dddddddd-0000-0000-0006-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6B1', 'ACTIVE'),
('dddddddd-0000-0000-0006-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6B2', 'ACTIVE'),
('dddddddd-0000-0000-0006-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000006', '6B3', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Subjects
INSERT INTO public.subjects (id, code, name, course_id, semester_id, credits, hours_per_week, status) VALUES
('eeeeeeee-0000-0000-0000-000000000001', 'BCA301', 'Python Programming', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 4, 4, 'ACTIVE'),
('eeeeeeee-0000-0000-0000-000000000002', 'BCA302', 'Database Management Systems (DBMS)', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 4, 4, 'ACTIVE'),
('eeeeeeee-0000-0000-0000-000000000003', 'BCA303', 'Operating Systems', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000003', 3, 3, 'ACTIVE'),
('eeeeeeee-0000-0000-0000-000000000004', 'BCA501', 'Java Enterprise Architecture', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', 4, 4, 'ACTIVE'),
('eeeeeeee-0000-0000-0000-000000000005', 'BCA502', 'Cloud Computing & DevOps', 'aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000005', 4, 4, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Teacher Subject Assignments
INSERT INTO public.teacher_subject_assignments (id, teacher_id, course_id, academic_year_id, semester_id, section_id, subject_id, status) VALUES
('ffffffff-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000003', 'dddddddd-0000-0000-0003-000000000002', 'eeeeeeee-0000-0000-0000-000000000001', 'ACTIVE'),
('ffffffff-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000005', 'dddddddd-0000-0000-0005-000000000002', 'eeeeeeee-0000-0000-0000-000000000004', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;


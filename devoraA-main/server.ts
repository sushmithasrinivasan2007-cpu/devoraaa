import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { queryTerminalReel, classifyCampusIssue } from "./server/ai";
import { dispatchEmail, verifySMTPConnection } from "./server/services/smtp";
import XLSX from 'xlsx';
import { PriorityLevel } from "./src/types";
import { buildUnifiedStudentsDirectory } from "./server/services/studentImporter";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API ROUTES (Mounted before Vite middleware)
  // ==========================================

  // 1. Health & Status
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      platform: "Devora AI — Campus & Administration Operations Engine",
      emailGateway: "SMTP Nodemailer",
      timestamp: new Date().toISOString()
    });
  });

  // 2. Executive Daily Operations Brief & Analytics
  app.get("/api/overview", (req, res) => {
    const brief = db.getDailyBrief();
    res.json({
      brief,
      counts: {
        totalStudents: db.students.length,
        totalStaff: db.staff.length,
        openMaintenance: db.maintenance.filter(m => m.status !== 'RESOLVED').length,
        pendingRequests: db.requests.filter(r => r.status === 'PENDING').length,
        pendingLeave: db.leaveRequests.filter(l => l.status === 'PENDING').length,
        unreadNotifications: db.notifications.filter(n => !n.read).length
      }
    });
  });

  // 3. AI Terminal Reel & Assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { question, dials } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question parameter is required." });
      }

      const answer = await queryTerminalReel(question, dials || {
        style: 50,
        length: 50,
        tone: 50,
        priority: 50
      });

      res.json({ answer });
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      res.status(500).json({ error: err.message || "Failed to process question." });
    }
  });

  // 4. AI Issue & Request Auto-Classification
  app.post("/api/ai/classify", async (req, res) => {
    try {
      const { title, description, location } = req.body;
      const result = await classifyCampusIssue(title, description, location);
      res.json(result);
    } catch (err: any) {
      console.error("AI Classify Error:", err);
      res.status(500).json({ error: err.message || "Classification failed." });
    }
  });

  // 5. Students Management
  app.get("/api/students", (req, res) => {
    res.json(db.students);
  });

  app.post("/api/students", (req, res) => {
    const newStudent = {
      id: `stu-${Date.now()}`,
      ...req.body,
      attendance_rate: 100,
      status: req.body.status || 'ACTIVE'
    };
    db.students.push(newStudent);
    db.saveToFile();
    res.status(201).json(newStudent);
  });

  app.patch("/api/students/:id", (req, res) => {
    const { id } = req.params;
    const updated = db.updateStudent(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(updated);
  });

  // 6. Staff Directory
  app.get("/api/staff", (req, res) => {
    res.json(db.staff);
  });

  // 7. Attendance API & AI Attendance Analysis
  app.get("/api/attendance", (req, res) => {
    const { class_grade, section, date } = req.query;
    let records = db.attendance;
    if (class_grade) {
      records = records.filter(r => r.class_grade === String(class_grade));
    }
    if (section) {
      records = records.filter(r => r.section === String(section));
    }
    if (date) {
      records = records.filter(r => r.date === String(date));
    }

    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const rate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

    res.json({
      records,
      stats: {
        total_students: records.length,
        present_count: present,
        absent_count: absent,
        rate_percentage: rate,
        flagged_chronic: absent > 2
      }
    });
  });

  app.post("/api/attendance", (req, res) => {
    const { class_grade, section, date, entries } = req.body;
    if (Array.isArray(entries)) {
      entries.forEach((entry: any) => {
        const existingIdx = db.attendance.findIndex(
          a => a.student_id === entry.student_id && a.date === (date || new Date().toISOString().split('T')[0])
        );
        const record = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          student_id: entry.student_id,
          student_name: entry.student_name,
          class_grade,
          section,
          date: date || new Date().toISOString().split('T')[0],
          status: entry.status,
          notes: entry.notes || ''
        };
        if (existingIdx >= 0) {
          db.attendance[existingIdx] = record;
        } else {
          db.attendance.push(record);
        }
      });
    }

    res.json({ success: true, count: entries?.length || 0 });
  });

  // ==========================================
  // DYNAMIC ACADEMIC CONFIGURATION ENDPOINTS
  // ==========================================

  // Courses
  app.get("/api/academic/courses", (req, res) => {
    res.json(db.courses);
  });

  app.post("/api/academic/courses", (req, res) => {
    const { code, name, description, duration_years, status } = req.body;
    if (!code || !name) return res.status(400).json({ error: "Code and name are required." });
    const newCourse = {
      id: `crs-${Date.now()}`,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description: description || '',
      duration_years: Number(duration_years) || 3,
      status: status || 'ACTIVE',
      created_at: new Date().toISOString()
    };
    db.courses.push(newCourse);
    res.status(201).json(newCourse);
  });

  app.patch("/api/academic/courses/:id", (req, res) => {
    const { id } = req.params;
    const course = db.courses.find(c => c.id === id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    Object.assign(course, req.body);
    res.json(course);
  });

  // Academic Years
  app.get("/api/academic/years", (req, res) => {
    res.json(db.academicYears);
  });

  app.post("/api/academic/years", (req, res) => {
    const { name, start_date, end_date, is_current, status } = req.body;
    if (!name) return res.status(400).json({ error: "Academic year name is required." });
    if (is_current) {
      db.academicYears.forEach(y => { y.is_current = false; });
    }
    const newYear = {
      id: `ay-${Date.now()}`,
      name: name.trim(),
      start_date: start_date || '2026-06-01',
      end_date: end_date || '2027-05-31',
      is_current: Boolean(is_current),
      status: status || 'ACTIVE'
    };
    db.academicYears.push(newYear);
    res.status(201).json(newYear);
  });

  app.patch("/api/academic/years/:id", (req, res) => {
    const { id } = req.params;
    const year = db.academicYears.find(y => y.id === id);
    if (!year) return res.status(404).json({ error: "Academic year not found" });
    if (req.body.is_current) {
      db.academicYears.forEach(y => { y.is_current = false; });
    }
    Object.assign(year, req.body);
    res.json(year);
  });

  // Semesters
  app.get("/api/academic/semesters", (req, res) => {
    const { course_id } = req.query;
    let list = db.semesters;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    res.json(list);
  });

  app.post("/api/academic/semesters", (req, res) => {
    const { course_id, number, name, status } = req.body;
    if (!course_id || !number || !name) return res.status(400).json({ error: "course_id, number and name are required." });
    const newSem = {
      id: `sem-${Date.now()}`,
      course_id,
      number: Number(number),
      name: name.trim(),
      status: status || 'ACTIVE'
    };
    db.semesters.push(newSem);
    res.status(201).json(newSem);
  });

  app.patch("/api/academic/semesters/:id", (req, res) => {
    const { id } = req.params;
    const sem = db.semesters.find(s => s.id === id);
    if (!sem) return res.status(404).json({ error: "Semester not found" });
    Object.assign(sem, req.body);
    res.json(sem);
  });

  // Sections
  app.get("/api/academic/sections", (req, res) => {
    const { course_id, semester_id } = req.query;
    let list = db.sections;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    if (semester_id) list = list.filter(s => s.semester_id === String(semester_id));
    res.json(list);
  });

  app.post("/api/academic/sections", (req, res) => {
    const { course_id, semester_id, name, status } = req.body;
    if (!course_id || !semester_id || !name) return res.status(400).json({ error: "course_id, semester_id and name are required." });
    const newSec = {
      id: `sec-${Date.now()}`,
      course_id,
      semester_id,
      name: name.trim(),
      status: status || 'ACTIVE'
    };
    db.sections.push(newSec);
    res.status(201).json(newSec);
  });

  app.patch("/api/academic/sections/:id", (req, res) => {
    const { id } = req.params;
    const sec = db.sections.find(s => s.id === id);
    if (!sec) return res.status(404).json({ error: "Section not found" });
    Object.assign(sec, req.body);
    res.json(sec);
  });

  // Subjects
  app.get("/api/academic/subjects", (req, res) => {
    const { course_id, semester_id } = req.query;
    let list = db.subjects;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    if (semester_id) list = list.filter(s => s.semester_id === String(semester_id));
    res.json(list);
  });

  app.post("/api/academic/subjects", (req, res) => {
    const { code, name, course_id, semester_id, credits, hours_per_week, status } = req.body;
    if (!code || !name || !course_id || !semester_id) {
      return res.status(400).json({ error: "code, name, course_id, and semester_id are required." });
    }
    const newSub = {
      id: `sub-${Date.now()}`,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      course_id,
      semester_id,
      credits: Number(credits) || 4,
      hours_per_week: Number(hours_per_week) || 4,
      status: status || 'ACTIVE'
    };
    db.subjects.push(newSub);
    res.status(201).json(newSub);
  });

  app.patch("/api/academic/subjects/:id", (req, res) => {
    const { id } = req.params;
    const sub = db.subjects.find(s => s.id === id);
    if (!sub) return res.status(404).json({ error: "Subject not found" });
    Object.assign(sub, req.body);
    res.json(sub);
  });

  // Teacher Assignments
  app.get("/api/academic/assignments", (req, res) => {
    const { teacher_id } = req.query;
    let list = db.teacherAssignments;
    if (teacher_id) list = list.filter(a => a.teacher_id === String(teacher_id));
    res.json(list);
  });

  app.post("/api/academic/assignments", (req, res) => {
    const { teacher_id, course_id, academic_year_id, semester_id, section_id, subject_id, status } = req.body;
    if (!teacher_id || !course_id || !academic_year_id || !semester_id || !section_id || !subject_id) {
      return res.status(400).json({ error: "All assignment parameters are required." });
    }

    const teacher = db.staff.find(s => s.id === teacher_id);
    const course = db.courses.find(c => c.id === course_id);
    const ay = db.academicYears.find(y => y.id === academic_year_id);
    const sem = db.semesters.find(s => s.id === semester_id);
    const sec = db.sections.find(s => s.id === section_id);
    const sub = db.subjects.find(s => s.id === subject_id);

    const newAssignment = {
      id: `asn-${Date.now()}`,
      teacher_id,
      teacher_name: teacher?.name || 'Teacher',
      course_id,
      course_code: course?.code || 'BCA',
      academic_year_id,
      academic_year_name: ay?.name || '2026-27',
      semester_id,
      semester_name: sem?.name || 'Semester',
      section_id,
      section_name: sec?.name || 'Section',
      subject_id,
      subject_name: sub?.name || 'Subject',
      subject_code: sub?.code || 'SUB',
      status: status || 'ACTIVE'
    };

    db.teacherAssignments.push(newAssignment);
    res.status(201).json(newAssignment);
  });

  app.delete("/api/academic/assignments/:id", (req, res) => {
    const { id } = req.params;
    const idx = db.teacherAssignments.findIndex(a => a.id === id);
    if (idx < 0) return res.status(404).json({ error: "Assignment not found" });
    db.teacherAssignments.splice(idx, 1);
    res.json({ success: true });
  });

  // Filtered Academic Students
  app.get("/api/academic/students", (req, res) => {
    const { course_id, academic_year_id, semester_id, section_id } = req.query;
    let list = db.students;
    if (course_id) list = list.filter(s => s.course_id === String(course_id));
    if (academic_year_id) list = list.filter(s => s.academic_year_id === String(academic_year_id));
    if (semester_id) list = list.filter(s => s.semester_id === String(semester_id));
    if (section_id) {
      const sec = db.sections.find(s => s.id === String(section_id));
      if (sec) list = list.filter(s => s.section === sec.name);
    }
    res.json(list);
  });

  // Attendance Settings
  app.get("/api/academic/settings", (req, res) => {
    res.json(db.attendanceSettings);
  });

  app.patch("/api/academic/settings", (req, res) => {
    Object.assign(db.attendanceSettings, req.body);
    res.json(db.attendanceSettings);
  });

  // Student Promotion
  app.post("/api/academic/promote", (req, res) => {
    const { from_year_id, from_semester_id, from_section_id, to_year_id, to_semester_id, to_section_id, student_ids } = req.body;
    if (!to_year_id || !to_semester_id || !to_section_id || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: "Target year, semester, section, and student_ids array are required." });
    }

    const result = db.promoteStudents({
      from_year_id,
      from_semester_id,
      from_section_id,
      to_year_id,
      to_semester_id,
      to_section_id,
      student_ids
    });

    res.json(result);
  });

  // ==========================================
  // DYNAMIC ATTENDANCE MANAGEMENT ENDPOINTS
  // ==========================================

  // Check / Get existing attendance session
  app.get("/api/attendance/session", (req, res) => {
    const { course_id, academic_year_id, semester_id, section_id, subject_id, date, session_name } = req.query;
    const session = db.attendanceSessions.find(s =>
      s.course_id === String(course_id) &&
      s.academic_year_id === String(academic_year_id) &&
      s.semester_id === String(semester_id) &&
      s.section_id === String(section_id) &&
      s.subject_id === String(subject_id) &&
      s.date === String(date) &&
      (!session_name || s.session_name.toLowerCase() === String(session_name).toLowerCase())
    );

    if (!session) {
      return res.json({ session: null, entries: [] });
    }

    const entries = db.attendanceEntries.filter(e => e.session_id === session.id);
    res.json({ session, entries });
  });

  // Save / Record Attendance Session
  app.post("/api/attendance/session", (req, res) => {
    const {
      course_id,
      academic_year_id,
      semester_id,
      section_id,
      subject_id,
      date,
      session_name,
      recorded_by,
      recorded_by_name,
      entries,
      force_update
    } = req.body;

    if (!course_id || !academic_year_id || !semester_id || !section_id || !subject_id || !date || !Array.isArray(entries)) {
      return res.status(400).json({ error: "Missing required attendance session fields." });
    }

    const result = db.saveAttendanceSession({
      course_id,
      academic_year_id,
      semester_id,
      section_id,
      subject_id,
      date,
      session_name: session_name || 'Regular Lecture',
      recorded_by: recorded_by || 'usr-tch-08',
      recorded_by_name: recorded_by_name || 'Teacher',
      entries,
      force_update: Boolean(force_update)
    });

    if (!result.success) {
      return res.status(409).json(result); // Duplicate session alert
    }

    res.status(result.is_update ? 200 : 201).json(result);
  });

  // Admin Attendance Dashboard Overview
  app.get("/api/attendance/admin-overview", (req, res) => {
    const { course_id, academic_year_id, semester_id, section_id } = req.query;
    const overview = db.getAdminAttendanceOverview({
      course_id: course_id ? String(course_id) : undefined,
      academic_year_id: academic_year_id ? String(academic_year_id) : undefined,
      semester_id: semester_id ? String(semester_id) : undefined,
      section_id: section_id ? String(section_id) : undefined
    });
    res.json(overview);
  });

  // Student Personal Attendance Overview
  app.get("/api/attendance/student/:studentId", (req, res) => {
    const { studentId } = req.params;
    const summary = db.getStudentAttendanceSummary(studentId);
    if (!summary) {
      return res.status(404).json({ error: "Student attendance records not found." });
    }
    res.json(summary);
  });

  // Teacher Assigned Classes
  app.get("/api/attendance/teacher/:teacherId", (req, res) => {
    const { teacherId } = req.params;
    const teacher = db.staff.find(s => s.id === teacherId || s.name.toLowerCase().includes(teacherId.toLowerCase()));
    const actualTeacherId = teacher ? teacher.id : teacherId;

    const assignments = db.teacherAssignments.filter(a => a.teacher_id === actualTeacherId && a.status === 'ACTIVE');
    const recentSessions = db.attendanceSessions.filter(s => s.recorded_by === actualTeacherId).slice(0, 10);

    res.json({
      teacher: teacher || { id: teacherId, name: 'Faculty Member' },
      assignments,
      recent_sessions: recentSessions
    });
  });

  // AI Attendance Insights
  app.get("/api/attendance/ai-insights", (req, res) => {
    const insights = db.getAIAttendanceInsights();
    res.json({ insights });
  });

  // Monthly & Daily Attendance Summary Report
  app.get("/api/attendance/monthly-summary", (req, res) => {
    const { semester_id, section_id, month } = req.query;
    const summary = db.getMonthlyAttendanceSummary({
      semester_id: semester_id ? String(semester_id) : undefined,
      section_id: section_id ? String(section_id) : undefined,
      month: month ? String(month) : undefined
    });
    res.json(summary);
  });

  // Export Attendance Report to Excel or CSV
  app.get("/api/attendance/export", (req, res) => {
    try {
      const { semester_id, section_id, date, month, format } = req.query;
      const rows = db.getAttendanceExportRows({
        semester_id: semester_id ? String(semester_id) : undefined,
        section_id: section_id ? String(section_id) : undefined,
        date: date ? String(date) : undefined,
        month: month ? String(month) : undefined
      });

      const exportFormat = String(format || 'xlsx').toLowerCase();
      const filenameBase = `Devora_Attendance_Report_${date || month || new Date().toISOString().split('T')[0]}`;

      const wb = XLSX.utils.book_new();
      const exportData = rows.length > 0 ? rows : [{ Status: 'No attendance records matching the selected filter criteria.' }];
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");

      if (exportFormat === 'csv') {
        const csvContent = XLSX.utils.sheet_to_csv(ws);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
        return res.send(csvContent);
      } else {
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
        return res.send(buf);
      }
    } catch (err: any) {
      console.error('Export attendance error:', err);
      res.status(500).json({ error: err.message || 'Failed to export attendance report.' });
    }
  });

  // Excel Students Import Preview (dry-run validation without mutating)
  app.get("/api/academic/import-preview", (req, res) => {
    try {
      const { validation, students } = buildUnifiedStudentsDirectory();
      res.json({
        validation,
        sampleStudents: students.slice(0, 15)
      });
    } catch (err: any) {
      console.error('Import preview error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate Excel import preview.' });
    }
  });

  // Excel Students Import Confirmation (writes to database and saves state)
  app.post("/api/academic/import-confirm", (req, res) => {
    try {
      const validation = db.reimportStudentsFromExcel();
      res.json({
        success: true,
        message: `Successfully integrated ${db.students.length} students into BCA Department across 6 semesters.`,
        validation,
        totalStudents: db.students.length
      });
    } catch (err: any) {
      console.error('Import confirm error:', err);
      res.status(500).json({ error: err.message || 'Failed to complete student import from Excel.' });
    }
  });

  // Latest Excel Import Summary
  app.get("/api/academic/import-summary", (req, res) => {
    res.json(db.importValidationSummary || { status: 'NO_IMPORT_RECORDED' });
  });

  // 8. Campus Maintenance Module
  app.get("/api/maintenance", (req, res) => {
    res.json(db.maintenance);
  });

  app.post("/api/maintenance", async (req, res) => {
    const { title, description, location, reported_by_name, reported_by_role, reported_by_email } = req.body;
    
    // AI Classification
    const aiClassification = await classifyCampusIssue(title, description, location);
    const assignedStaff = db.staff.find(s => s.name.toLowerCase().includes(aiClassification.assignedTo.split(' ')[0].toLowerCase())) || db.staff[2];

    const newIssue = {
      id: `mnt-${Date.now()}`,
      reported_by_name: reported_by_name || 'Sarah Jenkins',
      reported_by_role: reported_by_role || 'TEACHER',
      reported_by_email: reported_by_email || 's.jenkins@devora.edu',
      title,
      description,
      location: location || 'Campus Main Wing',
      category: (aiClassification.category as any) || 'Classroom Equipment',
      priority: aiClassification.priority,
      status: 'PENDING' as const,
      assigned_to_name: aiClassification.assignedTo,
      assigned_to_id: assignedStaff?.id || 'usr-mnt-03',
      assigned_to_email: assignedStaff?.email || 'rajesh.k@devora.edu',
      created_at: new Date().toISOString(),
      email_sent: false,
      sms_sent: false
    };

    // In-app Notification
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Campus Issue Reported',
      message: `${newIssue.reported_by_name} reported: ${newIssue.title} (Assigned to ${newIssue.assigned_to_name}).`,
      type: newIssue.priority === 'HIGH' || newIssue.priority === 'URGENT' ? 'URGENT' : 'WARNING',
      related_type: 'MAINTENANCE',
      related_id: newIssue.id,
      read: false,
      created_at: new Date().toISOString()
    });

    // SMTP Email Trigger if preference enabled
    const emailEnabled = db.preferences.email_maintenance_urgent ?? db.preferences.sms_maintenance_urgent ?? true;
    if (emailEnabled) {
      const emailResult = await dispatchEmail(
        newIssue.assigned_to_email,
        `DEVORA ALERT: New ${newIssue.priority} Priority Issue Assigned: ${newIssue.title}`,
        `A new maintenance issue has been assigned to you:\n\nTitle: ${newIssue.title}\nPriority: ${newIssue.priority}\nLocation: ${newIssue.location}\nDescription: ${newIssue.description}\nReported By: ${newIssue.reported_by_name}`,
        {
          recipientName: newIssue.assigned_to_name,
          triggerEvent: 'Maintenance Assignment'
        }
      );
      newIssue.email_sent = true;
      newIssue.sms_sent = true;

      db.emailLogs.unshift({
        id: `email-${Date.now()}`,
        recipient_email: newIssue.assigned_to_email,
        recipient_name: newIssue.assigned_to_name,
        subject: `DEVORA ALERT: New ${newIssue.priority} Priority Issue: ${newIssue.title}`,
        message: `ALERT: New ${newIssue.priority} issue assigned: ${newIssue.title} (${newIssue.location}).`,
        template_id: 'DEVORA_MNT_ALERT',
        status: emailResult.status,
        trigger_event: 'Maintenance Assignment',
        created_at: new Date().toISOString(),
        recipient_phone: assignedStaff?.phone
      });
    }

    db.maintenance.unshift(newIssue);
    res.status(201).json({ issue: newIssue, aiClassification });
  });

  app.patch("/api/maintenance/:id", async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const issue = db.maintenance.find(m => m.id === id);

    if (!issue) {
      return res.status(404).json({ error: "Maintenance issue not found" });
    }

    issue.status = status || issue.status;
    if (notes) issue.notes = notes;
    if (status === 'RESOLVED') {
      issue.resolved_at = new Date().toISOString();

      // Trigger notification & email when resolved
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Issue Resolved',
        message: `Maintenance item "${issue.title}" has been marked RESOLVED by Facilities.`,
        type: 'SUCCESS',
        related_type: 'MAINTENANCE',
        related_id: issue.id,
        read: false,
        created_at: new Date().toISOString()
      });

      const emailEnabled = db.preferences.email_request_resolved ?? db.preferences.sms_request_resolved ?? true;
      if (emailEnabled) {
        const reporterEmail = issue.reported_by_email || 's.jenkins@devora.edu';
        const emailRes = await dispatchEmail(
          reporterEmail,
          `DEVORA RESOLUTION: "${issue.title}" has been resolved`,
          `The campus maintenance request "${issue.title}" reported by you at ${issue.location} has been marked as RESOLVED by Campus Facilities.\n\nNotes: ${notes || 'Issue addressed.'}`,
          {
            recipientName: issue.reported_by_name,
            triggerEvent: 'Maintenance Resolved'
          }
        );

        db.emailLogs.unshift({
          id: `email-${Date.now()}`,
          recipient_email: reporterEmail,
          recipient_name: issue.reported_by_name,
          subject: `DEVORA RESOLUTION: "${issue.title}" has been resolved`,
          message: `DEVORA UPDATE: "${issue.title}" has been RESOLVED by Campus Maintenance.`,
          template_id: 'DEVORA_RESOLVED',
          status: emailRes.status,
          trigger_event: 'Maintenance Resolved',
          created_at: new Date().toISOString(),
          recipient_phone: '+15550192832'
        });
      }
    }

    res.json(issue);
  });

  // 9. Smart Requests Module
  app.get("/api/requests", (req, res) => {
    res.json(db.requests);
  });

  app.post("/api/requests", async (req, res) => {
    const { title, description, request_type, requester_name, requester_role } = req.body;
    const classification = await classifyCampusIssue(title, description);

    const newReq = {
      id: `req-${Date.now()}`,
      requester_id: 'usr-gen',
      requester_name: requester_name || 'Aiden Sharma',
      requester_role: requester_role || 'STUDENT',
      request_type: request_type || 'General request',
      title,
      description,
      location: req.body.location || 'Administration',
      ai_category: (classification.category as any) || 'Administrative',
      ai_priority: classification.priority,
      assigned_department: classification.department,
      assigned_to: classification.assignedTo,
      status: 'IN_PROGRESS' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.requests.unshift(newReq);

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Service Request',
      message: `${newReq.requester_name} submitted: "${newReq.title}". Triaged to ${newReq.assigned_department}.`,
      type: 'INFO',
      related_type: 'REQUEST',
      related_id: newReq.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json(newReq);
  });

  app.patch("/api/requests/:id", (req, res) => {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;
    const reqItem = db.requests.find(r => r.id === id);
    if (!reqItem) return res.status(404).json({ error: "Request not found" });

    if (status) reqItem.status = status;
    if (resolution_notes) reqItem.resolution_notes = resolution_notes;
    reqItem.updated_at = new Date().toISOString();

    res.json(reqItem);
  });

  // 10. Leave Management
  app.get("/api/leave", (req, res) => {
    res.json(db.leaveRequests);
  });

  app.post("/api/leave", (req, res) => {
    const { applicant_name, applicant_role, applicant_phone, applicant_email, leave_type, start_date, end_date, days_count, reason } = req.body;
    const newLeave = {
      id: `lev-${Date.now()}`,
      applicant_id: 'usr-app',
      applicant_name: applicant_name || 'Sarah Jenkins',
      applicant_role: applicant_role || 'TEACHER',
      applicant_phone: applicant_phone || '+15550192832',
      applicant_email: applicant_email || (applicant_name === 'Sarah Jenkins' ? 's.jenkins@devora.edu' : 'applicant@devora.edu'),
      leave_type: leave_type || 'Medical',
      start_date,
      end_date,
      days_count: Number(days_count) || 1,
      reason,
      status: 'PENDING' as const,
      email_dispatched: false,
      sms_dispatched: false,
      created_at: new Date().toISOString()
    };
    db.leaveRequests.unshift(newLeave);

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Leave Application Submitted',
      message: `${newLeave.applicant_name} applied for ${newLeave.days_count}-day ${newLeave.leave_type} leave.`,
      type: 'INFO',
      related_type: 'LEAVE',
      related_id: newLeave.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json(newLeave);
  });

  app.patch("/api/leave/:id", async (req, res) => {
    const { id } = req.params;
    const { status, reviewer_notes } = req.body;
    const leave = db.leaveRequests.find(l => l.id === id);
    if (!leave) return res.status(404).json({ error: "Leave request not found" });

    leave.status = status;
    if (reviewer_notes) leave.reviewer_notes = reviewer_notes;

    // Trigger SMTP Email on Leave Approval or Rejection
    const emailEnabled = db.preferences.email_leave_updates ?? db.preferences.sms_leave_updates ?? true;
    const targetEmail = leave.applicant_email || (leave.applicant_name === 'Sarah Jenkins' ? 's.jenkins@devora.edu' : 'applicant@devora.edu');

    if (emailEnabled && targetEmail) {
      const msg = status === 'APPROVED'
        ? `Your ${leave.leave_type} leave request (${leave.start_date} to ${leave.end_date}) for ${leave.days_count} day(s) has been APPROVED by the Administration.`
        : `Your ${leave.leave_type} leave request was not approved. Reviewer Notes: ${reviewer_notes || 'Please contact Administration.'}`;

      const emailRes = await dispatchEmail(
        targetEmail,
        `Devora School: Leave Request ${status} — ${leave.applicant_name}`,
        msg,
        {
          recipientName: leave.applicant_name,
          triggerEvent: `Leave ${status}`
        }
      );
      leave.email_dispatched = true;
      leave.sms_dispatched = true;

      db.emailLogs.unshift({
        id: `email-${Date.now()}`,
        recipient_email: targetEmail,
        recipient_name: leave.applicant_name,
        subject: `Devora School: Leave Request ${status}`,
        message: msg,
        template_id: status === 'APPROVED' ? 'DEVORA_LEAVE_APPROVED' : 'DEVORA_LEAVE_REJECTED',
        status: emailRes.status,
        trigger_event: `Leave ${status}`,
        created_at: new Date().toISOString(),
        recipient_phone: leave.applicant_phone
      });
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Leave ${status}`,
      message: `Leave request for ${leave.applicant_name} was marked ${status}.`,
      type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      related_type: 'LEAVE',
      related_id: leave.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.json(leave);
  });

  // 11. Notifications
  app.get("/api/notifications", (req, res) => {
    res.json(db.notifications);
  });

  app.patch("/api/notifications/:id/read", (req, res) => {
    const notif = db.notifications.find(n => n.id === req.params.id);
    if (notif) notif.read = true;
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", (req, res) => {
    db.notifications.forEach(n => n.read = true);
    res.json({ success: true });
  });

  // 12. Email / SMTP Logs & Direct Test Dispatch
  app.get("/api/email/logs", (req, res) => {
    res.json(db.emailLogs);
  });

  // Backwards compatibility endpoint
  app.get("/api/sms/logs", (req, res) => {
    res.json(db.emailLogs);
  });

  app.get("/api/email/smtp-status", async (req, res) => {
    const status = await verifySMTPConnection();
    res.json(status);
  });

  app.post("/api/email/send", async (req, res) => {
    const { recipient_email, recipient_name, subject, message, trigger_event } = req.body;
    const email = recipient_email || req.body.phone_number || req.body.to;
    if (!email || !message) {
      return res.status(400).json({ error: "recipient_email and message required" });
    }

    const finalSubject = subject || `Devora Campus Notification: ${trigger_event || 'General'}`;
    const result = await dispatchEmail(
      email,
      finalSubject,
      message,
      {
        recipientName: recipient_name || 'Campus Member',
        triggerEvent: trigger_event || 'Manual Admin Email'
      }
    );

    db.emailLogs.unshift({
      id: `email-${Date.now()}`,
      recipient_email: email,
      recipient_name: recipient_name || 'Campus Member',
      subject: finalSubject,
      message,
      template_id: 'DEVORA_MANUAL',
      status: result.status,
      trigger_event: trigger_event || 'Manual Admin Email',
      created_at: new Date().toISOString(),
      recipient_phone: req.body.phone_number
    });

    res.json(result);
  });

  // Backwards compatibility endpoint for direct SMS sends -> now handled by email gateway
  app.post("/api/sms/send", async (req, res) => {
    const { phone_number, message, trigger_event, recipient_name } = req.body;
    const targetEmail = req.body.recipient_email || 'admin@devora-campus.edu';
    
    const result = await dispatchEmail(
      targetEmail,
      `DEVORA ALERT: ${trigger_event || 'Admin Notification'}`,
      message,
      {
        recipientName: recipient_name || 'Recipient',
        triggerEvent: trigger_event || 'Manual Admin Trigger'
      }
    );

    db.emailLogs.unshift({
      id: `email-${Date.now()}`,
      recipient_email: targetEmail,
      recipient_name: recipient_name || 'Recipient',
      subject: `DEVORA ALERT: ${trigger_event || 'Admin Notification'}`,
      message,
      template_id: 'DEVORA_MANUAL',
      status: result.status,
      trigger_event: trigger_event || 'Manual Admin Trigger',
      created_at: new Date().toISOString(),
      recipient_phone: phone_number
    });

    res.json(result);
  });

  // 13. Notification Preferences
  app.get("/api/preferences", (req, res) => {
    res.json(db.preferences);
  });

  app.patch("/api/preferences", (req, res) => {
    db.preferences = { ...db.preferences, ...req.body };
    res.json(db.preferences);
  });

  // 14. Announcements & Notices
  app.get("/api/announcements", (req, res) => {
    res.json(db.announcements);
  });

  app.post("/api/announcements", async (req, res) => {
    const { title, content, target_audience, priority, author_name, email_broadcast, sms_broadcast } = req.body;
    const shouldBroadcast = email_broadcast !== undefined ? !!email_broadcast : !!sms_broadcast;

    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      content,
      target_audience: target_audience || 'ALL',
      priority: priority || 'NORMAL',
      author_name: author_name || 'Dr. Alistair Vance',
      created_at: new Date().toISOString(),
      email_broadcast: shouldBroadcast,
      sms_broadcast: shouldBroadcast
    };

    db.announcements.unshift(newAnn);

    // If email broadcast is checked, record email dispatch
    const broadcastPref = db.preferences.email_emergency_alerts ?? db.preferences.sms_emergency_alerts ?? true;
    if (shouldBroadcast && broadcastPref) {
      const emailRes = await dispatchEmail(
        'broadcast-all@devora-campus.edu',
        `DEVORA BROADCAST: ${title}`,
        `Campus Announcement for ${target_audience}:\n\n${content}`,
        {
          recipientName: `All Campus ${target_audience}`,
          triggerEvent: 'Broadcast Notice'
        }
      );

      db.emailLogs.unshift({
        id: `email-${Date.now()}`,
        recipient_email: 'broadcast-all@devora-campus.edu',
        recipient_name: `All ${target_audience}`,
        subject: `DEVORA BROADCAST: ${title}`,
        message: `BROADCAST: ${title} — ${content.slice(0, 100)}...`,
        template_id: 'DEVORA_ANNOUNCEMENT',
        status: emailRes.status,
        trigger_event: 'Broadcast Notice',
        created_at: new Date().toISOString()
      });
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Notice: ${title}`,
      message: content.slice(0, 80) + '...',
      type: priority === 'URGENT' ? 'URGENT' : 'INFO',
      related_type: 'ANNOUNCEMENT',
      related_id: newAnn.id,
      read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json(newAnn);
  });

  // 15. Timetable
  app.get("/api/timetable", (req, res) => {
    const { class_grade, section } = req.query;
    let list = db.timetable;
    if (class_grade) list = list.filter(t => t.class_grade === String(class_grade));
    if (section) list = list.filter(t => t.section === String(section));
    res.json(list);
  });

  // 16. Demo Story Runner / Reset
  app.post("/api/demo/reset", (req, res) => {
    db.seedDatabase();
    res.json({ success: true, message: "Database reseeded to clean demo state." });
  });

  // ==========================================
  // Vite Middleware & Static Serving
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: import.meta.dirname || process.cwd(),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(import.meta.dirname || process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n  \x1b[32m➜\x1b[0m  \x1b[1mDEVORA AI\x1b[0m Server running at:`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
    console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m \x1b[36mhttp://127.0.0.1:${PORT}\x1b[0m\n`);
  });
}

startServer();

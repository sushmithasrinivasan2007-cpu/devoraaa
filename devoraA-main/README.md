# Devora AI — Intelligent Campus & Administration Operations Platform

> **"Campus and admin operations AI runs the everyday business of a school, smoothly and without the paperwork."**

Devora AI is an enterprise-grade school operations platform that connects Administrators, Teachers/Staff, Students, and Parents into one centralized autonomous operating system. It eliminates paperwork bottlenecks, autonomously triages facility issues, routes smart administrative requests, dispatches automated SMTP email alerts, analyzes student attendance trends, and provides school leaders with an intelligent operations cockpit.

---

## Key Features

1. **AI Terminal Reel (Centerpiece)**:
   - Command-line style conversational interface designed for school leaders (`Ctrl + K`).
   - Monospace typography with real-time command visual feedback.
   - **Oversized Draggable Tuning Dials** for **STYLE** (Concise to Detailed), **LENGTH** (Short to Long), **TONE** (Formal to Friendly), and **PRIORITY** (Normal to Urgent).
   - Powered by Gemini (`gemini-2.5-flash`) server-side with strict grounding on authorized campus database records.

2. **Executive Daily Operations Brief**:
   - Real-time morning summary of campus attendance, absent rosters, unresolved maintenance, and pending service requests.
   - Recharts visual dashboards for 5-day attendance trends, category breakdowns, and section variances.

3. **Campus Maintenance & Auto-Triage**:
   - Report classroom failures (broken projector, water leaks, electrical hazards, Wi-Fi drops).
   - Instant AI classification determining category, priority, and assigned staff member.
   - Workflow transitions: `PENDING` &rarr; `IN_PROGRESS` &rarr; `RESOLVED`.
   - Automated SMTP email notification dispatch to technicians.

4. **Attendance AI**:
   - Digital roll call for homerooms and sections.
   - Live percentage computation and automatic absenteeism flagging.
   - AI trend detection (detects section attendance drops below 80% and recommends staff intervention).

5. **Smart Requests & Bonafide Workflow**:
   - Student and staff requests for Bonafide certificates, ID card replacements, transfers, and equipment.
   - Autonomous department assignment and tracking.

6. **Leave Administration**:
   - Faculty and student medical/casual leave applications.
   - One-click Admin approval with instant SMTP email delivery to applicant email addresses.

7. **SMTP Email Gateway & Audit**:
   - Nodemailer SMTP integration with real-time delivery logs, trigger event auditing, HTML email body templates, and configurable routing toggles.

8. **Campus Directory & Weekly Timetable**:
   - Complete student roster with guardian contact emails, phone numbers, and medical notes.
   - Faculty departmental directory and weekly period schedules.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js + Express (Full-stack container ingress on Port 3000), Python Flask microservice support
- **Database**: Supabase PostgreSQL (`database/schema.sql` + `database/seed.sql`)
- **AI**: Google Gemini API (`gemini-2.5-flash`) server-side proxy
- **Email Gateway**: SMTP via Nodemailer with fallback delivery simulation & audit logs

---

## 3-Minute Hackathon Presentation Demo Story

The application includes a built-in **"Run Demo Story"** guided modal in the top header:

1. **Role**: Switch to **Teacher** (Sarah Jenkins).
2. **Report Issue**: Submit *"Projector not working in Class 8A"*.
3. **AI Classification**: Autonomous extraction &mdash; Category: *Projector*, Priority: *Medium*, Routed to *Rajesh Kumar (Facilities)*.
4. **Assignment & Alert**: In-app notification pushed and SMTP email dispatched to technician.
5. **Technician Action**: Status changed to *In Progress*, then *Resolved*.
6. **Executive Sync**: Admin Dashboard updates dynamically; open issues decrement.
7. **Terminal Reel Query**: Press `Ctrl + K` and ask: *"What campus issues need my attention?"* to receive database-grounded operational guidance.

---

## Setup & Deployment Instructions

### 1. Database Setup (Supabase)
1. In your Supabase dashboard, open the **SQL Editor**.
2. Run the DDL script in `database/schema.sql` to generate all tables, foreign keys, RLS policies, and triggers.
3. Run `database/seed.sql` to populate initial demo data for students, staff, timetable, and campus records.

### 2. Environment Variables Configuration
Configure the following in your environment or `.env` file:

```env
# Gemini API Key (Server-side)
GEMINI_API_KEY=your_gemini_api_key

# Supabase PostgreSQL & Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME="Devora AI Campus Operations"
SMTP_FROM_EMAIL=notifications@devora-campus.edu

# Server Port
PORT=3000
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The server will be available at [http://localhost:3000](http://localhost:3000).

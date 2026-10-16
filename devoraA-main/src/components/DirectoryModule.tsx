import React, { useState } from 'react';
import { Student, Staff, Role } from '../types';
import { api } from '../services/api';
import { Users, GraduationCap, UserCheck, Plus, Search, Phone, Mail, ShieldAlert } from 'lucide-react';

interface DirectoryModuleProps {
  students: Student[];
  staff: Staff[];
  currentRole: Role;
  onRefresh: () => void;
  id?: string;
}

export const DirectoryModule: React.FC<DirectoryModuleProps> = ({
  students,
  staff,
  currentRole,
  onRefresh,
  id = "directory-module"
}) => {
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'STAFF'>('STUDENTS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);

  // Add student form state
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classGrade, setClassGrade] = useState('8');
  const [section, setSection] = useState('A');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+15550');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [programFilter, setProgramFilter] = useState<'ALL' | 'BCA' | 'BCA+DA' | 'BCOM'>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');

  const filteredStudents = students.filter(s => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.roll_number.toLowerCase().includes(q) ||
        (s.admission_no && s.admission_no.toLowerCase().includes(q)) ||
        (s.uucms_no && s.uucms_no.toLowerCase().includes(q)) ||
        (s.source_program && s.source_program.toLowerCase().includes(q)) ||
        (s.guardian_name && s.guardian_name.toLowerCase().includes(q)) ||
        s.class_grade.includes(q);
      if (!match) return false;
    }

    if (programFilter !== 'ALL') {
      if (s.source_program !== programFilter) return false;
    }

    if (semesterFilter !== 'ALL') {
      if (s.class_grade !== semesterFilter) return false;
    }

    return true;
  });

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber) return;
    setIsSubmitting(true);
    try {
      await api.createStudent({
        name,
        roll_number: rollNumber,
        class_grade: classGrade,
        section,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        medical_notes: medicalNotes
      });
      setShowAddStudent(false);
      setName('');
      setRollNumber('');
      setMedicalNotes('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2020] tracking-tight flex flex-wrap items-center gap-2.5">
            <span>Campus Directory &amp; Roster</span>
            <span className="text-xs font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-full border border-[#6B1E2B]/20">
              {students.length} Students · {staff.length} Faculty
            </span>
          </h1>
          <p className="text-sm text-[#756565] mt-1 font-sans">
            Verified student records, guardian emergency contact points, and faculty administrative assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#FFF8EC]/90 p-1 rounded-xl border border-[#6B1E2B]/15 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('STUDENTS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'STUDENTS' ? 'bg-[#6B1E2B] text-white shadow-sm' : 'text-[#756565] hover:text-[#2B2020]'
              }`}
            >
              Students ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('STAFF')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'STAFF' ? 'bg-[#6B1E2B] text-white shadow-sm' : 'text-[#756565] hover:text-[#2B2020]'
              }`}
            >
              Faculty &amp; Staff ({staff.length})
            </button>
          </div>

          {activeTab === 'STUDENTS' && (
            <button
              type="button"
              id="btn-add-student"
              onClick={() => setShowAddStudent(true)}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input & Stream / Semester Filters */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-[#756565] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by name, roll, UUCMS, adm no, or guardian...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/20 text-sm text-[#2B2020] placeholder:text-[#9A8989] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono shadow-sm transition-all"
            />
          </div>

          {activeTab === 'STUDENTS' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[#756565] uppercase">Stream:</span>
              {(['ALL', 'BCA', 'BCA+DA', 'BCOM'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProgramFilter(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    programFilter === p
                      ? 'bg-[#6B1E2B] text-[#FFF8EC] shadow-sm'
                      : 'bg-[#F3EBDD] text-[#756565] hover:text-[#2B2020]'
                  }`}
                >
                  {p}
                </button>
              ))}

              <span className="text-[11px] font-mono font-bold text-[#756565] uppercase ml-2">Sem:</span>
              {['ALL', '1', '2', '3', '4', '5', '6'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSemesterFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    semesterFilter === s
                      ? 'bg-[#6B1E2B] text-[#FFF8EC] shadow-sm'
                      : 'bg-[#F3EBDD] text-[#756565] hover:text-[#2B2020]'
                  }`}
                >
                  {s === 'ALL' ? 'All' : `S${s}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Roster Cards Grid */}
      {activeTab === 'STUDENTS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((stu) => (
            <div
              key={stu.id}
              className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] hover:border-[#6B1E2B]/30 transition-all space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#6B1E2B]/10 border border-[#6B1E2B]/20 flex items-center justify-center font-mono font-bold text-xs text-[#6B1E2B] shrink-0">
                    S{stu.class_grade}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#2B2020] truncate">{stu.name}</h3>
                    <div className="text-xs font-mono text-[#756565] flex items-center gap-2">
                      <span>{stu.roll_number}</span>
                      {stu.source_program && (
                        <span className="text-[10px] font-mono font-bold bg-[#6B1E2B]/10 text-[#6B1E2B] px-1.5 py-0.2 rounded">
                          {stu.source_program}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                  stu.attendance_rate >= 80 ? 'text-[#3D6B46] bg-[#5F8F68]/15 border border-[#5F8F68]/30' : 'text-[#B94A55] bg-[#B94A55]/15 border border-[#B94A55]/30'
                }`}>
                  {stu.attendance_rate}% Att.
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-[#756565] bg-[#F3EBDD]/60 p-3.5 rounded-xl border border-[#6B1E2B]/10">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B1E2B] font-bold">{stu.semester_name || `Sem ${stu.class_grade}`} • {stu.section}</span>
                  {stu.gender && <span className="text-[#756565] uppercase text-[10px]">{stu.gender}</span>}
                </div>
                {stu.uucms_no && (
                  <div className="text-[11px] text-[#2B2020]">
                    UUCMS: <strong className="text-[#6B1E2B] font-bold">{stu.uucms_no}</strong>
                  </div>
                )}
                {stu.admission_no && (
                  <div className="text-[11px] text-[#756565]">
                    Adm No: <strong className="text-[#2B2020]">{stu.admission_no}</strong>
                  </div>
                )}
                <div>Guardian: <strong className="text-[#2B2020]">{stu.guardian_name}</strong></div>
                <div className="flex items-center gap-1.5 text-[#6B1E2B] font-semibold">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{stu.guardian_phone}</span>
                </div>
                {stu.medical_notes && (
                  <div className="pt-1 text-[#9E671E] bg-[#C58A35]/10 p-2 rounded-lg border border-[#C58A35]/20 text-[11px] flex items-center gap-1.5 mt-1">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-[#C58A35]" />
                    <span>Medical: {stu.medical_notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((st) => (
            <div
              key={st.id}
              className="p-5 rounded-2xl bg-[#FFF8EC]/85 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(107,30,43,0.06)] hover:shadow-[0_8px_30px_-6px_rgba(107,30,43,0.12)] hover:border-[#6B1E2B]/30 transition-all space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2B2020]">{st.name}</h3>
                  <div className="text-xs font-mono text-[#756565]">{st.role_title}</div>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2.5 py-0.5 rounded-lg border border-[#6B1E2B]/20">
                  {st.department}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-[#756565] bg-[#F3EBDD]/60 p-3.5 rounded-xl border border-[#6B1E2B]/10">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#6B1E2B]" />
                  <span className="text-[#2B2020]">{st.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6B1E2B]" />
                  <span className="text-[#2B2020]">{st.phone}</span>
                </div>
                {st.assigned_classes && (
                  <div className="text-[11px] text-[#756565] pt-1.5 border-t border-[#6B1E2B]/10">
                    Assigned Classes: <strong className="text-[#2B2020]">{st.assigned_classes.join(', ')}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENROLL STUDENT MODAL */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-[#2B2020]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#FFF8EC] border border-[#6B1E2B]/20 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#6B1E2B]/10 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#6B1E2B]" />
                <h2 className="text-lg font-bold text-[#2B2020]">Enroll New Student</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudent(false)}
                className="text-[#756565] hover:text-[#2B2020] font-mono text-sm w-8 h-8 rounded-lg hover:bg-[#6B1E2B]/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Roll / Admission ID
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="STU-8A-09"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Class Grade
                  </label>
                  <input
                    type="text"
                    required
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Parent / Guardian"
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                    Guardian Mobile
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#6B1E2B] uppercase tracking-wider mb-1">
                  Medical Notes / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="e.g. Carries emergency inhaler"
                  className="w-full px-3 py-2 rounded-xl bg-[#F3EBDD]/60 border border-[#6B1E2B]/20 text-[#2B2020] focus:border-[#6B1E2B] focus:ring-2 focus:ring-[#6B1E2B]/10 outline-none font-mono text-sm transition-all placeholder:text-[#9A8989]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6B1E2B]/10">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[#756565] hover:text-[#2B2020] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#6B1E2B] hover:bg-[#42121C] text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Enrolling...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

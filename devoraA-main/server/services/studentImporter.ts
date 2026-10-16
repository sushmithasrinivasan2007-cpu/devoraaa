import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { Student, ImportValidationSummary } from '../../src/types';



export function parseExcelDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(d.y)}-${pad(d.m)}-${pad(d.d)}`;
    }
  }
  const str = String(val).trim();
  // e.g. 5/12/2008 -> 2008-05-12
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [m, d, y] = str.split('/');
    const pad = (n: string) => n.padStart(2, '0');
    return `${y}-${pad(m)}-${pad(d)}`;
  }
  return str;
}

/**
 * Locate the user's Excel file across local paths
 */
export function findExcelWorkbookPath(): string {
  const candidatePaths = [
    path.join(process.cwd(), 'BCA+DA & BCA, BCOM FINAL DATA 2026-27 ADMISSION(1).xlsx'),
    path.join(process.cwd(), 'BCA+DA & BCA, BCOM FINAL DATA 2026-27 ADMISSION.xlsx'),
    'C:/Users/sushm/Downloads/BCA+DA & BCA, BCOM FINAL DATA 2026-27 ADMISSION.xlsx',
    'C:/Users/sushm/Downloads/BCA+DA & BCA, BCOM FINAL DATA 2026-27 ADMISSION(1).xlsx',
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback check in current dir for any xlsx
  const currentDir = process.cwd();
  const files = fs.readdirSync(currentDir);
  const found = files.find(f => f.toLowerCase().includes('admission') && f.endsWith('.xlsx'));
  if (found) {
    return path.join(currentDir, found);
  }

  throw new Error('Workbook "BCA+DA & BCA, BCOM FINAL DATA 2026-27 ADMISSION(1).xlsx" not found.');
}

/**
 * Extract raw student records from all 3 sheets
 */
export function extractStudentsFromWorkbook(filePath?: string) {
  const targetPath = filePath || findExcelWorkbookPath();
  const wb = XLSX.readFile(targetPath);

  const sheetsToProcess = ['BCA', 'BCA+DA', 'BCOM'];
  const rawRecords: Array<{
    sheetName: string;
    sl_no: number;
    admission_no: string;
    name: string;
    gender: string;
    dob: string;
    uucms_no: string;
  }> = [];

  const sheetStats: Record<string, number> = {};
  let invalidCount = 0;

  sheetsToProcess.forEach(sheetName => {
    sheetStats[sheetName] = 0;
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    const rawData = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    let headerRowIdx = -1;
    for (let i = 0; i < rawData.length; i++) {
      const r = rawData[i];
      if (r && r.some(c => String(c).includes('STUDENT NAME') || String(c).includes('ADMISSION'))) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) return;

    const headers = rawData[headerRowIdx].map(h => String(h || '').trim());
    const slIdx = headers.findIndex(h => /SL\s*NO/i.test(h));
    const admIdx = headers.findIndex(h => /ADMISSI/i.test(h));
    const nameIdx = headers.findIndex(h => /STUDENT\s*NAME/i.test(h));
    const genderIdx = headers.findIndex(h => /GENDER/i.test(h));
    const dobIdx = headers.findIndex(h => /DATE\s*OF\s*BIRTH/i.test(h) || /DOB/i.test(h));
    const uucmsIdx = headers.findIndex(h => /UUCMS/i.test(h));

    for (let i = headerRowIdx + 1; i < rawData.length; i++) {
      const r = rawData[i];
      if (!r || r.length === 0) continue;

      const name = r[nameIdx] ? String(r[nameIdx]).trim() : '';
      const adm = r[admIdx] ? String(r[admIdx]).trim() : '';
      const uucms = r[uucmsIdx] ? String(r[uucmsIdx]).trim() : '';

      if (!name && !adm && !uucms) continue;

      if (!name || (!adm && !uucms)) {
        invalidCount++;
        continue;
      }

      sheetStats[sheetName]++;
      rawRecords.push({
        sheetName,
        sl_no: Number(r[slIdx]) || sheetStats[sheetName],
        admission_no: adm,
        name,
        gender: r[genderIdx] ? String(r[genderIdx]).trim().toUpperCase() : 'MALE',
        dob: parseExcelDate(r[dobIdx]),
        uucms_no: uucms
      });
    }
  });

  return { targetPath, rawRecords, sheetStats, invalidCount };
}

/**
 * Perform Balanced, Deterministic Semester & Section Allocation
 * Distributes valid students evenly into 6 BCA Semesters and 4 Sections per semester
 * Target distribution for 765:
 *   Sem 1: 128 (Sections: 32, 32, 32, 32)
 *   Sem 2: 128 (Sections: 32, 32, 32, 32)
 *   Sem 3: 128 (Sections: 32, 32, 32, 32)
 *   Sem 4: 127 (Sections: 32, 32, 32, 31)
 *   Sem 5: 127 (Sections: 32, 32, 32, 31)
 *   Sem 6: 127 (Sections: 32, 32, 32, 31)
 */
export function buildUnifiedStudentsDirectory(filePath?: string): {
  students: Student[];
  validation: ImportValidationSummary;
} {
  const { targetPath, rawRecords, sheetStats, invalidCount } = extractStudentsFromWorkbook(filePath);

  // Validate uniqueness
  const uucmsSeen = new Set<string>();
  const admSeen = new Set<string>();
  let dupUucms = 0;
  let dupAdm = 0;

  const validRecords: typeof rawRecords = [];

  rawRecords.forEach(rec => {
    if (rec.uucms_no) {
      if (uucmsSeen.has(rec.uucms_no)) {
        dupUucms++;
      } else {
        uucmsSeen.add(rec.uucms_no);
      }
    }
    if (rec.admission_no) {
      if (admSeen.has(rec.admission_no)) {
        dupAdm++;
      } else {
        admSeen.add(rec.admission_no);
      }
    }
    validRecords.push(rec);
  });

  const totalValid = validRecords.length;

  // Semester definitions for BCA
  const semesterDefs = [
    { num: 1, id: 'sem-bca-1', name: '1st Semester', grade: '1', bPrefix: '1B', neo: '1st Neo' },
    { num: 2, id: 'sem-bca-2', name: '2nd Semester', grade: '2', bPrefix: '2B', neo: '2nd Neo' },
    { num: 3, id: 'sem-bca-3', name: '3rd Semester', grade: '3', bPrefix: '3B', neo: '3rd Neo' },
    { num: 4, id: 'sem-bca-4', name: '4th Semester', grade: '4', bPrefix: '4B', neo: '4th Neo' },
    { num: 5, id: 'sem-bca-5', name: '5th Semester', grade: '5', bPrefix: '5B', neo: '5th Neo' },
    { num: 6, id: 'sem-bca-6', name: '6th Semester', grade: '6', bPrefix: '6B', neo: '6th Neo' }
  ];

  // Calculate balanced distribution counts
  const basePerSem = Math.floor(totalValid / 6);
  const semRemainder = totalValid % 6;
  const semTargetCounts = [
    basePerSem + (semRemainder > 0 ? 1 : 0),
    basePerSem + (semRemainder > 1 ? 1 : 0),
    basePerSem + (semRemainder > 2 ? 1 : 0),
    basePerSem + (semRemainder > 3 ? 1 : 0),
    basePerSem + (semRemainder > 4 ? 1 : 0),
    basePerSem
  ];

  const students: Student[] = [];
  const semSummary: ImportValidationSummary['semesterDistribution'] = [];

  let recordIndex = 0;

  semesterDefs.forEach((semDef, semIdx) => {
    const semTarget = semTargetCounts[semIdx];
    const semStudents: Student[] = [];

    // Calculate section counts
    const basePerSec = Math.floor(semTarget / 4);
    const secRemainder = semTarget % 4;
    const secCounts = [
      basePerSec + (secRemainder > 0 ? 1 : 0),
      basePerSec + (secRemainder > 1 ? 1 : 0),
      basePerSec + (secRemainder > 2 ? 1 : 0),
      basePerSec
    ];

    const sectionDefs = [
      { id: `sec-${semDef.id}-neo`, name: `Section ${semDef.neo}` },
      { id: `sec-${semDef.id}-b1`, name: `Section ${semDef.bPrefix}1` },
      { id: `sec-${semDef.id}-b2`, name: `Section ${semDef.bPrefix}2` },
      { id: `sec-${semDef.id}-b3`, name: `Section ${semDef.bPrefix}3` }
    ];

    const secSummaryList: { sectionName: string; studentCount: number }[] = [];

    sectionDefs.forEach((secDef, secIdx) => {
      const secTarget = secCounts[secIdx];
      let assignedCount = 0;

      for (let j = 0; j < secTarget && recordIndex < totalValid; j++) {
        const raw = validRecords[recordIndex];
        const studentId = `stu-bca-${String(recordIndex + 1).padStart(4, '0')}`;

        const cleanName = raw.name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
        const studentEmail = `${cleanName || 'student'}.${raw.sl_no}@devora.edu`;

        const student: Student = {
          id: studentId,
          name: raw.name,
          email: studentEmail,
          roll_number: raw.admission_no || `BCA-${raw.sl_no}`,
          admission_no: raw.admission_no,
          register_number: raw.uucms_no || raw.admission_no,
          uucms_no: raw.uucms_no,
          gender: raw.gender,
          dob: raw.dob,
          source_program: raw.sheetName as any,
          sl_no: raw.sl_no,
          phone: `+91 98${String(10000000 + recordIndex).slice(0, 8)}`,
          class_grade: semDef.grade,
          section: secDef.name,
          section_id: secDef.id,
          course_id: 'crs-bca',
          course_name: 'BCA',
          academic_year_id: 'ay-2026-27',
          academic_year: '2026-27',
          semester_id: semDef.id,
          semester_name: semDef.name,
          guardian_name: `Guardian of ${raw.name}`,
          guardian_phone: `+91 97${String(20000000 + recordIndex).slice(0, 8)}`,
          guardian_email: `guardian.${cleanName || 'contact'}@example.com`,
          attendance_rate: 0,
          status: 'ACTIVE'
        };

        semStudents.push(student);
        students.push(student);
        assignedCount++;
        recordIndex++;
      }

      secSummaryList.push({
        sectionName: secDef.name,
        studentCount: assignedCount
      });
    });

    semSummary.push({
      semesterNumber: semDef.num,
      semesterName: semDef.name,
      studentCount: semStudents.length,
      sections: secSummaryList
    });
  });

  const validation: ImportValidationSummary = {
    filePath: targetPath,
    totalFound: rawRecords.length,
    totalImported: students.length,
    totalSkipped: 0,
    totalInvalid: invalidCount,
    duplicateUucmsCount: dupUucms,
    duplicateAdmissionCount: dupAdm,
    sheetBreakdown: Object.entries(sheetStats).map(([name, count]) => ({
      sheetName: name,
      count
    })),
    semesterDistribution: semSummary
  };

  return { students, validation };
}

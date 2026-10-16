import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { MaintenanceIssue, Student, AttendanceRecord } from '../types';

interface AnalyticsChartsProps {
  maintenance: MaintenanceIssue[];
  students: Student[];
  attendance: AttendanceRecord[];
  id?: string;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  maintenance,
  students,
  attendance,
  id = "analytics-charts"
}) => {
  // 1. Weekly Attendance Trend Data
  const weeklyAttendanceData = [
    { day: 'Mon', rate: 94, target: 85 },
    { day: 'Tue', rate: 96, target: 85 },
    { day: 'Wed', rate: 91, target: 85 },
    { day: 'Thu', rate: 89, target: 85 },
    { day: 'Fri (Today)', rate: 95, target: 85 }
  ];

  // 2. Maintenance Issues by Category
  const categoryCountMap: Record<string, number> = {};
  maintenance.forEach(m => {
    const cat = m.category || 'Other';
    categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
  });

  const maintenanceData = Object.entries(categoryCountMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#6B1E2B', '#A85C68', '#C58A35', '#5F8F68', '#6C8799', '#42121C'];

  // 3. Class Attendance Comparison
  const classComparisonData = [
    { class: 'Class 8A', rate: 95, absent: 1 },
    { class: 'Class 8B', rate: 77, absent: 2 },
    { class: 'Class 10A', rate: 98, absent: 0 },
    { class: 'Class 10B', rate: 92, absent: 1 }
  ];

  const tooltipCustomStyle = {
    backgroundColor: '#FFF8EC',
    borderColor: 'rgba(107, 30, 43, 0.2)',
    borderRadius: '12px',
    color: '#2B2020',
    fontSize: '12px',
    boxShadow: '0 8px 24px -4px rgba(107, 30, 43, 0.15)',
    fontWeight: '500'
  };

  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: 5-Day Attendance Trend */}
      <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#2B2020]">
            Attendance Rate Trend (5-Day)
          </h3>
          <span className="text-[11px] font-mono font-semibold text-[#5F8F68] bg-[#5F8F68]/12 px-2.5 py-0.5 rounded-full border border-[#5F8F68]/20">
            Avg: 93%
          </span>
        </div>
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DDCA" vertical={false} />
              <XAxis dataKey="day" stroke="#756565" tick={{ fill: '#756565', fontSize: 11, fontWeight: 500 }} />
              <YAxis domain={[60, 100]} stroke="#756565" tick={{ fill: '#756565', fontSize: 11, fontWeight: 500 }} />
              <Tooltip contentStyle={tooltipCustomStyle} />
              <Line type="monotone" dataKey="rate" stroke="#6B1E2B" strokeWidth={3} dot={{ r: 4, fill: '#6B1E2B', strokeWidth: 2, stroke: '#FFF8EC' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="target" stroke="#9A8989" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Maintenance Issues by Category */}
      <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#2B2020]">
            Campus Issues by Category
          </h3>
          <span className="text-[11px] font-mono font-semibold text-[#6B1E2B] bg-[#6B1E2B]/10 px-2 py-0.5 rounded-full border border-[#6B1E2B]/20">
            {maintenance.length} Logged
          </span>
        </div>
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={maintenanceData.length > 0 ? maintenanceData : [{ name: 'Projector', value: 1 }, { name: 'Plumbing', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {(maintenanceData.length > 0 ? maintenanceData : [{ name: 'A', value: 1 }, { name: 'B', value: 1 }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipCustomStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Class-wise Attendance Comparison */}
      <div className="p-5 rounded-2xl bg-[#FFF8EC]/90 border border-[#6B1E2B]/12 shadow-sm space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#2B2020]">
            Section Attendance Variance
          </h3>
          <span className="text-[11px] font-mono font-semibold text-[#B94A55] bg-[#B94A55]/12 px-2.5 py-0.5 rounded-full border border-[#B94A55]/20">
            8B Needs Review
          </span>
        </div>
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DDCA" vertical={false} />
              <XAxis dataKey="class" stroke="#756565" tick={{ fill: '#756565', fontSize: 11, fontWeight: 500 }} />
              <YAxis domain={[0, 100]} stroke="#756565" tick={{ fill: '#756565', fontSize: 11, fontWeight: 500 }} />
              <Tooltip contentStyle={tooltipCustomStyle} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                {classComparisonData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry.rate < 80 ? '#B94A55' : '#6B1E2B'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DistrictName } from '../types';
import {
  BarChart3,
  Download,
  Award,
  AlertTriangle,
  Building2,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const StatisticsHub: React.FC = () => {
  const { reports, assignments, units, computeAssignmentStatus } = useApp();

  const districts: DistrictName[] = [
    'Thành phố Ninh Bình',
    'Thành phố Tam Điệp',
    'Huyện Hoa Lư',
    'Huyện Gia Viễn',
    'Huyện Nho Quan',
    'Huyện Yên Khánh',
    'Huyện Kim Sơn',
    'Huyện Yên Mô',
  ];

  // District statistics calculation
  const districtData = districts.map((district) => {
    const districtUnits = units.filter((u) => u.huyen_tp === district);
    const unitIds = districtUnits.map((u) => u.id);
    const districtAssignments = assignments.filter((a) => unitIds.includes(a.unit_id));

    let completed = 0;
    let overdue = 0;
    let revising = 0;

    districtAssignments.forEach((a) => {
      const rep = reports.find((r) => r.id === a.report_id);
      if (rep) {
        const { status } = computeAssignmentStatus(a, rep);
        if (status === 'HOAN_THANH' || status === 'DA_NHAN') completed++;
        if (status === 'QUA_HAN') overdue++;
        if (status === 'YEU_CAU_SUA_DOI') revising++;
      }
    });

    const total = districtAssignments.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      district,
      unitCount: districtUnits.length,
      totalAssignments: total,
      completed,
      overdue,
      revising,
      rate,
    };
  });

  // Sort by completion rate descending
  districtData.sort((a, b) => b.rate - a.rate);

  // Unit performance rankings
  const unitPerformances = units.map((u) => {
    const uAssignments = assignments.filter((a) => a.unit_id === u.id);
    let done = 0;
    let overdue = 0;
    let reminders = 0;

    uAssignments.forEach((a) => {
      const rep = reports.find((r) => r.id === a.report_id);
      if (rep) {
        const { status } = computeAssignmentStatus(a, rep);
        if (status === 'HOAN_THANH' || status === 'DA_NHAN') done++;
        if (status === 'QUA_HAN') overdue++;
        reminders += a.so_lan_nhac_nho || 0;
      }
    });

    const total = uAssignments.length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      unit: u,
      total,
      done,
      overdue,
      reminders,
      rate,
    };
  });

  const bestUnits = [...unitPerformances]
    .filter((u) => u.overdue === 0 && u.reminders === 0)
    .sort((a, b) => b.done - a.done)
    .slice(0, 10);

  const worstUnits = [...unitPerformances]
    .filter((u) => u.overdue > 0 || u.reminders > 0)
    .sort((a, b) => b.overdue - a.overdue || b.reminders - a.reminders)
    .slice(0, 10);

  const handleExportSynthesis = () => {
    const header = [
      'STT',
      'Huyện / Thành Phố',
      'Số Đơn Vị Xã',
      'Tổng Lượt Báo Cáo',
      'Đã Hoàn Thành',
      'Số Báo Cáo Quá Hạn',
      'Đang Chỉnh Sửa',
      'Tỷ Lệ Hoàn Thành (%)',
    ];

    const rows = districtData.map((d, idx) => [
      idx + 1,
      `"${d.district}"`,
      d.unitCount,
      d.totalAssignments,
      d.completed,
      d.overdue,
      d.revising,
      `${d.rate}%`,
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_Cao_Tong_Hop_Tien_Do_Toan_Tinh_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            BÁO CÁO THỐNG KÊ & ĐÁNH GIÁ CHẤP HÀNH
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Xếp Hạng Tiến Độ Báo Cáo Toàn Tỉnh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Đánh giá mức độ hoàn thành nhiệm vụ báo cáo theo 8 địa phương và từng xã/phường
          </p>
        </div>

        <button
          onClick={handleExportSynthesis}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Xuất Báo Cáo UBND Tỉnh (Excel)
        </button>
      </div>

      {/* District Rankings Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase">
            Bảng Xếp Hạng Tiến Độ 8 Huyện / Thành Phố
          </h3>
          <span className="text-[11px] text-slate-500">Xếp theo tỷ lệ hoàn thành</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">Hạng</th>
                <th className="py-2.5 px-3">Huyện / Thành Phố</th>
                <th className="py-2.5 px-3 text-center">Số Xã</th>
                <th className="py-2.5 px-3 text-center">Đã Xong</th>
                <th className="py-2.5 px-3 text-center">Quá Hạn</th>
                <th className="py-2.5 px-3 text-center">Đang Sửa</th>
                <th className="py-2.5 px-3">Tỷ Lệ Hoàn Thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districtData.map((d, idx) => (
                <tr key={d.district} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-center font-bold text-slate-700">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {d.district}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{d.unitCount}</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-700">
                    {d.completed}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                    {d.overdue > 0 ? d.overdue : '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-orange-700">
                    {d.revising > 0 ? d.revising : '-'}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div
                          style={{ width: `${d.rate}%` }}
                          className={`h-full ${
                            d.rate >= 80 ? 'bg-emerald-500' : d.rate >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {d.rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two columns: Best Units & Worst Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Top Performers */}
        <div className="bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase">
              <Award className="w-4 h-4 text-emerald-600" />
              Đơn Vị Chấp Hành Tốt Nhất (Nộp đúng hạn 100%)
            </div>
          </div>
          <div className="p-3 divide-y divide-slate-100 text-xs">
            {bestUnits.slice(0, 6).map((item) => (
              <div key={item.unit.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{item.unit.ten_don_vi}</div>
                  <div className="text-[10px] text-slate-400">{item.unit.huyen_tp}</div>
                </div>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {item.done}/{item.total} hoàn thành
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="bg-white border border-rose-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 uppercase">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Đơn Vị Chậm Trễ / Bị Đôn Đốc Nhiều Lần
            </div>
          </div>
          <div className="p-3 divide-y divide-slate-100 text-xs">
            {worstUnits.slice(0, 6).map((item) => (
              <div key={item.unit.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{item.unit.ten_don_vi}</div>
                  <div className="text-[10px] text-slate-400">{item.unit.huyen_tp} · {item.unit.so_dien_thoai}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                    {item.overdue} quá hạn · {item.reminders} nhắc
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

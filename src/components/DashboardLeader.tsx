import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DistrictName, ReportAssignment } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  Users,
  Send,
  Download,
  Filter,
  ArrowUpRight,
  PhoneCall,
  Search,
  ExternalLink,
} from 'lucide-react';

interface DashboardLeaderProps {
  onSelectReport: (reportId: string) => void;
  onSelectUnit: (unitId: string) => void;
  onOpenReminderModal: (assignment: ReportAssignment) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardLeader: React.FC<DashboardLeaderProps> = ({
  onSelectReport,
  onSelectUnit,
  onOpenReminderModal,
  onNavigateToTab,
}) => {
  const {
    units,
    reports,
    assignments,
    officers,
    computeAssignmentStatus,
    settings,
  } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports[0]?.id || ''
  );
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const currentReport =
    reports.find((r) => r.id === selectedReportId) || reports[0];

  if (!currentReport) {
    return (
      <div className="p-8 text-center text-slate-500">
        Chưa có báo cáo nào được ban hành trong hệ thống.
      </div>
    );
  }

  // Filter assignments for the selected report
  const reportAssignments = assignments.filter(
    (a) => a.report_id === currentReport.id
  );

  // Compute live statuses
  const evaluatedAssignments = reportAssignments.map((a) => {
    const unit = units.find((u) => u.id === a.unit_id);
    const { status, overdueDays } = computeAssignmentStatus(a, currentReport);
    return {
      assignment: a,
      unit,
      status,
      overdueDays,
    };
  });

  // KPI Metrics
  const totalUnits = evaluatedAssignments.length;
  const completedCount = evaluatedAssignments.filter(
    (item) => item.status === 'HOAN_THANH'
  ).length;
  const receivedCount = evaluatedAssignments.filter(
    (item) => item.status === 'DA_NHAN'
  ).length;
  const submittedCount = evaluatedAssignments.filter(
    (item) => item.status === 'DA_XAC_NHAN_GUI'
  ).length;
  const revisingCount = evaluatedAssignments.filter(
    (item) => item.status === 'YEU_CAU_SUA_DOI'
  ).length;
  const approachingCount = evaluatedAssignments.filter(
    (item) => item.status === 'SAP_DEN_HAN'
  ).length;
  const overdueCount = evaluatedAssignments.filter(
    (item) => item.status === 'QUA_HAN'
  ).length;

  const totalSubmittedOrDone =
    completedCount + receivedCount + submittedCount;
  const progressPercent = totalUnits
    ? Math.round((totalSubmittedOrDone / totalUnits) * 100)
    : 0;

  // Red Alert: Overdue units and frequently reminded units
  const overdueList = evaluatedAssignments
    .filter((item) => item.status === 'QUA_HAN')
    .sort((a, b) => b.overdueDays - a.overdueDays || (b.assignment.so_lan_nhac_nho || 0) - (a.assignment.so_lan_nhac_nho || 0));

  // Revision required list
  const revisionList = evaluatedAssignments.filter(
    (item) => item.status === 'YEU_CAU_SUA_DOI'
  );

  // Stats by 8 Districts
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

  const districtStats = districts.map((district) => {
    const items = evaluatedAssignments.filter(
      (item) => item.unit?.huyen_tp === district
    );
    const total = items.length;
    const done = items.filter(
      (i) => i.status === 'HOAN_THANH' || i.status === 'DA_NHAN'
    ).length;
    const overdue = items.filter((i) => i.status === 'QUA_HAN').length;
    const revising = items.filter((i) => i.status === 'YEU_CAU_SUA_DOI').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      district,
      total,
      done,
      overdue,
      revising,
      rate,
    };
  });

  // Officer Performance
  const officerStats = officers.map((officer) => {
    const officerUnits = units.filter((u) => u.quan_ly_xa_id === officer.id);
    const unitIds = officerUnits.map((u) => u.id);
    const officerAssignments = evaluatedAssignments.filter((i) =>
      unitIds.includes(i.unit?.id || '')
    );
    const total = officerAssignments.length;
    const done = officerAssignments.filter(
      (i) => i.status === 'HOAN_THANH' || i.status === 'DA_NHAN'
    ).length;
    const overdue = officerAssignments.filter((i) => i.status === 'QUA_HAN').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      officer,
      total,
      done,
      overdue,
      rate,
      assignedCount: officerUnits.length,
    };
  });

  // Export CSV summary
  const handleExportCSV = () => {
    const header = [
      'STT',
      'Mã Đơn Vị',
      'Tên Xã/Phường',
      'Quận/Huyện',
      'Người phụ trách xã',
      'Số điện thoại',
      'Cán bộ Sở phụ trách',
      'Trạng thái báo cáo',
      'Số ngày quá hạn',
      'Số lần nhắc nhở',
      'Thời gian gửi email',
    ];

    const rows = evaluatedAssignments.map((item, idx) => {
      const off = officers.find((o) => o.id === item.unit?.quan_ly_xa_id);
      return [
        idx + 1,
        `"${item.unit?.ma_don_vi || ''}"`,
        `"${item.unit?.ten_don_vi || ''}"`,
        `"${item.unit?.huyen_tp || ''}"`,
        `"${item.unit?.nguoi_phu_trach || ''}"`,
        `"${item.unit?.so_dien_thoai || ''}"`,
        `"${off?.name || ''}"`,
        `"${item.status}"`,
        item.overdueDays,
        item.assignment.so_lan_nhac_nho || 0,
        item.assignment.ngay_xac_nhan_gui || 'Chưa gửi',
      ].join(',');
    });

    const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_Cao_Tien_Do_${currentReport.ma_bao_cao}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Report Selector Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>Sở Tài Chính Ninh Bình</span>
              <span aria-hidden="true">·</span>
              <span>Phòng Quản lý Ngân sách</span>
              <span aria-hidden="true">·</span>
              <span className="text-red-700 font-bold">129 Xã / Phường / Thị Trấn</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Bảng Theo Dõi & Đôn Đốc Báo Cáo Cấp Xã
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Report selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-medium whitespace-nowrap">Báo cáo:</span>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 focus:outline-hidden cursor-pointer max-w-xs truncate"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.ma_bao_cao}] {r.ten_bao_cao}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Xuất Excel / CSV
            </button>
          </div>
        </div>

        {/* Selected Report Metadata Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600">
          <div>
            <span className="text-slate-400">Thời hạn nộp: </span>
            <span className="font-semibold text-slate-900 font-mono">
              {currentReport.gio_han} ngày {currentReport.han_gui}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Hòm thư nhận: </span>
            <span className="font-semibold text-blue-700 font-mono">
              {currentReport.email_nhan_bao_cao}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Đơn vị nhận: </span>
            <span className="font-semibold text-slate-900">
              {totalUnits} / 129 Xã, phường
            </span>
          </div>
          <div>
            <span className="text-slate-400">Người ban hành: </span>
            <span className="font-semibold text-slate-900">
              {currentReport.nguoi_tao_ten}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Mức độ: </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                currentReport.muc_do_uu_tien === 'HOA_TOC'
                  ? 'bg-red-100 text-red-800'
                  : currentReport.muc_do_uu_tien === 'KHAN'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {currentReport.muc_do_uu_tien}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng đơn vị
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalUnits}
            </span>
            <span className="text-[11px] text-slate-500">100%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            129 xã/phường toàn tỉnh
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Đã duyệt xong
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 font-mono tabular-nums">
              {totalUnits ? Math.round((completedCount / totalUnits) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600">
            Hợp lệ & khớp số liệu
          </div>
        </div>

        {/* Received / Verifying */}
        <div className="bg-white border border-sky-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider flex items-center gap-1">
            <Send className="w-3.5 h-3.5 text-sky-600" />
            Đã gửi / Tiếp nhận
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-700 font-mono tabular-nums">
              {submittedCount + receivedCount}
            </span>
            <span className="text-xs font-semibold text-sky-600 font-mono tabular-nums">
              {totalUnits ? Math.round(((submittedCount + receivedCount) / totalUnits) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-sky-600">
            {receivedCount} Sở đã nhận, {submittedCount} chờ duyệt
          </div>
        </div>

        {/* Approaching */}
        <div className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Sắp đến hạn
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
              {approachingCount}
            </span>
            <span className="text-xs text-amber-700 font-mono tabular-nums">
              ≤ {settings.so_ngay_canh_bao_sap_den_han} ngày
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 truncate">
            Cần nhắc nhở trước
          </div>
        </div>

        {/* Overdue - RED ALERT */}
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            QUÁ HẠN (CHẬM)
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
              {overdueCount}
            </span>
            <span className="text-xs font-bold text-rose-700 font-mono tabular-nums">
              {totalUnits ? Math.round((overdueCount / totalUnits) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-rose-700">
            Cần áp dụng chế tài
          </div>
        </div>

        {/* Revision Required */}
        <div className="bg-white border border-orange-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            Yêu cầu sửa đổi
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-orange-700 font-mono tabular-nums">
              {revisingCount}
            </span>
            <span className="text-xs text-orange-600 font-mono tabular-nums">
              {totalUnits ? Math.round((revisingCount / totalUnits) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-orange-600">
            Lệch số liệu, biểu mẫu
          </div>
        </div>
      </div>

      {/* Progress Bar overall */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-700">Tiến độ nộp báo cáo toàn tỉnh ({totalSubmittedOrDone}/{totalUnits} đơn vị đã gửi hoặc xong)</span>
          <span className="font-mono text-slate-900">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
          <div
            style={{ width: `${(completedCount / totalUnits) * 100}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Hoàn thành: ${completedCount}`}
          />
          <div
            style={{ width: `${(receivedCount / totalUnits) * 100}%` }}
            className="bg-indigo-500 h-full transition-all"
            title={`Sở đã nhận: ${receivedCount}`}
          />
          <div
            style={{ width: `${(submittedCount / totalUnits) * 100}%` }}
            className="bg-sky-400 h-full transition-all"
            title={`Đã gửi email: ${submittedCount}`}
          />
          <div
            style={{ width: `${(revisingCount / totalUnits) * 100}%` }}
            className="bg-orange-400 h-full transition-all"
            title={`Yêu cầu sửa đổi: ${revisingCount}`}
          />
          <div
            style={{ width: `${(overdueCount / totalUnits) * 100}%` }}
            className="bg-rose-500 h-full transition-all"
            title={`Quá hạn: ${overdueCount}`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2.5">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Hoàn thành ({completedCount})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" /> Đã nhận ({receivedCount})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-sky-400" /> Đã gửi email ({submittedCount})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-orange-400" /> Cần sửa đổi ({revisingCount})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Quá hạn ({overdueCount})</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-xs bg-slate-200" /> Chưa gửi ({totalUnits - totalSubmittedOrDone})</span>
        </div>
      </div>

      {/* Main Two-Column Section: Red Alert Watchlist & District Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): RED ALERT WATCHLIST (Các đơn vị chậm trễ/chây ì) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-rose-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-rose-900 uppercase tracking-tight">
                  Danh Sách Đơn Vị Quá Hạn & Chậm Trễ ({overdueList.length})
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                Cần đôn đốc khẩn
              </span>
            </div>

            {overdueList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Không có đơn vị nào quá hạn cho báo cáo này.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 font-medium">
                    <tr>
                      <th className="py-2.5 px-3">Xã / Phường</th>
                      <th className="py-2.5 px-3">Huyện / TP</th>
                      <th className="py-2.5 px-3 text-center">Quá hạn</th>
                      <th className="py-2.5 px-3 text-center">Đã nhắc</th>
                      <th className="py-2.5 px-3">Cán bộ phụ trách</th>
                      <th className="py-2.5 px-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueList.map((item) => {
                      const off = officers.find((o) => o.id === item.unit?.quan_ly_xa_id);
                      return (
                        <tr key={item.assignment.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{item.unit?.ten_don_vi}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {item.unit?.nguoi_phu_trach} ({item.unit?.so_dien_thoai})
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {item.unit?.huyen_tp}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-bold text-rose-700 font-mono">
                              +{item.overdueDays} ngày
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`font-semibold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                                (item.assignment.so_lan_nhac_nho || 0) >= 2
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.assignment.so_lan_nhac_nho || 0} lần
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                            {off?.name || 'Chưa phân công'}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenReminderModal(item.assignment)}
                                className="px-2 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors shadow-2xs flex items-center gap-1"
                                title="Gửi email đôn đốc khẩn"
                              >
                                <Send className="w-3 h-3" />
                                Đôn đốc
                              </button>
                              <a
                                href={`tel:${item.unit?.so_dien_thoai}`}
                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title={`Gọi điện thoại ${item.unit?.so_dien_thoai}`}
                              >
                                <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Revision Required Watchlist */}
          {revisionList.length > 0 && (
            <div className="bg-white border border-orange-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-orange-50/60 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-600" />
                  <h3 className="text-xs font-bold text-orange-900 uppercase">
                    Báo Cáo Đang Yêu Cầu Chỉnh Sửa ({revisionList.length})
                  </h3>
                </div>
                <span className="text-[11px] text-orange-700">Chờ đơn vị nộp lại</span>
              </div>
              <div className="p-3 divide-y divide-slate-100 text-xs">
                {revisionList.map((item) => (
                  <div key={item.assignment.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {item.unit?.ten_don_vi} ({item.unit?.huyen_tp})
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        <span className="text-orange-700 font-medium">Lý do: </span>
                        {item.assignment.ly_do_chinh_sua || 'Chưa cung cấp lý do'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Hạn sửa lại: {item.assignment.han_chinh_sua?.slice(0, 10) || 'Hôm nay'}
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenReminderModal(item.assignment)}
                      className="px-2.5 py-1 text-[11px] font-medium text-orange-800 bg-orange-100 hover:bg-orange-200 rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      Nhắc nộp lại
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): District Summary & Officer Performance */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Progress by 8 Administrative Districts */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase">
                Tiến Độ Theo 8 Huyện / Thành Phố
              </h2>
              <span className="text-[11px] text-slate-500">Toàn tỉnh</span>
            </div>
            <div className="p-3 divide-y divide-slate-100 text-xs">
              {districtStats.map((d) => (
                <div key={d.district} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 truncate">
                        {d.district}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {d.done}/{d.total} ({d.rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        style={{ width: `${d.rate}%` }}
                        className={`h-full ${
                          d.rate >= 80
                            ? 'bg-emerald-500'
                            : d.rate >= 50
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 text-right font-mono text-[11px]">
                    {d.overdue > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold" title="Số đơn vị quá hạn">
                        {d.overdue} quá hạn
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officers Workload & Effectiveness */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase">
                  Cán Bộ Quản Lý Xã Phụ Trách
                </h3>
                <p className="text-[11px] text-slate-500">Hiệu quả đôn đốc theo từng cán bộ</p>
              </div>
              <button
                onClick={() => onNavigateToTab('units')}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Phân công
              </button>
            </div>
            <div className="p-3 divide-y divide-slate-100 text-xs">
              {officerStats.map((item) => (
                <div key={item.officer.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {item.officer.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Phụ trách: {item.assignedCount} xã/phường
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-slate-800">
                      {item.done}/{item.total} hoàn thành ({item.rate}%)
                    </div>
                    {item.overdue > 0 ? (
                      <div className="text-[10px] text-rose-600 font-semibold font-mono">
                        {item.overdue} xã quá hạn
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-600">
                        Không có xã quá hạn
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

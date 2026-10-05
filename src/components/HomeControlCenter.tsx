import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FolderKanban,
  FileSpreadsheet,
  BellRing,
  BarChart3,
  Settings,
  AlertOctagon,
  Clock,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Building2,
  Calendar,
} from 'lucide-react';

interface HomeControlCenterProps {
  onNavigate: (module: string, subView?: string, paramId?: string) => void;
  onOpenGoogleSheetSync?: () => void;
}

export const HomeControlCenter: React.FC<HomeControlCenterProps> = ({ onNavigate, onOpenGoogleSheetSync }) => {
  const { currentUser, reports, assignments, units, computeAssignmentStatus, googleScriptConfig } = useApp();

  // Evaluate all assignments
  let totalAssignmentsCount = 0;
  let overdueUnitsSet = new Set<string>();
  let approachingUnitsSet = new Set<string>();
  let revisingUnitsSet = new Set<string>();
  let completedUnitsCount = 0;

  // Track per report
  const reportOverdueMap: Record<string, number> = {};
  const reportPendingMap: Record<string, number> = {};
  const reportRevisingMap: Record<string, number> = {};

  reports.forEach((rep) => {
    reportOverdueMap[rep.id] = 0;
    reportPendingMap[rep.id] = 0;
    reportRevisingMap[rep.id] = 0;

    const repAssignments = assignments.filter((a) => a.report_id === rep.id);
    repAssignments.forEach((a) => {
      totalAssignmentsCount++;
      const { status } = computeAssignmentStatus(a, rep);
      if (status === 'QUA_HAN') {
        overdueUnitsSet.add(a.unit_id);
        reportOverdueMap[rep.id]++;
      } else if (status === 'SAP_DEN_HAN') {
        approachingUnitsSet.add(a.unit_id);
      } else if (status === 'YEU_CAU_SUA_DOI') {
        revisingUnitsSet.add(a.unit_id);
        reportRevisingMap[rep.id]++;
      } else if (status === 'HOAN_THANH' || status === 'DA_NHAN') {
        completedUnitsCount++;
      }

      if (status !== 'HOAN_THANH' && status !== 'DA_NHAN') {
        reportPendingMap[rep.id]++;
      }
    });
  });

  const completionRate = totalAssignmentsCount
    ? Math.round((completedUnitsCount / totalAssignmentsCount) * 100)
    : 0;

  const overdueCount = overdueUnitsSet.size;
  const approachingCount = approachingUnitsSet.size;
  const revisingCount = revisingUnitsSet.size;

  // Reports needing attention
  const reportsWithOverdue = reports.filter((r) => reportOverdueMap[r.id] > 0);
  const reportsWithRevising = reports.filter((r) => reportRevisingMap[r.id] > 0);
  const reportsWithPending = reports.filter((r) => reportPendingMap[r.id] > 0);

  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const isCommune = currentUser.role === 'XA_PHUONG';

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner: Control Center Welcome */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span>HỆ THỐNG eREPORT SỞ TÀI CHÍNH NINH BÌNH</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#0F2C59] font-bold">TRUNG TÂM ĐIỀU HÀNH BÁO CÁO</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Xin chào, {currentUser.ho_ten}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Hôm nay: <strong className="text-slate-700 capitalize">{todayFormatted}</strong></span>
              <span aria-hidden="true">·</span>
              <span>129 xã, phường, thị trấn toàn tỉnh</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenGoogleSheetSync && (
              <button
                onClick={onOpenGoogleSheetSync}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Đồng bộ dữ liệu trực tiếp với Google Sheet"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                <span>Đồng Bộ Google Sheet</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('view_reports', 'by_type')}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4" />
              <span>Xem Tiến Độ Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Highlights Section: Actionable Metrics (Section 17 in prompt) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Chỉ Số Hành Động Nhanh (Bấm để đi sâu vào chi tiết)
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Một màn hình trả lời một câu hỏi quản lý
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* 🔴 Overdue Card */}
          <button
            onClick={() => onNavigate('view_reports', 'summary_filter', 'QUA_HAN')}
            className="text-left bg-rose-50/70 hover:bg-rose-100/80 border-2 border-rose-300 hover:border-rose-400 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  Đơn vị quá hạn
                </span>
                <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">Xử lý ngay</span>
              </div>
              <div className="mt-2 text-3xl font-extrabold text-rose-700 font-mono tabular-nums">
                {overdueCount}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px] text-rose-700 font-semibold">
              <span>Chưa nộp · Đôn đốc</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 🟡 Approaching Deadline Card */}
          <button
            onClick={() => onNavigate('view_reports', 'summary_filter', 'SAP_DEN_HAN')}
            className="text-left bg-amber-50/70 hover:bg-amber-100/80 border-2 border-amber-300 hover:border-amber-400 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Sắp đến hạn
                </span>
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold">Lưu ý</span>
              </div>
              <div className="mt-2 text-3xl font-extrabold text-amber-700 font-mono tabular-nums">
                {approachingCount}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-700 font-semibold">
              <span>Còn ≤ 3 ngày · Nhắc nhở</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 🔵 Revising / Waiting Card */}
          <button
            onClick={() => onNavigate('view_reports', 'summary_filter', 'YEU_CAU_SUA_DOI')}
            className="text-left bg-orange-50/70 hover:bg-orange-100/80 border-2 border-orange-300 hover:border-orange-400 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-orange-800 uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Yêu cầu sửa đổi
                </span>
                <span className="px-2 py-0.5 bg-orange-600 text-white rounded text-[10px] font-bold">Chờ sửa</span>
              </div>
              <div className="mt-2 text-3xl font-extrabold text-orange-700 font-mono tabular-nums">
                {revisingCount}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-orange-200/60 flex items-center justify-between text-[11px] text-orange-700 font-semibold">
              <span>Sai biểu mẫu · Xem đơn vị</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 🟢 Completion Rate Card */}
          <button
            onClick={() => onNavigate('view_reports', 'summary')}
            className="text-left bg-emerald-50/70 hover:bg-emerald-100/80 border-2 border-emerald-300 hover:border-emerald-400 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Tỷ lệ hoàn thành
                </span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">Toàn tỉnh</span>
              </div>
              <div className="mt-2 text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {completionRate}%
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
              <span>{completedUnitsCount}/{totalAssignmentsCount} đã nộp</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. Main Navigation Hub: 4 Big Functional Folders (Section 16 in prompt) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Các Nhóm Chức Năng Chính (Cấu trúc thư mục dữ liệu)
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">Bấm nút để mở thư mục làm việc</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Folder 1: XEM BÁO CÁO (Trung tâm) */}
          <div
            onClick={() => onNavigate('view_reports')}
            className="bg-white border-2 border-blue-500 hover:border-blue-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ring-2 ring-blue-50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                🗂 XEM BÁO CÁO
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Theo dõi tiến độ báo cáo theo 3 tầng thư mục: Tổng hợp, Theo từng loại báo cáo, Theo từng xã/phường.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Trung tâm giám sát</span>
              <span className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 group-hover:scale-105 transition-all">
                <span>Mở thư mục</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Folder 2: QUẢN LÝ BÁO CÁO */}
          <div
            onClick={() => onNavigate('manage_reports')}
            className="bg-white border-2 border-indigo-400 hover:border-indigo-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ring-2 ring-indigo-50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                📋 QUẢN LÝ BÁO CÁO
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Ban hành chỉ tiêu mới, thiết lập hạn nộp, hòm thư nhận, chọn đơn vị áp dụng và biểu mẫu đính kèm.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{reports.length} chỉ tiêu</span>
              <span className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 group-hover:scale-105 transition-all">
                <span>Giao báo cáo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Folder 3: NHẮC NHỞ & ĐÔN ĐỐC */}
          <div
            onClick={() => onNavigate('reminders')}
            className="bg-white border-2 border-amber-400 hover:border-amber-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ring-2 ring-amber-50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                🔔 NHẮC NHỞ & ĐÔN ĐỐC
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Trung tâm đôn đốc khẩn cấp: gửi email hàng loạt cho các xã quá hạn, lưu lịch sử và số lần phê bình.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700">{overdueCount} quá hạn</span>
              <span className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 group-hover:scale-105 transition-all">
                <span>Đôn đốc khẩn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Folder 4: THỐNG KÊ & XẾP HẠNG */}
          <div
            onClick={() => onNavigate('statistics')}
            className="bg-white border-2 border-emerald-400 hover:border-emerald-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ring-2 ring-emerald-50"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-md">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                📈 THỐNG KÊ & TỔNG HỢP
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Báo cáo tổng hợp gửi Lãnh đạo Sở & UBND tỉnh, so sánh tiến độ theo 8 huyện/thành phố và xuất Excel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">8 huyện/TP</span>
              <span className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 group-hover:scale-105 transition-all">
                <span>Xem xếp hạng</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Action-Oriented Section: CẦN QUAN TÂM NGAY (Section 16 in prompt) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Báo Cáo Cần Quan Tâm Ngay (Bấm để xử lý trực tiếp)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Dành cho Lãnh đạo Sở và Cán bộ quản lý xã
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          {/* Card: Báo cáo có đơn vị chưa gửi */}
          <div
            onClick={() => onNavigate('view_reports', 'by_type')}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                {reportsWithPending.length} báo cáo có đơn vị chưa gửi
              </span>
              <span className="text-[11px] font-semibold text-blue-700">Xem →</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Bao gồm {reports.map((r) => r.ma_bao_cao).join(', ')}
            </p>
          </div>

          {/* Card: Báo cáo đang quá hạn */}
          <div
            onClick={() => onNavigate('view_reports', 'summary_filter', 'QUA_HAN')}
            className="p-3.5 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900">
                {reportsWithOverdue.length} báo cáo đang có đơn vị quá hạn
              </span>
              <span className="text-[11px] font-semibold text-rose-700">Xem ngay →</span>
            </div>
            <p className="text-[11px] text-rose-700 mt-1">
              {overdueCount} đơn vị chậm trễ nộp báo cáo theo quy định
            </p>
          </div>

          {/* Card: Báo cáo đang chờ chỉnh sửa */}
          <div
            onClick={() => onNavigate('view_reports', 'summary_filter', 'YEU_CAU_SUA_DOI')}
            className="p-3.5 bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-950">
                {reportsWithRevising.length} báo cáo đang chờ xã sửa lại
              </span>
              <span className="text-[11px] font-semibold text-orange-700">Kiểm tra →</span>
            </div>
            <p className="text-[11px] text-orange-800 mt-1">
              {revisingCount} đơn vị cần rà soát lại số liệu biểu mẫu
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavigationBreadcrumb, BreadcrumbItem } from './NavigationBreadcrumb';
import { StatusBadge } from './StatusBadge';
import {
  ReportAssignment,
  Report,
  Unit,
  ReportStatus,
  DistrictName,
} from '../types';
import {
  FolderKanban,
  FileSpreadsheet,
  Building2,
  Folder,
  ArrowRight,
  ChevronRight,
  Clock,
  AlertOctagon,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Send,
  Phone,
  Search,
  Filter,
  CheckSquare,
  Square,
  History,
  Inbox,
  User,
  Mail,
} from 'lucide-react';

interface FolderViewReportsProps {
  initialSubView?: string;
  initialParamId?: string;
  onGoHome: () => void;
  onOpenReminderModal: (assignment: ReportAssignment) => void;
  onOpenRevisionModal: (assignment: ReportAssignment) => void;
  onOpenHistoryModal: (assignment: ReportAssignment) => void;
}

type DrillStep =
  | 'root' // 3 main folders (Tổng hợp, Theo loại, Theo đơn vị)
  | 'summary' // Xem Tổng hợp
  | 'by_type' // Danh sách các loại báo cáo (folders)
  | 'report_detail' // Bên trong 1 loại báo cáo cụ thể
  | 'by_unit' // Danh sách 129 đơn vị (folders)
  | 'unit_detail'; // Hồ sơ báo cáo của 1 đơn vị cụ thể

export const FolderViewReports: React.FC<FolderViewReportsProps> = ({
  initialSubView = 'root',
  initialParamId,
  onGoHome,
  onOpenReminderModal,
  onOpenRevisionModal,
  onOpenHistoryModal,
}) => {
  const {
    currentUser,
    reports,
    units,
    assignments,
    officers,
    computeAssignmentStatus,
    confirmDepartmentReceived,
    approveCompleted,
    batchSendReminder,
  } = useApp();

  // Navigation state machine
  const [step, setStep] = useState<DrillStep>(() => {
    if (initialSubView === 'by_type') return 'by_type';
    if (initialSubView === 'by_unit') return 'by_unit';
    if (initialSubView === 'summary' || initialSubView === 'summary_filter') return 'summary';
    return 'root';
  });

  const [selectedReportId, setSelectedReportId] = useState<string>(
    initialParamId && reports.some((r) => r.id === initialParamId)
      ? initialParamId
      : reports[0]?.id || ''
  );

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    units[0]?.id || ''
  );

  // Filter in Report Detail (e.g. 'all', 'CHUA_GUI', 'QUA_HAN', 'SAP_DEN_HAN', 'DA_GUI', 'YEU_CAU_SUA_DOI', 'HOAN_THANH')
  const [reportStatusFilter, setReportStatusFilter] = useState<string>(
    initialSubView === 'summary_filter' && initialParamId ? initialParamId : 'all'
  );

  // Summary screen sub-filter
  const [summaryFilter, setSummaryFilter] = useState<string>(
    initialSubView === 'summary_filter' && initialParamId ? initialParamId : 'QUA_HAN'
  );

  // Units filter
  const [unitSearch, setUnitSearch] = useState('');
  const [unitDistrictFilter, setUnitDistrictFilter] = useState<string>('all');
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('all');

  // Checkbox selections for batch reminders
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>([]);

  // Selected report object
  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  // Helper: compute assignments for current report
  const currentReportAssignments = assignments
    .filter((a) => a.report_id === currentReport?.id)
    .map((a) => {
      const unit = units.find((u) => u.id === a.unit_id);
      const { status, overdueDays } = computeAssignmentStatus(a, currentReport);
      return { assignment: a, unit, status, overdueDays };
    });

  // Calculate statistics for each report (for Report Folder Cards)
  const reportFolderCards = reports.map((r) => {
    const rAssignments = assignments.filter((a) => a.report_id === r.id);
    const total = rAssignments.length;
    let submittedOrDone = 0;
    let overdueCount = 0;
    let revisingCount = 0;
    let approachingCount = 0;

    rAssignments.forEach((a) => {
      const { status } = computeAssignmentStatus(a, r);
      if (status === 'HOAN_THANH' || status === 'DA_NHAN' || status === 'DA_XAC_NHAN_GUI') {
        submittedOrDone++;
      }
      if (status === 'QUA_HAN') overdueCount++;
      if (status === 'YEU_CAU_SUA_DOI') revisingCount++;
      if (status === 'SAP_DEN_HAN') approachingCount++;
    });

    const pendingCount = total - submittedOrDone;

    return {
      report: r,
      total,
      submittedOrDone,
      pendingCount,
      overdueCount,
      revisingCount,
      approachingCount,
    };
  });

  // Calculate statistics for each unit (for Unit Folder Cards)
  const unitFolderCards = units.map((u) => {
    const uAssignments = assignments.filter((a) => a.unit_id === u.id);
    const total = uAssignments.length;
    let completedCount = 0;
    let overdueCount = 0;
    let revisingCount = 0;
    let pendingCount = 0;

    uAssignments.forEach((a) => {
      const rep = reports.find((r) => r.id === a.report_id);
      if (rep) {
        const { status } = computeAssignmentStatus(a, rep);
        if (status === 'HOAN_THANH') completedCount++;
        if (status === 'QUA_HAN') overdueCount++;
        if (status === 'YEU_CAU_SUA_DOI') revisingCount++;
        if (status !== 'HOAN_THANH' && status !== 'DA_NHAN') pendingCount++;
      }
    });

    return {
      unit: u,
      total,
      completedCount,
      overdueCount,
      revisingCount,
      pendingCount,
    };
  });

  // Breadcrumbs builder based on current drill depth
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Trang chủ', onClick: onGoHome },
    {
      label: 'Xem báo cáo',
      onClick: () => {
        setStep('root');
        setSelectedAssignmentIds([]);
      },
      active: step === 'root',
    },
  ];

  if (step === 'summary') {
    breadcrumbItems.push({
      label: 'Tổng hợp tình hình',
      active: true,
    });
  } else if (step === 'by_type') {
    breadcrumbItems.push({
      label: 'Theo loại báo cáo',
      active: true,
    });
  } else if (step === 'report_detail') {
    breadcrumbItems.push({
      label: 'Theo loại báo cáo',
      onClick: () => {
        setStep('by_type');
        setSelectedAssignmentIds([]);
      },
    });
    breadcrumbItems.push({
      label: currentReport?.ten_bao_cao || 'Chi tiết báo cáo',
      active: true,
    });
  } else if (step === 'by_unit') {
    breadcrumbItems.push({
      label: 'Theo từng đơn vị',
      active: true,
    });
  } else if (step === 'unit_detail') {
    breadcrumbItems.push({
      label: 'Theo từng đơn vị',
      onClick: () => {
        setStep('by_unit');
        setSelectedAssignmentIds([]);
      },
    });
    breadcrumbItems.push({
      label: currentUnit?.ten_don_vi || 'Chi tiết đơn vị',
      active: true,
    });
  }

  // Filtered rows inside report detail
  const filteredReportRows = currentReportAssignments.filter((item) => {
    if (reportStatusFilter === 'all') return true;
    if (reportStatusFilter === 'CHUA_GUI') {
      return (
        item.status === 'CHUA_DEN_HAN' ||
        item.status === 'SAP_DEN_HAN' ||
        item.status === 'QUA_HAN'
      );
    }
    if (reportStatusFilter === 'DA_GUI') {
      return (
        item.status === 'DA_XAC_NHAN_GUI' ||
        item.status === 'DA_NHAN' ||
        item.status === 'HOAN_THANH'
      );
    }
    return item.status === reportStatusFilter;
  });

  // Batch Selection Handler
  const handleToggleSelectAll = () => {
    if (selectedAssignmentIds.length === filteredReportRows.length) {
      setSelectedAssignmentIds([]);
    } else {
      setSelectedAssignmentIds(filteredReportRows.map((r) => r.assignment.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedAssignmentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRemindAllInFilter = () => {
    const ids = filteredReportRows.map((r) => r.assignment.id);
    if (ids.length === 0) return;
    const title = `[ĐÔN ĐỐC] Nhắc nộp báo cáo ${currentReport.ten_bao_cao}`;
    const content = `Đề nghị đơn vị khẩn trương hoàn tất báo cáo ${currentReport.ten_bao_cao} gửi Sở Tài chính Ninh Bình.`;
    batchSendReminder(ids, currentUser.ho_ten, title, content);
    alert(`Đã gửi thông báo đôn đốc thành công tới ${ids.length} đơn vị!`);
    setSelectedAssignmentIds([]);
  };

  const handleRemindSelected = () => {
    if (selectedAssignmentIds.length === 0) return;
    const title = `[ĐÔN ĐỐC] Nhắc nộp báo cáo ${currentReport.ten_bao_cao}`;
    const content = `Đề nghị đơn vị khẩn trương hoàn tất báo cáo ${currentReport.ten_bao_cao} gửi Sở Tài chính Ninh Bình.`;
    batchSendReminder(selectedAssignmentIds, currentUser.ho_ten, title, content);
    alert(`Đã gửi thông báo đôn đốc thành công tới ${selectedAssignmentIds.length} đơn vị đã chọn!`);
    setSelectedAssignmentIds([]);
  };

  return (
    <div className="space-y-4">
      
      {/* Interactive Breadcrumb Bar */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-1.5 shadow-2xs flex items-center justify-between">
        <NavigationBreadcrumb items={breadcrumbItems} />
        {step !== 'root' && (
          <button
            onClick={() => {
              if (step === 'report_detail') setStep('by_type');
              else if (step === 'unit_detail') setStep('by_unit');
              else setStep('root');
              setSelectedAssignmentIds([]);
            }}
            className="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm transition-all cursor-pointer flex items-center gap-1"
          >
            <span>← Quay lại thư mục trước</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* TẦNG 1: 3 THƯ MỤC LỚN (SECTION 3 TRONG PROMPT)                  */}
      {/* ============================================================== */}
      {step === 'root' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center max-w-2xl mx-auto shadow-2xs">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              📊 XEM BÁO CÁO TIẾN ĐỘ
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Chọn phương thức tiếp cận dữ liệu phù hợp với nhu cầu quản lý của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            
            {/* THƯ MỤC 1: XEM TỔNG HỢP */}
            <div
              onClick={() => setStep('summary')}
              className="bg-white border-2 border-slate-200 hover:border-blue-600 rounded-xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Folder className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  📈 XEM TỔNG HỢP
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Toàn cảnh tình hình báo cáo toàn tỉnh. Xem nhanh các con số KPI và bấm trực tiếp vào danh sách đơn vị quá hạn, chưa gửi hoặc đang sửa.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>Mở thư mục tổng hợp</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* THƯ MỤC 2: XEM THEO TỪNG LOẠI BÁO CÁO (TRỌNG TÂM NHẤT) */}
            <div
              onClick={() => setStep('by_type')}
              className="bg-white border-2 border-blue-500 hover:border-blue-700 rounded-xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ring-2 ring-blue-100"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 uppercase tracking-tight mb-1">
                  <span>★ Chức năng chính</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  📑 XEM THEO TỪNG LOẠI
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Xem theo từng báo cáo cụ thể (Thu NSNN, Chi NSNN, Đầu tư công...). Trả lời ngay câu hỏi: <strong>"Báo cáo này còn bao nhiêu đơn vị chưa gửi?"</strong>
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>{reports.length} thư mục báo cáo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* THƯ MỤC 3: XEM THEO TỪNG ĐƠN VỊ */}
            <div
              onClick={() => setStep('by_unit')}
              className="bg-white border-2 border-slate-200 hover:border-blue-600 rounded-xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  🏢 XEM THEO TỪNG ĐƠN VỊ
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Theo dõi tiến độ theo từng xã/phường trong số 129 đơn vị. Trả lời ngay: <strong>"Xã này còn những báo cáo nào chưa hoàn thành?"</strong>
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>129 xã / phường</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TẦNG 2 - MỤC 1: XEM TỔNG HỢP (SECTION 4 TRONG PROMPT)            */}
      {/* ============================================================== */}
      {step === 'summary' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900">
              📈 TỔNG QUAN TÌNH HÌNH BÁO CÁO TOÀN TỈNH
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cho Lãnh đạo biết nhanh tình hình chung tại thời điểm hiện tại. Bấm vào các nút bên dưới để xem danh sách chi tiết từng nhóm.
            </p>

            {/* Quick Action Navigation Buttons (Section 4 in prompt) */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setSummaryFilter('QUA_HAN')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  summaryFilter === 'QUA_HAN'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                🔴 XEM QUÁ HẠN ({assignments.filter((a) => a.trang_thai === 'QUA_HAN').length})
              </button>

              <button
                onClick={() => setSummaryFilter('SAP_DEN_HAN')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  summaryFilter === 'SAP_DEN_HAN'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                🟡 XEM SẮP ĐẾN HẠN ({assignments.filter((a) => a.trang_thai === 'SAP_DEN_HAN').length})
              </button>

              <button
                onClick={() => setSummaryFilter('YEU_CAU_SUA_DOI')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  summaryFilter === 'YEU_CAU_SUA_DOI'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                🟠 XEM ĐANG SỬA ({assignments.filter((a) => a.trang_thai === 'YEU_CAU_SUA_DOI').length})
              </button>

              <button
                onClick={() => setSummaryFilter('DA_GUI')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  summaryFilter === 'DA_GUI'
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                🔵 XEM ĐÃ GỬI / ĐÃ NHẬN
              </button>

              <button
                onClick={() => setSummaryFilter('HOAN_THANH')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  summaryFilter === 'HOAN_THANH'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                🟢 XEM ĐÃ HOÀN THÀNH
              </button>
            </div>
          </div>

          {/* Targeted List for Selected Summary Filter */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-800">
                Danh Sách Đơn Vị Trong Nhóm: {summaryFilter}
              </h3>
              <span className="text-[11px] text-slate-500">
                Chỉ hiển thị dữ liệu đang được người quản lý yêu cầu
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Xã / Phường</th>
                    <th className="py-2.5 px-3">Huyện / TP</th>
                    <th className="py-2.5 px-3">Báo Cáo</th>
                    <th className="py-2.5 px-3">Tình Trạng</th>
                    <th className="py-2.5 px-3 text-center">Đã Nhắc</th>
                    <th className="py-2.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments
                    .filter((a) => {
                      if (summaryFilter === 'DA_GUI') {
                        return a.trang_thai === 'DA_XAC_NHAN_GUI' || a.trang_thai === 'DA_NHAN';
                      }
                      return a.trang_thai === summaryFilter;
                    })
                    .slice(0, 30)
                    .map((a) => {
                      const unit = units.find((u) => u.id === a.unit_id);
                      const rep = reports.find((r) => r.id === a.report_id);
                      return (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {unit?.ten_don_vi}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{unit?.huyen_tp}</td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium max-w-xs truncate">
                            {rep?.ten_bao_cao}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusBadge status={a.trang_thai} overdueDays={a.trang_thai === 'QUA_HAN' ? 2 : 0} />
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {a.so_lan_nhac_nho || 0} lần
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => onOpenReminderModal(a)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-md shadow-2xs mr-1.5 transition-all cursor-pointer"
                            >
                              Đôn đốc
                            </button>
                            <button
                              onClick={() => onOpenHistoryModal(a)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-700 hover:bg-slate-800 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                            >
                              Lịch sử
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TẦNG 2 - MỤC 2: XEM THEO TỪNG LOẠI BÁO CÁO (SECTION 5 & 13)    */}
      {/* ============================================================== */}
      {step === 'by_type' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900">
              📑 CÁC THƯ MỤC LOẠI BÁO CÁO
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi thư mục báo cáo trả lời trực tiếp: <strong>"Báo cáo này hiện còn bao nhiêu đơn vị chưa gửi?"</strong>. Bấm vào thư mục để kiểm tra chi tiết.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportFolderCards.map(
              ({
                report,
                total,
                submittedOrDone,
                pendingCount,
                overdueCount,
                revisingCount,
                approachingCount,
              }) => {
                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setReportStatusFilter('CHUA_GUI'); // Default to most important: Unsubmitted!
                      setStep('report_detail');
                    }}
                    className="bg-white border-2 border-slate-200 hover:border-blue-600 rounded-xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Folder Icon & Code */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                          📁
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {report.ma_bao_cao}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {report.ten_bao_cao}
                      </h3>

                      <div className="mt-3 text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Hạn: {report.gio_han} ngày {report.han_gui}
                      </div>

                      {/* Primary metric: Tiến độ */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-semibold text-slate-700">
                            Tiến độ thực hiện:
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {submittedOrDone} / {total} đơn vị
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                          <div
                            style={{ width: `${(submittedOrDone / total) * 100}%` }}
                            className="bg-emerald-500 h-full"
                          />
                        </div>
                      </div>

                      {/* Highlight badges (Section 13 in prompt) */}
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-semibold text-rose-700 bg-rose-50/70 px-2.5 py-1 rounded">
                          <span>🔴 Còn chưa gửi:</span>
                          <span className="font-mono">{pendingCount} đơn vị</span>
                        </div>

                        {overdueCount > 0 && (
                          <div className="flex items-center justify-between font-medium text-rose-800 px-2.5 py-0.5 text-[11px]">
                            <span>Quá hạn:</span>
                            <span className="font-mono font-bold">{overdueCount} đơn vị</span>
                          </div>
                        )}

                        {revisingCount > 0 && (
                          <div className="flex items-center justify-between font-medium text-orange-800 px-2.5 py-0.5 text-[11px]">
                            <span>Đang yêu cầu sửa:</span>
                            <span className="font-mono font-bold">{revisingCount} đơn vị</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-900">
                      <span>MỞ THƯ MỤC CHI TIẾT</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TẦNG 3 - CHI TIẾT MỘT LOẠI BÁO CÁO (SECTIONS 6, 7, 8)           */}
      {/* ============================================================== */}
      {step === 'report_detail' && currentReport && (
        <div className="space-y-4">
          
          {/* Report Overview Header (Section 6) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  THƯ MỤC BÁO CÁO CHUYÊN ĐỀ
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentReport.ten_bao_cao}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
                  <span>Hạn nộp: <strong className="text-rose-700 font-mono">{currentReport.gio_han} – {currentReport.han_gui}</strong></span>
                  <span>Email nhận: <strong className="text-blue-700 font-mono">{currentReport.email_nhan_bao_cao}</strong></span>
                  <span>Người giao: <strong className="text-slate-800">{currentReport.nguoi_tao_ten}</strong></span>
                </div>
              </div>

              {/* Progress Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right shrink-0">
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Tiến độ tiếp nhận</div>
                <div className="text-xl font-mono font-bold text-slate-900">
                  {currentReportAssignments.filter((i) => i.status === 'HOAN_THANH' || i.status === 'DA_NHAN' || i.status === 'DA_XAC_NHAN_GUI').length} / {currentReportAssignments.length} đơn vị
                </div>
              </div>
            </div>

            {/* QUICK FILTER BUTTONS (SECTION 7 IN PROMPT) */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1">Bộ lọc:</span>

              {/* [ TẤT CẢ 129 ] */}
              <button
                onClick={() => {
                  setReportStatusFilter('all');
                  setSelectedAssignmentIds([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  reportStatusFilter === 'all'
                    ? 'bg-[#0F2C59] text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                TẤT CẢ ({currentReportAssignments.length})
              </button>

              {/* [ CHƯA GỬI ] */}
              <button
                onClick={() => {
                  setReportStatusFilter('CHUA_GUI');
                  setSelectedAssignmentIds([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  reportStatusFilter === 'CHUA_GUI'
                    ? 'bg-rose-700 text-white shadow-2xs font-bold'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-bold'
                }`}
              >
                🔴 CHƯA GỬI ({currentReportAssignments.filter((i) => i.status === 'CHUA_DEN_HAN' || i.status === 'SAP_DEN_HAN' || i.status === 'QUA_HAN').length})
              </button>

              {/* [ QUÁ HẠN ] */}
              <button
                onClick={() => {
                  setReportStatusFilter('QUA_HAN');
                  setSelectedAssignmentIds([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  reportStatusFilter === 'QUA_HAN'
                    ? 'bg-rose-800 text-white shadow-2xs font-bold'
                    : 'bg-rose-100 text-rose-900 hover:bg-rose-200 font-bold'
                }`}
              >
                QUÁ HẠN ({currentReportAssignments.filter((i) => i.status === 'QUA_HAN').length})
              </button>

              {/* [ SẮP ĐẾN HẠN ] */}
              <button
                onClick={() => {
                  setReportStatusFilter('SAP_DEN_HAN');
                  setSelectedAssignmentIds([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  reportStatusFilter === 'SAP_DEN_HAN'
                    ? 'bg-amber-600 text-white shadow-2xs font-bold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                SẮP ĐẾN HẠN ({currentReportAssignments.filter((i) => i.status === 'SAP_DEN_HAN').length})
              </button>

              {/* [ ĐÃ GỬI ] */}
              <button
                onClick={() => {
                  setReportStatusFilter('DA_GUI');
                  setSelectedAssignmentIds([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  reportStatusFilter === 'DA_GUI'
                    ? 'bg-sky-700 text-white shadow-2xs font-bold'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                ĐÃ GỬI ({currentReportAssignments.filter((i) => i.status === 'DA_XAC_NHAN_GUI' || i.status === 'DA_NHAN' || i.status === 'HOAN_THANH').length})
              </button>

              {/* [ ĐANG SỬA ] */}
              <button
                onClick={() => {
                  setReportStatusFilter('YEU_CAU_SUA_DOI');
                  setSelectedAssignmentIds([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  reportStatusFilter === 'YEU_CAU_SUA_DOI'
                    ? 'bg-orange-600 text-white shadow-2xs font-bold'
                    : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                ĐANG SỬA ({currentReportAssignments.filter((i) => i.status === 'YEU_CAU_SUA_DOI').length})
              </button>

              {/* [ HOÀN THÀNH ] */}
              <button
                onClick={() => {
                  setReportStatusFilter('HOAN_THANH');
                  setSelectedAssignmentIds([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  reportStatusFilter === 'HOAN_THANH'
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                HOÀN THÀNH ({currentReportAssignments.filter((i) => i.status === 'HOAN_THANH').length})
              </button>
            </div>
          </div>

          {/* FOCUSED DATA TABLE (SECTION 8 IN PROMPT) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase">
                  DANH SÁCH {filteredReportRows.length} ĐƠN VỊ ({reportStatusFilter})
                </span>
                <span className="text-[11px] text-slate-500 ml-2">
                  (Người quản lý không bị ngợp bởi 129 dòng dữ liệu)
                </span>
              </div>

              {/* Batch Action Buttons (Section 8) */}
              <div className="flex items-center gap-2">
                {selectedAssignmentIds.length > 0 && (
                  <button
                    onClick={handleRemindSelected}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    NHẮC ĐÃ CHỌN ({selectedAssignmentIds.length})
                  </button>
                )}

                {filteredReportRows.length > 0 && (
                  <button
                    onClick={handleRemindAllInFilter}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    NHẮC TẤT CẢ ({filteredReportRows.length})
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredReportRows.length > 0 &&
                          selectedAssignmentIds.length === filteredReportRows.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-3">Đơn Vị</th>
                    <th className="py-2.5 px-3">Huyện / TP</th>
                    <th className="py-2.5 px-3">Hạn Gửi</th>
                    <th className="py-2.5 px-3">Tình Trạng</th>
                    <th className="py-2.5 px-3 text-center">Quá Hạn</th>
                    <th className="py-2.5 px-3 text-center">Đã Nhắc</th>
                    <th className="py-2.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReportRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Không có đơn vị nào trong nhóm này.
                      </td>
                    </tr>
                  ) : (
                    filteredReportRows.map(({ assignment, unit, status, overdueDays }) => {
                      const isChecked = selectedAssignmentIds.includes(assignment.id);

                      return (
                        <tr
                          key={assignment.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            status === 'QUA_HAN' ? 'bg-rose-50/20' : ''
                          } ${isChecked ? 'bg-blue-50/40' : ''}`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectRow(assignment.id)}
                              className="rounded border-slate-300 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            <div>{unit?.ten_don_vi}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {unit?.nguoi_phu_trach} ({unit?.so_dien_thoai})
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {unit?.huyen_tp}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                            {currentReport.han_gui}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge status={status} overdueDays={overdueDays} />
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700 whitespace-nowrap">
                            {overdueDays > 0 ? `+${overdueDays} ngày` : '0 ngày'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {assignment.so_lan_nhac_nho || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenReminderModal(assignment)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                              >
                                Nhắc
                              </button>
                              <a
                                href={`tel:${unit?.so_dien_thoai}`}
                                className="p-1 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded"
                                title="Gọi điện"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => onOpenHistoryModal(assignment)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                              >
                                Chi tiết
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TẦNG 2 - MỤC 3: XEM THEO TỪNG ĐƠN VỊ (SECTIONS 9 & 10)          */}
      {/* ============================================================== */}
      {step === 'by_unit' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900">
              🏢 XÃ / PHƯỜNG / THỊ TRẤN NINH BÌNH (129 ĐƠN VỊ)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi thư mục đơn vị theo dõi tiến độ nộp của chính xã/phường đó. Bấm vào thư mục để xem toàn bộ báo cáo đã giao.
            </p>

            {/* Search and Filters (Section 9 in prompt) */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="🔍 Tìm xã/phường theo tên, người phụ trách..."
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* District Filter */}
                <select
                  value={unitDistrictFilter}
                  onChange={(e) => setUnitDistrictFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
                >
                  <option value="all">Tất cả 8 Huyện / TP</option>
                  <option value="Thành phố Ninh Bình">Thành phố Ninh Bình</option>
                  <option value="Thành phố Tam Điệp">Thành phố Tam Điệp</option>
                  <option value="Huyện Hoa Lư">Huyện Hoa Lư</option>
                  <option value="Huyện Gia Viễn">Huyện Gia Viễn</option>
                  <option value="Huyện Nho Quan">Huyện Nho Quan</option>
                  <option value="Huyện Yên Khánh">Huyện Yên Khánh</option>
                  <option value="Huyện Kim Sơn">Huyện Kim Sơn</option>
                  <option value="Huyện Yên Mô">Huyện Yên Mô</option>
                </select>

                {/* Filter condition (Section 9) */}
                <select
                  value={unitStatusFilter}
                  onChange={(e) => setUnitStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700"
                >
                  <option value="all">Tất cả đơn vị</option>
                  <option value="has_overdue">Có báo cáo quá hạn</option>
                  <option value="incomplete">Chưa hoàn thành đủ</option>
                  <option value="has_revision">Có báo cáo đang sửa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Unit Folder Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {unitFolderCards
              .filter(({ unit, overdueCount, pendingCount, revisingCount }) => {
                if (unitDistrictFilter !== 'all' && unit.huyen_tp !== unitDistrictFilter) return false;
                if (unitStatusFilter === 'has_overdue' && overdueCount === 0) return false;
                if (unitStatusFilter === 'incomplete' && pendingCount === 0) return false;
                if (unitStatusFilter === 'has_revision' && revisingCount === 0) return false;
                if (unitSearch.trim()) {
                  const q = unitSearch.toLowerCase();
                  return (
                    unit.ten_don_vi.toLowerCase().includes(q) ||
                    unit.nguoi_phu_trach.toLowerCase().includes(q)
                  );
                }
                return true;
              })
              .map(({ unit, total, completedCount, overdueCount, revisingCount, pendingCount }) => {
                return (
                  <div
                    key={unit.id}
                    onClick={() => {
                      setSelectedUnitId(unit.id);
                      setStep('unit_detail');
                    }}
                    className={`bg-white border rounded-xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                      overdueCount > 0
                        ? 'border-rose-300 bg-rose-50/20'
                        : revisingCount > 0
                        ? 'border-orange-300 bg-orange-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">📁</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {unit.huyen_tp}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        {unit.ten_don_vi}
                      </h4>

                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {unit.nguoi_phu_trach} ({unit.chuc_vu})
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">{total} báo cáo</span>
                        <span className="font-bold text-emerald-700">
                          {completedCount} hoàn thành
                        </span>
                      </div>

                      {overdueCount > 0 && (
                        <div className="mt-1 text-[11px] font-semibold text-rose-700">
                          🔴 {overdueCount} báo cáo quá hạn
                        </div>
                      )}

                      {revisingCount > 0 && (
                        <div className="mt-0.5 text-[11px] font-semibold text-orange-700">
                          🟠 {revisingCount} đang chỉnh sửa
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-700">
                      <span>Mở hồ sơ đơn vị</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TẦNG 3 - CHI TIẾT MỘT ĐƠN VỊ (SECTION 10 TRONG PROMPT)          */}
      {/* ============================================================== */}
      {step === 'unit_detail' && currentUnit && (
        <div className="space-y-4">
          
          {/* Commune Dossier Header (Section 10) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                  <span>HỒ SƠ THEO DÕI ĐƠN VỊ</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentUnit.huyen_tp}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  UBND {currentUnit.ten_don_vi}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
                  <span>Người phụ trách: <strong className="text-slate-800">{currentUnit.nguoi_phu_trach} ({currentUnit.chuc_vu})</strong></span>
                  <span>Điện thoại: <strong className="text-slate-800 font-mono">{currentUnit.so_dien_thoai}</strong></span>
                  <span>Email: <strong className="text-blue-700 font-mono">{currentUnit.email}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${currentUnit.so_dien_thoai}`}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Gọi điện thoại
                </a>
              </div>
            </div>

            {/* Section 10 KPI Strip for this unit */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div className="text-slate-500">Tổng báo cáo:</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  {assignments.filter((a) => a.unit_id === currentUnit.id).length}
                </div>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <div className="text-emerald-800 font-medium">Hoàn thành:</div>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                  {assignments.filter((a) => a.unit_id === currentUnit.id && a.trang_thai === 'HOAN_THANH').length}
                </div>
              </div>

              <div className="bg-sky-50 p-2.5 rounded border border-sky-200">
                <div className="text-sky-800 font-medium">Đã gửi email:</div>
                <div className="text-xl font-bold font-mono text-sky-700 mt-0.5">
                  {assignments.filter((a) => a.unit_id === currentUnit.id && (a.trang_thai === 'DA_XAC_NHAN_GUI' || a.trang_thai === 'DA_NHAN')).length}
                </div>
              </div>

              <div className="bg-rose-50 p-2.5 rounded border border-rose-200">
                <div className="text-rose-800 font-medium">Quá hạn:</div>
                <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                  {assignments.filter((a) => a.unit_id === currentUnit.id && a.trang_thai === 'QUA_HAN').length}
                </div>
              </div>

              <div className="bg-orange-50 p-2.5 rounded border border-orange-200">
                <div className="text-orange-800 font-medium">Đang sửa:</div>
                <div className="text-xl font-bold font-mono text-orange-700 mt-0.5">
                  {assignments.filter((a) => a.unit_id === currentUnit.id && a.trang_thai === 'YEU_CAU_SUA_DOI').length}
                </div>
              </div>
            </div>
          </div>

          {/* Table of Reports for This Commune */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-800">
              Danh Sách Báo Cáo Của {currentUnit.ten_don_vi}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Báo Cáo</th>
                    <th className="py-2.5 px-3">Hạn Gửi</th>
                    <th className="py-2.5 px-3">Trạng Thái</th>
                    <th className="py-2.5 px-3 text-center">Số Lần Nhắc</th>
                    <th className="py-2.5 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments
                    .filter((a) => a.unit_id === currentUnit.id)
                    .map((a) => {
                      const rep = reports.find((r) => r.id === a.report_id);
                      if (!rep) return null;
                      const { status, overdueDays } = computeAssignmentStatus(a, rep);

                      return (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{rep.ten_bao_cao}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{rep.ma_bao_cao}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                            {rep.gio_han} {rep.han_gui}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <StatusBadge status={status} overdueDays={overdueDays} />
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {a.so_lan_nhac_nho || 0} lần
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {(status === 'QUA_HAN' || status === 'SAP_DEN_HAN' || status === 'CHUA_DEN_HAN') && (
                                <button
                                  onClick={() => onOpenReminderModal(a)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                                >
                                  Nhắc nhở
                                </button>
                              )}

                              {status === 'DA_XAC_NHAN_GUI' && (
                                <button
                                  onClick={() => confirmDepartmentReceived(a.id, currentUser.ho_ten)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                                >
                                  Đã nhận mail
                                </button>
                              )}

                              {(status === 'DA_NHAN' || status === 'DA_XAC_NHAN_GUI') && (
                                <button
                                  onClick={() => onOpenRevisionModal(a)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                                >
                                  Yêu cầu sửa
                                </button>
                              )}

                              {status === 'DA_NHAN' && (
                                <button
                                  onClick={() => approveCompleted(a.id, currentUser.ho_ten)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                                >
                                  Duyệt xong
                                </button>
                              )}

                              <button
                                onClick={() => onOpenHistoryModal(a)}
                                className="px-2 py-1 text-[11px] font-bold text-white bg-slate-700 hover:bg-slate-800 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                                title="Xem lịch sử gửi"
                              >
                                Lịch sử
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ReportAssignment,
  ReportStatus,
  DistrictName,
  ReportPriority,
  Report,
} from '../types';
import { StatusBadge } from './StatusBadge';
import {
  Plus,
  Search,
  Filter,
  Send,
  CheckCircle2,
  Inbox,
  RotateCcw,
  History,
  FileSpreadsheet,
  Trash2,
  Calendar,
  AlertTriangle,
  Mail,
  Phone,
  CheckSquare,
  Square,
} from 'lucide-react';

interface ReportManagementProps {
  onOpenReminderModal: (assignment: ReportAssignment) => void;
  onOpenRevisionModal: (assignment: ReportAssignment) => void;
  onOpenHistoryModal: (assignment: ReportAssignment) => void;
}

export const ReportManagement: React.FC<ReportManagementProps> = ({
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
    createReport,
    deleteReport,
    confirmDepartmentReceived,
    approveCompleted,
    batchSendReminder,
    computeAssignmentStatus,
    settings,
  } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [officerFilter, setOfficerFilter] = useState<string>(
    currentUser.role === 'QUAN_LY_XA' ? currentUser.username : 'all'
  );
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<string[]>(
    []
  );

  // New report modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportCode, setNewReportCode] = useState(
    `BC-NS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [newReportContent, setNewReportContent] = useState('');
  const [newReportDueDate, setNewReportDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [newReportDueTime, setNewReportDueTime] = useState('17:00');
  const [newReportTarget, setNewReportTarget] = useState<'tat_ca' | 'theo_huyen' | 'tuy_chon'>('tat_ca');
  const [newReportDistricts, setNewReportDistricts] = useState<DistrictName[]>([]);
  const [newReportPriority, setNewReportPriority] = useState<ReportPriority>('BINH_THUONG');
  const [newReportEmail, setNewReportEmail] = useState(settings.email_so_mac_dinh);
  const [newReportNotes, setNewReportNotes] = useState('');

  const currentReport =
    reports.find((r) => r.id === selectedReportId) || reports[0];

  // If no report exists
  if (!currentReport) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Chưa có báo cáo nào</h3>
        <p className="text-xs text-slate-500 mb-4">
          Hãy tạo nhiệm vụ báo cáo mới để bắt đầu theo dõi tiến độ gửi của các xã.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F2C59] hover:bg-[#0c2244] rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Tạo báo cáo mới
        </button>
      </div>
    );
  }

  // Get all assignments for current report
  const rawReportAssignments = assignments.filter(
    (a) => a.report_id === currentReport.id
  );

  // If role is QUAN_LY_XA, filter to units assigned to this officer unless viewing all
  const isOfficer = currentUser.role === 'QUAN_LY_XA';
  const assignedUnitsForOfficer = isOfficer
    ? units.filter((u) => u.quan_ly_xa_id === currentUser.username).map((u) => u.id)
    : [];

  // Evaluate dynamic status
  const evaluatedRows = rawReportAssignments.map((a) => {
    const unit = units.find((u) => u.id === a.unit_id);
    const { status, overdueDays } = computeAssignmentStatus(a, currentReport);
    return {
      assignment: a,
      unit,
      status,
      overdueDays,
    };
  });

  // Filter rows
  const filteredRows = evaluatedRows.filter(({ assignment, unit, status }) => {
    if (!unit) return false;

    // Strict role restriction for Quản lý xã if assigned
    if (isOfficer && assignedUnitsForOfficer.length > 0) {
      if (!assignedUnitsForOfficer.includes(unit.id)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = unit.ten_don_vi.toLowerCase().includes(q);
      const matchCode = unit.ma_don_vi.toLowerCase().includes(q);
      const matchPerson = unit.nguoi_phu_trach.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchPerson) return false;
    }

    if (districtFilter !== 'all' && unit.huyen_tp !== districtFilter) {
      return false;
    }

    if (statusFilter !== 'all' && status !== statusFilter) {
      return false;
    }

    if (officerFilter !== 'all' && unit.quan_ly_xa_id !== officerFilter) {
      return false;
    }

    return true;
  });

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedAssignmentIds.length === filteredRows.length) {
      setSelectedAssignmentIds([]);
    } else {
      setSelectedAssignmentIds(filteredRows.map((r) => r.assignment.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedAssignmentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Batch Remind Action
  const handleBatchRemind = () => {
    if (selectedAssignmentIds.length === 0) return;
    const title = `[ĐÔN ĐỐC] Nhắc nộp báo cáo ${currentReport.ten_bao_cao}`;
    const content = `Đề nghị đơn vị khẩn trương nộp báo cáo ${currentReport.ten_bao_cao} trước thời hạn theo quy định.`;
    batchSendReminder(selectedAssignmentIds, currentUser.ho_ten, title, content);
    alert(`Đã gửi thông báo đôn đốc thành công tới ${selectedAssignmentIds.length} đơn vị.`);
    setSelectedAssignmentIds([]);
  };

  // Create report submission
  const handleCreateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReportTitle.trim()) {
      alert('Vui lòng nhập tên báo cáo');
      return;
    }

    createReport({
      ma_bao_cao: newReportCode,
      ten_bao_cao: newReportTitle,
      noi_dung: newReportContent || 'Yêu cầu lập và gửi báo cáo theo đúng biểu mẫu quy định.',
      ngay_giao: new Date().toISOString().slice(0, 10),
      han_gui: newReportDueDate,
      gio_han: newReportDueTime,
      doi_tuong_nhan: newReportTarget,
      danh_sach_huyen: newReportTarget === 'theo_huyen' ? newReportDistricts : undefined,
      email_nhan_bao_cao: newReportEmail || settings.email_so_mac_dinh,
      nguoi_tao_id: currentUser.id,
      nguoi_tao_ten: currentUser.ho_ten,
      muc_do_uu_tien: newReportPriority,
      ghi_chu: newReportNotes,
    });

    setShowCreateModal(false);
    // Reset form
    setNewReportTitle('');
    setNewReportContent('');
    setNewReportNotes('');
  };

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

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Report switcher tab-like pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Chọn báo cáo:
            </span>
            <div className="flex items-center gap-1.5">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedReportId(r.id);
                    setSelectedAssignmentIds([]);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    selectedReportId === r.id
                      ? 'bg-[#0F2C59] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r.ma_bao_cao}
                </button>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {currentUser.role !== 'XA_PHUONG' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-md whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Giao Báo Cáo Mới
              </button>
            )}
          </div>
        </div>

        {/* Selected Report details info */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-900">{currentReport.ten_bao_cao}</span>
            <span className="text-slate-400 mx-2">·</span>
            <span>Hạn nộp: <strong className="text-rose-700 font-mono">{currentReport.gio_han} {currentReport.han_gui}</strong></span>
            <span className="text-slate-400 mx-2">·</span>
            <span>Email nhận: <strong className="text-blue-700 font-mono">{currentReport.email_nhan_bao_cao}</strong></span>
          </div>

          {currentUser.role === 'ADMIN' && reports.length > 1 && (
            <button
              onClick={() => {
                if (confirm(`Xác nhận xóa báo cáo: ${currentReport.ten_bao_cao}?`)) {
                  deleteReport(currentReport.id);
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa báo cáo
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên xã, phường, mã đơn vị, người phụ trách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* District filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả 8 Huyện/TP</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="QUA_HAN">Quá hạn (Chậm trễ)</option>
              <option value="SAP_DEN_HAN">Sắp đến hạn</option>
              <option value="DA_XAC_NHAN_GUI">Đơn vị đã gửi email</option>
              <option value="DA_NHAN">Sở đã nhận</option>
              <option value="YEU_CAU_SUA_DOI">Yêu cầu sửa đổi</option>
              <option value="HOAN_THANH">Hoàn thành</option>
              <option value="CHUA_DEN_HAN">Chưa đến hạn</option>
            </select>

            {/* Officer filter */}
            {!isOfficer && (
              <select
                value={officerFilter}
                onChange={(e) => setOfficerFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="all">Tất cả cán bộ phụ trách</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>
                    CB: {o.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Batch Selection Strip */}
        {selectedAssignmentIds.length > 0 && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs animate-in fade-in duration-150">
            <span className="font-semibold text-blue-900">
              Đã chọn {selectedAssignmentIds.length} đơn vị
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchRemind}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-700 text-white font-medium rounded hover:bg-blue-800 transition-colors shadow-2xs"
              >
                <Send className="w-3 h-3" />
                Gửi đôn đốc hàng loạt
              </button>
              <button
                onClick={() => setSelectedAssignmentIds([])}
                className="text-slate-600 hover:text-slate-900 px-2 py-1"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredRows.length > 0 &&
                      selectedAssignmentIds.length === filteredRows.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Mã & Tên Đơn Vị</th>
                <th className="py-3 px-3">Huyện / TP</th>
                <th className="py-3 px-3">Người Phụ Trách Xã</th>
                <th className="py-3 px-3">Cán Bộ Phụ Trách</th>
                <th className="py-3 px-3">Trạng Thái Tiến Độ</th>
                <th className="py-3 px-3 text-center">Đôn Đốc</th>
                <th className="py-3 px-3 text-right">Thao Tác Nghiệp Vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy đơn vị nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ assignment, unit, status, overdueDays }) => {
                  const off = officers.find((o) => o.id === unit?.quan_ly_xa_id);
                  const isChecked = selectedAssignmentIds.includes(assignment.id);

                  return (
                    <tr
                      key={assignment.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        status === 'QUA_HAN' ? 'bg-rose-50/20' : ''
                      } ${isChecked ? 'bg-blue-50/40' : ''}`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(assignment.id)}
                          className="rounded border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          {unit?.ten_don_vi}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {unit?.ma_don_vi} · {unit?.email}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {unit?.huyen_tp}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">
                          {unit?.nguoi_phu_trach}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Phone className="w-2.5 h-2.5 text-slate-400" />
                          {unit?.so_dien_thoai}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                        {off?.name || 'Chưa gán'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={status} overdueDays={overdueDays} />
                        {assignment.ngay_xac_nhan_gui && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Gửi: {new Date(assignment.ngay_xac_nhan_gui).toLocaleDateString('vi-VN')} {new Date(assignment.ngay_xac_nhan_gui).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`font-mono px-1.5 py-0.5 rounded text-[11px] ${
                            assignment.so_lan_nhac_nho > 0
                              ? 'bg-amber-100 text-amber-800 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {assignment.so_lan_nhac_nho || 0} lần
                        </span>
                      </td>

                      {/* Operations */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Reminder button */}
                          {(status === 'QUA_HAN' ||
                            status === 'SAP_DEN_HAN' ||
                            status === 'CHUA_DEN_HAN' ||
                            status === 'YEU_CAU_SUA_DOI') && (
                            <button
                              onClick={() => onOpenReminderModal(assignment)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                              title="Gửi email nhắc nhở đôn đốc"
                            >
                              <Send className="w-3 h-3 inline mr-1" />
                              Đôn đốc
                            </button>
                          )}

                          {/* Confirm received if unit reported sent */}
                          {status === 'DA_XAC_NHAN_GUI' && (
                            <button
                              onClick={() =>
                                confirmDepartmentReceived(
                                  assignment.id,
                                  currentUser.ho_ten
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                              title="Xác nhận Sở đã nhận được file báo cáo qua email"
                            >
                              <Inbox className="w-3 h-3 inline mr-1" />
                              Đã nhận mail
                            </button>
                          )}

                          {/* Request revision */}
                          {(status === 'DA_NHAN' ||
                            status === 'DA_XAC_NHAN_GUI') && (
                            <button
                              onClick={() => onOpenRevisionModal(assignment)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                              title="Yêu cầu đơn vị chỉnh sửa lại số liệu/biểu mẫu"
                            >
                              <RotateCcw className="w-3 h-3 inline mr-1" />
                              Sửa đổi
                            </button>
                          )}

                          {/* Approve completed */}
                          {(status === 'DA_NHAN' ||
                            status === 'YEU_CAU_SUA_DOI') && (
                            <button
                              onClick={() =>
                                approveCompleted(
                                  assignment.id,
                                  currentUser.ho_ten
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                              title="Duyệt hoàn thành báo cáo"
                            >
                              <CheckCircle2 className="w-3 h-3 inline mr-1" />
                              Duyệt xong
                            </button>
                          )}

                          {/* History log modal button */}
                          <button
                            onClick={() => onOpenHistoryModal(assignment)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-700 hover:bg-slate-800 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                            title="Xem chi tiết lịch sử gửi và nhắc nhở"
                          >
                            <History className="w-3.5 h-3.5 inline mr-1" />
                            Lịch sử
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

        {/* Footer row summary */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Hiển thị <strong>{filteredRows.length}</strong> / {rawReportAssignments.length} đơn vị
          </div>
          <div className="flex items-center gap-3">
            <span>Sở Tài Chính Ninh Bình · Hệ thống đôn đốc eReport</span>
          </div>
        </div>
      </div>

      {/* CREATE REPORT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Giao Nhiệm Vụ Báo Cáo Mới
                </h3>
                <p className="text-xs text-slate-500">
                  Tạo chỉ tiêu và phân công cho các xã, phường, thị trấn thực hiện
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReportSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tên báo cáo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Báo cáo quyết toán thu chi ngân sách năm 2026..."
                    value={newReportTitle}
                    onChange={(e) => setNewReportTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã số báo cáo
                  </label>
                  <input
                    type="text"
                    required
                    value={newReportCode}
                    onChange={(e) => setNewReportCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nội dung & Yêu cầu thực hiện
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi rõ biểu mẫu cần lập (ví dụ Mẫu số 01/NS-Xã), căn cứ pháp lý, phụ lục kèm theo..."
                  value={newReportContent}
                  onChange={(e) => setNewReportContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hạn gửi (Ngày) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newReportDueDate}
                    onChange={(e) => setNewReportDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Giờ hạn chót
                  </label>
                  <input
                    type="time"
                    required
                    value={newReportDueTime}
                    onChange={(e) => setNewReportDueTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={newReportPriority}
                    onChange={(e) => setNewReportPriority(e.target.value as ReportPriority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="BINH_THUONG">Bình thường</option>
                    <option value="KHAN">Khẩn</option>
                    <option value="HOA_TOC">Hỏa tốc</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hòm thư email nhận báo cáo
                  </label>
                  <input
                    type="email"
                    required
                    value={newReportEmail}
                    onChange={(e) => setNewReportEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Đối tượng thực hiện
                  </label>
                  <select
                    value={newReportTarget}
                    onChange={(e) => setNewReportTarget(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="tat_ca">Toàn bộ 129 Xã, Phường toàn tỉnh</option>
                    <option value="theo_huyen">Theo nhóm Huyện / Thành phố</option>
                  </select>
                </div>
              </div>

              {newReportTarget === 'theo_huyen' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-semibold text-slate-700 mb-2">Chọn huyện thực hiện:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {districts.map((d) => (
                      <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newReportDistricts.includes(d)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewReportDistricts((prev) => [...prev, d]);
                            } else {
                              setNewReportDistricts((prev) => prev.filter((item) => item !== d));
                            }
                          }}
                          className="rounded border-slate-300"
                        />
                        <span className="text-[11px] truncate">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú thêm cho đơn vị
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Gửi kèm file PDF scan có đóng dấu và chữ ký số..."
                  value={newReportNotes}
                  onChange={(e) => setNewReportNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  Ban Hành Báo Cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

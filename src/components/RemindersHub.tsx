import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReportAssignment } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  BellRing,
  Send,
  Phone,
  Mail,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Filter,
} from 'lucide-react';

interface RemindersHubProps {
  onOpenReminderModal: (assignment: ReportAssignment) => void;
  onOpenHistoryModal: (assignment: ReportAssignment) => void;
}

export const RemindersHub: React.FC<RemindersHubProps> = ({
  onOpenReminderModal,
  onOpenHistoryModal,
}) => {
  const {
    currentUser,
    assignments,
    reports,
    units,
    officers,
    computeAssignmentStatus,
    batchSendReminder,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overdue_queue' | 'history'>('overdue_queue');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Collect all overdue assignments across all reports
  const overdueAssignments = assignments
    .map((a) => {
      const report = reports.find((r) => r.id === a.report_id);
      const unit = units.find((u) => u.id === a.unit_id);
      if (!report || !unit) return null;
      const { status, overdueDays } = computeAssignmentStatus(a, report);
      if (status !== 'QUA_HAN' && status !== 'SAP_DEN_HAN') return null;
      return {
        assignment: a,
        report,
        unit,
        status,
        overdueDays,
      };
    })
    .filter(Boolean) as {
      assignment: ReportAssignment;
      report: any;
      unit: any;
      status: string;
      overdueDays: number;
    }[];

  const filteredQueue = overdueAssignments.filter(({ unit, report }) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      unit.ten_don_vi.toLowerCase().includes(q) ||
      unit.huyen_tp.toLowerCase().includes(q) ||
      report.ten_bao_cao.toLowerCase().includes(q)
    );
  });

  // Extract all reminder logs from all assignments
  const allReminderLogs: {
    logId: string;
    time: string;
    unitName: string;
    district: string;
    reportName: string;
    officer: string;
    channel: 'email' | 'dien_thoai' | 'he_thong';
    title: string;
    content: string;
    assignment: ReportAssignment;
  }[] = [];

  assignments.forEach((a) => {
    const report = reports.find((r) => r.id === a.report_id);
    const unit = units.find((u) => u.id === a.unit_id);
    if (!report || !unit) return;

    a.lich_su_nhac_nho?.forEach((log) => {
      allReminderLogs.push({
        logId: log.id,
        time: log.thoi_gian,
        unitName: unit.ten_don_vi,
        district: unit.huyen_tp,
        reportName: report.ten_bao_cao,
        officer: log.nguoi_nhac,
        channel: log.hinh_thuc,
        title: log.tieu_de,
        content: log.noi_dung,
        assignment: a,
      });
    });
  });

  allReminderLogs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const handleSelectAll = () => {
    if (selectedIds.length === filteredQueue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQueue.map((item) => item.assignment.id));
    }
  };

  const handleBatchSend = () => {
    if (selectedIds.length === 0) return;
    const title = '[ĐÔN ĐỐC KHẨN] Yêu cầu nộp báo cáo theo quy định';
    const content = 'Sở Tài chính Ninh Bình yêu cầu Quý đơn vị khẩn trương nộp file báo cáo qua email và xác nhận trên hệ thống.';
    batchSendReminder(selectedIds, currentUser.ho_ten, title, content);
    alert(`Đã gửi thông báo đôn đốc thành công tới ${selectedIds.length} đơn vị!`);
    setSelectedIds([]);
  };

  const handleRemindAllOverdue = () => {
    const ids = overdueAssignments.map((i) => i.assignment.id);
    if (ids.length === 0) return;
    const title = '[ĐÔN ĐỐC TỔNG LỰC] Về việc chậm nộp báo cáo cấp xã gửi Sở Tài chính';
    const content = 'Đề nghị Ủy ban nhân dân cấp xã khẩn trương hoàn thiện và nộp báo cáo theo quy định.';
    batchSendReminder(ids, currentUser.ho_ten, title, content);
    alert(`Đã gửi thông báo đôn đốc tới toàn bộ ${ids.length} lượt đơn vị chậm trễ!`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5" />
              TRUNG TÂM ĐÔN ĐỐC BÁO CÁO CÔNG VỤ
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Đôn Đốc & Nhắc Nhở Các Đơn Vị Chậm Trễ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý danh sách cần đôn đốc, gửi email hàng loạt và tra cứu lịch sử nhắc nhở
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRemindAllOverdue}
              className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Đôn Đốc Toàn Bộ ({overdueAssignments.length})
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('overdue_queue')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'overdue_queue'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hàng đợi cần nhắc ({overdueAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Lịch sử đã nhắc ({allReminderLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'overdue_queue' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {/* Action strip */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm đơn vị, báo cáo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 border border-slate-300 rounded focus:outline-hidden text-xs"
              />
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBatchSend}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi đã chọn ({selectedIds.length})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredQueue.length > 0 &&
                        selectedIds.length === filteredQueue.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Xã / Phường</th>
                  <th className="py-2.5 px-3">Huyện / TP</th>
                  <th className="py-2.5 px-3">Báo Cáo</th>
                  <th className="py-2.5 px-3">Tình Trạng</th>
                  <th className="py-2.5 px-3 text-center">Đã Đôn Đốc</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Không có đơn vị nào quá hạn hoặc cần đôn đốc.
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(({ assignment, unit, report, status, overdueDays }) => {
                    const isChecked = selectedIds.includes(assignment.id);
                    return (
                      <tr
                        key={assignment.id}
                        className={`hover:bg-slate-50 ${
                          isChecked ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedIds((prev) =>
                                prev.includes(assignment.id)
                                  ? prev.filter((i) => i !== assignment.id)
                                  : [...prev, assignment.id]
                              );
                            }}
                            className="rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <div>{unit.ten_don_vi}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {unit.nguoi_phu_trach} ({unit.so_dien_thoai})
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {unit.huyen_tp}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium max-w-xs truncate">
                          {report.ten_bao_cao}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge status={status as any} overdueDays={overdueDays} />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-800">
                          {assignment.so_lan_nhac_nho || 0} lần
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenReminderModal(assignment)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-md shadow-2xs mr-1.5 transition-all cursor-pointer"
                          >
                            Đôn đốc
                          </button>
                          <button
                            onClick={() => onOpenHistoryModal(assignment)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-700 hover:bg-slate-800 active:scale-95 rounded-md shadow-2xs transition-all cursor-pointer"
                          >
                            Lịch sử
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* History tab */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase text-slate-800">
            Nhật Ký Các Lượt Đôn Đốc Đã Thực Hiện ({allReminderLogs.length})
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {allReminderLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                Chưa có nhật ký nhắc nhở nào.
              </div>
            ) : (
              allReminderLogs.map((log) => (
                <div key={log.logId} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {log.unitName}
                      </span>
                      <span className="text-slate-400 text-xs">({log.district})</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                        {log.channel === 'dien_thoai' ? 'Điện thoại' : 'Email công vụ'}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(log.time).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-800 mt-1">
                    {log.title}
                  </div>

                  <p className="text-[11px] text-slate-600 mt-0.5 whitespace-pre-wrap line-clamp-2">
                    {log.content}
                  </p>

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Cán bộ thực hiện: <strong>{log.officer}</strong></span>
                    <span>Báo cáo: {log.reportName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

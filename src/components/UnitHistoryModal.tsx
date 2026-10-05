import React from 'react';
import { useApp } from '../context/AppContext';
import { ReportAssignment } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  History,
  RotateCcw,
  Send,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface UnitHistoryModalProps {
  assignment: ReportAssignment;
  onClose: () => void;
}

export const UnitHistoryModal: React.FC<UnitHistoryModalProps> = ({
  assignment,
  onClose,
}) => {
  const { reports, units, officers, computeAssignmentStatus } = useApp();

  const report = reports.find((r) => r.id === assignment.report_id);
  const unit = units.find((u) => u.id === assignment.unit_id);
  const officer = officers.find((o) => o.id === unit?.quan_ly_xa_id);

  if (!report || !unit) return null;

  const { status, overdueDays } = computeAssignmentStatus(assignment, report);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-blue-600" />
              LỊCH SỬ TIẾN ĐỘ & NHẮC NHỞ
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {unit.ten_don_vi} ({unit.huyen_tp})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Report summary strip */}
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Báo cáo:</span>
            <span className="font-bold text-slate-900">{report.ten_bao_cao}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Trạng thái hiện tại:</span>
            <StatusBadge status={status} overdueDays={overdueDays} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Cán bộ Sở phụ trách:</span>
            <span className="font-semibold text-slate-800">{officer?.name || 'Phòng Ngân sách'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Người liên hệ xã:</span>
            <span className="font-semibold text-slate-800">
              {unit.nguoi_phu_trach} ({unit.so_dien_thoai})
            </span>
          </div>
        </div>

        {/* Section 1: Workflow Timeline */}
        <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-1">
          
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              1. Nhật ký chuyển trạng thái ({assignment.lich_su_trang_thai?.length || 0})
            </h4>
            <div className="border-l-2 border-slate-200 ml-2.5 pl-4 space-y-3 text-xs">
              {assignment.lich_su_trang_thai && assignment.lich_su_trang_thai.length > 0 ? (
                assignment.lich_su_trang_thai.map((item, idx) => (
                  <div key={item.id || idx} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-slate-800">
                        {item.trang_thai_moi}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.thoi_gian).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Thực hiện: <strong>{item.nguoi_thuc_hien}</strong>
                      {item.ghi_chu && (
                        <div className="text-slate-500 italic mt-0.5">
                          "{item.ghi_chu}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs">Chưa có lịch sử trạng thái</div>
              )}
            </div>
          </div>

          {/* Section 2: Reminder History */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-600" />
              2. Lịch sử đôn đốc & nhắc nhở ({assignment.lich_su_nhac_nho?.length || 0} lần)
            </h4>
            {assignment.lich_su_nhac_nho && assignment.lich_su_nhac_nho.length > 0 ? (
              <div className="space-y-2 text-xs">
                {assignment.lich_su_nhac_nho.map((rem, idx) => (
                  <div key={rem.id || idx} className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between font-semibold text-amber-950">
                      <span className="flex items-center gap-1">
                        {rem.hinh_thuc === 'dien_thoai' ? (
                          <Phone className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Mail className="w-3 h-3 text-blue-600" />
                        )}
                        {rem.tieu_de}
                      </span>
                      <span className="text-[10px] text-amber-700 font-mono font-normal">
                        {new Date(rem.thoi_gian).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-900 mt-1 whitespace-pre-wrap leading-relaxed">
                      {rem.noi_dung}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-1">
                      Cán bộ nhắc: <strong>{rem.nguoi_nhac}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded text-slate-400 text-xs">
                Chưa có lần nhắc nhở nào đối với đơn vị này.
              </div>
            )}
          </div>

          {/* Section 3: Revision History */}
          {assignment.lich_su_chinh_sua && assignment.lich_su_chinh_sua.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                3. Lịch sử yêu cầu chỉnh sửa ({assignment.lich_su_chinh_sua.length} lần)
              </h4>
              <div className="space-y-2 text-xs">
                {assignment.lich_su_chinh_sua.map((rev, idx) => (
                  <div key={rev.id || idx} className="p-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between text-orange-950 font-semibold">
                      <span>Yêu cầu sửa đổi lần {idx + 1}</span>
                      <span className="text-[10px] text-orange-700 font-mono font-normal">
                        {new Date(rev.thoi_gian).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-orange-900 mt-1">
                      <strong>Lý do: </strong> {rev.ly_do}
                    </div>
                    <div className="text-[10px] text-orange-700 mt-1 flex justify-between">
                      <span>Người yêu cầu: <strong>{rev.nguoi_yeu_cau}</strong></span>
                      <span>Hạn nộp lại: <strong>{rev.han_chinh_sua?.slice(0, 10)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

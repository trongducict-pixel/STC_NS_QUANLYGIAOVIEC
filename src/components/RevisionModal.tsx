import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReportAssignment } from '../types';
import { RotateCcw, AlertTriangle, Calendar, FileText } from 'lucide-react';

interface RevisionModalProps {
  assignment: ReportAssignment;
  onClose: () => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  assignment,
  onClose,
}) => {
  const { currentUser, reports, units, requestRevision } = useApp();

  const report = reports.find((r) => r.id === assignment.report_id);
  const unit = units.find((u) => u.id === assignment.unit_id);

  if (!report || !unit) return null;

  const [reason, setReason] = useState(
    'Biểu mẫu số 01: Số liệu chi đầu tư xây dựng cơ bản chưa khớp với phụ lục đối chiếu của Kho bạc Nhà nước. Đề nghị đơn vị kiểm tra và gửi lại bản đã chuẩn hóa có chữ ký số.'
  );
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do yêu cầu chỉnh sửa');
      return;
    }

    requestRevision(assignment.id, currentUser.ho_ten, reason, deadline);
    alert(`Đã gửi yêu cầu chỉnh sửa tới UBND ${unit.ten_don_vi}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-bold text-orange-700 uppercase tracking-tight flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              YÊU CẦU ĐƠN VỊ CHỈNH SỬA BÁO CÁO
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {unit.ten_don_vi}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-500 font-medium">Báo cáo:</div>
            <div className="font-bold text-slate-900">{report.ten_bao_cao}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Mã: {report.ma_bao_cao} · Đơn vị: {unit.ten_don_vi} ({unit.huyen_tp})
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Lý do yêu cầu chỉnh sửa / Các sai sót phát hiện <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Chỉ rõ biểu mẫu nào sai, số liệu chưa khớp ở mục nào, thiếu chữ ký số hoặc căn cứ pháp lý..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-orange-500 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Hạn hoàn thành nộp lại <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-orange-500 font-mono"
            />
          </div>

          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-900 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <span>
              Trạng thái báo cáo sẽ chuyển thành <strong>"Yêu cầu sửa đổi"</strong>. Đơn vị xã sẽ nhìn thấy nội dung lý do này ngay khi đăng nhập để hoàn thiện và nộp lại.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Gửi Yêu Cầu Chỉnh Sửa
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

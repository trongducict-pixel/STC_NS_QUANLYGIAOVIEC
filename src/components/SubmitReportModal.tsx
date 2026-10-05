import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReportAssignment } from '../types';
import {
  Send,
  Mail,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface SubmitReportModalProps {
  assignment: ReportAssignment;
  onClose: () => void;
}

export const SubmitReportModal: React.FC<SubmitReportModalProps> = ({
  assignment,
  onClose,
}) => {
  const { reports, units, confirmUnitSent, settings } = useApp();

  const report = reports.find((r) => r.id === assignment.report_id);
  const unit = units.find((u) => u.id === assignment.unit_id);

  if (!report || !unit) return null;

  // Auto-generate standardized email subject line
  const autoSubject = `[${report.ma_bao_cao}] - [${unit.ten_don_vi.toUpperCase()}] Nộp Báo cáo gửi Sở Tài chính Ninh Bình`;

  // Standardized administrative email body
  const autoBody = `Kính gửi: Phòng Quản lý Ngân sách - Sở Tài chính tỉnh Ninh Bình,

Thực hiện yêu cầu về việc gửi báo cáo định kỳ:
- Tên báo cáo: ${report.ten_bao_cao}
- Mã số: ${report.ma_bao_cao}
- Đơn vị thực hiện: UBND ${unit.ten_don_vi} (${unit.huyen_tp})

UBND ${unit.ten_don_vi} kính gửi Quý Sở file báo cáo chi tiết đính kèm theo công văn này. Số liệu đã được Lãnh đạo UBND xã phê duyệt và ký số.

Thông tin người liên hệ:
- Họ và tên: ${unit.nguoi_phu_trach}
- Chức vụ: ${unit.chuc_vu}
- Số điện thoại: ${unit.so_dien_thoai}
- Email công vụ: ${unit.email}

Kính đề nghị Phòng Quản lý Ngân sách tiếp nhận và kiểm tra.
Trân trọng cảm ơn!`;

  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Form states for confirmation
  const [senderName, setSenderName] = useState(unit.nguoi_phu_trach);
  const [senderPhone, setSenderPhone] = useState(unit.so_dien_thoai);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy helpers
  const handleCopySubject = () => {
    navigator.clipboard.writeText(autoSubject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(autoBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  // Mailto link
  const mailtoLink = `mailto:${encodeURIComponent(
    report.email_nhan_bao_cao
  )}?subject=${encodeURIComponent(autoSubject)}&body=${encodeURIComponent(
    autoBody
  )}`;

  const handleSubmitConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      alert('Vui lòng nhập tên người xác nhận nộp báo cáo');
      return;
    }

    setIsSubmitting(true);
    confirmUnitSent(
      assignment.id,
      senderName,
      senderPhone,
      autoSubject,
      notes || 'Đã gửi file đính kèm qua email công vụ của Sở.'
    );
    setIsSubmitting(false);
    alert('Đã xác nhận nộp báo cáo thành công! Hệ thống đã ghi nhận thời gian gửi.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
              <span>HƯỚNG DẪN NỘP BÁO CÁO QUA EMAIL</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Nộp Báo Cáo: {report.ten_bao_cao}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Email Instructions Box */}
        <div className="mt-4 space-y-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-tight">
                1. ĐỊA CHỈ EMAIL NHẬN BÁO CÁO:
              </span>
              <a
                href={mailtoLink}
                className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Mở ứng dụng Email (mailto)
              </a>
            </div>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200 font-mono text-blue-700 font-semibold text-sm">
              <span>{report.email_nhan_bao_cao}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(report.email_nhan_bao_cao);
                  alert('Đã sao chép địa chỉ email!');
                }}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Sao chép
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700 uppercase tracking-tight">
                  2. TIÊU ĐỀ EMAIL CHUẨN:
                </span>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="text-blue-700 hover:text-blue-900 flex items-center gap-1 font-medium"
                >
                  {copiedSubject ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Sao chép tiêu đề
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 font-medium text-slate-900">
                {autoSubject}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700 uppercase tracking-tight">
                  3. NỘI DUNG MẪU GỬI KÈM FILE:
                </span>
                <button
                  type="button"
                  onClick={handleCopyBody}
                  className="text-blue-700 hover:text-blue-900 flex items-center gap-1 font-medium"
                >
                  {copiedBody ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Sao chép nội dung
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-white p-2.5 rounded border border-slate-200 text-slate-700 font-sans whitespace-pre-wrap text-[11px] max-h-32 overflow-y-auto leading-relaxed">
                {autoBody}
              </pre>
            </div>
          </div>

          {/* Quick Action to open mail */}
          <div className="flex items-center justify-center p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Hãy gửi file báo cáo qua email trước, sau đó điền thông tin bên dưới để <strong>xác nhận</strong>.
            </span>
          </div>

          {/* Step 2: Confirmation Form */}
          <form onSubmit={handleSubmitConfirmation} className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-tight text-xs flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#0F2C59]" />
              4. XÁC NHẬN ĐÃ GỬI EMAIL VÀO HỆ THỐNG
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Họ tên người gửi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Số điện thoại người gửi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Ghi chú thêm (Mã số công văn gửi kèm, file đã đính kèm...)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Đã gửi kèm file PDF có chữ ký số Chủ tịch UBND và file Excel biểu 01..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Xác Nhận Đã Gửi Báo Cáo
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

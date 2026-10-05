import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReportAssignment } from '../types';
import {
  Send,
  Mail,
  Phone,
  AlertTriangle,
  History,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface ReminderModalProps {
  assignment: ReportAssignment;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  assignment,
  onClose,
}) => {
  const {
    currentUser,
    reports,
    units,
    sendReminder,
    settings,
    computeAssignmentStatus,
  } = useApp();

  const report = reports.find((r) => r.id === assignment.report_id);
  const unit = units.find((u) => u.id === assignment.unit_id);

  if (!report || !unit) return null;

  const { status, overdueDays } = computeAssignmentStatus(assignment, report);

  // Template types
  const [templateType, setTemplateType] = useState<
    'qua_han' | 'sap_den_han' | 'phe_binh' | 'yeu_cau_sua'
  >(status === 'QUA_HAN' ? 'qua_han' : 'sap_den_han');

  const [channel, setChannel] = useState<'email' | 'dien_thoai'>('email');

  const getDefaultTitle = () => {
    if (templateType === 'phe_binh') {
      return `[CẢNH BÁO ĐÔN ĐỐC LẦN ${assignment.so_lan_nhac_nho + 1}] Chậm nộp báo cáo ${report.ten_bao_cao} - Báo cáo UBND tỉnh`;
    }
    if (templateType === 'yeu_cau_sua') {
      return `[ĐÔN ĐỐC NỘP LẠI] Yêu cầu khẩn trương hoàn thiện chỉnh sửa báo cáo ${report.ten_bao_cao}`;
    }
    if (templateType === 'qua_han') {
      return `[ĐÔN ĐỐC QUÁ HẠN] Về việc chậm gửi báo cáo ${report.ten_bao_cao} gửi Sở Tài chính Ninh Bình`;
    }
    return `[NHẮC HẠN NỘP] Sắp đến thời hạn gửi báo cáo ${report.ten_bao_cao}`;
  };

  const getDefaultBody = () => {
    return settings.mau_noi_dung_nhac_nho
      .replace('{TEN_DON_VI}', unit.ten_don_vi)
      .replace('{TEN_BAO_CAO}', report.ten_bao_cao)
      .replace('{HAN_GUI}', `${report.gio_han} ngày ${report.han_gui}`)
      .replace('{SO_NGAY_QUA_HAN}', String(overdueDays || 1))
      .replace('{EMAIL_NHAN}', report.email_nhan_bao_cao);
  };

  const [reminderTitle, setReminderTitle] = useState(getDefaultTitle());
  const [reminderContent, setReminderContent] = useState(getDefaultBody());
  const [copied, setCopied] = useState(false);

  // Update text when template changes
  const handleTemplateChange = (type: any) => {
    setTemplateType(type);
    if (type === 'phe_binh') {
      setReminderTitle(
        `[CẢNH BÁO ĐÔN ĐỐC LẦN ${assignment.so_lan_nhac_nho + 1}] Báo cáo UBND tỉnh việc chậm nộp ${report.ten_bao_cao}`
      );
      setReminderContent(
        `Kính gửi: Đồng chí Chủ tịch UBND và Kế toán trưởng ${unit.ten_don_vi},\n\nSở Tài chính Ninh Bình đã nhắc nhở đơn vị nhiều lần về báo cáo "${report.ten_bao_cao}" (Đã quá hạn ${overdueDays} ngày). Đến nay đơn vị vẫn chưa nộp file báo cáo.\n\nSở Tài chính yêu cầu đơn vị hoàn thành nộp báo cáo trước 16h30 ngày hôm nay. Sau thời gian trên, Sở sẽ lập danh sách gửi Văn phòng UBND tỉnh xem xét thi đua và trách nhiệm người đứng đầu.\n\nTrân trọng!`
      );
    } else if (type === 'sap_den_han') {
      setReminderTitle(`[NHẮC HẠN NỘP] Báo cáo ${report.ten_bao_cao} sắp đến hạn`);
      setReminderContent(
        `Kính gửi: Bộ phận Tài chính - Kế toán ${unit.ten_don_vi},\n\nPhòng Ngân sách - Sở Tài chính Ninh Bình xin nhắc Quý đơn vị thời hạn nộp báo cáo "${report.ten_bao_cao}" sẽ hết hạn vào lúc ${report.gio_han} ngày ${report.han_gui}.\n\nĐề nghị Quý đơn vị chuẩn bị số liệu và gửi file báo cáo đúng hạn quy định về hòm thư ${report.email_nhan_bao_cao}.\n\nTrân trọng cảm ơn!`
      );
    } else {
      setReminderTitle(getDefaultTitle());
      setReminderContent(getDefaultBody());
    }
  };

  // Mailto link
  const mailtoLink = `mailto:${encodeURIComponent(
    unit.email_nhan_thong_bao || unit.email
  )}?subject=${encodeURIComponent(reminderTitle)}&body=${encodeURIComponent(
    reminderContent
  )}`;

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    sendReminder(
      assignment.id,
      currentUser.ho_ten,
      channel,
      reminderTitle,
      reminderContent
    );
    alert(
      `Đã ghi nhận đôn đốc đơn vị ${unit.ten_don_vi} (Tổng số lần đôn đốc: ${
        assignment.so_lan_nhac_nho + 1
      }).`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-tight flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              ĐÔN ĐỐC TIẾN ĐỘ BÁO CÁO CẤP XÃ
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Gửi Nhắc Nhở: {unit.ten_don_vi}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Target Unit Info Strip */}
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Đơn vị:</span>
            <span className="font-bold text-slate-800">
              {unit.ten_don_vi} ({unit.huyen_tp})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Người phụ trách:</span>
            <span className="font-semibold text-slate-800">
              {unit.nguoi_phu_trach} · SĐT: {unit.so_dien_thoai}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email công vụ:</span>
            <span className="font-mono text-blue-700">{unit.email_nhan_thong_bao}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500">Tình trạng:</span>
            <span className="font-semibold text-rose-700">
              {status === 'QUA_HAN' ? `Quá hạn ${overdueDays} ngày` : 'Sắp đến hạn'} (Đã đôn đốc: {assignment.so_lan_nhac_nho} lần)
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSendReminder} className="mt-4 space-y-3.5 text-xs">
          
          {/* Template selection */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Mẫu đôn đốc:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleTemplateChange('sap_den_han')}
                className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                  templateType === 'sap_den_han'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Nhắc sắp đến hạn
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('qua_han')}
                className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                  templateType === 'qua_han'
                    ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Đôn đốc quá hạn
              </button>
              <button
                type="button"
                onClick={() => handleTemplateChange('phe_binh')}
                className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                  templateType === 'phe_binh'
                    ? 'bg-red-100 text-red-900 border-red-300 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Cảnh báo cấp trên (Chây ì)
              </button>
            </div>
          </div>

          {/* Channel */}
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">Hình thức nhắc:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="channel"
                value="email"
                checked={channel === 'email'}
                onChange={() => setChannel('email')}
              />
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Gửi qua Email công vụ</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="channel"
                value="dien_thoai"
                checked={channel === 'dien_thoai'}
                onChange={() => setChannel('dien_thoai')}
              />
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gọi điện thoại trực tiếp</span>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tiêu đề văn bản nhắc nhở
            </label>
            <input
              type="text"
              required
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-medium"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold">
                Nội dung đôn đốc
              </label>
              {channel === 'email' && (
                <a
                  href={mailtoLink}
                  className="text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Mở ứng dụng Email
                </a>
              )}
            </div>
            <textarea
              rows={6}
              required
              value={reminderContent}
              onChange={(e) => setReminderContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-sans focus:outline-hidden focus:border-blue-500 text-xs leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <a
              href={`tel:${unit.so_dien_thoai}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all font-bold cursor-pointer text-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              Gọi {unit.so_dien_thoai}
            </a>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer text-xs"
              >
                <Send className="w-4 h-4" />
                Gửi Đôn Đốc & Ghi Nhật Ký
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sliders, Save, Clock, Mail, RotateCcw } from 'lucide-react';

interface SystemSettingsModalProps {
  onClose: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  onClose,
}) => {
  const { settings, updateSettings } = useApp();

  const [thresholdDays, setThresholdDays] = useState(
    settings.so_ngay_canh_bao_sap_den_han
  );
  const [defaultEmail, setDefaultEmail] = useState(settings.email_so_mac_dinh);
  const [departmentName, setDepartmentName] = useState(
    settings.ten_phong_mac_dinh
  );
  const [phone, setPhone] = useState(settings.so_dien_thoai_so);
  const [reminderTitle, setReminderTitle] = useState(
    settings.mau_tieu_de_nhac_nho
  );
  const [reminderBody, setReminderBody] = useState(
    settings.mau_noi_dung_nhac_nho
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      so_ngay_canh_bao_sap_den_han: Number(thresholdDays) || 3,
      email_so_mac_dinh: defaultEmail,
      ten_phong_mac_dinh: departmentName,
      so_dien_thoai_so: phone,
      mau_tieu_de_nhac_nho: reminderTitle,
      mau_noi_dung_nhac_nho: reminderBody,
    });
    alert('Đã lưu cấu hình hệ thống thành công!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              CẤU HÌNH THÔNG SỐ HỆ THỐNG
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Cài Đặt Cảnh Báo & Biểu Mẫu Nhắc Nhở
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          
          {/* Warning Threshold Days */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <label className="font-bold text-amber-900">
                Ngưỡng ngày cảnh báo "Sắp đến hạn":
              </label>
            </div>
            <p className="text-[11px] text-amber-800">
              Các báo cáo chưa gửi có hạn nộp trong vòng số ngày này sẽ tự động chuyển sang trạng thái <strong>"SẮP ĐẾN HẠN"</strong> (màu vàng) để cán bộ đôn đốc.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={15}
                required
                value={thresholdDays}
                onChange={(e) => setThresholdDays(Number(e.target.value))}
                className="w-24 px-3 py-1.5 border border-amber-300 rounded font-bold text-center text-sm bg-white"
              />
              <span className="font-semibold text-slate-700">ngày trước thời hạn chót</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Hòm thư Email công vụ nhận báo cáo mặc định
            </label>
            <input
              type="email"
              required
              value={defaultEmail}
              onChange={(e) => setDefaultEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tên cơ quan / phòng ban
              </label>
              <input
                type="text"
                required
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tiêu đề email đôn đốc mặc định
            </label>
            <input
              type="text"
              required
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nội dung thư đôn đốc mẫu (Hỗ trợ thẻ: {'{TEN_DON_VI}'}, {'{TEN_BAO_CAO}'}, {'{HAN_GUI}'}, {'{SO_NGAY_QUA_HAN}'}, {'{EMAIL_NHAN}'})
            </label>
            <textarea
              rows={5}
              required
              value={reminderBody}
              onChange={(e) => setReminderBody(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-sans text-xs focus:outline-hidden"
            />
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" />
              Lưu Cấu Hình
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

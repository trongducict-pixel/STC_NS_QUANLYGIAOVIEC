import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReportAssignment } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  Building2,
  Calendar,
  Clock,
  Send,
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  Mail,
  Phone,
  User,
  History,
  Info,
  ExternalLink,
} from 'lucide-react';

interface CommunePortalProps {
  onSubmitReport: (assignment: ReportAssignment) => void;
  onOpenHistoryModal: (assignment: ReportAssignment) => void;
}

export const CommunePortal: React.FC<CommunePortalProps> = ({
  onSubmitReport,
  onOpenHistoryModal,
}) => {
  const {
    currentUser,
    units,
    reports,
    assignments,
    officers,
    computeAssignmentStatus,
    updateUnit,
  } = useApp();

  // Find commune unit
  const unit =
    units.find((u) => u.id === currentUser.unit_id) ||
    units.find((u) => u.tai_khoan === currentUser.username) ||
    units[12]; // Fallback to Xã Ninh Tiến

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(unit.nguoi_phu_trach);
  const [profileTitle, setProfileTitle] = useState(unit.chuc_vu);
  const [profilePhone, setProfilePhone] = useState(unit.so_dien_thoai);
  const [profileEmail, setProfileEmail] = useState(unit.email_nhan_thong_bao);

  const officerInCharge = officers.find((o) => o.id === unit.quan_ly_xa_id);

  // Get assignments for this unit
  const unitAssignments = assignments.filter((a) => a.unit_id === unit.id);

  const evaluatedList = unitAssignments.map((a) => {
    const report = reports.find((r) => r.id === a.report_id);
    const { status, overdueDays } = report
      ? computeAssignmentStatus(a, report)
      : { status: a.trang_thai, overdueDays: 0 };
    return {
      assignment: a,
      report,
      status,
      overdueDays,
    };
  });

  const overdueItems = evaluatedList.filter((i) => i.status === 'QUA_HAN');
  const revisionItems = evaluatedList.filter(
    (i) => i.status === 'YEU_CAU_SUA_DOI'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUnit({
      ...unit,
      nguoi_phu_trach: profileName,
      chuc_vu: profileTitle,
      so_dien_thoai: profilePhone,
      email_nhan_thong_bao: profileEmail,
    });
    setIsEditingProfile(false);
    alert('Cập nhật thông tin cán bộ phụ trách thành công!');
  };

  return (
    <div className="space-y-6">
      
      {/* Commune Unit Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  {unit.huyen_tp} · {unit.loai_don_vi}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {unit.ma_don_vi}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                UBND {unit.ten_don_vi}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{unit.dia_chi}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="self-start md:self-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
          >
            {isEditingProfile ? 'Đóng form sửa' : 'Cập nhật liên hệ'}
          </button>
        </div>

        {/* Profile Details or Edit Form */}
        {isEditingProfile ? (
          <form
            onSubmit={handleSaveProfile}
            className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs"
          >
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Người phụ trách nộp báo cáo
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Chức vụ</label>
              <input
                type="text"
                required
                value={profileTitle}
                onChange={(e) => setProfileTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Số điện thoại</label>
              <input
                type="text"
                required
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Email nhận thông báo</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2 mt-1">
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0F2C59] text-white rounded font-semibold text-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-400">Cán bộ phụ trách:</div>
              <div className="font-semibold text-slate-800">
                {unit.nguoi_phu_trach} ({unit.chuc_vu})
              </div>
            </div>
            <div>
              <div className="text-slate-400">Số điện thoại liên hệ:</div>
              <div className="font-mono font-medium text-slate-800">{unit.so_dien_thoai}</div>
            </div>
            <div>
              <div className="text-slate-400">Email công vụ nhận thông báo:</div>
              <div className="font-mono text-slate-800 truncate">{unit.email_nhan_thong_bao}</div>
            </div>
            <div>
              <div className="text-slate-400">Cán bộ Sở phụ trách:</div>
              <div className="font-semibold text-blue-700">
                {officerInCharge ? `${officerInCharge.name} (${officerInCharge.phone})` : 'Phòng Ngân sách'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Critical Alerts */}
      {overdueItems.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 text-xs text-rose-900 shadow-2xs">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold uppercase tracking-tight">
              Cảnh Báo Quá Hạn: Đơn vị có {overdueItems.length} báo cáo chưa gửi!
            </h4>
            <p className="mt-0.5 text-rose-800">
              Đề nghị Quý đơn vị khẩn trương gửi file báo cáo qua email công vụ của Sở và bấm xác nhận ngay để không bị tổng hợp vào danh sách phê bình.
            </p>
          </div>
        </div>
      )}

      {revisionItems.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-300 rounded-xl flex items-start gap-3 text-xs text-orange-950 shadow-2xs">
          <RotateCcw className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold uppercase tracking-tight">
              Yêu Cầu Chỉnh Sửa Số Liệu: {revisionItems.length} báo cáo cần hoàn thiện lại!
            </h4>
            <div className="mt-1 space-y-1">
              {revisionItems.map((item) => (
                <div key={item.assignment.id} className="bg-white/80 p-2 rounded border border-orange-200">
                  <div className="font-semibold">{item.report?.ten_bao_cao}</div>
                  <div className="text-orange-900 mt-0.5">
                    <strong>Nội dung yêu cầu sửa: </strong>
                    {item.assignment.ly_do_chinh_sua}
                  </div>
                  <div className="text-[11px] text-orange-700 mt-0.5">
                    Hạn nộp lại: {item.assignment.han_chinh_sua?.slice(0, 10)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rule Notice Reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Lưu ý về quy trình gửi báo cáo: </strong>
          Hệ thống eReport chỉ quản lý <strong>tiến độ và trạng thái báo cáo</strong>.
          File báo cáo thực tế được gửi qua <strong>Gmail / Outlook hoặc hệ thống email công vụ</strong> theo địa chỉ email của Sở Tài chính Ninh Bình.
          Sau khi gửi email, cán bộ bấm nút <strong>"Nộp báo cáo"</strong> trên hệ thống để ghi nhận thời gian gửi và đối soát.
        </div>
      </div>

      {/* Report Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
            Danh Sách Báo Cáo Được Giao Thực Hiện ({evaluatedList.length})
          </h2>
          <span className="text-xs text-slate-500">Năm ngân sách 2026</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {evaluatedList.map(({ assignment, report, status, overdueDays }) => {
            if (!report) return null;

            const isDone = status === 'HOAN_THANH';
            const isNeedAction =
              status === 'CHUA_DEN_HAN' ||
              status === 'SAP_DEN_HAN' ||
              status === 'QUA_HAN' ||
              status === 'YEU_CAU_SUA_DOI';

            return (
              <div
                key={assignment.id}
                className={`bg-white border rounded-xl p-5 shadow-2xs transition-all ${
                  status === 'QUA_HAN'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : status === 'YEU_CAU_SUA_DOI'
                    ? 'border-orange-300 ring-1 ring-orange-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {report.ma_bao_cao}
                      </span>
                      <StatusBadge status={status} overdueDays={overdueDays} />
                      {report.muc_do_uu_tien !== 'BINH_THUONG' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          {report.muc_do_uu_tien}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {report.ten_bao_cao}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {report.noi_dung}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Hạn chót: <strong>{report.gio_han} ngày {report.han_gui}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-blue-700">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        Gửi về: {report.email_nhan_bao_cao}
                      </span>
                      {assignment.so_lan_nhac_nho > 0 && (
                        <span className="text-amber-800 font-medium">
                          Đã được nhắc nhở: {assignment.so_lan_nhac_nho} lần
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {isNeedAction ? (
                      <button
                        onClick={() => onSubmitReport(assignment)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        {status === 'YEU_CAU_SUA_DOI' ? 'NỘP BÁO CÁO LẠI' : 'NỘP BÁO CÁO'}
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã ghi nhận gửi
                        </span>
                        {assignment.ngay_xac_nhan_gui && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Lúc: {new Date(assignment.ngay_xac_nhan_gui).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => onOpenHistoryModal(assignment)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      Lịch sử gửi & trao đổi
                    </button>
                  </div>
                </div>

                {/* Revision note box if any */}
                {assignment.ly_do_chinh_sua && status === 'YEU_CAU_SUA_DOI' && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-900">
                    <strong>Ý kiến kiểm tra của Sở Tài chính: </strong>
                    {assignment.ly_do_chinh_sua}
                    {assignment.han_chinh_sua && (
                      <div className="text-[11px] text-orange-800 font-semibold mt-1">
                        Hạn hoàn thiện lại: {assignment.han_chinh_sua.slice(0, 10)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

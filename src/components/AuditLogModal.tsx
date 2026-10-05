import React from 'react';
import { useApp } from '../context/AppContext';
import { History, Download, Shield } from 'lucide-react';

interface AuditLogModalProps {
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ onClose }) => {
  const { auditLogs } = useApp();

  const handleExportLogs = () => {
    const headers = ['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Chi tiết'];
    const rows = auditLogs.map((l) => [
      `"${new Date(l.thoi_gian).toLocaleString('vi-VN')}"`,
      `"${l.nguoi_thuc_hien}"`,
      `"${l.vai_tro}"`,
      `"${l.hanh_dong}"`,
      `"${l.chi_tiet.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nhat_Ky_He_Thong_eReport_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhật Ký Thao Tác Hệ Thống (Audit Log)
              </h3>
              <p className="text-xs text-slate-500">
                Lưu toàn bộ lịch sử ban hành báo cáo, xác nhận gửi, đôn đốc và chỉnh sửa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLogs}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất CSV
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-bold text-lg ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Thời gian</th>
                <th className="py-2.5 px-3">Người thực hiện</th>
                <th className="py-2.5 px-3">Vai trò</th>
                <th className="py-2.5 px-3">Hành động</th>
                <th className="py-2.5 px-3">Chi tiết nghiệp vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(log.thoi_gian).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {log.nguoi_thuc_hien}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {log.vai_tro}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                    {log.hanh_dong}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed">
                    {log.chi_tiet}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SAMPLE_APPS_SCRIPT_CODE } from '../data/mockData';
import {
  FileSpreadsheet,
  RefreshCw,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

interface GoogleSheetSyncModalProps {
  onClose: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({ onClose }) => {
  const {
    googleScriptConfig,
    updateGoogleScriptConfig,
    syncToGoogleSheet,
    syncFromGoogleSheet,
    testGoogleScriptConnection,
    units,
    reports,
    assignments,
    auditLogs,
  } = useApp();

  const [webAppUrl, setWebAppUrl] = useState(googleScriptConfig.webAppUrl);
  const [sheetId, setSheetId] = useState(googleScriptConfig.sheetId);
  const [autoSync, setAutoSync] = useState(googleScriptConfig.autoSync);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'sync' | 'code' | 'sheets_preview'>('sync');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTestConnection = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    const res = await testGoogleScriptConnection(webAppUrl);
    setIsProcessing(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      updateGoogleScriptConfig({ webAppUrl, sheetId, autoSync });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleSyncToSheet = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    updateGoogleScriptConfig({ webAppUrl, sheetId, autoSync });
    const res = await syncToGoogleSheet();
    setIsProcessing(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleSyncFromSheet = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    const res = await syncFromGoogleSheet();
    setIsProcessing(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const totalRecords = units.length + reports.length + assignments.length + auditLogs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6 border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                QUẢN TRỊ ĐỒNG BỘ DỮ LIỆU NÂNG CAO
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Lưu Trữ & Đồng Bộ Với Google Apps Script / Google Sheets
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mt-4 flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 px-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Cấu hình & Đồng bộ
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Mã nguồn Apps Script (Code.gs)
          </button>

          <button
            onClick={() => setActiveTab('sheets_preview')}
            className={`pb-2.5 px-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sheets_preview'
                ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Cấu trúc 4 Bảng Sheet ({totalRecords} dòng)
          </button>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 font-medium'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: SYNC CONTROLS */}
        {activeTab === 'sync' && (
          <div className="mt-4 space-y-4 text-xs">
            
            {/* Sync Status Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-emerald-900 uppercase">
                  Trạng thái kết nối Google Sheets:
                </div>
                <div className="text-sm font-bold text-emerald-800 mt-0.5 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đã kết nối Google Apps Script Web App
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Lần đồng bộ gần nhất:{' '}
                  <strong>
                    {googleScriptConfig.lastSyncTime
                      ? new Date(googleScriptConfig.lastSyncTime).toLocaleString('vi-VN')
                      : 'Chưa đồng bộ'}
                  </strong>{' '}
                  · Tổng: <strong>{totalRecords} bản ghi</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>Mở Google Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleTestConnection}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-lg transition-all shadow-sm cursor-pointer text-xs"
                >
                  Kiểm tra kết nối
                </button>
              </div>
            </div>

            {/* URL Input Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Đường dẫn Web App của Google Apps Script (doPost / doGet):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Triển khai từ Google Sheets qua menu: <strong>Tiện ích mở rộng → Apps Script → Triển khai dưới dạng ứng dụng web</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Google Spreadsheet ID (Mã trang tính):
                  </label>
                  <input
                    type="text"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tên trang tính Google:
                  </label>
                  <input
                    type="text"
                    value={googleScriptConfig.sheetName}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 text-xs"
                  />
                </div>
              </div>

              {/* Auto sync switch */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">
                    Tự động đồng bộ hai chiều (Auto-sync)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Tự động lưu và cập nhật lên Google Sheets khi có xác nhận nộp báo cáo, đôn đốc hoặc sửa đổi.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Action Buttons (Solid colorful backgrounds for high visibility!) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSyncFromSheet}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Tải Dữ Liệu Từ Sheet (Pull)
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSyncToSheet}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Đồng Bộ Lên Google Sheet (Push)
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: APPS SCRIPT CODE */}
        {activeTab === 'code' && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">
                  Mã nguồn Google Apps Script (Code.gs) chuẩn cho Sở Tài Chính Ninh Bình
                </p>
                <p className="text-[11px] text-slate-500">
                  Mã này tự động tạo 4 sheets: <code>DonVi_129</code>, <code>BaoCao</code>, <code>TienDo_Assignments</code>, <code>NhatKy_Logs</code>.
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã (Code.gs)</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-80 overflow-y-auto leading-relaxed border border-slate-800">
              {SAMPLE_APPS_SCRIPT_CODE}
            </pre>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
              <strong>Hướng dẫn triển khai:</strong> Mở Google Sheet → Tiện ích mở rộng → Apps Script → Dán toàn bộ mã trên vào file <code>Code.gs</code> → Bấm <strong>Triển khai mới (New deployment)</strong> → Chọn loại: <strong>Ứng dụng web (Web app)</strong> → Ai có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong> → Sao chép URL dán vào Tab "Cấu hình & Đồng bộ".
            </div>
          </div>
        )}

        {/* TAB 3: SHEETS PREVIEW */}
        {activeTab === 'sheets_preview' && (
          <div className="mt-4 space-y-3 text-xs">
            <p className="font-bold text-slate-800">
              Dữ liệu được tổ chức thành 4 bảng tính chuẩn trên Google Sheet:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>1. Sheet <code>DonVi_129</code></span>
                  <span className="text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded">
                    129 đơn vị
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lưu đầy đủ mã xã, tên xã, loại, huyện/TP, địa chỉ, người phụ trách, chức vụ, SĐT, email công vụ, cán bộ Sở phụ trách.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>2. Sheet <code>BaoCao</code></span>
                  <span className="text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded">
                    {reports.length} báo cáo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lưu danh sách chỉ tiêu báo cáo: mã báo cáo, tên, nội dung, ngày giao, hạn gửi, email nhận, mức độ ưu tiên.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>3. Sheet <code>TienDo_Assignments</code></span>
                  <span className="text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded">
                    {assignments.length} bản ghi
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Trạng thái 129 xã cho từng báo cáo (Chưa gửi, Sắp đến hạn, Quá hạn, Đã gửi, Đã nhận, Đang sửa, Hoàn thành), số lần đôn đốc.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>4. Sheet <code>NhatKy_Logs</code></span>
                  <span className="text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded">
                    {auditLogs.length} sự kiện
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nhật ký thao tác hệ thống, các lần gửi email đôn đốc, ngày giờ cán bộ xã nộp và cán bộ Sở tiếp nhận.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            eReport Ninh Bình · Tích hợp Google Apps Script Web App
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>

      </div>
    </div>
  );
};

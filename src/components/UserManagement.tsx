import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { SAMPLE_APPS_SCRIPT_CODE } from '../data/mockData';
import {
  Users,
  UserPlus,
  KeyRound,
  Lock,
  Unlock,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  Download,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Database,
  Layers,
  Sparkles,
  Save,
  CheckSquare,
  Activity,
  History,
  Info,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const {
    users,
    resetUserPassword,
    updateUserStatus,
    createUser,
    currentUser,
    units,
    reports,
    assignments,
    auditLogs,
    googleScriptConfig,
    updateGoogleScriptConfig,
    syncToGoogleSheet,
    syncFromGoogleSheet,
    testGoogleScriptConnection,
  } = useApp();

  // Admin Tab: 'accounts' | 'google_sheet'
  const [adminTab, setAdminTab] = useState<'accounts' | 'google_sheet'>('google_sheet');

  // Search & Filters for accounts
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New user state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('QUAN_LY_XA');
  const [newTitle, setNewTitle] = useState('');
  const [newUnitId, setNewUnitId] = useState('');

  // Google Sheet admin config state
  const [webAppUrl, setWebAppUrl] = useState(googleScriptConfig.webAppUrl);
  const [sheetId, setSheetId] = useState(googleScriptConfig.sheetId);
  const [autoSync, setAutoSync] = useState(googleScriptConfig.autoSync);
  const [syncInterval, setSyncInterval] = useState(googleScriptConfig.syncIntervalMinutes || 15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sheetSubTab, setSheetSubTab] = useState<'overview' | 'code' | 'structure' | 'history'>('overview');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.ho_ten.toLowerCase().includes(q);
      const matchUser = u.username.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchEmail) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      alert('Vui lòng điền đủ tên đăng nhập và họ tên');
      return;
    }

    createUser({
      username: newUsername.trim(),
      password_hash: '123456', // default initial password
      ho_ten: newName.trim(),
      email: newEmail.trim() || `${newUsername}@sotaichinh.ninhbinh.gov.vn`,
      so_dien_thoai: newPhone.trim() || '0229.3871234',
      role: newRole,
      chuc_danh: newTitle || 'Chuyên viên',
      unit_id: newRole === 'XA_PHUONG' ? newUnitId : undefined,
      trang_thai: 'hoat_dong',
      must_change_password: true,
    });

    alert(
      `Đã tạo tài khoản "${newUsername}" với mật khẩu mặc định "123456". Yêu cầu đổi mật khẩu khi đăng nhập lần đầu.`
    );
    setShowCreateModal(false);
    setNewUsername('');
    setNewName('');
    setNewEmail('');
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Quản trị viên', badge: 'bg-purple-100 text-purple-800' };
      case 'LANH_DAO':
        return { label: 'Lãnh đạo Sở', badge: 'bg-red-100 text-red-800' };
      case 'QUAN_LY_XA':
        return { label: 'Quản lý xã', badge: 'bg-blue-100 text-blue-800' };
      case 'XA_PHUONG':
        return { label: 'Xã / Phường', badge: 'bg-emerald-100 text-emerald-800' };
    }
  };

  // Google Sheet Sync Actions
  const handleSaveSheetConfig = () => {
    updateGoogleScriptConfig({
      webAppUrl,
      sheetId,
      autoSync,
      syncIntervalMinutes: syncInterval,
    });
    setSyncStatusMsg({
      type: 'success',
      text: 'Đã lưu cấu hình Google Apps Script & Google Sheet thành công!',
    });
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  const handleTestConnection = async () => {
    setIsProcessing(true);
    setSyncStatusMsg(null);
    const res = await testGoogleScriptConnection(webAppUrl);
    setIsProcessing(false);
    if (res.success) {
      setSyncStatusMsg({ type: 'success', text: res.message });
      updateGoogleScriptConfig({ webAppUrl, sheetId, autoSync });
    } else {
      setSyncStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleSyncPush = async () => {
    setIsProcessing(true);
    setSyncStatusMsg(null);
    updateGoogleScriptConfig({ webAppUrl, sheetId, autoSync });
    const res = await syncToGoogleSheet();
    setIsProcessing(false);
    if (res.success) {
      setSyncStatusMsg({ type: 'success', text: res.message });
    } else {
      setSyncStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleSyncPull = async () => {
    setIsProcessing(true);
    setSyncStatusMsg(null);
    const res = await syncFromGoogleSheet();
    setIsProcessing(false);
    if (res.success) {
      setSyncStatusMsg({ type: 'success', text: res.message });
    } else {
      setSyncStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleCopyAppsScriptCode = () => {
    navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadBackupJSON = () => {
    const backupData = {
      app: 'eReport Ninh Bình',
      department: 'Phòng Quản Lý Ngân Sách - Sở Tài Chính Ninh Bình',
      exportTime: new Date().toISOString(),
      counts: {
        units: units.length,
        reports: reports.length,
        assignments: assignments.length,
        logs: auditLogs.length,
      },
      units,
      reports,
      assignments,
      auditLogs,
      googleScriptConfig,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eReport_NinhBinh_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRecords = units.length + reports.length + assignments.length + auditLogs.length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Clean Admin Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-700" />
              <span>TRUNG TÂM QUẢN TRỊ HỆ THỐNG eREPORT NINH BÌNH</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Trị Toàn Quyền (ADMIN)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý tài khoản 129 xã/phường, phân quyền cán bộ Sở và cấu hình lưu trữ, đồng bộ dữ liệu với Google Sheet qua Google Apps Script.
            </p>
          </div>

          {/* Tab Switcher Buttons (High-contrast, prominent colored backgrounds) */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setAdminTab('google_sheet')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                adminTab === 'google_sheet'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Đồng Bộ Google Sheet</span>
            </button>

            <button
              onClick={() => setAdminTab('accounts')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                adminTab === 'accounts'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Quản Lý Tài Khoản ({users.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: QUẢN TRỊ ĐỒNG BỘ GOOGLE SHEET & GOOGLE APPS SCRIPT      */}
      {/* ============================================================== */}
      {adminTab === 'google_sheet' && (
        <div className="space-y-6">

          {/* Sync Status Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    Trạng Thái Kết Nối Google Apps Script:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                    {googleScriptConfig.syncStatus === 'syncing' ? 'Đang Đồng Bộ...' : 'Đã Kết Nối Sẵn Sàng'}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Lưu Trữ Dữ Liệu Đồng Bộ Với Script Trên Google Sheet
                </h2>

                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Tất cả thông tin về <strong>129 xã/phường Ninh Bình</strong>, các <strong>chỉ tiêu báo cáo</strong>, <strong>tiến độ nộp</strong>, và <strong>nhật ký đôn đốc</strong> được tự động lưu trữ và đồng bộ hai chiều với bảng tính Google Sheet qua Web App API của Google Apps Script.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span>
                    Lần đồng bộ gần nhất:{' '}
                    <strong className="text-slate-900 font-mono">
                      {googleScriptConfig.lastSyncTime
                        ? new Date(googleScriptConfig.lastSyncTime).toLocaleString('vi-VN')
                        : 'Vừa hoàn thành'}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    Tổng dữ liệu:{' '}
                    <strong className="text-emerald-800 font-bold font-mono">
                      {totalRecords} bản ghi
                    </strong>{' '}
                    (129 đơn vị, {reports.length} báo cáo, {assignments.length} tiến độ)
                  </span>
                </div>
              </div>

              {/* Action Buttons (Solid vibrant backgrounds!) */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleTestConnection}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  title="Kiểm tra tín hiệu ping tới Web App URL"
                >
                  <Activity className="w-4 h-4" />
                  <span>Test Kết Nối</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSyncPull}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  title="Đọc dữ liệu cập nhật từ Google Sheet về Webapp"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Từ Sheet (Pull)</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSyncPush}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  title="Đẩy toàn bộ 129 xã và tiến độ lên Google Sheet"
                >
                  <Upload className="w-4 h-4" />
                  <span>Đồng Bộ Lên Sheet (Push)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Message Notification */}
          {syncStatusMsg && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in duration-150 ${
                syncStatusMsg.type === 'success'
                  ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300 font-medium'
                  : syncStatusMsg.type === 'error'
                  ? 'bg-rose-100/90 text-rose-900 border border-rose-300 font-medium'
                  : 'bg-blue-100/90 text-blue-900 border border-blue-300'
              }`}
            >
              {syncStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
              )}
              <span className="flex-1">{syncStatusMsg.text}</span>
              <button
                onClick={() => setSyncStatusMsg(null)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Sub Navigation inside Google Sheet Admin */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSheetSubTab('overview')}
              className={`pb-3 px-4 transition-all flex items-center gap-1.5 cursor-pointer ${
                sheetSubTab === 'overview'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Cấu Hình Kết Nối & Tự Động Lưu</span>
            </button>

            <button
              onClick={() => setSheetSubTab('code')}
              className={`pb-3 px-4 transition-all flex items-center gap-1.5 cursor-pointer ${
                sheetSubTab === 'code'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Mã Nguồn Google Apps Script (Code.gs)</span>
            </button>

            <button
              onClick={() => setSheetSubTab('structure')}
              className={`pb-3 px-4 transition-all flex items-center gap-1.5 cursor-pointer ${
                sheetSubTab === 'structure'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cấu Trúc 4 Bảng Sheet</span>
            </button>

            <button
              onClick={() => setSheetSubTab('history')}
              className={`pb-3 px-4 transition-all flex items-center gap-1.5 cursor-pointer ${
                sheetSubTab === 'history'
                  ? 'border-b-2 border-emerald-600 text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Nhật Ký Đồng Bộ ({googleScriptConfig.syncLogs?.length || 0})</span>
            </button>
          </div>

          {/* SUB-TAB 1: OVERVIEW & CONFIGURATION */}
          {sheetSubTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2 cols): Configuration Form */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span>Thông Số Kết Nối Google Apps Script Web App</span>
                  </h3>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    <span>Mở Google Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1.5">
                      Đường dẫn Web App của Google Apps Script (doPost / doGet URL):
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={webAppUrl}
                      onChange={(e) => setWebAppUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Nhận từ Apps Script qua: <strong>Triển khai mới (Deploy) → Ứng dụng web (Web app) → Quyền: Bất kỳ ai (Anyone)</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Google Spreadsheet ID (Mã trang tính):
                      </label>
                      <input
                        type="text"
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-1.5">
                        Tên Sheet cơ sở dữ liệu:
                      </label>
                      <input
                        type="text"
                        value={googleScriptConfig.sheetName}
                        readOnly
                        className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-slate-600 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Auto Sync Toggle & Interval */}
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-emerald-950 text-sm">
                          Tự động lưu và đồng bộ hai chiều (Auto-sync)
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-0.5">
                          Tự động đẩy bản ghi lên Google Sheet mỗi khi có thay đổi: xã nộp báo cáo, cán bộ duyệt, gửi đôn đốc, hoặc ban hành báo cáo.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                        <input
                          type="checkbox"
                          checked={autoSync}
                          onChange={(e) => setAutoSync(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-emerald-200/60">
                      <span className="text-slate-700 font-medium">Chu kỳ kiểm tra đồng bộ nền:</span>
                      <select
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(Number(e.target.value))}
                        className="px-2.5 py-1 border border-emerald-300 bg-white rounded-lg text-emerald-900 font-bold text-xs"
                      >
                        <option value={5}>Mỗi 5 phút</option>
                        <option value={15}>Mỗi 15 phút (Khuyên dùng)</option>
                        <option value={30}>Mỗi 30 phút</option>
                        <option value={60}>Mỗi 60 phút</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Settings Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleDownloadBackupJSON}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất File Dự Phòng (.json)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSheetConfig}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu Cấu Hình Kết Nối</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Step-by-step Setup Guide */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Hướng Dẫn Triển Khai 5 Bước
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-900">Tạo Trang tính Google mới</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Truy cập <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> để tạo một Google Sheet trống cho Sở Tài chính.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-900">Mở Tiện ích mở rộng Apps Script</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Trên thanh menu Google Sheets, chọn <strong>Tiện ích mở rộng (Extensions) → Apps Script</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-900">Dán mã nguồn Code.gs</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mở tab <strong>Mã nguồn Apps Script</strong> ở bên trên, nhấn <strong>"Sao chép mã"</strong> và dán thay thế toàn bộ nội dung trong file <code>Code.gs</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                      4
                    </span>
                    <div>
                      <strong className="text-slate-900">Triển khai dưới dạng Web App</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Bấm <strong>Triển khai (Deploy) → Triển khai mới (New deployment)</strong>. Chọn loại: <strong>Ứng dụng web</strong>. Mục "Ai có quyền truy cập": chọn <strong>Bất kỳ ai (Anyone)</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                      5
                    </span>
                    <div>
                      <strong className="text-slate-900">Dán URL & Bấm Đồng bộ</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sao chép Web App URL dạng <code>.../exec</code> dán vào ô bên trái và bấm <strong>Đồng Bộ Lên Sheet</strong>!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSheetSubTab('code')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Xem & Sao Chép Mã Apps Script</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SUB-TAB 2: APPS SCRIPT CODE */}
          {sheetSubTab === 'code' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    Mã Nguồn Google Apps Script (Code.gs) Đã Tối Ưu Cho Sở Tài Chính
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đã cấu hình sẵn tự động tạo 4 sheets: <code>DonVi_129</code>, <code>BaoCao</code>, <code>TienDo_Assignments</code>, <code>NhatKy_Logs</code> với tiêu đề cột màu chuẩn nhận diện tỉnh Ninh Bình.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAppsScriptCode}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã Sao Chép Vào Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao Chép Toàn Bộ Mã (Code.gs)</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto max-h-96 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner">
                {SAMPLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}

          {/* SUB-TAB 3: SHEETS STRUCTURE */}
          {sheetSubTab === 'structure' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    Sheet 1: <code>DonVi_129</code>
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-mono font-bold">
                    129 xã/phường
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Danh bạ đầy đủ 129 đơn vị xã, phường, thị trấn: Mã đơn vị, Tên, Loại hình, Huyện/TP, Địa chỉ, Người phụ trách, Chức vụ, Số điện thoại, Email công vụ tiếp nhận, Cán bộ Sở phụ trách.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                  ID | Mã đơn vị | Tên đơn vị | Loại | Huyện/TP | Người phụ trách | SĐT | Email | Trạng thái
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    Sheet 2: <code>BaoCao</code>
                  </span>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-mono font-bold">
                    {reports.length} chỉ tiêu báo cáo
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Danh mục các báo cáo do Sở Tài chính ban hành: Mã báo cáo, Tên báo cáo, Nội dung yêu cầu, Ngày giao, Hạn gửi, Giờ hạn, Email nhận, Người ban hành, Mức độ ưu tiên.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                  ID | Mã báo cáo | Tên báo cáo | Ngày giao | Hạn gửi | Giờ hạn | Email nhận | Mức độ
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    Sheet 3: <code>TienDo_Assignments</code>
                  </span>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-mono font-bold">
                    {assignments.length} bản ghi tiến độ
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Trạng thái trực tiếp của từng xã cho từng báo cáo (Chưa gửi, Sắp đến hạn, Quá hạn, Đã xác nhận gửi, Sở đã nhận, Yêu cầu sửa đổi, Hoàn thành), số ngày quá hạn, số lần nhắc nhở.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                  ID | Mã Báo Cáo | Mã Đơn Vị | Trạng Thái | Ngày nộp | Sở nhận | Yêu cầu sửa | Số lần nhắc
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    Sheet 4: <code>NhatKy_Logs</code>
                  </span>
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-mono font-bold">
                    {auditLogs.length} sự kiện
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Nhật ký thao tác hệ thống, theo dõi toàn bộ các lần gửi email đôn đốc, ngày giờ xác nhận nộp báo cáo, nội dung yêu cầu sửa đổi và các thay đổi phân công.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700">
                  ID | Thời gian | Người thực hiện | Vai trò | Hành động | Chi tiết sự kiện
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: SYNC HISTORY */}
          {sheetSubTab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-slate-800">
                  Lịch Sử Các Lần Đồng Bộ Dữ Liệu Với Google Apps Script
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {googleScriptConfig.syncLogs?.length || 0} bản ghi gần nhất
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-3 px-4">Thời Gian</th>
                      <th className="py-3 px-4">Thao Tác</th>
                      <th className="py-3 px-4 text-center">Số Bản Ghi</th>
                      <th className="py-3 px-4 text-center">Trạng Thái</th>
                      <th className="py-3 px-4">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(googleScriptConfig.syncLogs || []).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                          {new Date(log.time).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              log.action === 'PUSH'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action === 'PULL'
                                ? 'bg-blue-100 text-blue-800'
                                : log.action === 'AUTO'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                          {log.rows > 0 ? `${log.rows} dòng` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (ACCOUNTS)               */}
      {/* ============================================================== */}
      {adminTab === 'accounts' && (
        <div className="space-y-5">
          {/* Action Row */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo họ tên, tên đăng nhập, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-purple-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-700 text-xs font-semibold focus:outline-hidden"
              >
                <option value="all">Tất cả vai trò ({users.length} tài khoản)</option>
                <option value="ADMIN">ADMIN</option>
                <option value="LANH_DAO">LÃNH ĐẠO SỞ</option>
                <option value="QUAN_LY_XA">QUẢN LÝ XÃ</option>
                <option value="XA_PHUONG">XÃ / PHƯỜNG</option>
              </select>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Người Dùng Mới</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-3.5 px-4">Tên Đăng Nhập</th>
                    <th className="py-3.5 px-4">Họ Và Tên</th>
                    <th className="py-3.5 px-4">Vai Trò Hệ Thống</th>
                    <th className="py-3.5 px-4">Chức Danh / Đơn Vị</th>
                    <th className="py-3.5 px-4">Email & SĐT</th>
                    <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-center">Mật Khẩu Lần Đầu</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const roleBadge = getRoleLabel(u.role);
                    const isCurrent = currentUser.id === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {u.username}
                          {isCurrent && (
                            <span className="ml-2 text-[10px] text-purple-700 font-sans font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                              Đang dùng
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {u.ho_ten}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${roleBadge.badge}`}>
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {u.chuc_danh || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">{u.email}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.so_dien_thoai}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              u.trang_thai === 'hoat_dong'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {u.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {u.must_change_password ? (
                            <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              Bắt buộc đổi (123456)
                            </span>
                          ) : (
                            <span className="text-emerald-700 text-[11px] font-medium">Đã cập nhật</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Reset Password Button (Solid vibrant Amber) */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Reset mật khẩu tài khoản "${u.username}" về mặc định "123456"?`)) {
                                  resetUserPassword(u.id);
                                  alert(`Đã đặt lại mật khẩu của ${u.ho_ten} về 123456.`);
                                }
                              }}
                              className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                              title="Reset mật khẩu về 123456"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Reset MK</span>
                            </button>

                            {/* Lock/Unlock Button (Solid vibrant Rose/Emerald) */}
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newStatus = u.trang_thai === 'hoat_dong' ? 'khoa' : 'hoat_dong';
                                  updateUserStatus(u.id, newStatus);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] text-white transition-all shadow-2xs flex items-center gap-1 cursor-pointer ${
                                  u.trang_thai === 'hoat_dong'
                                    ? 'bg-rose-600 hover:bg-rose-700 active:scale-95'
                                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                                }`}
                                title={u.trang_thai === 'hoat_dong' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                              >
                                {u.trang_thai === 'hoat_dong' ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Khóa</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Mở</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 border border-slate-200 my-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Thêm Tài Khoản Người Dùng Mới
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mật khẩu mặc định được đặt là <strong>123456</strong>, hệ thống bắt buộc đổi mật khẩu khi đăng nhập lần đầu.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="nguyen_van_a"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Vai trò hệ thống <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                  >
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                    <option value="LANH_DAO">LÃNH ĐẠO SỞ (Giám sát toàn tỉnh)</option>
                    <option value="QUAN_LY_XA">QUẢN LÝ XÃ (Phụ trách nhóm xã)</option>
                    <option value="XA_PHUONG">XÃ / PHƯỜNG (Nộp báo cáo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Chức vụ / Chức danh
                  </label>
                  <input
                    type="text"
                    placeholder="Chuyên viên Phòng Ngân sách"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              {newRole === 'XA_PHUONG' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Gắn với đơn vị Xã/Phường
                  </label>
                  <select
                    value={newUnitId}
                    onChange={(e) => setNewUnitId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.ten_don_vi} ({u.huyen_tp})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-lg font-bold shadow-md cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

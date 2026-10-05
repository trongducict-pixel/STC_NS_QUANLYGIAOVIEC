import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Shield,
  Building2,
  Users,
  ChevronDown,
  KeyRound,
  RotateCcw,
  Sliders,
  History,
  Check,
  FolderKanban,
  FileSpreadsheet,
  BellRing,
  BarChart3,
  Home,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenAuditLogs: () => void;
  onOpenChangePassword: () => void;
  onOpenGoogleSheetSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSettings,
  onOpenAuditLogs,
  onOpenChangePassword,
  onOpenGoogleSheetSync,
}) => {
  const { currentUser, users, switchUser, resetDatabase } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const adminUsers = users.filter((u) => u.role === 'ADMIN');
  const leaderUsers = users.filter((u) => u.role === 'LANH_DAO');
  const officerUsers = users.filter((u) => u.role === 'QUAN_LY_XA');
  const communeUsers = users.filter((u) => u.role === 'XA_PHUONG');

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Quản trị viên', bg: 'bg-purple-100 text-purple-800' };
      case 'LANH_DAO':
        return { label: 'Lãnh đạo Sở', bg: 'bg-red-100 text-red-800' };
      case 'QUAN_LY_XA':
        return { label: 'Quản lý xã', bg: 'bg-blue-100 text-blue-800' };
      case 'XA_PHUONG':
        return { label: 'Xã / Phường', bg: 'bg-emerald-100 text-emerald-800' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);
  const isCommune = currentUser.role === 'XA_PHUONG';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab(isCommune ? 'commune_portal' : 'home')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold text-base shadow-sm">
                eR
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold text-[#0F2C59] tracking-tight leading-tight">
                  eReport Ninh Bình
                </span>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline leading-none mt-0.5">
                  Phòng Ngân Sách · Sở Tài Chính
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean, Unboxed text links) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            {isCommune ? (
              <>
                <button
                  onClick={() => setCurrentTab('commune_portal')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    currentTab === 'commune_portal'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Nhiệm vụ Báo cáo
                </button>
                <button
                  onClick={() => setCurrentTab('commune_profile')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    currentTab === 'commune_profile'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Thông tin Đơn vị
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('home')}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                    currentTab === 'home'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  Trang chủ
                </button>

                <button
                  onClick={() => setCurrentTab('view_reports')}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                    currentTab === 'view_reports'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  Xem Báo Cáo
                </button>

                <button
                  onClick={() => setCurrentTab('manage_reports')}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                    currentTab === 'manage_reports'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Quản Lý Báo Cáo
                </button>

                <button
                  onClick={() => setCurrentTab('reminders')}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                    currentTab === 'reminders'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  Nhắc Nhở
                </button>

                <button
                  onClick={() => setCurrentTab('statistics')}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
                    currentTab === 'statistics'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Thống Kê
                </button>

                <button
                  onClick={() => setCurrentTab('units')}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    currentTab === 'units'
                      ? 'text-[#0F2C59] font-bold bg-slate-100'
                      : 'hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  129 Xã / Phường
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setCurrentTab('users')}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      currentTab === 'users'
                        ? 'text-[#0F2C59] font-bold bg-slate-100'
                        : 'hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Quản Trị
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Zone 3: Actions & Quick Role Switcher */}
          <div className="flex items-center gap-2">
            
            {/* Google Sheets Sync Quick Button for Admin / Leadership */}
            {(isAdmin || currentUser.role === 'LANH_DAO') && (
              <button
                onClick={onOpenGoogleSheetSync}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
                title="Đồng bộ dữ liệu với Google Sheet và Google Apps Script"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                <span>Google Sheet</span>
              </button>
            )}

            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                title="Chuyển đổi vai trò người dùng (Admin, Lãnh đạo Sở, Quản lý xã, Xã/Phường)"
              >
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
                <span className="hidden lg:inline text-slate-800 font-semibold max-w-[120px] truncate">
                  {currentUser.ho_ten}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-700">CHUYỂN ĐỔI VAI TRÒ ĐỂ TRẢI NGHIỆM</p>
                    <p className="text-[11px] text-slate-500">Mô phỏng 4 nhóm đối tượng theo nghiệp vụ</p>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {/* Admin */}
                    <div className="p-2">
                      <div className="px-2 py-1 text-[11px] font-bold text-purple-700 uppercase flex items-center gap-1">
                        <Shield className="w-3 h-3" /> 1. Admin (Toàn quyền)
                      </div>
                      {adminUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowRoleDropdown(false);
                            setCurrentTab('home');
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between hover:bg-purple-50 transition-colors ${
                            currentUser.id === u.id ? 'bg-purple-50 font-semibold text-purple-900' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{u.ho_ten}</div>
                            <div className="text-[10px] text-slate-500">{u.chuc_danh || u.username}</div>
                          </div>
                          {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-purple-700" />}
                        </button>
                      ))}
                    </div>

                    {/* Lãnh đạo Sở */}
                    <div className="p-2">
                      <div className="px-2 py-1 text-[11px] font-bold text-red-700 uppercase flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> 2. Lãnh đạo Sở (Xem toàn tỉnh)
                      </div>
                      {leaderUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowRoleDropdown(false);
                            setCurrentTab('home');
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between hover:bg-red-50 transition-colors ${
                            currentUser.id === u.id ? 'bg-red-50 font-semibold text-red-900' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{u.ho_ten}</div>
                            <div className="text-[10px] text-slate-500">{u.chuc_danh}</div>
                          </div>
                          {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-red-700" />}
                        </button>
                      ))}
                    </div>

                    {/* Quản lý xã */}
                    <div className="p-2">
                      <div className="px-2 py-1 text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1">
                        <Users className="w-3 h-3" /> 3. Quản lý xã (Phụ trách nhóm xã)
                      </div>
                      {officerUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowRoleDropdown(false);
                            setCurrentTab('home');
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between hover:bg-blue-50 transition-colors ${
                            currentUser.id === u.id ? 'bg-blue-50 font-semibold text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{u.ho_ten}</div>
                            <div className="text-[10px] text-slate-500">{u.chuc_danh}</div>
                          </div>
                          {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-blue-700" />}
                        </button>
                      ))}
                    </div>

                    {/* Xã / Phường */}
                    <div className="p-2">
                      <div className="px-2 py-1 text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> 4. Đơn vị Xã/Phường
                      </div>
                      {communeUsers.slice(0, 5).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setShowRoleDropdown(false);
                            setCurrentTab('commune_portal');
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                            currentUser.id === u.id ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{u.ho_ten}</div>
                            <div className="text-[10px] text-slate-500">{u.username}</div>
                          </div>
                          {currentUser.id === u.id && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu & System Options */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowRoleDropdown(false);
                }}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Tùy chọn hệ thống"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-semibold text-slate-800">{currentUser.ho_ten}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenChangePassword();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    Đổi mật khẩu
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuditLogs();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Nhật ký hệ thống (Audit Log)
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenGoogleSheetSync();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 font-medium"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Đồng bộ Google Sheets
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        Cấu hình thời gian cảnh báo
                      </button>
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      if (confirm('Khôi phục dữ liệu ban đầu gồm chuẩn 129 xã của Ninh Bình và báo cáo mẫu?')) {
                        resetDatabase();
                        setShowUserMenu(false);
                      }
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    Khôi phục dữ liệu chuẩn 129 xã
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

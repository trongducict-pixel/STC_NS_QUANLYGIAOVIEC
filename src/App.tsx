import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HomeControlCenter } from './components/HomeControlCenter';
import { FolderViewReports } from './components/FolderViewReports';
import { ReportManagement } from './components/ReportManagement';
import { RemindersHub } from './components/RemindersHub';
import { StatisticsHub } from './components/StatisticsHub';
import { UnitsDirectory } from './components/UnitsDirectory';
import { UserManagement } from './components/UserManagement';
import { CommunePortal } from './components/CommunePortal';
import { SubmitReportModal } from './components/SubmitReportModal';
import { ReminderModal } from './components/ReminderModal';
import { RevisionModal } from './components/RevisionModal';
import { UnitHistoryModal } from './components/UnitHistoryModal';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { AuditLogModal } from './components/AuditLogModal';
import { ForcePasswordChangeModal } from './components/ForcePasswordChangeModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { ReportAssignment } from './types';

function MainApp() {
  const { currentUser } = useApp();

  // Active view tab: 'home' | 'view_reports' | 'manage_reports' | 'reminders' | 'statistics' | 'units' | 'users' | 'commune_portal'
  const [currentTab, setCurrentTab] = useState<string>(
    currentUser.role === 'XA_PHUONG' ? 'commune_portal' : 'home'
  );

  // Subview parameter for drill-down into view_reports
  const [drillSubView, setDrillSubView] = useState<string>('root');
  const [drillParamId, setDrillParamId] = useState<string | undefined>(undefined);

  // Sync tab when user switches role
  useEffect(() => {
    if (currentUser.role === 'XA_PHUONG') {
      setCurrentTab('commune_portal');
    } else if (currentTab === 'commune_portal' || currentTab === 'commune_profile') {
      setCurrentTab('home');
    }
  }, [currentUser.role]);

  // Navigate helper from Home to specific Folder / View
  const handleHomeNavigate = (module: string, subView?: string, paramId?: string) => {
    if (module === 'view_reports') {
      setDrillSubView(subView || 'root');
      setDrillParamId(paramId);
      setCurrentTab('view_reports');
    } else {
      setCurrentTab(module);
    }
  };

  // Modal active targets
  const [activeSubmitAssignment, setActiveSubmitAssignment] =
    useState<ReportAssignment | null>(null);
  const [activeReminderAssignment, setActiveReminderAssignment] =
    useState<ReportAssignment | null>(null);
  const [activeRevisionAssignment, setActiveRevisionAssignment] =
    useState<ReportAssignment | null>(null);
  const [activeHistoryAssignment, setActiveHistoryAssignment] =
    useState<ReportAssignment | null>(null);

  // System modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showGoogleSheetSyncModal, setShowGoogleSheetSyncModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'view_reports') {
            setDrillSubView('root');
            setDrillParamId(undefined);
          }
          setCurrentTab(tab);
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAuditLogs={() => setShowAuditLogsModal(true)}
        onOpenChangePassword={() => setShowPasswordChangeModal(true)}
        onOpenGoogleSheetSync={() => setShowGoogleSheetSyncModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 1. HOME: TRUNG TÂM ĐIỀU HÀNH & CÁC THƯ MỤC LỚN */}
        {currentTab === 'home' && (
          <HomeControlCenter
            onNavigate={handleHomeNavigate}
            onOpenGoogleSheetSync={() => setShowGoogleSheetSyncModal(true)}
          />
        )}

        {/* 2. XEM BÁO CÁO: CẤU TRÚC THƯ MỤC NHIỀU TẦNG (TỔNG HỢP, THEO LOẠI, THEO ĐƠN VỊ) */}
        {currentTab === 'view_reports' && (
          <FolderViewReports
            initialSubView={drillSubView}
            initialParamId={drillParamId}
            onGoHome={() => setCurrentTab('home')}
            onOpenReminderModal={(assignment) =>
              setActiveReminderAssignment(assignment)
            }
            onOpenRevisionModal={(assignment) =>
              setActiveRevisionAssignment(assignment)
            }
            onOpenHistoryModal={(assignment) =>
              setActiveHistoryAssignment(assignment)
            }
          />
        )}

        {/* 3. QUẢN LÝ BÁO CÁO: BAN HÀNH & CẤU HÌNH TIẾN ĐỘ */}
        {currentTab === 'manage_reports' && (
          <ReportManagement
            onOpenReminderModal={(assignment) =>
              setActiveReminderAssignment(assignment)
            }
            onOpenRevisionModal={(assignment) =>
              setActiveRevisionAssignment(assignment)
            }
            onOpenHistoryModal={(assignment) =>
              setActiveHistoryAssignment(assignment)
            }
          />
        )}

        {/* 4. NHẮC NHỞ & ĐÔN ĐỐC */}
        {currentTab === 'reminders' && (
          <RemindersHub
            onOpenReminderModal={(assignment) =>
              setActiveReminderAssignment(assignment)
            }
            onOpenHistoryModal={(assignment) =>
              setActiveHistoryAssignment(assignment)
            }
          />
        )}

        {/* 5. THỐNG KÊ & XẾP HẠNG 8 HUYỆN/TP */}
        {currentTab === 'statistics' && <StatisticsHub />}

        {/* 6. DANH BẠ 129 XÃ / PHƯỜNG */}
        {currentTab === 'units' && <UnitsDirectory />}

        {/* 7. QUẢN TRỊ NGƯỜI DÙNG & PHÂN QUYỀN (ADMIN) */}
        {currentTab === 'users' && currentUser.role === 'ADMIN' && (
          <UserManagement />
        )}

        {/* 8. DÀNH CHO XÃ / PHƯỜNG: NỘP BÁO CÁO & XÁC NHẬN */}
        {(currentTab === 'commune_portal' || currentTab === 'commune_profile') && (
          <CommunePortal
            onSubmitReport={(assignment) =>
              setActiveSubmitAssignment(assignment)
            }
            onOpenHistoryModal={(assignment) =>
              setActiveHistoryAssignment(assignment)
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">
              Sở Tài Chính Ninh Bình · Phòng Quản Lý Ngân Sách
            </span>
            <span className="hidden sm:inline text-slate-300 mx-2">|</span>
            <span className="block sm:inline">
              Hệ thống theo dõi & đôn đốc tiến độ báo cáo 129 Xã, Phường
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            eReport Ninh Bình v2.8 · Tối ưu tư duy quản lý theo thư mục
          </div>
        </div>
      </footer>

      {/* Modals */}
      {activeSubmitAssignment && (
        <SubmitReportModal
          assignment={activeSubmitAssignment}
          onClose={() => setActiveSubmitAssignment(null)}
        />
      )}

      {activeReminderAssignment && (
        <ReminderModal
          assignment={activeReminderAssignment}
          onClose={() => setActiveReminderAssignment(null)}
        />
      )}

      {activeRevisionAssignment && (
        <RevisionModal
          assignment={activeRevisionAssignment}
          onClose={() => setActiveRevisionAssignment(null)}
        />
      )}

      {activeHistoryAssignment && (
        <UnitHistoryModal
          assignment={activeHistoryAssignment}
          onClose={() => setActiveHistoryAssignment(null)}
        />
      )}

      {showSettingsModal && (
        <SystemSettingsModal onClose={() => setShowSettingsModal(false)} />
      )}

      {showAuditLogsModal && (
        <AuditLogModal onClose={() => setShowAuditLogsModal(false)} />
      )}

      {showGoogleSheetSyncModal && (
        <GoogleSheetSyncModal onClose={() => setShowGoogleSheetSyncModal(false)} />
      )}

      {/* Mandatory Password Change for accounts with must_change_password */}
      <ForcePasswordChangeModal
        isOpen={currentUser.must_change_password || showPasswordChangeModal}
        onSuccess={() => setShowPasswordChangeModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

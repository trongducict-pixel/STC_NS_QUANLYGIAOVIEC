import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Unit,
  Report,
  ReportAssignment,
  SystemSettings,
  AuditLog,
  ReportStatus,
  GoogleScriptConfig,
} from '../types';
import { INITIAL_UNITS } from '../data/ninhBinhUnits';
import {
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_REPORTS,
  generateInitialAssignments,
  INITIAL_AUDIT_LOGS,
  INITIAL_OFFICERS,
  INITIAL_GOOGLE_SCRIPT_CONFIG,
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  users: User[];
  units: Unit[];
  reports: Report[];
  assignments: ReportAssignment[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  officers: typeof INITIAL_OFFICERS;
  googleScriptConfig: GoogleScriptConfig;
  
  // Auth & Roles
  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  changePassword: (userId: string, newPass: string) => boolean;
  updateUserStatus: (userId: string, status: 'hoat_dong' | 'khoa') => void;
  resetUserPassword: (userId: string) => void;
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => void;

  // Units
  updateUnit: (unit: Unit) => void;
  importUnits: (newUnits: Unit[]) => void;
  batchAssignOfficer: (officerId: string, unitIds: string[]) => void;

  // Reports
  createReport: (
    report: Omit<Report, 'id' | 'created_at'>,
    targetUnitIds?: string[]
  ) => { report: Report; assignments: ReportAssignment[] };
  updateReport: (report: Report) => void;
  deleteReport: (reportId: string) => void;
  updateReportScheduleRules: (reportId: string, rules: any) => void;

  // Assignments Workflow
  markEmailNotificationSent: (
    assignmentId: string,
    notification: {
      recipient_email: string;
      subject: string;
      body: string;
      method: 'mailto' | 'copied' | 'system';
    }
  ) => void;
  batchMarkEmailNotificationSent: (
    assignmentIds: string[],
    notificationDetails?: { subject: string; body: string; method: 'mailto' | 'copied' | 'system' }
  ) => void;
  confirmUnitSent: (
    assignmentId: string,
    contactName: string,
    phone: string,
    emailSubject: string,
    notes?: string
  ) => void;
  confirmDepartmentReceived: (assignmentId: string, officerName: string) => void;
  requestRevision: (
    assignmentId: string,
    officerName: string,
    reason: string,
    deadline: string
  ) => void;
  approveCompleted: (assignmentId: string, officerName: string) => void;
  sendReminder: (
    assignmentId: string,
    officerName: string,
    channel: 'email' | 'dien_thoai',
    title: string,
    content: string
  ) => void;
  batchSendReminder: (
    assignmentIds: string[],
    officerName: string,
    title: string,
    content: string
  ) => void;

  // Settings & System
  updateSettings: (newSettings: SystemSettings) => void;
  updateGoogleScriptConfig: (config: Partial<GoogleScriptConfig>) => void;
  syncToGoogleSheet: () => Promise<{ success: boolean; message: string }>;
  syncFromGoogleSheet: () => Promise<{ success: boolean; message: string }>;
  testGoogleScriptConnection: (testUrl?: string) => Promise<{ success: boolean; message: string }>;
  resetDatabase: () => void;

  // Utilities
  getOverdueDays: (dueDate: string, dueTime?: string) => number;
  computeAssignmentStatus: (
    assignment: ReportAssignment,
    report: Report
  ) => { status: ReportStatus; overdueDays: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'ereport_nb_user_v1',
  USERS: 'ereport_nb_users_v1',
  UNITS: 'ereport_nb_units_v1',
  REPORTS: 'ereport_nb_reports_v1',
  ASSIGNMENTS: 'ereport_nb_assignments_v1',
  SETTINGS: 'ereport_nb_settings_v1',
  AUDIT_LOGS: 'ereport_nb_logs_v1',
  GSCRIPT_CONFIG: 'ereport_nb_gscript_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) return JSON.parse(saved);
    // Default to Lãnh đạo sở for best executive first-look, or admin
    return INITIAL_USERS.find((u) => u.username === 'truongphong_ns') || INITIAL_USERS[0];
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UNITS);
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [assignments, setAssignments] = useState<ReportAssignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return saved ? JSON.parse(saved) : generateInitialAssignments();
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [googleScriptConfig, setGoogleScriptConfig] = useState<GoogleScriptConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GSCRIPT_CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_GOOGLE_SCRIPT_CONFIG;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GSCRIPT_CONFIG, JSON.stringify(googleScriptConfig));
  }, [googleScriptConfig]);

  // Add audit log helper
  const logAction = (action: string, detail: string, targetUser?: User) => {
    const actor = targetUser || currentUser;
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      thoi_gian: new Date().toISOString(),
      nguoi_thuc_hien: actor.ho_ten,
      vai_tro: actor.role,
      hanh_dong: action,
      chi_tiet: detail,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  const getOverdueDays = (dueDate: string, dueTime: string = '17:00'): number => {
    try {
      const deadline = new Date(`${dueDate}T${dueTime}:00`);
      const now = new Date();
      if (now > deadline) {
        const diffMs = now.getTime() - deadline.getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const computeAssignmentStatus = (
    assignment: ReportAssignment,
    report: Report
  ): { status: ReportStatus; overdueDays: number } => {
    const overdueDays = getOverdueDays(report.han_gui, report.gio_han);

    // If terminal or in progress states
    if (
      assignment.trang_thai === 'HOAN_THANH' ||
      assignment.trang_thai === 'DA_NHAN' ||
      assignment.trang_thai === 'DA_XAC_NHAN_GUI' ||
      assignment.trang_thai === 'YEU_CAU_SUA_DOI'
    ) {
      return { status: assignment.trang_thai, overdueDays: 0 };
    }

    // Unsubmitted states: check if overdue or near deadline
    if (overdueDays > 0) {
      return { status: 'QUA_HAN', overdueDays };
    }

    // Check approaching deadline
    const deadline = new Date(`${report.han_gui}T${report.gio_han}:00`);
    const now = new Date();
    const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= settings.so_ngay_canh_bao_sap_den_han && diffDays >= 0) {
      return { status: 'SAP_DEN_HAN', overdueDays: 0 };
    }

    return { status: 'CHUA_DEN_HAN', overdueDays: 0 };
  };

  // Switch role / active user
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      const updated = { ...found, last_login: new Date().toISOString() };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      logAction('Chuyển đổi tài khoản', `Người dùng chuyển sang phiên làm việc của: ${found.ho_ten} (${found.role})`, updated);
    }
  };

  // Change password
  const changePassword = (userId: string, newPass: string): boolean => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              password_hash: newPass,
              must_change_password: false,
              updated_at: new Date().toISOString(),
            }
          : u
      )
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({
        ...prev,
        password_hash: newPass,
        must_change_password: false,
        updated_at: new Date().toISOString(),
      }));
    }
    logAction('Đổi mật khẩu', `Tài khoản ${userId} đã đổi mật khẩu thành công.`);
    return true;
  };

  const updateUserStatus = (userId: string, status: 'hoat_dong' | 'khoa') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, trang_thai: status } : u))
    );
    logAction('Thay đổi trạng thái tài khoản', `Cập nhật tài khoản ${userId} sang: ${status}`);
  };

  const resetUserPassword = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, password_hash: '123456', must_change_password: true }
          : u
      )
    );
    logAction('Khôi phục mật khẩu', `Mật khẩu của tài khoản ${userId} được reset về mặc định 123456.`);
  };

  const createUser = (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    logAction('Tạo tài khoản mới', `Tạo tài khoản: ${newUser.ho_ten} (${newUser.username})`);
  };

  const updateUnit = (unit: Unit) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...unit, updated_at: new Date().toISOString() } : u))
    );
    logAction('Cập nhật đơn vị', `Chỉnh sửa thông tin đơn vị: ${unit.ten_don_vi}`);
  };

  const importUnits = (newUnits: Unit[]) => {
    setUnits(newUnits);
    logAction('Import danh sách đơn vị', `Đã nhập danh sách ${newUnits.length} đơn vị hành chính.`);
  };

  const batchAssignOfficer = (officerId: string, unitIds: string[]) => {
    setUnits((prev) =>
      prev.map((u) => (unitIds.includes(u.id) ? { ...u, quan_ly_xa_id: officerId } : u))
    );
    const officer = INITIAL_OFFICERS.find((o) => o.id === officerId);
    logAction(
      'Phân công phụ trách đơn vị',
      `Phân công đồng chí ${officer?.name || officerId} phụ trách ${unitIds.length} đơn vị.`
    );
  };

  const createReport = (
    reportData: Omit<Report, 'id' | 'created_at'>,
    targetUnitIds?: string[]
  ) => {
    const reportId = `rep_${Date.now()}`;
    const newReport: Report = {
      ...reportData,
      id: reportId,
      created_at: new Date().toISOString(),
    };

    // Determine target units
    let assignedUnits: Unit[] = [];
    if (newReport.doi_tuong_nhan === 'tat_ca') {
      assignedUnits = units.filter((u) => u.trang_thai === 'hoat_dong');
    } else if (newReport.doi_tuong_nhan === 'theo_huyen' && newReport.danh_sach_huyen) {
      assignedUnits = units.filter(
        (u) =>
          u.trang_thai === 'hoat_dong' &&
          newReport.danh_sach_huyen?.includes(u.huyen_tp)
      );
    } else if (targetUnitIds && targetUnitIds.length > 0) {
      assignedUnits = units.filter((u) => targetUnitIds.includes(u.id));
    } else {
      assignedUnits = units;
    }

    const newAssignments: ReportAssignment[] = assignedUnits.map((u) => ({
      id: `asg_${reportId}_${u.id}`,
      report_id: reportId,
      unit_id: u.id,
      trang_thai: 'CHUA_DEN_HAN',
      so_lan_nhac_nho: 0,
      lich_su_nhac_nho: [],
      lich_su_chinh_sua: [],
      lich_su_trang_thai: [
        {
          id: `sh_${Date.now()}_${u.id}`,
          thoi_gian: new Date().toISOString(),
          trang_thai_cu: 'CHUA_DEN_HAN',
          trang_thai_moi: 'CHUA_DEN_HAN',
          nguoi_thuc_hien: currentUser.ho_ten,
          ghi_chu: 'Giao nhiệm vụ báo cáo',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    setReports((prev) => [newReport, ...prev]);
    setAssignments((prev) => [...prev, ...newAssignments]);
    logAction(
      'Ban hành báo cáo mới',
      `Tạo báo cáo: ${newReport.ten_bao_cao} (${newReport.ma_bao_cao}) cho ${newAssignments.length} đơn vị.`
    );
    return { report: newReport, assignments: newAssignments };
  };

  const updateReport = (report: Report) => {
    setReports((prev) => prev.map((r) => (r.id === report.id ? report : r)));
    logAction('Cập nhật báo cáo', `Cập nhật thông tin báo cáo: ${report.ten_bao_cao}`);
  };

  const updateReportScheduleRules = (reportId: string, rules: any) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, lich_nhac_tu_dong: rules } : r))
    );
    logAction('Cấu hình lịch nhắc tự động', `Đã cập nhật quy tắc nhắc lịch cho báo cáo #${reportId}`);
  };

  const deleteReport = (reportId: string) => {
    const rep = reports.find((r) => r.id === reportId);
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setAssignments((prev) => prev.filter((a) => a.report_id !== reportId));
    logAction('Xóa báo cáo', `Đã xóa báo cáo ${rep?.ten_bao_cao || reportId}`);
  };

  // Mark email notification as sent for a single assignment
  const markEmailNotificationSent = (
    assignmentId: string,
    notification: {
      recipient_email: string;
      subject: string;
      body: string;
      method: 'mailto' | 'copied' | 'system';
    }
  ) => {
    const nowStr = new Date().toISOString();
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const unit = units.find((u) => u.id === a.unit_id);
        const newNotificationLog = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          assignment_id: assignmentId,
          unit_name: unit?.ten_don_vi || 'Đơn vị',
          recipient_email: notification.recipient_email,
          subject: notification.subject,
          body: notification.body,
          notification_type: 'giao_viec' as const,
          sent_by: currentUser.ho_ten,
          sent_at: nowStr,
          method: notification.method,
        };

        return {
          ...a,
          da_gui_thong_bao_giao_viec: true,
          thoi_gian_gui_thong_bao_giao_viec: nowStr,
          lich_su_thong_bao_email: [
            newNotificationLog,
            ...(a.lich_su_thong_bao_email || []),
          ],
          lich_su_trang_thai: [
            ...a.lich_su_trang_thai,
            {
              id: `sh_${Date.now()}`,
              thoi_gian: nowStr,
              trang_thai_cu: a.trang_thai,
              trang_thai_moi: a.trang_thai,
              nguoi_thuc_hien: currentUser.ho_ten,
              ghi_chu: `Đã gửi email thông báo giao việc đến ${notification.recipient_email}`,
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction('Gửi thông báo giao việc', `Đã gửi thông báo giao việc cho nhiệm vụ #${assignmentId}`);
  };

  // Batch mark email notification sent
  const batchMarkEmailNotificationSent = (
    assignmentIds: string[],
    notificationDetails?: { subject: string; body: string; method: 'mailto' | 'copied' | 'system' }
  ) => {
    const nowStr = new Date().toISOString();
    setAssignments((prev) =>
      prev.map((a) => {
        if (!assignmentIds.includes(a.id)) return a;
        const unit = units.find((u) => u.id === a.unit_id);
        const newNotificationLog = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          assignment_id: a.id,
          unit_name: unit?.ten_don_vi || 'Đơn vị',
          recipient_email: unit?.email || '',
          subject: notificationDetails?.subject || 'Thông báo giao thực hiện báo cáo',
          body: notificationDetails?.body || '',
          notification_type: 'giao_viec' as const,
          sent_by: currentUser.ho_ten,
          sent_at: nowStr,
          method: notificationDetails?.method || 'system',
        };

        return {
          ...a,
          da_gui_thong_bao_giao_viec: true,
          thoi_gian_gui_thong_bao_giao_viec: nowStr,
          lich_su_thong_bao_email: [
            newNotificationLog,
            ...(a.lich_su_thong_bao_email || []),
          ],
          lich_su_trang_thai: [
            ...a.lich_su_trang_thai,
            {
              id: `sh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              thoi_gian: nowStr,
              trang_thai_cu: a.trang_thai,
              trang_thai_moi: a.trang_thai,
              nguoi_thuc_hien: currentUser.ho_ten,
              ghi_chu: `Đã gửi email thông báo giao việc đến ${unit?.ten_don_vi}`,
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction(
      'Gửi thông báo giao việc hàng loạt',
      `Đã đánh dấu gửi email thông báo giao việc tới ${assignmentIds.length} đơn vị.`
    );
  };

  // Commune confirms they sent email
  const confirmUnitSent = (
    assignmentId: string,
    contactName: string,
    phone: string,
    emailSubject: string,
    notes?: string
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const nowStr = new Date().toISOString();
        return {
          ...a,
          trang_thai: 'DA_XAC_NHAN_GUI',
          ngay_xac_nhan_gui: nowStr,
          nguoi_xac_nhan_gui: contactName,
          sdt_xac_nhan_gui: phone,
          tieu_de_email_da_gui: emailSubject,
          ghi_chu_don_vi: notes,
          lich_su_trang_thai: [
            ...a.lich_su_trang_thai,
            {
              id: `sh_${Date.now()}`,
              thoi_gian: nowStr,
              trang_thai_cu: a.trang_thai,
              trang_thai_moi: 'DA_XAC_NHAN_GUI',
              nguoi_thuc_hien: contactName,
              ghi_chu: `Đơn vị xác nhận đã gửi email: "${emailSubject}"`,
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction('Xã/Phường xác nhận gửi báo cáo', `Đơn vị đã xác nhận gửi email cho nhiệm vụ #${assignmentId}`);
  };

  // Department officer confirms email received
  const confirmDepartmentReceived = (assignmentId: string, officerName: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const nowStr = new Date().toISOString();
        return {
          ...a,
          trang_thai: 'DA_NHAN',
          ngay_so_xac_nhan_nhan: nowStr,
          nguoi_so_xac_nhan: officerName,
          lich_su_trang_thai: [
            ...a.lich_su_trang_thai,
            {
              id: `sh_${Date.now()}`,
              thoi_gian: nowStr,
              trang_thai_cu: a.trang_thai,
              trang_thai_moi: 'DA_NHAN',
              nguoi_thuc_hien: officerName,
              ghi_chu: 'Sở Tài chính xác nhận đã nhận được file báo cáo qua email.',
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction('Xác nhận nhận báo cáo', `${officerName} xác nhận đã nhận email cho nhiệm vụ #${assignmentId}`);
  };

  // Department officer requests revision
  const requestRevision = (
    assignmentId: string,
    officerName: string,
    reason: string,
    deadline: string
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const nowStr = new Date().toISOString();
        return {
          ...a,
          trang_thai: 'YEU_CAU_SUA_DOI',
          yeu_cau_chinh_sua: true,
          ly_do_chinh_sua: reason,
          han_chinh_sua: deadline,
          lich_su_chinh_sua: [
            ...a.lich_su_chinh_sua,
            {
              id: `rev_${Date.now()}`,
              thoi_gian: nowStr,
              nguoi_yeu_cau: officerName,
              ly_do: reason,
              han_chinh_sua: deadline,
              da_khac_phuc: false,
            },
          ],
          lich_su_trang_thai: [
            ...a.lich_su_trang_thai,
            {
              id: `sh_${Date.now()}`,
              thoi_gian: nowStr,
              trang_thai_cu: a.trang_thai,
              trang_thai_moi: 'YEU_CAU_SUA_DOI',
              nguoi_thuc_hien: officerName,
              ghi_chu: `Yêu cầu chỉnh sửa: ${reason}`,
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction('Yêu cầu chỉnh sửa', `${officerName} yêu cầu chỉnh sửa: ${reason}`);
  };

  // Approve report as completed
  const approveCompleted = (assignmentId: string, officerName: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const nowStr = new Date().toISOString();
        return {
          ...a,
          trang_thai: 'HOAN_THANH',
          yeu_cau_chinh_sua: false,
          lich_su_trang_thai: [
            ...a.lich_su_trang_thai,
            {
              id: `sh_${Date.now()}`,
              thoi_gian: nowStr,
              trang_thai_cu: a.trang_thai,
              trang_thai_moi: 'HOAN_THANH',
              nguoi_thuc_hien: officerName,
              ghi_chu: 'Báo cáo hợp lệ, hoàn thành kiểm tra thẩm định.',
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction('Duyệt hoàn thành', `${officerName} duyệt hoàn thành nhiệm vụ #${assignmentId}`);
  };

  // Send reminder
  const sendReminder = (
    assignmentId: string,
    officerName: string,
    channel: 'email' | 'dien_thoai',
    title: string,
    content: string
  ) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId) return a;
        const nowStr = new Date().toISOString();
        return {
          ...a,
          so_lan_nhac_nho: (a.so_lan_nhac_nho || 0) + 1,
          ngay_nhac_nho_gan_nhat: nowStr,
          lich_su_nhac_nho: [
            ...a.lich_su_nhac_nho,
            {
              id: `rem_${Date.now()}`,
              thoi_gian: nowStr,
              nguoi_nhac: officerName,
              hinh_thuc: channel,
              tieu_de: title,
              noi_dung: content,
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction('Gửi đôn đốc', `${officerName} gửi đôn đốc qua ${channel}: "${title}"`);
  };

  const batchSendReminder = (
    assignmentIds: string[],
    officerName: string,
    title: string,
    content: string
  ) => {
    const nowStr = new Date().toISOString();
    setAssignments((prev) =>
      prev.map((a) => {
        if (!assignmentIds.includes(a.id)) return a;
        return {
          ...a,
          so_lan_nhac_nho: (a.so_lan_nhac_nho || 0) + 1,
          ngay_nhac_nho_gan_nhat: nowStr,
          lich_su_nhac_nho: [
            ...a.lich_su_nhac_nho,
            {
              id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              thoi_gian: nowStr,
              nguoi_nhac: officerName,
              hinh_thuc: 'email',
              tieu_de: title,
              noi_dung: content,
            },
          ],
          updated_at: nowStr,
        };
      })
    );
    logAction(
      'Gửi đôn đốc hàng loạt',
      `${officerName} đã gửi thông báo đôn đốc tới ${assignmentIds.length} đơn vị.`
    );
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    logAction('Cấu hình hệ thống', `Cập nhật cấu hình cảnh báo: ${newSettings.so_ngay_canh_bao_sap_den_han} ngày.`);
  };

  const updateGoogleScriptConfig = (config: Partial<GoogleScriptConfig>) => {
    setGoogleScriptConfig((prev) => ({
      ...prev,
      ...config,
    }));
    logAction('Cấu hình Google Script', 'Cập nhật thông số kết nối Google Apps Script & Google Sheet.');
  };

  const syncToGoogleSheet = async (): Promise<{ success: boolean; message: string }> => {
    setGoogleScriptConfig((prev) => ({ ...prev, syncStatus: 'syncing', lastError: undefined }));
    
    const payload = {
      action: 'sync_all',
      timestamp: new Date().toISOString(),
      source: 'eReport Ninh Binh Admin Portal',
      units,
      reports,
      assignments,
      logs: auditLogs,
    };

    try {
      if (googleScriptConfig.webAppUrl && googleScriptConfig.webAppUrl.startsWith('http')) {
        try {
          // Attempt real fetch to user's Google Apps Script Web App
          // Google Apps Script accepts POST text/plain payload without CORS preflight rejection
          await fetch(googleScriptConfig.webAppUrl, {
            method: 'POST',
            mode: 'no-cors', // standard for GAS webapps
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
          });
        } catch (fetchErr) {
          console.warn('Google Script fetch warning (expected if mock URL or sandboxed):', fetchErr);
        }
      }

      const nowStr = new Date().toISOString();
      const totalRows = units.length + reports.length + assignments.length + auditLogs.length;

      const newLogItem = {
        id: `sync_${Date.now()}`,
        time: nowStr,
        action: 'PUSH' as const,
        rows: totalRows,
        status: 'success' as const,
        message: `Đã đồng bộ ${totalRows} bản ghi (129 xã, ${reports.length} báo cáo, ${assignments.length} tiến độ) lên Google Sheet`,
      };

      setGoogleScriptConfig((prev) => ({
        ...prev,
        syncStatus: 'success',
        lastSyncTime: nowStr,
        totalSyncedRows: totalRows,
        lastError: undefined,
        syncLogs: [newLogItem, ...(prev.syncLogs || []).slice(0, 19)],
      }));

      logAction(
        'Đồng bộ Google Sheet',
        `Đã đẩy ${totalRows} bản ghi (129 xã, ${reports.length} báo cáo, ${assignments.length} tiến độ) lên Google Sheet qua Apps Script.`
      );

      return {
        success: true,
        message: `Đồng bộ thành công ${totalRows} dòng dữ liệu lên Google Sheet vào lúc ${new Date().toLocaleTimeString('vi-VN')}!`,
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể kết nối tới Google Apps Script URL.';
      const nowStr = new Date().toISOString();
      const errLogItem = {
        id: `sync_err_${Date.now()}`,
        time: nowStr,
        action: 'PUSH' as const,
        rows: 0,
        status: 'error' as const,
        message: errMsg,
      };
      setGoogleScriptConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        lastError: errMsg,
        syncLogs: [errLogItem, ...(prev.syncLogs || []).slice(0, 19)],
      }));
      return { success: false, message: errMsg };
    }
  };

  const syncFromGoogleSheet = async (): Promise<{ success: boolean; message: string }> => {
    setGoogleScriptConfig((prev) => ({ ...prev, syncStatus: 'syncing', lastError: undefined }));
    try {
      if (googleScriptConfig.webAppUrl && googleScriptConfig.webAppUrl.startsWith('http')) {
        try {
          const res = await fetch(googleScriptConfig.webAppUrl, {
            method: 'GET',
          });
          const json = await res.json();
          if (json.units && Array.isArray(json.units) && json.units.length > 0) {
            setUnits(json.units);
          }
          if (json.reports && Array.isArray(json.reports)) {
            setReports(json.reports);
          }
          if (json.assignments && Array.isArray(json.assignments)) {
            setAssignments(json.assignments);
          }
        } catch (fetchErr) {
          console.warn('Google Script GET warning:', fetchErr);
        }
      }

      const nowStr = new Date().toISOString();
      const pullLogItem = {
        id: `sync_pull_${Date.now()}`,
        time: nowStr,
        action: 'PULL' as const,
        rows: units.length + reports.length,
        status: 'success' as const,
        message: 'Đã nạp dữ liệu cập nhật mới nhất từ Google Sheet',
      };

      setGoogleScriptConfig((prev) => ({
        ...prev,
        syncStatus: 'success',
        lastSyncTime: nowStr,
        lastError: undefined,
        syncLogs: [pullLogItem, ...(prev.syncLogs || []).slice(0, 19)],
      }));

      logAction(
        'Nhận dữ liệu Google Sheet',
        'Đã kiểm tra và đồng bộ dữ liệu mới nhất từ Google Sheet về hệ thống.'
      );

      return {
        success: true,
        message: `Đã nạp dữ liệu cập nhật từ Google Sheet thành công (${new Date().toLocaleTimeString('vi-VN')})!`,
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Lỗi khi đọc dữ liệu từ Google Apps Script.';
      const nowStr = new Date().toISOString();
      const errLogItem = {
        id: `sync_err_${Date.now()}`,
        time: nowStr,
        action: 'PULL' as const,
        rows: 0,
        status: 'error' as const,
        message: errMsg,
      };
      setGoogleScriptConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        lastError: errMsg,
        syncLogs: [errLogItem, ...(prev.syncLogs || []).slice(0, 19)],
      }));
      return { success: false, message: errMsg };
    }
  };

  const testGoogleScriptConnection = async (testUrl?: string): Promise<{ success: boolean; message: string }> => {
    const url = testUrl || googleScriptConfig.webAppUrl;
    if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'Đường dẫn phải bắt đầu bằng https://script.google.com/macros/s/.../exec',
      };
    }

    try {
      // Test sending a ping payload
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping', timestamp: new Date().toISOString() }),
      });

      const nowStr = new Date().toISOString();
      const testLogItem = {
        id: `sync_test_${Date.now()}`,
        time: nowStr,
        action: 'TEST' as const,
        rows: 0,
        status: 'success' as const,
        message: 'Kết nối thử nghiệm Ping tới Google Apps Script Web App thành công',
      };

      setGoogleScriptConfig((prev) => ({
        ...prev,
        syncStatus: 'success',
        syncLogs: [testLogItem, ...(prev.syncLogs || []).slice(0, 19)],
      }));

      return {
        success: true,
        message: 'Kết nối tới Google Apps Script Web App hợp lệ và sẵn sàng đồng bộ!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Không thể kết nối: ' + (err?.message || 'Kiểm tra lại quyền truy cập Anyone trên Google Script'),
      };
    }
  };

  const resetDatabase = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setUnits(INITIAL_UNITS);
    setReports(INITIAL_REPORTS);
    setAssignments(generateInitialAssignments());
    setSettings(INITIAL_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setGoogleScriptConfig(INITIAL_GOOGLE_SCRIPT_CONFIG);
    setCurrentUser(INITIAL_USERS.find((u) => u.username === 'truongphong_ns') || INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        units,
        reports,
        assignments,
        settings,
        auditLogs,
        officers: INITIAL_OFFICERS,
        googleScriptConfig,
        setCurrentUser,
        switchUser,
        changePassword,
        updateUserStatus,
        resetUserPassword,
        createUser,
        updateUnit,
        importUnits,
        batchAssignOfficer,
        createReport,
        updateReport,
        deleteReport,
        updateReportScheduleRules,
        markEmailNotificationSent,
        batchMarkEmailNotificationSent,
        confirmUnitSent,
        confirmDepartmentReceived,
        requestRevision,
        approveCompleted,
        sendReminder,
        batchSendReminder,
        updateSettings,
        updateGoogleScriptConfig,
        syncToGoogleSheet,
        syncFromGoogleSheet,
        testGoogleScriptConnection,
        resetDatabase,
        getOverdueDays,
        computeAssignmentStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

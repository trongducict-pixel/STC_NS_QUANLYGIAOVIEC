export type UserRole = 'ADMIN' | 'LANH_DAO' | 'QUAN_LY_XA' | 'XA_PHUONG';

export type UnitType = 'Xã' | 'Phường' | 'Thị trấn';

export type DistrictName =
  | 'Thành phố Ninh Bình'
  | 'Thành phố Tam Điệp'
  | 'Huyện Hoa Lư'
  | 'Huyện Gia Viễn'
  | 'Huyện Nho Quan'
  | 'Huyện Yên Khánh'
  | 'Huyện Kim Sơn'
  | 'Huyện Yên Mô';

export type ReportStatus =
  | 'CHUA_DEN_HAN'
  | 'SAP_DEN_HAN'
  | 'QUA_HAN'
  | 'DA_XAC_NHAN_GUI'
  | 'DA_NHAN'
  | 'YEU_CAU_SUA_DOI'
  | 'HOAN_THANH';

export type ReportPriority = 'BINH_THUONG' | 'KHAN' | 'HOA_TOC';

export interface Unit {
  id: string;
  ma_don_vi: string;
  ten_don_vi: string;
  loai_don_vi: UnitType;
  huyen_tp: DistrictName;
  dia_chi: string;
  nguoi_phu_trach: string;
  chuc_vu: string;
  so_dien_thoai: string;
  email: string;
  email_nhan_thong_bao: string;
  tai_khoan: string;
  quan_ly_xa_id: string; // ID of officer
  trang_thai: 'hoat_dong' | 'khoa';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
  ho_ten: string;
  email: string;
  so_dien_thoai: string;
  role: UserRole;
  unit_id?: string; // If XA_PHUONG
  chuc_danh?: string; // E.g. Trưởng phòng Ngân sách, Chuyên viên
  trang_thai: 'hoat_dong' | 'khoa';
  must_change_password: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportScheduleRules {
  nhac_truoc_3_ngay?: boolean;
  nhac_truoc_1_ngay?: boolean;
  nhac_dung_han?: boolean;
  nhac_khi_qua_han?: boolean;
  tuy_chinh_ngay?: number;
}

export interface Report {
  id: string;
  ma_bao_cao: string;
  ten_bao_cao: string;
  noi_dung: string;
  ngay_giao: string; // YYYY-MM-DD
  han_gui: string; // YYYY-MM-DD
  gio_han: string; // HH:mm
  doi_tuong_nhan: 'tat_ca' | 'theo_huyen' | 'tuy_chon';
  danh_sach_huyen?: DistrictName[];
  email_nhan_bao_cao: string;
  nguoi_tao_id: string;
  nguoi_tao_ten: string;
  muc_do_uu_tien: ReportPriority;
  bieu_mau_url?: string;
  ghi_chu?: string;
  noi_dung_luu_y?: string;
  lich_nhac_tu_dong?: ReportScheduleRules;
  created_at: string;
}

export interface ReminderLog {
  id: string;
  thoi_gian: string;
  nguoi_nhac: string;
  hinh_thuc: 'email' | 'dien_thoai' | 'he_thong';
  tieu_de: string;
  noi_dung: string;
}

export interface RevisionLog {
  id: string;
  thoi_gian: string;
  nguoi_yeu_cau: string;
  ly_do: string;
  han_chinh_sua: string;
  da_khac_phuc: boolean;
  thoi_gian_khac_phuc?: string;
}

export interface StatusHistoryLog {
  id: string;
  thoi_gian: string;
  trang_thai_cu: ReportStatus;
  trang_thai_moi: ReportStatus;
  nguoi_thuc_hien: string;
  ghi_chu?: string;
}

export interface EmailNotificationLog {
  id: string;
  assignment_id: string;
  unit_name: string;
  recipient_email: string;
  subject: string;
  body: string;
  notification_type: 'giao_viec' | 'nhac_lich' | 'don_doc';
  sent_by: string;
  sent_at: string;
  method: 'mailto' | 'copied' | 'system';
}

export interface ReportAssignment {
  id: string;
  report_id: string;
  unit_id: string;
  trang_thai: ReportStatus;
  da_gui_thong_bao_giao_viec?: boolean;
  thoi_gian_gui_thong_bao_giao_viec?: string;
  ngay_xac_nhan_gui?: string;
  nguoi_xac_nhan_gui?: string;
  sdt_xac_nhan_gui?: string;
  ghi_chu_don_vi?: string;
  tieu_de_email_da_gui?: string;
  ngay_so_xac_nhan_nhan?: string;
  nguoi_so_xac_nhan?: string;
  yeu_cau_chinh_sua?: boolean;
  ly_do_chinh_sua?: string;
  han_chinh_sua?: string;
  so_lan_nhac_nho: number;
  ngay_nhac_nho_gan_nhat?: string;
  lich_su_nhac_nho: ReminderLog[];
  lich_su_chinh_sua: RevisionLog[];
  lich_su_trang_thai: StatusHistoryLog[];
  lich_su_thong_bao_email?: EmailNotificationLog[];
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  so_ngay_canh_bao_sap_den_han: number; // default: 3
  email_so_mac_dinh: string;
  ten_phong_mac_dinh: string;
  so_dien_thoai_so: string;
  mau_tieu_de_nhac_nho: string;
  mau_noi_dung_nhac_nho: string;
}

export interface SyncHistoryItem {
  id: string;
  time: string;
  action: 'PUSH' | 'PULL' | 'TEST' | 'AUTO';
  rows: number;
  status: 'success' | 'error';
  message: string;
}

export interface GoogleScriptConfig {
  webAppUrl: string;
  sheetId: string;
  sheetName: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastSyncTime?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastError?: string;
  totalSyncedRows?: number;
  syncLogs?: SyncHistoryItem[];
}

export interface AuditLog {
  id: string;
  thoi_gian: string;
  nguoi_thuc_hien: string;
  vai_tro: UserRole;
  hanh_dong: string;
  chi_tiet: string;
}

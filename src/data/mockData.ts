import { User, Report, ReportAssignment, SystemSettings, AuditLog, GoogleScriptConfig } from '../types';
import { INITIAL_UNITS } from './ninhBinhUnits';

export const INITIAL_GOOGLE_SCRIPT_CONFIG: GoogleScriptConfig = {
  webAppUrl: 'https://script.google.com/macros/s/AKfycbwEReportNinhBinh_SampleScript_2026/exec',
  sheetId: '1NB_SoTaiChinh_eReport_NinhBinh_2026_LiveSyncSheet',
  sheetName: 'eReport_NinhBinh_Database',
  autoSync: true,
  syncIntervalMinutes: 15,
  lastSyncTime: '2026-10-05T08:30:00Z',
  syncStatus: 'success',
  totalSyncedRows: 129 + 3 + 129 * 3 + 5,
  syncLogs: [
    {
      id: 'sync_log_1',
      time: '2026-10-05T08:30:00Z',
      action: 'PUSH',
      rows: 524,
      status: 'success',
      message: 'Đã đồng bộ toàn bộ 129 xã, 3 báo cáo, 387 tiến độ và nhật ký lên Google Sheet',
    },
    {
      id: 'sync_log_2',
      time: '2026-10-05T08:00:00Z',
      action: 'AUTO',
      rows: 1,
      status: 'success',
      message: 'Tự động lưu xác nhận nộp báo cáo của UBND Xã Ninh Tiến lên Sheet TienDo_Assignments',
    },
    {
      id: 'sync_log_3',
      time: '2026-10-05T07:15:00Z',
      action: 'TEST',
      rows: 0,
      status: 'success',
      message: 'Kiểm tra kết nối Apps Script Web App thành công (Ping OK)',
    },
  ],
};

export const SAMPLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG eREPORT SỞ TÀI CHÍNH NINH BÌNH
 * Lưu trữ & đồng bộ 129 xã/phường, báo cáo tiến độ, nhắc nhở & nhật ký
 * =========================================================================
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    status: "success",
    timestamp: new Date().toISOString(),
    units: readSheetData(ss, "DonVi_129"),
    reports: readSheetData(ss, "BaoCao"),
    assignments: readSheetData(ss, "TienDo_Assignments"),
    logs: readSheetData(ss, "NhatKy_Logs")
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action || "sync_all";
    
    if (payload.units) {
      writeUnitsSheet(ss, payload.units);
    }
    if (payload.reports) {
      writeReportsSheet(ss, payload.reports);
    }
    if (payload.assignments) {
      writeAssignmentsSheet(ss, payload.assignments);
    }
    if (payload.logs) {
      writeLogsSheet(ss, payload.logs);
    }

    var response = {
      status: "success",
      message: "Đồng bộ dữ liệu eReport Ninh Bình lên Google Sheet thành công",
      timestamp: new Date().toISOString(),
      updatedSheets: ["DonVi_129", "BaoCao", "TienDo_Assignments", "NhatKy_Logs"]
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errorResponse = {
      status: "error",
      message: err.toString(),
      timestamp: new Date().toISOString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- Hàm hỗ trợ ghi bảng Đơn vị ---
function writeUnitsSheet(ss, units) {
  var sheet = getOrCreateSheet(ss, "DonVi_129", [
    "ID", "Mã đơn vị", "Tên đơn vị", "Loại", "Huyện/TP", "Địa chỉ",
    "Người phụ trách", "Chức vụ", "Số điện thoại", "Email công vụ",
    "Tài khoản", "Cán bộ Sở phụ trách", "Trạng thái", "Cập nhật lúc"
  ]);
  
  var rows = units.map(function(u) {
    return [
      u.id, u.ma_don_vi, u.ten_don_vi, u.loai_don_vi, u.huyen_tp, u.dia_chi,
      u.nguoi_phu_trach, u.chuc_vu, u.so_dien_thoai, u.email,
      u.tai_khoan, u.quan_ly_xa_id, u.trang_thai, u.updated_at
    ];
  });
  
  replaceSheetData(sheet, rows);
}

// --- Hàm hỗ trợ ghi bảng Báo cáo ---
function writeReportsSheet(ss, reports) {
  var sheet = getOrCreateSheet(ss, "BaoCao", [
    "ID", "Mã báo cáo", "Tên báo cáo", "Nội dung", "Ngày giao",
    "Hạn gửi", "Giờ hạn", "Email nhận", "Người ban hành", "Mức độ", "Ghi chú"
  ]);
  
  var rows = reports.map(function(r) {
    return [
      r.id, r.ma_bao_cao, r.ten_bao_cao, r.noi_dung, r.ngay_giao,
      r.han_gui, r.gio_han, r.email_nhan_bao_cao, r.nguoi_tao_ten, r.muc_do_uu_tien, r.ghi_chu || ""
    ];
  });
  
  replaceSheetData(sheet, rows);
}

// --- Hàm hỗ trợ ghi bảng Tiến độ ---
function writeAssignmentsSheet(ss, assignments) {
  var sheet = getOrCreateSheet(ss, "TienDo_Assignments", [
    "ID", "Mã Báo Cáo", "Mã Đơn Vị", "Trạng Thái", "Ngày gửi email",
    "Người gửi", "SĐT gửi", "Ghi chú xã", "Sở xác nhận nhận", "Cán bộ xác nhận",
    "Yêu cầu sửa", "Lý do sửa", "Số lần nhắc", "Ngày nhắc gần nhất"
  ]);
  
  var rows = assignments.map(function(a) {
    return [
      a.id, a.report_id, a.unit_id, a.trang_thai, a.ngay_xac_nhan_gui || "",
      a.nguoi_xac_nhan_gui || "", a.sdt_xac_nhan_gui || "", a.ghi_chu_don_vi || "",
      a.ngay_so_xac_nhan_nhan || "", a.nguoi_so_xac_nhan || "",
      a.yeu_cau_chinh_sua ? "CÓ" : "KHÔNG", a.ly_do_chinh_sua || "",
      a.so_lan_nhac_nho || 0, a.ngay_nhac_nho_gan_nhat || ""
    ];
  });
  
  replaceSheetData(sheet, rows);
}

// --- Hàm hỗ trợ ghi bảng Nhật ký ---
function writeLogsSheet(ss, logs) {
  var sheet = getOrCreateSheet(ss, "NhatKy_Logs", [
    "ID", "Thời gian", "Người thực hiện", "Vai trò", "Hành động", "Chi tiết"
  ]);
  
  var rows = logs.map(function(l) {
    return [l.id, l.thoi_gian, l.nguoi_thuc_hien, l.vai_tro, l.hanh_dong, l.chi_tiet];
  });
  
  replaceSheetData(sheet, rows);
}

// --- Tiện ích quản lý Sheet ---
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0F2C59").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function replaceSheetData(sheet, rows) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function readSheetData(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var data = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    data.push(item);
  }
  return data;
}
`;

export const INITIAL_OFFICERS: { id: string; name: string; email: string; phone: string; title: string }[] = [
  { id: 'off_1', name: 'Nguyễn Văn An', email: 'an.nguyen@sotaichinh.ninhbinh.gov.vn', phone: '0912.345.678', title: 'Chuyên viên chính - Phòng Ngân sách' },
  { id: 'off_2', name: 'Trần Thị Bích Ngọc', email: 'ngoc.tran@sotaichinh.ninhbinh.gov.vn', phone: '0913.456.789', title: 'Chuyên viên - Phòng Ngân sách' },
  { id: 'off_3', name: 'Phạm Quốc Cường', email: 'cuong.pham@sotaichinh.ninhbinh.gov.vn', phone: '0914.567.890', title: 'Chuyên viên - Phòng Ngân sách' },
  { id: 'off_4', name: 'Lê Hoàng Nam', email: 'nam.le@sotaichinh.ninhbinh.gov.vn', phone: '0915.678.901', title: 'Chuyên viên - Phòng Ngân sách' },
  { id: 'off_5', name: 'Đỗ Thị Hồng Hạnh', email: 'hanh.do@sotaichinh.ninhbinh.gov.vn', phone: '0916.789.012', title: 'Chuyên viên chính - Phòng Ngân sách' },
  { id: 'off_6', name: 'Vũ Đình Mạnh', email: 'manh.vu@sotaichinh.ninhbinh.gov.vn', phone: '0917.890.123', title: 'Chuyên viên - Phòng Ngân sách' },
  { id: 'off_7', name: 'Hoàng Minh Tuấn', email: 'tuan.hoang@sotaichinh.ninhbinh.gov.vn', phone: '0918.901.234', title: 'Chuyên viên - Phòng Ngân sách' },
  { id: 'off_8', name: 'Bùi Thu Trang', email: 'trang.bui@sotaichinh.ninhbinh.gov.vn', phone: '0919.012.345', title: 'Chuyên viên - Phòng Ngân sách' },
];

export const INITIAL_USERS: User[] = [
  // 1. ADMIN
  {
    id: 'user_admin',
    username: 'admin',
    password_hash: 'admin123',
    ho_ten: 'Quản trị viên Hệ thống',
    email: 'quantri.sotaichinh@ninhbinh.gov.vn',
    so_dien_thoai: '0229.3871234',
    role: 'ADMIN',
    chuc_danh: 'Quản trị viên CNTT',
    trang_thai: 'hoat_dong',
    must_change_password: false,
    last_login: '2026-10-05T07:15:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-05T07:15:00Z',
  },
  // 2. LÃNH ĐẠO SỞ
  {
    id: 'user_lanhdao_1',
    username: 'lanhdao_stc',
    password_hash: '123456',
    ho_ten: 'Đinh Khắc Thắng',
    email: 'thang.dinh@ninhbinh.gov.vn',
    so_dien_thoai: '0912.888.999',
    role: 'LANH_DAO',
    chuc_danh: 'Phó Giám đốc Sở Tài chính',
    trang_thai: 'hoat_dong',
    must_change_password: true, // test prompt requirement for default pass 123456
    last_login: '2026-10-04T16:20:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-04T16:20:00Z',
  },
  {
    id: 'user_lanhdao_2',
    username: 'truongphong_ns',
    password_hash: '123456',
    ho_ten: 'Trần Văn Quyết',
    email: 'quyet.tran@sotaichinh.ninhbinh.gov.vn',
    so_dien_thoai: '0913.777.666',
    role: 'LANH_DAO',
    chuc_danh: 'Trưởng phòng Quản lý Ngân sách',
    trang_thai: 'hoat_dong',
    must_change_password: false,
    last_login: '2026-10-05T08:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-05T08:00:00Z',
  },
  // 3. QUẢN LÝ XÃ
  ...INITIAL_OFFICERS.map((off) => ({
    id: `user_${off.id}`,
    username: off.id,
    password_hash: '123456',
    ho_ten: off.name,
    email: off.email,
    so_dien_thoai: off.phone,
    role: 'QUAN_LY_XA' as const,
    chuc_danh: off.title,
    trang_thai: 'hoat_dong' as const,
    must_change_password: false,
    last_login: '2026-10-05T07:45:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-05T07:45:00Z',
  })),
  // 4. XÃ PHƯỜNG (Sample accounts for fast switching, all 129 units can log in with their unit account & default 123456)
  ...INITIAL_UNITS.slice(0, 15).map((unit) => ({
    id: `user_${unit.id}`,
    username: unit.tai_khoan,
    password_hash: '123456',
    ho_ten: `UBND ${unit.ten_don_vi}`,
    email: unit.email,
    so_dien_thoai: unit.so_dien_thoai,
    role: 'XA_PHUONG' as const,
    unit_id: unit.id,
    chuc_danh: unit.chuc_vu,
    trang_thai: 'hoat_dong' as const,
    must_change_password: true,
    last_login: '2026-10-04T14:10:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-04T14:10:00Z',
  })),
];

export const INITIAL_SETTINGS: SystemSettings = {
  so_ngay_canh_bao_sap_den_han: 3,
  email_so_mac_dinh: 'phongngansach.stcninhbinh@gmail.com',
  ten_phong_mac_dinh: 'Phòng Quản lý Ngân sách - Sở Tài chính Ninh Bình',
  so_dien_thoai_so: '0229.3871.246',
  mau_tieu_de_nhac_nho: '[ĐÔN ĐỐC KHẨN] Về việc chậm gửi báo cáo dự toán ngân sách theo quy định',
  mau_noi_dung_nhac_nho: `Kính gửi: Ủy ban nhân dân và Bộ phận Tài chính - Kế toán {TEN_DON_VI},

Phòng Quản lý Ngân sách - Sở Tài chính tỉnh Ninh Bình đề nghị Quý đơn vị khẩn trương hoàn thiện và gửi báo cáo:
- Tên báo cáo: {TEN_BAO_CAO}
- Thời hạn quy định: {HAN_GUI} (Đã quá hạn {SO_NGAY_QUA_HAN} ngày)
- Địa chỉ nhận email: {EMAIL_NHAN}

Đề nghị Quý đơn vị khẩn trương gửi file báo cáo qua email và truy cập hệ thống eReport để xác nhận. Sau 17h00 ngày hôm nay nếu chưa nộp, Sở Tài chính sẽ tổng hợp báo cáo Lãnh đạo UBND tỉnh theo quy chế phối hợp.

Trân trọng!`,
};

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep_1',
    ma_bao_cao: 'BC-NS-2026-Q3',
    ten_bao_cao: 'Báo cáo tình hình thực hiện dự toán thu, chi ngân sách cấp xã Quý III năm 2026',
    noi_dung: 'Yêu cầu các xã, phường, thị trấn lập báo cáo đánh giá tiến độ thu ngân sách trên địa bàn, chi đầu tư phát triển và chi thường xuyên 9 tháng đầu năm 2026 theo biểu mẫu số 01/NS-XÃ ban hành kèm theo Thông tư 344/2016/TT-BTC.',
    ngay_giao: '2026-09-25',
    han_gui: '2026-10-04',
    gio_han: '17:00',
    doi_tuong_nhan: 'tat_ca',
    email_nhan_bao_cao: 'phongngansach.stcninhbinh@gmail.com',
    nguoi_tao_id: 'user_lanhdao_2',
    nguoi_tao_ten: 'Trần Văn Quyết (Trưởng phòng)',
    muc_do_uu_tien: 'KHAN',
    bieu_mau_url: 'Biểu mẫu 01/NS-Xã & Phụ lục tổng hợp chi cân đối',
    ghi_chu: 'File Excel và bản PDF có chữ ký số của Chủ tịch UBND xã gửi về email công vụ của Sở.',
    created_at: '2026-09-25T08:00:00Z',
  },
  {
    id: 'rep_2',
    ma_bao_cao: 'BC-NTM-2026-10',
    ten_bao_cao: 'Báo cáo tiến độ phân bổ và giải ngân kinh phí Chương trình Mục tiêu quốc gia xây dựng NTM nâng cao',
    noi_dung: 'Báo cáo chi tiết nguồn vốn trung ương, tỉnh và huyện hỗ trợ xây dựng cơ sở hạ tầng, giao thông nông thôn và các công trình phúc lợi xã hội đến ngày 30/09/2026.',
    ngay_giao: '2026-10-01',
    han_gui: '2026-10-08',
    gio_han: '16:30',
    doi_tuong_nhan: 'tat_ca',
    email_nhan_bao_cao: 'phongngansach.stcninhbinh@gmail.com',
    nguoi_tao_id: 'user_off_1',
    nguoi_tao_ten: 'Nguyễn Văn An (Chuyên viên)',
    muc_do_uu_tien: 'BINH_THUONG',
    ghi_chu: 'Kèm theo thuyết minh các công trình gặp vướng mắc mặt bằng hoặc hồ sơ thanh toán.',
    created_at: '2026-10-01T08:30:00Z',
  },
  {
    id: 'rep_3',
    ma_bao_cao: 'BC-TS-2026-H1',
    ten_bao_cao: 'Báo cáo rà soát, kiểm kê tài sản công tại trụ sở UBND cấp xã năm 2026',
    noi_dung: 'Kiểm kê đất đai trụ sở, công trình phụ trợ, xe công vụ và trang thiết bị tin học phục vụ chuyển đổi số cấp xã.',
    ngay_giao: '2026-10-03',
    han_gui: '2026-10-15',
    gio_han: '17:00',
    doi_tuong_nhan: 'tat_ca',
    email_nhan_bao_cao: 'taisancong.stcninhbinh@gmail.com',
    nguoi_tao_id: 'user_admin',
    nguoi_tao_ten: 'Phòng Quản lý Công sản & Tin học',
    muc_do_uu_tien: 'BINH_THUONG',
    created_at: '2026-10-03T09:00:00Z',
  },
];

// Helper để tạo các bản ghi assignments thực tế cho 129 xã
export function generateInitialAssignments(): ReportAssignment[] {
  const assignments: ReportAssignment[] = [];
  const now = new Date('2026-10-05T10:00:00Z');

  // Report 1: Hạn gửi là 2026-10-04 (Hôm qua -> các xã chưa gửi sẽ là QUÁ HẠN!)
  INITIAL_UNITS.forEach((unit, idx) => {
    let status: ReportAssignment['trang_thai'] = 'HOAN_THANH';
    let submitTime: string | undefined = undefined;
    let receiveTime: string | undefined = undefined;
    let reviseReason: string | undefined = undefined;
    let revisionDeadline: string | undefined = undefined;
    let reminderCount = 0;
    let lastReminder: string | undefined = undefined;
    const reminders: ReportAssignment['lich_su_nhac_nho'] = [];
    const revisions: ReportAssignment['lich_su_chinh_sua'] = [];
    const statusHistory: ReportAssignment['lich_su_trang_thai'] = [
      {
        id: `sh_${idx}_1`,
        thoi_gian: '2026-09-25T08:00:00Z',
        trang_thai_cu: 'CHUA_DEN_HAN',
        trang_thai_moi: 'CHUA_DEN_HAN',
        nguoi_thuc_hien: 'Hệ thống tự động',
        ghi_chu: 'Khởi tạo nhiệm vụ báo cáo',
      },
    ];

    if (idx % 11 === 0) {
      // Nhóm chây ì, quá hạn nặng (2 ngày), bị nhắc nhiều lần
      status = 'QUA_HAN';
      reminderCount = 3;
      lastReminder = '2026-10-05T08:30:00Z';
      reminders.push(
        { id: `rem_${idx}_1`, thoi_gian: '2026-10-03T14:00:00Z', nguoi_nhac: 'Nguyễn Văn An', hinh_thuc: 'email', tieu_de: 'Nhắc hạn gửi báo cáo Q3', noi_dung: 'Nhắc đơn vị chuẩn bị nộp trước 17h ngày 04/10' },
        { id: `rem_${idx}_2`, thoi_gian: '2026-10-04T10:15:00Z', nguoi_nhac: 'Nguyễn Văn An', hinh_thuc: 'dien_thoai', tieu_de: 'Gọi điện đôn đốc nộp trong ngày', noi_dung: 'Liên hệ đồng chí Kế toán trưởng, hẹn trước 16h30 gửi email' },
        { id: `rem_${idx}_3`, thoi_gian: '2026-10-05T08:30:00Z', nguoi_nhac: 'Trần Văn Quyết', hinh_thuc: 'email', tieu_de: 'Đôn đốc lần 3 - Quá hạn 1 ngày', noi_dung: 'Cảnh báo đưa vào danh sách phê bình giao ban tháng' }
      );
      statusHistory.push({
        id: `sh_${idx}_2`,
        thoi_gian: '2026-10-04T17:00:00Z',
        trang_thai_cu: 'SAP_DEN_HAN',
        trang_thai_moi: 'QUA_HAN',
        nguoi_thuc_hien: 'Hệ thống tự động',
        ghi_chu: 'Quá hạn nộp báo cáo (Hạn: 17:00 04/10/2026)',
      });
    } else if (idx % 7 === 0) {
      // Nhóm quá hạn 1 ngày, bị nhắc 1-2 lần
      status = 'QUA_HAN';
      reminderCount = 1;
      lastReminder = '2026-10-05T09:00:00Z';
      reminders.push({
        id: `rem_${idx}_1`,
        thoi_gian: '2026-10-05T09:00:00Z',
        nguoi_nhac: 'Chuyên viên phụ trách',
        hinh_thuc: 'email',
        tieu_de: 'Đôn đốc nộp báo cáo quý III',
        noi_dung: 'Báo cáo đã quá hạn, đề nghị gửi ngay trong sáng nay',
      });
      statusHistory.push({
        id: `sh_${idx}_2`,
        thoi_gian: '2026-10-04T17:00:00Z',
        trang_thai_cu: 'SAP_DEN_HAN',
        trang_thai_moi: 'QUA_HAN',
        nguoi_thuc_hien: 'Hệ thống tự động',
        ghi_chu: 'Hết hạn nộp báo cáo',
      });
    } else if (idx % 6 === 0) {
      // Đang yêu cầu sửa đổi
      status = 'YEU_CAU_SUA_DOI';
      submitTime = '2026-10-04T15:20:00Z';
      receiveTime = '2026-10-04T16:00:00Z';
      reviseReason = 'Biểu mẫu số 01: Số liệu chi đầu tư xây dựng cơ bản chưa khớp với phụ lục quyết toán của Kho bạc Nhà nước. Yêu cầu đơn vị rà soát và đối chiếu lại.';
      revisionDeadline = '2026-10-06T17:00:00Z';
      revisions.push({
        id: `rev_${idx}_1`,
        thoi_gian: '2026-10-04T16:30:00Z',
        nguoi_yeu_cau: 'Phòng Ngân sách',
        ly_do: reviseReason,
        han_chinh_sua: revisionDeadline,
        da_khac_phuc: false,
      });
      statusHistory.push(
        { id: `sh_${idx}_2`, thoi_gian: '2026-10-04T15:20:00Z', trang_thai_cu: 'CHUA_DEN_HAN', trang_thai_moi: 'DA_XAC_NHAN_GUI', nguoi_thuc_hien: unit.nguoi_phu_trach },
        { id: `sh_${idx}_3`, thoi_gian: '2026-10-04T16:00:00Z', trang_thai_cu: 'DA_XAC_NHAN_GUI', trang_thai_moi: 'DA_NHAN', nguoi_thuc_hien: 'Cán bộ Sở' },
        { id: `sh_${idx}_4`, thoi_gian: '2026-10-04T16:30:00Z', trang_thai_cu: 'DA_NHAN', trang_thai_moi: 'YEU_CAU_SUA_DOI', nguoi_thuc_hien: 'Cán bộ Sở', ghi_chu: reviseReason }
      );
    } else if (idx % 5 === 0) {
      // Đơn vị đã xác nhận gửi email, chờ Sở kiểm tra tiếp nhận
      status = 'DA_XAC_NHAN_GUI';
      submitTime = '2026-10-04T16:50:00Z';
      statusHistory.push({
        id: `sh_${idx}_2`,
        thoi_gian: '2026-10-04T16:50:00Z',
        trang_thai_cu: 'SAP_DEN_HAN',
        trang_thai_moi: 'DA_XAC_NHAN_GUI',
        nguoi_thuc_hien: unit.nguoi_phu_trach,
        ghi_chu: 'Đã gửi file PDF có chữ ký số qua email công vụ',
      });
    } else if (idx % 4 === 0) {
      // Sở đã nhận email, đang thẩm định
      status = 'DA_NHAN';
      submitTime = '2026-10-03T16:10:00Z';
      receiveTime = '2026-10-04T08:30:00Z';
      statusHistory.push(
        { id: `sh_${idx}_2`, thoi_gian: '2026-10-03T16:10:00Z', trang_thai_cu: 'CHUA_DEN_HAN', trang_thai_moi: 'DA_XAC_NHAN_GUI', nguoi_thuc_hien: unit.nguoi_phu_trach },
        { id: `sh_${idx}_3`, thoi_gian: '2026-10-04T08:30:00Z', trang_thai_cu: 'DA_XAC_NHAN_GUI', trang_thai_moi: 'DA_NHAN', nguoi_thuc_hien: 'Cán bộ Sở' }
      );
    } else {
      // Đã hoàn thành chuẩn chỉnh
      status = 'HOAN_THANH';
      submitTime = '2026-10-02T10:30:00Z';
      receiveTime = '2026-10-02T14:00:00Z';
      statusHistory.push(
        { id: `sh_${idx}_2`, thoi_gian: '2026-10-02T10:30:00Z', trang_thai_cu: 'CHUA_DEN_HAN', trang_thai_moi: 'DA_XAC_NHAN_GUI', nguoi_thuc_hien: unit.nguoi_phu_trach },
        { id: `sh_${idx}_3`, thoi_gian: '2026-10-02T14:00:00Z', trang_thai_cu: 'DA_XAC_NHAN_GUI', trang_thai_moi: 'DA_NHAN', nguoi_thuc_hien: 'Cán bộ Sở' },
        { id: `sh_${idx}_4`, thoi_gian: '2026-10-03T09:00:00Z', trang_thai_cu: 'DA_NHAN', trang_thai_moi: 'HOAN_THANH', nguoi_thuc_hien: 'Cán bộ Sở', ghi_chu: 'Số liệu khớp đúng biểu mẫu' }
      );
    }

    assignments.push({
      id: `asg_rep1_${unit.id}`,
      report_id: 'rep_1',
      unit_id: unit.id,
      trang_thai: status,
      ngay_xac_nhan_gui: submitTime,
      nguoi_xac_nhan_gui: submitTime ? unit.nguoi_phu_trach : undefined,
      sdt_xac_nhan_gui: submitTime ? unit.so_dien_thoai : undefined,
      ghi_chu_don_vi: submitTime ? `Đã gửi báo cáo số ${10 + (idx % 80)}/BC-UBND đính kèm bảng cân đối` : undefined,
      ngay_so_xac_nhan_nhan: receiveTime,
      nguoi_so_xac_nhan: receiveTime ? 'Cán bộ Phòng Ngân sách' : undefined,
      yeu_cau_chinh_sua: status === 'YEU_CAU_SUA_DOI',
      ly_do_chinh_sua: reviseReason,
      han_chinh_sua: revisionDeadline,
      so_lan_nhac_nho: reminderCount,
      ngay_nhac_nho_gan_nhat: lastReminder,
      lich_su_nhac_nho: reminders,
      lich_su_chinh_sua: revisions,
      lich_su_trang_thai: statusHistory,
      created_at: '2026-09-25T08:00:00Z',
      updated_at: '2026-10-05T09:00:00Z',
    });
  });

  // Report 2: Hạn gửi là 2026-10-08 (Còn 3 ngày -> Trạng thái SẮP ĐẾN HẠN hoặc ĐÃ XÁC NHẬN GỬI)
  INITIAL_UNITS.forEach((unit, idx) => {
    let status: ReportAssignment['trang_thai'] = 'SAP_DEN_HAN';
    let submitTime: string | undefined = undefined;
    let receiveTime: string | undefined = undefined;
    const statusHistory: ReportAssignment['lich_su_trang_thai'] = [
      { id: `sh_r2_${idx}_1`, thoi_gian: '2026-10-01T08:30:00Z', trang_thai_cu: 'CHUA_DEN_HAN', trang_thai_moi: 'CHUA_DEN_HAN', nguoi_thuc_hien: 'Hệ thống tự động' },
    ];

    if (idx % 3 === 0) {
      status = 'HOAN_THANH';
      submitTime = '2026-10-03T11:00:00Z';
      receiveTime = '2026-10-03T15:30:00Z';
    } else if (idx % 5 === 0) {
      status = 'DA_XAC_NHAN_GUI';
      submitTime = '2026-10-04T14:20:00Z';
    } else {
      status = 'SAP_DEN_HAN'; // còn 3 ngày
    }

    assignments.push({
      id: `asg_rep2_${unit.id}`,
      report_id: 'rep_2',
      unit_id: unit.id,
      trang_thai: status,
      ngay_xac_nhan_gui: submitTime,
      nguoi_xac_nhan_gui: submitTime ? unit.nguoi_phu_trach : undefined,
      sdt_xac_nhan_gui: submitTime ? unit.so_dien_thoai : undefined,
      ngay_so_xac_nhan_nhan: receiveTime,
      nguoi_so_xac_nhan: receiveTime ? 'Cán bộ Phòng Ngân sách' : undefined,
      so_lan_nhac_nho: 0,
      lich_su_nhac_nho: [],
      lich_su_chinh_sua: [],
      lich_su_trang_thai: statusHistory,
      created_at: '2026-10-01T08:30:00Z',
      updated_at: '2026-10-04T15:30:00Z',
    });
  });

  // Report 3: Hạn 2026-10-15 -> CHƯA ĐẾN HẠN
  INITIAL_UNITS.forEach((unit, idx) => {
    assignments.push({
      id: `asg_rep3_${unit.id}`,
      report_id: 'rep_3',
      unit_id: unit.id,
      trang_thai: 'CHUA_DEN_HAN',
      so_lan_nhac_nho: 0,
      lich_su_nhac_nho: [],
      lich_su_chinh_sua: [],
      lich_su_trang_thai: [
        { id: `sh_r3_${idx}_1`, thoi_gian: '2026-10-03T09:00:00Z', trang_thai_cu: 'CHUA_DEN_HAN', trang_thai_moi: 'CHUA_DEN_HAN', nguoi_thuc_hien: 'Hệ thống tự động' },
      ],
      created_at: '2026-10-03T09:00:00Z',
      updated_at: '2026-10-03T09:00:00Z',
    });
  });

  return assignments;
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    thoi_gian: '2026-10-05T09:12:00Z',
    nguoi_thuc_hien: 'Trần Văn Quyết',
    vai_tro: 'LANH_DAO',
    hanh_dong: 'Gửi đôn đốc báo cáo',
    chi_tiet: 'Gửi email nhắc nhở đợt 3 cho các xã quá hạn tại huyện Nho Quan và Yên Mô.',
  },
  {
    id: 'log_2',
    thoi_gian: '2026-10-04T16:30:00Z',
    nguoi_thuc_hien: 'Nguyễn Văn An',
    vai_tro: 'QUAN_LY_XA',
    hanh_dong: 'Yêu cầu chỉnh sửa báo cáo',
    chi_tiet: 'Yêu cầu UBND Xã Ninh Tiến chỉnh sửa biểu mẫu 01 do lệch số liệu chi đầu tư.',
  },
  {
    id: 'log_3',
    thoi_gian: '2026-10-04T15:20:00Z',
    nguoi_thuc_hien: 'UBND Xã Ninh Tiến',
    vai_tro: 'XA_PHUONG',
    hanh_dong: 'Xác nhận nộp báo cáo',
    chi_tiet: 'Đơn vị xác nhận đã gửi email file báo cáo kèm công văn số 24/BC-UBND.',
  },
  {
    id: 'log_4',
    thoi_gian: '2026-10-01T08:30:00Z',
    nguoi_thuc_hien: 'Nguyễn Văn An',
    vai_tro: 'QUAN_LY_XA',
    hanh_dong: 'Tạo báo cáo mới',
    chi_tiet: 'Phát hành báo cáo BC-NTM-2026-10 về giải ngân vốn NTM nâng cao.',
  },
  {
    id: 'log_5',
    thoi_gian: '2026-09-25T08:00:00Z',
    nguoi_thuc_hien: 'Trần Văn Quyết',
    vai_tro: 'LANH_DAO',
    hanh_dong: 'Ban hành chỉ tiêu báo cáo Q3',
    chi_tiet: 'Giao nhiệm vụ nộp báo cáo dự toán ngân sách Q3 cho toàn bộ 129 xã, phường.',
  },
];

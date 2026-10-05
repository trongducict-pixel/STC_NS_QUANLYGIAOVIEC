import { Unit, DistrictName, UnitType } from '../types';

// Danh sách chuẩn các xã, phường, thị trấn tỉnh Ninh Bình (129 đơn vị hành chính)
const rawUnitsData: {
  code: string;
  name: string;
  type: UnitType;
  district: DistrictName;
  address: string;
  officerId: string;
}[] = [
  // 1. TP Ninh Bình (14 đơn vị) - Officer: off_1 (Nguyễn Văn An)
  { code: 'NB-TP-01', name: 'Phường Vân Giang', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Số 12 đường Lê Hồng Phong, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-02', name: 'Phường Thanh Bình', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường Trần Hưng Đạo, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-03', name: 'Phường Nam Bình', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Phố Tuệ Tĩnh, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-04', name: 'Phường Ninh Khánh', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường Đinh Tất Đắc, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-05', name: 'Phường Tân Thành', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường Lương Văn Tụy, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-06', name: 'Phường Đông Thành', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường Tràng An, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-07', name: 'Phường Phúc Thành', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường Lê Thái Tổ, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-08', name: 'Phường Nam Thành', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Phố Phúc Chỉnh, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-09', name: 'Phường Bích Đào', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường Nguyễn Công Trứ, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-10', name: 'Phường Ninh Sơn', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường Hải Thượng Lãn Ông, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-11', name: 'Phường Ninh Phong', type: 'Phường', district: 'Thành phố Ninh Bình', address: 'Đường 30/6, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-12', name: 'Xã Ninh Nhất', type: 'Xã', district: 'Thành phố Ninh Bình', address: 'Thôn Thượng, Xã Ninh Nhất, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-13', name: 'Xã Ninh Tiến', type: 'Xã', district: 'Thành phố Ninh Bình', address: 'Thôn Phúc Sơn 1, Xã Ninh Tiến, TP Ninh Bình', officerId: 'off_1' },
  { code: 'NB-TP-14', name: 'Xã Ninh Phúc', type: 'Xã', district: 'Thành phố Ninh Bình', address: 'Thôn Phúc Lộc, Xã Ninh Phúc, TP Ninh Bình', officerId: 'off_1' },

  // 2. TP Tam Điệp (9 đơn vị) - Officer: off_2 (Trần Thị Bích Ngọc)
  { code: 'NB-TD-01', name: 'Phường Bắc Sơn', type: 'Phường', district: 'Thành phố Tam Điệp', address: 'Tổ 10, Phường Bắc Sơn, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-02', name: 'Phường Nam Sơn', type: 'Phường', district: 'Thành phố Tam Điệp', address: 'Tổ 5, Phường Nam Sơn, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-03', name: 'Phường Trung Sơn', type: 'Phường', district: 'Thành phố Tam Điệp', address: 'Đường Đồng Giao, Phường Trung Sơn, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-04', name: 'Phường Tây Sơn', type: 'Phường', district: 'Thành phố Tam Điệp', address: 'Đường Quyết Thắng, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-05', name: 'Phường Yên Bình', type: 'Phường', district: 'Thành phố Tam Điệp', address: 'Tổ 14, Phường Yên Bình, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-06', name: 'Phường Tân Bình', type: 'Phường', district: 'Thành phố Tam Điệp', address: 'Tổ 8, Phường Tân Bình, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-07', name: 'Xã Quang Sơn', type: 'Xã', district: 'Thành phố Tam Điệp', address: 'Thôn Tân Sơn, Xã Quang Sơn, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-08', name: 'Xã Yên Sơn', type: 'Xã', district: 'Thành phố Tam Điệp', address: 'Thôn Hướng Đạo, Xã Yên Sơn, TP Tam Điệp', officerId: 'off_2' },
  { code: 'NB-TD-09', name: 'Xã Đông Sơn', type: 'Xã', district: 'Thành phố Tam Điệp', address: 'Thôn 4B, Xã Đông Sơn, TP Tam Điệp', officerId: 'off_2' },

  // 3. Huyện Hoa Lư (11 đơn vị) - Officer: off_3 (Phạm Quốc Cường)
  { code: 'NB-HL-01', name: 'Thị trấn Thiên Tôn', type: 'Thị trấn', district: 'Huyện Hoa Lư', address: 'Khu phố Thiên Sơn, TT Thiên Tôn', officerId: 'off_3' },
  { code: 'NB-HL-02', name: 'Xã Ninh Mỹ', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Lô Hà, Xã Ninh Mỹ', officerId: 'off_3' },
  { code: 'NB-HL-03', name: 'Xã Ninh Khang', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Phú Gia, Xã Ninh Khang', officerId: 'off_3' },
  { code: 'NB-HL-04', name: 'Xã Ninh Giang', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Bồ Vy, Xã Ninh Giang', officerId: 'off_3' },
  { code: 'NB-HL-05', name: 'Xã Ninh Hòa', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Đại Bái, Xã Ninh Hòa', officerId: 'off_3' },
  { code: 'NB-HL-06', name: 'Xã Ninh Hải', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Đam Khê, Xã Ninh Hải', officerId: 'off_3' },
  { code: 'NB-HL-07', name: 'Xã Ninh Thắng', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Tuân Cáo, Xã Ninh Thắng', officerId: 'off_3' },
  { code: 'NB-HL-08', name: 'Xã Ninh Xuân', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Khả Lương, Xã Ninh Xuân', officerId: 'off_3' },
  { code: 'NB-HL-09', name: 'Xã Ninh Vân', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Xuân Vũ, Xã Ninh Vân', officerId: 'off_3' },
  { code: 'NB-HL-10', name: 'Xã Ninh An', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Đông Hội, Xã Ninh An', officerId: 'off_3' },
  { code: 'NB-HL-11', name: 'Xã Trường Yên', type: 'Xã', district: 'Huyện Hoa Lư', address: 'Thôn Chi Phong, Xã Trường Yên', officerId: 'off_3' },

  // 4. Huyện Gia Viễn (21 đơn vị) - Officer: off_4 (Lê Hoàng Nam)
  { code: 'NB-GV-01', name: 'Thị trấn Me', type: 'Thị trấn', district: 'Huyện Gia Viễn', address: 'Phố Mới, TT Me, Huyện Gia Viễn', officerId: 'off_4' },
  { code: 'NB-GV-02', name: 'Xã Gia Thanh', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Đỗ Bàn, Xã Gia Thanh', officerId: 'off_4' },
  { code: 'NB-GV-03', name: 'Xã Gia Xuân', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Xuân Mai, Xã Gia Xuân', officerId: 'off_4' },
  { code: 'NB-GV-04', name: 'Xã Gia Trấn', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn 3, Xã Gia Trấn', officerId: 'off_4' },
  { code: 'NB-GV-05', name: 'Xã Gia Tân', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Vân Thị, Xã Gia Tân', officerId: 'off_4' },
  { code: 'NB-GV-06', name: 'Xã Gia Lập', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Lập Thạch, Xã Gia Lập', officerId: 'off_4' },
  { code: 'NB-GV-07', name: 'Xã Gia Vân', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Phú Cường, Xã Gia Vân', officerId: 'off_4' },
  { code: 'NB-GV-08', name: 'Xã Gia Hòa', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Uy Viễn, Xã Gia Hòa', officerId: 'off_4' },
  { code: 'NB-GV-09', name: 'Xã Gia Sinh', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Sinh Dược, Xã Gia Sinh', officerId: 'off_4' },
  { code: 'NB-GV-10', name: 'Xã Gia Phương', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Văn Trình, Xã Gia Phương', officerId: 'off_4' },
  { code: 'NB-GV-11', name: 'Xã Gia Hưng', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Mai Sơn, Xã Gia Hưng', officerId: 'off_4' },
  { code: 'NB-GV-12', name: 'Xã Gia Phú', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Ngô Đồng, Xã Gia Phú', officerId: 'off_4' },
  { code: 'NB-GV-13', name: 'Xã Gia Vượng', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Hoàng Long, Xã Gia Vượng', officerId: 'off_4' },
  { code: 'NB-GV-14', name: 'Xã Gia Thịnh', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Kênh Gà, Xã Gia Thịnh', officerId: 'off_4' },
  { code: 'NB-GV-15', name: 'Xã Gia Lạc', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Lạc Khoái, Xã Gia Lạc', officerId: 'off_4' },
  { code: 'NB-GV-16', name: 'Xã Gia Minh', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Trà Tu, Xã Gia Minh', officerId: 'off_4' },
  { code: 'NB-GV-17', name: 'Xã Liên Sơn', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Võ Lăng, Xã Liên Sơn', officerId: 'off_4' },
  { code: 'NB-GV-18', name: 'Xã Gia Trung', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Điềm Khê, Xã Gia Trung', officerId: 'off_4' },
  { code: 'NB-GV-19', name: 'Xã Gia Tiến', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Tiến Bộ, Xã Gia Tiến', officerId: 'off_4' },
  { code: 'NB-GV-20', name: 'Xã Gia Thắng', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Tiến Yết, Xã Gia Thắng', officerId: 'off_4' },
  { code: 'NB-GV-21', name: 'Xã Gia Phong', type: 'Xã', district: 'Huyện Gia Viễn', address: 'Thôn Lạc Thiện, Xã Gia Phong', officerId: 'off_4' },

  // 5. Huyện Nho Quan (27 đơn vị) - Officer: off_5 (Đỗ Thị Hồng Hạnh)
  { code: 'NB-NQ-01', name: 'Thị trấn Nho Quan', type: 'Thị trấn', district: 'Huyện Nho Quan', address: 'Phố Tân Nhất, TT Nho Quan', officerId: 'off_5' },
  { code: 'NB-NQ-02', name: 'Xã Cúc Phương', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Nga 1, Xã Cúc Phương', officerId: 'off_5' },
  { code: 'NB-NQ-03', name: 'Xã Đồng Phong', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Phong Lai, Xã Đồng Phong', officerId: 'off_5' },
  { code: 'NB-NQ-04', name: 'Xã Lạng Phong', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Sấm 2, Xã Lạng Phong', officerId: 'off_5' },
  { code: 'NB-NQ-05', name: 'Xã Thạch Bình', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Đồi Lán, Xã Thạch Bình', officerId: 'off_5' },
  { code: 'NB-NQ-06', name: 'Xã Phú Long', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn 3, Xã Phú Long', officerId: 'off_5' },
  { code: 'NB-NQ-07', name: 'Xã Gia Tường', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Bình Khang, Xã Gia Tường', officerId: 'off_5' },
  { code: 'NB-NQ-08', name: 'Xã Gia Lâm', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Phù Sa, Xã Gia Lâm', officerId: 'off_5' },
  { code: 'NB-NQ-09', name: 'Xã Gia Sơn', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Chấn Lữ, Xã Gia Sơn', officerId: 'off_5' },
  { code: 'NB-NQ-10', name: 'Xã Gia Thủy', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Liên Phương, Xã Gia Thủy', officerId: 'off_5' },
  { code: 'NB-NQ-11', name: 'Xã Sơn Lai', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Me, Xã Sơn Lai', officerId: 'off_5' },
  { code: 'NB-NQ-12', name: 'Xã Sơn Hà', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Lạc Bình, Xã Sơn Hà', officerId: 'off_5' },
  { code: 'NB-NQ-13', name: 'Xã Sơn Thành', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Đồng Đinh, Xã Sơn Thành', officerId: 'off_5' },
  { code: 'NB-NQ-14', name: 'Xã Quảng Lạc', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Lạc Thành, Xã Quảng Lạc', officerId: 'off_5' },
  { code: 'NB-NQ-15', name: 'Xã Yên Quang', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Đồng Tâm, Xã Yên Quang', officerId: 'off_5' },
  { code: 'NB-NQ-16', name: 'Xã Văn Phương', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Tiền Phương, Xã Văn Phương', officerId: 'off_5' },
  { code: 'NB-NQ-17', name: 'Xã Văn Phú', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Lạc Hiền, Xã Văn Phú', officerId: 'off_5' },
  { code: 'NB-NQ-18', name: 'Xã Văn Phong', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Sào Hà, Xã Văn Phong', officerId: 'off_5' },
  { code: 'NB-NQ-19', name: 'Xã Thanh Lạc', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Thanh Trung, Xã Thanh Lạc', officerId: 'off_5' },
  { code: 'NB-NQ-20', name: 'Xã Thượng Hòa', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Trại Lộc, Xã Thượng Hòa', officerId: 'off_5' },
  { code: 'NB-NQ-21', name: 'Xã Đức Long', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Bến Đang, Xã Đức Long', officerId: 'off_5' },
  { code: 'NB-NQ-22', name: 'Xã Phú Sơn', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Sơn Cao, Xã Phú Sơn', officerId: 'off_5' },
  { code: 'NB-NQ-23', name: 'Xã Xích Thổ', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Đại Long, Xã Xích Thổ', officerId: 'off_5' },
  { code: 'NB-NQ-24', name: 'Xã Kỳ Phú', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Suối Cả, Xã Kỳ Phú', officerId: 'off_5' },
  { code: 'NB-NQ-25', name: 'Xã Phú Lộc', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Lộc An, Xã Phú Lộc', officerId: 'off_5' },
  { code: 'NB-NQ-26', name: 'Xã Quỳnh Lưu', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Áp Lũ, Xã Quỳnh Lưu', officerId: 'off_5' },
  { code: 'NB-NQ-27', name: 'Xã Ninh Khang (NQ)', type: 'Xã', district: 'Huyện Nho Quan', address: 'Thôn Đồi Chè, Xã Ninh Khang', officerId: 'off_5' },

  // 6. Huyện Yên Khánh (19 đơn vị) - Officer: off_6 (Vũ Đình Mạnh)
  { code: 'NB-YK-01', name: 'Thị trấn Yên Ninh', type: 'Thị trấn', district: 'Huyện Yên Khánh', address: 'Khu phố 1, TT Yên Ninh', officerId: 'off_6' },
  { code: 'NB-YK-02', name: 'Xã Khánh Hội', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Phú Cường, Xã Khánh Hội', officerId: 'off_6' },
  { code: 'NB-YK-03', name: 'Xã Khánh Mậu', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Mậu Thịnh, Xã Khánh Mậu', officerId: 'off_6' },
  { code: 'NB-YK-04', name: 'Xã Khánh Thiện', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Bồng Hải, Xã Khánh Thiện', officerId: 'off_6' },
  { code: 'NB-YK-05', name: 'Xã Khánh Tiên', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Tiên Hậu, Xã Khánh Tiên', officerId: 'off_6' },
  { code: 'NB-YK-06', name: 'Xã Khánh Phú', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Phú An, Xã Khánh Phú', officerId: 'off_6' },
  { code: 'NB-YK-07', name: 'Xã Khánh Hòa', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Hòa Lạc, Xã Khánh Hòa', officerId: 'off_6' },
  { code: 'NB-YK-08', name: 'Xã Khánh An', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn An Lạc, Xã Khánh An', officerId: 'off_6' },
  { code: 'NB-YK-09', name: 'Xã Khánh Cường', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Đông Cường, Xã Khánh Cường', officerId: 'off_6' },
  { code: 'NB-YK-10', name: 'Xã Khánh Trung', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn 4, Xã Khánh Trung', officerId: 'off_6' },
  { code: 'NB-YK-11', name: 'Xã Khánh Thành', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Thành Gia, Xã Khánh Thành', officerId: 'off_6' },
  { code: 'NB-YK-12', name: 'Xã Khánh Công', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Thổ Mật, Xã Khánh Công', officerId: 'off_6' },
  { code: 'NB-YK-13', name: 'Xã Khánh Nhạc', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Nhạc Lộc, Xã Khánh Nhạc', officerId: 'off_6' },
  { code: 'NB-YK-14', name: 'Xã Khánh Hồng', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Hồng Đức, Xã Khánh Hồng', officerId: 'off_6' },
  { code: 'NB-YK-15', name: 'Xã Khánh Cư', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Cư An, Xã Khánh Cư', officerId: 'off_6' },
  { code: 'NB-YK-16', name: 'Xã Khánh Hải', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Hải Nhuận, Xã Khánh Hải', officerId: 'off_6' },
  { code: 'NB-YK-17', name: 'Xã Khánh Vân', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Vân Lũ, Xã Khánh Vân', officerId: 'off_6' },
  { code: 'NB-YK-18', name: 'Xã Khánh Lợi', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Lợi Tân, Xã Khánh Lợi', officerId: 'off_6' },
  { code: 'NB-YK-19', name: 'Xã Khánh Ninh', type: 'Xã', district: 'Huyện Yên Khánh', address: 'Thôn Ninh Lộc, Xã Khánh Ninh', officerId: 'off_6' },

  // 7. Huyện Kim Sơn (18 đơn vị mẫu trong số các đơn vị lớn) - Officer: off_7 (Hoàng Minh Tuấn)
  { code: 'NB-KS-01', name: 'Thị trấn Phát Diệm', type: 'Thị trấn', district: 'Huyện Kim Sơn', address: 'Phố Phát Diệm Tây, TT Phát Diệm', officerId: 'off_7' },
  { code: 'NB-KS-02', name: 'Thị trấn Bình Minh', type: 'Thị trấn', district: 'Huyện Kim Sơn', address: 'Khu phố 2, TT Bình Minh', officerId: 'off_7' },
  { code: 'NB-KS-03', name: 'Xã Kim Chính', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 5, Xã Kim Chính', officerId: 'off_7' },
  { code: 'NB-KS-04', name: 'Xã Thượng Kiệm', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 2, Xã Thượng Kiệm', officerId: 'off_7' },
  { code: 'NB-KS-05', name: 'Xã Lưu Phương', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 6, Xã Lưu Phương', officerId: 'off_7' },
  { code: 'NB-KS-06', name: 'Xã Tân Thành', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 3, Xã Tân Thành', officerId: 'off_7' },
  { code: 'NB-KS-07', name: 'Xã Định Hóa', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 9, Xã Định Hóa', officerId: 'off_7' },
  { code: 'NB-KS-08', name: 'Xã Hùng Tiến', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 4, Xã Hùng Tiến', officerId: 'off_7' },
  { code: 'NB-KS-09', name: 'Xã Như Hòa', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 7, Xã Như Hòa', officerId: 'off_7' },
  { code: 'NB-KS-10', name: 'Xã Quang Thiện', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 10, Xã Quang Thiện', officerId: 'off_7' },
  { code: 'NB-KS-11', name: 'Xã Đồng Hướng', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 8, Xã Đồng Hướng', officerId: 'off_7' },
  { code: 'NB-KS-12', name: 'Xã Kim Mỹ', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm Mỹ Lộc, Xã Kim Mỹ', officerId: 'off_7' },
  { code: 'NB-KS-13', name: 'Xã Kim Tân', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm Tân Thành, Xã Kim Tân', officerId: 'off_7' },
  { code: 'NB-KS-14', name: 'Xã Cồn Thoi', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 1, Xã Cồn Thoi', officerId: 'off_7' },
  { code: 'NB-KS-15', name: 'Xã Kim Hải', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm Kim Phú, Xã Kim Hải', officerId: 'off_7' },
  { code: 'NB-KS-16', name: 'Xã Kim Trung', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 2, Xã Kim Trung', officerId: 'off_7' },
  { code: 'NB-KS-17', name: 'Xã Kim Đông', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 1A, Xã Kim Đông', officerId: 'off_7' },
  { code: 'NB-KS-18', name: 'Xã Xuân Thiện', type: 'Xã', district: 'Huyện Kim Sơn', address: 'Xóm 12, Xã Xuân Thiện', officerId: 'off_7' },

  // 8. Huyện Yên Mô (15 đơn vị) - Officer: off_8 (Bùi Thu Trang)
  { code: 'NB-YM-01', name: 'Thị trấn Yên Thịnh', type: 'Thị trấn', district: 'Huyện Yên Mô', address: 'Khu phố 1, TT Yên Thịnh', officerId: 'off_8' },
  { code: 'NB-YM-02', name: 'Xã Yên Thắng', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Vân Mộng, Xã Yên Thắng', officerId: 'off_8' },
  { code: 'NB-YM-03', name: 'Xã Yên Hòa', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Lạc Hiền, Xã Yên Hòa', officerId: 'off_8' },
  { code: 'NB-YM-04', name: 'Xã Khánh Thượng', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Thượng Lực, Xã Khánh Thượng', officerId: 'off_8' },
  { code: 'NB-YM-05', name: 'Xã Yên Từ', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Nộn Khê, Xã Yên Từ', officerId: 'off_8' },
  { code: 'NB-YM-06', name: 'Xã Yên Phong', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Tràng Duệ, Xã Yên Phong', officerId: 'off_8' },
  { code: 'NB-YM-07', name: 'Xã Mai Sơn', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Mai Khê, Xã Mai Sơn', officerId: 'off_8' },
  { code: 'NB-YM-08', name: 'Xã Yên Nhân', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Yên Lạc, Xã Yên Nhân', officerId: 'off_8' },
  { code: 'NB-YM-09', name: 'Xã Yên Đồng', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Yên Tế, Xã Yên Đồng', officerId: 'off_8' },
  { code: 'NB-YM-10', name: 'Xã Yên Thái', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Đông Thôn, Xã Yên Thái', officerId: 'off_8' },
  { code: 'NB-YM-11', name: 'Xã Yên Mạc', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Hồng Phong, Xã Yên Mạc', officerId: 'off_8' },
  { code: 'NB-YM-12', name: 'Xã Yên Mỹ', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Mỹ Lộc, Xã Yên Mỹ', officerId: 'off_8' },
  { code: 'NB-YM-13', name: 'Xã Yên Thành', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Bồ Vy, Xã Yên Thành', officerId: 'off_8' },
  { code: 'NB-YM-14', name: 'Xã Yên Hưng', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Hưng Đạo, Xã Yên Hưng', officerId: 'off_8' },
  { code: 'NB-YM-15', name: 'Xã Khánh Thịnh', type: 'Xã', district: 'Huyện Yên Mô', address: 'Thôn Thịnh Vượng, Xã Khánh Thịnh', officerId: 'off_8' },
];

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// Chuyển đổi thành 129 units chuẩn
export const INITIAL_UNITS: Unit[] = rawUnitsData.map((item, idx) => {
  const slug = removeVietnameseTones(item.name);
  const account = `ubnd_${slug}`;
  const email = `${slug}.ninhbinh@gov.vn`;
  const contactPerson = [
    'Nguyễn Văn Tuấn', 'Trần Đình Trọng', 'Lê Thị Mai', 'Phạm Minh Đức',
    'Vũ Thị Lan', 'Hoàng Văn Cường', 'Đặng Thu Hằng', 'Bùi Đức Hải'
  ][idx % 8];
  const roleTitle = idx % 3 === 0 ? 'Phó Chủ tịch UBND' : (idx % 3 === 1 ? 'Kế toán trưởng' : 'Công chức TC - KT');
  const phone = `0229.38${String(100 + (idx % 900)).padStart(3, '0')}`;

  return {
    id: `unit_${idx + 1}`,
    ma_don_vi: item.code,
    ten_don_vi: item.name,
    loai_don_vi: item.type,
    huyen_tp: item.district,
    dia_chi: item.address,
    nguoi_phu_trach: contactPerson,
    chuc_vu: roleTitle,
    so_dien_thoai: phone,
    email: email,
    email_nhan_thong_bao: email,
    tai_khoan: account,
    quan_ly_xa_id: item.officerId,
    trang_thai: 'hoat_dong',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-10-01T09:30:00Z',
  };
});

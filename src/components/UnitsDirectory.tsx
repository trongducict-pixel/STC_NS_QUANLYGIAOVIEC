import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Unit, DistrictName, UnitType } from '../types';
import {
  Building2,
  Search,
  Filter,
  Users,
  Download,
  Upload,
  Edit2,
  Check,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';

export const UnitsDirectory: React.FC = () => {
  const {
    currentUser,
    units,
    officers,
    updateUnit,
    importUnits,
    batchAssignOfficer,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [officerFilter, setOfficerFilter] = useState<string>('all');
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  // Batch assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetOfficerId, setTargetOfficerId] = useState(officers[0]?.id || '');

  // Edit unit modal
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const districts: DistrictName[] = [
    'Thành phố Ninh Bình',
    'Thành phố Tam Điệp',
    'Huyện Hoa Lư',
    'Huyện Gia Viễn',
    'Huyện Nho Quan',
    'Huyện Yên Khánh',
    'Huyện Kim Sơn',
    'Huyện Yên Mô',
  ];

  const filteredUnits = units.filter((u) => {
    if (districtFilter !== 'all' && u.huyen_tp !== districtFilter) return false;
    if (officerFilter !== 'all' && u.quan_ly_xa_id !== officerFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.ten_don_vi.toLowerCase().includes(q);
      const matchCode = u.ma_don_vi.toLowerCase().includes(q);
      const matchPerson = u.nguoi_phu_trach.toLowerCase().includes(q);
      const matchPhone = u.so_dien_thoai.includes(q);
      if (!matchName && !matchCode && !matchPerson && !matchPhone) return false;
    }
    return true;
  });

  const handleSelectAll = () => {
    if (selectedUnitIds.length === filteredUnits.length) {
      setSelectedUnitIds([]);
    } else {
      setSelectedUnitIds(filteredUnits.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApplyBatchAssign = () => {
    if (selectedUnitIds.length === 0) return;
    batchAssignOfficer(targetOfficerId, selectedUnitIds);
    const off = officers.find((o) => o.id === targetOfficerId);
    alert(
      `Đã phân công đồng chí ${off?.name} phụ trách ${selectedUnitIds.length} xã/phường được chọn.`
    );
    setShowAssignModal(false);
    setSelectedUnitIds([]);
  };

  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Mã Đơn Vị',
      'Tên Đơn Vị',
      'Loại Đơn Vị',
      'Quận / Huyện',
      'Địa Chỉ',
      'Người Phụ Trách',
      'Chức Vụ',
      'Số Điện Thoại',
      'Email Báo Cáo',
      'Tài Khoản',
      'Mã Cán Bộ Sở Phụ Trách',
      'Tên Cán Bộ Sở',
    ];

    const rows = filteredUnits.map((u, idx) => {
      const off = officers.find((o) => o.id === u.quan_ly_xa_id);
      return [
        idx + 1,
        `"${u.ma_don_vi}"`,
        `"${u.ten_don_vi}"`,
        `"${u.loai_don_vi}"`,
        `"${u.huyen_tp}"`,
        `"${u.dia_chi}"`,
        `"${u.nguoi_phu_trach}"`,
        `"${u.chuc_vu}"`,
        `"${u.so_dien_thoai}"`,
        `"${u.email}"`,
        `"${u.tai_khoan}"`,
        `"${u.quan_ly_xa_id}"`,
        `"${off?.name || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_129_Xa_Phuong_Ninh_Binh_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    updateUnit(editingUnit);
    setEditingUnit(null);
    alert('Cập nhật thông tin đơn vị thành công!');
  };

  const canManageOfficers = currentUser.role === 'ADMIN' || currentUser.role === 'LANH_DAO';

  return (
    <div className="space-y-5">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              CƠ SỞ DỮ LIỆU ĐƠN VỊ HÀNH CHÍNH
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Danh Bạ 129 Xã, Phường, Thị Trấn Ninh Bình
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý đầu mối liên lạc, email công vụ và phân công chuyên viên Sở Tài chính phụ trách
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canManageOfficers && selectedUnitIds.length > 0 && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                Phân Công Cán Bộ ({selectedUnitIds.length})
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Xuất CSV / Excel
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên xã, phường, mã đơn vị, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">Tất cả 8 Huyện / TP ({units.length} đơn vị)</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">Tất cả cán bộ Sở phụ trách</option>
            {officers.map((o) => (
              <option key={o.id} value={o.id}>
                CB: {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
              <tr>
                {canManageOfficers && (
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredUnits.length > 0 &&
                        selectedUnitIds.length === filteredUnits.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3 px-3">Mã Đơn Vị</th>
                <th className="py-3 px-3">Tên Xã / Phường</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-3">Huyện / TP</th>
                <th className="py-3 px-3">Đầu Mối Xã</th>
                <th className="py-3 px-3">Số Điện Thoại</th>
                <th className="py-3 px-3">Email Công Vụ</th>
                <th className="py-3 px-3">Cán Bộ Sở Phụ Trách</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không tìm thấy đơn vị nào.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => {
                  const off = officers.find((o) => o.id === u.quan_ly_xa_id);
                  const isChecked = selectedUnitIds.includes(u.id);

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {canManageOfficers && (
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(u.id)}
                            className="rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">
                        {u.ma_don_vi}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {u.ten_don_vi}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {u.loai_don_vi}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {u.huyen_tp}
                      </td>
                      <td className="py-3 px-3 text-slate-800">
                        <div>{u.nguoi_phu_trach}</div>
                        <div className="text-[10px] text-slate-400">{u.chuc_vu}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {u.so_dien_thoai}
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-700 max-w-xs truncate">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-800">
                        {off ? (
                          <div>
                            <div className="font-semibold text-slate-900">{off.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{off.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa phân công</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingUnit(u)}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Sửa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between text-xs text-slate-500">
          <span>Tổng số hiển thị: <strong>{filteredUnits.length}</strong> / 129 đơn vị</span>
          <span>Toàn tỉnh Ninh Bình</span>
        </div>
      </div>

      {/* BATCH ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Phân Công Cán Bộ Sở Phụ Trách
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Đang chọn <strong>{selectedUnitIds.length}</strong> đơn vị xã/phường để giao trách nhiệm theo dõi và đôn đốc.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Chọn cán bộ phụ trách:
                </label>
                <select
                  value={targetOfficerId}
                  onChange={(e) => setTargetOfficerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden text-xs"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.title}) - SĐT: {o.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleApplyBatchAssign}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  Lưu phân công
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT UNIT MODAL */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Chỉnh Sửa Thông Tin Đơn Vị
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              {editingUnit.ma_don_vi} - {editingUnit.ten_don_vi}
            </p>

            <form onSubmit={handleSaveEditUnit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tên đơn vị
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUnit.ten_don_vi}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, ten_don_vi: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Loại đơn vị
                  </label>
                  <select
                    value={editingUnit.loai_don_vi}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, loai_don_vi: e.target.value as UnitType })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
                  >
                    <option value="Xã">Xã</option>
                    <option value="Phường">Phường</option>
                    <option value="Thị trấn">Thị trấn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Địa chỉ trụ sở
                </label>
                <input
                  type="text"
                  required
                  value={editingUnit.dia_chi}
                  onChange={(e) =>
                    setEditingUnit({ ...editingUnit, dia_chi: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Người phụ trách nộp báo cáo
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUnit.nguoi_phu_trach}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, nguoi_phu_trach: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUnit.chuc_vu}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, chuc_vu: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUnit.so_dien_thoai}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, so_dien_thoai: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email công vụ
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUnit.email}
                    onChange={(e) =>
                      setEditingUnit({ ...editingUnit, email: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Cán bộ Sở phụ trách
                </label>
                <select
                  value={editingUnit.quan_ly_xa_id}
                  onChange={(e) =>
                    setEditingUnit({ ...editingUnit, quan_ly_xa_id: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:outline-hidden text-xs"
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, ShieldAlert, Check } from 'lucide-react';

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({
  isOpen,
  onSuccess,
}) => {
  const { currentUser, changePassword } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword === '123456') {
      setError('Mật khẩu mới không được trùng với mật khẩu mặc định 123456.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    changePassword(currentUser.id, newPassword);
    alert('Đổi mật khẩu thành công! Bạn có thể tiếp tục sử dụng hệ thống.');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Yêu Cầu Đổi Mật Khẩu Lần Đầu
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tài khoản <strong>{currentUser.ho_ten}</strong> ({currentUser.username}) đang sử dụng mật khẩu khởi tạo mặc định <code>123456</code>.
            Để đảm bảo an toàn thông tin và bảo mật dữ liệu của Sở Tài chính Ninh Bình, bạn bắt buộc phải thiết lập mật khẩu mới trước khi tiếp tục.
          </p>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nhập lại mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Khớp với mật khẩu trên"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Lưu Mật Khẩu Mới & Tiếp Tục
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

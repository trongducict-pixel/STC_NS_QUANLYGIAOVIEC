import React from 'react';
import { ReportStatus } from '../types';
import {
  Clock,
  AlertTriangle,
  AlertOctagon,
  Send,
  Inbox,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ReportStatus;
  overdueDays?: number;
  className?: string;
}

export const STATUS_CONFIG: Record<
  ReportStatus,
  {
    label: string;
    description: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  CHUA_DEN_HAN: {
    label: 'Chưa đến hạn',
    description: 'Chưa tới hạn chót nộp báo cáo',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: Clock,
  },
  SAP_DEN_HAN: {
    label: 'Sắp đến hạn',
    description: 'Trong ngưỡng cảnh báo cần đôn đốc',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertTriangle,
  },
  QUA_HAN: {
    label: 'Quá hạn',
    description: 'Đã quá hạn quy định nhưng chưa gửi',
    textColor: 'text-rose-800',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    icon: AlertOctagon,
  },
  DA_XAC_NHAN_GUI: {
    label: 'Đã gửi email',
    description: 'Đơn vị đã gửi email và xác nhận',
    textColor: 'text-sky-800',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    icon: Send,
  },
  DA_NHAN: {
    label: 'Sở đã nhận',
    description: 'Cán bộ Sở đã kiểm tra hòm thư công vụ',
    textColor: 'text-indigo-800',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: Inbox,
  },
  YEU_CAU_SUA_DOI: {
    label: 'Yêu cầu sửa đổi',
    description: 'Phát hiện sai sót, yêu cầu hoàn thiện lại',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    icon: RotateCcw,
  },
  HOAN_THANH: {
    label: 'Hoàn thành',
    description: 'Báo cáo hợp lệ, hoàn tất tiếp nhận',
    textColor: 'text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  overdueDays = 0,
  className = '',
}) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CHUA_DEN_HAN;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-md transition-colors ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} ${className}`}
      title={cfg.description}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{cfg.label}</span>
      {status === 'QUA_HAN' && overdueDays > 0 && (
        <span className="font-semibold text-rose-700 ml-0.5 tabular-nums">
          (+{overdueDays} ngày)
        </span>
      )}
    </span>
  );
};

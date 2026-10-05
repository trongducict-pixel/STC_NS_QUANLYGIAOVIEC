import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface NavigationBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const NavigationBreadcrumb: React.FC<NavigationBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs text-slate-500 font-medium py-2 px-1 overflow-x-auto whitespace-nowrap">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 hover:text-slate-900 transition-colors text-slate-600 font-semibold"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </button>

      {items.slice(1).map((item, index) => {
        const isLast = index === items.length - 2;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 shrink-0" />
            {item.onClick && !item.active ? (
              <button
                onClick={item.onClick}
                className="hover:text-slate-900 text-slate-600 hover:underline transition-colors max-w-xs truncate"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-[#0F2C59] font-bold max-w-xs truncate">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

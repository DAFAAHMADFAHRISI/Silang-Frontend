import type React from 'react';
import { AlertCircle } from 'lucide-react';

/** Shared page shell for all Siswa routes (matches Attendance/Todo pattern). */
export const SISWA_PAGE_CLASS =
  'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6';

export const SiswaDivider: React.FC = () => (
  <div className="border-t border-gray-700/50 my-6 sm:my-8 w-full" />
);

interface SiswaPageHeaderProps {
  title: string;
  subtitle?: string;
}

export const SiswaPageHeader: React.FC<SiswaPageHeaderProps> = ({ title, subtitle }) => (
  <div className="mb-4 sm:mb-6">
    <div className="flex items-center space-x-2 sm:space-x-3">
      <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full flex-shrink-0" />
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {title}
      </h1>
    </div>
    {subtitle && (
      <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">{subtitle}</p>
    )}
  </div>
);

interface SiswaLoadingProps {
  message?: string;
}

export const SiswaLoading: React.FC<SiswaLoadingProps> = ({
  message = 'Memuat data...',
}) => (
  <div className={SISWA_PAGE_CLASS}>
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
      <p className="text-gray-400 text-sm sm:text-base">{message}</p>
    </div>
  </div>
);

interface SiswaErrorProps {
  error: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const SiswaError: React.FC<SiswaErrorProps> = ({
  error,
  onRetry,
  retryLabel = 'Coba Lagi',
}) => (
  <div className={SISWA_PAGE_CLASS}>
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center px-4 max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-4 text-sm sm:text-lg font-semibold">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg transition-colors text-sm sm:text-base font-semibold"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);

interface SiswaSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export const SiswaSearchFilter: React.FC<SiswaSearchFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  filterValue,
  onFilterChange,
  filterOptions,
  children,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
    <input
      type="text"
      placeholder={searchPlaceholder}
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      className="bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 w-full sm:flex-1 sm:max-w-md text-sm sm:text-base"
    />
    <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
      {filterOptions && onFilterChange && filterValue !== undefined && (
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 text-xs sm:text-sm w-full sm:w-auto min-w-[140px]"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {children}
    </div>
  </div>
);

/** Compact stat card (2 cols mobile, 4 cols lg). */
interface SiswaStatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  valueClassName?: string;
}

export const SiswaStatCard: React.FC<SiswaStatCardProps> = ({
  label,
  value,
  icon,
  valueClassName = 'text-white',
}) => (
  <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-gray-400 text-xs sm:text-sm truncate">{label}</p>
        <p className={`text-xl sm:text-2xl font-bold ${valueClassName}`}>{value}</p>
      </div>
      <div className="flex-shrink-0">{icon}</div>
    </div>
  </div>
);

export const SISWA_STATS_GRID = 'grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6';

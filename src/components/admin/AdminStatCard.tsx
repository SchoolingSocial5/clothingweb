import { formatPrice } from "@/utils/format";

interface AdminStatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  positive?: boolean;
}

export default function AdminStatCard({ label, value, trend, positive }: AdminStatCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
        {trend && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-md ${positive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

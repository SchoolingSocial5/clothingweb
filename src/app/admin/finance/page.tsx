"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { apiClient } from '@/utils/api';

interface FinanceRow {
  name: string;
  quantity: number;
  amount: number;
}

interface FinanceData {
  retail?: {
    sales: FinanceRow;
    purchases: FinanceRow;
    expenses: FinanceRow;
    salary: FinanceRow;
  };
  wholesale?: {
    sales: FinanceRow;
    purchases: FinanceRow;
    expenses: FinanceRow;
    salary: FinanceRow;
  };
}

export default function FinancePage() {
  const { token } = useAuth();
  const { settings } = useSettings();
  const currencySymbol = settings?.currency_symbol || "₦";

  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [isFilterApplied, setIsFilterApplied] = useState(true); // Default to true (today's transactions by default)
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (isFilterApplied) {
        if (fromDate) params.append('from', fromDate);
        if (toDate) params.append('to', toDate);
      }

      const url = `/admin/finance?${params.toString()}`;
      const financeData = await apiClient<FinanceData>(url);
      setData(financeData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching finance summaries.');
    } finally {
      setLoading(false);
    }
  }, [isFilterApplied, fromDate, toDate]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleApplyFilter = () => {
    setIsFilterApplied(true);
  };

  const handleAllClick = () => {
    setIsFilterApplied(false);
    setFromDate('');
    setToDate('');
  };

  const formatPriceLocal = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderTable = (title: string, rows: { sales: FinanceRow; purchases: FinanceRow; expenses: FinanceRow; salary: FinanceRow }) => {
    const tableRows = [
      { key: 'Sales', ...rows.sales, color: 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20' },
      { key: 'Purchases', ...rows.purchases, color: 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20' },
      { key: 'Expenses', ...rows.expenses, color: 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20' },
      { key: 'Salary', ...rows.salary, color: 'text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20' },
    ];

    // Net Cash Flow = Sales - Purchases - Expenses
    // Wait, let's also show Net Cash Flow at the bottom as a premium detail!
    const netProfit = rows.sales.amount - rows.purchases.amount - rows.expenses.amount - rows.salary.amount;

    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 tracking-tight">{title}</h3>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
            Overview
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-neutral-800 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Defined Role</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-center">Quantity</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60">
              {tableRows.map((row) => (
                <tr key={row.key} className="hover:bg-gray-50/40 dark:hover:bg-neutral-800/20 transition-colors">
                  <td className="px-6 py-4.5 font-bold text-sm text-gray-900 dark:text-gray-100">{row.key}</td>
                  <td className="px-6 py-4.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${row.color}`}>
                      {row.name}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-center font-semibold text-gray-500 dark:text-gray-400 text-sm">
                    {row.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4.5 text-right font-black text-gray-900 dark:text-gray-100 text-sm">
                    {formatPriceLocal(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-5 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-900/30 flex justify-between items-center mt-auto">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Estimated Net Flow</span>
          <span className={`font-black text-base ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {netProfit >= 0 ? '+' : ''}{formatPriceLocal(netProfit)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-[10px] md:p-8">
      <AdminPageHeader 
        title="Finance Summary" 
        description="Monitor and analyze Sales, Purchases, Expenses, and Staff Overhead across retail and wholesale departments."
      />

      {/* Date Filter Bar */}
      <div className="mb-8 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm px-5 py-4 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">From Date</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || today}
              onChange={e => setFromDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">To Date</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={today}
              onChange={e => setToDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:text-gray-100"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            disabled={!fromDate || !toDate}
            className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-85 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Apply Filter
          </button>
          <button
            onClick={handleAllClick}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer
              ${!isFilterApplied 
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' 
                : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700'
              }`}
          >
            All
          </button>
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 self-center">
          {isFilterApplied ? `Filtered Summary: ${fromDate} to ${toDate}` : "All-Time Financial Overview"}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 h-[380px] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm"></div>
          ))}
        </div>
      ) : data ? (
        <div className={`grid grid-cols-1 ${data.retail && data.wholesale ? 'lg:grid-cols-2' : ''} gap-8`}>
          {data.retail && renderTable("Retail Financials", data.retail)}
          {data.wholesale && renderTable("Wholesale Financials", data.wholesale)}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-12 text-center rounded-2xl shadow-sm text-gray-400">
          No financial summary records available.
        </div>
      )}
    </div>
  );
}

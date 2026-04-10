"use client";

import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  stats?: {
    label: string;
    value: string | number;
  };
  children?: ReactNode; // For actions like buttons
}

export default function AdminPageHeader({ title, description, stats, children }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-12">
      <div className="flex-1 min-w-[200px] md:min-w-[300px]">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2 font-medium">{description}</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto mt-4 sm:mt-0">
        {stats && (
          <div className="bg-gray-100 dark:bg-neutral-800 px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 md:gap-3 border border-gray-200/50 dark:border-neutral-700 flex-1 sm:flex-none justify-between sm:justify-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{stats.label}</span>
            <span className="text-sm font-black text-gray-900 dark:text-gray-100">{stats.value}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

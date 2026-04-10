export default function TableLoader({ colSpan = 6 }: { colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-5 border-t border-gray-50">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Loading…</span>
        </div>
      </td>
    </tr>
  );
}

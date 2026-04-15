interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  visible: boolean;
  onClose?: () => void;
}

export default function Toast({ message, type, visible, onClose }: ToastProps) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
      <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border ${
        type === "success" ? "bg-green-50 border-green-100 text-green-800" : 
        type === "error" ? "bg-red-50 border-red-100 text-red-800" : 
        type === "info" ? "bg-blue-50 border-blue-100 text-blue-800" :
        "bg-amber-50 border-amber-100 text-amber-800"
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          type === "success" ? "bg-green-500 text-white" : 
          type === "error" ? "bg-red-500 text-white" : 
          type === "info" ? "bg-blue-500 text-white" :
          "bg-amber-500 text-white"
        }`}>
          {type === "success" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : type === "error" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : type === "info" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          )}
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>
    </div>
  );
}

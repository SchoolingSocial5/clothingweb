export default function Sidebar() {
  const categories = ["All Products", "New Arrivals", "Coats & Jackets", "Knitwear", "Shirts", "T-Shirts", "Trousers", "Denim", "Accessories"];
  const colors = ["#000000", "#ffffff", "#8B4513", "#808080", "#000080", "#556B2F"];

  return (
    <aside className="w-64 pr-10 flex-shrink-0 sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto hidden lg:block transition-colors duration-300">
      <div className="mb-10">
        <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-gray-900 dark:text-gray-100">Categories</h3>
        <ul className="space-y-4">
          {categories.map((c, i) => (
            <li key={c}>
              <button className={`text-sm tracking-wide hover:text-black dark:hover:text-white transition-colors ${i === 2 ? 'text-black dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                {c}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-10">
        <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-gray-900 dark:text-gray-100">Colors</h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((c, i) => (
            <button 
              key={c} 
              className={`w-6 h-6 rounded-full border ${c === '#ffffff' ? 'border-gray-300 dark:border-neutral-700' : 'border-transparent'} ring-2 ring-offset-2 dark:ring-offset-neutral-900 ${i === 0 ? 'ring-black dark:ring-white' : 'ring-transparent hover:ring-gray-300 dark:hover:ring-neutral-700'} transition-all`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm tracking-widest uppercase mb-6 text-gray-900 dark:text-gray-100">Price Range</h3>
        <div className="w-full">
          <input type="range" min="0" max="1000" defaultValue="500" className="w-full h-1 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white" />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">
            <span>$0</span>
            <span>$1,000+</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

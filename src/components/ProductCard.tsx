interface ProductCardProps {
  name: string;
  category: string;
  price: string;
  color: string;
  quantity: number;
  image_url?: string;
}

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function ProductCard({ id, name, category, price, color, quantity, image_url }: ProductCardProps & { id: number }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity <= 0) return;
    setIsAdding(true);
    addToCart({ id, name, category, price, color, image_url, quantity });
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className={`group cursor-pointer flex flex-col ${quantity <= 0 ? 'opacity-70' : ''} transition-colors duration-300`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-neutral-800 mb-5">
        {quantity <= 0 && (
          <div className="absolute top-4 left-4 z-20 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full shadow-xl">
            Sold Out
          </div>
        )}
        {/* Product Image or Placeholder */}
        {image_url ? (
          <img 
            src={image_url} 
            alt={name} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-neutral-800 dark:to-neutral-900 group-hover:scale-105 transition-transform duration-700 ease-out"></div>
        )}
        
        {/* Quick add button on hover */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={handleAddToCart}
            disabled={quantity <= 0}
            className={`w-full py-3 ${quantity <= 0 ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-neutral-500 cursor-not-allowed' : isAdding ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white/90 dark:bg-neutral-900/90 backdrop-blur text-black dark:text-white"} text-xs font-bold tracking-widest uppercase hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 shadow-sm cursor-pointer`}
          >
            {quantity <= 0 ? "Out of Stock" : isAdding ? "Added!" : "Quick Add"}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{category}</p>
        </div>
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">${price}</p>
      </div>
      <div className="mt-3 flex gap-1">
        <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-neutral-700" style={{ backgroundColor: color }}></div>
      </div>
    </div>
  );
}

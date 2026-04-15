"use client";
import React, { useState } from 'react';
import { getImageUrl } from '@/utils/image';
import { OrderItem } from './types';

export default function ItemImage({ item }: { item: OrderItem }) {
  const [error, setError] = useState(false);
  const src = getImageUrl(item.productImage);
  if (src && !error) {
    return (
      <img
        src={src || undefined}
        alt={item.productName}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-gray-300">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

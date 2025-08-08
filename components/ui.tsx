import React from 'react';

export function Currency({ value }: { value: number }) {
  return <>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)}</>;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-2xl bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
      {children}
    </span>
  );
}

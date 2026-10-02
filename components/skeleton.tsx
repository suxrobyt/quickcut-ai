'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-qc-border rounded animate-pulse ${className}`} />
  );
}

import React from 'react';

export function GameCardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-0 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-slate-800/80 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-800 rounded-md w-3/4" />
        <div className="h-3 bg-slate-800/60 rounded-md w-full" />
        <div className="h-3 bg-slate-800/60 rounded-md w-2/3" />
        <div className="pt-3 border-t border-slate-800/60 flex justify-between">
          <div className="h-4 bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function GameGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <GameCardSkeleton key={idx} />
      ))}
    </div>
  );
}

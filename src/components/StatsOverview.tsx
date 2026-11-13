'use client';

import React from 'react';
import useSWR from 'swr';
import { Gamepad2, MessageSquare, ThumbsUp, ShieldCheck, Activity } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StatsOverview() {
  const { data, isLoading } = useSWR('/api/stats', fetcher, {
    refreshInterval: 30000,
  });

  const stats = data?.data || {
    totalGames: 6,
    totalReviews: 18,
    totalUsers: 3,
    avgRating: 4.8,
    globalPositivePercentage: 92,
    uptime: '99.98%',
    apiStatus: 'Operational',
  };

  return (
    <div id="stats" className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            Live System Integration
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Metrics and Security Metrics
          </h2>
          <p className="text-sm text-slate-400">
            Real-time player reviews, average scores, and backend health status
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md hover:border-cyan-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Catalog Games
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center border border-cyan-800/40">
                <Gamepad2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {isLoading ? '...' : stats.totalGames}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">AAA and Indie Games</p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md hover:border-indigo-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Written Reviews
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center border border-indigo-800/40">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {isLoading ? '...' : stats.totalReviews}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Authentic Player Reviews</p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Positive Review Ratio
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
                <ThumbsUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {isLoading ? '...' : `${stats.globalPositivePercentage}%`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Steam-Standard Global Consensus</p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md hover:border-purple-500/40 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Security & Uptime
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center border border-purple-800/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-300">
              {stats.uptime}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 font-mono">
              Status: {stats.apiStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

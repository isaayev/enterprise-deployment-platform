'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import GameCard from '@/components/GameCard';
import GameFilters from '@/components/GameFilters';
import StatsOverview from '@/components/StatsOverview';
import { GameGridSkeleton } from '@/components/LoadingSkeleton';
import { Game } from '@/types';
import { Gamepad2, Sparkles, Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [playerMode, setPlayerMode] = useState('All');
  const [sort, setSort] = useState('rating_desc');

  const queryParams = new URLSearchParams();
  if (search.trim()) queryParams.set('search', search.trim());
  if (category && category !== 'All') queryParams.set('category', category);
  if (playerMode && playerMode !== 'All') queryParams.set('playerMode', playerMode);
  if (sort) queryParams.set('sort', sort);

  const { data, isLoading } = useSWR(`/api/games?${queryParams.toString()}`, fetcher, {
    keepPreviousData: true,
  });

  const games: Game[] = data?.data || [];

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setPlayerMode('All');
    setSort('rating_desc');
  };

  return (
    <div className="space-y-12 pb-16">
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Steam & Epic Games Standard Backend Integration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Explore Games,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Rate and Write a Review
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Comprehensive information about your favorite games, real player ratings,Steam-style
            recommendation percentages, and custom-tailored to your preferences{' '}
            <span className="text-cyan-300 font-semibold">Option to write an anonymous review by hiding</span>{' '}
            your name.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#catalog"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              Browse Game Catalog
            </a>
            {!user && (
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm transition border border-slate-700 flex items-center gap-2"
              >
                Create Account
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-black text-white tracking-tight">Game Catalog</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Photos, short descriptions, categories, and rating scores of all games
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Displayed: <span className="font-bold text-cyan-400">{games.length}</span> game
          </div>
        </div>

        <GameFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          playerMode={playerMode}
          onPlayerModeChange={setPlayerMode}
          sort={sort}
          onSortChange={setSort}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <GameGridSkeleton count={6} />
        ) : games.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-3">
            <Gamepad2 className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">No games found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Change the search term or reset the filters to browse all games.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      <StatsOverview />
    </div>
  );
}

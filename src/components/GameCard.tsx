import React from 'react';
import Link from 'next/link';
import { Game } from '@/types';
import { Star, Users, Tag, ThumbsUp } from 'lucide-react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const { ratingStats } = game;
  const isPositive = ratingStats.positivePercentage >= 75;

  return (
    <Link
      href={`/games/${game.id}`}
      className="group relative flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/60 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1.5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-cyan-300">
          <Tag className="w-3 h-3 text-cyan-400" />
          {game.category}
        </div>

        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-indigo-600/90 text-[11px] font-bold text-white shadow">
          {game.price === 0 ? 'FREE' : `$${game.price.toFixed(2)}`}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-100">{ratingStats.averageRating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({ratingStats.totalReviews})</span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-md font-bold text-[11px] border ${isPositive
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/50'
              }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{ratingStats.positivePercentage}% Positive</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium">Modes:</span>
            <div className="flex flex-wrap gap-1">
              {game.playerModes.map((mode) => (
                <span
                  key={mode}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 border border-slate-700/50 font-medium"
                >
                  {mode}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {game.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-800/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

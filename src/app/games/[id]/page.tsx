'use client';

import React, { use } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Game, Review } from '@/types';
import { formatReleaseDate } from '@/lib/formatDate';
import RatingBreakdown from '@/components/RatingBreakdown';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import {
  Gamepad2,
  Calendar,
  Building,
  Monitor,
  Users,
  Tag,
  ArrowLeft,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GameDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const {
    data: gameData,
    error: gameError,
    isLoading: isGameLoading,
    mutate: mutateGame,
  } = useSWR(`/api/games/${id}`, fetcher);

  const {
    data: reviewsData,
    mutate: mutateReviews,
  } = useSWR(`/api/reviews?gameId=${id}`, fetcher);

  const game: Game | undefined = gameData?.data;
  const reviews: Review[] = reviewsData?.data || [];

  const handleReviewCreated = (newReview: Review) => {
    mutateReviews((prev: { success: boolean; data: Review[] } | undefined) => {
      const currentReviews = prev?.data || [];
      return {
        success: true,
        data: [newReview, ...currentReviews],
      };
    }, false);
    mutateGame();
  };

  const handleDeleteReview = (reviewId: string) => {
    mutateReviews((prev: { success: boolean; data: Review[] } | undefined) => {
      const currentReviews = prev?.data || [];
      return {
        success: true,
        data: currentReviews.filter((r) => r.id !== reviewId),
      };
    }, false);
    mutateGame();
  };

  if (isGameLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading game data and reviews...</p>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Game Not Found</h2>
        <p className="text-slate-400 text-sm">
          The game you are looking for does not exist or has been removed from the system.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      <section className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
        <div className="absolute inset-0 h-full w-full">
          <img
            src={game.bannerImage || game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover opacity-25 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-cyan-400 transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Game Catalog
            </Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">{game.category}</span>
            <span>/</span>
            <span className="text-cyan-400 font-bold truncate max-w-[200px]">{game.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900">
              <img
                src={game.coverImage}
                alt={game.title}
                className="w-full aspect-[16/10] object-cover group-hover:scale-102 transition duration-500"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-indigo-600/90 text-xs font-black text-white shadow-lg">
                {game.price === 0 ? 'PLAY FOR FREE' : `$${game.price.toFixed(2)}`}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-semibold">
                  <Tag className="w-3 h-3" />
                  {game.category}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {game.title}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                  {game.tagline}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Developer:</span>
                    <span className="font-semibold text-white">{game.developer}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Publisher:</span>
                    <span className="font-semibold text-white">{game.publisher}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Release Date:</span>
                    <span className="font-semibold text-white">{formatReleaseDate(game.releaseDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Player Modes:</span>
                    <span className="font-semibold text-white">
                      {game.playerModes
                        .map((m) =>
                          m === 'Singleplayer'
                            ? 'Singleplayer'
                            : m === 'Multiplayer'
                              ? 'Multiplayer'
                              : m === 'Co-op'
                                ? 'Co-op'
                                : m
                        )
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-slate-400 mr-1 font-semibold">Tags:</span>
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                Detailed Game Information
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {game.description}
              </p>

              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Supported Mode</span>
                  <span className="font-bold text-xs text-cyan-300">
                    {game.playerModes.join(' & ')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Cloud Save</span>
                  <span className="font-bold text-xs text-emerald-400">Steam Cloud Support</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Achievements</span>
                  <span className="font-bold text-xs text-purple-400">Available (Achievements)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                System Requirements (PC)
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <span className="font-bold text-cyan-300 block uppercase tracking-wider text-[11px]">
                    Minimum Requirements:
                  </span>
                  <div className="text-slate-400 space-y-1">
                    <p><b className="text-slate-300">OS:</b> {game.systemRequirements.minimum.os}</p>
                    <p><b className="text-slate-300">Processor:</b> {game.systemRequirements.minimum.processor}</p>
                    <p><b className="text-slate-300">Memory:</b> {game.systemRequirements.minimum.memory}</p>
                    <p><b className="text-slate-300">Graphics:</b> {game.systemRequirements.minimum.graphics}</p>
                    <p><b className="text-slate-300">Storage:</b> {game.systemRequirements.minimum.storage}</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                  <span className="font-bold text-emerald-300 block uppercase tracking-wider text-[11px]">
                    Recommended Requirements:
                  </span>
                  <div className="text-slate-400 space-y-1">
                    <p><b className="text-slate-300">OS:</b> {game.systemRequirements.recommended.os}</p>
                    <p><b className="text-slate-300">Processor:</b> {game.systemRequirements.recommended.processor}</p>
                    <p><b className="text-slate-300">Memory:</b> {game.systemRequirements.recommended.memory}</p>
                    <p><b className="text-slate-300">Graphics:</b> {game.systemRequirements.recommended.graphics}</p>
                    <p><b className="text-slate-300">Storage:</b> {game.systemRequirements.recommended.storage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <RatingBreakdown stats={game.ratingStats} />

          <ReviewForm
            gameId={game.id}
            gameTitle={game.title}
            onReviewCreated={handleReviewCreated}
          />

          <ReviewList
            reviews={reviews}
            onDeleteReview={handleDeleteReview}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import useSWR from 'swr';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Review, Game } from '@/types';
import {
  Star,
  Award,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Mail,
  Gamepad2,
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: reviewsData } = useSWR('/api/reviews', fetcher);
  const { data: gamesData } = useSWR('/api/games', fetcher);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Log in to view profile</h2>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-cyan-500 font-bold text-slate-950 text-xs"
        >
          Log In
        </Link>
      </div>
    );
  }

  const allReviews: Review[] = reviewsData?.data || [];
  const allGames: Game[] = gamesData?.data || [];
  const userReviews = allReviews.filter((r) => r.userId === user.id);

  const getGameTitle = (gameId: string) => {
    const found = allGames.find((g) => g.id === gameId);
    return found ? found.title : 'Oyun';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-cyan-500/50 flex items-center justify-center text-cyan-400 text-3xl font-black">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user.username}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                {user.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Register: {new Date(user.createdAt).toLocaleDateString('az-AZ')}
              </span>
            </div>

            {user.bio && <p className="text-xs text-slate-300 max-w-xl">{user.bio}</p>}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
              {user.badges?.map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-medium flex items-center gap-1"
                >
                  <Award className="w-3 h-3 text-amber-400" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            Reviews and Ratings You Wrote ({userReviews.length})
          </h2>
        </div>

        {userReviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
            <p className="text-sm font-semibold">You haven&apos;t written a review for any games yet.</p>
            <Link href="/" className="text-xs font-bold text-cyan-400 hover:underline">
              Browse the game catalog and write your first review
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userReviews.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/games/${r.gameId}`}
                      className="font-bold text-sm text-cyan-400 hover:underline"
                    >
                      {getGameTitle(r.gameId)}
                    </Link>
                    {r.isAnonymous && (
                      <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Published anonymously
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-white">{r.rating} / 5</span>
                    </div>
                    {r.isRecommended ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <ThumbsUp className="w-3 h-3" /> Recommendation
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                        <ThumbsDown className="w-3 h-3" /> Negative
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-sm text-white">{r.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{r.content}</p>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                  <span>{new Date(r.createdAt).toLocaleDateString('az-AZ')}</span>
                  <span>Helpful: {r.helpfulVotes}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

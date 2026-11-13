'use client';

import React, { useState } from 'react';
import { Review } from '@/types';
import ReviewItem from './ReviewItem';
import { MessageSquare, EyeOff } from 'lucide-react';

interface ReviewListProps {
  reviews: Review[];
  onDeleteReview?: (id: string) => void;
}

export default function ReviewList({ reviews, onDeleteReview }: ReviewListProps) {
  const [filterType, setFilterType] = useState<'all' | 'recommended' | 'critical' | 'anonymous'>('all');
  const [sortBy, setSortBy] = useState<'helpful' | 'newest' | 'rating'>('helpful');

  const filtered = reviews.filter((r) => {
    if (filterType === 'recommended') return r.isRecommended;
    if (filterType === 'critical') return !r.isRecommended;
    if (filterType === 'anonymous') return r.isAnonymous;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'helpful') {
      return (b.helpfulVotes || 0) - (a.helpfulVotes || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h4 className="font-extrabold text-base text-white">
            Customer reviews ({reviews.length})
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${filterType === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setFilterType('recommended')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${filterType === 'recommended'
                ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Positive
            </button>
            <button
              onClick={() => setFilterType('critical')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${filterType === 'critical'
                ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/60'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Negative
            </button>
            <button
              onClick={() => setFilterType('anonymous')}
              className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${filterType === 'anonymous'
                ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/60'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <EyeOff className="w-3 h-3" />
              Anonymous ({reviews.filter((r) => r.isAnonymous).length})
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'helpful' | 'newest' | 'rating')}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-cyan-400"
          >
            <option value="helpful">Most Helpful Review</option>
            <option value="newest">New Review</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-400 space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
          <p className="font-semibold text-sm">No reviews found matching this filter</p>
          <p className="text-xs text-slate-500">You can view other reviews by changing the filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onDeleteReview={onDeleteReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

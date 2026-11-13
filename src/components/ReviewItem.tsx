'use client';

import React, { useState } from 'react';
import { Review } from '@/types';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  EyeOff,
  Trash2,
  UserCheck,
} from 'lucide-react';

interface ReviewItemProps {
  review: Review;
  onDeleteReview?: (id: string) => void;
}

export default function ReviewItem({ review, onDeleteReview }: ReviewItemProps) {
  const { user, isAdmin } = useAuth();

  const [helpfulCount, setHelpfulCount] = useState<number>(review.helpfulVotes || 0);
  const [unhelpfulCount, setUnhelpfulCount] = useState<number>(review.unhelpfulVotes || 0);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isOwner = user && user.id === review.userId;
  const canDelete = isOwner || isAdmin;

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      alert('You must log in first to vote');
      return;
    }
    if (hasVoted) return;

    setHasVoted(true);
    if (isHelpful) {
      setHelpfulCount((prev) => prev + 1);
    } else {
      setUnhelpfulCount((prev) => prev + 1);
    }

    try {
      await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful }),
      });
    } catch {
      if (isHelpful) setHelpfulCount((prev) => prev - 1);
      else setUnhelpfulCount((prev) => prev - 1);
      setHasVoted(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDeleteReview?.(review.id);
      } else {
        alert('An error occurred while deleting the review');
      }
    } catch {
      alert('Network error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(review.createdAt).toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 md:p-6 backdrop-blur-md space-y-4 hover:border-slate-700/80 transition-all">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="flex items-center gap-3">
          {review.isAnonymous ? (
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
              <EyeOff className="w-5 h-5" />
            </div>
          ) : review.authorAvatar ? (

            <img
              src={review.authorAvatar}
              alt={review.authorName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
              {review.authorName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                {review.isAnonymous ? 'Anonymous Player' : review.authorName}
              </span>

              {review.isAnonymous ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 flex items-center gap-1">
                  <EyeOff className="w-2.5 h-2.5" />
                  Anonymous Gamer
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 flex items-center gap-1">
                  <UserCheck className="w-2.5 h-2.5" />
                  Gamer
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{formattedDate}</span>
              {review.hoursPlayed ? (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {review.hoursPlayed} hrs on record
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${review.isRecommended
              ? 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300'
              : 'bg-rose-950/70 border-rose-600/50 text-rose-300'
              }`}
          >
            {review.isRecommended ? (
              <>
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                Recommended
              </>
            ) : (
              <>
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                Not Recommended
              </>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-white">{review.rating} / 5</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <h5 className="font-bold text-sm text-slate-100">{review.title}</h5>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {review.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px]">Was this review helpful?</span>

          <button
            onClick={() => handleVote(true)}
            disabled={hasVoted}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${hasVoted
              ? 'bg-slate-950 text-slate-500 border-slate-800 cursor-default'
              : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
          >
            <ThumbsUp className="w-3 h-3 text-cyan-400" />
            Yes ({helpfulCount})
          </button>

          <button
            onClick={() => handleVote(false)}
            disabled={hasVoted}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${hasVoted
              ? 'bg-slate-950 text-slate-500 border-slate-800 cursor-default'
              : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
          >
            <ThumbsDown className="w-3 h-3 text-slate-400" />
            No ({unhelpfulCount})
          </button>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete Review"
            className="flex items-center gap-1 text-[11px] text-rose-400/80 hover:text-rose-300 transition p-1 hover:bg-rose-950/30 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

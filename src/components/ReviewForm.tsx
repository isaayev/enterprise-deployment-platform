'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Review } from '@/types';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  EyeOff,
  Clock,
  Send,
  AlertCircle,
  LogIn,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface ReviewFormProps {
  gameId: string;
  gameTitle: string;
  onReviewCreated: (newReview: Review) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 Star - Poor / Not Recommended',
  2: '2 Stars - Mediocre',
  3: '3 Stars - Average / Playable',
  4: '4 Stars - Very Good & Engaging',
  5: '5 Stars - Outstanding / Masterpiece!',
};

export default function ReviewForm({ gameId, gameTitle, onReviewCreated }: ReviewFormProps) {
  const { user, isAuthenticated } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isRecommended, setIsRecommended] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [hoursPlayed, setHoursPlayed] = useState<number>(10);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
          <Star className="w-6 h-6 fill-cyan-400 text-cyan-400" />
        </div>
        <h4 className="text-lg font-bold text-white">
          Want to rate and review &ldquo;{gameTitle}&rdquo;?
        </h4>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Share your gameplay experiences, rate this title, and optionally hide your name to post anonymously with verified community security.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition border border-slate-700"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (title.trim().length < 3) {
      setErrorMsg('Headline must be at least 3 characters long');
      return;
    }
    if (content.trim().length < 10) {
      setErrorMsg('Review text must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          rating,
          isRecommended,
          title: title.trim(),
          content: content.trim(),
          isAnonymous,
          hoursPlayed: Number(hoursPlayed) || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(result.error || 'Failed to submit review');
        return;
      }

      setSuccessMsg('Your review and rating have been published successfully!');
      setTitle('');
      setContent('');

      if (result.data) {
        onReviewCreated(result.data);
      }
    } catch {
      setErrorMsg('Network error connecting to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Rate This Game & Write a Review
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Signed in as: <span className="font-semibold text-cyan-400">{user.username}</span>
          </p>
        </div>

        {isAnonymous && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
            <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
            Anonymous Review Mode Enabled
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Game Rating (1 - 5 Stars):
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const active = starVal <= (hoverRating || rating);
              return (
                <button
                  type="button"
                  key={starVal}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(starVal)}
                  className="p-1 rounded-lg hover:scale-115 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${active
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                        : 'text-slate-700 hover:text-slate-500'
                      }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-semibold text-amber-300 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-800/40">
            {RATING_LABELS[hoverRating || rating]}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Do you recommend this game to others?
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setIsRecommended(true)}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition border ${isRecommended
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
          >
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
            Yes, I Recommend
          </button>

          <button
            type="button"
            onClick={() => setIsRecommended(false)}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition border ${!isRecommended
                ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
          >
            <ThumbsDown className="w-4 h-4 text-rose-400" />
            No, Not Recommended
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-1">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Review Headline
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stunning visual direction and captivating story!"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Hours Played
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={hoursPlayed}
            onChange={(e) => setHoursPlayed(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Detailed Review & Feedback
        </label>
        <textarea
          required
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe gameplay mechanics, combat, optimization, graphics, and storyline nuances..."
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none resize-y"
        />
      </div>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-900 cursor-pointer"
        />
        <label htmlFor="isAnonymous" className="text-xs text-slate-300 cursor-pointer select-none">
          <span className="font-bold text-white flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
            Hide my username (Post as Anonymous Gamer)
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">
            When checked, other gamers will not see your username or profile avatar. Your review will be published
            publicly as &ldquo;Anonymous Gamer&rdquo;.
          </span>
        </label>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          Review audited for community anti-spam standards
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Publish Review
            </>
          )}
        </button>
      </div>
    </form>
  );
}

import React from 'react';
import { Star, ThumbsUp, Award, BarChart2 } from 'lucide-react';
import { Game } from '@/types';

interface RatingBreakdownProps {
  stats: Game['ratingStats'];
}

export default function RatingBreakdown({ stats }: RatingBreakdownProps) {
  const { averageRating, totalReviews, positivePercentage, starDistribution } = stats;

  let verdict = 'Mixed';
  let verdictColor = 'text-amber-400';
  let verdictBadgeBg = 'bg-amber-950/60 border-amber-800/60';

  if (totalReviews === 0) {
    verdict = 'No Reviews Yet';
    verdictColor = 'text-slate-400';
    verdictBadgeBg = 'bg-slate-900 border-slate-800';
  } else if (positivePercentage >= 95) {
    verdict = 'Overwhelmingly Positive';
    verdictColor = 'text-emerald-400';
    verdictBadgeBg = 'bg-emerald-950/80 border-emerald-600/60 shadow-lg shadow-emerald-500/20';
  } else if (positivePercentage >= 80) {
    verdict = 'Very Positive';
    verdictColor = 'text-cyan-400';
    verdictBadgeBg = 'bg-cyan-950/80 border-cyan-600/60 shadow-lg shadow-cyan-500/20';
  } else if (positivePercentage >= 70) {
    verdict = 'Mostly Positive';
    verdictColor = 'text-sky-400';
    verdictBadgeBg = 'bg-sky-950/60 border-sky-800/60';
  } else if (positivePercentage >= 40) {
    verdict = 'Mixed';
    verdictColor = 'text-amber-400';
    verdictBadgeBg = 'bg-amber-950/60 border-amber-800/60';
  } else {
    verdict = 'Mostly Negative';
    verdictColor = 'text-rose-400';
    verdictBadgeBg = 'bg-rose-950/60 border-rose-800/60';
  }

  let topStar = 5;
  let maxCount = -1;
  const starsArray = [5, 4, 3, 2, 1] as const;

  for (const s of starsArray) {
    const count = starDistribution[s] || 0;
    if (count > maxCount) {
      maxCount = count;
      topStar = s;
    }
  }

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 backdrop-blur-md space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg md:text-xl font-extrabold text-white">
              Player Reviews & Rating Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time community sentiment, rating score, and statistical distribution matrix
          </p>
        </div>

        <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${verdictBadgeBg}`}>
          <ThumbsUp className={`w-5 h-5 ${verdictColor}`} />
          <div>
            <div className={`font-black text-sm tracking-wide ${verdictColor}`}>
              {verdict}
            </div>
            <div className="text-[11px] text-slate-300">
              <span className="font-bold text-white">{positivePercentage}%</span> of {totalReviews} players recommend this game
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
          <div className="text-5xl md:text-6xl font-black bg-gradient-to-br from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            {averageRating.toFixed(1)}
          </div>

          <div className="flex items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <Star
                key={starIndex}
                className={`w-5 h-5 ${starIndex <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                    : 'text-slate-700'
                  }`}
              />
            ))}
          </div>

          <p className="text-xs text-slate-400">
            Out of 5.0 • Based on <span className="font-semibold text-slate-200">{totalReviews}</span> reviews
          </p>

          {totalReviews > 0 && maxCount > 0 && (
            <div className="mt-2 text-[11px] px-2.5 py-1 rounded-md bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Most Common Rating: <b>{topStar} Stars</b></span>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-2.5">
          {starsArray.map((star) => {
            const count = starDistribution[star] || 0;
            const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <div className="w-16 flex items-center gap-1 font-semibold text-slate-300 shrink-0">
                  <span>{star} Stars</span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>

                <div className="flex-1 h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${star >= 4
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                        : star === 3
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="font-bold text-slate-200">{percent}%</span>{' '}
                  <span className="text-[11px] text-slate-500">({count})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

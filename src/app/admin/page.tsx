'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/lib/contexts/AuthContext';
import { AuditLog, Game } from '@/types';
import {
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  Activity,
  Trash2,
  Lock,
  Gamepad2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboardPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'audit' | 'games'>('audit');
  const [newGameModal, setNewGameModal] = useState(false);

  const [gameTitle, setGameTitle] = useState('');
  const [gameTagline, setGameTagline] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameCategory, setGameCategory] = useState('Action RPG');
  const [gamePlayerModes] = useState<string[]>(['Singleplayer']);
  const [gameDeveloper, setGameDeveloper] = useState('');
  const [gamePublisher, setGamePublisher] = useState('');
  const [gamePrice, setGamePrice] = useState(59.99);
  const [gameCoverImage, setGameCoverImage] = useState(
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  );
  const [gameBannerImage] = useState(
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80'
  );
  const [gameTags, setGameTags] = useState('RPG, Adventure, Open World');
  const [releaseMonth, setReleaseMonth] = useState('');
  const [releaseDay, setReleaseDay] = useState('');
  const [releaseYear, setReleaseYear] = useState('');

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [isSubmittingGame, setIsSubmittingGame] = useState(false);
  const [gameFormError, setGameFormError] = useState<string | null>(null);

  const {
    data: auditData,
    isLoading: isAuditLoading,
    mutate: mutateAudit,
  } = useSWR(isAdmin ? '/api/audit-logs' : null, fetcher, { refreshInterval: 10000 });

  const {
    data: gamesData,
    mutate: mutateGames,
  } = useSWR('/api/games', fetcher);

  const auditLogs: AuditLog[] = auditData?.data || [];
  const games: Game[] = gamesData?.data || [];

  if (isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Access Restricted (403)</h2>
        <p className="text-sm text-slate-400">
          This page is restricted to system administrators. Your account does not have sufficient privileges.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setGameFormError(null);
    setIsSubmittingGame(true);

    try {
      const payload = {
        title: gameTitle,
        tagline: gameTagline,
        description: gameDescription,
        category: gameCategory,
        playerModes: gamePlayerModes,
        developer: gameDeveloper,
        publisher: gamePublisher,
        price: Number(gamePrice) || 0,
        releaseDate: `${releaseYear}-${releaseMonth}-${releaseDay.padStart(2, '0')}`,
        coverImage: gameCoverImage,
        bannerImage: gameBannerImage,
        tags: gameTags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setGameFormError(json.error || 'An error occurred while adding the game');
        return;
      }

      setNewGameModal(false);
      setGameTitle('');
      setGameTagline('');
      setGameDescription('');
      setReleaseMonth('');
      setReleaseDay('');
      setReleaseYear('');
      mutateGames();
      mutateAudit();
    } catch {
      setGameFormError('Network error occurred');
    } finally {
      setIsSubmittingGame(false);
    }
  };

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    if (!confirm(`"${gameTitle}" Are you sure you want to delete the game "{gameTitle}" and all associated reviews?`)) return;

    try {
      const res = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
      if (res.ok) {
        mutateGames();
        mutateAudit();
      }
    } catch {
      alert('An error occurred during deletion');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Enterprise Management & Security Panel
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit logs, API control, user security, and game catalog management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Audit Logs ({auditLogs.length})
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'games'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Games ({games.length})
          </button>
        </div>
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              System Security and Event Tracking History (Compliance Audit Trail)
            </h3>
            <button
              onClick={() => mutateAudit()}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">User / IP</th>
                  <th className="p-3.5">Resurs</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {isAuditLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Loading audit data...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No audit records found yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'SUCCESS'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : log.status === 'BLOCKED'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                            }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-white font-sans">{log.action}</td>
                      <td className="p-3.5">
                        <span className="text-cyan-400 block">{log.userEmail || 'Qonaq'}</span>
                        <span className="text-[10px] text-slate-500">{log.ipAddress}</span>
                      </td>
                      <td className="p-3.5 text-slate-400">{log.resource}</td>
                      <td className="p-3.5 font-sans text-slate-200 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('az-AZ')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'games' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              Games in Catalog ({games.length})
            </h3>
            <button
              onClick={() => setNewGameModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Game
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {g.category}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      ★ {g.ratingStats.averageRating.toFixed(1)} ({g.ratingStats.totalReviews} Review)
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base">{g.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{g.tagline}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/games/${g.id}`}
                    className="text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    Go to Page →
                  </Link>
                  <button
                    onClick={() => handleDeleteGame(g.id, g.title)}
                    className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {newGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">Add New Game</h3>
              <button
                onClick={() => setNewGameModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {gameFormError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
                {gameFormError}
              </div>
            )}

            <form onSubmit={handleCreateGame} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Game Name</label>
                <input
                  required
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  placeholder="e.g.: Ghost of Tsushima"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Short Title (Tagline)</label>
                <input
                  required
                  type="text"
                  value={gameTagline}
                  onChange={(e) => setGameTagline(e.target.value)}
                  placeholder="e.g., Samurai honor and the defense of Tsushima Island"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  value={gameDescription}
                  onChange={(e) => setGameDescription(e.target.value)}
                  placeholder="Detailed game description in Steam store style..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <input
                    required
                    type="text"
                    value={gameCategory}
                    onChange={(e) => setGameCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Developer</label>
                  <input
                    required
                    type="text"
                    value={gameDeveloper}
                    onChange={(e) => setGameDeveloper(e.target.value)}
                    placeholder="e.g.: Sucker Punch"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Publisher</label>
                  <input
                    required
                    type="text"
                    value={gamePublisher}
                    onChange={(e) => setGamePublisher(e.target.value)}
                    placeholder="e.g.: PlayStation Publishing"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Publisher ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gamePrice}
                    onChange={(e) => setGamePrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL</label>
                <input
                  required
                  type="url"
                  value={gameCoverImage}
                  onChange={(e) => setGameCoverImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tags (separated by commas)</label>
                <input
                  type="text"
                  value={gameTags}
                  onChange={(e) => setGameTags(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Release Date</label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    required
                    value={releaseMonth}
                    onChange={(e) => setReleaseMonth(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, '0')}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Day"
                    value={releaseDay}
                    onChange={(e) => setReleaseDay(e.target.value.slice(0, 2))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />

                  <input
                    required
                    type="number"
                    min="1970"
                    max="2100"
                    placeholder="Year"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value.slice(0, 4))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewGameModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  İmtina
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGame}
                  className="px-5 py-2 rounded-xl bg-cyan-500 font-bold text-slate-950 hover:bg-cyan-400 transition"
                >
                  {isSubmittingGame ? 'Saving...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

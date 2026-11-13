'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Shield, Lock, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
              <span className="font-black text-xl text-white tracking-wider">
                NEXUS GAMING <span className="text-cyan-400 text-sm font-mono">ENTERPRISE</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              High-scale gaming analytics and community review platform. Powered by SWR caching,
              optimistic UI updates, server-side data validation, and robust cryptographic JWT security architecture.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-400 font-mono">
                <Shield className="w-3 h-3 text-cyan-400" />
                Anti-Cheat & DRM Compliant
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-purple-400 font-mono">
                <Lock className="w-3 h-3 text-purple-400" />
                JWT Auth & Rate-Limiting
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Optimistic SWR Sync
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition">
                  Browse All Games
                </Link>
              </li>
              <li>
                <Link href="/#stats" className="hover:text-cyan-400 transition">
                  Platform Statistics
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-cyan-400 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-cyan-400 transition">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Nexus Gaming Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Next.js App Router, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}

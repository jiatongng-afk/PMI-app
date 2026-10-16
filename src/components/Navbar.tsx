import React from 'react';
import { Bell, Volume2, VolumeX, ShieldAlert, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenAlertSettings: () => void;
  hasUnhealthyAlert: boolean;
  alertCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAlertSettings,
  hasUnhealthyAlert,
  alertCount,
  soundEnabled,
  onToggleSound,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-xs select-none">
            SG
          </div>
          <a href="#" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            SG AirWatch
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#telemetry" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Live Telemetry
          </a>
          <a href="#map-section" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Regional Map
          </a>
          <a href="#trends" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            24h Trends
          </a>
          <a href="#pollutants" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Pollutants
          </a>
          <a href="#advisories" className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap">
            Health Advisories
          </a>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh latest NEA readings"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh live data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute alert chime' : 'Enable alert sound'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle alert sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            onClick={onOpenAlertSettings}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              hasUnhealthyAlert
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs'
            }`}
          >
            {hasUnhealthyAlert ? (
              <ShieldAlert className="w-4 h-4 text-slate-950 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            <span>Alert Console</span>
            {alertCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/20 font-bold">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

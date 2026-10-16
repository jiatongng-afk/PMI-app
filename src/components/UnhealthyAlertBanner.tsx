import React from 'react';
import { AlertTriangle, AlertOctagon, X, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { RegionKey, REGIONS } from '../types/psi';

interface BreachedRegion {
  region: RegionKey;
  psi: number;
  pm25: number;
}

interface UnhealthyAlertBannerProps {
  breachedRegions: BreachedRegion[];
  threshold: number;
  onSelectRegion: (region: RegionKey) => void;
  onAcknowledge: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const UnhealthyAlertBanner: React.FC<UnhealthyAlertBannerProps> = ({
  breachedRegions,
  threshold,
  onSelectRegion,
  onAcknowledge,
  soundEnabled,
  onToggleSound,
}) => {
  if (breachedRegions.length === 0) return null;

  const maxPsi = Math.max(...breachedRegions.map((r) => r.psi));
  const isEmergency = maxPsi > 200;

  return (
    <div
      role="alert"
      className={`relative border-b transition-colors ${
        isEmergency
          ? 'bg-rose-500 text-white border-rose-600'
          : 'bg-amber-500 text-slate-950 border-amber-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 rounded-lg bg-black/10 shrink-0 mt-0.5 sm:mt-0">
            {isEmergency ? (
              <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-slate-950 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold tracking-tight uppercase text-xs sm:text-sm">
                {isEmergency ? 'Critical Haze Alert (Very Unhealthy)' : 'Haze Air Quality Alert (Unhealthy)'}
              </span>
              <span className="text-xs opacity-90">
                · Threshold of {threshold} PSI exceeded in {breachedRegions.length} {breachedRegions.length === 1 ? 'region' : 'regions'}
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5 font-medium leading-snug opacity-95">
              NEA Advisory: Reduce prolonged or strenuous outdoor physical exertion. Sensitive persons (elderly, pregnant women & children) should avoid outdoor activities.
            </p>
          </div>
        </div>

        {/* Breached region chips and quick actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <div className="flex items-center gap-1.5">
            {breachedRegions.map((item) => (
              <button
                key={item.region}
                onClick={() => onSelectRegion(item.region)}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-black/15 hover:bg-black/25 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                title={`Inspect ${REGIONS[item.region].name}`}
              >
                <span>{REGIONS[item.region].shortName}</span>
                <span className="font-mono font-bold">{item.psi}</span>
                <ArrowRight className="w-3 h-3 opacity-70" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 border-l border-black/15 pl-2 ml-1">
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-md hover:bg-black/15 transition-colors"
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onAcknowledge}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-black/20 hover:bg-black/30 transition-colors flex items-center gap-1"
              title="Acknowledge alert"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

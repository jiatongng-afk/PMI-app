import React from 'react';
import { RegionKey, REGIONS } from '../types/psi';
import { getBandInfo } from '../services/psiApi';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';

interface RegionalGridProps {
  psiValues: Record<RegionKey, number>;
  pm25Values: Record<RegionKey, number>;
  selectedRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
  threshold: number;
}

export const RegionalGrid: React.FC<RegionalGridProps> = ({
  psiValues,
  pm25Values,
  selectedRegion,
  onSelectRegion,
  threshold,
}) => {
  const regionsList: RegionKey[] = ['national', 'north', 'south', 'east', 'west', 'central'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base">
          Regional Air Quality Breakdown
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Click any zone to inspect
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {regionsList.map((key) => {
          const info = REGIONS[key];
          const psi = psiValues[key] || 40;
          const pm25 = pm25Values[key] || 15;
          const band = getBandInfo(psi);
          const isSelected = selectedRegion === key;
          const isBreached = psi >= threshold;

          return (
            <button
              key={key}
              onClick={() => onSelectRegion(key)}
              className={`text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              {/* Alert indicator dot/tag */}
              {isBreached && (
                <div
                  className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                  }`}
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>ALERT</span>
                </div>
              )}

              <div>
                <div
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    isSelected
                      ? 'text-slate-300 dark:text-slate-600'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {info.shortName}
                </div>
                <div className="text-xs font-medium truncate mt-0.5">
                  {info.majorTowns[0]}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold tabular-nums">
                      {psi}
                    </span>
                    <span className="text-[10px] font-mono opacity-70">
                      PSI
                    </span>
                  </div>
                  <div
                    className="text-[10px] font-semibold uppercase mt-0.5"
                    style={{
                      color: isSelected ? (band.isAlertLevel ? '#fde047' : '#6ee7b7') : band.hex,
                    }}
                  >
                    {band.category}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-[10px] font-mono ${
                      isSelected
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    1h PM2.5
                  </div>
                  <div className="font-mono text-xs font-semibold tabular-nums mt-0.5">
                    {pm25} <span className="text-[9px] font-normal">µg</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

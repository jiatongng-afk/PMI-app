import React from 'react';
import { RegionKey, REGIONS } from '../types/psi';
import {
  getBandInfo,
  getActivityAdvisory,
  SIMULATION_SCENARIOS,
  SimulationScenarioKey,
} from '../services/psiApi';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Activity,
  Flame,
  Info,
} from 'lucide-react';

interface HeroTelemetryProps {
  selectedRegion: RegionKey;
  psiValue: number;
  pm25Value: number;
  twentyFourHourPm25: number;
  threshold: number;
  lastUpdated: string;
  source: string;
  currentScenario: SimulationScenarioKey;
  onScenarioChange: (scenario: SimulationScenarioKey) => void;
  onTriggerAlertTest: () => void;
}

export const HeroTelemetry: React.FC<HeroTelemetryProps> = ({
  selectedRegion,
  psiValue,
  pm25Value,
  twentyFourHourPm25,
  threshold,
  lastUpdated,
  source,
  currentScenario,
  onScenarioChange,
  onTriggerAlertTest,
}) => {
  const regionInfo = REGIONS[selectedRegion];
  const band = getBandInfo(psiValue);
  const isBreached = psiValue >= threshold;
  const activity = getActivityAdvisory(psiValue);

  // PM2.5 1-hr category according to NEA Singapore standard
  // 0-55: Normal, 56-150: Elevated, 151-250: High, >250: Very High
  const getPm25Status = (val: number) => {
    if (val <= 55) return { label: 'Normal Exposure', color: 'text-emerald-600 dark:text-emerald-400', isAlert: false };
    if (val <= 150) return { label: 'Elevated Exposure', color: 'text-amber-600 dark:text-amber-400', isAlert: true };
    if (val <= 250) return { label: 'High Exposure', color: 'text-rose-600 dark:text-rose-400', isAlert: true };
    return { label: 'Very High Exposure', color: 'text-purple-600 dark:text-purple-400', isAlert: true };
  };

  const pm25Status = getPm25Status(pm25Value);

  // Position percentage along the 0-350 scale for the gauge
  const gaugePercent = Math.min(100, Math.max(0, (psiValue / 350) * 100));
  const thresholdPercent = Math.min(100, (threshold / 350) * 100);

  return (
    <section id="telemetry" className="space-y-4">
      {/* Simulation / Scenario Bar */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Activity className="w-4 h-4 text-sky-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Data Feed Engine:</span>
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {source} · SGT {lastUpdated}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="scenario-select" className="text-slate-500 dark:text-slate-400 font-medium">
            Test Scenario:
          </label>
          <select
            id="scenario-select"
            value={currentScenario}
            onChange={(e) => onScenarioChange(e.target.value as SimulationScenarioKey)}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {Object.entries(SIMULATION_SCENARIOS).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>

          <button
            onClick={onTriggerAlertTest}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg font-medium transition-colors"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spike Unhealthy Haze</span>
          </button>
        </div>
      </div>

      {/* Main Telemetry Focal Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big PSI and Air Status */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span>{regionInfo.name}</span>
                <span>·</span>
                <span>{regionInfo.majorTowns.join(', ')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                24-Hour Pollutant Standards Index
              </h1>
            </div>

            {/* Giant Number + Band Status */}
            <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
              <div className="flex items-baseline">
                <span className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
                  {psiValue}
                </span>
                <span className="text-base sm:text-lg font-mono text-slate-400 dark:text-slate-500 font-semibold ml-2">
                  PSI
                </span>
              </div>

              <div className="flex flex-col justify-center">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold text-sm uppercase tracking-wide border shadow-2xs"
                  style={{
                    backgroundColor: `${band.hex}18`,
                    borderColor: `${band.hex}40`,
                    color: band.hex,
                  }}
                >
                  {isBreached ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{band.category}</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Standard Scale: 0 - 500
                </span>
              </div>
            </div>

            {/* Gauge bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>0 (Pristine)</span>
                <span>100 (Moderate Limit)</span>
                <span>200 (Unhealthy)</span>
                <span>350+ (Hazardous)</span>
              </div>

              <div className="relative h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Gradient background for bands */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to right, #10b981 0%, #10b981 14.2%, #0284c7 14.2%, #0284c7 28.5%, #f59e0b 28.5%, #f59e0b 57.1%, #ef4444 57.1%, #ef4444 85.7%, #8b5cf6 85.7%, #8b5cf6 100%)',
                    opacity: 0.85,
                  }}
                />

                {/* Threshold Marker Indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xs z-10"
                  style={{ left: `${thresholdPercent}%` }}
                  title={`Alert threshold: ${threshold} PSI`}
                />
              </div>

              {/* Position Marker Pip */}
              <div className="relative w-full h-4">
                <div
                  className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${gaugePercent}%` }}
                >
                  <div className="w-2.5 h-2.5 rotate-45 bg-slate-900 dark:bg-white" />
                  <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {psiValue}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Advisory Banner */}
            <div
              className={`p-4 rounded-xl border transition-colors ${
                isBreached
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="font-semibold">
                    {isBreached ? '⚠️ Health Alert Advisory in Effect' : 'Official NEA Health Advisory'}
                  </div>
                  <p className="leading-relaxed opacity-90">{band.generalAdvisory}</p>
                  <p className="text-xs opacity-75 pt-1">
                    <span className="font-semibold">Sensitive Groups:</span> {band.vulnerableAdvisory}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 1-hr PM2.5 real-time & Activity readiness */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-8">
            {/* 1-Hour PM2.5 Block */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                    Immediate Air Exposure
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    1-Hour PM2.5 Concentration
                  </h3>
                </div>
                <div className="group relative cursor-pointer">
                  <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  <div className="hidden group-hover:block absolute right-0 top-6 w-56 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg z-20">
                    1-hr PM2.5 reflects immediate ambient fine particles (µg/m³), recommended by NEA for real-time decisions on outdoor workouts.
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {pm25Value}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      µg/m³
                    </span>
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${pm25Status.color}`}>
                    {pm25Status.label}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">24-hr PM2.5 Avg</div>
                  <div className="font-mono text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {twentyFourHourPm25} µg/m³
                  </div>
                </div>
              </div>
            </div>

            {/* Outdoor Activity Checklist */}
            <div className="space-y-3">
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                Outdoor Activity Viability
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Outdoor Running / Jogging', state: activity.running },
                  { label: 'Endurance Cycling / Commuting', state: activity.cycling },
                  { label: 'Outdoor Dining / Alfresco', state: activity.outdoorDining },
                  { label: 'Playgrounds & School Sports', state: activity.childrenPlay },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      {item.state.allowed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {item.label}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.state.note}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

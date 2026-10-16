import React, { useState } from 'react';
import { HourlyTrendPoint, RegionKey, REGIONS } from '../types/psi';
import { getBandInfo } from '../services/psiApi';

interface HistoricalTrendChartProps {
  trendData: HourlyTrendPoint[];
  selectedRegion: RegionKey;
  threshold: number;
}

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({
  trendData,
  selectedRegion,
  threshold,
}) => {
  const [activeRegion, setActiveRegion] = useState<RegionKey>(selectedRegion);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Sync if parent selectedRegion changes
  React.useEffect(() => {
    setActiveRegion(selectedRegion);
  }, [selectedRegion]);

  if (!trendData || trendData.length === 0) return null;

  // Chart dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 30, right: 30, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Compute scale bounds
  const values = trendData.map((d) => d[activeRegion]);
  const maxVal = Math.max(120, Math.ceil((Math.max(...values, threshold) * 1.15) / 20) * 20);
  const minVal = 0;

  const getX = (index: number) => padding.left + (index / (trendData.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Generate SVG path string
  const points = trendData.map((d, i) => `${getX(i)},${getY(d[activeRegion])}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(trendData.length - 1)},${padding.top + chartH} L ${getX(0)},${padding.top + chartH} Z`;

  // Threshold Y coordinate
  const thresholdY = getY(threshold);

  const hoverItem = hoverIndex !== null ? trendData[hoverIndex] : trendData[trendData.length - 1];
  const hoverPsi = hoverItem ? hoverItem[activeRegion] : 40;
  const hoverBand = getBandInfo(hoverPsi);

  return (
    <section id="trends" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              24-Hour Historical PSI Telemetry
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · Hourly Singapore Atmospheric Record
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hover along the timeline to inspect hourly haze and particulate fluctuations
          </p>
        </div>

        {/* Region selector tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['national', 'north', 'south', 'east', 'west', 'central'] as RegionKey[]).map((rKey) => (
            <button
              key={rKey}
              onClick={() => setActiveRegion(rKey)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeRegion === rKey
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {REGIONS[rKey].shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar over chart */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Time: </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {hoverItem.hour} SGT
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">PSI: </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {hoverPsi}
            </span>
            <span className="ml-1 text-[11px] font-semibold" style={{ color: hoverBand.hex }}>
              ({hoverBand.category})
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">PM2.5: </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {hoverItem.pm25_national} µg/m³
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-amber-600 dark:text-amber-400">
          <span className="w-2.5 h-0.5 bg-amber-500 inline-block border-b border-amber-500 border-dashed" />
          <span>Alert Baseline: {threshold} PSI</span>
        </div>
      </div>

      {/* SVG Time-series chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 50, 100, 150, 200, 250, 300]
              .filter((yVal) => yVal <= maxVal)
              .map((yVal) => {
                const y = getY(yVal);
                return (
                  <g key={yVal}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-slate-200 dark:text-slate-800"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                    >
                      {yVal}
                    </text>
                  </g>
                );
              })}

            {/* Threshold Line */}
            {threshold <= maxVal && (
              <g>
                <line
                  x1={padding.left}
                  y1={thresholdY}
                  x2={width - padding.right}
                  y2={thresholdY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={width - padding.right}
                  y={thresholdY - 6}
                  textAnchor="end"
                  className="text-[9px] font-mono font-semibold fill-amber-500"
                >
                  UNHEALTHY THRESHOLD ({threshold})
                </text>
              </g>
            )}

            {/* Area and Line */}
            <path d={areaPath} fill="url(#areaGradient)" />
            <path
              d={linePath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* X-axis labels (every 3 hours) */}
            {trendData.map((d, i) => {
              if (i % 3 !== 0 && i !== trendData.length - 1) return null;
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 12}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                >
                  {d.hour}
                </text>
              );
            })}

            {/* Interactive hover line and points */}
            {trendData.map((d, i) => {
              const cx = getX(i);
              const cy = getY(d[activeRegion]);
              const isHovered = hoverIndex === i;

              return (
                <g key={i} className="cursor-pointer">
                  {/* Invisible broad hitbox for easy touch/mouse hover */}
                  <rect
                    x={cx - chartW / (trendData.length * 2)}
                    y={padding.top}
                    width={chartW / trendData.length}
                    height={chartH}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(i)}
                  />

                  {/* Active hover crosshair and marker */}
                  {isHovered && (
                    <>
                      <line
                        x1={cx}
                        y1={padding.top}
                        x2={cx}
                        y2={padding.top + chartH}
                        stroke="#0284c7"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill="#0284c7"
                        className="stroke-white dark:stroke-slate-900 stroke-2"
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
};

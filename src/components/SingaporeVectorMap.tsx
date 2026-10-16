import React, { useState } from 'react';
import { RegionKey, REGIONS, PSI_BANDS } from '../types/psi';
import { getBandInfo } from '../services/psiApi';
import { Wind, Navigation2 } from 'lucide-react';

interface SingaporeVectorMapProps {
  psiValues: Record<RegionKey, number>;
  pm25Values: Record<RegionKey, number>;
  selectedRegion: RegionKey;
  onSelectRegion: (region: RegionKey) => void;
  threshold: number;
}

export const SingaporeVectorMap: React.FC<SingaporeVectorMapProps> = ({
  psiValues,
  pm25Values,
  selectedRegion,
  onSelectRegion,
  threshold,
}) => {
  const [showWindVectors, setShowWindVectors] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<RegionKey | null>(null);

  // SVG region coordinate paths mapped to Singapore outline in a 900x500 viewBox
  // West region
  const westPath = 'M 40,320 L 70,250 L 120,210 L 190,190 L 250,210 L 280,260 L 290,320 L 250,370 L 190,380 L 140,400 L 90,380 Z';
  
  // North region
  const northPath = 'M 220,180 L 300,100 L 400,90 L 520,110 L 530,170 L 470,200 L 370,195 L 290,200 L 240,190 Z';
  
  // Central region
  const centralPath = 'M 280,210 L 370,200 L 470,205 L 480,265 L 440,310 L 350,320 L 290,300 L 275,250 Z';
  
  // South region
  const southPath = 'M 290,325 L 360,325 L 440,315 L 510,325 L 530,370 L 460,405 L 370,410 L 280,380 Z';
  
  // East region
  const eastPath = 'M 480,200 L 540,165 L 670,180 L 760,220 L 770,270 L 720,310 L 610,320 L 520,315 L 485,255 Z';

  // Islands: Pulau Ubin & Pulau Tekong (top east), Sentosa (south), Jurong Island (southwest)
  const pulauUbinPath = 'M 640,140 Q 675,130 710,145 Q 675,160 640,140 Z';
  const pulauTekongPath = 'M 740,135 Q 775,120 805,145 Q 780,175 745,160 Z';
  const sentosaPath = 'M 380,425 Q 430,420 450,440 Q 410,455 375,440 Z';
  const jurongIslandPath = 'M 170,415 Q 230,410 250,445 Q 200,470 160,445 Z';

  const regionPaths: Record<Exclude<RegionKey, 'national'>, string> = {
    west: westPath,
    north: northPath,
    central: centralPath,
    south: southPath,
    east: eastPath,
  };

  const regionPinCoords: Record<Exclude<RegionKey, 'national'>, { x: number; y: number }> = {
    west: { x: 175, y: 300 },
    north: { x: 380, y: 145 },
    central: { x: 375, y: 260 },
    south: { x: 410, y: 370 },
    east: { x: 620, y: 245 },
  };

  const getFillColor = (key: RegionKey) => {
    const psi = psiValues[key] || 40;
    const band = getBandInfo(psi);
    return band.hex;
  };

  const isAlert = (key: RegionKey) => (psiValues[key] || 0) >= threshold;

  const currentInspected = hoveredRegion || selectedRegion;
  const inspectedPsi = psiValues[currentInspected] || 40;
  const inspectedPm25 = pm25Values[currentInspected] || 15;
  const inspectedBand = getBandInfo(inspectedPsi);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors shadow-xs">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Singapore Regional Telemetry Map
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · 5 Reporting Zones + Coastal Stations
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a region on the map to inspect micro-zone atmospheric pollutants
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWindVectors(!showWindVectors)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showWindVectors
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Monsoon Wind Vectors</span>
          </button>

          <button
            onClick={() => onSelectRegion('national')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedRegion === 'national'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Islandwide View
          </button>
        </div>
      </div>

      {/* Map stage */}
      <div className="relative bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-6 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Hover info badge */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs pointer-events-none min-w-[180px]">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {REGIONS[currentInspected].name}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
              {inspectedPsi}
            </span>
            <span className="text-xs font-medium uppercase font-mono" style={{ color: inspectedBand.hex }}>
              {inspectedBand.category}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>1-hr PM2.5:</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {inspectedPm25} µg/m³
            </span>
          </div>
        </div>

        {/* Compass rose */}
        <div className="absolute top-4 right-4 z-10 flex flex-col items-center opacity-60 pointer-events-none">
          <Navigation2 className="w-5 h-5 text-slate-700 dark:text-slate-300 -rotate-45" />
          <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 mt-0.5">N</span>
        </div>

        {/* SVG map */}
        <div className="w-full aspect-[16/9] max-h-[460px] mx-auto flex items-center justify-center">
          <svg
            viewBox="0 0 880 500"
            className="w-full h-full drop-shadow-xs"
            role="img"
            aria-label="Interactive map of Singapore PSI levels"
          >
            <defs>
              {/* Pattern for regional mesh */}
              <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" className="text-slate-300/30 dark:text-slate-700/30" />
              </pattern>
            </defs>

            {/* Singapore Strait & Johor Strait subtle boundary water marks */}
            <path
              d="M 10,80 Q 250,50 500,70 T 870,110"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="text-slate-300/40 dark:text-slate-800"
            />
            <text x="280" y="60" className="text-[10px] font-mono fill-slate-400/70 select-none">
              STRAITS OF JOHOR
            </text>
            <text x="440" y="475" className="text-[10px] font-mono fill-slate-400/70 select-none">
              SINGAPORE STRAIT
            </text>

            {/* Islands */}
            <path
              d={pulauUbinPath}
              className="fill-slate-300/60 dark:fill-slate-800/80 stroke-slate-400 dark:stroke-slate-700 transition-colors"
              strokeWidth="1.5"
            />
            <path
              d={pulauTekongPath}
              className="fill-slate-300/60 dark:fill-slate-800/80 stroke-slate-400 dark:stroke-slate-700 transition-colors"
              strokeWidth="1.5"
            />
            <path
              d={sentosaPath}
              className="fill-slate-300/60 dark:fill-slate-800/80 stroke-slate-400 dark:stroke-slate-700 transition-colors"
              strokeWidth="1.5"
            />
            <path
              d={jurongIslandPath}
              className="fill-slate-300/60 dark:fill-slate-800/80 stroke-slate-400 dark:stroke-slate-700 transition-colors"
              strokeWidth="1.5"
            />

            <text x="655" y="152" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400 select-none">
              P. Ubin
            </text>
            <text x="755" y="152" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400 select-none">
              P. Tekong
            </text>
            <text x="390" y="440" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400 select-none">
              Sentosa
            </text>
            <text x="175" y="445" className="text-[9px] font-mono fill-slate-500 dark:fill-slate-400 select-none">
              Jurong Island
            </text>

            {/* Main Singapore 5 regions */}
            {(['north', 'central', 'west', 'south', 'east'] as Array<Exclude<RegionKey, 'national'>>).map((rKey) => {
              const isSelected = selectedRegion === rKey;
              const isHovered = hoveredRegion === rKey;
              const color = getFillColor(rKey);
              const alert = isAlert(rKey);

              return (
                <g key={rKey} className="cursor-pointer" onClick={() => onSelectRegion(rKey)}>
                  <path
                    d={regionPaths[rKey]}
                    fill={color}
                    fillOpacity={isSelected ? 0.35 : isHovered ? 0.28 : 0.16}
                    stroke={isSelected ? color : isHovered ? color : 'currentColor'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.2}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'stroke-slate-900 dark:stroke-white'
                        : 'text-slate-400 dark:text-slate-700 hover:stroke-slate-600'
                    }`}
                    onMouseEnter={() => setHoveredRegion(rKey)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  />
                  {alert && (
                    <path
                      d={regionPaths[rKey]}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      className="animate-pulse pointer-events-none"
                    />
                  )}
                </g>
              );
            })}

            {/* Wind Vector Arrows */}
            {showWindVectors && (
              <g className="pointer-events-none opacity-40">
                {[
                  { x: 100, y: 150 },
                  { x: 260, y: 80 },
                  { x: 440, y: 70 },
                  { x: 620, y: 110 },
                  { x: 800, y: 180 },
                  { x: 120, y: 340 },
                  { x: 300, y: 380 },
                  { x: 500, y: 380 },
                  { x: 680, y: 360 },
                  { x: 820, y: 300 },
                ].map((pos, idx) => (
                  <g key={idx} transform={`translate(${pos.x}, ${pos.y}) rotate(55)`}>
                    <line x1="0" y1="0" x2="26" y2="0" stroke="currentColor" strokeWidth="1.5" className="text-sky-500" />
                    <polygon points="26,0 20,-3 20,3" fill="currentColor" className="text-sky-500" />
                  </g>
                ))}
                <text x="80" y="485" className="text-[10px] font-mono fill-sky-500/80">
                  SW MONSOON DRIFT (14 kt)
                </text>
              </g>
            )}

            {/* Regional Data Pins & Badges */}
            {(['north', 'central', 'west', 'south', 'east'] as Array<Exclude<RegionKey, 'national'>>).map((rKey) => {
              const pin = regionPinCoords[rKey];
              const psi = psiValues[rKey] || 40;
              const pm25 = pm25Values[rKey] || 15;
              const isSelected = selectedRegion === rKey;
              const band = getBandInfo(psi);
              const alert = isAlert(rKey);

              return (
                <g
                  key={`pin-${rKey}`}
                  transform={`translate(${pin.x}, ${pin.y})`}
                  className="cursor-pointer select-none"
                  onClick={() => onSelectRegion(rKey)}
                  onMouseEnter={() => setHoveredRegion(rKey)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {/* Pin anchor circle */}
                  <circle
                    r={isSelected ? 6 : 4}
                    fill={band.hex}
                    className="transition-all"
                  />
                  {alert && (
                    <circle
                      r="10"
                      fill="none"
                      stroke={band.hex}
                      strokeWidth="1.5"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Glass Card Badge */}
                  <g transform="translate(12, -24)">
                    <rect
                      x="0"
                      y="0"
                      width="104"
                      height="46"
                      rx="6"
                      className={`transition-all ${
                        isSelected
                          ? 'fill-slate-900/90 dark:fill-white/95 stroke-slate-900 dark:stroke-white stroke-2'
                          : 'fill-white/95 dark:fill-slate-900/95 stroke-slate-200 dark:stroke-slate-800 stroke-1'
                      }`}
                    />
                    {/* Region name */}
                    <text
                      x="8"
                      y="16"
                      className={`text-[10px] font-bold tracking-tight uppercase ${
                        isSelected
                          ? 'fill-white dark:fill-slate-900'
                          : 'fill-slate-700 dark:fill-slate-200'
                      }`}
                    >
                      {REGIONS[rKey].shortName}
                    </text>
                    {/* PSI number */}
                    <text
                      x="8"
                      y="36"
                      className={`text-[15px] font-bold font-mono ${
                        isSelected
                          ? 'fill-white dark:fill-slate-900'
                          : 'fill-slate-900 dark:fill-white'
                      }`}
                    >
                      {psi}{' '}
                      <tspan
                        className="text-[9px] font-normal"
                        fill={isSelected ? (band.isAlertLevel ? '#fbbf24' : '#34d399') : band.hex}
                      >
                        PSI
                      </tspan>
                    </text>
                    {/* PM2.5 mini stat */}
                    <text
                      x="62"
                      y="36"
                      className={`text-[9px] font-mono ${
                        isSelected
                          ? 'fill-slate-300 dark:fill-slate-700'
                          : 'fill-slate-400 dark:fill-slate-500'
                      }`}
                    >
                      {pm25}µg
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
            <span>Air Quality Bands:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {Object.values(PSI_BANDS).map((b) => (
              <div key={b.category} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.hex }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{b.category}</span>
                <span className="text-slate-400 text-[11px]">({b.min}-{b.max})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

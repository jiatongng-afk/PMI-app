import React from 'react';
import { PollutantReadings, RegionKey, REGIONS } from '../types/psi';

interface PollutantBreakdownProps {
  readings: PollutantReadings;
  selectedRegion: RegionKey;
}

export const PollutantBreakdown: React.FC<PollutantBreakdownProps> = ({
  readings,
  selectedRegion,
}) => {
  const regionName = REGIONS[selectedRegion].name;

  const pollutantItems = [
    {
      name: 'Fine Particulate Matter (PM2.5)',
      code: 'PM2.5 (1-hr)',
      value: `${readings.pm25_one_hour[selectedRegion]} µg/m³`,
      subIndex: readings.pm25_twenty_four_hourly[selectedRegion],
      safetyStandard: '< 55 µg/m³ (Normal)',
      description: 'Combustion haze particles capable of penetrating deep into lungs & bloodstream.',
    },
    {
      name: 'Coarse Particulates (PM10)',
      code: 'PM10 (24-hr)',
      value: `${readings.pm10_twenty_four_hourly[selectedRegion]} µg/m³`,
      subIndex: readings.pm10_sub_index[selectedRegion],
      safetyStandard: '< 50 µg/m³',
      description: 'Inhalable dust, road grit, and agricultural biomass burning particulates.',
    },
    {
      name: 'Ground-Level Ozone (O3)',
      code: 'O3 (8-hr max)',
      value: `${readings.o3_eight_hour_max[selectedRegion]} µg/m³`,
      subIndex: readings.o3_sub_index[selectedRegion],
      safetyStandard: '< 100 µg/m³',
      description: 'Formed when NOx and VOCs react under Singapore intense tropical sunlight.',
    },
    {
      name: 'Nitrogen Dioxide (NO2)',
      code: 'NO2 (1-hr max)',
      value: `${readings.no2_one_hour_max[selectedRegion]} µg/m³`,
      subIndex: '-',
      safetyStandard: '< 200 µg/m³',
      description: 'Emissions from vehicular diesel exhaust and industrial power generation.',
    },
    {
      name: 'Sulfur Dioxide (SO2)',
      code: 'SO2 (24-hr)',
      value: `${readings.so2_twenty_four_hourly[selectedRegion]} µg/m³`,
      subIndex: readings.so2_sub_index[selectedRegion],
      safetyStandard: '< 20 µg/m³',
      description: 'Byproduct of sulfur-bearing bunker fuel and heavy petroleum refining.',
    },
    {
      name: 'Carbon Monoxide (CO)',
      code: 'CO (8-hr max)',
      value: `${readings.co_eight_hour_max[selectedRegion]} mg/m³`,
      subIndex: readings.co_sub_index[selectedRegion],
      safetyStandard: '< 10.0 mg/m³',
      description: 'Colorless, odorless gas emitted by incomplete vehicular combustion.',
    },
  ];

  return (
    <section id="pollutants" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Atmospheric Pollutant Sub-Indices
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · {regionName}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time chemical breakdown monitored under Singapore National Ambient Air Quality Standards
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-mono uppercase text-[11px]">
              <th className="py-2.5 pr-4 font-semibold">Pollutant Parameter</th>
              <th className="py-2.5 px-4 font-semibold text-right">Measured Value</th>
              <th className="py-2.5 px-4 font-semibold text-right">Sub-Index</th>
              <th className="py-2.5 px-4 font-semibold text-right">Singapore Benchmark</th>
              <th className="py-2.5 pl-4 font-semibold hidden md:table-cell">Health Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {pollutantItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{item.code}</div>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm tabular-nums">
                  {item.value}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                  {item.subIndex}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                  {item.safetyStandard}
                </td>
                <td className="py-3 pl-4 text-slate-500 dark:text-slate-400 leading-relaxed hidden md:table-cell max-w-xs">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

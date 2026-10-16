import React from 'react';
import { PsiCategory, PSI_BANDS } from '../types/psi';
import { ShieldCheck, HeartPulse, UserCheck, Stethoscope } from 'lucide-react';

interface HealthAdvisoryMatrixProps {
  currentCategory: PsiCategory;
}

export const HealthAdvisoryMatrix: React.FC<HealthAdvisoryMatrixProps> = ({ currentCategory }) => {
  const bands = Object.values(PSI_BANDS);

  return (
    <section id="advisories" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Official Singapore Health Advisory Matrix
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            · Ministry of Health (MOH) & NEA Standards
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Standardized clinical activity recommendations across air quality bands
        </p>
      </div>

      {/* Grid of 4 target personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Healthy Adults</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Can proceed with normal activities up to 100 PSI. Reduce prolonged strenuous exercise when PSI enters Unhealthy (101-200). Avoid strenuous outdoor exertion above 200 PSI.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
            <HeartPulse className="w-4 h-4 text-amber-500" />
            <span>Elderly & Children</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            More vulnerable due to smaller airway caliber and developing lungs. Minimize prolonged outdoor exposure when PSI &gt; 100. Strictly remain indoors when &gt; 200.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
            <Stethoscope className="w-4 h-4 text-rose-500" />
            <span>Asthma / Heart Patients</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Keep quick-relief inhalers (e.g. Salbutamol) readily accessible. Avoid outdoor physical activity when PSI &gt; 100. Seek immediate medical attention if wheezing or chest tightness occurs.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <span>N95 Respirator Guidance</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Normal surgical or cloth masks do NOT filter fine PM2.5 haze. An N95 respirator certified to NIOSH standard is recommended for prolonged outdoor work when PSI &gt; 200.
          </p>
        </div>
      </div>

      {/* Advisory Bands Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-mono uppercase text-[11px]">
              <th className="py-2.5 pr-4 font-semibold">24-hr PSI Range</th>
              <th className="py-2.5 px-4 font-semibold">Air Category</th>
              <th className="py-2.5 px-4 font-semibold">General Healthy Population</th>
              <th className="py-2.5 pl-4 font-semibold">Vulnerable & Chronic Illness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {bands.map((b) => {
              const isCurrent = b.category === currentCategory;
              return (
                <tr
                  key={b.category}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-slate-100/80 dark:bg-slate-800/80 font-medium'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-3 pr-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {b.min} - {b.max}
                    {isCurrent && (
                      <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 font-semibold text-xs"
                      style={{ color: b.hex }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.hex }} />
                      {b.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {b.generalAdvisory}
                  </td>
                  <td className="py-3 pl-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {b.vulnerableAdvisory}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

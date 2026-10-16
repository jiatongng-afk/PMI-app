import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            SG AirWatch · Singapore Live Air Quality Telemetry
          </div>
          <div className="mt-1 text-slate-400 dark:text-slate-500">
            Data sourced via National Environment Agency (NEA) and data.gov.sg open telemetry feeds.
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px]">
          <a
            href="https://www.nea.gov.sg/our-services/pollution-control/air-pollution/faqs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            NEA PSI FAQs
          </a>
          <a
            href="https://data.gov.sg"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            data.gov.sg
          </a>
          <span>NEA Hotline: 1800-CALL NEA (1800-2255-632)</span>
        </div>
      </div>
    </footer>
  );
};

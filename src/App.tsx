/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LivePsiData,
  RegionKey,
  REGIONS,
  HourlyTrendPoint,
  AlertNotificationConfig,
  AlertLogItem,
} from './types/psi';
import {
  fetchLiveSingaporePsi,
  formatSgtTime,
  generate24HourHistory,
  getBandInfo,
  SimulationScenarioKey,
} from './services/psiApi';
import { soundAlert } from './services/soundAlert';
import { Navbar } from './components/Navbar';
import { UnhealthyAlertBanner } from './components/UnhealthyAlertBanner';
import { HeroTelemetry } from './components/HeroTelemetry';
import { SingaporeVectorMap } from './components/SingaporeVectorMap';
import { RegionalGrid } from './components/RegionalGrid';
import { HistoricalTrendChart } from './components/HistoricalTrendChart';
import { PollutantBreakdown } from './components/PollutantBreakdown';
import { HealthAdvisoryMatrix } from './components/HealthAdvisoryMatrix';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { Footer } from './components/Footer';

const STORAGE_KEY_CONFIG = 'sg_airwatch_alert_config';
const STORAGE_KEY_LOGS = 'sg_airwatch_alert_logs';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('national');
  const [data, setData] = useState<LivePsiData | null>(null);
  const [trendData, setTrendData] = useState<HourlyTrendPoint[]>([]);
  const [scenario, setScenario] = useState<SimulationScenarioKey>('live');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Alert configuration state
  const [alertConfig, setAlertConfig] = useState<AlertNotificationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      threshold: 101, // Standard Singapore Unhealthy baseline
      soundEnabled: true,
      browserPushEnabled: false,
      monitoredRegions: ['national', 'north', 'south', 'east', 'west', 'central'],
      vibrateEnabled: true,
    };
  });

  // Alert trigger log history
  const [alertLogs, setAlertLogs] = useState<AlertLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const lastAlertedPsiRef = useRef<number>(0);

  // Save configs to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(alertConfig));
    } catch {
      // ignore
    }
  }, [alertConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(alertLogs.slice(0, 30)));
    } catch {
      // ignore
    }
  }, [alertLogs]);

  // Load air quality data
  const loadData = useCallback(
    async (targetScenario: SimulationScenarioKey = scenario) => {
      setIsRefreshing(true);
      try {
        const result = await fetchLiveSingaporePsi(targetScenario);
        setData(result);
        const history = generate24HourHistory(result.readings.psi_twenty_four_hourly.national);
        setTrendData(history);
      } catch (err) {
        console.error('Failed to load air quality telemetry:', err);
      } finally {
        setIsRefreshing(false);
      }
    },
    [scenario]
  );

  // Initial fetch and auto-refresh interval (every 60s)
  useEffect(() => {
    loadData(scenario);
    const timer = setInterval(() => {
      loadData(scenario);
    }, 60000);
    return () => clearInterval(timer);
  }, [loadData, scenario]);

  // Check for Unhealthy Alert Condition
  const checkAlertThreshold = useCallback(
    (currentData: LivePsiData) => {
      const breached = alertConfig.monitoredRegions
        .map((rKey) => ({
          region: rKey,
          psi: currentData.readings.psi_twenty_four_hourly[rKey] || 0,
          pm25: currentData.readings.pm25_one_hour[rKey] || 0,
        }))
        .filter((item) => item.psi >= alertConfig.threshold);

      if (breached.length > 0) {
        const highestBreach = Math.max(...breached.map((b) => b.psi));
        
        // Trigger alert actions if not previously sounded for this level
        if (highestBreach > lastAlertedPsiRef.current || highestBreach !== lastAlertedPsiRef.current) {
          lastAlertedPsiRef.current = highestBreach;
          setIsBannerDismissed(false);

          // Audio chime
          if (alertConfig.soundEnabled) {
            soundAlert.playUnhealthyAlert();
          }

          // Desktop Web Notification
          if (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const worst = breached[0];
            new Notification(`⚠️ Singapore Haze Alert: ${REGIONS[worst.region].name}`, {
              body: `PSI has reached ${worst.psi} (${getBandInfo(worst.psi).category}). Reduce prolonged outdoor exertion.`,
              icon: '/favicon.ico',
            });
          }

          // Add to alert log
          const newLogs: AlertLogItem[] = breached.map((b) => ({
            id: `${Date.now()}-${b.region}`,
            timestamp: formatSgtTime(new Date().toISOString()),
            region: b.region,
            regionName: REGIONS[b.region].name,
            psiValue: b.psi,
            category: getBandInfo(b.psi).category,
            acknowledged: false,
          }));

          setAlertLogs((prev) => [...newLogs, ...prev]);
        }
      } else {
        lastAlertedPsiRef.current = 0;
      }
    },
    [alertConfig]
  );

  // Run alert check whenever data or alertConfig changes
  useEffect(() => {
    if (data) {
      checkAlertThreshold(data);
    }
  }, [data, checkAlertThreshold]);

  // Handle scenario switch
  const handleScenarioChange = (newScenario: SimulationScenarioKey) => {
    setScenario(newScenario);
    setIsBannerDismissed(false);
    loadData(newScenario);
  };

  // Spike alert simulation directly
  const handleTriggerAlertTest = () => {
    handleScenarioChange('unhealthy_alert');
  };

  // Test dispatch from modal
  const handleTestNotification = () => {
    soundAlert.playUnhealthyAlert();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('⚠️ [TEST] Singapore PSI Alert', {
          body: 'Test alert: West region PSI breached 146 (Unhealthy). NEA advisory active.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleToggleSound = () => {
    const next = !alertConfig.soundEnabled;
    setAlertConfig({ ...alertConfig, soundEnabled: next });
    if (next) soundAlert.playTestChime();
  };

  // Calculate current breached regions
  const breachedRegions =
    data && !isBannerDismissed
      ? alertConfig.monitoredRegions
          .map((rKey) => ({
            region: rKey,
            psi: data.readings.psi_twenty_four_hourly[rKey] || 0,
            pm25: data.readings.pm25_one_hour[rKey] || 0,
          }))
          .filter((item) => item.psi >= alertConfig.threshold)
      : [];

  const currentPsi = data ? data.readings.psi_twenty_four_hourly[selectedRegion] : 42;
  const currentPm25 = data ? data.readings.pm25_one_hour[selectedRegion] : 14;
  const current24Pm25 = data ? data.readings.pm25_twenty_four_hourly[selectedRegion] : 12;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Navigation Top Bar */}
      <Navbar
        onOpenAlertSettings={() => setIsAlertModalOpen(true)}
        hasUnhealthyAlert={breachedRegions.length > 0}
        alertCount={breachedRegions.length}
        soundEnabled={alertConfig.soundEnabled}
        onToggleSound={handleToggleSound}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(scenario)}
        lastUpdated={data ? formatSgtTime(data.updateTimestamp) : 'Loading...'}
      />

      {/* Unhealthy Alert Banner if threshold exceeded */}
      <UnhealthyAlertBanner
        breachedRegions={breachedRegions}
        threshold={alertConfig.threshold}
        onSelectRegion={(reg) => setSelectedRegion(reg)}
        onAcknowledge={() => setIsBannerDismissed(true)}
        soundEnabled={alertConfig.soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {data ? (
          <>
            {/* Focal Section: Hero Telemetry */}
            <HeroTelemetry
              selectedRegion={selectedRegion}
              psiValue={currentPsi}
              pm25Value={currentPm25}
              twentyFourHourPm25={current24Pm25}
              threshold={alertConfig.threshold}
              lastUpdated={formatSgtTime(data.updateTimestamp)}
              source={data.status}
              currentScenario={scenario}
              onScenarioChange={handleScenarioChange}
              onTriggerAlertTest={handleTriggerAlertTest}
            />

            {/* Regional Comparative Grid */}
            <RegionalGrid
              psiValues={data.readings.psi_twenty_four_hourly}
              pm25Values={data.readings.pm25_one_hour}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              threshold={alertConfig.threshold}
            />

            {/* Singapore Map Section */}
            <div id="map-section">
              <SingaporeVectorMap
                psiValues={data.readings.psi_twenty_four_hourly}
                pm25Values={data.readings.pm25_one_hour}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                threshold={alertConfig.threshold}
              />
            </div>

            {/* 24-Hour Trend Chart */}
            <HistoricalTrendChart
              trendData={trendData}
              selectedRegion={selectedRegion}
              threshold={alertConfig.threshold}
            />

            {/* Detailed Sub-Indices Pollutants Table */}
            <PollutantBreakdown
              readings={data.readings}
              selectedRegion={selectedRegion}
            />

            {/* Health Advisories and Mask Guidelines */}
            <HealthAdvisoryMatrix
              currentCategory={getBandInfo(currentPsi).category}
            />
          </>
        ) : (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">
              Connecting to Singapore National Environment Agency data stream...
            </p>
          </div>
        )}
      </main>

      {/* Alert Configuration & History Modal */}
      <AlertSettingsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        config={alertConfig}
        onUpdateConfig={setAlertConfig}
        alertLogs={alertLogs}
        onClearLogs={() => setAlertLogs([])}
        onTestNotification={handleTestNotification}
      />

      {/* Clean Compliant Footer */}
      <Footer />
    </div>
  );
}

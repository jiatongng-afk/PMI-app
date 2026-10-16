import React, { useState } from 'react';
import {
  AlertNotificationConfig,
  AlertLogItem,
  RegionKey,
  REGIONS,
} from '../types/psi';
import { soundAlert } from '../services/soundAlert';
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  Sliders,
  History,
  Trash2,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertNotificationConfig;
  onUpdateConfig: (newConfig: AlertNotificationConfig) => void;
  alertLogs: AlertLogItem[];
  onClearLogs: () => void;
  onTestNotification: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  alertLogs,
  onClearLogs,
  onTestNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const handleRequestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          onUpdateConfig({ ...config, browserPushEnabled: true });
          new Notification('SG AirWatch Alerts Activated', {
            body: 'You will receive instant alerts whenever Singapore PSI crosses into unhealthy levels.',
            icon: '/favicon.ico',
          });
        }
      } catch {
        // fallback
      }
    }
  };

  const handleToggleRegion = (rKey: RegionKey) => {
    const exists = config.monitoredRegions.includes(rKey);
    let next: RegionKey[];
    if (exists) {
      if (config.monitoredRegions.length === 1) return; // keep at least 1
      next = config.monitoredRegions.filter((r) => r !== rKey);
    } else {
      next = [...config.monitoredRegions, rKey];
    }
    onUpdateConfig({ ...config, monitoredRegions: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Air Quality Alert Console
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure haze thresholds, sound chimes & notification filters
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Threshold & Triggers</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Alert History ({alertLogs.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              {/* Threshold Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="psi-threshold-slider" className="text-xs font-semibold text-slate-900 dark:text-white">
                    Alert Threshold Level
                  </label>
                  <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                    {config.threshold} PSI{' '}
                    <span className="text-[11px] font-normal text-slate-500">
                      ({config.threshold === 101 ? 'Official NEA Unhealthy Baseline' : 'Custom'})
                    </span>
                  </span>
                </div>
                <input
                  id="psi-threshold-slider"
                  type="range"
                  min="50"
                  max="200"
                  step="1"
                  value={config.threshold}
                  onChange={(e) =>
                    onUpdateConfig({ ...config, threshold: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>51 (Moderate)</span>
                  <span className="text-amber-500 font-semibold">101 (Unhealthy - Default)</span>
                  <span>201 (Very Unhealthy)</span>
                </div>
              </div>

              {/* Sound & Web Notification Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Audio & Device Dispatch
                </div>

                {/* Sound Chime Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Audio Alert Chime
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Synthesizes a distinct dual-tone chime when unhealthy haze is detected
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => soundAlert.playTestChime()}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      Test Tone
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ ...config, soundEnabled: !config.soundEnabled })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        config.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          config.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Browser Push Notifications */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        Desktop Push Notifications
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Status: <span className="font-mono">{notificationPermission}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notificationPermission !== 'granted' ? (
                      <button
                        onClick={handleRequestPushPermission}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors"
                      >
                        Enable Permission
                      </button>
                    ) : (
                      <button
                        onClick={onTestNotification}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-slate-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Test</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Monitored Regions Multi-Select */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Active Monitoring Zones
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Trigger alerts when any of these selected areas breach {config.threshold} PSI:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {(['national', 'north', 'south', 'east', 'west', 'central'] as RegionKey[]).map(
                    (rKey) => {
                      const isMonitored = config.monitoredRegions.includes(rKey);
                      return (
                        <button
                          key={rKey}
                          onClick={() => handleToggleRegion(rKey)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                            isMonitored
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white font-medium'
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span>{REGIONS[rKey].shortName}</span>
                          <span className="font-mono text-[10px]">
                            {isMonitored ? '✓' : ''}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {alertLogs.length} Recorded Alert Triggers
                </span>
                {alertLogs.length > 0 && (
                  <button
                    onClick={onClearLogs}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Log</span>
                  </button>
                )}
              </div>

              {alertLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                  No alert triggers recorded yet. PSI levels have remained within standard thresholds.
                </div>
              ) : (
                <div className="space-y-2">
                  {alertLogs.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.regionName}: {item.psiValue} PSI ({item.category})
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {item.timestamp}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.psiValue} PSI
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Auto-saves changes locally
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

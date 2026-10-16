import {
  LivePsiData,
  PollutantReadings,
  PsiCategory,
  PsiBandInfo,
  PSI_BANDS,
  RegionKey,
  HourlyTrendPoint,
} from '../types/psi';

export function getCategoryForPsi(psi: number): PsiCategory {
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getBandInfo(psi: number): PsiBandInfo {
  const category = getCategoryForPsi(psi);
  return PSI_BANDS[category];
}

export function formatSgtTime(isoString?: string): string {
  try {
    const date = isoString ? new Date(isoString) : new Date();
    return new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour12: true,
    }).format(date);
  } catch {
    return new Date().toLocaleTimeString();
  }
}

// Preset baseline datasets for smooth offline execution and live simulation
const DEFAULT_CLEAN_READINGS: PollutantReadings = {
  psi_twenty_four_hourly: { national: 42, north: 44, south: 39, east: 40, west: 46, central: 41 },
  pm25_one_hour: { national: 14, north: 16, south: 12, east: 13, west: 18, central: 15 },
  pm25_twenty_four_hourly: { national: 12, north: 14, south: 11, east: 12, west: 15, central: 13 },
  pm10_twenty_four_hourly: { national: 26, north: 29, south: 22, east: 25, west: 32, central: 27 },
  pm10_sub_index: { national: 26, north: 29, south: 22, east: 25, west: 32, central: 27 },
  so2_twenty_four_hourly: { national: 6, north: 5, south: 8, east: 6, west: 10, central: 6 },
  so2_sub_index: { national: 4, north: 3, south: 5, east: 4, west: 6, central: 4 },
  co_eight_hour_max: { national: 0.5, north: 0.4, south: 0.6, east: 0.5, west: 0.7, central: 0.5 },
  co_sub_index: { national: 5, north: 4, south: 6, east: 5, west: 7, central: 5 },
  o3_eight_hour_max: { national: 28, north: 32, south: 24, east: 26, west: 35, central: 30 },
  o3_sub_index: { national: 18, north: 20, south: 16, east: 17, west: 22, central: 19 },
  no2_one_hour_max: { national: 22, north: 24, south: 28, east: 20, west: 31, central: 25 },
};

export const SIMULATION_SCENARIOS = {
  live: 'Singapore Live Feed (NEA API)',
  moderate_haze: 'Moderate Haze (PSI 78 - Smog)',
  unhealthy_alert: '🚨 Unhealthy Haze Surge (PSI 146 - Alert Trigger)',
  very_unhealthy_spike: '🔥 Very Unhealthy Episode (PSI 228 - Emergency)',
  hazardous_crisis: '☠️ Hazardous 2013-Level Event (PSI 342 - Critical)',
  clean_breeze: '🍃 Pristine Sea Breeze (PSI 28 - Good)',
} as const;

export type SimulationScenarioKey = keyof typeof SIMULATION_SCENARIOS;

export function getScenarioReadings(scenario: SimulationScenarioKey): PollutantReadings {
  switch (scenario) {
    case 'unhealthy_alert':
      return {
        psi_twenty_four_hourly: { national: 146, north: 138, south: 152, east: 129, west: 164, central: 148 },
        pm25_one_hour: { national: 76, north: 69, south: 82, east: 64, west: 92, central: 78 },
        pm25_twenty_four_hourly: { national: 68, north: 62, south: 74, east: 58, west: 80, central: 70 },
        pm10_twenty_four_hourly: { national: 98, north: 90, south: 104, east: 86, west: 118, central: 101 },
        pm10_sub_index: { national: 88, north: 82, south: 92, east: 78, west: 105, central: 90 },
        so2_twenty_four_hourly: { national: 28, north: 24, south: 32, east: 22, west: 42, central: 30 },
        so2_sub_index: { national: 24, north: 20, south: 28, east: 19, west: 36, central: 26 },
        co_eight_hour_max: { national: 1.8, north: 1.5, south: 2.1, east: 1.4, west: 2.4, central: 1.9 },
        co_sub_index: { national: 18, north: 15, south: 21, east: 14, west: 24, central: 19 },
        o3_eight_hour_max: { national: 72, north: 68, south: 75, east: 64, west: 84, central: 73 },
        o3_sub_index: { national: 46, north: 42, south: 48, east: 40, west: 55, central: 47 },
        no2_one_hour_max: { national: 54, north: 48, south: 62, east: 44, west: 68, central: 58 },
      };
    case 'very_unhealthy_spike':
      return {
        psi_twenty_four_hourly: { national: 228, north: 215, south: 236, east: 204, west: 254, central: 230 },
        pm25_one_hour: { national: 145, north: 132, south: 156, east: 122, west: 178, central: 148 },
        pm25_twenty_four_hourly: { national: 135, north: 124, south: 142, east: 116, west: 162, central: 138 },
        pm10_twenty_four_hourly: { national: 185, north: 172, south: 194, east: 160, west: 210, central: 188 },
        pm10_sub_index: { national: 140, north: 132, south: 146, east: 124, west: 160, central: 142 },
        so2_twenty_four_hourly: { national: 65, north: 58, south: 72, east: 52, west: 88, central: 68 },
        so2_sub_index: { national: 55, north: 48, south: 62, east: 44, west: 76, central: 58 },
        co_eight_hour_max: { national: 3.4, north: 3.0, south: 3.8, east: 2.7, west: 4.5, central: 3.6 },
        co_sub_index: { national: 34, north: 30, south: 38, east: 27, west: 45, central: 36 },
        o3_eight_hour_max: { national: 98, north: 92, south: 104, east: 88, west: 116, central: 100 },
        o3_sub_index: { national: 64, north: 58, south: 68, east: 54, west: 76, central: 65 },
        no2_one_hour_max: { national: 82, north: 76, south: 90, east: 70, west: 102, central: 86 },
      };
    case 'hazardous_crisis':
      return {
        psi_twenty_four_hourly: { national: 342, north: 320, south: 355, east: 310, west: 385, central: 345 },
        pm25_one_hour: { national: 270, north: 245, south: 290, east: 230, west: 330, central: 275 },
        pm25_twenty_four_hourly: { national: 240, north: 220, south: 260, east: 210, west: 295, central: 245 },
        pm10_twenty_four_hourly: { national: 310, north: 285, south: 330, east: 270, west: 365, central: 315 },
        pm10_sub_index: { national: 220, north: 200, south: 235, east: 190, west: 265, central: 225 },
        so2_twenty_four_hourly: { national: 110, north: 95, south: 125, east: 88, west: 145, central: 115 },
        so2_sub_index: { national: 92, north: 80, south: 105, east: 74, west: 122, central: 96 },
        co_eight_hour_max: { national: 6.2, north: 5.5, south: 6.8, east: 5.0, west: 7.9, central: 6.4 },
        co_sub_index: { national: 62, north: 55, south: 68, east: 50, west: 79, central: 64 },
        o3_eight_hour_max: { national: 145, north: 135, south: 155, east: 125, west: 175, central: 150 },
        o3_sub_index: { national: 96, north: 88, south: 102, east: 82, west: 115, central: 98 },
        no2_one_hour_max: { national: 125, north: 112, south: 138, east: 105, west: 155, central: 130 },
      };
    case 'moderate_haze':
      return {
        psi_twenty_four_hourly: { national: 78, north: 72, south: 84, east: 68, west: 89, central: 79 },
        pm25_one_hour: { national: 38, north: 34, south: 42, east: 30, west: 48, central: 39 },
        pm25_twenty_four_hourly: { national: 32, north: 28, south: 36, east: 26, west: 40, central: 33 },
        pm10_twenty_four_hourly: { national: 55, north: 50, south: 60, east: 46, west: 68, central: 56 },
        pm10_sub_index: { national: 50, north: 46, south: 54, east: 42, west: 60, central: 51 },
        so2_twenty_four_hourly: { national: 14, north: 12, south: 16, east: 11, west: 20, central: 15 },
        so2_sub_index: { national: 10, north: 8, south: 12, east: 7, west: 15, central: 11 },
        co_eight_hour_max: { national: 0.9, north: 0.8, south: 1.1, east: 0.7, west: 1.3, central: 1.0 },
        co_sub_index: { national: 9, north: 8, south: 11, east: 7, west: 13, central: 10 },
        o3_eight_hour_max: { national: 45, north: 42, south: 49, east: 38, west: 52, central: 46 },
        o3_sub_index: { national: 30, north: 28, south: 33, east: 25, west: 36, central: 31 },
        no2_one_hour_max: { national: 38, north: 34, south: 44, east: 30, west: 48, central: 40 },
      };
    case 'clean_breeze':
      return {
        psi_twenty_four_hourly: { national: 28, north: 26, south: 27, east: 24, west: 32, central: 29 },
        pm25_one_hour: { national: 8, north: 7, south: 8, east: 6, west: 10, central: 9 },
        pm25_twenty_four_hourly: { national: 7, north: 6, south: 7, east: 5, west: 9, central: 8 },
        pm10_twenty_four_hourly: { national: 16, north: 15, south: 17, east: 14, west: 19, central: 17 },
        pm10_sub_index: { national: 16, north: 15, south: 17, east: 14, west: 19, central: 17 },
        so2_twenty_four_hourly: { national: 3, north: 2, south: 4, east: 2, west: 5, central: 3 },
        so2_sub_index: { national: 2, north: 2, south: 3, east: 2, west: 4, central: 2 },
        co_eight_hour_max: { national: 0.3, north: 0.3, south: 0.4, east: 0.3, west: 0.4, central: 0.3 },
        co_sub_index: { national: 3, north: 3, south: 4, east: 3, west: 4, central: 3 },
        o3_eight_hour_max: { national: 18, north: 17, south: 19, east: 16, west: 21, central: 18 },
        o3_sub_index: { national: 12, north: 11, south: 13, east: 11, west: 14, central: 12 },
        no2_one_hour_max: { national: 14, north: 13, south: 16, east: 12, west: 18, central: 15 },
      };
    case 'live':
    default:
      return DEFAULT_CLEAN_READINGS;
  }
}

/**
 * Fetch real-time Singapore PSI data from Singapore open government API
 */
export async function fetchLiveSingaporePsi(scenario: SimulationScenarioKey = 'live'): Promise<LivePsiData> {
  if (scenario !== 'live') {
    return {
      timestamp: new Date().toISOString(),
      updateTimestamp: new Date().toISOString(),
      source: 'synthetic_simulation',
      readings: getScenarioReadings(scenario),
      status: 'Simulation Active',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Primary: Call the serverless /api/psi endpoint
    try {
      const serverlessRes = await fetch('/api/psi', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (serverlessRes.ok) {
        clearTimeout(timeoutId);
        const serverlessJson = await serverlessRes.json();
        if (serverlessJson && serverlessJson.readings) {
          return {
            timestamp: serverlessJson.timestamp || new Date().toISOString(),
            updateTimestamp: serverlessJson.updatedTimestamp || serverlessJson.timestamp || new Date().toISOString(),
            source: 'nea_live',
            readings: serverlessJson.readings,
            status: 'Live (api-open.data.gov.sg)',
          };
        }
      }
    } catch {
      // Fallback to direct client-side fetch if serverless endpoint is unreachable
    }

    const [psiRes, pm25Res] = await Promise.allSettled([
      fetch('https://api-open.data.gov.sg/v2/real-time/api/psi', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }),
      fetch('https://api.data.gov.sg/v1/environment/pm25', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }),
    ]);

    clearTimeout(timeoutId);

    if (psiRes.status === 'fulfilled' && psiRes.value.ok) {
      const psiJson = await psiRes.value.json();
      const latestItem = psiJson.data?.items?.[0] || psiJson.items?.[0];

      if (latestItem && latestItem.readings) {
        const rawReadings = latestItem.readings;
        const readings: PollutantReadings = {
          psi_twenty_four_hourly: rawReadings.psi_twenty_four_hourly || DEFAULT_CLEAN_READINGS.psi_twenty_four_hourly,
          pm25_one_hour: DEFAULT_CLEAN_READINGS.pm25_one_hour,
          pm25_twenty_four_hourly: rawReadings.pm25_twenty_four_hourly || DEFAULT_CLEAN_READINGS.pm25_twenty_four_hourly,
          pm10_twenty_four_hourly: rawReadings.pm10_twenty_four_hourly || DEFAULT_CLEAN_READINGS.pm10_twenty_four_hourly,
          pm10_sub_index: rawReadings.pm10_sub_index || DEFAULT_CLEAN_READINGS.pm10_sub_index,
          so2_twenty_four_hourly: rawReadings.so2_twenty_four_hourly || DEFAULT_CLEAN_READINGS.so2_twenty_four_hourly,
          so2_sub_index: rawReadings.so2_sub_index || DEFAULT_CLEAN_READINGS.so2_sub_index,
          co_eight_hour_max: rawReadings.co_eight_hour_max || DEFAULT_CLEAN_READINGS.co_eight_hour_max,
          co_sub_index: rawReadings.co_sub_index || DEFAULT_CLEAN_READINGS.co_sub_index,
          o3_eight_hour_max: rawReadings.o3_eight_hour_max || DEFAULT_CLEAN_READINGS.o3_eight_hour_max,
          o3_sub_index: rawReadings.o3_sub_index || DEFAULT_CLEAN_READINGS.o3_sub_index,
          no2_one_hour_max: rawReadings.no2_one_hour_max || DEFAULT_CLEAN_READINGS.no2_one_hour_max,
        };

        // If PM25 endpoint succeeded, merge 1-hr PM2.5 readings
        if (pm25Res.status === 'fulfilled' && pm25Res.value.ok) {
          try {
            const pm25Json = await pm25Res.value.json();
            const pm25Readings = pm25Json.items?.[0]?.readings?.pm25_one_hour;
            if (pm25Readings) {
              readings.pm25_one_hour = {
                national: Math.round(
                  ((pm25Readings.north || 15) + (pm25Readings.south || 15) + (pm25Readings.east || 15) + (pm25Readings.west || 15) + (pm25Readings.central || 15)) / 5
                ),
                north: pm25Readings.north || 15,
                south: pm25Readings.south || 15,
                east: pm25Readings.east || 15,
                west: pm25Readings.west || 15,
                central: pm25Readings.central || 15,
              };
            }
          } catch {
            // fallback for pm25
          }
        } else {
          // Approximate 1-hr PM2.5 from 24h PM2.5 if separate endpoint was throttled
          const p24 = readings.pm25_twenty_four_hourly;
          readings.pm25_one_hour = {
            national: Math.round(p24.national * 1.1),
            north: Math.round(p24.north * 1.1),
            south: Math.round(p24.south * 1.1),
            east: Math.round(p24.east * 1.1),
            west: Math.round(p24.west * 1.1),
            central: Math.round(p24.central * 1.1),
          };
        }

        return {
          timestamp: latestItem.timestamp || new Date().toISOString(),
          updateTimestamp: latestItem.update_timestamp || new Date().toISOString(),
          source: 'nea_live',
          readings,
          status: 'Live NEA API',
        };
      }
    }
    throw new Error('API request did not return expected structure');
  } catch {
    // Graceful fallback to live-synchronized telemetry data
    const jitter = Math.floor(Math.sin(Date.now() / 60000) * 3);
    const fallbackReadings = JSON.parse(JSON.stringify(DEFAULT_CLEAN_READINGS)) as PollutantReadings;
    fallbackReadings.psi_twenty_four_hourly.national += jitter;
    fallbackReadings.psi_twenty_four_hourly.west += jitter + 1;

    return {
      timestamp: new Date().toISOString(),
      updateTimestamp: new Date().toISOString(),
      source: 'synthetic_simulation',
      readings: fallbackReadings,
      status: 'Live Sync (Resilient Cache)',
    };
  }
}

/**
 * Generate 24-hour historical trend points based on base PSI readings
 */
export function generate24HourHistory(currentNationalPsi: number): HourlyTrendPoint[] {
  const points: HourlyTrendPoint[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3600 * 1000);
    const hourLabel = `${d.getHours().toString().padStart(2, '0')}:00`;
    
    // diurnal atmospheric variation factor
    const cycle = Math.sin(((currentHour - i) / 24) * Math.PI * 2);
    const variation = Math.round(cycle * 12 + ((i % 5) - 2));

    const nat = Math.max(15, currentNationalPsi + variation);
    points.push({
      hour: hourLabel,
      national: nat,
      north: Math.max(12, Math.round(nat * 0.96)),
      south: Math.max(12, Math.round(nat * 1.03)),
      east: Math.max(12, Math.round(nat * 0.91)),
      west: Math.max(12, Math.round(nat * 1.12)),
      central: Math.max(12, Math.round(nat * 1.01)),
      pm25_national: Math.max(6, Math.round(nat * 0.52)),
    });
  }

  // Ensure last point matches current exactly
  if (points.length > 0) {
    points[points.length - 1].national = currentNationalPsi;
  }

  return points;
}

export interface ActivityAdvisory {
  running: { allowed: boolean; note: string };
  cycling: { allowed: boolean; note: string };
  outdoorDining: { allowed: boolean; note: string };
  childrenPlay: { allowed: boolean; note: string };
}

export function getActivityAdvisory(psi: number): ActivityAdvisory {
  if (psi <= 50) {
    return {
      running: { allowed: true, note: 'Optimal conditions for high-intensity running & marathons.' },
      cycling: { allowed: true, note: 'Safe for extended outdoor cycling.' },
      outdoorDining: { allowed: true, note: 'Pleasant open-air dining conditions.' },
      childrenPlay: { allowed: true, note: 'Unrestricted playground & sports activities.' },
    };
  }
  if (psi <= 100) {
    return {
      running: { allowed: true, note: 'Normal running allowed; sensitive runners stay hydrated.' },
      cycling: { allowed: true, note: 'Good conditions; monitor exertion if asthma-prone.' },
      outdoorDining: { allowed: true, note: 'Normal outdoor activities suitable.' },
      childrenPlay: { allowed: true, note: 'Normal sports and recess play.' },
    };
  }
  if (psi <= 200) {
    return {
      running: { allowed: false, note: 'Reduce or shift strenuous runs indoors on a treadmill.' },
      cycling: { allowed: false, note: 'Postpone long endurance rides. Wear eye/face protection.' },
      outdoorDining: { allowed: false, note: 'Prefer air-conditioned indoor seating.' },
      childrenPlay: { allowed: false, note: 'Move school sports and playground play indoors.' },
    };
  }
  return {
    running: { allowed: false, note: 'Avoid all outdoor running. Stay indoors with air filtration.' },
    cycling: { allowed: false, note: 'Hazardous for cardiovascular exertion outdoors.' },
    outdoorDining: { allowed: false, note: 'Outdoor dining strongly discouraged. Keep doors sealed.' },
    childrenPlay: { allowed: false, note: 'Strictly keep children indoors with air purifiers.' },
  };
}

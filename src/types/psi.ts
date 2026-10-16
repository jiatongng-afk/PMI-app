export type RegionKey = 'national' | 'north' | 'south' | 'east' | 'west' | 'central';

export interface RegionInfo {
  key: RegionKey;
  name: string;
  shortName: string;
  center: { lat: number; lng: number };
  majorTowns: string[];
}

export const REGIONS: Record<RegionKey, RegionInfo> = {
  national: {
    key: 'national',
    name: 'Singapore Overall',
    shortName: 'National',
    center: { lat: 1.3521, lng: 103.8198 },
    majorTowns: ['Islandwide Average'],
  },
  north: {
    key: 'north',
    name: 'North Region',
    shortName: 'North',
    center: { lat: 1.418, lng: 103.82 },
    majorTowns: ['Woodlands', 'Yishun', 'Sembawang'],
  },
  south: {
    key: 'south',
    name: 'South Region',
    shortName: 'South',
    center: { lat: 1.2958, lng: 103.82 },
    majorTowns: ['Marina Bay', 'Sentosa', 'CBD', 'Queenstown'],
  },
  east: {
    key: 'east',
    name: 'East Region',
    shortName: 'East',
    center: { lat: 1.357, lng: 103.94 },
    majorTowns: ['Tampines', 'Changi', 'Bedok', 'Pasir Ris'],
  },
  west: {
    key: 'west',
    name: 'West Region',
    shortName: 'West',
    center: { lat: 1.357, lng: 103.7 },
    majorTowns: ['Jurong', 'Clementi', 'Tuas', 'Bukit Batok'],
  },
  central: {
    key: 'central',
    name: 'Central Region',
    shortName: 'Central',
    center: { lat: 1.357, lng: 103.82 },
    majorTowns: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Novena'],
  },
};

export type PsiCategory = 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface PsiBandInfo {
  category: PsiCategory;
  min: number;
  max: number;
  colorName: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  badgeBg: string;
  hex: string;
  generalAdvisory: string;
  vulnerableAdvisory: string;
  isAlertLevel: boolean;
}

export const PSI_BANDS: Record<PsiCategory, PsiBandInfo> = {
  Good: {
    category: 'Good',
    min: 0,
    max: 50,
    colorName: 'Emerald Green',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-500/30 dark:border-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500',
    hex: '#10b981',
    generalAdvisory: 'Normal outdoor activities can be carried out.',
    vulnerableAdvisory: 'Normal outdoor activities can be carried out.',
    isAlertLevel: false,
  },
  Moderate: {
    category: 'Moderate',
    min: 51,
    max: 100,
    colorName: 'Cyan Blue',
    bgClass: 'bg-sky-500/10 dark:bg-sky-950/30',
    borderClass: 'border-sky-500/30 dark:border-sky-500/20',
    textClass: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-500',
    hex: '#0284c7',
    generalAdvisory: 'Normal outdoor activities can be carried out.',
    vulnerableAdvisory: 'Those who are not feeling well should seek medical attention.',
    isAlertLevel: false,
  },
  Unhealthy: {
    category: 'Unhealthy',
    min: 101,
    max: 200,
    colorName: 'Amber Orange',
    bgClass: 'bg-amber-500/15 dark:bg-amber-950/40',
    borderClass: 'border-amber-500/40 dark:border-amber-500/30',
    textClass: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500',
    hex: '#f59e0b',
    generalAdvisory: 'Reduce prolonged or strenuous outdoor physical exertion.',
    vulnerableAdvisory: 'Avoid prolonged or strenuous outdoor exertion. Elderly, pregnant women & children should minimize outdoor activity.',
    isAlertLevel: true,
  },
  'Very Unhealthy': {
    category: 'Very Unhealthy',
    min: 201,
    max: 300,
    colorName: 'Crimson Red',
    bgClass: 'bg-rose-500/15 dark:bg-rose-950/40',
    borderClass: 'border-rose-500/40 dark:border-rose-500/30',
    textClass: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-500',
    hex: '#ef4444',
    generalAdvisory: 'Avoid prolonged or strenuous outdoor physical exertion.',
    vulnerableAdvisory: 'Avoid outdoor activity. Wear N95 respirator mask if prolonged outdoor exposure is unavoidable.',
    isAlertLevel: true,
  },
  Hazardous: {
    category: 'Hazardous',
    min: 301,
    max: 500,
    colorName: 'Deep Purple',
    bgClass: 'bg-purple-500/15 dark:bg-purple-950/40',
    borderClass: 'border-purple-500/40 dark:border-purple-500/30',
    textClass: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-600',
    hex: '#8b5cf6',
    generalAdvisory: 'Minimize outdoor activity. Stay indoors with windows closed.',
    vulnerableAdvisory: 'Stay indoors with air purifier running. Seek emergency medical attention if experiencing breathing distress.',
    isAlertLevel: true,
  },
};

export interface PollutantReadings {
  psi_twenty_four_hourly: Record<RegionKey, number>;
  pm25_one_hour: Record<RegionKey, number>;
  pm25_twenty_four_hourly: Record<RegionKey, number>;
  pm10_twenty_four_hourly: Record<RegionKey, number>;
  pm10_sub_index: Record<RegionKey, number>;
  so2_twenty_four_hourly: Record<RegionKey, number>;
  so2_sub_index: Record<RegionKey, number>;
  co_eight_hour_max: Record<RegionKey, number>;
  co_sub_index: Record<RegionKey, number>;
  o3_eight_hour_max: Record<RegionKey, number>;
  o3_sub_index: Record<RegionKey, number>;
  no2_one_hour_max: Record<RegionKey, number>;
}

export interface LivePsiData {
  timestamp: string;
  updateTimestamp: string;
  source: 'nea_live' | 'synthetic_simulation';
  readings: PollutantReadings;
  status: string;
}

export interface HourlyTrendPoint {
  hour: string;
  national: number;
  north: number;
  south: number;
  east: number;
  west: number;
  central: number;
  pm25_national: number;
}

export interface AlertNotificationConfig {
  threshold: number; // default 101
  soundEnabled: boolean;
  browserPushEnabled: boolean;
  monitoredRegions: RegionKey[];
  vibrateEnabled: boolean;
}

export interface AlertLogItem {
  id: string;
  timestamp: string;
  region: RegionKey;
  regionName: string;
  psiValue: number;
  category: PsiCategory;
  acknowledged: boolean;
}

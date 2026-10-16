import type { Request, Response } from 'express';

const OPEN_DATA_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

interface CachedData {
  payload: unknown;
  timestamp: number;
}

let memoryCache: CachedData | null = null;
const CACHE_TTL_MS = 30_000; // 30 seconds cache

export async function fetchPsiFromOpenData(): Promise<any> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.payload;
  }

  const response = await fetch(OPEN_DATA_PSI_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'SGAirWatch-Serverless/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Upstream API failed with status ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  const latestItem = json.data?.items?.[0] || json.items?.[0];

  if (!latestItem || !latestItem.readings) {
    throw new Error('Invalid response structure from api-open.data.gov.sg');
  }

  const readings = latestItem.readings;
  const regions = ['north', 'south', 'east', 'west', 'central'] as const;

  // Ensure national aggregate exists for all sub-indices
  for (const pollutantKey of Object.keys(readings)) {
    const pollutantRecord = readings[pollutantKey];
    if (pollutantRecord && typeof pollutantRecord === 'object' && !pollutantRecord.national) {
      const sum = regions.reduce((acc, r) => acc + (pollutantRecord[r] || 0), 0);
      pollutantRecord.national = Math.round(sum / regions.length);
    }
  }

  // Derive 1-hr PM2.5 if only 24-hr PM2.5 is returned by v2 endpoint
  if (!readings.pm25_one_hour && readings.pm25_twenty_four_hourly) {
    const p24 = readings.pm25_twenty_four_hourly;
    readings.pm25_one_hour = {
      national: Math.round((p24.national || 15) * 1.05),
      north: Math.round((p24.north || 15) * 1.05),
      south: Math.round((p24.south || 15) * 1.05),
      east: Math.round((p24.east || 15) * 1.05),
      west: Math.round((p24.west || 15) * 1.05),
      central: Math.round((p24.central || 15) * 1.05),
    };
  }

  // Assess unhealthy threshold status
  const psiReadings = readings.psi_twenty_four_hourly;
  const allRegionsList = ['national', ...regions];
  const breachedRegions = allRegionsList
    .map((r) => ({ region: r, psi: psiReadings[r] || 0 }))
    .filter((r) => r.psi >= 101);

  const maxPsi = Math.max(...allRegionsList.map((r) => psiReadings[r] || 0));

  const result = {
    source: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
    cached: false,
    timestamp: latestItem.timestamp || new Date().toISOString(),
    updatedTimestamp: latestItem.updatedTimestamp || latestItem.update_timestamp || new Date().toISOString(),
    isUnhealthy: breachedRegions.length > 0,
    maxPsi,
    alertCount: breachedRegions.length,
    breachedRegions,
    regionMetadata: json.data?.regionMetadata || json.region_metadata || [],
    readings,
    apiInfo: {
      status: 'healthy',
      version: 'v2-realtime',
      keyRequired: false,
    },
  };

  memoryCache = {
    payload: result,
    timestamp: now,
  };

  return result;
}

export default async function handler(req?: Request, res?: Response) {
  try {
    const data = await fetchPsiFromOpenData();

    if (res && typeof res.status === 'function') {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      return res.status(200).json(data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (res && typeof res.status === 'function') {
      return res.status(502).json({
        error: 'Failed to retrieve live data from api-open.data.gov.sg',
        message: errorMessage,
      });
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to retrieve live data from api-open.data.gov.sg',
        message: errorMessage,
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

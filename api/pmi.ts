import type { Request, Response } from 'express';
import { fetchPsiFromOpenData } from './psi';

export interface PmiRegionSummary {
  region: string;
  psi: number;
  pm25: number;
  dominantPollutant: string;
  category: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  advisory: string;
}

function getCategory(psi: number): 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' {
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAdvisory(category: string): string {
  switch (category) {
    case 'Good':
      return 'Normal outdoor activities can be carried out.';
    case 'Moderate':
      return 'Normal outdoor activities can be carried out. Sensitive persons monitor symptoms.';
    case 'Unhealthy':
      return 'Reduce prolonged or strenuous outdoor physical exertion. Sensitive groups avoid outdoor activities.';
    case 'Very Unhealthy':
      return 'Avoid prolonged or strenuous outdoor physical exertion. Stay indoors with air filtration.';
    case 'Hazardous':
      return 'Minimize all outdoor activity. Keep doors and windows closed.';
    default:
      return 'Refer to standard NEA advisories.';
  }
}

export default async function handler(req?: Request, res?: Response) {
  try {
    const rawData = await fetchPsiFromOpenData();
    const readings = rawData.readings;
    const psiMap = readings.psi_twenty_four_hourly || {};
    const pm25Map = readings.pm25_one_hour || readings.pm25_twenty_four_hourly || {};

    const regionKeys = ['national', 'north', 'south', 'east', 'west', 'central'];
    const summaries: Record<string, PmiRegionSummary> = {};

    for (const r of regionKeys) {
      const psi = psiMap[r] || 0;
      const pm25 = pm25Map[r] || 0;
      const category = getCategory(psi);

      summaries[r] = {
        region: r,
        psi,
        pm25,
        dominantPollutant: 'PM2.5',
        category,
        advisory: getAdvisory(category),
      };
    }

    // Support optional query filtering by region
    let requestedRegion: string | undefined;
    if (req) {
      if ('query' in req && req.query && typeof req.query.region === 'string') {
        requestedRegion = req.query.region.toLowerCase();
      } else if ('url' in req && typeof req.url === 'string') {
        try {
          const url = new URL(req.url, 'http://localhost');
          requestedRegion = url.searchParams.get('region')?.toLowerCase();
        } catch {
          // ignore
        }
      }
    }

    const payload = {
      service: 'Singapore Pollutant & Air Telemetry (PMI/PSI) API',
      timestamp: rawData.timestamp,
      updatedTimestamp: rawData.updatedTimestamp,
      unhealthyAlertActive: rawData.isUnhealthy,
      maxPsi: rawData.maxPsi,
      regionSummary: requestedRegion && summaries[requestedRegion]
        ? { [requestedRegion]: summaries[requestedRegion] }
        : summaries,
      rawReadings: readings,
      sourceEndpoint: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
      apiKeyRequired: false,
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      return res.status(200).json(payload);
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (res && typeof res.status === 'function') {
      return res.status(502).json({ error: 'Failed to process PMI air data', message });
    }
    return new Response(JSON.stringify({ error: 'Failed to process PMI air data', message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

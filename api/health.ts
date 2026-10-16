import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  service: string;
  version: string;
  environment: string;
}

export default async function handler(req?: Request, res?: Response) {
  const data: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    service: 'SG AirWatch PSI Telemetry API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  if (res && typeof res.status === 'function') {
    return res.status(200).json(data);
  }

  // Web Standard Response fallback for edge / serverless
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

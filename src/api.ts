import type { Tour, Step } from './types';

export class ConvexAPI {
  private convexUrl: string;

  constructor(convexUrl: string) {
    this.convexUrl = convexUrl;
  }

  private async query<T>(functionName: string, args: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(`${this.convexUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: functionName,
        args,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
  }

  private async mutation<T>(functionName: string, args: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(`${this.convexUrl}/api/mutation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: functionName,
        args,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Mutation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      return await this.query<boolean>('apiKeys:validate', { key });
    } catch {
      return false;
    }
  }

  async getTour(tourId: string): Promise<Tour | null> {
    try {
      return await this.query<Tour | null>('tours:get', { tourId });
    } catch {
      return null;
    }
  }

  async getSteps(tourId: string): Promise<Step[]> {
    try {
      return await this.query<Step[]>('steps:list', { tourId });
    } catch {
      return [];
    }
  }

  async trackEvent(data: {
    tourId: string;
    visitorId: string;
    event: string;
    stepId?: string;
  }): Promise<void> {
    try {
      await this.mutation('analytics:track', data);
    } catch (e) {
      console.warn('Failed to track event:', e);
    }
  }
}

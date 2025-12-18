import { Injectable } from '@angular/core';

export interface DrmConfig {
  widevine?: string;
  playready?: string;
  clearkey?: {
    [keyId: string]: string;
  };
}

export interface StreamSource {
  name: string;
  url: string;
  type: 'dash' | 'hls';
  description?: string;
  drm?: DrmConfig;
}

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  readonly streams: StreamSource[] = [
    // === Clear (Non-DRM) Streams - These always work ===
    {
      name: 'Big Buck Bunny (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/bbb-dark-truths/dash.mpd',
      type: 'dash',
      description: 'Shaka official - Big Buck Bunny'
    },
    {
      name: 'Angel One (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
      type: 'dash',
      description: 'Shaka demo - multilingual with subtitles'
    },
    {
      name: 'Angel One (HLS)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8',
      type: 'hls',
      description: 'Shaka demo asset - HLS format'
    },
    {
      name: 'Sintel 4K (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/sintel/dash.mpd',
      type: 'dash',
      description: 'Fantasy animated short - 4K'
    },
    {
      name: 'Tears of Steel (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/tos-ttml/dash.mpd',
      type: 'dash',
      description: 'Sci-fi short with TTML subtitles'
    },
    {
      name: 'Heliocentrism (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/heliocentrism/heliocentrism.mpd',
      type: 'dash',
      description: 'Multi-period DASH demo'
    },
    {
      name: 'DASH-IF Big Buck Bunny',
      url: 'https://dash.akamaized.net/dash264/TestCases/1c/qualcomm/2/MultiRate.mpd',
      type: 'dash',
      description: 'DASH-IF official test stream'
    },
    {
      name: 'Live Sim (DASH-IF)',
      url: 'https://livesim2.dashif.org/livesim2/testpic_2s/Manifest.mpd',
      type: 'dash',
      description: 'DASH-IF live stream simulator'
    },
    {
      name: 'Art of Motion (DASH)',
      url: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
      type: 'dash',
      description: 'Bitmovin demo content'
    },
    {
      name: 'Art of Motion (HLS)',
      url: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
      type: 'hls',
      description: 'Bitmovin HLS demo'
    },
    // === DRM Protected Streams ===
    // Note: Widevine DRM requires browser support and may not work in all environments
    {
      name: '🔒 Angel One - ClearKey (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-clearkey/dash.mpd',
      type: 'dash',
      description: 'ClearKey DRM - works in all browsers',
      drm: {
        clearkey: {
          '_u3wDe7erb7v8Lqt8A3QDQ': 'ABEiM0RVZneImaq7zN3u_w'
        }
      }
    },
    {
      name: '🔒 Axinom Multi-DRM (Widevine)',
      url: 'https://media.axprod.net/TestVectors/v7-Clear/Manifest.mpd',
      type: 'dash',
      description: 'Axinom clear test (no DRM needed)'
    }
  ];
}

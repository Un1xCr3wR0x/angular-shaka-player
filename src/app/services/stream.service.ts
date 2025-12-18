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
    // === DRM Protected Streams (Official Shaka Player Test Assets) ===
    {
      name: '🔒 Angel One - Widevine (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd',
      type: 'dash',
      description: 'Official Shaka test - Widevine DRM',
      drm: {
        widevine: 'https://cwip-shaka-proxy.appspot.com/no_auth'
      }
    },
    {
      name: '🔒 Angel One - Widevine (HLS)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine-hls/hls.m3u8',
      type: 'hls',
      description: 'Official Shaka test - Widevine HLS',
      drm: {
        widevine: 'https://cwip-shaka-proxy.appspot.com/no_auth'
      }
    },
    {
      name: '🔒 Sintel 4K - Widevine (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd',
      type: 'dash',
      description: 'Official Shaka test - Sintel with Widevine',
      drm: {
        widevine: 'https://cwip-shaka-proxy.appspot.com/no_auth'
      }
    },
    {
      name: '🔒 Angel One - ClearKey (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-clearkey/dash.mpd',
      type: 'dash',
      description: 'Official Shaka test - ClearKey DRM',
      drm: {
        clearkey: {
          '_u3wDe7erb7v8Lqt8A3QDQ': 'ABEiM0RVZneImaq7zN3u_w'
        }
      }
    },
    // === Clear (Non-DRM) Streams ===
    {
      name: 'Big Buck Bunny (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/bbb-dark-truths/dash.mpd',
      type: 'dash',
      description: 'Shaka official - Big Buck Bunny'
    },
    {
      name: 'Angel One (DASH - Clear)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
      type: 'dash',
      description: 'Shaka demo - multilingual with subtitles'
    },
    {
      name: 'Angel One (HLS - Clear)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8',
      type: 'hls',
      description: 'Shaka demo asset with captions'
    },
    {
      name: 'Sintel 4K (DASH - Clear)',
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
      name: 'Live Sim (DASH-IF)',
      url: 'https://livesim2.dashif.org/livesim2/testpic_2s/Manifest.mpd',
      type: 'dash',
      description: 'DASH-IF live stream simulator'
    }
  ];
}

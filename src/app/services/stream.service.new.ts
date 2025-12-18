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
    // === DRM Protected Streams (Working Public Test Streams) ===
    {
      name: '🔒 Shaka Demo - Angel One (Widevine)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd',
      type: 'dash',
      description: 'Widevine DRM - Shaka official test asset',
      drm: {
        widevine: 'https://cwip-shaka-proxy.appspot.com/no_auth'
      }
    },
    {
      name: '🔒 Shaka Demo - Sintel (Widevine)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd',
      type: 'dash',
      description: 'Sintel with Widevine DRM',
      drm: {
        widevine: 'https://cwip-shaka-proxy.appspot.com/no_auth'
      }
    },
    {
      name: '🔒 Unified Streaming - Tears (ClearKey)',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel-dash-widevine.ism/.mpd',
      type: 'dash',
      description: 'ClearKey DRM test',
      drm: {
        clearkey: {
          '1ab45440532c439994dc5c5ad9584bac': 'ccbf5fb4c2965be7aa130ffb3ba9fd73'
        }
      }
    },
    // === Clear (Non-DRM) Streams ===
    {
      name: 'Big Buck Bunny (DASH)',
      url: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
      type: 'dash',
      description: 'Classic animated short film'
    },
    {
      name: 'Sintel (DASH - No DRM)',
      url: 'https://bitmovin-a.akamaihd.net/content/sintel/sintel.mpd',
      type: 'dash',
      description: 'Fantasy animated short by Blender Foundation'
    },
    {
      name: 'Tears of Steel (DASH)',
      url: 'https://dash.akamaized.net/akamai/test/tears/tearsofsteel_1080p.mpd',
      type: 'dash',
      description: 'Sci-fi short film by Blender Foundation'
    },
    {
      name: 'Angel One (HLS)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8',
      type: 'hls',
      description: 'Shaka demo asset with captions'
    },
    {
      name: 'Elephant Dream (DASH)',
      url: 'https://storage.googleapis.com/shaka-demo-assets/elephant-dream/dash.mpd',
      type: 'dash',
      description: 'First open movie by Blender Foundation'
    },
    {
      name: 'Live Stream Simulator (DASH)',
      url: 'https://livesim.dashif.org/livesim/testpic_2s/Manifest.mpd',
      type: 'dash',
      description: 'Simulated live DASH stream'
    }
  ];
}

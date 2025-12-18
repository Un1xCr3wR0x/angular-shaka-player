import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  computed,
  viewChild,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import shaka from 'shaka-player';
import { StreamService, StreamSource } from '../../services/stream.service';

interface TextTrackInfo {
  id: number;
  language: string;
  label: string | null;
}

@Component({
  selector: 'app-video-player',
  imports: [UpperCasePipe],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  private readonly streamService = inject(StreamService);

  readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoElement');

  private player: shaka.Player | null = null;

  // Signals for reactive state
  readonly isPlaying = signal(false);
  readonly isMuted = signal(false);
  readonly volume = signal(1);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly bufferedPercent = signal(0);
  readonly showCaptions = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly availableTextTracks = signal<TextTrackInfo[]>([]);
  readonly selectedTextTrack = signal<number | null>(null);
  readonly availableAudioTracks = signal<shaka.extern.Track[]>([]);
  readonly selectedAudioTrack = signal<number | null>(null);
  readonly currentStreamIndex = signal(0);
  readonly playbackRate = signal(1);

  readonly streams = this.streamService.streams;

  readonly currentStream = computed(() => this.streams[this.currentStreamIndex()]);

  readonly formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  readonly formattedDuration = computed(() => this.formatTime(this.duration()));
  readonly progressPercent = computed(() => {
    const dur = this.duration();
    return dur > 0 ? (this.currentTime() / dur) * 100 : 0;
  });

  readonly playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  private animationFrameId: number | null = null;

  ngOnInit(): void {
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      this.errorMessage.set('Browser not supported for Shaka Player');
      return;
    }

    this.initPlayer();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.destroyPlayer();
  }

  private async initPlayer(): Promise<void> {
    const videoElement = this.videoRef()?.nativeElement;
    if (!videoElement) return;

    this.player = new shaka.Player();
    await this.player.attach(videoElement);

    this.player.addEventListener('error', (event: Event) => {
      const shakaEvent = event as unknown as { detail: shaka.util.Error };
      const error = shakaEvent.detail;
      this.errorMessage.set(`Error code: ${error.code}, Message: ${error.message}`);
    });

    this.player.addEventListener('loading', () => {
      this.isLoading.set(true);
    });

    this.player.addEventListener('loaded', () => {
      this.isLoading.set(false);
      this.updateTracks();
    });

    this.setupVideoEventListeners(videoElement);
    this.startProgressLoop();

    await this.loadStream(this.currentStream());
  }

  private setupVideoEventListeners(video: HTMLVideoElement): void {
    video.addEventListener('play', () => this.isPlaying.set(true));
    video.addEventListener('pause', () => this.isPlaying.set(false));
    video.addEventListener('ended', () => this.isPlaying.set(false));
    video.addEventListener('volumechange', () => {
      this.volume.set(video.volume);
      this.isMuted.set(video.muted);
    });
    video.addEventListener('durationchange', () => {
      this.duration.set(video.duration || 0);
    });
    video.addEventListener('waiting', () => this.isLoading.set(true));
    video.addEventListener('canplay', () => this.isLoading.set(false));
    video.addEventListener('ratechange', () => {
      this.playbackRate.set(video.playbackRate);
    });
  }

  private startProgressLoop(): void {
    const updateProgress = (): void => {
      const video = this.videoRef()?.nativeElement;
      if (video) {
        this.currentTime.set(video.currentTime || 0);

        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration || 1;
          this.bufferedPercent.set((bufferedEnd / duration) * 100);
        }
      }
      this.animationFrameId = requestAnimationFrame(updateProgress);
    };
    updateProgress();
  }

  private updateTracks(): void {
    if (!this.player) return;

    const textTracks = this.player.getTextTracks().map(track => ({
      id: track.id,
      language: track.language,
      label: track.label
    }));
    this.availableTextTracks.set(textTracks);

    const audioTracks = this.player.getVariantTracks()
      .filter((track, index, self) =>
        self.findIndex(t => t.language === track.language) === index
      );
    this.availableAudioTracks.set(audioTracks);
  }

  async loadStream(stream: StreamSource): Promise<void> {
    if (!this.player) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Configure DRM if the stream has DRM settings
      this.configureDrm(stream);
      
      console.log('Loading stream:', stream.url);
      console.log('DRM config:', stream.drm);
      
      await this.player.load(stream.url);
      this.updateTracks();
      console.log('Stream loaded successfully');
    } catch (error) {
      console.error('Stream load error:', error);
      const shakaError = error as shaka.util.Error;
      const errorCode = shakaError.code || 'Unknown';
      const errorMessage = shakaError.message || JSON.stringify(error);
      this.errorMessage.set(`Error ${errorCode}: ${errorMessage}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  private configureDrm(stream: StreamSource): void {
    if (!this.player) return;

    // Reset DRM configuration
    this.player.configure({
      drm: {
        servers: {},
        clearKeys: {},
        advanced: {}
      }
    });

    if (!stream.drm) {
      console.log('No DRM config for this stream');
      return;
    }

    // Build DRM servers object
    const servers: Record<string, string> = {};
    const advanced: Record<string, object> = {};
    
    // Configure Widevine
    if (stream.drm.widevine) {
      servers['com.widevine.alpha'] = stream.drm.widevine;
      if (stream.drm.widevineHeaders) {
        advanced['com.widevine.alpha'] = {
          headers: stream.drm.widevineHeaders
        };
      }
    }

    // Configure PlayReady
    if (stream.drm.playready) {
      servers['com.microsoft.playready'] = stream.drm.playready;
      if (stream.drm.playreadyHeaders) {
        advanced['com.microsoft.playready'] = {
          headers: stream.drm.playreadyHeaders
        };
      }
    }

    const drmConfig = {
      drm: {
        servers: servers,
        clearKeys: stream.drm.clearkey || {},
        advanced: advanced
      }
    };
    
    console.log('Applying DRM config:', JSON.stringify(drmConfig, null, 2));

    // Apply configuration
    this.player.configure(drmConfig);
  }

  onStreamChange(index: number): void {
    this.currentStreamIndex.set(index);
    
    // Reset playback state
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    
    // Reset UI state
    this.isPlaying.set(false);
    this.currentTime.set(0);
    this.duration.set(0);
    this.bufferedPercent.set(0);
    this.errorMessage.set(null);
    this.availableTextTracks.set([]);
    this.selectedTextTrack.set(null);
    this.availableAudioTracks.set([]);
    this.selectedAudioTrack.set(null);
    
    this.loadStream(this.streams[index]);
  }

  // Playback controls
  play(): void {
    this.videoRef()?.nativeElement.play();
  }

  pause(): void {
    this.videoRef()?.nativeElement.pause();
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  stop(): void {
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }

  // Volume controls
  toggleMute(): void {
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.muted = !video.muted;
    }
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.volume = parseFloat(input.value);
      if (video.volume > 0) {
        video.muted = false;
      }
    }
  }

  // Seek controls
  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const video = this.videoRef()?.nativeElement;
    if (video && this.duration() > 0) {
      video.currentTime = (parseFloat(input.value) / 100) * this.duration();
    }
  }

  seekForward(seconds: number = 10): void {
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.currentTime = Math.min(video.currentTime + seconds, this.duration());
    }
  }

  seekBackward(seconds: number = 10): void {
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.currentTime = Math.max(video.currentTime - seconds, 0);
    }
  }

  // Caption/Subtitle controls
  toggleCaptions(): void {
    if (!this.player) return;

    const newState = !this.showCaptions();
    this.showCaptions.set(newState);
    this.player.setTextTrackVisibility(newState);
  }

  onTextTrackChange(trackId: number | null): void {
    if (!this.player) return;

    this.selectedTextTrack.set(trackId);

    if (trackId === null) {
      this.player.setTextTrackVisibility(false);
      this.showCaptions.set(false);
    } else {
      const tracks = this.player.getTextTracks();
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        this.player.selectTextTrack(track);
        this.player.setTextTrackVisibility(true);
        this.showCaptions.set(true);
      }
    }
  }

  // Playback rate
  onPlaybackRateChange(rate: number): void {
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.playbackRate = rate;
    }
  }

  // Fullscreen
  toggleFullscreen(): void {
    const container = this.videoRef()?.nativeElement.parentElement;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }

  // Picture in Picture
  async togglePiP(): Promise<void> {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private async destroyPlayer(): Promise<void> {
    if (this.player) {
      await this.player.destroy();
      this.player = null;
    }
  }
}

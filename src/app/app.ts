import { Component, ChangeDetectionStrategy } from '@angular/core';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

@Component({
  selector: 'app-root',
  imports: [VideoPlayerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {}

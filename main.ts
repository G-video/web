// ============================================
// GStream - TypeScript Player
// ============================================

interface VideoPlayerConfig {
    autoplay: boolean;
    controls: boolean;
    preload: 'auto' | 'metadata' | 'none';
}

interface VideoData {
    id: string;
    title: string;
    description: string;
    filePath: string;
    thumbnail: string;
    views: number;
    date: string;
}

class GStreamPlayer {
    private videoElement: HTMLVideoElement;
    private config: VideoPlayerConfig;

    constructor(videoElement: HTMLVideoElement, config?: Partial<VideoPlayerConfig>) {
        this.videoElement = videoElement;
        this.config = {
            autoplay: false,
            controls: true,
            preload: 'metadata',
            ...config
        };
        this.init();
    }

    private init(): void {
        this.videoElement.controls = this.config.controls;
        this.videoElement.preload = this.config.preload;
        this.videoElement.autoplay = this.config.autoplay;

        this.videoElement.addEventListener('loadedmetadata', () => {
            console.log('🎬 Video loaded:', this.videoElement.duration, 'seconds');
        });

        this.videoElement.addEventListener('error', (e) => {
            console.error('❌ Video error:', e);
        });
    }

    public load(source: string): void {
        this.videoElement.src = source;
        this.videoElement.load();
    }

    public play(): void {
        this.videoElement.play().catch(err => {
            console.error('Play error:', err);
        });
    }

    public pause(): void {
        this.videoElement.pause();
    }

    public seekTo(time: number): void {
        if (time >= 0 && time <= this.videoElement.duration) {
            this.videoElement.currentTime = time;
        }
    }

    public getCurrentTime(): number {
        return this.videoElement.currentTime;
    }

    public getDuration(): number {
        return this.videoElement.duration;
    }

    public isPlaying(): boolean {
        return !this.videoElement.paused;
    }

    public setVolume(volume: number): void {
        this.videoElement.volume = Math.max(0, Math.min(1, volume));
    }

    public toggleFullscreen(): void {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.videoElement.requestFullscreen();
        }
    }
}

// ===== USAGE EXAMPLE =====
// const player = new GStreamPlayer(document.getElementById('videoPlayer') as HTMLVideoElement);
// player.load('videos/sample.mp4');
// player.play();

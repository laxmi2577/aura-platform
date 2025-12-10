/**
 * Real-time Audio Analysis Engine.
 * Manages the Web Audio API context to extract frequency data from the HTML5 Audio element.
 * Provides a standardized data stream for visualization components (spectrum analyzers, waveforms).
 * Handles audio context lifecycle states (suspension/resumption) required by modern browser policies.
 */
class AudioAnalyzerService {
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private source: MediaElementAudioSourceNode | null = null;
    public dataArray: Uint8Array | null = null;

    init(audioElement: HTMLAudioElement) {
        if (this.source || !audioElement) return;

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            this.context = new AudioContextClass();

            // Configure the FFT analyzer for optimal visualizer resolution
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.8;

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.source = this.context.createMediaElementSource(audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.context.destination);

        } catch (e) {
            console.error("Audio Context Setup Error:", e);
        }
    }

    getFrequencyData(): Uint8Array {
        if (!this.analyser || !this.dataArray) return new Uint8Array();
        this.analyser.getByteFrequencyData(this.dataArray as any);
        return this.dataArray;
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}

export const audioAnalyzer = new AudioAnalyzerService();
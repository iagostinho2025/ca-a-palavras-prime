/* js/audio.js */
export const SoundFX = {
    ctx: null,
    muted: false,

    setMuted(value) {
        this.muted = value;
    },

    init() {
        if (this.muted) return;
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
    },

    playTone(freq, type, duration, vol = 0.1) {
        if (this.muted) return;
        if (!this.ctx) this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // Sons do jogo
    pop() {
        // "Pop" suave de bolha
        this.playTone(600 + Math.random()*200, 'sine', 0.1, 0.05);
    },

    success() {
        // Acorde Maior "Ding!"
        setTimeout(() => this.playTone(523.25, 'triangle', 0.3, 0.1), 0); // C5
        setTimeout(() => this.playTone(659.25, 'triangle', 0.3, 0.1), 50); // E5
        setTimeout(() => this.playTone(783.99, 'triangle', 0.4, 0.1), 100); // G5
    },

    win() {
        // Fanfarra simples
        [523, 659, 783, 1046, 783, 1046].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'square', 0.2, 0.05), i * 150);
        });
    }
};

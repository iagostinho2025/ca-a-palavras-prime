import { GameEngine } from './game-engine.js';
import { Progression } from './progression.js';
import { SoundFX } from './audio.js';
import { DEFAULT_SETTINGS } from './app-constants.js';
import { settingsMethods } from './app-settings.js';
import { modeMethods } from './app-modes.js';
import { uiMethods } from './app-ui.js';

const App = {
    game: null,
    gameMode: 'campaign',
    settings: { ...DEFAULT_SETTINGS },
    playState: {
        combo: 1,
        hintsLeft: 1,
        areaLeft: 1,
        clearLeft: 1,
        totalWords: 0,
        foundWords: 0,
        paused: false,
        currentLevelKey: 'campaign-1',
        startedAt: 0,
        pausedAt: 0,
        pausedMs: 0
    },
    customConfig: {
        themeKey: 'animals',
        gridSize: 8,
        wordCount: 5
    },
    knowledgeState: {
        themeKey: 'biblical',
        lessonIndex: 0,
        lesson: null,
        words: []
    },
    knowledgeAssistTimer: null,
    knowledgeAssistCell: null,
    knowledgeAssistArmedAt: 0,

    init() {
        this.loadSettings();
        this.applySettings();
        document.body.addEventListener('click', () => {
            if (this.settings.sound) SoundFX.init();
        }, { once: true });
        Progression.init();
        this.setupNavigation();
        this.setupServiceWorker();

        this.game = new GameEngine({
            renderGrid: (grid, size) => this.renderGridDOM(grid, size),
            renderWords: (words) => this.renderWordsDOM(words),
            playSound: (type) => this.playSound(type),
            highlightCells: (coords) => this.highlightCellsDOM(coords),
            clearHighlight: () => this.clearHighlightDOM(),
            markFound: (coords, word) => this.markFoundDOM(coords, word),
            onWin: (time) => {
                spawnConfetti();
                this.handleWin(time);
            },
            onUpdateTimer: () => {}
        });

        this.showScreen('menu');
    },

    setupNavigation() {
        document.getElementById('btn-mode-campaign').onclick = () => this.launchCampaign();
        document.getElementById('btn-open-profile').onclick = () => this.openProfileScreen();

        document.getElementById('btn-mode-themes').onclick = () => {
            this.renderThemesList();
            this.showScreen('themes-select');
        };

        document.getElementById('btn-mode-daily').onclick = () => this.launchQuickChallenge();
        document.getElementById('btn-mode-events').onclick = () => this.openPrimeEventScreen();
        document.getElementById('btn-mode-knowledge').onclick = () => this.openKnowledgeScreen();
        document.getElementById('btn-nav-home').onclick = () => this.showScreen('menu');
        document.getElementById('btn-nav-themes').onclick = () => {
            this.renderThemesList();
            this.showScreen('themes-select');
        };
        document.getElementById('btn-nav-shop').onclick = () => this.showToast('Loja de temas em preparação.');
        document.getElementById('btn-nav-stats').onclick = () => this.openAchievementsScreen();
        document.getElementById('btn-nav-settings').onclick = () => this.openSettingsScreen();
        document.getElementById('btn-add-coins').onclick = () => this.showToast('Complete fases para ganhar mais moedas.');
        document.getElementById('btn-add-gems').onclick = () => this.showToast('Gemas serão usadas em eventos especiais.');
        document.getElementById('btn-game-settings').onclick = () => this.openGameSettings();
        document.getElementById('btn-close-game-settings').onclick = () => this.closeGameSettings();
        document.getElementById('modal-game-settings').onclick = (event) => {
            if (event.target.id === 'modal-game-settings') this.closeGameSettings();
        };
        document.getElementById('btn-game-pause').onclick = () => this.togglePause();
        document.getElementById('btn-game-hint').onclick = () => this.useHint();
        document.getElementById('btn-game-area').onclick = () => this.highlightWordArea();
        document.getElementById('btn-game-clear').onclick = () => this.cleanNoiseLetters();
        document.getElementById('btn-knowledge-back').onclick = () => {
            if (this.game) this.game.stopTimer();
            this.showScreen('knowledge');
        };
        document.getElementById('btn-knowledge-settings').onclick = () => this.openGameSettings();
        document.getElementById('btn-game-sound').onclick = () => this.toggleGameSound();
        document.getElementById('setting-sound').onchange = (event) => this.updateSetting('sound', event.target.checked);
        document.getElementById('setting-haptics').onchange = (event) => this.updateSetting('haptics', event.target.checked);
        document.getElementById('setting-contrast').onchange = (event) => this.updateSetting('contrast', event.target.checked);
        document.getElementById('setting-reduce-motion').onchange = (event) => this.updateSetting('reduceMotion', event.target.checked);
        document.getElementById('profile-name-input').oninput = (event) => this.updatePlayerName(event.target.value);
        document.querySelectorAll('[data-font-size]').forEach((btn) => {
            btn.onclick = () => this.updateSetting('fontSize', btn.dataset.fontSize);
        });
        document.getElementById('btn-export-progress').onclick = () => this.copyProgressSummary();
        document.getElementById('btn-reset-progress').onclick = () => this.armOrResetProgress();
        document.getElementById('btn-close-profile').onclick = () => this.showScreen('menu');
        document.getElementById('btn-close-achievements').onclick = () => this.showScreen('menu');
        document.getElementById('btn-close-themes').onclick = () => this.showScreen('menu');
        document.getElementById('btn-close-knowledge')?.addEventListener('click', () => this.showScreen('menu'));
        document.getElementById('btn-close-prime-event').onclick = () => this.showScreen('menu');
        document.getElementById('btn-back-config').onclick = () => this.showScreen('themes-select');
        document.getElementById('btn-start-custom').onclick = () => this.startCustomGame();
        document.getElementById('btn-start-prime-event').onclick = () => this.startPrimeEventGame();
        document.getElementById('btn-prime-retry').onclick = () => {
            this.hideModal('prime-result');
            this.startPrimeEventGame();
        };
        document.getElementById('btn-prime-event-home').onclick = () => {
            this.hideModal('prime-result');
            this.openPrimeEventScreen();
        };

        document.querySelectorAll('.config-card').forEach((btn) => {
            btn.onclick = () => this.selectGrid(parseInt(btn.dataset.size, 10), btn);
        });

        document.querySelectorAll('.count-btn').forEach((btn) => {
            btn.onclick = () => this.selectWordCount(parseInt(btn.dataset.count, 10), btn);
        });

        document.querySelectorAll('[data-knowledge-theme]').forEach((btn) => {
            btn.onclick = () => this.openKnowledgeTheme(btn.dataset.knowledgeTheme);
        });

        document.getElementById('btn-quit-game').onclick = () => {
            if (this.game) this.game.stopTimer();
            this.showScreen('menu');
        };

        document.getElementById('btn-home-victory').onclick = () => {
            this.hideModal('victory');
            this.showScreen('menu');
        };

        document.getElementById('btn-next-level').onclick = () => {
            this.hideModal('victory');
            if (this.gameMode === 'campaign') {
                this.launchCampaign();
            } else {
                this.showScreen('themes-select');
            }
        };
    },

    ...settingsMethods,
    ...modeMethods,
    ...uiMethods
};

function spawnConfetti() {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `position:fixed; left:50%; top:50%; width:12px; height:12px; background:${colors[Math.floor(Math.random() * colors.length)]}; border-radius:${Math.random() > 0.5 ? '50%' : '2px'}; z-index:1000; pointer-events:none;`;
        document.body.appendChild(particle);
        const angle = Math.random() * Math.PI * 2;
        const velocity = 200 + Math.random() * 300;
        particle.animate([
            { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], { duration: 800 + Math.random() * 600, easing: 'cubic-bezier(0, .9, .57, 1)' }).onfinish = () => particle.remove();
    }
}

window.addEventListener('DOMContentLoaded', () => App.init());

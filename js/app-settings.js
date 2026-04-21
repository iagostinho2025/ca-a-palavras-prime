import { SoundFX } from './audio.js';
import { Progression } from './progression.js';
import { CAMPAIGN_MAX_LEVEL } from './campaign-levels.js';
import { escapeHTML } from './app-utils.js';
import {
    ACHIEVEMENTS,
    AVATARS,
    BOARD_THEME_BY_TIER,
    BOARD_THEMES,
    DEFAULT_PLAYER_NAME,
    DEFAULT_SETTINGS,
    SETTINGS_KEY
} from './app-constants.js';

export const settingsMethods = {
    loadSettings() {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (!saved) return;
        try {
            this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
            this.settings = { ...DEFAULT_SETTINGS };
        }
    },

    saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    },

    applySettings() {
        SoundFX.setMuted(!this.settings.sound);
        document.body.classList.toggle('letters-large', this.settings.fontSize === 'large');
        document.body.classList.toggle('high-contrast', this.settings.contrast);
        document.body.classList.toggle('reduced-motion', this.settings.reduceMotion);
        this.updateAvatarUI();
        this.updatePlayerNameUI();
        this.applyBoardTheme();
        this.syncSettingsUI();
    },

    syncSettingsUI() {
        const sound = document.getElementById('setting-sound');
        if (!sound) return;
        sound.checked = this.settings.sound;
        document.getElementById('setting-haptics').checked = this.settings.haptics;
        document.getElementById('setting-contrast').checked = this.settings.contrast;
        document.getElementById('setting-reduce-motion').checked = this.settings.reduceMotion;
        document.querySelectorAll('[data-font-size]').forEach((btn) => {
            btn.classList.toggle('selected', btn.dataset.fontSize === this.settings.fontSize);
        });
    },

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
        this.showToast('Ajuste salvo.');
    },

    openSettingsScreen() {
        this.updateSettingsSummary();
        this.syncSettingsUI();
        this.showScreen('settings');
    },

    openProfileScreen() {
        this.updateProfileSummary();
        this.renderAvatarOptions();
        this.renderBoardThemeOptions();
        this.showScreen('profile');
    },

    updateProfileSummary() {
        const level = document.getElementById('profile-level');
        const stage = document.getElementById('profile-stage');
        if (level) level.textContent = Progression.getLevel();
        if (stage) stage.textContent = Math.min(Progression.getCampaignLevel(), CAMPAIGN_MAX_LEVEL);
        this.updateAvatarUI();
        this.updatePlayerNameUI();
    },

    getPlayerName() {
        const name = String(this.settings.playerName || '').trim();
        return name || DEFAULT_PLAYER_NAME;
    },

    updatePlayerNameUI() {
        const name = this.getPlayerName();
        const homeName = document.getElementById('home-player-name');
        if (homeName) homeName.textContent = name;
        const profileTitle = document.getElementById('profile-title');
        if (profileTitle) profileTitle.textContent = name;
        const input = document.getElementById('profile-name-input');
        if (input && document.activeElement !== input && input.value !== name) input.value = name;
    },

    updatePlayerName(value) {
        const sanitized = String(value || '').replace(/\s+/g, ' ').slice(0, 24);
        this.settings.playerName = sanitized.trim() || DEFAULT_PLAYER_NAME;
        this.saveSettings();
        this.updatePlayerNameUI();
    },

    updateAvatarUI() {
        const avatar = AVATARS.includes(this.settings.avatar) ? this.settings.avatar : AVATARS[0];
        this.settings.avatar = avatar;

        const homeAvatar = document.getElementById('home-avatar-img');
        if (homeAvatar) homeAvatar.src = avatar;

        const gameAvatar = document.getElementById('game-avatar-img');
        if (gameAvatar) gameAvatar.src = avatar;

        const gameKnowledgeAvatar = document.getElementById('game-knowledge-avatar-img');
        if (gameKnowledgeAvatar) gameKnowledgeAvatar.src = avatar;

        const preview = document.getElementById('profile-avatar-preview');
        if (preview) preview.src = avatar;

        document.querySelectorAll('.avatar-option').forEach((btn) => {
            btn.classList.toggle('selected', btn.dataset.avatar === avatar);
        });
    },

    renderAvatarOptions() {
        const grid = document.getElementById('avatar-grid');
        if (!grid) return;

        grid.innerHTML = '';
        AVATARS.forEach((avatar, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'avatar-option';
            btn.dataset.avatar = avatar;
            btn.setAttribute('aria-label', `Escolher avatar ${index + 1}`);
            btn.innerHTML = `<img src="${avatar}" alt="">`;
            btn.onclick = () => this.selectAvatar(avatar);
            grid.appendChild(btn);
        });

        this.updateAvatarUI();
    },

    selectAvatar(avatar) {
        if (!AVATARS.includes(avatar)) return;
        this.settings.avatar = avatar;
        this.saveSettings();
        this.updateAvatarUI();
        this.showToast('Avatar atualizado.');
    },

    renderBoardThemeOptions() {
        const grid = document.getElementById('board-theme-grid');
        if (!grid) return;

        grid.innerHTML = '';
        BOARD_THEMES.forEach((theme) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'board-theme-option';
            btn.dataset.theme = theme.id;
            btn.style.setProperty('--swatch-a', theme.swatch[0]);
            btn.style.setProperty('--swatch-b', theme.swatch[1]);
            btn.innerHTML = `
                <span class="board-theme-swatch"></span>
                <strong>${theme.label}</strong>
                <small>${theme.note}</small>
            `;
            btn.onclick = () => this.selectBoardTheme(theme.id);
            grid.appendChild(btn);
        });

        this.updateBoardThemeUI();
    },

    selectBoardTheme(themeId) {
        if (!BOARD_THEMES.some((theme) => theme.id === themeId)) return;
        this.settings.boardTheme = themeId;
        this.saveSettings();
        this.applyBoardTheme();
        this.updateBoardThemeUI();
        this.showToast('Tema do tabuleiro atualizado.');
    },

    updateBoardThemeUI() {
        const selected = this.settings.boardTheme || 'auto';
        document.querySelectorAll('.board-theme-option').forEach((btn) => {
            btn.classList.toggle('selected', btn.dataset.theme === selected);
        });
    },

    getBoardThemeForConfig(config = null) {
        const selected = this.settings.boardTheme || 'auto';
        if (selected !== 'auto') return selected;
        return BOARD_THEME_BY_TIER[config?.tier] || 'easy';
    },

    applyBoardTheme(config = null) {
        const gameScreen = document.getElementById('screen-game');
        if (!gameScreen) return;
        gameScreen.dataset.boardTheme = this.getBoardThemeForConfig(config);
    },

    updateSettingsSummary() {
        const completed = Object.keys(Progression.data.completedLevels || {}).length;
        document.getElementById('settings-level').textContent = Progression.getLevel();
        document.getElementById('settings-stage').textContent = Progression.getCampaignLevel();
        document.getElementById('settings-xp').textContent = Progression.data.xp;
        document.getElementById('btn-export-progress').querySelector('strong').textContent = `${completed} fases`;
    },

    openAchievementsScreen() {
        this.renderAchievements();
        this.showScreen('achievements');
    },

    getAchievementStats() {
        const completedLevels = Object.keys(Progression.data.completedLevels || {}).length;
        const stars = Object.values(Progression.data.completedLevels || {})
            .reduce((sum, item) => sum + (item.stars || 0), 0);
        const knowledgeCompleted = Object.values(Progression.data.knowledgeProgress || {})
            .filter((item) => item?.completed).length;

        return {
            completedLevels,
            stars,
            knowledgeCompleted,
            playerLevel: Progression.getLevel()
        };
    },

    getAchievementValue(achievement, stats) {
        return Math.max(0, Number(stats[achievement.metric]) || 0);
    },

    renderAchievements() {
        const stats = this.getAchievementStats();
        const unlocked = ACHIEVEMENTS.filter((achievement) => (
            this.getAchievementValue(achievement, stats) >= achievement.target
        )).length;

        document.getElementById('achievements-levels').textContent = stats.completedLevels;
        document.getElementById('achievements-stars').textContent = stats.stars;
        document.getElementById('achievements-knowledge').textContent = stats.knowledgeCompleted;
        document.getElementById('achievements-summary').textContent = `${unlocked}/${ACHIEVEMENTS.length} conquistas desbloqueadas.`;

        const list = document.getElementById('achievements-list');
        if (!list) return;

        list.innerHTML = ACHIEVEMENTS.map((achievement) => {
            const value = this.getAchievementValue(achievement, stats);
            const progress = Math.min(100, Math.round((value / achievement.target) * 100));
            const complete = value >= achievement.target;

            return `
                <article class="achievement-card ${complete ? 'unlocked' : ''}">
                    <div class="achievement-medal" aria-hidden="true">${complete ? '\u2605' : achievement.target}</div>
                    <div class="achievement-copy">
                        <strong>${escapeHTML(achievement.title)}</strong>
                        <span>${escapeHTML(achievement.description)}</span>
                        <div class="achievement-track" aria-label="${progress}% completo">
                            <i style="width: ${progress}%"></i>
                        </div>
                    </div>
                    <small>${Math.min(value, achievement.target)}/${achievement.target}</small>
                </article>
            `;
        }).join('');
    },

    setupServiceWorker() {
        if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
    }
};

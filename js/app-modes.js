import { Progression } from './progression.js';
import { THEMES } from './themes.js';
import { CAMPAIGN_MAX_LEVEL, getCampaignWords } from './campaign-levels.js';
import { KNOWLEDGE_THEMES } from './knowledge-paths.js';
import { PRIME_EVENT, PRIME_EVENT_RANKING, getPrimeEventConfig, getPrimeEventWords } from './prime-event.js';
import { SoundFX } from './audio.js';
import { escapeHTML, formatDuration, getThemeParts, getWordsFromStory, selectRandomWords } from './app-utils.js';

const KNOWLEDGE_THEME_SPRITES = {
    biblical: 'assets/images/ui/templo_biblico.webp',
    civilizations: 'assets/images/ui/civilizacoes.webp',
    curiosities: 'assets/images/ui/curiosidades.webp',
    wonders: 'assets/images/ui/maravilhas.webp'
};

export const modeMethods = {
    playSound(type) {
        if (!this.settings.sound) return;
        if (SoundFX[type]) SoundFX[type]();
    },

    setMissionTitle(title = 'Encontre as palavras') {
        const missionTitle = document.getElementById('mission-title');
        if (missionTitle) missionTitle.textContent = title;
    },

    vibrate(pattern = 16) {
        if (!this.settings.haptics || !navigator.vibrate) return;
        navigator.vibrate(pattern);
    },

    openConfigScreen(themeKey) {
        this.customConfig.themeKey = themeKey;
        const theme = THEMES[themeKey];
        const { icon, name } = getThemeParts(theme);

        document.getElementById('config-theme-icon').textContent = icon;
        document.getElementById('config-theme-title').textContent = name;

        this.selectGrid(8, document.querySelector('.config-card[data-size="8"]'));
        this.selectWordCount(5, document.querySelector('.count-btn[data-count="5"]'));

        this.showScreen('config');
    },

    selectGrid(size, element) {
        this.customConfig.gridSize = size;

        document.querySelectorAll('.config-card').forEach((el) => el.classList.remove('selected'));
        if (element) element.classList.add('selected');

        this.validateConfig();
    },

    selectWordCount(count, element) {
        if (element?.disabled) return;
        this.customConfig.wordCount = count;

        document.querySelectorAll('.count-btn').forEach((el) => el.classList.remove('selected'));
        if (element) element.classList.add('selected');
    },

    validateConfig() {
        const size = this.customConfig.gridSize;
        const countBtns = document.querySelectorAll('.count-btn');
        const warning = document.getElementById('config-warning');

        let maxWords = 20;
        if (size === 8) maxWords = 10;
        else if (size === 10) maxWords = 15;

        countBtns.forEach((btn) => {
            const btnCount = parseInt(btn.dataset.count, 10);
            if (btnCount > maxWords) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';

                if (this.customConfig.wordCount === btnCount) {
                    this.selectWordCount(5, document.querySelector('.count-btn[data-count="5"]'));
                    warning.classList.remove('hidden');
                }
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        });

        if (this.customConfig.wordCount <= maxWords) {
            warning.classList.add('hidden');
        }
    },

    startCustomGame() {
        this.gameMode = 'theme';
        const theme = THEMES[this.customConfig.themeKey];
        const { name } = getThemeParts(theme);

        document.getElementById('game-theme-name').textContent = name;
        document.getElementById('game-mode-label').textContent = 'Treino livre';
        this.setMissionTitle();

        const words = selectRandomWords(theme.words, this.customConfig.wordCount);
        this.resetPlayState(`theme-${this.customConfig.themeKey}-${this.customConfig.gridSize}-${this.customConfig.wordCount}`, words.length);

        const config = {
            gridSize: this.customConfig.gridSize,
            allowedDirections: ['all'],
            seed: null
        };

        this.showScreen('game');
        this.safeStartLevel(words, config);
    },

    launchQuickChallenge() {
        this.gameMode = 'quick';
        const themeKeys = Object.keys(THEMES);
        const themeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
        const theme = THEMES[themeKey];
        const { name } = getThemeParts(theme);
        const wordCount = 8;
        const words = selectRandomWords(theme.words, wordCount);

        document.getElementById('game-theme-name').textContent = 'Desafio rápido';
        document.getElementById('game-mode-label').textContent = name;
        this.setMissionTitle();
        this.resetPlayState(`quick-${themeKey}`, words.length);

        this.showScreen('game');
        this.safeStartLevel(words, {
            gridSize: 10,
            allowedDirections: ['horizontal', 'vertical', 'diagonal'],
            seed: Date.now()
        });
        this.showToast(`Desafio rápido: ${name}`);
    },

    openPrimeEventScreen() {
        this.renderPrimeEventScreen();
        this.showScreen('prime-event');
    },

    renderPrimeEventScreen() {
        const progress = Progression.getPrimeEventProgress(PRIME_EVENT.id);
        document.getElementById('prime-title').textContent = PRIME_EVENT.title;
        document.getElementById('prime-description').textContent = PRIME_EVENT.description;
        document.getElementById('prime-theme').textContent = PRIME_EVENT.themeTitle;
        document.getElementById('prime-best-time').textContent = formatDuration(progress.bestTime);
        document.getElementById('prime-attempts').textContent = progress.attempts || 0;
        this.renderPrimeRanking(progress);
    },

    renderPrimeRanking(progress = Progression.getPrimeEventProgress(PRIME_EVENT.id)) {
        const list = document.getElementById('prime-ranking-list');
        if (!list) return;

        const rows = PRIME_EVENT_RANKING.map((item) => ({
            ...item,
            label: item.name,
            isPlayer: false
        }));

        if (progress.bestTime != null) {
            rows.push({
                rank: 'Seu',
                label: 'Seu melhor tempo',
                time: progress.bestTime,
                isPlayer: true
            });
        }

        list.innerHTML = rows.map((item) => `
            <div class="prime-ranking-row ${item.isPlayer ? 'is-player' : ''}">
                <span>${escapeHTML(item.rank)}</span>
                <strong>${escapeHTML(item.label)}</strong>
                <em>${formatDuration(item.time)}</em>
            </div>
        `).join('');
    },

    startPrimeEventGame() {
        if (!PRIME_EVENT.isActive) {
            this.showToast('Evento Prime indisponível no momento.');
            return;
        }

        this.gameMode = 'prime-event';
        const words = getPrimeEventWords(PRIME_EVENT);
        const config = getPrimeEventConfig(PRIME_EVENT);

        document.getElementById('game-theme-name').textContent = PRIME_EVENT.title;
        document.getElementById('game-mode-label').textContent = PRIME_EVENT.themeTitle;
        this.setMissionTitle('Speedrun: encontre tudo');
        this.resetPlayState(PRIME_EVENT.id, words.length);

        this.showScreen('game');
        this.safeStartLevel(words, config);
        this.setGameFeedback('Sem dicas. Menor tempo vence.');
    },

    startNextWaveCountdown() {
        const container = document.getElementById('words-list');

        container.innerHTML = `
            <div class="wave-countdown">
                <div>Muito bem. Preparando novas palavras...</div>
            </div>
        `;

        setTimeout(() => this.startNextWave(), 1400);
    },

    startNextWave() {
        const theme = THEMES[this.customConfig.themeKey];
        const words = selectRandomWords(theme.words, this.customConfig.wordCount);
        this.setMissionTitle();

        const config = {
            gridSize: this.customConfig.gridSize,
            allowedDirections: ['all'],
            seed: null
        };

        this.resetPlayState(`theme-${this.customConfig.themeKey}-${Date.now()}`, words.length);
        this.safeStartLevel(words, config);
    },

    renderThemesList() {
        const container = document.getElementById('themes-grid');
        const empty = document.getElementById('themes-empty');
        container.innerHTML = '';
        const entries = Object.entries(THEMES);
        empty.classList.toggle('hidden', entries.length > 0);
        container.classList.toggle('hidden', entries.length === 0);

        entries.forEach(([key, theme]) => {
            const { icon, name } = getThemeParts(theme);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'theme-card';
            btn.style.setProperty('--theme-color', theme.color);
            btn.innerHTML = `
                <div class="theme-icon">${icon}</div>
                <div class="theme-copy">
                    <strong>${name}</strong>
                    <span>${theme.words.length} palavras</span>
                </div>
            `;
            btn.onclick = () => this.openConfigScreen(key);
            container.appendChild(btn);
        });
    },

    openKnowledgeScreen() {
        this.showScreen('knowledge');
    },

    openKnowledgeTheme(themeKey) {
        this.selectKnowledgeTheme(themeKey);
        this.startKnowledgeGame();
    },

    renderKnowledgeThemes() {
        const container = document.getElementById('knowledge-themes-grid');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(KNOWLEDGE_THEMES).forEach(([key, theme]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'knowledge-theme-card';
            btn.dataset.theme = key;
            btn.style.setProperty('--theme-color', theme.color);
            const sprite = KNOWLEDGE_THEME_SPRITES[key];
            btn.innerHTML = `
                <div class="knowledge-theme-media">
                    ${sprite
                        ? `<img src="${sprite}" alt="${escapeHTML(theme.title)}">`
                        : `<span>${theme.icon}</span>`}
                </div>
                <div class="knowledge-theme-copy">
                    <strong>${theme.title}</strong>
                    <small>${theme.lessons.length} fatos</small>
                </div>
            `;
            btn.onclick = () => this.selectKnowledgeTheme(key);
            container.appendChild(btn);
        });
    },

    selectKnowledgeTheme(themeKey) {
        const theme = KNOWLEDGE_THEMES[themeKey];
        if (!theme) return;

        const nextLessonIndex = Progression.getKnowledgeLessonIndex(themeKey);
        this.knowledgeState.themeKey = themeKey;
        this.knowledgeState.lessonIndex = Math.min(nextLessonIndex, theme.lessons.length - 1);
        this.knowledgeState.lesson = null;
        this.knowledgeState.words = [];

        document.querySelectorAll('[data-knowledge-theme]').forEach((btn) => {
            btn.classList.toggle('is-selected', btn.dataset.knowledgeTheme === themeKey);
        });
    },

    startKnowledgeGame() {
        const theme = KNOWLEDGE_THEMES[this.knowledgeState.themeKey];
        const savedIndex = Progression.getKnowledgeLessonIndex(this.knowledgeState.themeKey);
        if (!theme || savedIndex >= theme.lessons.length) {
            this.showToast('Essa trilha já foi concluída.');
            return;
        }
        const lessonIndex = Math.min(savedIndex, theme.lessons.length - 1);
        this.launchKnowledgeLesson(lessonIndex);
    },

    launchKnowledgeLesson(lessonIndex) {
        const theme = KNOWLEDGE_THEMES[this.knowledgeState.themeKey];
        const lesson = theme?.lessons[lessonIndex];
        const words = getWordsFromStory(lesson);
        if (!theme || !lesson || words.length < 3) {
            this.showToast('Escolha um tema com palavras suficientes.');
            return;
        }

        this.knowledgeState.lessonIndex = lessonIndex;
        this.knowledgeState.lesson = lesson;
        this.knowledgeState.words = words;
        this.gameMode = 'knowledge';
        document.getElementById('game-theme-name').textContent = theme.title;
        document.getElementById('game-mode-label').textContent = 'Caminho do Conhecimento';
        this.resetPlayState(`knowledge-${this.knowledgeState.themeKey}-${this.knowledgeState.lessonIndex}`, words.length);

        this.showScreen('game');
        this.renderKnowledgeGameStory(theme, lesson);
        this.safeStartLevel(words, {
            gridSize: 12,
            allowedDirections: ['all'],
            seed: Date.now()
        });
    },

    launchNextKnowledgeLesson() {
        const theme = KNOWLEDGE_THEMES[this.knowledgeState.themeKey];
        const progress = Progression.completeKnowledgeLesson(
            this.knowledgeState.themeKey,
            this.knowledgeState.lessonIndex,
            theme?.lessons.length || 0
        );
        const nextIndex = progress.nextLessonIndex;
        if (!theme || nextIndex >= theme.lessons.length) {
            this.showToast('Trilha concluída. Escolha outro tema.');
            this.showScreen('knowledge');
            this.selectKnowledgeTheme(this.knowledgeState.themeKey);
            return;
        }

        this.showToast('Próxima história...');
        setTimeout(() => this.launchKnowledgeLesson(nextIndex), 900);
    },

    renderKnowledgeGameStory(theme, lesson) {
        const storyPanel = document.getElementById('knowledge-game-story');
        if (storyPanel) storyPanel.classList.remove('hidden');
        const themeLabel = document.getElementById('game-knowledge-theme');
        if (themeLabel) themeLabel.textContent = theme.title;
        const title = document.getElementById('game-knowledge-title');
        if (title) title.textContent = lesson.title;
        const text = document.getElementById('game-knowledge-text');
        if (text) text.textContent = 'Encontre na história as palavras destacadas.';
        const missionTitle = document.getElementById('mission-title');
        if (missionTitle) missionTitle.textContent = lesson.title;
        this.updateAvatarUI();
    },

    handleWin(time) {
        this.updateGameHUD();
        if (this.gameMode === 'campaign') {
            const levelId = Progression.getCampaignLevel();
            const config = Progression.getLevelConfig(levelId);
            const stars = 3;
            const xpEarned = Progression.calculateXP(config, stars);

            Progression.completeCampaignLevel(levelId, stars, 0);
            Progression.addXP(xpEarned);

            const starFilled = '<span class="star-filled">\u2605</span>';
            const starEmpty = '<span>\u2606</span>';
            document.getElementById('victory-stars').innerHTML = starFilled.repeat(stars) + starEmpty.repeat(3 - stars);
            document.getElementById('victory-xp').textContent = `+${xpEarned}`;
            document.getElementById('victory-stars-count').textContent = stars;
            document.getElementById('victory-bonus').textContent = 'Calma';
            document.getElementById('modal-victory').classList.remove('hidden');
            SoundFX.win();
        } else if (this.gameMode === 'prime-event') {
            this.handlePrimeEventWin(time);
        } else {
            SoundFX.win();
            Progression.addXP(this.gameMode === 'quick' ? 25 : this.gameMode === 'knowledge' ? 20 : 10);
            if (this.gameMode === 'quick') {
                this.showToast('Desafio concluído. +25 XP');
                this.showScreen('menu');
            } else if (this.gameMode === 'knowledge') {
                this.showToast('História concluída. +20 XP');
                this.launchNextKnowledgeLesson();
            } else {
                this.startNextWaveCountdown();
            }
        }
    },

    handlePrimeEventWin(time) {
        SoundFX.win();
        const result = Progression.completePrimeEvent(PRIME_EVENT.id, time);

        document.getElementById('prime-result-title').textContent = result.isNewRecord
            ? 'Novo recorde Prime!'
            : 'Evento finalizado';
        document.getElementById('prime-result-message').textContent = result.isNewRecord
            ? 'Seu melhor tempo foi atualizado.'
            : 'Continue tentando para bater seu melhor tempo.';
        document.getElementById('prime-result-time').textContent = formatDuration(time);
        document.getElementById('prime-result-best').textContent = formatDuration(result.bestTime);
        document.getElementById('prime-result-attempts').textContent = result.attempts;
        document.getElementById('modal-prime-result').classList.remove('hidden');
    },

    launchCampaign() {
        this.gameMode = 'campaign';
        const levelId = Progression.getCampaignLevel();
        if (levelId > CAMPAIGN_MAX_LEVEL) {
            this.showToast('Campanha concluída. Novos desafios em breve.');
            this.showScreen('menu');
            return;
        }

        const config = Progression.getLevelConfig(levelId);
        const levelWords = getCampaignWords(config);

        document.getElementById('game-theme-name').textContent = `Nível ${levelId}`;
        document.getElementById('game-mode-label').textContent = config.event || config.theme;
        this.setMissionTitle();
        this.resetPlayState(`campaign-${levelId}`, levelWords.length);

        this.showScreen('game');
        this.safeStartLevel(levelWords, config);
    },

    safeStartLevel(words, config) {
        const gameScreen = document.getElementById('screen-game');
        gameScreen?.classList.add('is-loading');
        gameScreen?.classList.remove('has-error');
        try {
            this.applyBoardTheme(config);
            this.playState.startedAt = Date.now();
            this.playState.pausedMs = 0;
            this.game.startLevel(words, config);
            this.clearGameFeedback();
        } catch (error) {
            console.error(error);
            gameScreen?.classList.add('has-error');
            this.showScreen('menu');
            this.showToast('Não foi possível montar esse caça-palavras. Tente outra configuração.');
        } finally {
            gameScreen?.classList.remove('is-loading');
        }
    }
};

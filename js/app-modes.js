import { Progression } from './progression.js';
import { SoundFX } from './audio.js';
import { CAMPAIGN_MAX_LEVEL } from './app-constants.js';
import { escapeHTML, formatDuration, getThemeParts, getWordsFromStory, selectRandomWords } from './app-utils.js';

const KNOWLEDGE_THEME_SPRITES = {
    biblical: 'assets/images/ui/templo_biblico.webp',
    civilizations: 'assets/images/ui/civilizacoes.webp',
    curiosities: 'assets/images/ui/curiosidades.webp',
    wonders: 'assets/images/ui/maravilhas.webp'
};

export const modeMethods = {
    async loadThemesData() {
        if (this.themesData) return this.themesData;
        if (!this.themesPromise) {
            this.themesPromise = import('./themes.js')
                .then((module) => {
                    this.themesData = module.THEMES;
                    return this.themesData;
                })
                .finally(() => {
                    this.themesPromise = null;
                });
        }
        return this.themesPromise;
    },

    async loadCampaignData() {
        if (this.campaignData) return this.campaignData;
        if (!this.campaignPromise) {
            this.campaignPromise = import('./campaign-levels.js')
                .then((module) => {
                    this.campaignData = module;
                    return this.campaignData;
                })
                .finally(() => {
                    this.campaignPromise = null;
                });
        }
        return this.campaignPromise;
    },

    async loadKnowledgeData() {
        if (this.knowledgeData) return this.knowledgeData;
        if (!this.knowledgePromise) {
            this.knowledgePromise = import('./knowledge-paths.js')
                .then((module) => {
                    this.knowledgeData = module.KNOWLEDGE_THEMES;
                    return this.knowledgeData;
                })
                .finally(() => {
                    this.knowledgePromise = null;
                });
        }
        return this.knowledgePromise;
    },

    async loadPrimeEventData() {
        if (this.primeEventData) return this.primeEventData;
        if (!this.primeEventPromise) {
            this.primeEventPromise = import('./prime-event.js')
                .then((module) => {
                    this.primeEventData = module;
                    return this.primeEventData;
                })
                .finally(() => {
                    this.primeEventPromise = null;
                });
        }
        return this.primeEventPromise;
    },

    handleModeLoadError(error, message = 'Nao foi possivel abrir esse modo agora.') {
        console.error(error);
        this.showToast(message);
    },

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

    async openConfigScreen(themeKey) {
        try {
            const themes = await this.loadThemesData();
            this.customConfig.themeKey = themeKey;
            const theme = themes[themeKey];
            if (!theme) {
                this.showToast('Tema indisponivel no momento.');
                return;
            }
            const { icon, name } = getThemeParts(theme);

            document.getElementById('config-theme-icon').textContent = icon;
            document.getElementById('config-theme-title').textContent = name;

            this.selectGrid(8, document.querySelector('.config-card[data-size="8"]'));
            this.selectWordCount(5, document.querySelector('.count-btn[data-count="5"]'));

            this.showScreen('config');
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel abrir esse tema agora.');
        }
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

    async startCustomGame() {
        try {
            const themes = await this.loadThemesData();
            this.gameMode = 'theme';
            const theme = themes[this.customConfig.themeKey];
            if (!theme) {
                this.showToast('Tema indisponivel no momento.');
                return;
            }
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
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel iniciar esse tema agora.');
        }
    },

    async launchQuickChallenge() {
        try {
            const themes = await this.loadThemesData();
            this.gameMode = 'quick';
            const themeKeys = Object.keys(themes);
            const themeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
            const theme = themes[themeKey];
            const { name } = getThemeParts(theme);
            const wordCount = 8;
            const words = selectRandomWords(theme.words, wordCount);

            document.getElementById('game-theme-name').textContent = 'Desafio rapido';
            document.getElementById('game-mode-label').textContent = name;
            this.setMissionTitle();
            this.resetPlayState(`quick-${themeKey}`, words.length);

            this.showScreen('game');
            this.safeStartLevel(words, {
                gridSize: 10,
                allowedDirections: ['horizontal', 'vertical', 'diagonal'],
                seed: Date.now()
            });
            this.showToast(`Desafio rapido: ${name}`);
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel abrir o desafio rapido.');
        }
    },

    async openPrimeEventScreen() {
        try {
            this.ensureDeferredUI('prime-event');
            await this.renderPrimeEventScreen();
            this.showScreen('prime-event');
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel abrir o Evento Prime.');
        }
    },

    async renderPrimeEventScreen() {
        this.ensureDeferredUI('prime-event');
        const primeData = await this.loadPrimeEventData();
        const progress = Progression.getPrimeEventProgress(primeData.PRIME_EVENT.id);
        document.getElementById('prime-title').textContent = primeData.PRIME_EVENT.title;
        document.getElementById('prime-description').textContent = primeData.PRIME_EVENT.description;
        document.getElementById('prime-theme').textContent = primeData.PRIME_EVENT.themeTitle;
        document.getElementById('prime-best-time').textContent = formatDuration(progress.bestTime);
        document.getElementById('prime-attempts').textContent = progress.attempts || 0;
        this.renderPrimeRanking(progress, primeData);
    },

    renderPrimeRanking(progress, primeData = this.primeEventData) {
        const list = document.getElementById('prime-ranking-list');
        if (!list || !primeData?.PRIME_EVENT || !primeData?.PRIME_EVENT_RANKING) return;

        const rows = primeData.PRIME_EVENT_RANKING.map((item) => ({
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

    async startPrimeEventGame() {
        try {
            const primeData = await this.loadPrimeEventData();
            if (!primeData.PRIME_EVENT.isActive) {
                this.showToast('Evento Prime indisponivel no momento.');
                return;
            }

            this.gameMode = 'prime-event';
            const words = primeData.getPrimeEventWords(primeData.PRIME_EVENT);
            const config = primeData.getPrimeEventConfig(primeData.PRIME_EVENT);

            document.getElementById('game-theme-name').textContent = primeData.PRIME_EVENT.title;
            document.getElementById('game-mode-label').textContent = primeData.PRIME_EVENT.themeTitle;
            this.setMissionTitle('Speedrun: encontre tudo');
            this.resetPlayState(primeData.PRIME_EVENT.id, words.length);

            this.showScreen('game');
            this.safeStartLevel(words, config);
            this.setGameFeedback('Sem dicas. Menor tempo vence.');
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel iniciar o Evento Prime.');
        }
    },

    startNextWaveCountdown() {
        const container = document.getElementById('words-list');

        container.innerHTML = `
            <div class="wave-countdown">
                <div>Muito bem. Preparando novas palavras...</div>
            </div>
        `;

        setTimeout(() => {
            void this.startNextWave();
        }, 1400);
    },

    async startNextWave() {
        try {
            const themes = await this.loadThemesData();
            const theme = themes[this.customConfig.themeKey];
            if (!theme) {
                this.showToast('Tema indisponivel no momento.');
                return;
            }
            const words = selectRandomWords(theme.words, this.customConfig.wordCount);
            this.setMissionTitle();

            const config = {
                gridSize: this.customConfig.gridSize,
                allowedDirections: ['all'],
                seed: null
            };

            this.resetPlayState(`theme-${this.customConfig.themeKey}-${Date.now()}`, words.length);
            this.safeStartLevel(words, config);
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel carregar a proxima rodada.');
        }
    },

    async renderThemesList() {
        try {
            this.ensureDeferredUI('themes-select');
            const container = document.getElementById('themes-grid');
            const empty = document.getElementById('themes-empty');
            container.innerHTML = '';
            const themes = await this.loadThemesData();
            const entries = Object.entries(themes);
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
                btn.onclick = () => void this.openConfigScreen(key);
                container.appendChild(btn);
            });

            this.showScreen('themes-select');
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel carregar os temas.');
        }
    },

    async openKnowledgeScreen() {
        try {
            this.ensureDeferredUI('knowledge');
            await this.loadKnowledgeData();
            this.showScreen('knowledge');
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel abrir o Caminho do Conhecimento.');
        }
    },

    async openKnowledgeTheme(themeKey) {
        try {
            await this.selectKnowledgeTheme(themeKey);
            await this.startKnowledgeGame();
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel abrir essa trilha agora.');
        }
    },

    async renderKnowledgeThemes() {
        this.ensureDeferredUI('knowledge');
        const knowledgeThemes = await this.loadKnowledgeData();
        const container = document.getElementById('knowledge-themes-grid');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(knowledgeThemes).forEach(([key, theme]) => {
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
            btn.onclick = () => void this.selectKnowledgeTheme(key);
            container.appendChild(btn);
        });
    },

    async selectKnowledgeTheme(themeKey) {
        const knowledgeThemes = await this.loadKnowledgeData();
        const theme = knowledgeThemes[themeKey];
        if (!theme) return;

        const nextLessonIndex = Progression.getKnowledgeLessonIndex(themeKey);
        const completedLessons = Math.min(nextLessonIndex, theme.lessons.length);
        this.knowledgeState.themeKey = themeKey;
        this.knowledgeState.lessonIndex = Math.min(nextLessonIndex, theme.lessons.length - 1);
        this.knowledgeState.lesson = null;
        this.knowledgeState.words = [];

        document.querySelectorAll('[data-knowledge-theme]').forEach((btn) => {
            btn.classList.toggle('is-selected', btn.dataset.knowledgeTheme === themeKey);
        });

        const panel = document.getElementById('knowledge-trail-panel');
        const kicker = document.getElementById('knowledge-trail-kicker');
        const title = document.getElementById('knowledge-trail-title');
        const summary = document.getElementById('knowledge-trail-summary');
        const count = document.getElementById('knowledge-trail-count');
        const playButton = document.getElementById('btn-play-knowledge-trail');
        const isComplete = completedLessons >= theme.lessons.length;

        if (panel) {
            panel.classList.remove('hidden');
            panel.dataset.theme = themeKey;
            panel.classList.toggle('is-complete', isComplete);
        }
        if (kicker) kicker.textContent = isComplete ? 'Trilha completa' : 'Trilha selecionada';
        if (title) title.textContent = theme.title;
        if (summary) summary.textContent = theme.summary;
        if (count) count.textContent = `${completedLessons}/${theme.lessons.length}`;
        if (playButton) {
            playButton.textContent = isComplete ? 'Trilha concluida' : 'Jogar trilha';
            playButton.disabled = isComplete;
        }
    },

    async startKnowledgeGame() {
        const knowledgeThemes = await this.loadKnowledgeData();
        const theme = knowledgeThemes[this.knowledgeState.themeKey];
        const savedIndex = Progression.getKnowledgeLessonIndex(this.knowledgeState.themeKey);
        if (!theme || savedIndex >= theme.lessons.length) {
            this.showToast('Essa trilha ja foi concluida.');
            return;
        }
        const lessonIndex = Math.min(savedIndex, theme.lessons.length - 1);
        await this.launchKnowledgeLesson(lessonIndex);
    },

    async launchKnowledgeLesson(lessonIndex) {
        const knowledgeThemes = await this.loadKnowledgeData();
        const theme = knowledgeThemes[this.knowledgeState.themeKey];
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

    async launchNextKnowledgeLesson() {
        const knowledgeThemes = await this.loadKnowledgeData();
        const theme = knowledgeThemes[this.knowledgeState.themeKey];
        const progress = Progression.completeKnowledgeLesson(
            this.knowledgeState.themeKey,
            this.knowledgeState.lessonIndex,
            theme?.lessons.length || 0
        );
        const nextIndex = progress.nextLessonIndex;
        if (!theme || nextIndex >= theme.lessons.length) {
            this.showToast('Trilha concluida. Escolha outro tema.');
            this.showScreen('knowledge');
            await this.selectKnowledgeTheme(this.knowledgeState.themeKey);
            return;
        }

        this.showToast('Proxima historia...');
        setTimeout(() => {
            void this.launchKnowledgeLesson(nextIndex);
        }, 900);
    },

    renderKnowledgeGameStory(theme, lesson) {
        const storyPanel = document.getElementById('knowledge-game-story');
        if (storyPanel) storyPanel.classList.remove('hidden');
        const themeLabel = document.getElementById('game-knowledge-theme');
        if (themeLabel) themeLabel.textContent = theme.title;
        const title = document.getElementById('game-knowledge-title');
        if (title) title.textContent = lesson.title;
        const text = document.getElementById('game-knowledge-text');
        if (text) text.textContent = 'Encontre na historia as palavras destacadas.';
        const missionTitle = document.getElementById('mission-title');
        if (missionTitle) missionTitle.textContent = lesson.title;
        if (text) text.textContent = 'Leia o trecho e procure no tabuleiro apenas as palavras destacadas.';
        if (missionTitle) missionTitle.textContent = 'Texto da jornada';
        this.updateAvatarUI();
    },

    async handleWin(time) {
        this.updateGameHUD();
        if (this.gameMode === 'campaign') {
            const campaignData = await this.loadCampaignData();
            const levelId = Progression.getCampaignLevel();
            const config = campaignData.getCampaignLevelConfig(levelId);
            const stars = 3;
            const xpEarned = Progression.calculateXP(config, stars);

            Progression.completeCampaignLevel(levelId, stars, 0);
            Progression.addXP(xpEarned);

            const starFilled = '<span class="star-filled">&#9733;</span>';
            const starEmpty = '<span>&#9734;</span>';
            document.getElementById('victory-stars').innerHTML = starFilled.repeat(stars) + starEmpty.repeat(3 - stars);
            document.getElementById('victory-xp').textContent = `+${xpEarned}`;
            document.getElementById('victory-stars-count').textContent = stars;
            document.getElementById('victory-bonus').textContent = 'Calma';
            document.getElementById('modal-victory').classList.remove('hidden');
            SoundFX.win();
            return;
        }

        if (this.gameMode === 'prime-event') {
            await this.handlePrimeEventWin(time);
            return;
        }

        SoundFX.win();
        Progression.addXP(this.gameMode === 'quick' ? 25 : this.gameMode === 'knowledge' ? 20 : 10);
        if (this.gameMode === 'quick') {
            this.showToast('Desafio concluido. +25 XP');
            this.showScreen('menu');
        } else if (this.gameMode === 'knowledge') {
            this.showToast('Historia concluida. +20 XP');
            void this.launchNextKnowledgeLesson();
        } else {
            this.startNextWaveCountdown();
        }
    },

    async handlePrimeEventWin(time) {
        const primeData = await this.loadPrimeEventData();
        SoundFX.win();
        const result = Progression.completePrimeEvent(primeData.PRIME_EVENT.id, time);

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

    async launchCampaign() {
        try {
            this.gameMode = 'campaign';
            const levelId = Progression.getCampaignLevel();
            if (levelId > CAMPAIGN_MAX_LEVEL) {
                this.showToast('Campanha concluida. Novos desafios em breve.');
                this.showScreen('menu');
                return;
            }

            const campaignData = await this.loadCampaignData();
            const config = campaignData.getCampaignLevelConfig(levelId);
            const levelWords = campaignData.getCampaignWords(config);

            document.getElementById('game-theme-name').textContent = `Nivel ${levelId}`;
            document.getElementById('game-mode-label').textContent = config.event || config.theme;
            this.setMissionTitle();
            this.resetPlayState(`campaign-${levelId}`, levelWords.length);

            this.showScreen('game');
            this.safeStartLevel(levelWords, config);
        } catch (error) {
            this.handleModeLoadError(error, 'Nao foi possivel abrir a campanha.');
        }
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
            if (this.gameMode === 'knowledge') this.scheduleKnowledgeAutoAssist();
            this.clearGameFeedback();
        } catch (error) {
            console.error(error);
            gameScreen?.classList.add('has-error');
            this.showScreen('menu');
            this.showToast('Nao foi possivel montar esse caca-palavras. Tente outra configuracao.');
        } finally {
            gameScreen?.classList.remove('is-loading');
        }
    }
};

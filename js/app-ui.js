import { Progression } from './progression.js';
import { CAMPAIGN_MAX_LEVEL } from './campaign-levels.js';
import { formatWalletAmount } from './app-utils.js';
import { WORD_COLORS } from './app-constants.js';

export const uiMethods = {
    toggleDrawer() {},

    showScreen(id) {
        document.querySelectorAll('.screen').forEach((screen) => screen.classList.add('hidden'));
        const screen = document.getElementById(`screen-${id}`);
        if (screen) {
            screen.classList.remove('hidden');
            screen.classList.add('animate-in');
        }
        window.scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
        const gameScreen = document.getElementById('screen-game');
        const isKnowledgeGame = id === 'game' && this.gameMode === 'knowledge';
        gameScreen?.classList.toggle('is-knowledge-mode', isKnowledgeGame);
        gameScreen?.classList.toggle('is-prime-event', id === 'game' && this.gameMode === 'prime-event');
        document.getElementById('knowledge-game-story')?.classList.add('hidden');
        this.updateBottomNav(id);
        if (id === 'menu') this.updateMenuUI();
        if (id === 'prime-event') this.renderPrimeEventScreen();
    },

    resetPlayState(levelKey, totalWords) {
        this.playState = {
            combo: 1,
            hintsLeft: this.gameMode === 'prime-event' ? 0 : 1,
            areaLeft: this.gameMode === 'prime-event' ? 0 : 1,
            clearLeft: this.gameMode === 'prime-event' ? 0 : 1,
            totalWords,
            foundWords: 0,
            paused: false,
            currentLevelKey: levelKey,
            startedAt: 0,
            pausedAt: 0,
            pausedMs: 0
        };
        this.updateGameHUD();
    },

    updateGameHUD() {
        const total = this.playState.totalWords || 0;
        const found = this.playState.foundWords || 0;
        const progress = total ? (found / total) * 100 : 0;
        const progressBar = document.getElementById('game-progress-bar');
        const hints = document.getElementById('game-hints-left');
        const area = document.getElementById('game-area-left');
        const clear = document.getElementById('game-clear-left');
        const sound = document.getElementById('game-sound-state');

        this.updateStatText('game-progress-text', `${found}/${total}`);
        if (progressBar) progressBar.style.width = `${Math.min(100, progress)}%`;
        if (hints) hints.textContent = this.playState.hintsLeft;
        if (area) area.textContent = this.playState.areaLeft;
        if (clear) clear.textContent = this.playState.clearLeft;
        if (sound) sound.textContent = this.settings.sound ? 'On' : 'Off';

        const pauseLabel = document.getElementById('game-pause-label');
        const pauseState = document.getElementById('game-pause-state');
        if (pauseLabel) pauseLabel.textContent = this.playState.paused ? 'Continuar partida' : 'Pausar partida';
        if (pauseState) pauseState.textContent = this.playState.paused ? '\u25B6' : '\u2161';
        const screen = document.getElementById('screen-game');
        screen?.classList.toggle('is-paused', this.playState.paused);

        document.getElementById('btn-game-hint')?.classList.toggle('is-disabled', this.playState.hintsLeft <= 0);
        document.getElementById('btn-game-area')?.classList.toggle('is-disabled', this.playState.areaLeft <= 0);
        document.getElementById('btn-game-clear')?.classList.toggle('is-disabled', this.playState.clearLeft <= 0);
        document.getElementById('btn-game-sound')?.classList.toggle('is-off', !this.settings.sound);
        document.getElementById('screen-game')?.classList.toggle('is-prime-event', this.gameMode === 'prime-event');
    },

    openGameSettings() {
        this.updateGameHUD();
        document.getElementById('modal-game-settings')?.classList.remove('hidden');
    },

    closeGameSettings() {
        document.getElementById('modal-game-settings')?.classList.add('hidden');
    },

    updateStatText(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        const next = String(value);
        if (element.textContent === next) return;
        element.textContent = next;
        element.classList.remove('stat-bump');
        void element.offsetWidth;
        element.classList.add('stat-bump');
    },

    setGameFeedback(message) {
        const feedback = document.getElementById('game-feedback');
        const bubble = document.getElementById('game-feedback-bubble');
        if (!feedback) return;
        feedback.textContent = message;
        bubble?.classList.add('has-message');
        feedback.classList.remove('pulse-feedback');
        void feedback.offsetWidth;
        feedback.classList.add('pulse-feedback');
    },

    clearGameFeedback() {
        const feedback = document.getElementById('game-feedback');
        const bubble = document.getElementById('game-feedback-bubble');
        if (!feedback) return;
        feedback.textContent = '';
        bubble?.classList.remove('has-message');
        feedback.classList.remove('pulse-feedback');
    },

    togglePause() {
        if (!this.game) return;
        this.playState.paused = !this.playState.paused;
        if (this.playState.paused) {
            this.playState.pausedAt = Date.now();
            this.game.stopTimer();
            this.setGameFeedback('Partida pausada');
        } else {
            this.playState.pausedMs += Date.now() - this.playState.pausedAt;
            this.game.resumeTimer?.(this.playState.pausedMs);
            this.setGameFeedback('De volta ao jogo.');
        }
        this.updateGameHUD();
    },

    spawnWordParticles(coords) {
        const board = document.getElementById('letter-grid');
        if (!board || !coords.length) return;
        const [r, c] = coords[Math.floor(coords.length / 2)].split(',');
        const cell = board.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (!cell) return;
        const rect = cell.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        const x = rect.left - boardRect.left + rect.width / 2;
        const y = rect.top - boardRect.top + rect.height / 2;

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('i');
            particle.className = 'word-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 46}px`);
            particle.style.setProperty('--dy', `${-12 - Math.random() * 34}px`);
            particle.style.setProperty('--delay', `${i * 18}ms`);
            board.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove(), { once: true });
        }
    },

    useHint() {
        if (this.gameMode === 'prime-event') return;
        if (!this.game || this.playState.paused) return;
        if (this.playState.hintsLeft <= 0) {
            this.setGameFeedback('Dica já usada nesta fase');
            return;
        }
        const target = this.game.words.find((word) => !this.game.found.has(word));
        if (!target) return;
        const coords = this.findWordCoords(target);
        if (!coords.length) return;
        const [r, c] = coords[0].split(',');
        const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
        if (!cell) return;

        this.playState.hintsLeft--;
        cell.classList.add('hinted');
        setTimeout(() => cell.classList.remove('hinted'), 1800);
        this.setGameFeedback(`Dica: ${target.length} letras`);
        this.vibrate(10);
        this.updateGameHUD();
    },

    getPendingWord() {
        return this.game?.words.find((word) => !this.game.found.has(word));
    },

    highlightWordArea() {
        if (this.gameMode === 'prime-event') return;
        if (!this.game || this.playState.paused) return;
        if (this.playState.areaLeft <= 0) {
            this.setGameFeedback('Área já usada nesta fase');
            return;
        }
        const target = this.getPendingWord();
        if (!target) return;

        const coords = this.findWordCoords(target);
        if (!coords.length) return;

        const [middleR, middleC] = coords[Math.floor(coords.length / 2)].split(',').map(Number);
        const size = this.game.size;
        const cells = [];

        const radius = 2;
        for (let r = middleR - radius; r <= middleR + radius; r++) {
            for (let c = middleC - radius; c <= middleC + radius; c++) {
                if (r < 0 || c < 0 || r >= size || c >= size) continue;
                const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
                if (cell) cells.push(cell);
            }
        }

        this.playState.areaLeft--;
        cells.forEach((cell) => cell.classList.add('area-hint'));
        setTimeout(() => cells.forEach((cell) => cell.classList.remove('area-hint')), 2000);
        this.setGameFeedback('Área destacada');
        this.vibrate(8);
        this.updateGameHUD();
    },

    cleanNoiseLetters() {
        if (this.gameMode === 'prime-event') return;
        if (!this.game || this.playState.paused) return;
        if (this.playState.clearLeft <= 0) {
            this.setGameFeedback('Limpar já usado nesta fase');
            return;
        }
        const wordCoords = new Set();

        this.game.words.forEach((word) => {
            this.findWordCoords(word).forEach((coord) => wordCoords.add(coord));
        });

        const muted = [];
        document.querySelectorAll('.cell').forEach((cell) => {
            const coord = `${cell.dataset.r},${cell.dataset.c}`;
            if (wordCoords.has(coord)) return;
            cell.classList.add('noise-muted');
            muted.push(cell);
        });

        this.playState.clearLeft--;
        setTimeout(() => muted.forEach((cell) => cell.classList.remove('noise-muted')), 2200);
        this.setGameFeedback('Letras extras suavizadas');
        this.vibrate(8);
        this.updateGameHUD();
    },

    findWordCoords(word) {
        const grid = this.game?.grid || [];
        const size = this.game?.size || grid.length;
        const directions = [
            [0, 1], [1, 0], [1, 1], [-1, 1],
            [0, -1], [-1, 0], [-1, -1], [1, -1]
        ];

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                for (const [dr, dc] of directions) {
                    const coords = [];
                    let matches = true;
                    for (let i = 0; i < word.length; i++) {
                        const rr = r + dr * i;
                        const cc = c + dc * i;
                        if (rr < 0 || rr >= size || cc < 0 || cc >= size || grid[rr][cc] !== word[i]) {
                            matches = false;
                            break;
                        }
                        coords.push(`${rr},${cc}`);
                    }
                    if (matches) return coords;
                }
            }
        }

        return [];
    },

    toggleGameSound() {
        this.settings.sound = !this.settings.sound;
        this.saveSettings();
        this.applySettings();
        this.setGameFeedback(this.settings.sound ? 'Som ligado' : 'Som desligado');
        this.updateGameHUD();
    },

    focusBoard() {
        document.getElementById('letter-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.setGameFeedback('Tabuleiro no centro');
    },

    updateBottomNav(id) {
        const nav = document.getElementById('bottom-nav');
        const visibleScreens = ['menu', 'themes-select', 'knowledge', 'prime-event', 'settings', 'profile', 'achievements'];
        nav.classList.toggle('hidden', !visibleScreens.includes(id));
        document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
        const activeMap = {
            menu: 'btn-nav-home',
            profile: 'btn-nav-home',
            knowledge: 'btn-nav-home',
            'prime-event': 'btn-nav-home',
            'themes-select': 'btn-nav-themes',
            settings: 'btn-nav-settings',
            achievements: 'btn-nav-stats'
        };
        const active = document.getElementById(activeMap[id]);
        if (active) active.classList.add('active');
    },

    updateMenuUI() {
        document.getElementById('menu-stars-display').textContent = formatWalletAmount(Progression.data.xp);
        document.getElementById('menu-gems-display').textContent = formatWalletAmount(85);
        const homeLevel = document.getElementById('home-level-display');
        if (homeLevel) homeLevel.textContent = Progression.getLevel();
        const stage = document.getElementById('home-stage-display');
        const campaignLevel = Math.min(Progression.getCampaignLevel(), CAMPAIGN_MAX_LEVEL);
        if (stage) stage.textContent = campaignLevel;
        const xpBar = document.getElementById('home-xp-bar');
        if (xpBar) xpBar.style.width = `${Math.min(100, Progression.getXPPercent())}%`;
    },

    showStatsSummary() {
        const completed = Object.keys(Progression.data.completedLevels || {}).length;
        const stars = Object.values(Progression.data.completedLevels || {}).reduce((sum, item) => sum + (item.stars || 0), 0);
        this.showToast(`${completed} níveis completos · ${stars} estrelas · Nível ${Progression.getLevel()}`);
    },

    copyProgressSummary() {
        const completed = Object.keys(Progression.data.completedLevels || {}).length;
        const stars = Object.values(Progression.data.completedLevels || {}).reduce((sum, item) => sum + (item.stars || 0), 0);
        const text = `Word Hunter Pro: nível ${Progression.getLevel()}, fase ${Progression.getCampaignLevel()}, ${completed} fases completas, ${stars} estrelas.`;
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => this.showToast('Resumo copiado.'))
                .catch(() => this.showToast(text));
            return;
        }
        this.showToast(text);
    },

    armOrResetProgress() {
        const btn = document.getElementById('btn-reset-progress');
        if (!btn.dataset.armed) {
            btn.dataset.armed = 'true';
            btn.querySelector('span').textContent = 'Toque novamente para confirmar';
            btn.querySelector('strong').textContent = 'Confirmar';
            clearTimeout(this.resetTimer);
            this.resetTimer = setTimeout(() => {
                delete btn.dataset.armed;
                btn.querySelector('span').textContent = 'Reiniciar progresso';
                btn.querySelector('strong').textContent = 'Toque 2x';
            }, 3200);
            return;
        }

        clearTimeout(this.resetTimer);
        delete btn.dataset.armed;
        Progression.reset();
        this.updateMenuUI();
        this.updateSettingsSummary();
        btn.querySelector('span').textContent = 'Reiniciar progresso';
        btn.querySelector('strong').textContent = 'Toque 2x';
        this.showToast('Progresso reiniciado.');
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
        this.toggleDrawer(false);
    },

    highlightCellsDOM(coords) {
        document.querySelectorAll('.cell.selected').forEach((element) => element.classList.remove('selected'));
        coords.forEach((key) => {
            const [r, c] = key.split(',');
            const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
            if (cell) cell.classList.add('selected');
        });
    },

    clearHighlightDOM() {
        const selected = document.querySelectorAll('.cell.selected');
        selected.forEach((element) => element.classList.add('selection-error'));
        this.setGameFeedback('Quase. Tente outro caminho');
        this.updateGameHUD();
        setTimeout(() => {
            selected.forEach((element) => {
                element.classList.remove('selected');
                element.classList.remove('selection-error');
            });
        }, 220);
    },

    markFoundDOM(coords, word) {
        const wordIndex = this.game?.words?.indexOf(word) ?? 0;
        const color = WORD_COLORS[Math.max(0, wordIndex) % WORD_COLORS.length];
        coords.forEach((key, index) => {
            const [r, c] = key.split(',');
            const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
            if (cell) {
                cell.classList.remove('selected');
                cell.classList.add('found');
                cell.classList.add('just-found');
                cell.style.setProperty('--word-start', color.start);
                cell.style.setProperty('--word-end', color.end);
                cell.style.setProperty('--word-glow', color.glow);
                cell.style.setProperty('--found-delay', `${index * 34}ms`);
                setTimeout(() => cell.classList.remove('just-found'), 500);
            }
        });
        this.spawnWordParticles(coords);
        this.highlightWordDOM(word, color);
        this.vibrate(18);
        this.playState.foundWords = this.game?.found?.size ?? document.querySelectorAll('.word-chip.found').length;
        this.playState.combo = Math.min(9, this.playState.combo + 1);
        this.setGameFeedback(`${word} encontrada`);
        this.updateGameHUD();
    },

    renderGridDOM(grid, size) {
        const board = document.getElementById('letter-grid');
        board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        board.dataset.size = String(size);
        board.innerHTML = '';
        grid.forEach((row, r) => {
            row.forEach((char, c) => {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = char;
                cell.dataset.r = r;
                cell.dataset.c = c;
                board.appendChild(cell);
            });
        });
        this.attachInputEvents(board);
    },

    attachInputEvents(board) {
        let isDragging = false;
        let rafPending = false;
        let lastEvent = null;
        let gridBounds = null;
        let cellSize = 0;
        let gridSize = 0;

        const updateGridMetrics = () => {
            gridBounds = board.getBoundingClientRect();
            gridSize = this.game?.size || 0;
            cellSize = gridSize ? gridBounds.width / gridSize : 0;
        };

        const getCellFromPoint = (clientX, clientY) => {
            if (!gridBounds || !cellSize || !gridSize) return null;
            const x = clientX - gridBounds.left;
            const y = clientY - gridBounds.top;
            if (x < 0 || y < 0 || x >= gridBounds.width || y >= gridBounds.height) return null;
            const c = Math.floor(x / cellSize);
            const r = Math.floor(y / cellSize);
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return null;
            return { r: String(r), c: String(c) };
        };

        const processMove = () => {
            rafPending = false;
            if (!isDragging || !lastEvent) return;
            const data = getCellFromPoint(lastEvent.clientX, lastEvent.clientY);
            if (data) this.game.handleInputMove(data);
        };

        board.onpointerdown = (event) => {
            const cell = event.target.closest('.cell');
            if (!cell || this.playState.paused) return;
            updateGridMetrics();
            isDragging = true;
            board.setPointerCapture?.(event.pointerId);
            this.game.handleInputStart(cell.dataset);
        };

        board.onpointermove = (event) => {
            if (!isDragging) return;
            lastEvent = event;
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(processMove);
        };

        const finishSelection = () => {
            if (!isDragging) return;
            isDragging = false;
            rafPending = false;
            lastEvent = null;
            this.game.handleInputEnd();
        };

        board.onpointerup = finishSelection;
        board.onpointercancel = finishSelection;
        board.onpointerleave = () => {
            if (!isDragging) return;
            finishSelection();
        };

        window.addEventListener('resize', updateGridMetrics, { passive: true });
        updateGridMetrics();
    },

    renderWordsDOM(words) {
        if (this.gameMode === 'knowledge' && this.knowledgeState?.lesson) {
            this.renderKnowledgeWordsDOM(words);
            return;
        }
        const list = document.getElementById('words-list');
        list.innerHTML = words.map((word) => `
            <div class="word-chip" data-w="${word}">
                <span>${word}</span>
            </div>
        `).join('');
        this.playState.totalWords = words.length;
        this.playState.foundWords = 0;
        this.updateGameHUD();
    },

    renderKnowledgeWordsDOM(words) {
        const list = document.getElementById('words-list');
        const lesson = this.knowledgeState?.lesson;
        if (!list || !lesson) {
            this.playState.totalWords = words.length;
            this.playState.foundWords = 0;
            this.updateGameHUD();
            return;
        }

        const remaining = new Set(words);
        const storyHTML = lesson.text.split(/(\s+)/).map((chunk) => {
            if (!chunk.trim()) return chunk;

            const clean = chunk.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ]+$/g, '');
            const normalized = clean
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toUpperCase();

            if (!remaining.has(normalized)) return chunk;
            remaining.delete(normalized);

            return chunk.replace(
                clean,
                `<span class="knowledge-inline-word word-chip" data-w="${normalized}">${clean}</span>`
            );
        }).join('');

        list.innerHTML = `
            <div class="knowledge-integrated-story">
                <img src="${this.settings.avatar}" alt="">
                <div class="knowledge-integrated-copy">
                    <span>${lesson.title}</span>
                    <p>${storyHTML}</p>
                </div>
            </div>
        `;
        this.playState.totalWords = words.length;
        this.playState.foundWords = 0;
        this.updateGameHUD();
    },

    highlightWordDOM(word, color = null) {
        document.querySelectorAll(`.word-chip[data-w="${word}"]`).forEach((chip) => {
            if (color) {
                chip.style.setProperty('--word-start', color.start);
                chip.style.setProperty('--word-end', color.end);
                chip.style.setProperty('--word-glow', color.glow);
            }
            chip.classList.add('found');
        });
    },

    hideModal(id) {
        document.getElementById(`modal-${id}`).classList.add('hidden');
    }
};

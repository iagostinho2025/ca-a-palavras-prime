function createRNG(seed) {
    return function() {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export class GameEngine {
    constructor(uiCallbacks) {
        this.ui = uiCallbacks; 
        this.grid = [];
        this.letterCounts = [];
        this.size = 10;
        this.words = [];
        this.found = new Set();
        this.selection = { start: null, end: null, cells: [] };
        this.isSelecting = false;
        this.timer = null;
        this.startTime = 0;
        this.pausedDuration = 0;
        this.config = null;
        this.rng = Math.random;
    }

    startLevel(themeWords, configOrSize) {
        if (typeof configOrSize === 'number') {
            this.config = { 
                gridSize: configOrSize, 
                allowedDirections: ['all'], 
                seed: null 
            };
        } else {
            this.config = configOrSize;
        }

        this.size = this.config.gridSize;
        this.words = themeWords
            .map(w => w.toUpperCase())
            .filter(w => w.length <= this.size);

        if (!this.words.length) {
            throw new Error('No playable words available for this grid size.');
        }

        this.found.clear();
        this.selection = { start: null, end: null, cells: [] };
        this.stopTimer();
        this.pausedDuration = 0;

        this.rng = this.config.seed ? createRNG(this.config.seed) : Math.random;

        let generated = false;
        for (let attempts = 0; attempts < 40; attempts++) {
            this.grid = this.generateEmptyGrid();
            if (this.fillGridWithWords()) {
                generated = true;
                break;
            }
        }

        if (!generated) {
            throw new Error('Unable to place all words on the grid.');
        }

        this.fillEmptySpaces();
        this.ui.renderGrid(this.grid, this.size);
        this.ui.renderWords(this.words);
        this.ui.onUpdateTimer('0:00');
        this.startTimer();
    }

    generateEmptyGrid() {
        this.letterCounts = Array(this.size).fill().map(() => Array(this.size).fill(0));
        return Array(this.size).fill().map(() => Array(this.size).fill(''));
    }

    fillGridWithWords() {
        // Ordena palavras da maior para menor
        const sortedWords = [...this.words].sort((a, b) => b.length - a.length);
        
        const tryPlace = (wordIdx) => {
            if (wordIdx >= sortedWords.length) return true;
            
            const word = sortedWords[wordIdx];
            const maxAttempts = 50; 
            
            for (let i = 0; i < maxAttempts; i++) {
                const dir = this.getRandomDirection();
                const r = Math.floor(this.rng() * this.size);
                const c = Math.floor(this.rng() * this.size);

                if (this.canPlace(word, r, c, dir)) {
                    this.place(word, r, c, dir);
                    if (tryPlace(wordIdx + 1)) return true;
                    this.remove(word, r, c, dir);
                }
            }
            return false;
        };

        return tryPlace(0);
    }

    getRandomDirection() {
        const map = {
            'horizontal': [[0,1]],
            'vertical': [[1,0]],
            'diagonal': [[1,1], [-1,1]], // Diagonais descendentes e ascendentes
            'reverse': [[0,-1], [-1,0], [-1,-1], [1,-1]] // Todas as inversas
        };

        let pool = [];
        const allowed = this.config.allowedDirections || ['all'];

        if (allowed.includes('all')) {
            pool = [[0,1], [1,0], [1,1], [-1,1], [0,-1], [-1,0], [-1,-1], [1,-1]];
        } else {
            allowed.forEach(type => {
                if (map[type]) pool = pool.concat(map[type]);
            });
            if (pool.length === 0) pool = [[0,1], [1,0]];
        }

        return pool[Math.floor(this.rng() * pool.length)];
    }

    canPlace(word, r, c, [dr, dc]) {
        const lastR = r + dr * (word.length - 1);
        const lastC = c + dc * (word.length - 1);
        if (lastR < 0 || lastR >= this.size || lastC < 0 || lastC >= this.size) return false;
        for (let i = 0; i < word.length; i++) {
            const cell = this.grid[r + dr * i][c + dc * i];
            if (cell !== '' && cell !== word[i]) return false;
        }
        return true;
    }

    place(word, r, c, [dr, dc]) {
        for (let i = 0; i < word.length; i++) {
            const rr = r + dr * i;
            const cc = c + dc * i;
            this.grid[rr][cc] = word[i];
            this.letterCounts[rr][cc]++;
        }
    }
    remove(word, r, c, [dr, dc]) {
        for (let i = 0; i < word.length; i++) {
            const rr = r + dr * i;
            const cc = c + dc * i;
            this.letterCounts[rr][cc] = Math.max(0, this.letterCounts[rr][cc] - 1);
            if (this.letterCounts[rr][cc] === 0) this.grid[rr][cc] = '';
        }
    }

    fillEmptySpaces() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === '') {
                    const char = this.rng() > 0.7 
                        ? "AEIOU"[Math.floor(this.rng()*5)]
                        : alphabet[Math.floor(this.rng()*26)];
                    this.grid[r][c] = char;
                }
            }
        }
    }

    handleInputStart(dataset) {
        this.isSelecting = true;
        const r = parseInt(dataset.r);
        const c = parseInt(dataset.c);
        this.selection.start = { r, c };
        this.selection.end = { r, c };
        this.updateSelectionVisuals();
        this.ui.playSound('pop');
    }

    handleInputMove(dataset) {
        if (!this.isSelecting || !dataset) return;
        const targetR = parseInt(dataset.r);
        const targetC = parseInt(dataset.c);
        const start = this.selection.start;
        if (targetR === start.r && targetC === start.c) return;

        const dy = targetR - start.r;
        const dx = targetC - start.c;
        const absDy = Math.abs(dy);
        const absDx = Math.abs(dx);

        let finalR = targetR;
        let finalC = targetC;

        if (absDx <= 1 && absDy <= 1) { /* Livre */ } 
        else {
            if (absDx > absDy * 1.5) finalR = start.r; 
            else if (absDy > absDx * 1.5) finalC = start.c; 
            else {
                const dist = Math.max(absDx, absDy);
                finalR = start.r + (Math.sign(dy) * dist);
                finalC = start.c + (Math.sign(dx) * dist);
            }
        }

        if (finalR < 0 || finalR >= this.size || finalC < 0 || finalC >= this.size) return;

        if (this.selection.end.r !== finalR || this.selection.end.c !== finalC) {
            this.selection.end = { r: finalR, c: finalC };
            this.updateSelectionVisuals();
        }
    }

    updateSelectionVisuals() {
        this.selection.cells = [];
        const start = this.selection.start;
        const end = this.selection.end;
        const dr = Math.sign(end.r - start.r);
        const dc = Math.sign(end.c - start.c);
        const steps = Math.max(Math.abs(end.r - start.r), Math.abs(end.c - start.c));
        let currentR = start.r;
        let currentC = start.c;
        for (let i = 0; i <= steps; i++) {
            this.selection.cells.push(`${currentR},${currentC}`);
            currentR += dr;
            currentC += dc;
        }
        this.ui.highlightCells(this.selection.cells);
    }

    handleInputEnd() {
        if (!this.isSelecting) return;
        this.isSelecting = false;
        let word = "";
        this.selection.cells.forEach(key => {
            const [r, c] = key.split(',').map(Number);
            word += this.grid[r][c];
        });
        
        const checkWord = word.toUpperCase();
        const reversed = checkWord.split('').reverse().join('');
        const isValid = this.words.includes(checkWord);
        const isReversed = this.words.includes(reversed);

        let foundWord = null;
        if (isValid && !this.found.has(checkWord)) foundWord = checkWord;
        else if (isReversed && !this.found.has(reversed)) foundWord = reversed;

        if (foundWord) {
            this.found.add(foundWord);
            this.ui.markFound(this.selection.cells, foundWord); 
            this.ui.playSound('success');
            if (this.found.size === this.words.length) {
                this.stopTimer();
                const time = Math.floor((Date.now() - this.startTime - this.pausedDuration) / 1000);
                setTimeout(() => {
                    this.ui.playSound('win');
                    this.ui.onWin(time);
                }, 500);
            }
        } else {
            this.ui.clearHighlight(); 
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.pausedDuration = 0;
        this.runTimer();
    }

    runTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            const seconds = Math.floor((Date.now() - this.startTime - this.pausedDuration) / 1000);
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            this.ui.onUpdateTimer(`${m}:${s.toString().padStart(2, '0')}`);
        }, 1000);
    }

    resumeTimer(pausedDuration = 0) {
        this.pausedDuration = pausedDuration;
        this.runTimer();
    }

    stopTimer() { clearInterval(this.timer); }
}

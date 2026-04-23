/* js/progression.js */

import { CAMPAIGN_MAX_LEVEL } from './app-constants.js';

const DEFAULT_DATA = {
    xp: 0,
    level: 1,
    currentCampaignLevel: 1,
    unlockedThemes: ['cinema'],
    completedLevels: {},
    knowledgeProgress: {},
    primeEvents: {}
};

export const Progression = {
    data: { ...DEFAULT_DATA, completedLevels: {}, knowledgeProgress: {}, primeEvents: {} },

    init() {
        const saved = localStorage.getItem('wh_pro_data_v1');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.data = {
                ...this.data,
                ...parsed,
                completedLevels: parsed.completedLevels || {},
                knowledgeProgress: parsed.knowledgeProgress || {},
                primeEvents: parsed.primeEvents || {}
            };
        }
    },

    save() {
        localStorage.setItem('wh_pro_data_v1', JSON.stringify(this.data));
    },

    reset() {
        this.data = { ...DEFAULT_DATA, completedLevels: {}, knowledgeProgress: {}, primeEvents: {} };
        this.save();
    },

    // --- CONFIGURAÇÃO DO NÍVEL ---

    // --- CÁLCULOS DE RESULTADO (MATH) ---

    // Retorna 1, 2 ou 3 estrelas baseado no tempo
    calculateStars(levelConfig, timeSeconds) {
        if (timeSeconds <= levelConfig.timeTargets.three) return 3;
        if (timeSeconds <= levelConfig.timeTargets.two) return 2;
        return 1;
    },

    // Calcula XP baseado no GDD: Base + Estrelas + Boss
    calculateXP(levelConfig, stars) {
        const xpBase = 40 + (10 * levelConfig.tier);
        const xpStars = stars * 40;
        const xpBoss = levelConfig.isBoss ? 50 : 0;
        return xpBase + xpStars + xpBoss;
    },

    // --- SALVAR PROGRESSO ---

    completeCampaignLevel(levelId, stars, time) {
        // 1. Salva estatísticas (apenas se melhorou)
        const previous = this.data.completedLevels[levelId];
        if (!previous || stars > previous.stars || (stars === previous.stars && time < previous.time)) {
            this.data.completedLevels[levelId] = { stars, time };
        }

        // 2. Avança Campanha (Destrava próximo)
        if (levelId === this.data.currentCampaignLevel && this.data.currentCampaignLevel < CAMPAIGN_MAX_LEVEL + 1) {
            this.data.currentCampaignLevel = Math.min(CAMPAIGN_MAX_LEVEL + 1, this.data.currentCampaignLevel + 1);
        }
        
        this.save();
    },

    // Helpers de Metaprogressão
    getKnowledgeLessonIndex(themeKey) {
        const progress = this.data.knowledgeProgress?.[themeKey];
        return Math.max(0, Number(progress?.nextLessonIndex) || 0);
    },

    completeKnowledgeLesson(themeKey, lessonIndex, totalLessons) {
        const nextLessonIndex = Math.min(totalLessons, lessonIndex + 1);
        const previous = this.data.knowledgeProgress?.[themeKey] || {};
        this.data.knowledgeProgress = {
            ...this.data.knowledgeProgress,
            [themeKey]: {
                ...previous,
                nextLessonIndex: Math.max(Number(previous.nextLessonIndex) || 0, nextLessonIndex),
                completed: nextLessonIndex >= totalLessons
            }
        };
        this.save();
        return this.data.knowledgeProgress[themeKey];
    },

    getPrimeEventProgress(eventId) {
        return this.data.primeEvents?.[eventId] || {
            bestTime: null,
            attempts: 0,
            lastTime: null,
            lastPlayedAt: null
        };
    },

    completePrimeEvent(eventId, timeSeconds) {
        const previous = this.getPrimeEventProgress(eventId);
        const bestTime = previous.bestTime == null
            ? timeSeconds
            : Math.min(previous.bestTime, timeSeconds);
        const result = {
            ...previous,
            bestTime,
            attempts: (Number(previous.attempts) || 0) + 1,
            lastTime: timeSeconds,
            lastPlayedAt: new Date().toISOString()
        };

        this.data.primeEvents = {
            ...this.data.primeEvents,
            [eventId]: result
        };
        this.save();
        return {
            ...result,
            isNewRecord: previous.bestTime == null || timeSeconds < previous.bestTime
        };
    },

    addXP(amount) {
        this.data.xp += amount;
        let leveledUp = false;
        while (this.data.xp >= this.getXPNeeded()) {
            const needed = this.getXPNeeded();
            this.data.xp -= needed;
            this.data.level++;
            leveledUp = true;
        }
        this.save();
        return leveledUp;
    },

    getLevel() { return this.data.level; },
    getCampaignLevel() { return this.data.currentCampaignLevel; },
    getCampaignMaxLevel() { return CAMPAIGN_MAX_LEVEL; },
    getXPPercent() { return (this.data.xp / this.getXPNeeded()) * 100; },
    getXPNeeded() { return 100 + (this.data.level * 50); }
};

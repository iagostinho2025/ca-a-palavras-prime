import { normalizeText } from './content-utils.js';

export function selectRandomWords(pool, count) {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export function getThemeParts(theme) {
    const parts = theme.title.trim().split(' ');
    const icon = parts.length > 1 ? parts.at(-1) : '\u{1F3AE}';
    const name = parts.length > 1 ? parts.slice(0, -1).join(' ') : theme.title;
    return { icon, name };
}

export function getWordsFromStory(story, limit = 10) {
    if (!story) return [];
    const text = normalizeText(story.text);
    return story.words
        .map((word) => normalizeText(word).replace(/[^A-Z]/g, ''))
        .filter((word) => word.length >= 3 && text.includes(word))
        .slice(0, limit);
}

export function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

export function formatWalletAmount(value) {
    const number = Math.max(0, Number(value) || 0);
    if (number >= 1000000) {
        const formatted = (number / 1000000).toFixed(number >= 10000000 ? 0 : 1);
        return `${formatted.replace('.0', '')}M`;
    }
    if (number >= 10000) return `${Math.floor(number / 1000)}K`;
    if (number >= 1000) return `${(number / 1000).toFixed(1).replace('.0', '')}K`;
    return String(number);
}

export function formatDuration(seconds) {
    if (seconds == null || !Number.isFinite(Number(seconds))) return '--:--';
    const total = Math.max(0, Math.floor(Number(seconds)));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
}

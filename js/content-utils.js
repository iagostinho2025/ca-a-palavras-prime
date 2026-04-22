export function repairMojibake(value) {
    const text = String(value ?? '');
    const mojibakePattern = /(?:\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]|\u00E2[\u0080-\u00BF]{1,2}|\u00F0[\u0080-\u00BF]{2,3})/;
    if (!mojibakePattern.test(text)) return text;
    try {
        const bytes = Uint8Array.from([...text].map((char) => char.charCodeAt(0) & 0xFF));
        return new TextDecoder('utf-8').decode(bytes);
    } catch {
        return text;
    }
}

export function normalizeText(value) {
    return repairMojibake(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
}

export function normalizeWord(value) {
    return normalizeText(value).replace(/[^A-Z]/g, '');
}

export function sanitizeWordList(words, { minLength = 2 } = {}) {
    const seen = new Set();
    return (Array.isArray(words) ? words : [])
        .map((word) => normalizeWord(word))
        .filter((word) => word.length >= minLength)
        .filter((word) => {
            if (seen.has(word)) return false;
            seen.add(word);
            return true;
        });
}

export function sanitizeLabel(value) {
    return repairMojibake(value).replace(/\s+/g, ' ').trim();
}

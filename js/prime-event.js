export const PRIME_EVENT = {
    id: 'prime-weekly-001',
    title: 'Evento Prime',
    themeTitle: 'Palavras de Elite',
    description: 'Um desafio competitivo fixo. Encontre tudo no menor tempo e tente bater seu recorde.',
    seed: 9142026,
    gridSize: 12,
    wordCount: 12,
    allowedDirections: ['all'],
    isActive: true,
    words: [
        'PRIME',
        'VELOZ',
        'FOCO',
        'RANKING',
        'RECORDE',
        'DESAFIO',
        'MESTRE',
        'VITORIA',
        'LOGICA',
        'CAMPEAO',
        'ENERGIA',
        'TROFEU'
    ]
};

export const PRIME_EVENT_RANKING = [
    { rank: 1, name: 'Luna', time: 78 },
    { rank: 2, name: 'Orion', time: 84 },
    { rank: 3, name: 'Maya', time: 91 },
    { rank: 4, name: 'Kai', time: 99 },
    { rank: 5, name: 'Nina', time: 108 },
    { rank: 6, name: 'Theo', time: 116 },
    { rank: 7, name: 'Iris', time: 124 },
    { rank: 8, name: 'Noah', time: 137 },
    { rank: 9, name: 'Zara', time: 149 },
    { rank: 10, name: 'Leo', time: 163 }
];

export function getPrimeEventConfig(event = PRIME_EVENT) {
    return {
        gridSize: event.gridSize,
        allowedDirections: event.allowedDirections,
        seed: event.seed,
        tier: 5
    };
}

export function getPrimeEventWords(event = PRIME_EVENT) {
    return [...event.words].slice(0, event.wordCount);
}

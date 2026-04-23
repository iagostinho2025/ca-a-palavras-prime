export const SETTINGS_KEY = 'wh_pro_settings_v1';
export const DEFAULT_PLAYER_NAME = 'Mestre das Palavras';
export const CAMPAIGN_MAX_LEVEL = 100;
export const AVATARS = Array.from(
    { length: 10 },
    (_, index) => `assets/images/avatar/avatar-${String(index + 1).padStart(2, '0')}.webp`
);

export const WORD_COLORS = [
    { start: '#7bd8a4', end: '#2f8f68', glow: 'rgba(47, 143, 104, 0.2)' },
    { start: '#f5c978', end: '#c78637', glow: 'rgba(199, 134, 55, 0.18)' },
    { start: '#8cc9e8', end: '#3f86b7', glow: 'rgba(63, 134, 183, 0.18)' },
    { start: '#dda0c8', end: '#a85c8e', glow: 'rgba(168, 92, 142, 0.16)' },
    { start: '#b7dc82', end: '#67984a', glow: 'rgba(103, 152, 74, 0.17)' },
    { start: '#e7c86d', end: '#a9792b', glow: 'rgba(169, 121, 43, 0.17)' },
    { start: '#92d6d9', end: '#3f969a', glow: 'rgba(63, 150, 154, 0.17)' },
    { start: '#e99a9a', end: '#b85f5f', glow: 'rgba(184, 95, 95, 0.16)' },
    { start: '#c8ace8', end: '#8b68b8', glow: 'rgba(139, 104, 184, 0.16)' },
    { start: '#88d8c8', end: '#3f9485', glow: 'rgba(63, 148, 133, 0.17)' }
];

export const KNOWLEDGE_WORD_COLORS = {
    biblical: [
        { start: '#7fdcff', end: '#3498db', glow: 'rgba(52, 152, 219, 0.24)' },
        { start: '#ff9ac1', end: '#d94f8a', glow: 'rgba(217, 79, 138, 0.22)' },
        { start: '#9d8cff', end: '#6d5bd8', glow: 'rgba(109, 91, 216, 0.22)' },
        { start: '#7ff0b3', end: '#2dbb73', glow: 'rgba(45, 187, 115, 0.22)' },
        { start: '#ff9f7a', end: '#e56a3e', glow: 'rgba(229, 106, 62, 0.22)' },
        { start: '#84e6e8', end: '#28a7b0', glow: 'rgba(40, 167, 176, 0.22)' },
        { start: '#c29bff', end: '#8d62db', glow: 'rgba(141, 98, 219, 0.22)' },
        { start: '#ff7f96', end: '#d9485f', glow: 'rgba(217, 72, 95, 0.22)' },
        { start: '#89e889', end: '#46b546', glow: 'rgba(70, 181, 70, 0.22)' },
        { start: '#8bc5ff', end: '#4a7fe0', glow: 'rgba(74, 127, 224, 0.22)' }
    ],
    civilizations: [
        { start: '#8fd3ef', end: '#3e8bb8', glow: 'rgba(62, 139, 184, 0.24)' },
        { start: '#e4bc72', end: '#b88231', glow: 'rgba(184, 130, 49, 0.22)' },
        { start: '#d98a6b', end: '#b45e3e', glow: 'rgba(180, 94, 62, 0.22)' },
        { start: '#b7c77b', end: '#7b8e44', glow: 'rgba(123, 142, 68, 0.22)' },
        { start: '#c1a0e8', end: '#8866b4', glow: 'rgba(136, 102, 180, 0.2)' },
        { start: '#8bd0c7', end: '#3e978a', glow: 'rgba(62, 151, 138, 0.22)' },
        { start: '#e6c389', end: '#bf8d41', glow: 'rgba(191, 141, 65, 0.2)' },
        { start: '#f0a07f', end: '#cb6d47', glow: 'rgba(203, 109, 71, 0.22)' },
        { start: '#a6c3e8', end: '#5b7fad', glow: 'rgba(91, 127, 173, 0.2)' },
        { start: '#d7d08a', end: '#9c9242', glow: 'rgba(156, 146, 66, 0.2)' }
    ],
    curiosities: [
        { start: '#76e7f7', end: '#23a9c2', glow: 'rgba(35, 169, 194, 0.24)' },
        { start: '#8cf0bf', end: '#2ebd7d', glow: 'rgba(46, 189, 125, 0.22)' },
        { start: '#c9f36f', end: '#7fbe2f', glow: 'rgba(127, 190, 47, 0.22)' },
        { start: '#ffb39e', end: '#e67c63', glow: 'rgba(230, 124, 99, 0.2)' },
        { start: '#a99aff', end: '#6e63de', glow: 'rgba(110, 99, 222, 0.22)' },
        { start: '#67d7ff', end: '#2f8fd4', glow: 'rgba(47, 143, 212, 0.22)' },
        { start: '#9af06e', end: '#56b63a', glow: 'rgba(86, 182, 58, 0.22)' },
        { start: '#ffe17a', end: '#d5a12c', glow: 'rgba(213, 161, 44, 0.2)' },
        { start: '#8debe0', end: '#2fae9d', glow: 'rgba(47, 174, 157, 0.22)' },
        { start: '#d59bff', end: '#965ce0', glow: 'rgba(150, 92, 224, 0.22)' }
    ],
    wonders: [
        { start: '#9be5d0', end: '#3a9b81', glow: 'rgba(58, 155, 129, 0.22)' },
        { start: '#efd88b', end: '#c29a3c', glow: 'rgba(194, 154, 60, 0.22)' },
        { start: '#8fd0e8', end: '#4b8faf', glow: 'rgba(75, 143, 175, 0.22)' },
        { start: '#d9b7f4', end: '#9a69c7', glow: 'rgba(154, 105, 199, 0.2)' },
        { start: '#b8db8d', end: '#749a4f', glow: 'rgba(116, 154, 79, 0.22)' },
        { start: '#f1be92', end: '#cb7d4a', glow: 'rgba(203, 125, 74, 0.2)' },
        { start: '#c6d88e', end: '#8ea249', glow: 'rgba(142, 162, 73, 0.2)' },
        { start: '#b6d0f5', end: '#6a90cc', glow: 'rgba(106, 144, 204, 0.2)' },
        { start: '#f5d7a0', end: '#c79a4a', glow: 'rgba(199, 154, 74, 0.2)' },
        { start: '#8fe0da', end: '#3ba79d', glow: 'rgba(59, 167, 157, 0.22)' }
    ]
};

export const BOARD_THEMES = [
    { id: 'auto', label: 'Autom\u00e1tico', note: 'Segue a fase', swatch: ['#8edfc7', '#6bb3d6'] },
    { id: 'tutorial', label: 'Tutorial', note: 'Claro e calmo', swatch: ['#c8f4dc', '#91d7ea'] },
    { id: 'easy', label: 'F\u00e1cil', note: 'Jardim vivo', swatch: ['#b8e986', '#4db6ac'] },
    { id: 'medium', label: 'M\u00e9dio', note: 'Lago sereno', swatch: ['#8cc9e8', '#3f86b7'] },
    { id: 'advanced', label: 'Avan\u00e7ado', note: 'Aurora profunda', swatch: ['#c8ace8', '#3f9485'] },
    { id: 'master', label: 'Mestre', note: 'Dourado premium', swatch: ['#f5c978', '#6e5a36'] }
];

export const BOARD_THEME_BY_TIER = {
    1: 'tutorial',
    2: 'easy',
    3: 'medium',
    4: 'advanced',
    5: 'master'
};

export const DEFAULT_SETTINGS = {
    sound: true,
    haptics: true,
    fontSize: 'normal',
    contrast: false,
    reduceMotion: false,
    avatar: AVATARS[0],
    playerName: DEFAULT_PLAYER_NAME,
    boardTheme: 'auto'
};

export const ACHIEVEMENTS = [
    { id: 'first-level', title: 'Primeira descoberta', description: 'Complete sua primeira fase.', metric: 'completedLevels', target: 1 },
    { id: 'ten-levels', title: 'Ritmo de explorador', description: 'Complete 10 fases da campanha.', metric: 'completedLevels', target: 10 },
    { id: 'half-campaign', title: 'Meio caminho', description: 'Chegue a 50 fases completas.', metric: 'completedLevels', target: 50 },
    { id: 'campaign-master', title: 'Mestre das palavras', description: 'Complete as 100 fases da campanha.', metric: 'completedLevels', target: 100 },
    { id: 'star-collector', title: 'Colecionador de estrelas', description: 'Some 75 estrelas na campanha.', metric: 'stars', target: 75 },
    { id: 'xp-hunter', title: 'Ca\u00e7ador dedicado', description: 'Alcance o n\u00edvel de jogador 10.', metric: 'playerLevel', target: 10 },
    { id: 'knowledge-path', title: 'Leitor atento', description: 'Conclua uma trilha do conhecimento.', metric: 'knowledgeCompleted', target: 1 }
];

export const SETTINGS_KEY = 'wh_pro_settings_v1';
export const DEFAULT_PLAYER_NAME = 'Mestre das Palavras';
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

/* js/themes.js */

import { sanitizeLabel, sanitizeWordList } from './content-utils.js';

const RAW_THEMES = {
    // --- TEMAS ORIGINAIS (REVISADOS) ---
    cinema: { 
        title: "Cinema 🎬", 
        color: "#f43f5e",
        words: [
            "MATRIX", "AVATAR", "TITANIC", "ROCKY", "ALIEN", "SHREK", "FROZEN", "MOANA", 
            "BATMAN", "CORINGA", "THOR", "HULK", "LOGAN", "XMEN", "DUNA", "BARBIE", 
            "TARZAN", "MULAN", "ALADDIN", "HERCULES", "RAMBO", "PREDADOR", "TOPGUN", 
            "GODZILLA", "MINIONS", "CARS", "TOYSTORY", "UP", "COCO", "ENCANTO", "SONIC", 
            "JUMANJI", "TROIA", "GLADIADOR", "OSCAR", "PIPOCA", "TELONA", "FILME", "ATOR"
        ]
    },
    tech: { 
        title: "Tech 💻", 
        color: "#3b82f6",
        words: [
            "PYTHON", "JAVA", "REACT", "HTML", "CSS", "DOCKER", "LINUX", "WINDOWS", 
            "ANDROID", "IPHONE", "APPLE", "GOOGLE", "AMAZON", "TESLA", "ROBO", "DRONE",
            "BITCOIN", "TOKEN", "WIFI", "MOUSE", "TECLADO", "TELA", "CHIP", "PIXEL", 
            "DADOS", "NUVEM", "CLOUD", "EMAIL", "SENHA", "LOGIN", "GAMES", "APP", 
            "SITE", "WEB", "CODIGO", "DEBUG", "BUG", "LOGICA", "MEMORIA", "DISCO"
        ]
    },
    animals: { 
        title: "Animais 🦁", 
        color: "#10b981",
        words: [
            "LEAO", "TIGRE", "ZEBRA", "URSO", "AGUIA", "GIRAFA", "PANDA", "COALA", 
            "JACARE", "COBRA", "SUCURI", "PITON", "SAPO", "TUBARAO", "BALEIA", "ORCA", 
            "POLVO", "LULA", "SIRI", "FOCA", "MORSA", "LOBO", "RAPOSA", "HIENA", 
            "GATO", "CACHORRO", "HAMSTER", "COELHO", "RATO", "CORUJA", "FALCAO", "GAVIAO", 
            "ARARA", "TUCANO", "MACACO", "GORILA", "ANTA", "TATU", "CAPIVARA", "PREGUICA"
        ]
    },
    history: { 
        title: "História 🏛️", 
        color: "#f59e0b",
        words: [
            "ROMA", "EGITO", "GRECIA", "IMPERIO", "REINO", "CASTELO", "TORRE", "TRONO", 
            "COROA", "ESPADA", "ESCUDO", "ARCO", "FLECHA", "LANCA", "CAPACETE", "ARMADURA", 
            "PIRATA", "NAVIO", "MAPA", "TESOURO", "MOEDA", "OURO", "PRATA", "VIKING", 
            "SAMURAI", "NINJA", "INDIO", "FARAO", "MUMIA", "PIRAMIDE", "ESFINGE", "CESAR", 
            "PAPIRO", "PEDRA", "FOGO", "RODA", "MUSEU", "ANTIGO", "TEMPLO", "DEUS"
        ]
    },

    // --- NOVOS TEMAS (OTIMIZADOS) ---
    worldcup: {
        title: "Copa ⚽",
        color: "#eab308", // Gold
        words: [
            "BRASIL", "FRANCA", "ITALIA", "ESPANHA", "CATAR", "RUSSIA", "SUECIA", "SUIÇA",
            "PELE", "MESSI", "NEYMAR", "RONALDO", "CAFU", "ZIDANE", "KAKA", "BEBETO", 
            "GOL", "TRAVE", "REDE", "BOLA", "CAMISA", "MEIA", "CHUTEIRA", "APITO", 
            "JUIZ", "TACA", "TORCIDA", "ESTADIO", "GRAMADO", "DRIBLE", "PASSE", "CHUTE", 
            "FALTA", "PENALTI", "TECNICO", "GOLEIRO", "ZAGUEIRO", "LATERAL", "ATAQUE"
        ]
    },
    geography: {
        title: "Geografia 🌎",
        color: "#0ea5e9", // Sky Blue
        words: [
            "AMERICA", "EUROPA", "ASIA", "AFRICA", "OCEANIA", "BRASIL", "EUA", "CHINA", 
            "RUSSIA", "INDIA", "JAPAO", "ITALIA", "FRANCA", "CANADA", "PERU", "CHILE", 
            "CUBA", "MEXICO", "PARIS", "ROMA", "TOKYO", "RIO", "BAHIA", "ANDES", "ALPES", 
            "NILO", "AMAZONAS", "VOLGA", "SENA", "MAR", "OCEANO", "RIO", "LAGO", "ILHA", 
            "DESERTO", "FLORESTA", "MONTANHA", "VULCAO", "VALE", "PRAIA"
        ]
    },
    objects: {
        title: "Objetos 🛋️",
        color: "#64748b", // Slate
        words: [
            "MESA", "CADEIRA", "SOFA", "CAMA", "PORTA", "JANELA", "TAPETE", "CORTINA", 
            "ESPELHO", "QUADRO", "VASO", "ABAJUR", "LAMPADA", "FOGAO", "FORNO", "PIA", 
            "RALO", "BALDE", "RODO", "VASSOURA", "PANO", "COPO", "PRATO", "GARFO", "FACA", 
            "COLHER", "XICARA", "JARRA", "PANELA", "BACIA", "ESPONJA", "SABAO", "ESCOVA", 
            "PENTE", "TOALHA", "LENCOL", "TRAVESSEIRO", "COBERTOR", "CHAVE", "MALA"
        ]
    },
    bible: {
        title: "Bíblia ✝️",
        color: "#8b5cf6", // Violet
        words: [
            "JESUS", "DEUS", "MARIA", "JOSE", "PEDRO", "PAULO", "JOAO", "MATEUS", "LUCAS", 
            "MARCOS", "MOISES", "ABRAAO", "ISAQUE", "JACO", "DAVI", "GOLIAS", "NOE", "ARCA", 
            "ADAO", "EVA", "EDEN", "CRUZ", "ANJO", "CEU", "AMOR", "PAZ", "LUZ", "FE", 
            "ORACAO", "JEJUM", "LOUVOR", "GLORIA", "GRACA", "VIDA", "SALMOS", "PROFETAS", 
            "REIS", "TEMPLO", "ALTAR", "OFERTA", "BIBLIA", "LIVRO"
        ]
    },
    universe: {
        title: "Universo 🪐",
        color: "#4c1d95", // Deep Purple
        words: [
            "SOL", "LUA", "TERRA", "MARTE", "VENUS", "JUPITER", "SATURNO", "URANO", "NETUNO", 
            "PLUTAO", "ESTRELA", "PLANETA", "GALAXIA", "COMETA", "METEORO", "COSMOS", "VACUO", 
            "ORBITA", "ECLIPSE", "ZODIACO", "INFINITO", "ESPACO", "TEMPO", "LUZ", "RAIO", 
            "NAVE", "FOGUETE", "ROBO", "SONDA", "RADAR", "ALIEN", "OVNI", "NASA", "CRATERA", 
            "POEIRA", "GAS", "GELO", "ROCHA", "ASTRO", "CEU"
        ]
    },
    cartoons: {
        title: "Desenhos 📺",
        color: "#ec4899", // Pink
        words: [
            "MICKEY", "MINNIE", "PLUTO", "PATETA", "DONALD", "SIMBA", "NALA", "TIMAO", "PUMBA", 
            "TOM", "JERRY", "SALSICHA", "FRED", "WILMA", "BARNEY", "BETTY", "PIKACHU", "ASH", 
            "GOKU", "VEGETA", "NARUTO", "SASUKE", "LUFFY", "ZORO", "NAMI", "SONIC", "TAILS", 
            "MARIO", "LUIGI", "PEACH", "TOAD", "SHREK", "FIONA", "BURRO", "PO", "TIGRESA", 
            "MANNY", "SID", "DIEGO", "ELSA", "ANNA", "OLAF"
        ]
    },
    games: {
        title: "Games 🎮",
        color: "#ef4444", // Red
        words: [
            "MARIO", "LUIGI", "PEACH", "YOSHI", "SONIC", "TAILS", "ZELDA", "LINK", "GANON", 
            "KIRBY", "SAMUS", "SNAKE", "RYU", "KEN", "CHUNLI", "GUILE", "SCORPION", "SUBZERO", 
            "RAIDEN", "KRATOS", "ATREUS", "JOEL", "ELLIE", "DRAKE", "ALOY", "DOOM", "HALO", 
            "TETRIS", "PACMAN", "SIMS", "FIFA", "PES", "ROBLOX", "FORTNITE", "MINECRAFT", 
            "STEVE", "ALEX", "ZUMBI", "CREEPER", "NOOB", "PRO", "SKIN", "MAPA"
        ]
    },
    art: {
        title: "Arte 🎨",
        color: "#d946ef", // Fuchsia
        words: [
            "TINTA", "TELA", "PINCEL", "COR", "LUZ", "SOMBRA", "FOTO", "FILME", "DANCA", 
            "TEATRO", "POESIA", "LIVRO", "MUSEU", "ARTE", "ARGILA", "PEDRA", "PAPEL", 
            "LAPIS", "GIZ", "OLEO", "CANETA", "TRACO", "FORMA", "LINHA", "PONTO", "PLANO", 
            "VOLUME", "RITMO", "SOM", "NOTA", "PALCO", "ATOR", "ATRIZ", "CENA", "DRAMA", 
            "COMEDIA", "OPERA", "BALLET", "JAZZ", "ROCK", "POP"
        ]
    },
    sports: {
        title: "Esportes 🏅",
        color: "#22c55e", // Green
        words: [
            "FUTEBOL", "VOLEI", "BASQUETE", "TENIS", "GOLF", "NATACAO", "CORRIDA", "SALTO", 
            "JUDO", "KARATE", "BOXE", "SKATE", "SURF", "REMOS", "RUGBY", "HOCKEY", "XADREZ", 
            "GOL", "CESTA", "PONTO", "REDE", "BOLA", "RAQUETE", "TACO", "CAMPO", "QUADRA", 
            "PISCINA", "TATAME", "RINGUE", "PISTA", "PODIO", "OURO", "PRATA", "BRONZE", 
            "RECORD", "ATLETA", "TIME", "JOGO", "MATCH", "SET"
        ]
    }
};

export const THEMES = Object.fromEntries(
    Object.entries(RAW_THEMES).map(([key, theme]) => [
        key,
        {
            ...theme,
            title: sanitizeLabel(theme.title),
            words: sanitizeWordList(theme.words, { minLength: 3 })
        }
    ])
);

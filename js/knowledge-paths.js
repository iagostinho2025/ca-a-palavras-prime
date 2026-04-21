import { repairMojibake, sanitizeLabel, sanitizeWordList } from './content-utils.js';

const RAW_KNOWLEDGE_THEMES = {
    biblical: {
        title: 'Bíblico',
        icon: '✦',
        color: '#7c5c2f',
        summary: 'Histórias curtas inspiradas em personagens, escolhas e acontecimentos marcantes da Bíblia.',
        lessons: [
            {
                title: 'Davi e Golias',
                text: 'No vale de Elá, Davi enfrentou Golias com coragem. O jovem levou uma funda, escolheu uma pedra lisa e confiou em Deus diante de um guerreiro experiente. A vitória mostrou que a fé pode vencer o medo quando o coração permanece firme e a coragem nasce da confiança.',
                words: ['DAVI', 'GOLIAS', 'VALE', 'FUNDA', 'PEDRA', 'DEUS', 'VITORIA', 'CORACAO', 'MEDO', 'CORAGEM']
            },
            {
                title: 'Noé e a arca',
                text: 'Noé construiu uma arca antes da chuva, mesmo quando ninguém via sinal de tempestade. Sua família entrou no barco com animais de muitas espécies, preservando a vida. Depois do dilúvio, o arco no céu lembrou uma aliança de cuidado e esperança para a terra.',
                words: ['NOE', 'ARCA', 'CHUVA', 'FAMILIA', 'BARCO', 'ANIMAIS', 'DILUVIO', 'ARCO', 'ALIANCA', 'CUIDADO']
            },
            {
                title: 'Moisés no deserto',
                text: 'Moisés guiou o povo pelo deserto depois da saída do Egito. Durante a jornada, a água, o maná e a lei ajudaram Israel a aprender confiança e obediência. Cada passo pelo caminho ensinava dependência, paciência e memória da promessa.',
                words: ['MOISES', 'POVO', 'DESERTO', 'JORNADA', 'AGUA', 'MANA', 'LEI', 'ISRAEL', 'CONFIANCA', 'OBEDIENCIA']
            },
            {
                title: 'Daniel na cova',
                text: 'Daniel foi levado para a cova dos leões por manter sua oração mesmo quando a lei do reino proibia. Durante a noite, um anjo fez guarda, e Daniel não sofreu mal diante dos leões nem do rei. A história valoriza fidelidade, coragem e integridade.',
                words: ['DANIEL', 'COVA', 'LEOES', 'ORACAO', 'NOITE', 'ANJO', 'GUARDA', 'MAL', 'SOFREU', 'REI']
            },
            {
                title: 'O bom samaritano',
                text: 'Na estrada entre Jerusalém e Jericó, um homem ferido recebeu ajuda de um samaritano. Ele usou óleo, vinho e cuidado para tratar as feridas. A parábola ensina que o próximo merece amor, mesmo quando ninguém espera bondade ou quando existe diferença entre povos.',
                words: ['ESTRADA', 'HOMEM', 'FERIDO', 'AJUDA', 'SAMARITANO', 'OLEO', 'VINHO', 'CUIDADO', 'PROXIMO', 'AMOR']
            }
        ]
    },
    civilizations: {
        title: 'Civilizações antigas',
        icon: '◆',
        color: '#a15d31',
        summary: 'Fatos sobre povos antigos, cidades, escrita, leis, ciência e formas de viver que moldaram a história.',
        lessons: [
            {
                title: 'Egito no Nilo',
                text: 'O Egito cresceu perto do rio Nilo, que funcionava como fonte de vida no deserto. As cheias deixavam a terra fértil para plantar trigo e organizar colheitas. Faraós, escribas e pirâmides marcaram essa civilização com registros, templos, poder religioso e conhecimento de engenharia.',
                words: ['EGITO', 'NILO', 'RIO', 'CHEIAS', 'TERRA', 'TRIGO', 'FARAOS', 'ESCRIBAS', 'PIRAMIDES', 'CIVILIZACAO']
            },
            {
                title: 'Roma e as estradas',
                text: 'Roma ligou províncias com estradas, pontes e leis, criando uma rede que facilitava comércio e comunicação. O exército protegia rotas, enquanto aquedutos levavam água para a cidade e mantinham a vida urbana organizada. Muitas soluções romanas influenciaram construções posteriores.',
                words: ['ROMA', 'PROVINCIAS', 'ESTRADAS', 'PONTES', 'LEIS', 'EXERCITO', 'ROTAS', 'AQUEDUTOS', 'AGUA', 'CIDADE']
            },
            {
                title: 'Gregos e polis',
                text: 'Na Grécia, a pólis reunia cidadãos para debates sobre leis, guerra e vida pública. Atenas valorizou teatro, filosofia e democracia, enquanto Esparta treinou disciplina militar para formar soldados resistentes. A cultura grega influenciou política, arte e educação por séculos.',
                words: ['GRECIA', 'POLIS', 'CIDADAOS', 'DEBATES', 'ATENAS', 'TEATRO', 'FILOSOFIA', 'DEMOCRACIA', 'ESPARTA', 'DISCIPLINA']
            },
            {
                title: 'Maias e astronomia',
                text: 'Os maias observaram o céu com cuidado e registraram ciclos naturais. Criaram calendário, templos e cidades, usando matemática e astronomia para acompanhar sol, lua e estrelas ao longo do tempo. Suas construções mostram planejamento, observação e conhecimento avançado.',
                words: ['MAIAS', 'CEU', 'CALENDARIO', 'TEMPLOS', 'CIDADES', 'MATEMATICA', 'SOL', 'LUA', 'ESTRELAS', 'ASTRONOMIA']
            },
            {
                title: 'Mesopotâmia escrita',
                text: 'Na Mesopotâmia, rios como Tigre e Eufrates ajudaram cidades a nascer em terras férteis. A escrita cuneiforme registrou comércio, leis e histórias em placas de argila usadas por escribas. Essa região preservou alguns dos registros urbanos mais antigos conhecidos.',
                words: ['MESOPOTAMIA', 'RIOS', 'TIGRE', 'EUFRATES', 'CIDADES', 'ESCRITA', 'CUNEIFORME', 'COMERCIO', 'LEIS', 'HISTORIAS']
            }
        ]
    },
    wonders: {
        title: 'Maravilhas do mundo',
        icon: '▲',
        color: '#2f7d68',
        summary: 'Viagens breves por monumentos famosos, grandes obras e lugares que guardam memória e beleza.',
        lessons: [
            {
                title: 'Muralha da China',
                text: 'A Muralha da China atravessa montanhas e desertos, ligando trechos construídos em diferentes períodos. Torres de vigilância ajudavam soldados a proteger caminhos, observar perigos e enviar sinais por longas distâncias. A obra revela estratégia, esforço coletivo e adaptação ao relevo.',
                words: ['MURALHA', 'CHINA', 'MONTANHAS', 'DESERTOS', 'TORRES', 'VIGILANCIA', 'SOLDADOS', 'PROTEGER', 'CAMINHOS', 'PERIGOS']
            },
            {
                title: 'Coliseu de Roma',
                text: 'O Coliseu de Roma recebeu jogos, público e grandes espetáculos em uma arena monumental. Seus arcos de pedra mostram engenharia forte, circulação planejada e domínio de materiais. Mesmo em ruínas, preserva a memória da cidade e da vida pública romana.',
                words: ['COLISEU', 'ROMA', 'JOGOS', 'PUBLICO', 'ESPETACULOS', 'ARCOS', 'PEDRA', 'ENGENHARIA', 'MEMORIA', 'CIDADE']
            },
            {
                title: 'Machu Picchu',
                text: 'Machu Picchu fica nas montanhas do Peru, acima de vales verdes e caminhos estreitos. A cidade inca tem terraços, templos e caminhos de pedra que ajudavam na agricultura e na circulação. O lugar revela planejamento, beleza e respeito ao relevo natural.',
                words: ['MACHU', 'PICCHU', 'MONTANHAS', 'PERU', 'CIDADE', 'INCA', 'TERRACOS', 'TEMPLOS', 'CAMINHOS', 'VALES']
            },
            {
                title: 'Petra no deserto',
                text: 'Petra surgiu entre rochas do deserto, em uma região de passagem comercial. Fachadas esculpidas, tumbas e canais de água revelam a habilidade dos nabateus para viver em ambiente difícil. A cidade combinava arte, comércio e controle inteligente de recursos.',
                words: ['PETRA', 'ROCHAS', 'DESERTO', 'FACHADAS', 'TUMBAS', 'CANAIS', 'AGUA', 'HABILIDADE', 'NABATEUS', 'ESCULPIDAS']
            },
            {
                title: 'Taj Mahal',
                text: 'O Taj Mahal foi feito em mármore claro, com detalhes delicados e grande equilíbrio visual. Jardins, cúpulas e reflexos na água formam um monumento de amor na Índia. A obra é admirada pela simetria, pela decoração e pelo cuidado com a paisagem.',
                words: ['TAJ', 'MAHAL', 'MARMORE', 'JARDINS', 'CUPULAS', 'REFLEXOS', 'AGUA', 'MONUMENTO', 'AMOR', 'INDIA']
            }
        ]
    },
    curiosities: {
        title: 'Curiosidades',
        icon: '?',
        color: '#3f78b5',
        summary: 'Pequenas descobertas sobre natureza, ciência, animais e fenômenos que despertam perguntas.',
        lessons: [
            {
                title: 'Polvo inteligente',
                text: 'O polvo tem cérebro complexo e usa tentáculos para explorar objetos, fendas e alimentos. Esse animal inteligente muda cor, abre potes e se esconde entre pedras para se proteger. Muitos polvos aprendem rápido e resolvem problemas com grande flexibilidade.',
                words: ['POLVO', 'CEREBRO', 'TENTACULOS', 'EXPLORAR', 'MUDA', 'COR', 'POTES', 'ESCONDE', 'PEDRAS', 'INTELIGENTE']
            },
            {
                title: 'Abelhas dançam',
                text: 'Abelhas usam uma dança para indicar flores ricas em alimento. O movimento mostra direção, distância e ajuda a colmeia a encontrar néctar com mais precisão. Essa comunicação coletiva permite economizar energia e manter a sobrevivência do grupo.',
                words: ['ABELHAS', 'DANCA', 'FLORES', 'MOVIMENTO', 'DIRECAO', 'DISTANCIA', 'COLMEIA', 'NECTAR', 'AJUDA', 'ENCONTRAR']
            },
            {
                title: 'Relâmpago quente',
                text: 'Um relâmpago aquece o ar muito rápido e pode ficar extremamente quente. A expansão brusca cria o trovão, enquanto a luz chega antes do som porque viaja mais depressa. Observar esse intervalo ajuda a estimar a distância da tempestade.',
                words: ['RELAMPAGO', 'AQUECE', 'EXTREMAMENTE', 'RAPIDO', 'EXPANSAO', 'TROVAO', 'LUZ', 'SOM', 'ANTES', 'QUENTE']
            },
            {
                title: 'Oceano profundo',
                text: 'No oceano profundo existe pouca luz e a temperatura costuma ser baixa. Peixes, lulas e corais vivem sob pressão alta, usando brilho para comunicar, atrair presas ou encontrar alimento. Esse ambiente mostra como a vida se adapta a extremos.',
                words: ['OCEANO', 'PROFUNDO', 'LUZ', 'PEIXES', 'LULAS', 'CORAIS', 'PRESSAO', 'ALTA', 'BRILHO', 'COMUNICAR']
            },
            {
                title: 'Bambu veloz',
                text: 'Alguns bambus crescem muito rápido em poucos dias, principalmente em clima favorável. Suas hastes leves e resistentes servem para casas, papel e alimento em muitas regiões. Por crescer depressa, o bambu também é estudado como material renovável.',
                words: ['BAMBUS', 'CRESCEM', 'RAPIDO', 'DIAS', 'HASTES', 'LEVES', 'RESISTENTES', 'CASAS', 'PAPEL', 'ALIMENTO']
            }
        ]
    }
};

export const KNOWLEDGE_THEMES = Object.fromEntries(
    Object.entries(RAW_KNOWLEDGE_THEMES).map(([key, theme]) => [
        key,
        {
            ...theme,
            title: sanitizeLabel(theme.title),
            icon: repairMojibake(theme.icon),
            summary: repairMojibake(theme.summary),
            lessons: theme.lessons.map((lesson) => ({
                ...lesson,
                title: sanitizeLabel(lesson.title),
                text: repairMojibake(lesson.text),
                words: sanitizeWordList(lesson.words, { minLength: 3 })
            }))
        }
    ])
);

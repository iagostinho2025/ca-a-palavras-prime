import { repairMojibake, sanitizeLabel, sanitizeWordList } from './content-utils.js';

const RAW_KNOWLEDGE_THEMES = {
    biblical: {
        title: 'B\u00edblico',
        icon: '\u2726',
        color: '#7c5c2f',
        summary: 'Hist\u00f3rias curtas inspiradas em personagens, escolhas e acontecimentos marcantes da B\u00edblia.',
        lessons: [
            {
                title: 'Davi e Golias',
                text: 'No vale de El\u00e1, Davi enfrentou Golias com coragem. O jovem levou uma funda, escolheu uma pedra lisa e confiou em Deus diante de um guerreiro experiente. A vit\u00f3ria mostrou que a f\u00e9 pode vencer o medo quando o cora\u00e7\u00e3o permanece firme e a coragem nasce da confian\u00e7a.',
                words: ['DAVI', 'GOLIAS', 'VALE', 'FUNDA', 'PEDRA', 'DEUS', 'VITORIA', 'CORACAO', 'MEDO', 'CORAGEM']
            },
            {
                title: 'No\u00e9 e a arca',
                text: 'No\u00e9 construiu uma arca antes da chuva, mesmo quando ningu\u00e9m via sinal de tempestade. Sua fam\u00edlia entrou no barco com animais de muitas esp\u00e9cies, preservando a vida. Depois do dil\u00favio, o arco no c\u00e9u lembrou uma alian\u00e7a de cuidado e esperan\u00e7a para a terra.',
                words: ['NOE', 'ARCA', 'CHUVA', 'FAMILIA', 'BARCO', 'ANIMAIS', 'DILUVIO', 'ARCO', 'ALIANCA', 'CUIDADO']
            },
            {
                title: 'Mois\u00e9s no deserto',
                text: 'Mois\u00e9s guiou o povo pelo deserto depois da sa\u00edda do Egito. Durante a jornada, a \u00e1gua, o man\u00e1 e a lei ajudaram Israel a aprender confian\u00e7a e obedi\u00eancia. Cada passo pelo caminho ensinava depend\u00eancia, paci\u00eancia e mem\u00f3ria da promessa.',
                words: ['MOISES', 'POVO', 'DESERTO', 'JORNADA', 'AGUA', 'MANA', 'LEI', 'ISRAEL', 'CONFIANCA', 'OBEDIENCIA']
            },
            {
                title: 'Daniel na cova',
                text: 'Daniel foi levado para a cova dos le\u00f5es por manter sua ora\u00e7\u00e3o mesmo quando a lei do reino proibia. Durante a noite, um anjo fez guarda, e Daniel n\u00e3o sofreu mal diante dos le\u00f5es nem do rei. A hist\u00f3ria valoriza fidelidade, coragem e integridade.',
                words: ['DANIEL', 'COVA', 'LEOES', 'ORACAO', 'NOITE', 'ANJO', 'GUARDA', 'MAL', 'SOFREU', 'REI']
            },
            {
                title: 'O bom samaritano',
                text: 'Na estrada entre Jerusal\u00e9m e Jeric\u00f3, um homem ferido recebeu ajuda de um samaritano. Ele usou \u00f3leo, vinho e cuidado para tratar as feridas. A par\u00e1bola ensina que o pr\u00f3ximo merece amor, mesmo quando ningu\u00e9m espera bondade ou quando existe diferen\u00e7a entre povos.',
                words: ['ESTRADA', 'HOMEM', 'FERIDO', 'AJUDA', 'SAMARITANO', 'OLEO', 'VINHO', 'CUIDADO', 'PROXIMO', 'AMOR']
            }
        ]
    },
    civilizations: {
        title: 'Civiliza\u00e7\u00f5es antigas',
        icon: '\u25C6',
        color: '#a15d31',
        summary: 'Fatos sobre povos antigos, cidades, escrita, leis, ci\u00eancia e formas de viver que moldaram a hist\u00f3ria.',
        lessons: [
            {
                title: 'Egito no Nilo',
                text: 'O Egito cresceu perto do rio Nilo, que funcionava como fonte de vida no deserto. As cheias deixavam a terra f\u00e9rtil para plantar trigo e organizar colheitas. Fara\u00f3s, escribas e pir\u00e2mides marcaram essa civiliza\u00e7\u00e3o com registros, templos, poder religioso e conhecimento de engenharia.',
                words: ['EGITO', 'NILO', 'RIO', 'CHEIAS', 'TERRA', 'TRIGO', 'FARAOS', 'ESCRIBAS', 'PIRAMIDES', 'CIVILIZACAO']
            },
            {
                title: 'Roma e as estradas',
                text: 'Roma ligou prov\u00edncias com estradas, pontes e leis, criando uma rede que facilitava com\u00e9rcio e comunica\u00e7\u00e3o. O ex\u00e9rcito protegia rotas, enquanto aquedutos levavam \u00e1gua para a cidade e mantinham a vida urbana organizada. Muitas solu\u00e7\u00f5es romanas influenciaram constru\u00e7\u00f5es posteriores.',
                words: ['ROMA', 'PROVINCIAS', 'ESTRADAS', 'PONTES', 'LEIS', 'EXERCITO', 'ROTAS', 'AQUEDUTOS', 'AGUA', 'CIDADE']
            },
            {
                title: 'Gregos e polis',
                text: 'Na Gr\u00e9cia, a p\u00f3lis reunia cidad\u00e3os para debates sobre leis, guerra e vida p\u00fablica. Atenas valorizou teatro, filosofia e democracia, enquanto Esparta treinou disciplina militar para formar soldados resistentes. A cultura grega influenciou pol\u00edtica, arte e educa\u00e7\u00e3o por s\u00e9culos.',
                words: ['GRECIA', 'POLIS', 'CIDADAOS', 'DEBATES', 'ATENAS', 'TEATRO', 'FILOSOFIA', 'DEMOCRACIA', 'ESPARTA', 'DISCIPLINA']
            },
            {
                title: 'Maias e astronomia',
                text: 'Os maias observaram o c\u00e9u com cuidado e registraram ciclos naturais. Criaram calend\u00e1rio, templos e cidades, usando matem\u00e1tica e astronomia para acompanhar sol, lua e estrelas ao longo do tempo. Suas constru\u00e7\u00f5es mostram planejamento, observa\u00e7\u00e3o e conhecimento avan\u00e7ado.',
                words: ['MAIAS', 'CEU', 'CALENDARIO', 'TEMPLOS', 'CIDADES', 'MATEMATICA', 'SOL', 'LUA', 'ESTRELAS', 'ASTRONOMIA']
            },
            {
                title: 'Mesopot\u00e2mia escrita',
                text: 'Na Mesopot\u00e2mia, rios como Tigre e Eufrates ajudaram cidades a nascer em terras f\u00e9rteis. A escrita cuneiforme registrou com\u00e9rcio, leis e hist\u00f3rias em placas de argila usadas por escribas. Essa regi\u00e3o preservou alguns dos registros urbanos mais antigos conhecidos.',
                words: ['MESOPOTAMIA', 'RIOS', 'TIGRE', 'EUFRATES', 'CIDADES', 'ESCRITA', 'CUNEIFORME', 'COMERCIO', 'LEIS', 'HISTORIAS']
            }
        ]
    },
    wonders: {
        title: 'Maravilhas do mundo',
        icon: '\u25B2',
        color: '#2f7d68',
        summary: 'Viagens breves por monumentos famosos, grandes obras e lugares que guardam mem\u00f3ria e beleza.',
        lessons: [
            {
                title: 'Muralha da China',
                text: 'A Muralha da China atravessa montanhas e desertos, ligando trechos constru\u00eddos em diferentes per\u00edodos. Torres de vigil\u00e2ncia ajudavam soldados a proteger caminhos, observar perigos e enviar sinais por longas dist\u00e2ncias. A obra revela estrat\u00e9gia, esfor\u00e7o coletivo e adapta\u00e7\u00e3o ao relevo.',
                words: ['MURALHA', 'CHINA', 'MONTANHAS', 'DESERTOS', 'TORRES', 'VIGILANCIA', 'SOLDADOS', 'PROTEGER', 'CAMINHOS', 'PERIGOS']
            },
            {
                title: 'Coliseu de Roma',
                text: 'O Coliseu de Roma recebeu jogos, p\u00fablico e grandes espet\u00e1culos em uma arena monumental. Seus arcos de pedra mostram engenharia forte, circula\u00e7\u00e3o planejada e dom\u00ednio de materiais. Mesmo em ru\u00ednas, preserva a mem\u00f3ria da cidade e da vida p\u00fablica romana.',
                words: ['COLISEU', 'ROMA', 'JOGOS', 'PUBLICO', 'ESPETACULOS', 'ARCOS', 'PEDRA', 'ENGENHARIA', 'MEMORIA', 'CIDADE']
            },
            {
                title: 'Machu Picchu',
                text: 'Machu Picchu fica nas montanhas do Peru, acima de vales verdes e caminhos estreitos. A cidade inca tem terra\u00e7os, templos e caminhos de pedra que ajudavam na agricultura e na circula\u00e7\u00e3o. O lugar revela planejamento, beleza e respeito ao relevo natural.',
                words: ['MACHU', 'PICCHU', 'MONTANHAS', 'PERU', 'CIDADE', 'INCA', 'TERRACOS', 'TEMPLOS', 'CAMINHOS', 'VALES']
            },
            {
                title: 'Petra no deserto',
                text: 'Petra surgiu entre rochas do deserto, em uma regi\u00e3o de passagem comercial. Fachadas esculpidas, tumbas e canais de \u00e1gua revelam a habilidade dos nabateus para viver em ambiente dif\u00edcil. A cidade combinava arte, com\u00e9rcio e controle inteligente de recursos.',
                words: ['PETRA', 'ROCHAS', 'DESERTO', 'FACHADAS', 'TUMBAS', 'CANAIS', 'AGUA', 'HABILIDADE', 'NABATEUS', 'ESCULPIDAS']
            },
            {
                title: 'Taj Mahal',
                text: 'O Taj Mahal foi feito em m\u00e1rmore claro, com detalhes delicados e grande equil\u00edbrio visual. Jardins, c\u00fapulas e reflexos na \u00e1gua formam um monumento de amor na \u00cdndia. A obra \u00e9 admirada pela simetria, pela decora\u00e7\u00e3o e pelo cuidado com a paisagem.',
                words: ['TAJ', 'MAHAL', 'MARMORE', 'JARDINS', 'CUPULAS', 'REFLEXOS', 'AGUA', 'MONUMENTO', 'AMOR', 'INDIA']
            }
        ]
    },
    curiosities: {
        title: 'Curiosidades',
        icon: '?',
        color: '#3f78b5',
        summary: 'Pequenas descobertas sobre natureza, ci\u00eancia, animais e fen\u00f4menos que despertam perguntas.',
        lessons: [
            {
                title: 'Polvo inteligente',
                text: 'O polvo tem c\u00e9rebro complexo e usa tent\u00e1culos para explorar objetos, fendas e alimentos. Esse animal inteligente muda cor, abre potes e se esconde entre pedras para se proteger. Muitos polvos aprendem r\u00e1pido e resolvem problemas com grande flexibilidade.',
                words: ['POLVO', 'CEREBRO', 'TENTACULOS', 'EXPLORAR', 'MUDA', 'COR', 'POTES', 'ESCONDE', 'PEDRAS', 'INTELIGENTE']
            },
            {
                title: 'Abelhas dan\u00e7am',
                text: 'Abelhas usam uma dan\u00e7a para indicar flores ricas em alimento. O movimento mostra dire\u00e7\u00e3o, dist\u00e2ncia e ajuda a colmeia a encontrar n\u00e9ctar com mais precis\u00e3o. Essa comunica\u00e7\u00e3o coletiva permite economizar energia e manter a sobreviv\u00eancia do grupo.',
                words: ['ABELHAS', 'DANCA', 'FLORES', 'MOVIMENTO', 'DIRECAO', 'DISTANCIA', 'COLMEIA', 'NECTAR', 'AJUDA', 'ENCONTRAR']
            },
            {
                title: 'Rel\u00e2mpago quente',
                text: 'Um rel\u00e2mpago aquece o ar muito r\u00e1pido e pode ficar extremamente quente. A expans\u00e3o brusca cria o trov\u00e3o, enquanto a luz chega antes do som porque viaja mais depressa. Observar esse intervalo ajuda a estimar a dist\u00e2ncia da tempestade.',
                words: ['RELAMPAGO', 'AQUECE', 'EXTREMAMENTE', 'RAPIDO', 'EXPANSAO', 'TROVAO', 'LUZ', 'SOM', 'ANTES', 'QUENTE']
            },
            {
                title: 'Oceano profundo',
                text: 'No oceano profundo existe pouca luz e a temperatura costuma ser baixa. Peixes, lulas e corais vivem sob press\u00e3o alta, usando brilho para comunicar, atrair presas ou encontrar alimento. Esse ambiente mostra como a vida se adapta a extremos.',
                words: ['OCEANO', 'PROFUNDO', 'LUZ', 'PEIXES', 'LULAS', 'CORAIS', 'PRESSAO', 'ALTA', 'BRILHO', 'COMUNICAR']
            },
            {
                title: 'Bambu veloz',
                text: 'Alguns bambus crescem muito r\u00e1pido em poucos dias, principalmente em clima favor\u00e1vel. Suas hastes leves e resistentes servem para casas, papel e alimento em muitas regi\u00f5es. Por crescer depressa, o bambu tamb\u00e9m \u00e9 estudado como material renov\u00e1vel.',
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

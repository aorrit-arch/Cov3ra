/* =============================================================
   COVERA — app.js
   Funcionalitat completa del sistema:
   - Menubar Fitxer/Edita/Visualitza/Ajuda amb dropdowns reals
   - Barra navegador amb ← → i breadcrumb dinàmic + historial
   - Cerca amb índex (autocomplete real)
   - Fitxes de producte (37 productes a la base de dades)
   - Documents (Manifest, Sobre, FAQ, Legal, Com diagnòstic, Guia)
   - Diagnòstic multi-pas
   - Cotitzador col·lectius amb càlcul real
   - Drecera de teclat: 0-5 carpetes · D/C/P/R/M eines · ⌘F cerca · Esc
   ============================================================= */

'use strict';

/* =====================================================
   1. DADES — Seccions, productes, docs, cerca
   ===================================================== */

const SECTION_LABELS = {
  inici: 'Inici',
  persones: 'Persones i famílies',
  autonoms: 'Autònoms',
  empreses: 'Empreses',
  collectius: 'Col·lectius',
  previsio: 'Previsió assegurada',
  diagnostic: 'Diagnòstic',
  cotitzador: 'Cotitzador',
  productes: 'Productes',
  metode: 'Mètode',
  recursos: 'Recursos'
};

const FOLDER_SECTIONS = ['inici', 'persones', 'autonoms', 'empreses', 'collectius', 'previsio'];

/* =====================================================
   2. BASE DE DADES DE PRODUCTES (37 fitxes)
   ===================================================== */

const PRODUCTS = {
  // ─── Protecció d'ingressos ───
  'ilt': {
    name: 'ILT / Baixa laboral',
    intent: 'Protegir la teva capacitat de generar ingressos quan no pots treballar.',
    audience: 'Autònoms, professionals liberals i directius que depenen dels seus ingressos.',
    covers: ['Baixa per malaltia comuna o accident', 'Indemnització diària o capital', 'Hospitalització i convalescència', 'Cobertura per intervencions quirúrgiques'],
    review: ['Quants dies podries aguantar sense facturar?', 'Quina cobertura tens via la SS o mutualitat?', 'Quina despesa fixa has de cobrir cada mes?', 'Quins ingressos vols garantir?'],
    folders: ['Autònoms', 'Empreses (directius)'],
    related: ['indemnitzacio', 'accidents', 'malalties-greus', 'incapacitat'],
    cta: 'autonoms'
  },
  'indemnitzacio': {
    name: 'Indemnització diària',
    intent: 'Cobrar una quantitat fixa per cada dia de baixa.',
    audience: 'Autònoms i professionals que volen un complement net diari quan no facturen.',
    covers: ['Indemnització diària pactada des del primer dia o franquícia curta', 'Per malaltia, accident o ambdues', 'Compatible amb la prestació de la mutualitat'],
    review: ['Quant necessites cobrar al dia per cobrir despeses?', 'Vols franquícia de 0, 7, 15 o 30 dies?', 'Vols incloure malaltia o només accident?'],
    folders: ['Autònoms'],
    related: ['ilt', 'accidents', 'hospitalitzacio'],
    cta: 'autonoms'
  },
  'malalties-greus': {
    name: 'Malalties greus',
    intent: 'Rebre un capital quan es diagnostica una malaltia greu coberta.',
    audience: 'Persones amb família, autònoms i directius que volen una xarxa de seguretat addicional.',
    covers: ['Càncer, infart, ictus i altres malalties greus segons condicionat', 'Capital únic per a despeses extres', 'Compatible amb vida risc i ILT'],
    review: ['Tens estalvis per fer front a uns mesos sense ingressos?', 'Hi ha antecedents familiars rellevants?', 'Necessites cobrir despeses no mèdiques (cuidadors, adaptació de la llar)?'],
    folders: ['Persones', 'Autònoms'],
    related: ['vida-risc', 'ilt', 'incapacitat'],
    cta: 'diagnostic'
  },
  'incapacitat': {
    name: 'Incapacitat permanent',
    intent: 'Capital o renda si quedes incapacitat permanentment per treballar.',
    audience: 'Autònoms, professionals i directius amb dependents econòmics.',
    covers: ['Capital únic en cas d\'incapacitat permanent total o absoluta', 'Possible renda mensual complementària', 'Combinable amb vida risc'],
    review: ['Quin capital necessitaria la família si no poguessis tornar a treballar mai?', 'Quin grau d\'incapacitat vols cobrir?'],
    folders: ['Autònoms', 'Persones'],
    related: ['ilt', 'malalties-greus', 'vida-risc'],
    cta: 'diagnostic'
  },
  'hospitalitzacio': {
    name: 'Hospitalització',
    intent: 'Indemnització per cada dia hospitalitzat.',
    audience: 'Persones, famílies, autònoms amb ingressos exposats.',
    covers: ['Diària per dia d\'ingrés hospitalari', 'Combinable amb ILT i salut'],
    review: ['Tens cobertura per dies d\'ingrés?', 'Quina diària necessitaries per mantenir el ritme?'],
    folders: ['Autònoms', 'Persones'],
    related: ['ilt', 'salut-individual', 'accidents'],
    cta: 'diagnostic'
  },

  // ─── Salut ───
  'salut-individual': {
    name: 'Salut individual',
    intent: 'Accés ràpid a especialistes, proves i hospital privat.',
    audience: 'Persones que volen evitar llistes d\'espera o tenir més control sanitari.',
    covers: ['Quadre mèdic privat', 'Proves diagnòstiques', 'Hospitalització quirúrgica i mèdica', 'Possible reemborsament de despeses'],
    review: ['Tens edat o antecedents que poden encarir més endavant?', 'Vols quadre mèdic, reemborsament o mixt?', 'Quins especialistes necessites especialment?'],
    folders: ['Persones', 'Autònoms'],
    related: ['salut-familiar', 'hospitalitzacio', 'malalties-greus'],
    cta: 'persones'
  },
  'salut-familiar': {
    name: 'Salut familiar',
    intent: 'Salut privada per a tota la família amb condicions agrupades.',
    audience: 'Famílies amb fills, parelles que volen un sol contracte.',
    covers: ['Tots els membres en una pòlissa amb condicions homogènies', 'Pediatria, especialistes, urgències, hospital', 'Possibles complements (dental, viatge)'],
    review: ['Tots tenen necessitats similars o algun perfil clínic concret?', 'Voleu pediatria reforçada?', 'Quina franquícia us encaixa?'],
    folders: ['Persones'],
    related: ['salut-individual', 'dependencia', 'decessos'],
    cta: 'persones'
  },
  'salut-collectiva': {
    name: 'Salut col·lectiva',
    intent: 'Salut privada per a l\'equip com a benefici social.',
    audience: 'Empreses des de 5 treballadors que volen cuidar i fidelitzar persones.',
    covers: ['Salut per a tota la plantilla o col·lectius elegits', 'Possibilitat de famílies i parelles', 'Optimització fiscal (retribució en espècie)'],
    review: ['Quin percentatge paga l\'empresa i quin l\'empleat?', 'És obligatori per a tothom o voluntari?', 'Quina franquícia/quadre escau?'],
    folders: ['Empreses'],
    related: ['accidents-conveni', 'vida-collectiu', 'retribucio-flexible'],
    cta: 'empreses'
  },

  // ─── Vida i família ───
  'vida-risc': {
    name: 'Vida risc',
    intent: 'Capital per a la família si tu falten.',
    audience: 'Persones amb dependents econòmics, hipoteca o compromisos llargs.',
    covers: ['Capital per defunció', 'Possibles cobertures de invalidesa, malalties greus', 'Designació lliure de beneficiaris'],
    review: ['Quin capital necessitaria la família per mantenir el ritme?', 'Hipoteca pendent + anys d\'escola + necessitats imprevistes?', 'Els beneficiaris són els que vols i tens dades correctes?'],
    folders: ['Persones', 'Autònoms'],
    related: ['vida-hipoteca', 'malalties-greus', 'beneficiaris', 'planificacio'],
    cta: 'persones'
  },
  'vida-hipoteca': {
    name: 'Vida hipoteca',
    intent: 'Vida lligada a la hipoteca — però lluny de l\'oferta del banc.',
    audience: 'Persones amb hipoteca que volen evitar pagar de més o veure que el banc cobra primer.',
    covers: ['Capital decreixent o constant per cobrir la hipoteca', 'Designació de beneficiaris (la família, no només el banc)', 'Possible cessió de drets parcial'],
    review: ['Pagues la vida del banc? Sovint hi ha alternatives més barates.', 'Vols que el capital extra arribi a la família si supera el deute?', 'Has revisat l\'opció de vida risc separada?'],
    folders: ['Persones'],
    related: ['vida-risc', 'beneficiaris', 'planificacio'],
    cta: 'persones'
  },
  'accidents': {
    name: 'Accidents',
    intent: 'Capital o renda en cas d\'accident amb conseqüències.',
    audience: 'Persones actives, autònoms, professionals en mobilitat.',
    covers: ['Defunció per accident', 'Invalidesa permanent', 'Assistència sanitària', 'Indemnització diària opcional'],
    review: ['Què cobreix la mútua/SS i què queda fora?', 'Vols incloure cobertura 24h o només laboral?'],
    folders: ['Persones', 'Autònoms', 'Empreses'],
    related: ['ilt', 'accidents-conveni', 'malalties-greus'],
    cta: 'diagnostic'
  },
  'dependencia': {
    name: 'Dependència',
    intent: 'Renda o capital si necessites assistència per a la vida diària.',
    audience: 'Persones de 50+ i famílies amb pares dependents.',
    covers: ['Renda mensual o capital únic en cas de dependència', 'Possible servei d\'assistència', 'Combinable amb estalvi'],
    review: ['Hi ha històric familiar?', 'Vols cobrir tu mateix o un familiar?', 'Renda o capital?'],
    folders: ['Persones', 'Previsió'],
    related: ['vida-estalvi', 'decessos', 'planificacio'],
    cta: 'persones'
  },
  'decessos': {
    name: 'Decessos',
    intent: 'Cobrir el servei funerari i la gestió del moment difícil.',
    audience: 'Persones que volen evitar la càrrega administrativa i econòmica a la família.',
    covers: ['Servei funerari complet', 'Possibles complements (testament, gestions, repatriació)'],
    review: ['Volen la família encarregar-se de tota la gestió?', 'Hi ha alguna preferència de servei?'],
    folders: ['Persones'],
    related: ['vida-risc', 'planificacio', 'liquiditat'],
    cta: 'persones'
  },

  // ─── Empresa i conveni ───
  'accidents-conveni': {
    name: 'Accidents de conveni',
    intent: 'Compliment obligatori del conveni col·lectiu aplicable.',
    audience: 'Empreses amb conveni que obliga a assegurar accidents laborals.',
    covers: ['Capitals per defunció i invalidesa segons conveni', 'Regularització de plantilla', 'Cobertura 24h opcional'],
    review: ['Quin és el conveni aplicable i quins capitals exigeix?', 'Tens la plantilla declarada correctament?', 'Has revisat actualitzacions de capitals?'],
    folders: ['Empreses'],
    related: ['vida-collectiu', 'salut-collectiva', 'business-travel'],
    cta: 'empreses'
  },
  'vida-collectiu': {
    name: 'Vida col·lectiu',
    intent: 'Capital per defunció/invalidesa per a tota o part de la plantilla.',
    audience: 'Empreses que volen oferir un benefici social significatiu.',
    covers: ['Capital uniforme o per categoria', 'Possible inclusió de malalties greus', 'Compatible amb vida individual'],
    review: ['És obligatori o voluntari?', 'Quins capitals encaixen amb la cultura de l\'empresa?'],
    folders: ['Empreses'],
    related: ['accidents-conveni', 'salut-collectiva', 'ppse'],
    cta: 'empreses'
  },
  'ilt-directius': {
    name: 'ILT directius',
    intent: 'Protecció de baixa laboral específica per a directius i alts càrrecs.',
    audience: 'Empreses que volen cobrir bé persones clau.',
    covers: ['Capital o indemnització diària superior', 'Cobertura per malaltia comuna i accident', 'Tractament fiscal específic'],
    review: ['Qui són els perfils crítics?', 'Quina substitució seria costosa?'],
    folders: ['Empreses'],
    related: ['home-clau', 'socis', 'ilt'],
    cta: 'empreses'
  },
  'home-clau': {
    name: 'Home/dona clau',
    intent: 'Protegir l\'empresa si una persona crítica falta o queda incapacitada.',
    audience: 'Empreses on una persona genera valor o coneixement difícil de reemplaçar.',
    covers: ['Capital per a l\'empresa (no per a la persona) si la persona clau falta', 'Cobreix pèrdua de facturació, substitució, transició'],
    review: ['Qui és imprescindible avui?', 'Quan duraria la transició si faltés?'],
    folders: ['Empreses'],
    related: ['socis', 'ilt-directius', 'vida-collectiu'],
    cta: 'empreses'
  },
  'socis': {
    name: 'Assegurança de socis',
    intent: 'Liquiditat per comprar les participacions d\'un soci que falta.',
    audience: 'Societats amb dos o més socis on cal protegir la continuïtat.',
    covers: ['Capital pels socis vius per adquirir la part del soci difunt', 'Eina per al pacte de socis', 'Designació encreuada de beneficiaris'],
    review: ['Hi ha pacte de socis?', 'Què passa amb la família del soci difunt?', 'Quina és la valoració actual de l\'empresa?'],
    folders: ['Empreses', 'Previsió'],
    related: ['home-clau', 'planificacio', 'liquiditat'],
    cta: 'empreses'
  },
  'business-travel': {
    name: 'Business Travel',
    intent: 'Protegir persones que viatgen per feina.',
    audience: 'Empreses amb personal en mobilitat (comercials, consultors, executius).',
    covers: ['Accidents 24h durant els viatges', 'Assistència sanitària internacional', 'Equipatge, retorn anticipat'],
    review: ['Quanta gent viatja i amb quina freqüència?', 'Hi ha destinacions de risc?'],
    folders: ['Empreses'],
    related: ['accidents-conveni', 'salut-collectiva', 'vida-collectiu'],
    cta: 'empreses'
  },
  'retribucio-flexible': {
    name: 'Retribució flexible',
    intent: 'Optimitzar la nòmina amb productes asseguradors fiscalment eficients.',
    audience: 'Empreses que volen retenir talent millorant el net de l\'empleat.',
    covers: ['Salut com a retribució en espècie', 'Vida i previsió integrats', 'Possible combinació amb altres beneficis'],
    review: ['Quin perfil d\'empleat tens?', 'Quin estalvi fiscal pot suposar?'],
    folders: ['Empreses'],
    related: ['salut-collectiva', 'vida-collectiu', 'ppse'],
    cta: 'empreses'
  },

  // ─── Estalvi i previsió ───
  'pias': {
    name: 'PIAS',
    intent: 'Pla Individual d\'Estalvi Sistemàtic — estalvi a llarg amb avantatges fiscals si es rescata com a renda vitalícia.',
    audience: 'Persones amb capacitat d\'estalvi a llarg termini (8-10 anys mínim).',
    covers: ['Aportacions periòdiques o úniques fins al límit anual', 'Possible exempció de rendiments si es rescata com a renda vitalícia complint requisits', 'Liquiditat (sense penalització fiscal des de l\'any 5, condicions del producte)'],
    review: ['Necessites liquiditat aviat o pots planificar a 10+ anys?', 'Compara la fiscalitat com a renda vs com a capital'],
    folders: ['Previsió', 'Persones'],
    related: ['sialp', 'renda-vitalicia', 'unit-linked', 'vida-estalvi'],
    cta: 'previsio'
  },
  'sialp': {
    name: 'SIALP',
    intent: 'Seguro Individual d\'Estalvi a Llarg Termini — capital exempt si es manté 5 anys.',
    audience: 'Persones amb capacitat d\'estalvi de fins a 5.000€ anuals.',
    covers: ['Aportacions limitades a 5.000€/any', 'Rendiments exempts si es manté mínim 5 anys i es cobra com a capital', 'Producte amb garantia mínima'],
    review: ['Tens marge per estalviar fins a 5.000€/any?', 'Pots mantenir-ho 5 anys complets sense rescats parcials?'],
    folders: ['Previsió'],
    related: ['pias', 'vida-estalvi', 'renda-vitalicia'],
    cta: 'previsio'
  },
  'ppa': {
    name: 'PPA',
    intent: 'Pla de Previsió Assegurat — versió asseguradora del pla de pensions.',
    audience: 'Persones amb capacitat d\'aportació anual i visió a la jubilació.',
    covers: ['Aportacions deduïbles fins al límit fiscal anual', 'Garantia mínima de tipus d\'interès', 'Liquiditat limitada (jubilació, atur llarga durada, etc.)'],
    review: ['Necessites la deducció fiscal aquest any?', 'Pots prescindir del capital fins a jubilació?'],
    folders: ['Previsió'],
    related: ['pias', 'ppse', 'renda-vitalicia'],
    cta: 'previsio'
  },
  'ppse': {
    name: 'PPSE',
    intent: 'Pla de Previsió Social Empresarial — eina d\'empresa per construir jubilació de l\'empleat.',
    audience: 'Empreses que volen oferir previsió social a la plantilla.',
    covers: ['Aportacions de l\'empresa (i opcionalment de l\'empleat)', 'Avantatges fiscals per a l\'empresa', 'Drets consolidats per a l\'empleat'],
    review: ['Quina política d\'aportacions vols?', 'Compatible amb conveni i pacte d\'empresa?'],
    folders: ['Empreses', 'Previsió'],
    related: ['ppe', 'vida-collectiu', 'retribucio-flexible'],
    cta: 'empreses'
  },
  'ppe': {
    name: 'PPE',
    intent: 'Pla de Pensions d\'Empresa — vehicle col·lectiu per a la previsió empresarial.',
    audience: 'Empreses amb compromís de previsió social per a empleats.',
    covers: ['Aportacions col·lectives gestionades amb una entitat dipositària', 'Pla regulat per Llei de Plans i Fons', 'Drets consolidats individualitzats'],
    review: ['Hi ha conveni col·lectiu que ja recull la previsió?', 'Quin volum d\'aportació projectes?'],
    folders: ['Empreses', 'Previsió'],
    related: ['ppse', 'socis', 'home-clau'],
    cta: 'empreses'
  },
  'vida-estalvi': {
    name: 'Vida estalvi',
    intent: 'Combinar capital garantit amb cobertura per defunció.',
    audience: 'Persones amb capital per estalviar amb un mínim de protecció.',
    covers: ['Aportació única o periòdica', 'Capital garantit a venciment', 'Capital addicional en cas de defunció'],
    review: ['Vols garantia plena o assumir més risc per millor rendibilitat?', 'A quin termini necessites el capital?'],
    folders: ['Previsió', 'Persones'],
    related: ['pias', 'unit-linked', 'renda-vitalicia'],
    cta: 'previsio'
  },
  'renda-vitalicia': {
    name: 'Renda vitalícia',
    intent: 'Convertir un capital en una renda mensual mentre visquis.',
    audience: 'Persones amb capital acumulat que volen ingressos predictibles, hereus que reben un capital.',
    covers: ['Renda mensual garantida vitalícia', 'Fiscalitat avantatjosa per edat (a partir de 65/70)', 'Possible reversió al cònjuge'],
    review: ['Vols garantir un ingrés constant o conservar capital?', 'Edat al moment de contractar', 'Reversió sí o no'],
    folders: ['Previsió'],
    related: ['renda-temporal', 'pias', 'planificacio', 'liquiditat'],
    cta: 'previsio'
  },
  'renda-temporal': {
    name: 'Renda temporal',
    intent: 'Renda durant un termini definit (10, 15, 20 anys).',
    audience: 'Persones que volen cobrir un període concret (gap a jubilació, fills a càrrec).',
    covers: ['Renda mensual durant termini pactat', 'Possible component vitalici en combinació'],
    review: ['Quin període vols cobrir?', 'Necessites flexibilitat al final del període?'],
    folders: ['Previsió'],
    related: ['renda-vitalicia', 'pias', 'unit-linked'],
    cta: 'previsio'
  },
  'unit-linked': {
    name: 'Unit linked',
    intent: 'Assegurança de vida amb estalvi vinculat a fons d\'inversió.',
    audience: 'Persones disposades a assumir risc d\'inversió a canvi de potencial rendibilitat.',
    covers: ['Inversió en cistelles de fons', 'Cobertura per defunció', 'Possibles canvis de cistella sense fiscalitat immediata'],
    review: ['Tens perfil d\'inversor adequat?', 'Pots mantenir la inversió a llarg si el mercat cau?', 'Quins fons són òptims al teu perfil?'],
    folders: ['Previsió'],
    related: ['pias', 'vida-estalvi', 'renda-vitalicia'],
    cta: 'previsio'
  },

  // ─── Successió i patrimoni ───
  'beneficiaris': {
    name: 'Designació de beneficiaris',
    intent: 'Assegurar que el capital arribi a qui vols, quan vols i com vols.',
    audience: 'Tothom amb pòlissa de vida — sovint amb beneficiaris desactualitzats.',
    covers: ['Revisió de pòlisses actuals', 'Designació nominal, percentual o per ordre', 'Coordinació amb testament i règim econòmic'],
    review: ['Quan vas designar beneficiaris per última vegada?', 'Hi ha canvis familiars (divorci, fills, defuncions)?', 'Vols beneficiaris substitutius?'],
    folders: ['Persones', 'Previsió'],
    related: ['vida-risc', 'planificacio', 'liquiditat'],
    cta: 'previsio'
  },
  'planificacio': {
    name: 'Planificació successòria',
    intent: 'Ordenar el patrimoni i la successió amb eines asseguradores.',
    audience: 'Persones amb patrimoni, autònoms i empresaris.',
    covers: ['Coordinació entre testament, pòlisses i règim matrimonial', 'Liquiditat per al pagament de l\'impost de successions', 'Designació coherent de beneficiaris'],
    review: ['Tens testament actualitzat?', 'Els hereus tindrien liquiditat immediata?', 'Els beneficiaris en pòlisses estan alineats amb el testament?'],
    folders: ['Previsió'],
    related: ['liquiditat', 'beneficiaris', 'vida-risc', 'renda-vitalicia'],
    cta: 'previsio'
  },
  'liquiditat': {
    name: 'Liquiditat per hereus',
    intent: 'Garantir que els hereus tinguin diners disponibles immediatament.',
    audience: 'Persones amb patrimoni majoritàriament immobiliari o il·líquid.',
    covers: ['Capital per defunció destinat a impostos de successions', 'Coordinació amb règim hereditari', 'Possible ús de fideïcomís'],
    review: ['Els hereus podrien pagar l\'impost sense vendre béns?', 'Hi ha actius difícilment liquidables (empresa familiar, immobles)?'],
    folders: ['Previsió'],
    related: ['planificacio', 'vida-risc', 'socis'],
    cta: 'previsio'
  },

  // ─── Col·lectius ───
  'casals': {
    name: 'Casals i colònies',
    intent: 'Cobertura per a casals d\'estiu, esplais i colònies.',
    audience: 'Entitats, escoles, esplais i AMPAs que organitzen activitats.',
    covers: ['Accidents per a participants', 'Responsabilitat civil per a organitzadors', 'Monitors i voluntaris coberts', 'Possible defensa jurídica i assistència en viatge'],
    review: ['Quants participants i quants menors?', 'Quants monitors i voluntaris?', 'Hi ha activitats de risc específic?', 'Es fan sortides fora de la base?'],
    folders: ['Col·lectius'],
    related: ['campus', 'voluntariat', 'rc-activitats', 'esdeveniments'],
    cta: 'cotitzador'
  },
  'campus': {
    name: 'Campus esportius',
    intent: 'Cobertura per a campus i activitats esportives organitzades.',
    audience: 'Clubs esportius, federacions, escoles que organitzen campus.',
    covers: ['Accidents esportius dels participants', 'RC del club o organitzador', 'Monitors i tècnics', 'Equipament i instal·lacions'],
    review: ['Quins esports i quin nivell de risc?', 'Hi ha pernoctació?', 'Federacions afiliades?'],
    folders: ['Col·lectius'],
    related: ['casals', 'voluntariat', 'rc-activitats'],
    cta: 'cotitzador'
  },
  'formacio': {
    name: 'Formació SOC / CAP',
    intent: 'Cobertura obligatòria per a formacions ocupacionals o regulades.',
    audience: 'Centres de formació, entitats formadores, escoles d\'oficis.',
    covers: ['Accidents per a alumnes (cobertura SOC habitual)', 'Pràctiques en empreses', 'RC del centre formador'],
    review: ['Quina formació imparteixes i amb quina entitat?', 'Hi ha pràctiques externes?'],
    folders: ['Col·lectius'],
    related: ['casals', 'rc-activitats', 'voluntariat'],
    cta: 'cotitzador'
  },
  'voluntariat': {
    name: 'Voluntariat',
    intent: 'Cobertura legal per a entitats que treballen amb voluntaris.',
    audience: 'ONG, fundacions, associacions amb voluntaris.',
    covers: ['Accidents per als voluntaris (obligatori per llei)', 'RC pels actes dels voluntaris en nom de l\'entitat', 'Assistència sanitària'],
    review: ['Quants voluntaris actius?', 'Quines activitats fan?', 'Hi ha desplaçaments?'],
    folders: ['Col·lectius'],
    related: ['casals', 'rc-activitats', 'esdeveniments'],
    cta: 'cotitzador'
  },
  'esdeveniments': {
    name: 'Esdeveniments puntuals',
    intent: 'Cobertura per a esdeveniments puntuals (jornades, festes, congressos).',
    audience: 'Organitzadors d\'esdeveniments d\'un sol dia o curta durada.',
    covers: ['Accidents per a participants i visitants', 'RC de l\'organitzador', 'Possible cancel·lació i defensa jurídica'],
    review: ['Quantes persones assistents?', 'Hi ha activitats de risc?', 'Es fa en espai propi o llogat?'],
    folders: ['Col·lectius'],
    related: ['casals', 'campus', 'rc-activitats'],
    cta: 'cotitzador'
  },
  'rc-activitats': {
    name: 'Responsabilitat civil d\'activitats',
    intent: 'Cobrir danys a tercers durant l\'activitat organitzada.',
    audience: 'Tota entitat o organitzador d\'activitats amb participants.',
    covers: ['Danys corporals a tercers', 'Danys materials a tercers', 'Defensa jurídica i fiances'],
    review: ['Quins escenaris de risc tens (accidents, danys a locals, queixes)?', 'Quin capital de RC necessites per als participants i tercers?'],
    folders: ['Col·lectius'],
    related: ['casals', 'campus', 'voluntariat', 'esdeveniments'],
    cta: 'cotitzador'
  }
};

/* =====================================================
   3. CONTINGUT DELS DOCUMENTS (Manifest, Sobre, FAQ, etc.)
   ===================================================== */

const DOCS = {
  'manifest': {
    title: 'Manifest COVERA',
    eyebrow: 'Document · Manifest',
    sections: [
      { h: 'El que defensem', p: 'Les assegurances personals no s\'haurien de contractar de manera aïllada, dispersa o només per preu. Salut, vida, accidents, baixa laboral, estalvi, previsió i beneficis d\'empresa formen part d\'una mateixa pregunta: <em>què passaria amb tu, la teva família, els teus ingressos o el teu equip si demà canviés alguna cosa important?</em>' },
      { h: 'El que evitem', p: 'No comparem preus per defecte. No promovem productes deslligats d\'un objectiu real. No prometem avantatges fiscals absoluts. No venem urgència emocional.' },
      { h: 'El que oferim', p: 'Mètode: entenem, detectem, prioritzem, proposem i revisem. Criteri tècnic, fiscal i familiar. Independència vs. una sola companyia. Transparència de comissió i obligacions.' },
      { h: 'La frase que ens defineix', p: '<em>"No venem pòlisses soltes. Ordenem protecció."</em>' }
    ]
  },
  'sobre': {
    title: 'Sobre COVERA',
    eyebrow: 'Document · Sobre nosaltres',
    sections: [
      { h: 'Qui som', p: 'COVERA és una corredoria d\'assegurances especialista a Catalunya, amb cobertura per a tot Espanya i atenció 100% en remot. Treballem persones, autònoms, empreses i col·lectius.' },
      { h: 'Què fem diferent', p: 'No som comparador. No som banc. No som una asseguradora. Som corredoria — és a dir, treballem per a tu, no per a una companyia. Cobrem la nostra feina via la comissió que la companyia ja paga; el preu del producte no varia per usar-nos.' },
      { h: 'Com treballem', p: 'Partim del diagnòstic, no de la venda. Ordenem el que tens i identifiquem els buits abans de proposar res. Revisem periòdicament perquè la vida canvia.' },
      { h: 'Garantia legal', p: 'Inscrits a la DGSFP amb la clau J-XXXX. Pòlissa de responsabilitat civil professional vigent. Capacitat financera segons normativa.' }
    ]
  },
  'com-diagnostic': {
    title: 'Com funciona el diagnòstic',
    eyebrow: 'Document · Diagnòstic',
    sections: [
      { h: 'Què és', p: 'El diagnòstic de protecció és una eina gratuïta i sense compromís per identificar buits en la teva cobertura actual. No és una venda: és una lectura.' },
      { h: 'Com funciona', p: '1) Respons 5 preguntes breus a la web (uns 2 minuts).<br>2) Rebem la teva resposta i preparem una primera lectura.<br>3) Et truquem o t\'escrivim en menys de 24 hores hàbils amb un mapa orientatiu de la teva protecció.<br>4) Decideixes si vols revisar més a fons o no. Sense pressió.' },
      { h: 'Què NO és', p: 'No és un pressupost ni una proposta de venda. No demana dades sensibles. No genera obligació de cap mena.' },
      { h: 'Què sí que és', p: 'Una primera radiografia honesta de què tens, què et falta i què val la pena prioritzar.' }
    ]
  },
  'faq': {
    title: 'Preguntes freqüents',
    eyebrow: 'Document · FAQ',
    sections: [
      { h: 'Esteu només a Catalunya?', p: 'Som una corredoria amb base a Mataró però treballem amb persones, empreses i entitats de tot Espanya, 100% en remot.' },
      { h: 'Em cobreu alguna cosa per la primera consulta?', p: 'No. Diagnòstic, revisions inicials i ofertes són gratuïts. Cobrem via la comissió que la companyia ja paga, sense recàrrec per al client.' },
      { h: 'Si ja tinc assegurances contractades amb altres, podeu revisar-les igualment?', p: 'Sí. La revisió no requereix contractar res amb nosaltres. Et donem una lectura tècnica i decideixes.' },
      { h: 'Treballeu amb totes les companyies?', p: 'Amb les principals del mercat espanyol. Triem segons cas, no segons preferència nostra.' },
      { h: 'Què passa amb les meves dades?', p: 'Només recollim el necessari per al diagnòstic. No demanem dades clíniques ni financeres sensibles fins que cal cotitzar formalment. Compliment íntegre del RGPD.' }
    ]
  },
  'legal': {
    title: 'Marc legal i privacitat',
    eyebrow: 'Document · Marc legal',
    sections: [
      { h: 'Identitat', p: 'COVERA Correduría de Seguros, S.L. — CIF B00000000. Adreça registral i contacte: hola@covera.es.' },
      { h: 'Registre i supervisió', p: 'Inscrita al Registre de la Direcció General d\'Assegurances i Fons de Pensions (DGSFP) amb la clau J-XXXX. Sotmesa a la Llei 26/2006 i normativa concordant.' },
      { h: 'Garanties', p: 'Pòlissa de responsabilitat civil professional vigent i capacitat financera segons normativa.' },
      { h: 'Privacitat', p: 'Tractem les teves dades exclusivament per a la finalitat acordada (diagnòstic, cotització, contractació). Compliment íntegre del Reglament (UE) 2016/679 i la LOPDGDD. Pots exercir els teus drets d\'accés, rectificació, supressió, oposició i portabilitat escrivint a hola@covera.es.' },
      { h: 'Avís sobre fiscalitat', p: 'Els comentaris fiscals d\'aquesta web tenen finalitat orientativa. La normativa pot canviar i cada cas té particularitats. Per a decisions fiscals concretes, recomanem assessorament específic.' }
    ]
  },
  'guia': {
    title: 'Guia bàsica de protecció',
    eyebrow: 'Document · Guia',
    sections: [
      { h: 'Si ets autònom', p: 'Mira en aquest ordre: 1) ILT / baixa laboral, 2) Salut, 3) Vida risc si tens dependents, 4) Accidents, 5) Previsió de jubilació.' },
      { h: 'Si tens família', p: 'Mira en aquest ordre: 1) Vida risc amb capital suficient, 2) Salut familiar, 3) Beneficiaris ben designats, 4) Cobertura per malalties greus i dependència, 5) Planificació successòria si tens patrimoni.' },
      { h: 'Si tens empresa amb equip', p: '1) Verificar accidents de conveni, 2) Avaluar salut col·lectiva, 3) Vida col·lectiu i ILT directius, 4) Home/dona clau i socis, 5) PPSE/PPE si vols previsió per a l\'equip.' },
      { h: 'Si organitzes col·lectius', p: '1) Accidents per als participants (especialment menors), 2) RC d\'activitats, 3) Cobertura per a monitors i voluntaris, 4) Defensa jurídica si l\'activitat ho recomana.' },
      { h: 'Si has rebut un capital extraordinari', p: 'Abans de col·locar res: revisar beneficiaris, planificació successòria, distribució entre liquiditat / rendes / inversió, i fiscalitat de cada via.' }
    ]
  }
};

/* =====================================================
   4. ÍNDEX DE CERCA
   ===================================================== */

const SEARCH_INDEX = [
  // Carpetes
  { label: 'Inici', aliases: ['home', 'benvinguda'], type: 'section', target: 'inici' },
  { label: 'Persones i famílies', aliases: ['familia', 'family', 'personal', 'salut', 'vida'], type: 'section', target: 'persones' },
  { label: 'Autònoms i professionals', aliases: ['autonom', 'freelance', 'professional', 'ingressos'], type: 'section', target: 'autonoms' },
  { label: 'Empreses', aliases: ['empresa', 'pimes', 'equip', 'beneficis', 'conveni'], type: 'section', target: 'empreses' },
  { label: 'Col·lectius i activitats', aliases: ['collectiu', 'casal', 'colonia', 'campus', 'voluntariat', 'esdeveniment'], type: 'section', target: 'collectius' },
  { label: 'Previsió assegurada', aliases: ['previsio', 'estalvi', 'jubilacio', 'successio', 'patrimoni', 'renda'], type: 'section', target: 'previsio' },
  // Eines
  { label: 'Diagnòstic de protecció', aliases: ['diagnostic', 'diagnostico'], type: 'section', target: 'diagnostic' },
  { label: 'Cotitzador col·lectius', aliases: ['cotitzar', 'preu', 'pressupost', 'cotitzacio'], type: 'section', target: 'cotitzador' },
  { label: 'Tots els productes', aliases: ['producte', 'producto', 'pòlissa', 'polissa'], type: 'section', target: 'productes' },
  { label: 'Mètode COVERA', aliases: ['metode', 'metodo', 'com treballem', 'metodologia'], type: 'section', target: 'metode' },
  { label: 'Recursos i guies', aliases: ['guia', 'recursos', 'checklist', 'calculadora'], type: 'section', target: 'recursos' }
];

// Add product entries to search index
Object.entries(PRODUCTS).forEach(([id, prod]) => {
  SEARCH_INDEX.push({
    label: prod.name,
    aliases: [prod.intent.substring(0, 80), ...prod.folders].map(s => s.toLowerCase()),
    type: 'product',
    target: id
  });
});

// Manual extra aliases (the brief listed these specifically)
const EXTRA_ALIASES = {
  'ilt': ['ilt', 'baixa laboral', 'baixa', 'incapacitat temporal'],
  'salut-individual': ['salut', 'sanitat', 'metge', 'doctor', 'hospital'],
  'salut-familiar': ['salut familiar', 'salut familia'],
  'salut-collectiva': ['salut collectiva', 'salut empresa', 'salut equip'],
  'vida-risc': ['vida', 'vida risc', 'capital vida'],
  'vida-hipoteca': ['vida hipoteca', 'hipoteca', 'banc'],
  'vida-collectiu': ['vida col·lectiu', 'vida collectiu', 'vida empresa'],
  'accidents-conveni': ['accidents conveni', 'conveni', 'compliment'],
  'casals': ['casals', 'casal', 'estiu', 'lleure'],
  'campus': ['campus', 'esports'],
  'voluntariat': ['voluntariat', 'voluntari', 'ong'],
  'pias': ['pias', 'estalvi sistematic'],
  'sialp': ['sialp', 'estalvi llarg termini'],
  'ppa': ['ppa', 'pla previsio assegurat'],
  'ppe': ['ppe', 'pla pensions empresa'],
  'ppse': ['ppse', 'previsio social empresarial'],
  'renda-vitalicia': ['renda', 'renda vitalicia', 'rendes', 'jubilacio'],
  'renda-temporal': ['renda temporal'],
  'beneficiaris': ['beneficiaris', 'beneficiari', 'successio', 'hereus'],
  'planificacio': ['successio', 'successions', 'planificacio', 'herencia'],
  'liquiditat': ['liquiditat', 'hereus'],
  'home-clau': ['home clau', 'dona clau', 'persona clau'],
  'socis': ['socis', 'soci', 'participacions']
};
SEARCH_INDEX.forEach(entry => {
  if (entry.type === 'product' && EXTRA_ALIASES[entry.target]) {
    entry.aliases = [...new Set([...entry.aliases, ...EXTRA_ALIASES[entry.target]])];
  }
});

/* Normalize: remove accents + lowercase */
function norm(s) {
  return s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/* =====================================================
   5. NAVEGACIÓ amb HISTORIAL (← →) + Breadcrumb
   ===================================================== */

const history = ['inici'];
let historyIdx = 0;

function updateBreadcrumb(sectionId) {
  const label = SECTION_LABELS[sectionId] || 'Inici';
  const el = document.getElementById('bcCurrent');
  if (el) el.textContent = label;
}

function updateArrowState() {
  const back = document.getElementById('navBack');
  const fwd = document.getElementById('navForward');
  if (back) back.classList.toggle('disabled', historyIdx <= 0);
  if (fwd) fwd.classList.toggle('disabled', historyIdx >= history.length - 1);
}

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setActiveSidebarItem(sectionId) {
  document.querySelectorAll('.sb-folder, .sb-tool').forEach(el => {
    el.classList.toggle('active', el.dataset.section === sectionId);
  });
}

function goTo(sectionId, pushToHistory = true) {
  if (!sectionId) return;
  if (pushToHistory) {
    // Trim forward history if we're navigating from a back-state
    if (historyIdx < history.length - 1) {
      history.length = historyIdx + 1;
    }
    if (history[history.length - 1] !== sectionId) {
      history.push(sectionId);
      historyIdx = history.length - 1;
    }
  }
  scrollToSection(sectionId);
  updateBreadcrumb(sectionId);
  setActiveSidebarItem(sectionId);
  updateArrowState();
  closeMenus();
  closeSearchResults();
}

function navBack() {
  if (historyIdx <= 0) return;
  historyIdx--;
  const sectionId = history[historyIdx];
  scrollToSection(sectionId);
  updateBreadcrumb(sectionId);
  setActiveSidebarItem(sectionId);
  updateArrowState();
}

function navForward() {
  if (historyIdx >= history.length - 1) return;
  historyIdx++;
  const sectionId = history[historyIdx];
  scrollToSection(sectionId);
  updateBreadcrumb(sectionId);
  setActiveSidebarItem(sectionId);
  updateArrowState();
}

/* Auto-update breadcrumb based on scroll position */
function initScrollObserver() {
  const sectionEls = Object.keys(SECTION_LABELS)
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (!sectionEls.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) {
      const sectionId = visible[0].target.id;
      updateBreadcrumb(sectionId);
      setActiveSidebarItem(sectionId);
    }
  }, {
    rootMargin: '-100px 0px -55% 0px',
    threshold: [0, 0.1, 0.5]
  });
  sectionEls.forEach(s => observer.observe(s));
}

/* =====================================================
   6. MENUBAR DROPDOWNS
   ===================================================== */

function closeMenus() {
  document.querySelectorAll('.menubar-item.open').forEach(b => b.classList.remove('open'));
  document.querySelectorAll('.menu-dropdown.open').forEach(d => d.classList.remove('open'));
}

function initMenubar() {
  const items = document.querySelectorAll('.menubar-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuName = item.dataset.menu;
      const dropdown = document.querySelector(`.menu-dropdown[data-for="${menuName}"]`);
      const wasOpen = item.classList.contains('open');
      closeMenus();
      if (!wasOpen && dropdown) {
        item.classList.add('open');
        dropdown.classList.add('open');
        // Position dropdown below the menubar item
        const rect = item.getBoundingClientRect();
        const menubar = item.parentElement.getBoundingClientRect();
        dropdown.style.left = (rect.left - menubar.left) + 'px';
      }
    });
    // Hover-to-switch when another menu is already open
    item.addEventListener('mouseenter', () => {
      const anyOpen = document.querySelector('.menubar-item.open');
      if (anyOpen && anyOpen !== item) {
        item.click();
      }
    });
  });
  // Click outside closes menus
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menubar') && !e.target.closest('.menu-dropdown')) {
      closeMenus();
    }
  });
}

/* =====================================================
   7. EDITA — accions
   ===================================================== */

function focusSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.focus();
    input.select();
  }
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  const wrap = document.getElementById('searchWrap');
  if (input) input.value = '';
  if (wrap) wrap.classList.remove('has-text');
  closeSearchResults();
}

function copyLink() {
  const sectionId = history[historyIdx] || 'inici';
  const url = window.location.origin + window.location.pathname + '#' + sectionId;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Enllaç copiat'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Enllaç copiat');
  }
}

function resetView() {
  clearSearch();
  closeMenus();
  closeProduct();
  closeDoc();
  goTo('inici');
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* =====================================================
   8. CERCA — autocomplete + click
   ===================================================== */

function searchMatch(query) {
  const q = norm(query.trim());
  if (!q) return [];
  const results = [];
  SEARCH_INDEX.forEach(entry => {
    const labelN = norm(entry.label);
    const aliasMatch = (entry.aliases || []).some(a => norm(a).includes(q));
    let score = 0;
    if (labelN === q) score = 100;
    else if (labelN.startsWith(q)) score = 80;
    else if (labelN.includes(q)) score = 60;
    else if (aliasMatch) score = 40;
    if (score > 0) results.push({ ...entry, score });
  });
  return results.sort((a, b) => b.score - a.score).slice(0, 7);
}

function renderSearchResults(results, query) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  if (!results.length) {
    container.innerHTML = '<div class="search-empty">Cap resultat per a "<strong>' + escapeHtml(query) + '</strong>"</div>';
    container.classList.add('open');
    return;
  }
  const html = results.map(r => {
    const typeBadge = r.type === 'product' ? 'Producte' : 'Carpeta';
    const action = r.type === 'product'
      ? `onclick="openProduct('${r.target}'); clearSearch();"`
      : `onclick="goTo('${r.target}'); clearSearch();"`;
    const icon = r.type === 'product'
      ? '<svg class="search-result-icon" viewBox="0 0 16 16"><path d="M4 2.5 H10 L13 5.5 V13 A0.8 0.8 0 0 1 12.2 13.8 H4 A0.8 0.8 0 0 1 3.2 13 V3.3 A0.8 0.8 0 0 1 4 2.5 Z M10 2.5 V5.5 H13" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
      : '<svg class="search-result-icon" viewBox="0 0 16 12"><path d="M1 3 A1.5 1.5 0 0 1 2.5 1.5 H5.5 L7 3 H13.5 A1.5 1.5 0 0 1 15 4.5 V9.5 A1.5 1.5 0 0 1 13.5 11 H2.5 A1.5 1.5 0 0 1 1 9.5 Z" fill="currentColor"/></svg>';
    return `<button class="search-result" ${action}>
      ${icon}
      <span class="search-result-name">${escapeHtml(r.label)}</span>
      <span class="search-result-cat">${typeBadge}</span>
    </button>`;
  }).join('');
  container.innerHTML = html;
  container.classList.add('open');
}

function closeSearchResults() {
  const container = document.getElementById('searchResults');
  if (container) container.classList.remove('open');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initSearch() {
  const input = document.getElementById('searchInput');
  const wrap = document.getElementById('searchWrap');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const v = e.target.value;
    if (wrap) wrap.classList.toggle('has-text', !!v);
    if (!v.trim()) { closeSearchResults(); return; }
    renderSearchResults(searchMatch(v), v);
  });
  input.addEventListener('focus', () => {
    if (input.value.trim()) renderSearchResults(searchMatch(input.value), input.value);
  });
  // Click outside closes results
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) closeSearchResults();
  });
  // Enter triggers first result
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = document.querySelector('#searchResults .sr-item');
      if (first) first.click();
    } else if (e.key === 'Escape') {
      clearSearch();
      input.blur();
    }
  });
}

/* =====================================================
   9. MODAL PRODUCTE
   ===================================================== */

function openProduct(productId) {
  const data = PRODUCTS[productId];
  const modal = document.getElementById('productModal');
  const body = document.getElementById('modalBody');
  if (!data || !modal || !body) return;

  const relatedHtml = (data.related || [])
    .filter(rid => PRODUCTS[rid])
    .map(rid => `<button onclick="openProduct('${rid}')">${escapeHtml(PRODUCTS[rid].name)}</button>`)
    .join('');

  const foldersHtml = (data.folders || [])
    .map(f => `<span>${escapeHtml(f)}</span>`)
    .join('');

  body.innerHTML = `
    <div class="prod-eyebrow">Fitxa de producte</div>
    <h2>${escapeHtml(data.name)}</h2>
    <p class="prod-intent">${escapeHtml(data.intent)}</p>

    <div class="prod-section">
      <h4>Per a qui</h4>
      <p>${escapeHtml(data.audience)}</p>
    </div>

    <div class="prod-section">
      <h4>Què cobreix</h4>
      <ul>
        ${data.covers.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
      </ul>
    </div>

    <div class="prod-section">
      <h4>Què revisem</h4>
      <ul>
        ${data.review.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>

    <div class="prod-section">
      <h4>Carpetes on en parlem</h4>
      <div class="modal-related">${foldersHtml}</div>
    </div>

    ${relatedHtml ? `
    <div class="prod-section">
      <h4>Productes relacionats</h4>
      <div class="modal-related">${relatedHtml}</div>
    </div>
    ` : ''}

    <div class="modal-cta">
      <button class="btn btn-primary" onclick="closeProduct(); goTo('${data.cta}')">Anar a la carpeta corresponent</button>
      <button class="btn btn-ghost" onclick="closeProduct(); goTo('diagnostic')">Fer diagnòstic</button>
    </div>
  `;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProduct() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* =====================================================
   10. MODAL DOCUMENTS
   ===================================================== */

function openDoc(docId) {
  const data = DOCS[docId];
  const modal = document.getElementById('docModal');
  const body = document.getElementById('docBody');
  if (!data || !modal || !body) return;

  body.innerHTML = `
    <div class="prod-eyebrow">${escapeHtml(data.eyebrow)}</div>
    <h2>${escapeHtml(data.title)}</h2>
    ${data.sections.map(s => `
      <div class="prod-section">
        <h4>${escapeHtml(s.h)}</h4>
        <p>${s.p}</p>
      </div>
    `).join('')}
    <div class="modal-cta">
      <button class="btn btn-primary" onclick="closeDoc()">Tancar document</button>
      <button class="btn btn-ghost" onclick="closeDoc(); goTo('diagnostic')">Fer diagnòstic</button>
    </div>
  `;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDoc() {
  const modal = document.getElementById('docModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* =====================================================
   11. DIAGNÒSTIC multi-pas
   ===================================================== */

const diagState = {};
let diagStepCurrent = 1;
const DIAG_TOTAL = 5;

function setDiagStep(n) {
  diagStepCurrent = n;
  document.querySelectorAll('.diag-step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step, 10) === n);
  });
  const dots = document.querySelectorAll('.diag-dot');
  dots.forEach((d, i) => {
    d.classList.remove('current', 'done');
    if (i < n - 1) d.classList.add('done');
    if (i === n - 1) d.classList.add('current');
  });
}

function diagAnswer(field, value) {
  diagState[field] = value;
  if (diagStepCurrent < DIAG_TOTAL) {
    setDiagStep(diagStepCurrent + 1);
  }
}

function diagBack() {
  if (diagStepCurrent > 1) setDiagStep(diagStepCurrent - 1);
}

function diagSubmit() {
  const nom = (document.getElementById('diag-nom') || {}).value || '';
  const email = (document.getElementById('diag-email') || {}).value || '';
  const tel = (document.getElementById('diag-tel') || {}).value || '';
  if (!nom.trim() || !email.trim()) {
    showToast('Cal completar nom i email');
    return;
  }
  // Placeholder: would send to backend / CRM endpoint
  console.log('Diagnostic submitted:', { ...diagState, nom, email, tel });
  document.getElementById('diagForm').style.display = 'none';
  const result = document.getElementById('diagResult');
  if (result) result.classList.add('show');
}

/* =====================================================
   12. COTITZADOR col·lectius
   ===================================================== */

/* Coeficients orientatius — substituir per tarifes reals de mutualitat */
const COT_BASE = {
  casal: 1.10,        // €/dia/participant
  colonia: 1.75,
  campus: 1.35,
  formacio: 0.75,
  excursio: 0.95,
  esdeveniment: 0.65
};

function togglePill(checkbox) {
  if (!checkbox) return;
  checkbox.parentElement.classList.toggle('checked', checkbox.checked);
}

function cotitzar() {
  const activitat = (document.getElementById('cot-activitat') || {}).value || 'casal';
  const participants = parseInt((document.getElementById('cot-participants') || {}).value || '0', 10);
  const dies = parseInt((document.getElementById('cot-dies') || {}).value || '0', 10);
  const monitors = parseInt((document.getElementById('cot-monitors') || {}).value || '0', 10);
  const menors = (document.getElementById('cot-menors') || {}).checked;
  const rc = (document.getElementById('cot-rc') || {}).checked;
  const defensa = (document.getElementById('cot-defensa') || {}).checked;
  const assistencia = (document.getElementById('cot-assistencia') || {}).checked;

  const base = COT_BASE[activitat] || 1.0;
  let total = base * Math.max(1, participants) * Math.max(1, dies);
  total += monitors * 2.5 * Math.max(1, dies);
  if (menors) total *= 1.15;
  if (rc) total += 35 + Math.max(0, participants - 30) * 0.30;
  if (defensa) total += 22;
  if (assistencia) total += 0.45 * Math.max(1, participants) * Math.max(1, dies);
  total = Math.max(28, Math.round(total));

  const min = Math.round(total * 0.82);
  const max = Math.round(total * 1.18);

  const preuEl = document.getElementById('cot-preu');
  const rangEl = document.getElementById('cot-rang');
  if (preuEl) preuEl.textContent = total.toLocaleString('ca-ES') + ' €';
  if (rangEl) rangEl.textContent = `Rang estimat: ${min.toLocaleString('ca-ES')}–${max.toLocaleString('ca-ES')} €`;
}

/* =====================================================
   13. DATA + HORA al title bar
   ===================================================== */

function initDateTime() {
  const el = document.getElementById('titleDatetime');
  if (!el) return;
  const update = () => {
    const now = new Date();
    const days = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];
    const months = ['gen', 'feb', 'març', 'abr', 'maig', 'juny', 'jul', 'ago', 'set', 'oct', 'nov', 'des'];
    const d = days[now.getDay()];
    const date = now.getDate();
    const m = months[now.getMonth()];
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${d} ${date} ${m} · ${h}:${min}`;
  };
  update();
  setInterval(update, 30000);
}

/* =====================================================
   14. DRECERES de teclat
   ===================================================== */

const KEY_TO_SECTION = {
  '0': 'inici',
  '1': 'persones',
  '2': 'autonoms',
  '3': 'empreses',
  '4': 'collectius',
  '5': 'previsio',
  'd': 'diagnostic',
  'c': 'cotitzador',
  'p': 'productes',
  'r': 'recursos',
  'm': 'metode'
};

function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger when typing in inputs
    const tag = (e.target.tagName || '').toLowerCase();
    const isInput = (tag === 'input' || tag === 'textarea' || tag === 'select');

    // ESC always works
    if (e.key === 'Escape') {
      if (document.getElementById('productModal').classList.contains('open')) {
        closeProduct(); return;
      }
      if (document.getElementById('docModal').classList.contains('open')) {
        closeDoc(); return;
      }
      if (document.querySelector('.menubar-item.open')) {
        closeMenus(); return;
      }
      const sr = document.getElementById('searchResults');
      if (sr && sr.classList.contains('open')) {
        closeSearchResults(); return;
      }
    }

    // ⌘F / Ctrl+F → focus search
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      focusSearch();
      return;
    }
    // ⌘0 / Ctrl+0 → inici
    if ((e.metaKey || e.ctrlKey) && e.key === '0') {
      e.preventDefault();
      goTo('inici');
      return;
    }
    // ⌘1-5 → carpetes
    if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      const target = KEY_TO_SECTION[e.key];
      if (target) goTo(target);
      return;
    }

    // Without modifier: 0-5 or letter shortcuts (but only when not typing)
    if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      const target = KEY_TO_SECTION[e.key.toLowerCase()];
      if (target) {
        e.preventDefault();
        goTo(target);
      }
    }
  });
}

/* =====================================================
   15. INICIALITZACIÓ
   ===================================================== */

function initHashRoute() {
  const hash = (window.location.hash || '').replace('#', '');
  if (hash && SECTION_LABELS[hash]) {
    setTimeout(() => goTo(hash), 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMenubar();
  initSearch();
  initScrollObserver();
  initKeyboard();
  initDateTime();
  initHashRoute();
  // Initialize cotitzador to show a default value
  setTimeout(cotitzar, 200);
  // Initialize sidebar active state
  setActiveSidebarItem('inici');
  updateArrowState();
});

/* ============================================
   COVERA — App
   Diagnòstic, cotitzador, modal de productes
   ============================================ */

// ============ SCROLL EFFECTS ============
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  if (window.scrollY > 8) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ MOBILE NAV ============
function toggleMobileNav() {
  document.getElementById('mainNav').classList.toggle('open');
  document.querySelector('.mobile-toggle').classList.toggle('open');
}
document.querySelectorAll('#mainNav a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mainNav').classList.remove('open');
    document.querySelector('.mobile-toggle').classList.remove('open');
  });
});

// ============ DIAGNOSTIC ============
let diagStep = 1;
const diagAnswers = {};

function diagAnswer(key, value) {
  diagAnswers[key] = value;
  if (diagStep < 5) diagGo(diagStep + 1);
}
function diagBack() { if (diagStep > 1) diagGo(diagStep - 1); }
function diagGo(step) {
  diagStep = step;
  document.querySelectorAll('.diag-step').forEach(s => s.classList.remove('active'));
  document.querySelector('.diag-step[data-step="' + step + '"]').classList.add('active');
  const dots = document.querySelectorAll('#diagProgress .diag-dot');
  dots.forEach((d, i) => {
    d.classList.remove('done', 'current');
    if (i < step - 1) d.classList.add('done');
    if (i === step - 1) d.classList.add('current');
  });
}
function diagSubmit() {
  const nom = document.getElementById('diag-nom').value.trim();
  const email = document.getElementById('diag-email').value.trim();
  if (!nom || !email) {
    alert('Necessitem el teu nom i email per enviar-te el diagnòstic.');
    return;
  }
  diagAnswers.nom = nom;
  diagAnswers.email = email;
  diagAnswers.telefon = document.getElementById('diag-tel').value.trim();
  // Aquí connectaríem amb el CRM real (HubSpot/Brevo/endpoint propi)
  document.querySelectorAll('.diag-step').forEach(s => s.style.display = 'none');
  document.getElementById('diagProgress').style.display = 'none';
  document.getElementById('diagResult').classList.add('show');
}

// ============ COTITZADOR ============
function togglePill(input) {
  const pill = input.closest('.cot-pill');
  if (input.checked) pill.classList.add('checked');
  else pill.classList.remove('checked');
}
document.querySelectorAll('.cot-pill input').forEach(i => {
  if (i.checked) i.closest('.cot-pill').classList.add('checked');
});

function cotitzar() {
  const activitat = document.getElementById('cot-activitat').value;
  const participants = Math.max(1, parseInt(document.getElementById('cot-participants').value) || 1);
  const dies = Math.max(1, parseInt(document.getElementById('cot-dies').value) || 1);
  const monitors = Math.max(0, parseInt(document.getElementById('cot-monitors').value) || 0);
  const menors = document.getElementById('cot-menors').checked;
  const rc = document.getElementById('cot-rc').checked;
  const defensa = document.getElementById('cot-defensa').checked;
  const assistencia = document.getElementById('cot-assistencia').checked;

  const mult = { casal: 1.0, colonia: 1.25, campus: 1.35, formacio: 0.85, excursio: 0.95, esdeveniment: 1.1 }[activitat] || 1.0;
  let base = participants * dies * 0.55 * mult;
  if (menors) base += participants * dies * 0.25;
  base += monitors * dies * 0.45;
  if (rc) base += 120 + participants * 1.2;
  if (defensa) base += 60 + participants * 0.4;
  if (assistencia) base += 90 + participants * 0.6;
  base = Math.max(base, 75);

  const min = Math.round(base * 0.85);
  const max = Math.round(base * 1.15);
  document.getElementById('cot-preu').textContent = min + ' – ' + max + ' €';
  document.getElementById('cot-rang').textContent = 'Estimació per ' + dies + ' dies · ' + participants + ' persones';
}
cotitzar();

// ============ PRODUCT MODAL (Fitxa funcional) ============
const PRODUCTS = {
  'ilt': {
    name: 'ILT / Baixa laboral',
    intent: 'Protecció d\'ingressos',
    audience: 'Autònoms, professionals i directius que volen protegir-se si una baixa per malaltia o accident els impedeix treballar i facturar.',
    covers: 'Indemnització diària des del primer dia o segons franquícia pactada. Cobreix la facturació durant el període de baixa, quan la prestació de la Seguretat Social no és suficient o no existeix.',
    review: 'En obrir activitat, en canviar el tipus d\'ingressos o de cotització, o cada 2-3 anys per revisar capitals contra l\'evolució del negoci.',
    folders: ['autonoms', 'empreses', 'persones'],
    related: ['indemnitzacio', 'malalties-greus', 'incapacitat', 'salut-individual'],
    news: ['Per què la baixa de la SS pot no ser suficient per a un autònom', 'ILT vs indemnització diària: en què es diferencien'],
    cta: 'Calcular protecció d\'ingressos'
  },
  'indemnitzacio': {
    name: 'Indemnització diària',
    intent: 'Compensació econòmica per baixa',
    audience: 'Autònoms i professionals que necessiten un import diari fix per substituir ingressos durant una baixa per malaltia o accident.',
    covers: 'Quantitat fixa diària des de la franquícia pactada (sovint del dia 4, 8 o 15 endavant) durant un període màxim acordat.',
    review: 'Quan augmenten els ingressos o despeses fixes, o si es contracta una hipoteca o préstec.',
    folders: ['autonoms'],
    related: ['ilt', 'accidents', 'hospitalitzacio'],
    news: ['Quina franquícia escollir en una indemnització diària'],
    cta: 'Calcular protecció d\'ingressos'
  },
  'malalties-greus': {
    name: 'Malalties greus',
    intent: 'Capital únic en cas de diagnòstic',
    audience: 'Persones que volen un capital econòmic disponible si els diagnostiquen una malaltia greu (càncer, infart, ictus, esclerosi, etc.).',
    covers: 'Pagament d\'un capital únic en cas de diagnòstic de les malalties incloses al condicionat. Pot complementar salut, vida risc o ILT.',
    review: 'Si hi ha antecedents familiars, cada vegada que canvia la situació econòmica, o cada 3-5 anys.',
    folders: ['persones', 'autonoms', 'empreses'],
    related: ['vida-risc', 'salut-individual', 'ilt'],
    news: ['Què és una malaltia greu en termes asseguradors'],
    cta: 'Revisar la meva protecció'
  },
  'incapacitat': {
    name: 'Incapacitat permanent',
    intent: 'Protecció si no pots tornar a treballar',
    audience: 'Persones amb activitat laboral que volen un capital o renda si una incapacitat permanent els impedeix tornar a la seva professió.',
    covers: 'Capital o renda mensual segons grau d\'incapacitat (total, absoluta o gran invalidesa) declarat.',
    review: 'Cada vegada que canvien els ingressos, l\'edat o el risc professional.',
    folders: ['autonoms', 'persones', 'empreses'],
    related: ['ilt', 'vida-risc', 'malalties-greus'],
    news: ['Diferència entre incapacitat total, absoluta i gran invalidesa'],
    cta: 'Calcular protecció'
  },
  'hospitalitzacio': {
    name: 'Hospitalització',
    intent: 'Indemnització per dies d\'ingrés',
    audience: 'Persones que volen una compensació diària si han de ser ingressades a un hospital, independentment d\'altres cobertures.',
    covers: 'Quantitat diària per cada dia d\'hospitalització fins al límit pactat. Compatible amb salut i ILT.',
    review: 'Quan canvia la situació familiar o financera.',
    folders: ['persones', 'autonoms'],
    related: ['salut-individual', 'ilt', 'accidents'],
    news: [],
    cta: 'Revisar la meva protecció'
  },
  'salut-individual': {
    name: 'Salut individual',
    intent: 'Accés a sanitat privada',
    audience: 'Persones que volen accés a especialistes, proves diagnòstiques i hospitals privats sense passar per llistes d\'espera.',
    covers: 'Quadre mèdic, urgències, especialistes, proves diagnòstiques, hospitalització i, segons modalitat, reemborsament de despeses.',
    review: 'Cada vegada que canvien necessitats (edat, embaràs, malalties cròniques).',
    folders: ['persones', 'autonoms'],
    related: ['salut-familiar', 'hospitalitzacio', 'malalties-greus'],
    news: ['Quadre mèdic vs reemborsament: què escollir'],
    cta: 'Revisar la meva salut'
  },
  'salut-familiar': {
    name: 'Salut familiar',
    intent: 'Salut per a tota la família',
    audience: 'Famílies que volen accés a sanitat privada per a tots els membres amb condicions de pòlissa de grup.',
    covers: 'Mateixes prestacions que salut individual, amb tarifes ajustades per grup familiar.',
    review: 'Quan neix un fill, canvia l\'estat familiar o l\'edat dels assegurats.',
    folders: ['persones'],
    related: ['salut-individual', 'salut-collectiva'],
    news: [],
    cta: 'Demanar pressupost'
  },
  'salut-collectiva': {
    name: 'Salut col·lectiva',
    intent: 'Salut per a empleats',
    audience: 'Empreses que volen oferir assegurança de salut com a benefici per als seus empleats, amb avantatges fiscals.',
    covers: 'Salut per a tots o part dels empleats, amb deducció fiscal per a l\'empresa i tributació favorable per al treballador (fins a 500 €/any).',
    review: 'Anualment per revisar prima/empleat i quadre mèdic.',
    folders: ['empreses'],
    related: ['vida-collectiu', 'accidents-conveni', 'ppe'],
    news: ['Avantatges fiscals de la salut col·lectiva per a empresa i empleat'],
    cta: 'Revisar beneficis d\'empresa'
  },
  'vida-risc': {
    name: 'Vida risc',
    intent: 'Capital per a la família',
    audience: 'Persones amb família, hipoteca o responsabilitats econòmiques sobre tercers.',
    covers: 'Capital econòmic en cas de defunció o invalidesa absoluta. Pot incloure cobertures complementàries com malalties greus.',
    review: 'Cada vegada que canvia una circumstància vital: compra de casa, naixement, canvi laboral. Mínim cada 3 anys.',
    folders: ['persones', 'autonoms'],
    related: ['vida-hipoteca', 'accidents', 'beneficiaris', 'malalties-greus'],
    news: ['Com calcular el capital de vida que necessites', 'La vida de la hipoteca cobreix el banc, no la teva família'],
    cta: 'Revisar la meva protecció familiar'
  },
  'vida-hipoteca': {
    name: 'Vida hipoteca',
    intent: 'Per a una hipoteca, però no per a la teva família',
    audience: 'Persones amb hipoteca, contractada habitualment amb el banc.',
    covers: 'Capital igual al deute pendent en cas de defunció. Garanteix la cancel·lació del préstec hipotecari.',
    review: 'A la firma de la hipoteca i posteriorment cada any per evitar lligar-la al banc i poder canviar-la.',
    folders: ['persones'],
    related: ['vida-risc', 'beneficiaris'],
    news: ['Per què no és obligatori contractar la vida hipoteca amb el banc'],
    cta: 'Revisar la meva vida'
  },
  'accidents': {
    name: 'Accidents',
    intent: 'Capital en cas d\'accident',
    audience: 'Persones que volen una protecció específica per a accidents (laborals, domèstics, esportius o de circulació).',
    covers: 'Capital per defunció o invalidesa per accident, indemnització diària, despeses mèdiques.',
    review: 'Quan canvia l\'activitat professional o esportiva habitual.',
    folders: ['persones', 'autonoms', 'collectius'],
    related: ['vida-risc', 'ilt', 'hospitalitzacio'],
    news: [],
    cta: 'Revisar protecció per accident'
  },
  'dependencia': {
    name: 'Dependència',
    intent: 'Renda en cas de gran dependència',
    audience: 'Persones que volen protegir-se davant una pèrdua d\'autonomia en l\'edat avançada o per malaltia.',
    covers: 'Renda mensual o capital en cas de declaració de dependència severa o gran dependència.',
    review: 'A partir dels 40-50 anys, quan és més assequible contractar-la.',
    folders: ['persones', 'previsio'],
    related: ['vida-risc', 'malalties-greus'],
    news: [],
    cta: 'Parlar de previsió'
  },
  'decessos': {
    name: 'Decessos',
    intent: 'Despeses funeràries cobertes',
    audience: 'Persones que volen evitar que la família hagi de gestionar despeses i tràmits en un moment difícil.',
    covers: 'Despeses del funeral i serveis associats. Pot incloure assistència en viatge i altres extres.',
    review: 'Cada 3-5 anys per actualitzar capitals.',
    folders: ['persones'],
    related: ['vida-risc', 'beneficiaris'],
    news: [],
    cta: 'Demanar més informació'
  },
  'accidents-conveni': {
    name: 'Accidents de conveni',
    intent: 'Obligació empresarial per conveni',
    audience: 'Empreses que han de complir l\'obligació d\'accidents segons conveni col·lectiu (construcció, metall, transport, hostaleria, etc.).',
    covers: 'Capitals mínims per defunció i invalidesa segons conveni. Pot ampliar-se voluntàriament.',
    review: 'Anualment i cada vegada que canvia el conveni de referència.',
    folders: ['empreses'],
    related: ['vida-collectiu', 'ilt-directius', 'salut-collectiva'],
    news: ['Com saber si la teva empresa compleix bé l\'accidents de conveni'],
    cta: 'Revisar accidents de conveni'
  },
  'vida-collectiu': {
    name: 'Vida col·lectiu',
    intent: 'Protecció de vida per a empleats',
    audience: 'Empreses que volen oferir vida risc com a benefici social per a tota la plantilla o un col·lectiu.',
    covers: 'Capital per defunció i invalidesa per a cada empleat assegurat, amb tarifes de grup.',
    review: 'Anualment per ajustar capitals i plantilla.',
    folders: ['empreses'],
    related: ['accidents-conveni', 'salut-collectiva', 'ppe'],
    news: [],
    cta: 'Revisar beneficis d\'empresa'
  },
  'ilt-directius': {
    name: 'ILT directius',
    intent: 'Baixa laboral per a càrrecs clau',
    audience: 'Empreses que volen protegir directius, socis o persones clau davant una baixa que afectaria les seves responsabilitats.',
    covers: 'Indemnització diària o capital durant el període de baixa, amb capitals superiors als de conveni.',
    review: 'Anualment.',
    folders: ['empreses'],
    related: ['ilt', 'home-clau', 'malalties-greus'],
    news: [],
    cta: 'Revisar protecció de directius'
  },
  'home-clau': {
    name: 'Home / dona clau',
    intent: 'Protecció davant la pèrdua d\'una persona clau',
    audience: 'Empreses que depenen d\'una persona estratègica (fundador, comercial principal, tècnic únic) i volen capital de transició.',
    covers: 'Capital únic per a l\'empresa en cas de defunció o invalidesa de la persona designada, per cobrir pèrdua de coneixement, clients o operativa.',
    review: 'Cada vegada que canvia l\'estructura de l\'empresa.',
    folders: ['empreses'],
    related: ['socis', 'vida-collectiu', 'business-travel'],
    news: ['Quan té sentit una assegurança de home clau'],
    cta: 'Parlar de protecció empresarial'
  },
  'socis': {
    name: 'Assegurança de socis',
    intent: 'Continuïtat societària davant defunció d\'un soci',
    audience: 'Empreses amb dos o més socis que volen liquiditat per recomprar participacions si un soci mor o queda incapacitat.',
    covers: 'Capital perquè els socis supervivents puguin comprar les participacions a la família del soci difunt, sense descapitalitzar l\'empresa.',
    review: 'Cada vegada que canvia l\'estructura societària o el valor de l\'empresa.',
    folders: ['empreses'],
    related: ['home-clau', 'vida-risc', 'beneficiaris'],
    news: [],
    cta: 'Parlar de continuïtat empresarial'
  },
  'business-travel': {
    name: 'Business Travel Accident',
    intent: 'Cobertura per a desplaçaments professionals',
    audience: 'Empreses amb empleats que viatgen per feina nacional o internacionalment.',
    covers: 'Accidents, assistència en viatge, despeses mèdiques i repatriació durant els desplaçaments professionals.',
    review: 'Anualment i en canvis de política de viatges.',
    folders: ['empreses'],
    related: ['accidents', 'vida-collectiu'],
    news: [],
    cta: 'Revisar cobertura de viatges'
  },
  'retribucio-flexible': {
    name: 'Retribució flexible',
    intent: 'Beneficis assegurats amb avantatge fiscal',
    audience: 'Empreses que volen oferir beneficis (salut, transport, formació) com a part flexible de la retribució amb optimització fiscal.',
    covers: 'Diversos productes asseguradors integrats en un sistema de retribució flexible amb deduccions per a l\'empleat.',
    review: 'Anualment.',
    folders: ['empreses'],
    related: ['salut-collectiva', 'ppe', 'ppse'],
    news: [],
    cta: 'Revisar beneficis d\'empresa'
  },
  'pias': {
    name: 'PIAS',
    intent: 'Pla Individual d\'Estalvi Sistemàtic',
    audience: 'Persones que volen estalviar a llarg termini amb un tractament fiscal favorable si es rescata com a renda vitalícia.',
    covers: 'Acumulació de capital amb tractament fiscal favorable. Les aportacions són limitades per llei i el rescat com a renda vitalícia després de 5 anys gaudeix d\'exempcions parcials.',
    review: 'Anualment, especialment quan canvia la fiscalitat o els ingressos.',
    folders: ['previsio', 'persones'],
    related: ['sialp', 'vida-estalvi', 'renda-vitalicia'],
    news: ['PIAS o pla de pensions: en què es diferencien'],
    cta: 'Parlar de previsió'
  },
  'sialp': {
    name: 'SIALP',
    intent: 'Estalvi a llarg termini amb avantatge fiscal',
    audience: 'Persones que volen estalviar amb capital garantit i exempció fiscal sobre el rendiment si es manté 5 anys.',
    covers: 'Producte d\'estalvi amb límit anual d\'aportació i exempció fiscal sobre el rendiment si es manté el termini.',
    review: 'Anualment.',
    folders: ['previsio', 'persones'],
    related: ['pias', 'vida-estalvi'],
    news: [],
    cta: 'Parlar de previsió'
  },
  'ppa': {
    name: 'PPA',
    intent: 'Pla de Previsió Assegurat',
    audience: 'Persones que volen un pla de previsió amb rendibilitat garantida com a alternativa als plans de pensions.',
    covers: 'Acumulació d\'estalvi amb deducció fiscal, similar al pla de pensions però amb garantia.',
    review: 'Anualment.',
    folders: ['previsio'],
    related: ['ppse', 'pias'],
    news: [],
    cta: 'Parlar de previsió'
  },
  'ppse': {
    name: 'PPSE',
    intent: 'Pla de Previsió Social Empresarial',
    audience: 'Empreses que volen oferir un instrument de previsió als seus empleats amb avantatges fiscals.',
    covers: 'Aportacions empresarials i del treballador a un sistema de previsió amb fiscalitat favorable.',
    review: 'Anualment.',
    folders: ['empreses', 'previsio'],
    related: ['ppe', 'retribucio-flexible'],
    news: [],
    cta: 'Revisar beneficis d\'empresa'
  },
  'ppe': {
    name: 'PPE',
    intent: 'Pla de Pensions d\'Empresa',
    audience: 'Empreses que volen instrumentar compromisos per pensions a través d\'un pla específic.',
    covers: 'Compromisos per pensions externalitzats en un pla d\'empresa, amb tractament fiscal específic.',
    review: 'Anualment.',
    folders: ['empreses', 'previsio'],
    related: ['ppse', 'retribucio-flexible'],
    news: [],
    cta: 'Revisar beneficis d\'empresa'
  },
  'vida-estalvi': {
    name: 'Vida estalvi',
    intent: 'Estalvi amb cobertura de vida',
    audience: 'Persones que volen acumular capital combinant estalvi i una cobertura mínima en cas de defunció.',
    covers: 'Acumulació periòdica amb interès tècnic garantit, més capital de vida bàsic.',
    review: 'Cada 2-3 anys.',
    folders: ['previsio', 'persones'],
    related: ['pias', 'unit-linked'],
    news: [],
    cta: 'Parlar de previsió'
  },
  'renda-vitalicia': {
    name: 'Renda vitalícia',
    intent: 'Cobrar una renda mentre visquis',
    audience: 'Persones que han acumulat un capital (jubilació, herència, indemnització) i volen convertir-lo en una renda mensual mentre visquin.',
    covers: 'Pagament periòdic (mensual, trimestral, anual) durant tota la vida. Pot incloure capital reservat per a hereus.',
    review: 'Comparar amb altres opcions abans de contractar.',
    folders: ['previsio'],
    related: ['renda-temporal', 'pias', 'liquiditat'],
    news: ['Quan té sentit una renda vitalícia: avantatges fiscals i precaucions'],
    cta: 'Parlar de previsió'
  },
  'renda-temporal': {
    name: 'Renda temporal',
    intent: 'Cobrar una renda durant un temps fix',
    audience: 'Persones que volen una renda durant un període concret (10, 15, 20 anys) en lloc de tota la vida.',
    covers: 'Pagament periòdic durant els anys pactats.',
    review: 'Comparar amb renda vitalícia i altres alternatives.',
    folders: ['previsio'],
    related: ['renda-vitalicia', 'pias'],
    news: [],
    cta: 'Parlar de previsió'
  },
  'unit-linked': {
    name: 'Unit linked',
    intent: 'Vida estalvi vinculat a fons',
    audience: 'Persones amb capital disponible que volen invertir mantenint una estructura asseguradora.',
    covers: 'Estalvi assegurat vinculat a fons d\'inversió. El client assumeix el risc de mercat, però manté el marc fiscal i successori d\'una assegurança de vida.',
    review: 'Anualment.',
    folders: ['previsio'],
    related: ['vida-estalvi', 'pias'],
    news: ['Unit linked: en què es diferencia d\'un fons d\'inversió normal'],
    cta: 'Parlar de previsió'
  },
  'beneficiaris': {
    name: 'Designació de beneficiaris',
    intent: 'Qui cobra i quan',
    audience: 'Qualsevol persona amb assegurances de vida, accidents o estalvi vol revisar que els beneficiaris són els correctes i actualitzats.',
    covers: 'La clàusula de beneficiaris determina qui rep la prestació, en quina proporció i amb quin règim fiscal. És sovint el punt més oblidat d\'una pòlissa.',
    review: 'Cada vegada que canvia la situació familiar: matrimoni, divorci, naixements, defuncions, herències.',
    folders: ['persones', 'previsio'],
    related: ['vida-risc', 'planificacio', 'liquiditat'],
    news: ['Per què els beneficiaris són la clàusula més oblidada'],
    cta: 'Revisar els meus beneficiaris'
  },
  'planificacio': {
    name: 'Planificació successòria',
    intent: 'Ordenar el traspàs patrimonial',
    audience: 'Persones amb patrimoni o empresa que volen planificar el traspàs amb les eines asseguradores adequades.',
    covers: 'Combinació de productes asseguradors per ordenar liquiditat, fiscalitat i beneficiaris en el moment de la transmissió.',
    review: 'Cada 5 anys o davant canvis vitals/patrimonials significatius.',
    folders: ['previsio', 'persones'],
    related: ['beneficiaris', 'liquiditat', 'renda-vitalicia'],
    news: [],
    cta: 'Parlar de successió'
  },
  'liquiditat': {
    name: 'Liquiditat per a hereus',
    intent: 'Que la família tingui liquiditat immediata',
    audience: 'Famílies amb patrimoni il·líquid (immobles, empresa) que necessiten cobrir despeses i impost de successions a curt termini.',
    covers: 'Capital de vida específic per cobrir despeses i impostos perquè la família no hagi de vendre actius amb pressa.',
    review: 'Cada vegada que canvia el patrimoni o la situació familiar.',
    folders: ['previsio', 'persones'],
    related: ['vida-risc', 'planificacio', 'beneficiaris'],
    news: [],
    cta: 'Parlar de successió'
  },
  'casals': {
    name: 'Casals i colònies',
    intent: 'Cobertura per a activitats de lleure',
    audience: 'Entitats, escoles i empreses que organitzen casals d\'estiu, esplais o colònies amb participants menors d\'edat.',
    covers: 'Accidents per a participants i monitors, responsabilitat civil de l\'entitat, defensa jurídica i, si cal, assistència en viatge.',
    review: 'Cada any abans d\'iniciar l\'activitat.',
    folders: ['collectius'],
    related: ['campus', 'voluntariat', 'rc-activitats'],
    news: ['Cobertures obligatòries per a un casal d\'estiu'],
    cta: 'Cotitzar la meva activitat'
  },
  'campus': {
    name: 'Campus esportius',
    intent: 'Activitat esportiva organitzada',
    audience: 'Clubs i empreses que organitzen campus esportius (futbol, bàsquet, tennis, esquí, etc.).',
    covers: 'Accidents esportius, responsabilitat civil, monitors i organitzadors.',
    review: 'Cada temporada.',
    folders: ['collectius'],
    related: ['casals', 'rc-activitats'],
    news: [],
    cta: 'Cotitzar la meva activitat'
  },
  'formacio': {
    name: 'Formació SOC / CAP',
    intent: 'Cobertura obligatòria de l\'alumnat',
    audience: 'Centres i empreses que imparteixen formació subvencionada (SOC), CAP o formació contínua.',
    covers: 'Accidents d\'alumnes, responsabilitat civil del centre, formadors i organitzadors.',
    review: 'Per a cada acció formativa.',
    folders: ['collectius'],
    related: ['rc-activitats', 'voluntariat'],
    news: [],
    cta: 'Cotitzar la meva activitat'
  },
  'voluntariat': {
    name: 'Voluntariat',
    intent: 'Protecció per a voluntaris',
    audience: 'Entitats sense ànim de lucre i associacions que necessiten cobertura obligatòria per als seus voluntaris.',
    covers: 'Accidents i responsabilitat civil específica per a l\'activitat voluntària.',
    review: 'Anualment.',
    folders: ['collectius'],
    related: ['rc-activitats'],
    news: [],
    cta: 'Cotitzar la meva activitat'
  },
  'esdeveniments': {
    name: 'Esdeveniments',
    intent: 'Cobertura per a esdeveniments puntuals',
    audience: 'Organitzadors d\'esdeveniments culturals, esportius, festius o corporatius.',
    covers: 'Accidents, RC, assistència sanitària, defensa jurídica i en alguns casos cancel·lació.',
    review: 'Per a cada esdeveniment.',
    folders: ['collectius'],
    related: ['rc-activitats', 'campus'],
    news: [],
    cta: 'Cotitzar el meu esdeveniment'
  },
  'rc-activitats': {
    name: 'Responsabilitat civil',
    intent: 'Cobertura davant reclamacions de tercers',
    audience: 'Qualsevol activitat oberta a persones (alumnes, participants, públic) que pot generar reclamacions per danys.',
    covers: 'Indemnitzacions a tercers per danys materials, personals o econòmics derivats de l\'activitat.',
    review: 'Cada any o quan canvia el tipus d\'activitat.',
    folders: ['collectius', 'empreses'],
    related: ['casals', 'esdeveniments', 'voluntariat'],
    news: [],
    cta: 'Cotitzar la meva activitat'
  }
};

const FOLDER_NAMES = {
  'persones': 'Persones',
  'autonoms': 'Autònoms',
  'empreses': 'Empreses',
  'collectius': 'Col·lectius',
  'previsio': 'Previsió'
};

function openProduct(slug) {
  const p = PRODUCTS[slug];
  if (!p) return;
  const body = document.getElementById('modalBody');

  let html = '<span class="prod-eyebrow">' + p.intent + '</span>';
  html += '<h2>' + p.name + '</h2>';

  if (p.audience) {
    html += '<div class="prod-section"><h4>Per a qui</h4><p>' + p.audience + '</p></div>';
  }
  if (p.covers) {
    html += '<div class="prod-section"><h4>Què cobreix</h4><p>' + p.covers + '</p></div>';
  }
  if (p.review) {
    html += '<div class="prod-section"><h4>Quan revisar-ho</h4><p>' + p.review + '</p></div>';
  }

  // Carpetes on en parlem
  if (p.folders && p.folders.length) {
    html += '<div class="prod-section"><h4>Seccions on en parlem</h4><div class="modal-related">';
    p.folders.forEach(f => {
      html += '<a href="#' + f + '" onclick="closeProduct()">' + (FOLDER_NAMES[f] || f) + '</a>';
    });
    html += '</div></div>';
  }

  // Productes relacionats
  if (p.related && p.related.length) {
    html += '<div class="prod-section"><h4>Productes relacionats</h4><div class="modal-related">';
    p.related.forEach(r => {
      if (PRODUCTS[r]) {
        html += '<a onclick="openProduct(\'' + r + '\')">' + PRODUCTS[r].name + '</a>';
      }
    });
    html += '</div></div>';
  }

  // Notícies / contingut relacionat
  if (p.news && p.news.length) {
    html += '<div class="prod-section"><h4>Llegir i aprofundir</h4><div class="modal-related">';
    p.news.forEach(n => {
      html += '<a class="related-news">' + n + '</a>';
    });
    html += '</div></div>';
  }

  // CTA
  html += '<div class="modal-cta">';
  html += '<a class="btn btn-primary" href="#diagnostic" onclick="closeProduct()">' + (p.cta || 'Fer diagnòstic') + '</a>';
  html += '<a class="btn btn-ghost" href="mailto:hola@covera.es">Parlar amb COVERA</a>';
  html += '</div>';

  body.innerHTML = html;
  body.scrollTop = 0;
  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProduct() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('productModal').classList.contains('open')) {
    closeProduct();
  }
});

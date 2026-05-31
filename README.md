# COVERA — Web especialista

Corredoria d'assegurances catalana. Web SPA d'una sola pàgina amb arquitectura net, orientada a conversió i amb fitxes funcionals de producte.

## Arquitectura

Tres fitxers:

- `index.html` — estructura semàntica i contingut editorial
- `styles.css` — design tokens i estils (paleta cobalt + menta + arena)
- `app.js` — diagnòstic multi-pas, cotitzador, modal de fitxes de producte

Cap dependència de build, frameworks ni JS extern. Tipografia via Google Fonts (Montserrat + Inter + Fraunces).

## Estructura de la home

1. **Header net** — Logo + nav (Persones, Autònoms, Empreses, Col·lectius, Previsió, Productes, Recursos) + botó "Fer diagnòstic"
2. **Hero** — Missatge dominant: "Protegim persones, ingressos i *futur*"
3. **Intent** — 5 cards "Què vols protegir?" (ingressos, família, equip, activitat, futur)
4. **Diagnòstic** — Bloc destacat amb formulari de 5 passos
5. **Productes** — 7 categories amb tags clicables que obren fitxes funcionals
6. **Mètode** — 5 passos del mètode COVERA (entenem, detectem, prioritzem, proposem, revisem)
7. **Cotitzador** — Eina específica per a col·lectius i activitats
8. **Pull quote** — Diferencial del comparador / banc / asseguradora
9. **Perfils** — 5 seccions detallades (Persones, Autònoms, Empreses, Col·lectius, Previsió)
10. **Recursos** — Cards de guies, calculadores i checklists
11. **CTA final** — Doble crida: diagnòstic + contacte
12. **Footer** — Quatre columnes + marc legal DGSFP

## Fitxes funcionals de producte

Les ~37 etiquetes de producte (ILT, Vida risc, PIAS, SIALP, Accidents conveni, etc.) són **clicables**. En obrir-ne una, es mostra un modal lateral amb:

- **Posicionament** del producte (intent)
- **Per a qui** és
- **Què cobreix**
- **Quan revisar-ho**
- **Seccions on en parlem** — chips clicables que porten a Persones / Autònoms / Empreses / Col·lectius / Previsió
- **Productes relacionats** — chips que obren altres fitxes
- **Llegir i aprofundir** — chips amb títols d'articles relacionats (placeholders ara, futurs articles del blog)
- **CTA** — botó al diagnòstic + botó de contacte

Tota la base de dades de productes està a `app.js` (objecte `PRODUCTS`) i es pot ampliar afegint noves entrades.

## Què cal substituir abans del llançament

| Element | Ubicació | A substituir |
|---|---|---|
| `DGSFP J-XXXX` / `J-0000` | `index.html`, hero i footer | Número real de la DGSFP |
| `CIF B00000000` | footer | CIF real de la S.L. |
| `hola@covera.es` | múltiples llocs | Email real |
| Coeficients del cotitzador | `app.js`, funció `cotitzar()` | Tarifes reals consensuades amb la mutualitat (ARAG, FIATC, Mutua General, etc.) |
| Endpoint del diagnòstic | `app.js`, funció `diagSubmit()` | URL del CRM real (HubSpot, Brevo o similar) |
| Articles "Llegir i aprofundir" | `app.js`, `PRODUCTS[*].news` | Quan tinguis el blog actiu, substituir per links reals |
| Recursos descarregables | `index.html`, secció recursos | PDFs reals quan estiguin preparats |

## Deployment

### GitHub Pages
```bash
git add index.html styles.css app.js
git commit -m "Web especialista — iteració 3"
git push origin main
```
Settings → Pages → branch `main` /root.

### Netlify
Drag-and-drop dels 3 fitxers a [app.netlify.com/drop](https://app.netlify.com/drop). Acabes amb un domini `*.netlify.app` que pots apuntar a covera.es.

### Vercel
```bash
npx vercel --prod
```

## Roadmap pendent (consultoria)

- **Peça 4** — Recursos imant: guies, checklists i calculadores reals (4-6 peces) per omplir la secció Recursos i alimentar leads SEO + lead magnets.
- **Peça 5** — Motor LinkedIn: optimització de perfil, pilars de contingut, primer tanda de 12-16 posts per a les 6 primeres setmanes.

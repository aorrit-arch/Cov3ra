# COVERA — Web corredoria

Web d'una sola pàgina (SPA) per a la corredoria d'assegurances **COVERA**, construïda amb estètica de Finder/macOS: navegació per carpetes, fitxers `.md` que s'obren com a documents i `.app` que llancen Diagnòstic i Cotitzador.

---

## Estructura del projecte

```
covera-web/
├── index.html      → estructura HTML (vistes, símbols SVG, contingut)
├── styles.css      → estils complets (variables de marca, layout, components)
├── app.js          → comportament (navegació, diagnòstic, cotitzador, menubar)
└── README.md       → aquest fitxer
```

És un projecte estàtic, sense build i sense dependències de Node. Funciona obrint `index.html` directament al navegador, però per a producció s'ha de servir des d'un servidor web (HTTP), no des de `file://`, perquè algunes característiques (clipboard API, fonts) requereixen un origen segur.

---

## Desplegament

### GitHub Pages
1. Crea un repositori i puja els tres fitxers (`index.html`, `styles.css`, `app.js`).
2. A *Settings → Pages*, selecciona la branca `main` i la carpeta `/ (root)`.
3. La web estarà disponible a `https://<usuari>.github.io/<repositori>/`.

### Netlify / Vercel
Arrossega la carpeta `covera-web/` directament al panell de Netlify/Vercel o connecta el repositori de GitHub. Sense configuració.

### Hosting tradicional (Hostinger, IONOS, etc.)
Puja els tres fitxers a la carpeta `public_html/` per FTP. Apunta el domini `covera.es` al hosting.

---

## Què cal personalitzar abans de llançar

| On | Què canviar |
|---|---|
| `index.html` (footer status bar i Sobre.md) | Substituir `J-0000` pel número real de registre **DGSFP** i `B00000000` pel **CIF** real. |
| `index.html` (Sobre.md i menubar Ajuda) | Substituir `hola@covera.es` pel correu de contacte real. |
| `index.html` (totes les `.md`) | Revisar els textos de marketing per validar to i missatges definitius. |
| `app.js` (funció `cotitzar()`) | Substituir els multiplicadors orientatius pels reals de les mutualitats amb qui treballis. Ara són **estimacions**, no preus reals. |
| `app.js` (funció `diagSubmit()`) | Connectar el `fetch()` a un endpoint del teu CRM (HubSpot Forms API, Brevo, Mailchimp o webhook propi). Ara guarda les respostes només en memòria. |

---

## Estructura interna

### Vistes
Cada "carpeta" o "fitxer" és un `<div class="view">` o `<div class="doc-view">` dins de `<div id="content">`. La funció `navigate(view)` a `app.js` mostra una vista i amaga les altres.

Per afegir una nova carpeta:
1. Afegeix una entrada nova a l'objecte `titles` a `app.js`.
2. Afegeix la vista nova a `index.html` amb `id="view-<nom>"`.
3. Afegeix l'enllaç corresponent a la sidebar i, si cal, al menubar.

### Menubar
Els 5 menús (COVERA, Fitxer, Edita, Visualitza, Ajuda) són desplegables nadius amb les funcions:
- `toggleMenu(name)` — obre/tanca un menú.
- `focusSearch()` — fa focus al camp de cerca.
- `copyCurrentUrl()` — copia al porta-retalls la URL del moment.

### Diagnòstic
Formulari multi-pas controlat per `diagAnswer()`, `diagBack()` i `diagSubmit()`. Les respostes es desen a `diagAnswers` (objecte JS en memòria). Per connectar-ho a un CRM, edita `diagSubmit()` perquè faci `fetch()` al teu endpoint.

### Cotitzador
La funció `cotitzar()` recalcula la prima en temps real cada vegada que canvia un input. Els multiplicadors estan al principi de la funció.

---

## Compatibilitat

- Navegadors moderns (Chrome, Safari, Firefox, Edge — últimes dues versions).
- Mòbil: la finestra ocupa tota la pantalla, sidebar es converteix en panell lateral lliscant.
- Sense IE11 (utilitza `backdrop-filter`, `grid`, ES6 i altres APIs modernes).

---

## Marc regulatori

COVERA Correduría de Seguros, S.L. — inscrita a la **Direcció General d'Assegurances i Fons de Pensions (DGSFP)**. La web mostra dades regulatòries al peu i a `Sobre.md`. **Substitueix els valors placeholder per les dades reals abans de publicar**.

---

*Última actualització: 31 de maig de 2026*

# Været som var

Mobiltilpasset webapp som viser historisk nedbør for et valgt sted og en valgt periode.

## Teknologi

- React + TypeScript + Vite
- Recharts for diagrammer
- Open-Meteo Geocoding, Forecast og Historical Weather API
- localStorage for siste steder

## Kom i gang

```bash
npm install
npm run dev
```

Åpne adressen Vite viser (vanligvis http://localhost:5173).

## Bygg for produksjon

```bash
npm run build
```

Statiske filer havner i `dist/`.

Forhåndsvis bygget versjon lokalt:

```bash
npm run preview
```

## Publisering på GitHub Pages

1. Opprett et GitHub-repo og push koden.
2. I `vite.config.ts`, sett `base` til repo-navnet ditt:
   ```ts
   base: '/<repo-navn>/',
   ```
3. Kjør `npm run build`.
4. Publiser innholdet i `dist/` med GitHub Actions eller ved å bruke `gh-pages`-branchen.

### Enkel GitHub Actions-workflow

Opprett `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

Aktiver GitHub Pages med kilde «GitHub Actions» i repo-innstillingene.

## Funksjonalitet

- Stedsøk med debounce og norske tegn
- Tre siste steder lagres automatisk
- Hurtigvalg for 7, 14, 30 og 90 dager, pluss egendefinert periode
- Nedbør i millimeter med sammendrag og søylediagram
- Automatisk valg av Forecast- eller Historical API avhengig av periode

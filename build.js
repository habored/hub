const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

// Sources
const dataDir = path.join(rootDir, 'data');
const dataPath = path.join(dataDir, 'tools.json');
const imgDir = path.join(dataDir, 'img');

const appPath = path.join(rootDir, 'app.js');
const stylesPath = path.join(rootDir, 'styles.css');

// Chargement des données
const rawData = fs
  .readFileSync(dataPath, 'utf8')
  .replace(/^\uFEFF/, '');

const data = JSON.parse(rawData);

const pages = Array.isArray(data.pages)
  ? data.pages
  : [];

const commonLinks = Array.isArray(data.common_links)
  ? data.common_links
  : [];

const teacherCommonLinks = Array.isArray(data.teachers_common_links)
  ? data.teachers_common_links
  : [];

// Fusion des outils avec suppression des doublons
const mergeTools = (pageTools = []) => {
  const merged = [
    ...commonLinks,
    ...teacherCommonLinks,
    ...pageTools
  ];

  const seen = new Set();

  return merged.filter((tool) => {
    const key = (tool?.name || '').trim().toLowerCase();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

// Nettoyage du dossier dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, {
    recursive: true,
    force: true
  });
}

// Création de dist
fs.mkdirSync(distDir, {
  recursive: true
});

// Copie de app.js
fs.copyFileSync(
  appPath,
  path.join(distDir, 'app.js')
);

// Copie de styles.css
fs.copyFileSync(
  stylesPath,
  path.join(distDir, 'styles.css')
);

// Copie des images
if (fs.existsSync(imgDir)) {
  fs.cpSync(
    imgDir,
    path.join(distDir, 'img'),
    {
      recursive: true
    }
  );
}

// Génération du HTML
const createPageHtml = (tools) => {
  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Portail</title>

    <link
      rel="stylesheet"
      href="./styles.css"
    />
  </head>

  <body>
    <main class="page-shell">
      <section class="toolbar">
        <label
          class="search-wrap"
          for="searchInput"
        >
          <span
            class="search-icon"
            aria-hidden="true"
          >⌕</span>

          <input
            id="searchInput"
            type="search"
            placeholder="Rechercher un outil"
            aria-label="Rechercher un outil"
          />
        </label>
      </section>

      <section
        id="tool-grid"
        class="tool-grid"
        aria-live="polite"
      ></section>
    </main>

    <script>
      window.__TOOLS__ = ${JSON.stringify(tools)};
    </script>

    <script src="./app.js"></script>
  </body>
</html>`;
};

// Page d'accueil
fs.writeFileSync(
  path.join(distDir, 'index.html'),
  createPageHtml(commonLinks),
  'utf8'
);

// Pages secondaires
for (const page of pages) {
  if (!page.slug) {
    console.warn('Page ignorée : slug manquant');
    continue;
  }

  const tools = mergeTools(page.tools || []);

  fs.writeFileSync(
    path.join(distDir, `${page.slug}.html`),
    createPageHtml(tools),
    'utf8'
  );
}

// Résumé
console.log('');
console.log('Build terminé avec succès.');
console.log('');
console.log(`Dossier de sortie : ${distDir}`);
console.log(`Pages générées : ${pages.length + 1}`);
console.log('- index.html');

for (const page of pages) {
  if (page.slug) {
    console.log(`- ${page.slug}.html`);
  }
}

console.log('');
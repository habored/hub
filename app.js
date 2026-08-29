const tools = window.__TOOLS__ || [];
const grid = document.getElementById('tool-grid');
const searchInput = document.getElementById('searchInput');

const normalize = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getSearchText = (tool) => {
  const name = tool?.name || '';
  const recherche = tool?.recherche || '';
  return [name, recherche].filter(Boolean).join(' ');
};

const buildCard = (tool) => {
  const name = tool.name || 'Outil';
  const searchText = getSearchText(tool);
  const imageUrl = tool.image && String(tool.image).trim();
  const hasImage = Boolean(imageUrl);

  if (hasImage) {
    return `
      <a class="tool-card" href="${tool.url || '#'}" target="_blank" rel="noopener noreferrer" aria-label="${searchText}">
        <img src="${imageUrl}" alt="${searchText}" loading="lazy" />
      </a>
    `;
  }

  return `
    <a class="tool-card" href="${tool.url || '#'}" target="_blank" rel="noopener noreferrer" aria-label="${searchText}">
      <span class="tool-label">${name}</span>
    </a>
  `;
};

const renderTools = (items) => {
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '<div class="empty-state">Aucun outil ne correspond à votre recherche.</div>';
    return;
  }

  grid.innerHTML = items.map(buildCard).join('');
};

const applyFilter = () => {
  const query = normalize(searchInput ? searchInput.value.trim() : '');

  if (!query) {
    renderTools(tools);
    return;
  }

  const filtered = tools.filter((tool) => {
    const haystack = getSearchText(tool);
    return normalize(haystack).includes(query);
  });

  renderTools(filtered);
};

searchInput?.addEventListener('input', applyFilter);
renderTools(tools);

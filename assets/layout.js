function getCurrentPageName() {
  const path = window.location.pathname;
  const name = path.slice(path.lastIndexOf('/') + 1);
  return name || 'index.html';
}

const PAGE_SECTION_ALIASES = {
  'weapon.html': 'weapons.html',
  'weapon-type.html': 'weapons.html',
  'daggers.html': 'weapons.html',
  'swords.html': 'weapons.html'
};

const PAGE_LABELS = {
  'index.html': 'Home',
  'items.html': 'Itens',
  'weapons.html': 'Armas',
  'weapon-type.html': 'Tipo de Arma',
  'weapon.html': 'Arma',
  'swords.html': 'Espadas',
  'armors.html': 'Armaduras',
  'accessories.html': 'Acessorios',
  'materials.html': 'Materiais',
  'consumables.html': 'Consumiveis',
  'cities.html': 'Cidades',
  'item.html': 'Item'
};

function getActiveSectionName() {
  const pageName = getCurrentPageName();

  if (pageName === 'item.html') {
    const source = new URLSearchParams(window.location.search).get('source');

    if (source) {
      if (source === 'daggers') {
        return 'weapons.html';
      }

      return `${source}.html`;
    }
  }

  return PAGE_SECTION_ALIASES[pageName] || pageName;
}

function resolveHref(target) {
  return new URL(target, document.baseURI).href;
}

async function loadWikiJson(relativePath) {
  if (window.location.protocol === 'file:') {
    throw new Error(
      'Abra esta wiki por HTTP. Use o servidor local em scripts/serve.ps1 ou publique no GitHub Pages.'
    );
  }

  const response = await fetch(resolveHref(relativePath));

  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar ${relativePath} (${response.status}).`);
  }

  return response.json();
}

function buildLink(href, label, active) {
  return `<a class="tab${active ? ' active' : ''}" href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

function buildSidebarLink(href, label, active) {
  return `<a class="${active ? 'active' : ''}" href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

function renderLayout(activePage) {
  const pageName = activePage || getCurrentPageName();
  const activeSection = getActiveSectionName();
  const currentHref = window.location.href;
  const currentLabel = PAGE_LABELS[pageName] || 'Item';

  const tabs = [
    { label: currentLabel, href: currentHref, active: true },
    { label: 'Inicio', href: resolveHref('index.html'), active: activeSection === 'index.html' },
    { label: 'Itens', href: resolveHref('items.html'), active: activeSection === 'items.html' },
    { label: 'Armas', href: resolveHref('weapons.html'), active: activeSection === 'weapons.html' },
    { label: 'Armaduras', href: resolveHref('armors.html'), active: activeSection === 'armors.html' },
    { label: 'Acessorios', href: resolveHref('accessories.html'), active: activeSection === 'accessories.html' },
    { label: 'Materiais', href: resolveHref('materials.html'), active: activeSection === 'materials.html' },
    { label: 'Consumiveis', href: resolveHref('consumables.html'), active: activeSection === 'consumables.html' },
    { label: 'Cidades', href: resolveHref('cities.html'), active: activeSection === 'cities.html' }
  ].filter((tab, index) => index === 0 || tab.href !== currentHref);

  const sidebar = `
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-mark">A</div>
        <strong>Arkhai Wiki</strong>
        <span>Codex do mundo antigo</span>
      </div>

      <nav class="side-section">
        <h3>Principal</h3>
        ${buildSidebarLink(resolveHref('index.html'), 'Home', activeSection === 'index.html')}
        ${buildSidebarLink(resolveHref('index.html#updates'), 'Mudancas recentes', activeSection === 'index.html')}
        ${buildSidebarLink(resolveHref('items.html'), 'Itens', activeSection === 'items.html')}
        ${buildSidebarLink(resolveHref('weapons.html'), 'Armas', activeSection === 'weapons.html')}
        ${buildSidebarLink(resolveHref('armors.html'), 'Armaduras', activeSection === 'armors.html')}
        ${buildSidebarLink(resolveHref('accessories.html'), 'Acessorios', activeSection === 'accessories.html')}
        ${buildSidebarLink(resolveHref('materials.html'), 'Materiais', activeSection === 'materials.html')}
        ${buildSidebarLink(resolveHref('consumables.html'), 'Consumiveis', activeSection === 'consumables.html')}
      </nav>

      <nav class="side-section">
        <h3>Atlas</h3>
        ${buildSidebarLink(resolveHref('cities.html'), 'Cidades', activeSection === 'cities.html')}
        ${buildSidebarLink(resolveHref('cities.html#khem-nippur'), 'Khem-Nippur', activeSection === 'cities.html')}
        ${buildSidebarLink(resolveHref('cities.html#hellas-assur'), 'Hellas-Assur', activeSection === 'cities.html')}
        ${buildSidebarLink(resolveHref('cities.html#ermo-de-nod'), 'Ermo de Nod', activeSection === 'cities.html')}
        ${buildSidebarLink(resolveHref('cities.html#silvan-arcadia'), 'Silvan-Arcadia', activeSection === 'cities.html')}
        ${buildSidebarLink(resolveHref('index.html#systems'), 'Sistemas', activeSection === 'index.html')}
        ${buildSidebarLink(resolveHref('index.html#crafting'), 'Crafting', activeSection === 'index.html')}
        ${buildSidebarLink(resolveHref('index.html#lore'), 'Lore', activeSection === 'index.html')}
      </nav>

      <nav class="side-section">
        <h3>Utilidades</h3>
        ${buildSidebarLink(resolveHref('index.html#upgrade'), 'Calculadora de Upgrade', activeSection === 'index.html')}
        ${buildSidebarLink(resolveHref('index.html#ascension'), 'Simulador de Ascensao', activeSection === 'index.html')}
      </nav>
    </aside>
  `;

  const topbar = `
    <header class="topbar">
      <nav class="tabs">
        ${tabs.map(tab => buildLink(tab.href, tab.label, tab.active)).join('')}
      </nav>
      <div class="search">
        <input type="search" placeholder="Pesquisar em Arkhai Wiki" />
      </div>
    </header>
  `;

  document.getElementById('wiki-sidebar').innerHTML = sidebar;
  document.getElementById('wiki-topbar').innerHTML = topbar;
}

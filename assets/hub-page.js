(function () {
  const hubCards = [
    {
      title: 'Cidades de Arkhai',
      icon: '🏛️',
      description: 'Hubs seguros, economicos e sociais conectados aos dominios e Dungeons.',
      href: 'cities.html'
    },
    {
      title: 'Balanceamento de Itens',
      icon: '⚔️',
      description: 'Base inicial para raridades, atributos, aprimoramento e ascensao.',
      href: 'items.html'
    },
    {
      title: 'Codex Ar-Khe',
      icon: '🜃',
      description: 'Fragmentos de lore, grimorios, essencias e historia do mundo.',
      href: '#lore'
    }
  ];

  const cityCards = [
    { title: 'Khem-Nippur', description: 'A Necropole de Ouro: almas, joalheria, venenos e memoria ancestral.', href: 'cities.html#khem-nippur' },
    { title: 'Hellas-Assur', description: 'A Agora de Marmore: treino, PvP amigavel e ferraria pesada.', href: 'cities.html#hellas-assur' },
    { title: 'Ermo de Nod', description: 'A Cidadela de Fuligem: polvora, runaria e alquimia sombria.', href: 'cities.html#ermo-de-nod' },
    { title: 'Silvan-Arcadia', description: 'O Vilarejo das Raizes: cura, tecelagem, furtividade e alquimia botanica.', href: 'cities.html#silvan-arcadia' }
  ];

  const itemGroups = [
    {
      title: 'Armas',
      description: 'Tipos de arma, familias publicadas e variantes por raridade e tier.',
      icon: '⚔️',
      href: 'weapons.html',
      links: [
        { label: 'Adagas', href: 'weapon-type.html?type=Adaga' },
        { label: 'Espadas', href: 'weapon-type.html?type=Espada' },
        { label: 'Cajados', href: 'weapon-type.html?type=Cajado' },
        { label: 'Arcos', href: 'weapon-type.html?type=Arco' },
        { label: 'Pistolas', href: 'weapon-type.html?type=Pistola' },
        { label: 'Martelos', href: 'weapon-type.html?type=Martelo' }
      ]
    },
    {
      title: 'Equipamentos de Corpo',
      description: 'Defesa, slots e conjuntos de armadura. A cobertura publica vai crescer por slot.',
      icon: '🛡️',
      href: 'armors.html',
      links: [
        { label: 'Capacetes', href: null },
        { label: 'Armaduras', href: 'armors.html' },
        { label: 'Escudos', href: null },
        { label: 'Calcas', href: null },
        { label: 'Spellbooks', href: null },
        { label: 'Botas', href: null },
        { label: 'Aljavas', href: null },
        { label: 'Extra Slot', href: null }
      ]
    },
    {
      title: 'Acessorios',
      description: 'Itens de suporte, builds especializadas e slots de reforco.',
      icon: '💍',
      href: 'accessories.html',
      links: [
        { label: 'Acessorios', href: 'accessories.html' },
        { label: 'Brincos', href: null },
        { label: 'Colares', href: null },
        { label: 'Anel', href: null },
        { label: 'Pulseiras', href: null }
      ]
    },
    {
      title: 'Coleta, Crafting e Refino',
      description: 'Blocos futuros para materiais, profissao, upgrade e progressao de suporte.',
      icon: '🪓',
      href: 'materials.html',
      links: [
        { label: 'Materiais', href: 'materials.html' },
        { label: 'Coleta', href: null },
        { label: 'Crafting', href: null },
        { label: 'Refino', href: null }
      ]
    }
  ];

  function renderHubCards() {
    return hubCards.map(card => `
      <article class="notice-card">
        <div class="notice-icon">${card.icon}</div>
        <div>
          <h2>${card.title}</h2>
          <p>${card.description}</p>
          <a href="${card.href}">Saiba mais →</a>
        </div>
      </article>
    `).join('');
  }

  function renderCityCards() {
    return cityCards.map(city => `
      <a class="city-card city-card-link" href="${city.href}">
        <strong>${city.title}</strong>
        <span>${city.description}</span>
      </a>
    `).join('');
  }

  function renderItemGroups() {
    return itemGroups.map(group => {
      const links = group.links.map(link => {
        if (link.href) {
          return `<a class="category-chip category-chip-link" href="${link.href}">${link.label}</a>`;
        }

        return `<span class="category-chip category-chip-muted">${link.label}</span>`;
      }).join('');

      return `
        <section class="category-group">
          <div class="category-group-head">
            <div class="category-group-title">
              <span class="category-group-icon">${group.icon}</span>
              <div>
                <h2>${group.title}</h2>
                <p>${group.description}</p>
              </div>
            </div>
            <a class="item-line-pill" href="${group.href}">Ver categoria</a>
          </div>
          <div class="category-chip-grid">
            ${links}
          </div>
        </section>
      `;
    }).join('');
  }

  function renderHomePage() {
    const updates = document.getElementById('updates');
    const cities = document.getElementById('cities-grid');

    if (updates) {
      updates.innerHTML = renderHubCards();
    }

    if (cities) {
      cities.innerHTML = renderCityCards();
    }
  }

  function renderItemsPage() {
    const categoriesGrid = document.getElementById('item-groups');

    if (categoriesGrid) {
      categoriesGrid.innerHTML = renderItemGroups();
    }
  }

  function renderCategoryPage(categoryName, options) {
    const title = document.getElementById('category-title');
    const actions = document.getElementById('category-actions');
    const status = document.getElementById('category-status');
    const intro = document.getElementById('category-intro');
    const source = document.getElementById('category-source');
    const subtle = document.getElementById('category-subtle');

    if (title) {
      title.textContent = categoryName;
    }

    if (actions) {
      actions.textContent = options.actions;
    }

    if (status) {
      status.textContent = options.status;
    }

    if (intro) {
      intro.innerHTML = options.introHtml;
    }

    if (source) {
      source.innerHTML = options.sourceHtml;
    }

    if (subtle) {
      subtle.textContent = options.subtle;
    }
  }

  window.renderHomePage = renderHomePage;
  window.renderItemsPage = renderItemsPage;
  window.renderCategoryPage = renderCategoryPage;
})();

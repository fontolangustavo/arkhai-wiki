(function () {
  const hubCards = [
    {
      title: 'Khem-Nippur',
      icon: '🏜️',
      description: 'Regiao inicial do deserto, necromancia, sol e artefatos antigos.',
      href: '#cities'
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
    { title: 'Khem-Nippur', description: 'O Bercario de Ouro, deserto, necromancia e sol.' },
    { title: 'Hellas-Assur', description: 'A Agora de Marmore, arenas, forja e disciplina marcial.' },
    { title: 'Ermo de Nod', description: 'A fronteira do esquecimento, neve, polvora e exilio.' },
    { title: 'Silvan-Arcadia', description: 'O santuario das raizes, alquimia botanica e cura.' }
  ];

  const categories = [
    { label: 'Armas', href: 'weapons.html', icon: '⚔️' },
    { label: 'Armaduras', href: 'armors.html', icon: '🛡️' },
    { label: 'Acessorios', href: 'accessories.html', icon: '💍' },
    { label: 'Consumiveis', href: 'consumables.html', icon: '🧪' }
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
      <div class="city-card">
        <strong>${city.title}</strong>
        <span>${city.description}</span>
      </div>
    `).join('');
  }

  function renderCategoryCards() {
    return categories.map(category => `
      <a class="category-link" href="${category.href}">
        <span class="category-icon">${category.icon}</span>
        <span>${category.label}</span>
      </a>
    `).join('');
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
    const categoriesGrid = document.getElementById('category-grid');

    if (categoriesGrid) {
      categoriesGrid.innerHTML = renderCategoryCards();
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

(function () {
  const source = 'daggers';
  const allowedSources = new Set([source]);
  const rarityClassMap = {
    Incomum: 'uncommon',
    Raro: 'rare',
    Epico: 'epic',
    Lendario: 'legendary'
  };

  let model = null;
  let currentLineId = null;
  let currentTier = null;
  let currentRequestedId = null;

  function renderList(title, entries) {
    if (!entries || entries.length === 0) {
      return '';
    }

    return `
      <h2 class="section-title">${title}</h2>
      <ul>
        ${entries.map(entry => `<li>${entry}</li>`).join('')}
      </ul>
    `;
  }

  function renderAscension(ascension) {
    if (!ascension) {
      return '';
    }

    return `
      <h2 class="section-title">Ascensao</h2>
      <div class="subtle-box">
        <p><strong>Origem:</strong> ${ascension.from}</p>
        <p><strong>Resultado:</strong> ${ascension.result}</p>
        <p><strong>Materiais:</strong></p>
        <ul>
          ${ascension.materials.map(material => `<li>${material}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function renderProgressionTable(line, activeVariant) {
    const rows = line.variants
      .map(variant => {
        const isActive = activeVariant && variant.id === activeVariant.id;

        return `
          <tr class="${isActive ? 'is-active' : ''}">
            <td><strong>${variant.rarityTier}</strong></td>
            <td>${variant.level}</td>
            <td>${variant.attack}</td>
            <td>${variant.criticalChance}</td>
            <td>${variant.penetration}</td>
            <td>${variant.poisonChance}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <h2 class="section-title">Progressao da linha</h2>
      <div class="subtle-box">A linha abaixo resume as quatro etapas da mesma arma. O seletor no topo troca apenas a variante ativa.</div>
      <table class="wiki-table progression-table">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Nivel</th>
            <th>Ataque</th>
            <th>Critico</th>
            <th>Perfuracao</th>
            <th>Veneno</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  function setSelectionFromUrl() {
    if (!model) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const selection = window.ArkhaiWikiData.getDaggersSelection(model, {
      id: currentRequestedId,
      lineId: params.get('line') || currentLineId,
      tier: params.get('tier') || currentTier
    });

    currentLineId = selection.line ? selection.line.lineId : currentLineId;
    currentTier = selection.variant ? selection.variant.internalTier : currentTier;
  }

  function syncUrl() {
    if (!currentLineId || !currentTier) {
      return;
    }

    const nextParams = new URLSearchParams({
      source,
      line: currentLineId,
      tier: currentTier
    });

    history.replaceState(null, '', `item.html?${nextParams.toString()}`);
    currentRequestedId = null;
  }

  function renderItem() {
    const content = document.getElementById('item-content');
    const title = document.getElementById('item-title');

    if (!model) {
      return;
    }

    const selection = window.ArkhaiWikiData.getDaggersSelection(model, {
      id: currentRequestedId,
      lineId: currentLineId,
      tier: currentTier
    });

    if (!selection.line || !selection.variant) {
      content.innerHTML = '<div class="status-line">Item nao encontrado na base de dados.</div>';
      return;
    }

    const line = selection.line;
    const item = selection.variant;
    currentLineId = line.lineId;
    currentTier = item.internalTier;
    const rarityClass = rarityClassMap[item.rarity] || '';
    const detailCardClass = rarityClass ? `detail-card rarity-${rarityClass}` : 'detail-card';
    const itemImage = `<img class="item-image" src="${item.image}" alt="${item.name}">`;
    const lineOptions = model.lineOrder.map(entry => {
      const active = entry.lineId === line.lineId ? 'selected' : '';
      return `<option value="${entry.lineId}" ${active}>${entry.displayName} (${entry.rarity})</option>`;
    }).join('');
    const tierOptions = line.variants.map(entry => {
      const active = entry.internalTier === item.internalTier ? 'selected' : '';
      return `<option value="${entry.internalTier}" ${active}>${entry.rarityTier} · Nv ${entry.level}</option>`;
    }).join('');

    title.textContent = item.name;
    document.title = `${item.name} - Arkhai Wiki`;
    document.getElementById('item-actions').textContent = `${item.rarityTier} · ${line.displayName}`;

    content.innerHTML = `
      <div class="status-line">
        Dados carregados de <strong>data/${source}.json</strong>, sincronizado com
        <strong>${item.sourceDocument}</strong>.
      </div>

      <div class="variant-switcher">
        <div class="variant-field">
          <label for="line-select">Raridade</label>
          <select id="line-select">
            ${lineOptions}
          </select>
        </div>
        <div class="variant-field">
          <label for="tier-select">Tier</label>
          <select id="tier-select">
            ${tierOptions}
          </select>
        </div>
      </div>

      <div class="subtle-box">
        <strong>${line.displayName}</strong> resume ${line.variantCount} variantes, indo de
        nivel ${line.firstVariant ? line.firstVariant.level : '-'} ate ${line.lastVariant ? line.lastVariant.level : '-'}. A variante ativa e
        <strong>${item.rarityTier}</strong>.
      </div>

      <div class="detail-layout">
        <div>
          <section class="item-spotlight">
            <figure>${itemImage}</figure>
            <div>
              <p>
                <strong>${item.name}</strong> pertence a familia ${item.family} de ${item.region}.
                Esta pagina usa os valores de design da fonte oficial de itens e equipamentos.
              </p>
              <p><strong>Raridade/Tier:</strong> <span class="rarity ${rarityClass}">${item.rarityTier}</span></p>
              <p><strong>Nivel do item:</strong> ${item.level}</p>
              <p><strong>Identidade:</strong> ${item.identity}</p>
            </div>
          </section>

          <h2 class="section-title">Descricao</h2>
          <p>${item.description || '-'}</p>

          <h2 class="section-title">Funcao</h2>
          <p>${item.function || '-'}</p>

          <h2 class="section-title">Gameplay</h2>
          <p>${item.gameplay || '-'}</p>

          <h2 class="section-title">Visual</h2>
          <p><strong>Silhueta:</strong> ${item.silhouette || '-'}</p>
          <p><strong>Visual:</strong> ${item.visual || '-'}</p>

          ${renderList('Receita inicial', item.initialRecipe)}
          ${renderAscension(item.ascension)}
          ${renderProgressionTable(line, item)}

          <h2 class="section-title">Fonte verdadeira</h2>
          <p><strong>Arquivo:</strong> ${item.sourceDocument}</p>
          <p><strong>Secao:</strong> ${item.sourceSection}</p>
        </div>

        <aside class="${detailCardClass}">
          <figure class="detail-image-frame">
            ${itemImage}
          </figure>
          <h2>${item.name}</h2>
          <div class="detail-row"><span class="detail-label">ID</span><span class="detail-value">${item.id}</span></div>
          <div class="detail-row"><span class="detail-label">Familia</span><span class="detail-value">${item.family}</span></div>
          <div class="detail-row"><span class="detail-label">Tipo</span><span class="detail-value">${item.weaponType}</span></div>
          <div class="detail-row"><span class="detail-label">Raridade</span><span class="detail-value"><span class="rarity ${rarityClass}">${item.rarity}</span></span></div>
          <div class="detail-row"><span class="detail-label">Tier</span><span class="detail-value">${item.internalTier}</span></div>
          <div class="detail-row"><span class="detail-label">Nivel</span><span class="detail-value">${item.level}</span></div>
          <div class="detail-row"><span class="detail-label">Multiplicador</span><span class="detail-value">${item.powerMultiplier}</span></div>
          <div class="detail-row"><span class="detail-label">Tipo de ataque</span><span class="detail-value">${item.attackType}</span></div>
          <div class="detail-row"><span class="detail-label">Velocidade</span><span class="detail-value">${item.baseSpeed}</span></div>
          <div class="detail-row"><span class="detail-label">Alcance</span><span class="detail-value">${item.range}</span></div>
          <div class="detail-row"><span class="detail-label">Classes</span><span class="detail-value">${item.classes}</span></div>
          <div class="detail-section">
            <h3>Atributos</h3>
            <p><strong>Ataque Fisico:</strong> ${item.attack}</p>
            <p><strong>${item.primaryAttribute}:</strong> ${item.primaryAttributeValue}</p>
            <p><strong>Critico:</strong> ${item.criticalChance}</p>
            <p><strong>Perfuracao:</strong> ${item.penetration}</p>
            <p><strong>Chance de Veneno:</strong> ${item.poisonChance}</p>
          </div>
        </aside>
      </div>
    `;

    const lineSelect = document.getElementById('line-select');
    const tierSelect = document.getElementById('tier-select');

    lineSelect.addEventListener('change', event => {
      const nextLine = model.lineById[event.target.value];

      if (!nextLine) {
        return;
      }

      const canKeepTier = nextLine.variants.some(variant => variant.internalTier === currentTier);
      currentLineId = nextLine.lineId;
      currentTier = canKeepTier ? currentTier : nextLine.variants[0].internalTier;
      currentRequestedId = null;
      syncUrl();
      renderItem();
    });

    tierSelect.addEventListener('change', event => {
      currentTier = event.target.value;
      currentRequestedId = null;
      syncUrl();
      renderItem();
    });
  }

  async function loadItemPage() {
    const content = document.getElementById('item-content');
    const params = new URLSearchParams(window.location.search);
    const requestedSource = params.get('source') || source;

    currentRequestedId = params.get('id');
    currentLineId = null;
    currentTier = null;

    if (!allowedSources.has(requestedSource)) {
      content.innerHTML = `<div class="status-line">A fonte <strong>${requestedSource}</strong> nao existe nesta wiki ainda.</div>`;
      return;
    }

    try {
      const sourceData = await loadWikiJson(`data/${source}.json`);
      model = window.ArkhaiWikiData.buildDaggersModel(sourceData);

      if (!model.lineOrder.length) {
        content.innerHTML = '<div class="status-line">Nenhuma linha de item foi encontrada na base de dados.</div>';
        return;
      }

      const selection = window.ArkhaiWikiData.getDaggersSelection(model, {
        id: currentRequestedId,
        lineId: params.get('line'),
        tier: params.get('tier')
      });

      currentLineId = selection.line ? selection.line.lineId : model.lineOrder[0].lineId;
      currentTier = selection.variant ? selection.variant.internalTier : model.lineOrder[0].variants[0].internalTier;

      syncUrl();
      renderItem();
    } catch (error) {
      content.innerHTML = `
        <div class="status-line">
          Nao foi possivel carregar os dados do item. ${error.message}
        </div>
      `;
    }
  }

  window.renderItemPage = loadItemPage;
})();

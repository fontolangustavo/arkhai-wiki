(function () {
  function formatWeaponStatValue(value) {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }

  function parseWeaponStatNumber(value) {
    const text = String(value || '').trim();

    if (!text || text === '-') {
      return null;
    }

    const match = text.match(/^([+-]?)(\d+(?:[.,]\d+)?)(.*)$/);
    if (!match) {
      return null;
    }

    const numeric = Number(match[2].replace(',', '.'));
    if (!Number.isFinite(numeric)) {
      return null;
    }

    return {
      numeric,
      suffix: match[3].trim()
    };
  }

  function formatWeaponStatDelta(baseValue, selectedValue) {
    const base = parseWeaponStatNumber(baseValue);
    const selected = parseWeaponStatNumber(selectedValue);

    if (!base || !selected || base.suffix !== selected.suffix) {
      return '';
    }

    const delta = selected.numeric - base.numeric;
    if (!delta) {
      return 'sem ajuste';
    }

    const deltaText = Number.isInteger(delta)
      ? String(delta)
      : String(Number(delta.toFixed(2)));

    return `${delta > 0 ? '+' : ''}${deltaText}${selected.suffix}`;
  }

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

  function renderCodeBlock(lines) {
    return `<pre><code>${lines.join('\n')}</code></pre>`;
  }

  function renderWeaponAttributeComparison(type, variant) {
    if (!type.statTable || !type.statTable.columns || type.statTable.columns.length === 0) {
      return '';
    }

    const baseVariant = type.variantByKey['Incomum:I'] || type.variants[0];
    const rows = type.statTable.columns.map(column => {
      const baseValue = baseVariant && baseVariant.stats ? baseVariant.stats[column] : '-';
      const selectedValue = variant.stats ? variant.stats[column] : '-';
      const baseText = formatWeaponStatValue(baseValue);
      const selectedText = formatWeaponStatValue(selectedValue);
      const deltaText = formatWeaponStatDelta(baseValue, selectedValue);
      const stateClass = deltaText && deltaText !== 'sem ajuste'
        ? (deltaText.startsWith('+') ? 'is-upgrade' : 'is-downgrade')
        : '';

      return `
        <div class="detail-stat-card ${stateClass}">
          <span>${column}</span>
          <strong>${selectedText}</strong>
          <small>Base ${baseText}${deltaText ? ` | ${deltaText}` : ''}</small>
        </div>
      `;
    }).join('');

    return `
      <div class="detail-section detail-section-stats">
        <h3>Atributos</h3>
        <div class="detail-stat-grid">${rows}</div>
      </div>
    `;
  }

  function renderAscensions(ascensions) {
    if (!ascensions || ascensions.length === 0) {
      return `
        <h2 class="section-title">Ascensoes</h2>
        <div class="subtle-box">Ascensoes ainda nao documentadas nesta familia.</div>
      `;
    }

    return `
      <h2 class="section-title">Ascensoes</h2>
      ${ascensions.map(step => `
        <h3>${step.from} -> ${step.result}</h3>
        ${renderCodeBlock([
          step.from,
          ...step.materials.map(material => `+ ${material}`),
          `= ${step.result}`
        ])}
      `).join('')}
    `;
  }

  function renderVisualTable(visuals, activeRarity) {
    const rows = visuals.map(entry => {
      const isActive = entry.rarity === activeRarity;
      return `
        <tr class="${isActive ? 'is-active' : ''}">
          <td><strong>${entry.rarity}</strong></td>
          <td>${entry.text}</td>
        </tr>
      `;
    }).join('');

    return `
      <h2 class="section-title">Progressao Visual</h2>
      <table class="wiki-table progression-table">
        <thead>
          <tr>
            <th>Raridade</th>
            <th>Visual</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderRarityMatrix(weaponType, activeVariant) {
    const rows = weaponRarityOrder.map(rarity => {
      const cells = weaponTierOrder.map(tier => {
        const variant = weaponType.variantByKey[`${rarity}:${tier}`];
        const isActive = activeVariant && variant && variant.name === activeVariant.name;
        return `<td class="${isActive ? 'is-active' : ''}">${variant ? variant.name : '-'}</td>`;
      }).join('');

      const isRowActive = activeVariant && activeVariant.rarity === rarity;

      return `
        <tr class="${isRowActive ? 'is-active' : ''}">
          <td><strong>${rarity}</strong></td>
          ${cells}
        </tr>
      `;
    }).join('');

    return `
      <h2 class="section-title">Linhas de Raridade</h2>
      <table class="wiki-table progression-table">
        <thead>
          <tr>
            <th>Raridade</th>
            <th>Tier I</th>
            <th>Tier II</th>
            <th>Tier III</th>
            <th>Tier IV</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function getWeaponPageState() {
    const params = new URLSearchParams(window.location.search);

    return {
      familyId: params.get('family') || weaponFamilies[0].id,
      typeId: params.get('type') || null,
      rarity: params.get('rarity') || weaponRarityOrder[0],
      tier: params.get('tier') || weaponTierOrder[0]
    };
  }

  function syncWeaponUrl(state) {
    const nextParams = new URLSearchParams({
      family: state.familyId,
      type: state.typeId || '',
      rarity: state.rarity,
      tier: state.tier
    });

    if (!state.typeId) {
      nextParams.delete('type');
    }

    history.replaceState(null, '', `weapon.html?${nextParams.toString()}`);
  }

  function renderWeaponPage() {
    const state = getWeaponPageState();
    const content = document.getElementById('weapon-content');
    const title = document.getElementById('weapon-title');
    const actions = document.getElementById('weapon-actions');
    const selection = getWeaponSelection(state);

    state.familyId = selection.family.id;
    state.typeId = selection.type.id;
    state.rarity = selection.variant.rarity;
    state.tier = selection.variant.tier;

    const family = selection.family;
    const type = selection.type;
    const variant = selection.variant;
    const baseVariant = type.variantByKey['Incomum:I'] || type.variants[0];
    const recipe = type.recipe || family.recipe;
    const ascensions = type.ascensions || family.ascensions;
    const visuals = type.visuals || family.visuals;
    const directions = type.directions || family.directions;
    const rarityClass = state.rarity === 'Incomum' ? 'uncommon'
      : state.rarity === 'Raro' ? 'rare'
        : state.rarity === 'Epico' ? 'epic'
          : 'legendary';
    const detailCardClass = `detail-card rarity-${rarityClass}`;
    const image = createWeaponImageHtml(variant.image || type.image || family.image, variant.name);
    const typeOptions = family.types.map(entry => {
      const active = entry.id === type.id ? 'selected' : '';
      return `<option value="${entry.id}" ${active}>${entry.weaponType}</option>`;
    }).join('');
    const rarityOptions = weaponRarityOrder.map(rarity => {
      const active = rarity === state.rarity ? 'selected' : '';
      return `<option value="${rarity}" ${active}>${rarity}</option>`;
    }).join('');
    const tierOptions = weaponTierOrder.map(tier => {
      const active = tier === state.tier ? 'selected' : '';
      return `<option value="${tier}" ${active}>${tier}</option>`;
    }).join('');

    title.textContent = variant.name;
    actions.textContent = `${family.familyName} - ${type.weaponType} - ${variant.rarity} ${variant.tier}`;
    document.title = `${variant.name} - Arkhai Wiki`;

    content.innerHTML = `
      <div class="status-line">
        Dados carregados de <strong>assets/weapons-data.js</strong>, sincronizado com
        <strong>${family.sourceDocument}</strong>.
      </div>

      <div class="variant-switcher">
        <div class="variant-field">
          <label for="type-select">Tipo</label>
          <select id="type-select">${typeOptions}</select>
        </div>
        <div class="variant-field">
          <label for="rarity-select">Raridade</label>
          <select id="rarity-select">${rarityOptions}</select>
        </div>
        <div class="variant-field">
          <label for="tier-select">Tier</label>
          <select id="tier-select">${tierOptions}</select>
        </div>
      </div>

      <div class="subtle-box">
        <strong>${type.baseWeaponName}</strong> representa a familia ${family.familyName} em
        ${family.region}. A variante ativa e <strong>${variant.name}</strong>.
      </div>

      <div class="detail-layout">
        <div>
          <section class="item-spotlight">
            <figure>${image}</figure>
            <div>
              <p><strong>Base:</strong> ${type.baseWeaponName}</p>
              <p><strong>Tipo:</strong> ${type.weaponType}</p>
              <p><strong>Raridade/Tier:</strong> <span class="rarity ${rarityClass}">${variant.name}</span></p>
              <p><strong>Marca:</strong> ${family.markName}</p>
              <p><strong>Efeito:</strong> ${family.markEffect}</p>
            </div>
          </section>

          <h2 class="section-title">Visao Geral</h2>
          <p>${family.summary}</p>

          <h2 class="section-title">Arma Principal</h2>
          <p><strong>Regiao principal:</strong> ${family.region}</p>
          <p><strong>Atributos tematicos:</strong> ${family.attributes.join(', ')}</p>
          <p><strong>Recursos de coleta:</strong> ${family.resources.join(', ')}</p>
          <p><strong>Materiais de familia:</strong> ${family.materials.join(', ')}</p>

          ${renderRarityMatrix(type, variant)}

          <h2 class="section-title">Receita Inicial</h2>
          ${renderCodeBlock(recipe)}

          ${renderAscensions(ascensions)}

          ${renderVisualTable(visuals, state.rarity)}

          ${renderList('Diretrizes', directions)}

          <h2 class="section-title">Fonte verdadeira</h2>
          <p><strong>Arquivo:</strong> ${family.sourceDocument}</p>
          <p><strong>Secao:</strong> ${family.sourceHeading}</p>
        </div>

        <aside class="${detailCardClass}">
          <div class="detail-image-frame">
            ${image}
          </div>
          <h2>${type.baseWeaponName}</h2>
          <div class="detail-row"><span class="detail-label">Familia</span><span class="detail-value">${family.familyName}</span></div>
          <div class="detail-row"><span class="detail-label">Tipo</span><span class="detail-value">${type.weaponType}</span></div>
          <div class="detail-row"><span class="detail-label">Regiao</span><span class="detail-value">${family.region}</span></div>
          <div class="detail-row"><span class="detail-label">Marca</span><span class="detail-value">${family.markName}</span></div>
          <div class="detail-row"><span class="detail-label">Efeito</span><span class="detail-value">${family.markEffect}</span></div>
          <div class="detail-row"><span class="detail-label">Base</span><span class="detail-value">${baseVariant.name}</span></div>
          <div class="detail-row"><span class="detail-label">Selecionada</span><span class="detail-value">${variant.name}</span></div>
          ${renderWeaponAttributeComparison(type, variant)}
          <div class="detail-section">
            <h3>Resumo</h3>
            <p>${family.theme}</p>
          </div>
        </aside>
      </div>
    `;

    const typeSelect = document.getElementById('type-select');
    const raritySelect = document.getElementById('rarity-select');
    const tierSelect = document.getElementById('tier-select');

    typeSelect.addEventListener('change', event => {
      state.typeId = event.target.value;
      state.rarity = weaponRarityOrder[0];
      state.tier = weaponTierOrder[0];
      syncWeaponUrl(state);
      renderWeaponPage();
    });

    raritySelect.addEventListener('change', event => {
      state.rarity = event.target.value;
      syncWeaponUrl(state);
      renderWeaponPage();
    });

    tierSelect.addEventListener('change', event => {
      state.tier = event.target.value;
      syncWeaponUrl(state);
      renderWeaponPage();
    });

    syncWeaponUrl(state);
  }

  window.renderWeaponPage = renderWeaponPage;
})();

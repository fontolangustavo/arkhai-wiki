(function () {
  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderTable(table) {
    if (!table) {
      return '';
    }

    const head = table.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('');
    const body = table.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');

    return `
      <table class="wiki-table progression-table">
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  function findTable(doc, heading) {
    return doc.tables.find(table => table.headingPath[table.headingPath.length - 1] === heading) || null;
  }

  function findPreviewVariant(doc) {
    return (doc.variants || []).find(variant => variant && variant.image) || null;
  }

  function renderPreviewFigure(variant) {
    if (!variant || !variant.image) {
      return '';
    }

    return `
      <figure class="category-group-preview">
        <img
          class="item-image"
          src="${escapeHtml(variant.image)}"
          alt="${escapeHtml(variant.name || variant.baseName || 'Item')}"
          onerror="this.onerror=null;this.src='assets/images/items/weapons/default.svg'"
        >
      </figure>
    `;
  }

  function renderFamilyBlock(family, doc, options) {
    const introTable = findTable(doc, options.primaryHeading);
    const rarityTable = findTable(doc, 'Linhas de Raridade');
    const materialTable = options.materialHeading ? findTable(doc, options.materialHeading) : null;
    const previewVariant = findPreviewVariant(doc);

    const introChips = introTable
      ? introTable.rows.map(row => `<span class="category-chip">${escapeHtml(row[0])}</span>`).join('')
      : '';
    const rarityRows = rarityTable
      ? rarityTable.rows.map(row => {
        const label = row[0];
        const values = row.slice(1).map(cell => `<td>${escapeHtml(cell)}</td>`).join('');
        return `<tr><th scope="row">${escapeHtml(label)}</th>${values}</tr>`;
      }).join('')
      : '';

    return `
      <section class="category-group">
        <div class="category-group-head">
          <div class="category-group-title">
            <span class="category-group-icon">${options.icon}</span>
            ${renderPreviewFigure(previewVariant)}
            <div>
              <h2>${escapeHtml(family.familyName)}</h2>
              <p>${escapeHtml(doc.summary || family.docs[options.docKey].summary || '')}</p>
            </div>
          </div>
          <a class="item-line-pill" href="${options.backHref}">Ver ${options.backLabel}</a>
        </div>

        <div class="category-chip-grid">
          ${introChips}
        </div>

        <h3 class="section-title">${options.primaryLabel}</h3>
        ${renderTable(introTable)}

        ${rarityTable ? `
          <h3 class="section-title">Linhas de Raridade</h3>
          <table class="wiki-table progression-table">
            <thead>
              <tr>${rarityTable.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rarityRows}
            </tbody>
          </table>
        ` : ''}

        ${materialTable ? `
          <h3 class="section-title">${options.materialLabel}</h3>
          ${renderTable(materialTable)}
        ` : ''}

        <p class="category-note"><strong>Fonte:</strong> ${escapeHtml(doc.sourceDocument)}</p>
      </section>
    `;
  }

  async function renderEquipmentCategoryPage(options) {
    const container = document.getElementById('category-content');
    const status = document.getElementById('category-status');
    const intro = document.getElementById('category-intro');
    const source = document.getElementById('category-source');
    const subtle = document.getElementById('category-subtle');

    if (!container) {
      return;
    }

    const catalog = window.ArkhaiEquipmentCatalog || await loadWikiJson('data/equipment-catalog.json');

    container.innerHTML = catalog.families.map(family => {
      const doc = family.docs[options.docKey];
      return renderFamilyBlock(family, doc, options);
    }).join('');

    if (status) {
      status.textContent = options.status;
    }

    if (intro) {
      intro.textContent = options.intro;
    }

    if (source) {
      source.innerHTML = options.sourceHtml;
    }

    if (subtle) {
      subtle.textContent = options.subtle;
    }
  }

  window.renderEquipmentCategoryPage = renderEquipmentCategoryPage;
})();

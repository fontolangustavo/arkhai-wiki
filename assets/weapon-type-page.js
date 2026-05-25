(function () {
  const weaponTypeMeta = window.weaponTypeMeta || {};

  function syncUrl(currentTypeName) {
    const nextParams = new URLSearchParams({
      type: currentTypeName
    });

    history.replaceState(null, '', `weapon-type.html?${nextParams.toString()}`);
  }

  function buildFamilyCard(entry) {
    const family = entry.family;
    const type = entry.type;
    const image = createWeaponImageHtml(type.previewImage || family.image, type.baseWeaponName);
    const href = `weapon.html?${new URLSearchParams({
      family: family.id,
      type: type.id
    }).toString()}`;

    return `
      <a class="item-line-card" href="${href}">
        <figure>${image}</figure>
        <div>
          <div class="item-line-head">
            <div>
              <h2>${type.baseWeaponName}</h2>
              <p>${family.summary}</p>
            </div>
            <span class="item-line-pill">${family.familyName}</span>
          </div>
          <div class="item-line-meta">
            <span class="item-line-pill">${family.region}</span>
            <span class="item-line-pill">${type.weaponType}</span>
            <span class="item-line-pill">${family.markName}</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderWeaponTypePage() {
    const params = new URLSearchParams(window.location.search);
    const currentTypeName = resolveWeaponTypeName(params.get('type') || weaponTypeOrder[0]);
    const content = document.getElementById('weapon-type-content');
    const title = document.getElementById('weapon-type-title');
    const actions = document.getElementById('weapon-type-actions');
    const entries = weaponTypeIndex[currentTypeName] || [];
    const options = weaponTypeOrder.map(typeName => {
      const active = typeName === currentTypeName ? 'selected' : '';
      return `<option value="${typeName}" ${active}>${typeName}</option>`;
    }).join('');
    const meta = weaponTypeMeta[currentTypeName] || {};

    title.textContent = `${currentTypeName}s`;
    actions.textContent = `${entries.length} familias publicadas`;
    document.title = `${currentTypeName}s - Arkhai Wiki`;

    content.innerHTML = `
      <div class="status-line">
        Esta pagina lista todas as familias publicadas para o tipo <strong>${currentTypeName}</strong>.
      </div>

      <div class="variant-switcher">
        <div class="variant-field">
          <label for="type-select">Tipo</label>
          <select id="type-select">${options}</select>
        </div>
      </div>

      <div class="subtle-box">
        <strong>${currentTypeName}</strong> - ${meta.detailSummary || 'Categoria de armas.'}
      </div>

      ${
        entries.length
          ? `<div class="item-line-grid">${entries.map(buildFamilyCard).join('')}</div>`
          : '<div class="status-line">Nenhuma familia publicada para este tipo ainda.</div>'
      }
    `;

    document.getElementById('type-select').addEventListener('change', event => {
      const nextTypeName = resolveWeaponTypeName(event.target.value);
      syncUrl(nextTypeName);
      renderWeaponTypePage();
    });
  }

  window.renderWeaponTypePage = renderWeaponTypePage;
})();

(function () {
  function buildTypeCard(typeName) {
    const meta = weaponTypeMeta[typeName] || {};
    const families = weaponTypeIndex[typeName] || [];
    const familyCount = families.length;
    const href = `weapon-type.html?${new URLSearchParams({ type: typeName }).toString()}`;
    const countLabel = familyCount === 1 ? '1 familia publicada' : `${familyCount} familias publicadas`;

    return `
      <a class="item-line-card" href="${href}">
        <figure class="item-preview">${meta.icon || '⚔️'}</figure>
        <div>
          <div class="item-line-head">
            <div>
              <h2>${typeName}</h2>
              <p>${meta.summary || 'Tipo de arma da familia.'}</p>
            </div>
            <span class="item-line-pill">${countLabel}</span>
          </div>
          <div class="item-line-meta">
            <span class="item-line-pill">${meta.focus || 'Categoria de combate'}</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderWeaponsPage() {
    const container = document.getElementById('weapon-type-list');
    if (!container) {
      return;
    }

    container.innerHTML = weaponTypeOrder.map(buildTypeCard).join('');
  }

  window.renderWeaponsPage = renderWeaponsPage;
})();

function renderLayout(activePage) {
  const sidebar = `
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-mark">A</div>
        <strong>Arkhai Wiki</strong>
        <span>Codex do mundo antigo</span>
      </div>

      <nav class="side-section">
        <h3>Principal</h3>
        <a href="index.html">Home</a>
        <a href="index.html#updates">Mudancas recentes</a>
        <a href="items.html">Itens</a>
        <a href="index.html#systems">Sistemas</a>
      </nav>

      <nav class="side-section">
        <h3>Cyclopedia</h3>
        <a href="items.html">Itens</a>
        <a href="index.html#monsters">Bestiario</a>
        <a href="index.html#cities">Cidades</a>
        <a href="index.html#classes">Classes</a>
        <a href="index.html#crafting">Crafting</a>
        <a href="index.html#lore">Magical Archive</a>
      </nav>

      <nav class="side-section">
        <h3>Utilidades</h3>
        <a href="index.html#upgrade">Calculadora de Upgrade</a>
        <a href="index.html#ascension">Simulador de Ascensao</a>
        <a href="#">Loot Tables</a>
      </nav>
    </aside>
  `;

  const topbar = `
    <header class="topbar">
      <nav class="tabs">
        <a class="tab active" href="${activePage}">Pagina</a>
        <a class="tab" href="#discussion">Discussao</a>
        <a class="tab" href="#source">Codigo-fonte</a>
        <a class="tab" href="#history">Historico</a>
      </nav>
      <div class="search">
        <input type="search" placeholder="Pesquisar em Arkhai Wiki" />
      </div>
    </header>
  `;

  document.getElementById('wiki-sidebar').innerHTML = sidebar;
  document.getElementById('wiki-topbar').innerHTML = topbar;
}

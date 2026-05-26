(function () {
  const modalId = 'arkhai-image-modal';
  let modalRoot = null;
  let modalImage = null;
  let modalTitle = null;
  let modalCaption = null;
  let isBound = false;

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function ensureModal() {
    if (modalRoot) {
      return modalRoot;
    }

    modalRoot = document.createElement('div');
    modalRoot.id = modalId;
    modalRoot.className = 'image-modal';
    modalRoot.innerHTML = `
      <div class="image-modal__backdrop" data-image-modal-close></div>
      <div class="image-modal__panel" role="dialog" aria-modal="true" aria-labelledby="image-modal-title">
        <button type="button" class="image-modal__close" data-image-modal-close aria-label="Fechar">×</button>
        <figure class="image-modal__figure">
          <img id="image-modal-image" alt="" />
        </figure>
        <div class="image-modal__body">
          <h2 id="image-modal-title"></h2>
          <p id="image-modal-caption"></p>
        </div>
      </div>
    `;

    document.body.appendChild(modalRoot);
    modalImage = modalRoot.querySelector('#image-modal-image');
    modalTitle = modalRoot.querySelector('#image-modal-title');
    modalCaption = modalRoot.querySelector('#image-modal-caption');

    modalRoot.addEventListener('click', event => {
      if (event.target && event.target.closest('[data-image-modal-close]')) {
        close();
      }
    });

    if (!isBound) {
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          close();
        }
      });

      document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-image-modal-src]');
        if (!trigger) {
          return;
        }

        const src = trigger.dataset.imageModalSrc || '';
        const alt = trigger.dataset.imageModalAlt || trigger.dataset.imageModalTitle || '';
        const title = trigger.dataset.imageModalTitle || alt;
        const caption = trigger.dataset.imageModalCaption || '';
        open({ src, alt, title, caption });
      });

      isBound = true;
    }

    return modalRoot;
  }

  function open(options) {
    const modal = ensureModal();
    modalImage.src = options.src || '';
    modalImage.alt = options.alt || options.title || '';
    modalTitle.textContent = options.title || options.alt || '';
    modalCaption.textContent = options.caption || '';
    modal.classList.add('is-open');
    document.body.classList.add('has-image-modal-open');
  }

  function close() {
    if (!modalRoot) {
      return;
    }

    modalRoot.classList.remove('is-open');
    document.body.classList.remove('has-image-modal-open');
    modalImage.removeAttribute('src');
  }

  function renderTrigger(contentHtml, options) {
    const src = escapeHtml(options && options.src ? options.src : '');
    const alt = escapeHtml(options && options.alt ? options.alt : options && options.title ? options.title : '');
    const title = escapeHtml(options && options.title ? options.title : options && options.alt ? options.alt : '');
    const caption = escapeHtml(options && options.caption ? options.caption : '');
    const className = options && options.className ? ` ${options.className}` : '';

    return `
      <button
        type="button"
        class="image-modal-trigger${className}"
        data-image-modal-src="${src}"
        data-image-modal-alt="${alt}"
        data-image-modal-title="${title}"
        data-image-modal-caption="${caption}"
        aria-label="${title || alt || 'Abrir imagem em destaque'}"
      >
        ${contentHtml}
      </button>
    `;
  }

  window.ArkhaiImageModal = {
    open,
    close
  };

  window.createImageModalTriggerHtml = renderTrigger;

  ensureModal();
})();

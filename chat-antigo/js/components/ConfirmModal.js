
export function ConfirmModal() {
  return `
    <div class="confirm-modal" id="confirm-modal" hidden>
      <div class="confirm-modal__backdrop" data-confirm-dismiss></div>
      <div
        class="confirm-modal__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <h2 class="confirm-modal__title" id="confirm-modal-title"></h2>
        <p class="confirm-modal__desc" id="confirm-modal-desc"></p>
        <div class="confirm-modal__actions">
          <button
            type="button"
            class="confirm-modal__btn confirm-modal__btn--ghost"
            data-confirm-dismiss
            id="confirm-modal-cancel"
          >Cancelar</button>
          <button
            type="button"
            class="confirm-modal__btn"
            id="confirm-modal-ok"
          >Confirmar</button>
        </div>
      </div>
    </div>
  `;
}

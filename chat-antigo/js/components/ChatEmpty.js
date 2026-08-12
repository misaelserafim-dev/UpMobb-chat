export function ChatEmpty({ loading = false } = {}) {
  return `
    <section
      class="chat-empty ${loading ? "chat-empty--loading" : ""}"
      id="chat-empty"
      aria-label="${loading ? "Carregando conversa" : "Nenhuma conversa selecionada"}"
      ${loading ? 'aria-busy="true"' : ""}
    >
      <div
        class="chat-progress ${loading ? "is-active" : ""}"
        id="chat-progress"
        role="progressbar"
        aria-hidden="${loading ? "false" : "true"}"
        ${loading ? 'aria-valuetext="Carregando"' : ""}
      >
        <span class="chat-progress__bar"></span>
      </div>
    </section>
  `;
}
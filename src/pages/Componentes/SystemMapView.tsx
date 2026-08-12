import { useState } from "react";
import { SYSTEM_MAP_FLOWS } from "./SystemMap.ts";

export function SystemMapView() {
  const [activeId, setActiveId] = useState(SYSTEM_MAP_FLOWS[0]?.id || "boot");
  const flow = SYSTEM_MAP_FLOWS.find((f) => f.id === activeId) || SYSTEM_MAP_FLOWS[0];

  if (!flow) return null;

  return (
    <div className="system-map">
      <aside className="system-map__nav" aria-label="Fluxos do sistema">
        {SYSTEM_MAP_FLOWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`system-map__nav-item${item.id === flow.id ? " is-active" : ""}`}
            onClick={() => setActiveId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </aside>

      <article className="system-map__panel">
        <header className="system-map__header">
          <h2 className="system-map__title">{flow.label}</h2>
          <p className="system-map__summary">{flow.summary}</p>
        </header>

        <ol className="system-map__steps">
          {flow.steps.map((step, index) => (
            <li key={`${flow.id}-${index}`} className="system-map__step">
              <div className="system-map__step-index" aria-hidden="true">
                {index + 1}
              </div>
              <div className="system-map__step-body">
                <h3 className="system-map__step-title">{step.title}</h3>
                <p className="system-map__step-detail">{step.detail}</p>
                {step.files?.length ? (
                  <ul className="system-map__files">
                    {step.files.map((file) => (
                      <li key={file}>
                        <code>{file}</code>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {flow.payload ? (
          <section className="system-map__payload">
            <h3 className="system-map__block-title">Payload / contrato</h3>
            <pre className="system-map__code">{flow.payload}</pre>
          </section>
        ) : null}

        {flow.notes?.length ? (
          <section className="system-map__notes">
            <h3 className="system-map__block-title">Notas</h3>
            <ul>
              {flow.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </div>
  );
}

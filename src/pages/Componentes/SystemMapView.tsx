import { FLOW_KIND_LABEL, FLOW_PATHS, type FlowNode } from "./SystemMap.ts";

function FlowCard({ node }: { node: FlowNode }) {
  return (
    <div className={`flow-card flow-card--${node.kind}`} title={node.file || node.label}>
      <span className="flow-card__kind">{FLOW_KIND_LABEL[node.kind]}</span>
      <strong className="flow-card__label">{node.label}</strong>
      {node.file ? <code className="flow-card__file">{node.file}</code> : null}
    </div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flow-arrow" aria-hidden="true">
      <span className="flow-arrow__line" />
      {label ? <span className="flow-arrow__label">{label}</span> : null}
      <span className="flow-arrow__head" />
    </div>
  );
}

export function SystemMapView() {
  return (
    <div className="flow-map" aria-label="Fluxo do sistema">
      <div className="flow-map__legend" aria-hidden="true">
        <span className="flow-map__legend-item flow-map__legend-item--page">page / ui</span>
        <span className="flow-map__legend-item flow-map__legend-item--service">service</span>
        <span className="flow-map__legend-item flow-map__legend-item--data">mock / api</span>
        <span className="flow-map__legend-item flow-map__legend-item--action">fluxo</span>
      </div>

      <ol className="flow-map__paths">
        {FLOW_PATHS.map((path, pathIndex) => (
          <li key={path.id} className="flow-path">
           
            <header className="flow-path__header">
              <span className="flow-path__index">{String(pathIndex + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="flow-path__title">{path.title}</h2>
                <p className="flow-path__summary">{path.summary}</p>
              </div>
            </header>

            <div className="flow-path__track">
              {path.nodes.map((node, i) => (
                <div key={node.id} className="flow-path__step">
                  {i > 0 ? <FlowArrow label={node.call} /> : null}
                  <FlowCard node={node} />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

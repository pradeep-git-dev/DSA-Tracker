import React from "react";

export default function Panel({ title, icon, action, children }) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <span className="eyebrow">{icon} Insight</span>
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </article>
  );
}

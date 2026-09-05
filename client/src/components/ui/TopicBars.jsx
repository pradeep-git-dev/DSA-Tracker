import React from "react";

export default function TopicBars({ items, weak = false }) {
  return (
    <div className="topic-list">
      {items.map((item) => (
        <div className="topic-row" key={item.topic}>
          <header>
            <strong>{item.topic}</strong>
            <span>{item.strength}%</span>
          </header>
          <div className="bar-track">
            <div className={weak ? "bar-fill weak" : "bar-fill"} style={{ width: `${item.strength}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

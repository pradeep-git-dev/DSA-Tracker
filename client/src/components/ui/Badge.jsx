import React from "react";

export default function Badge({ children, tone = "info" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

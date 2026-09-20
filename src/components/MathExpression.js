"use client";

import "katex/dist/katex.min.css";
import katex from "katex";

function toLatex(value) {
  return String(value ?? "")
    .replace(/sqrt\(([^)]+)\)/gi, "\\sqrt{$1}")
    .replace(/(\d+)\^(\d+)/g, "$1^{$2}")
    .replace(/[×·]/g, "\\times")
    .replace(/\*/g, "\\times");
}

export default function MathExpression({ value, className = "" }) {
  const html = katex.renderToString(toLatex(value), {
    throwOnError: false,
    displayMode: false,
    strict: "ignore",
  });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

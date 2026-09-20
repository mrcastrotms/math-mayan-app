"use client";

import "katex/dist/katex.min.css";
import katex from "katex";
import { normalizeMathLatex } from "../utils/mathExpressionUtils.mjs";

export default function MathExpression({ value, className = "" }) {
  const html = katex.renderToString(normalizeMathLatex(value), {
    throwOnError: false,
    displayMode: false,
    strict: "ignore",
  });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

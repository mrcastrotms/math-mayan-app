export function normalizeSection(rawSection) {
  return (rawSection || "").trim().toUpperCase();
}

export function addSection(sections, rawSection) {
  const section = normalizeSection(rawSection);
  if (!section || sections.includes(section)) return sections;
  return [...sections, section];
}

export function removeSection(sections, sectionToRemove) {
  return sections.filter((section) => section !== sectionToRemove);
}

export const VALID_THEMES = ["default", "dark", "sepia", "contrast"];

export function normalizeTheme(theme) {
  return VALID_THEMES.includes(theme) ? theme : "default";
}

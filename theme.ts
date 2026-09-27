import { defineTheme } from "aiditor";

/**
 * Project-wide brand theme. Values here are merged over the defaults, so you only
 * need to specify the tokens you want to change. Every post imports nothing —
 * the theme is applied when the post is rendered.
 */
export default defineTheme({
  colors: {
    primary: "#2563EB",
    background: "#0B1220",
    surface: "#111C31",
    text: "#F8FAFC",
    textMuted: "#CBD5E1",
    accent: "#38BDF8",
    border: "#1E293B",
  },
});

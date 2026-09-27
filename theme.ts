import { defineTheme } from "aiditor";

/**
 * Project-wide brand theme. Values here are merged over the built-in defaults, so you only need to
 * specify the tokens you want to change.
 *
 * The renderer loads this file and applies it to every post (per-post `createPost({ theme })`
 * overrides still win), so changing a token here restyles every post — no post edits needed.
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

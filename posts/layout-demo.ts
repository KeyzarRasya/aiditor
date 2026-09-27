import { createPost, grid, group, row, text } from "aiditor";

function card(title: string, body: string) {
  return group(
    [
      text(title, { fontSize: 28, fontWeight: 700, color: "#38BDF8" }),
      text(body, { fontSize: 24, lineHeight: 1.4, color: "#CBD5E1" }),
    ],
    { grow: 1, fill: "#111C31", radius: 22, padding: 24, gap: 10 },
  );
}

function stat(value: string, label: string) {
  return group(
    [
      text(value, { fontSize: 44, fontWeight: 700 }),
      text(label, { fontSize: 20, lineHeight: 1.3, color: "#94A3B8" }),
    ],
    { fill: "#111C31", radius: 18, padding: 20, gap: 6, align: "center" },
  );
}

export default createPost({
  size: "instagram-square",
  layout: { gap: 28 },
  children: [
    text("Layout tanpa koordinat manual.", { fontSize: 58, fontWeight: 700, lineHeight: 1.15 }),
    row(
      [
        card("Grow 1", "Kolom ini mengambil separuh ruang yang tersisa di dalam baris."),
        card("Grow 1", "Kolom kanan juga, tanpa satu pun angka posisi."),
      ],
      { gap: 20, align: "stretch" },
    ),
    grid(
      [
        stat("1080", "lebar kanvas"),
        stat("3", "kolom grid"),
        stat("0", "koordinat"),
      ],
      { columns: 3, gap: 16 },
    ),
  ],
});

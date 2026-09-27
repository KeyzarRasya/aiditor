import {
  badge,
  card,
  comparison,
  createPost,
  cta,
  divider,
  flow,
  headline,
  icon,
  number,
  paragraph,
  quote,
  row,
} from "aiditor";

export default createPost({
  size: "instagram-story",
  layout: { gap: 28 },
  children: [
    row([badge({ text: "KITCHEN SINK" }), icon({ d: "M12 2 L22 20 H2 Z", size: 32, fill: "#38BDF8" })], {
      gap: 16,
      align: "center",
    }),
    headline({ text: "Setiap komponen, satu halaman." }),
    paragraph({
      text: "Semua ditulis lewat komponen semantik — tanpa satu pun koordinat manual.",
    }),
    divider(),
    comparison({
      left: { title: "Sebelum", items: ["Manual", "Tidak konsisten", "Sulit diulang"] },
      right: { title: "Sesudah", items: ["Deklaratif", "Konsisten", "Deterministik"] },
    }),
    flow({ steps: ["Tulis konten", "Susun komponen", "Render ke PNG"] }),
    quote({ text: "Desain adalah kode.", author: "Tim Produk" }),
    row(
      [
        number({ value: "12", label: "komponen" }),
        card({ title: "Catatan", items: ["Satu file, satu gambar"], grow: 1 }),
      ],
      { gap: 24, align: "stretch" },
    ),
    cta({ text: "Mulai dari satu file TypeScript." }),
  ],
});

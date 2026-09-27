import { createPost, group, text } from "aiditor";

export default createPost({
  size: "instagram-square",
  layout: { gap: 40 },
  children: [
    text("ERP yang mahal belum tentu ERP yang paling cocok.", {
      fontSize: 78,
      fontWeight: 700,
      lineHeight: 1.15,
    }),
    group(
      [
        text(
          "Yang lebih penting adalah apakah ERP tersebut sesuai dengan proses bisnis perusahaan, bukan sekadar harga atau popularitasnya.",
          { fontSize: 36, lineHeight: 1.5, color: "#CBD5E1" },
        ),
      ],
      { fill: "#111C31", radius: 28, padding: 36, width: "fill", shadow: true },
    ),
    text("Pahami proses bisnis sebelum memilih software.", {
      fontSize: 40,
      fontWeight: 700,
      color: "#38BDF8",
    }),
  ],
});

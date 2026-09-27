import { card, createPost, cta, headline, paragraph } from "aiditor";

export default createPost({
  size: "instagram-square",
  children: [
    headline({ text: "ERP yang mahal belum tentu ERP yang paling cocok." }),
    paragraph({
      text: "Yang lebih penting adalah apakah ERP tersebut sesuai dengan proses bisnis perusahaan.",
    }),
    card({
      title: "Sebelum memilih ERP",
      items: ["Pahami proses bisnis", "Identifikasi masalah", "Tentukan kebutuhan"],
    }),
    cta({ text: "Pahami proses bisnis sebelum memilih software." }),
  ],
});

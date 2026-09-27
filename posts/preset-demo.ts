import { createPost, educationalPost } from "aiditor";

export default createPost({
  size: "instagram-square",
  children: [
    educationalPost({
      badge: "Catatan Implementasi",
      title: "ERP bukan sekadar soal harga.",
      intro: "Yang menentukan adalah kecocokan dengan proses bisnis.",
      pointsTitle: "Urutan yang benar",
      points: [
        "Pahami proses bisnis lebih dulu",
        "Identifikasi masalah yang nyata",
        "Baru bandingkan vendor",
      ],
      takeaway: "Mulai dari proses, bukan dari daftar harga.",
    }),
  ],
});

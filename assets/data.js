/* ============================================================
   Çarnaçar — İÇERİK DOSYASI
   admin.html panelinden yönetilir; elle de düzenlenebilir.
   ============================================================ */

// ---------- GÜNLÜK KATEGORİLERİ ----------
const kategoriler = ["microsoft", "sql", "erp", "video", "yayın", "hayat"];

// ---------- GÜNLÜK ----------
// Her güne bir kayıt. YENİ GÜNÜ LİSTENİN EN ÜSTÜNE EKLE (ya da admin panelini kullan).
// Metnin içine kod eklemek için üç ters tırnak kullan:  ```sql ... ```
// Video/yayın gömmek için "video" alanına linki yapıştır:
//   YouTube : https://www.youtube.com/watch?v=XXXX  (youtu.be ve canlı yayın linkleri de olur)
//   Kick    : https://kick.com/kanaladi
const gunluk = [
  {
    tarih: "2026-07-11",
    kategori: "video",
    ruh: "🎬",
    baslik: "Video paylaşımı örneği",
    metin:
      "Video ve canlı yayınlar artık günlüğün içinde. Kayda YouTube ya da Kick linki eklemek yeterli — oynatıcı gömülü gelir.\n\nBu örnek kaydı kendi videonla değiştir: admin panelinde \"Video / yayın linki\" alanına linki yapıştırman yeterli.",
    video: "",
    resimler: [],
  },
  {
    tarih: "2026-07-11",
    kategori: "sql",
    ruh: "🗄️",
    baslik: "Kod paylaşımı örneği",
    metin:
      "Artık günlüğe kod da ekleyebiliyorum. Üç ters tırnak arasına yazmak yeterli:\n\n```sql\n-- Bugün en çok kullandığım sorgu\nSELECT TOP 10 t.FICHENO, t.DATE_, c.DEFINITION_\nFROM LG_001_01_INVOICE t\nINNER JOIN LG_001_CLCARD c ON c.LOGICALREF = t.CLIENTREF\nWHERE t.DATE_ = GETDATE()\nORDER BY t.DATE_ DESC;\n```\n\nKod bloğunun sağ üstündeki düğmeyle tek tıkla kopyalanıyor. Bu kaydı kendi notunla değiştirebilirsin.",
    resimler: [],
  },
  {
    tarih: "2026-07-11",
    kategori: "hayat",
    ruh: "✨",
    baslik: "İlk kayıt: Günlük başlıyor",
    metin:
      "Bugün bu günlüğü kurdum. Uzun zamandır aklımdaydı: her günün sonunda birkaç satır yazmak, günü kağıda (ekrana) bırakıp öyle uyumak.\n\nHedef basit: her gün bir kayıt. Uzun olması gerekmiyor; bazen tek cümle bile yeter. Bakalım kaç gün üst üste yazabileceğim.",
    resimler: [],
  },
];

// ---------- SERTİFİKALAR (Microsoft Learn) ----------
const sertifikalar = [
  {
    kod: "AB-731",
    ad: "Microsoft Certified: AI Transformation Leader",
    tarih: "Haziran 2026 · 979/1000",
    link: "https://learn.microsoft.com/en-us/users/omercarnacar/credentials",
  },
  {
    kod: "MCT",
    ad: "Microsoft Certified Trainer",
    tarih: "2019'dan beri",
    link: "https://learn.microsoft.com/en-us/users/omercarnacar/",
  },
  {
    kod: "PL-300",
    ad: "Power BI Data Analyst",
    tarih: "850/1000",
    link: "https://learn.microsoft.com/en-us/users/omercarnacar/credentials",
  },
  {
    kod: "MCSE",
    ad: "Data Management & Analytics",
    tarih: "2019",
    link: "",
  },
  {
    kod: "MCSA",
    ad: "SQL 2016 Database Development",
    tarih: "2018",
    link: "",
  },
  {
    kod: "762",
    ad: "Developing SQL Databases",
    tarih: "2019",
    link: "",
  },
  {
    kod: "761",
    ad: "Querying Data with Transact-SQL",
    tarih: "2018",
    link: "",
  },
  {
    kod: "PL/SQL",
    ad: "Oracle 12c R2 Advanced PL/SQL (Metod)",
    tarih: "2019",
    link: "",
  },
];



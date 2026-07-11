/* ============================================================
   Çarnaçar — İÇERİK DOSYASI
   Yeni yazı, şiir, video veya proje eklemek için sadece bu
   dosyayı düzenle. Listelerin en üstüne eklediğin, sitede en
   önce görünür.
   ============================================================ */

// ---------- ÖZGEÇMİŞ ----------
const cv = [
  {
    tarih: "2024 — Devam",
    baslik: "[Unvanın / Pozisyonun]",
    yer: "[Şirket / Kurum]",
    aciklama: "Burada ne yaptığını 1-2 cümleyle anlat.",
  },
  {
    tarih: "2020 — 2024",
    baslik: "[Önceki Pozisyonun]",
    yer: "[Önceki Şirket]",
    aciklama: "Sorumlulukların ve başarıların.",
  },
  {
    tarih: "2016 — 2020",
    baslik: "[Bölümün] — Lisans",
    yer: "[Üniversite Adı]",
    aciklama: "Eğitimin hakkında kısa bir not.",
  },
];

// ---------- VİDEOLAR ----------
// YouTube videosu için: { youtubeId: "VIDEO_ID", baslik: "...", aciklama: "..." }
// VIDEO_ID, youtube.com/watch?v=XXXXXXX adresindeki XXXXXXX kısmıdır.
// Henüz video yoksa youtubeId'yi boş bırak, kart yer tutucu olarak görünür.
const videolar = [
  {
    youtubeId: "",
    baslik: "İlk videom (yakında)",
    aciklama: "Buraya ilk videonun YouTube ID'sini ekle.",
  },
  {
    youtubeId: "",
    baslik: "Vlog: Bir günüm",
    aciklama: "Yer tutucu — kendi videonla değiştir.",
  },
];

// ---------- KOD / PROJELER ----------
const projeler = [
  {
    ikon: "🌐",
    ad: "Çarnaçar (bu site)",
    aciklama: "Sıfır bağımlılıkla yazılmış kişisel blog ve portfolyo sitem. Saf HTML, CSS ve JavaScript.",
    etiketler: ["HTML", "CSS", "JavaScript"],
    link: "",
  },
  {
    ikon: "🛠️",
    ad: "[Proje Adı]",
    aciklama: "Projenin ne yaptığını buraya yaz.",
    etiketler: ["Teknoloji", "Ekle"],
    link: "",
  },
];

// ---------- SERTİFİKALAR (Microsoft Learn) ----------
//   kod    : sınav/sertifika kodu (örn. "AZ-900", "DP-900", "MS-900")
//   ad     : sertifikanın tam adı
//   tarih  : alındığı tarih
//   link   : Microsoft Learn profilindeki doğrulama (Share) bağlantısı — yoksa "" bırak
const sertifikalar = [
  {
    kod: "AZ-900",
    ad: "Microsoft Azure Fundamentals",
    tarih: "[Alındığı tarih]",
    link: "",
  },
  {
    kod: "DP-900",
    ad: "Microsoft Azure Data Fundamentals",
    tarih: "[Alındığı tarih]",
    link: "",
  },
  {
    kod: "[KOD]",
    ad: "[Sertifika adı — kendi sertifikanla değiştir]",
    tarih: "[Tarih]",
    link: "",
  },
];

// ---------- GÜNLÜK KATEGORİLERİ ----------
// Filtre butonları bu sıraya göre dizilir. Yeni kategori eklemek serbest.
const kategoriler = ["microsoft", "sql", "hayat"];

// ---------- GÜNLÜK ----------
// Her güne bir kayıt. YENİ GÜNÜ LİSTENİN EN ÜSTÜNE EKLE.
//   tarih    : "YYYY-AA-GG" biçiminde (gün adı ve ay otomatik yazılır)
//   kategori : "microsoft", "sql", "hayat" (yukarıdaki listeden biri)
//   ruh      : o günün ruh hâlini anlatan bir emoji (isteğe bağlı)
//   baslik   : güne bir başlık (isteğe bağlı, boş bırakılabilir)
//   metin    : günün kaydı; paragraf için \n\n kullan
//   resimler : o günün fotoğrafları (isteğe bağlı).
//              Fotoğrafı img/ klasörüne kopyala, buraya adını yaz:
//              resimler: ["img/2026-07-11-kahve.jpg", "img/2026-07-11-gunbatimi.jpg"]
const gunluk = [
  {
    tarih: "2026-07-11",
    kategori: "hayat",
    ruh: "✨",
    baslik: "İlk kayıt: Günlük başlıyor",
    metin:
      "Bugün bu günlüğü kurdum. Uzun zamandır aklımdaydı: her günün sonunda birkaç satır yazmak, günü kağıda (ekrana) bırakıp öyle uyumak.\n\nAdı da hazırdı aslında: Çarnaçar. Hem soyadım, hem hâlim. İster istemez, mecburen... ama severek.\n\nHedef basit: her gün bir kayıt. Uzun olması gerekmiyor; bazen tek cümle bile yeter. Bakalım kaç gün üst üste yazabileceğim.",
    resimler: ["img/ornek.svg"],
  },
  {
    tarih: "2026-07-10",
    kategori: "sql",
    ruh: "🗄️",
    baslik: "Örnek: SQL notu",
    metin:
      "Bu, örnek bir SQL kaydı — kendi notunla değiştir ya da sil.\n\nBugün öğrendiğim sorguyu, çözdüğüm performans problemini ya da takıldığım hatayı buraya yazabilirim. Kategorisi \"sql\" olduğu için üstteki SQL filtresine tıklayınca sadece bu tür kayıtlar görünür.",
    resimler: [],
  },
  {
    tarih: "2026-07-09",
    kategori: "microsoft",
    ruh: "📘",
    baslik: "Örnek: Microsoft notu",
    metin:
      "Bu da örnek bir Microsoft kaydı.\n\nAzure'da denediğim bir servis, Microsoft Learn'de bitirdiğim bir modül ya da hazırlandığım sertifika sınavıyla ilgili notlar buraya.",
    resimler: [],
  },
];

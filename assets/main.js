/* Çarnaçar — sayfa davranışları: data.js içeriğini ekrana basar. */

// Kullanıcı içeriği HTML olarak değil metin olarak basılsın diye
// her şey textContent ile yerleştirilir.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---------- Tema ----------
const toggle = document.getElementById("theme-toggle");
const saved = localStorage.getItem("tema");
if (saved) document.documentElement.dataset.theme = saved;
updateToggleIcon();

toggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("tema", next);
  updateToggleIcon();
});

function updateToggleIcon() {
  toggle.textContent = document.documentElement.dataset.theme === "dark" ? "☀" : "☾";
}

// ---------- Videolar ----------
const vg = document.getElementById("video-grid");
videolar.forEach((v) => {
  const card = el("article", "video-card");

  if (v.youtubeId) {
    const frame = document.createElement("iframe");
    frame.className = "video-frame";
    frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.youtubeId);
    frame.title = v.baslik;
    frame.allowFullscreen = true;
    frame.loading = "lazy";
    card.append(frame);
  } else {
    card.append(el("div", "video-placeholder", "🎬"));
  }

  const body = el("div", "video-body");
  body.append(el("div", "video-title", v.baslik), el("div", "video-desc", v.aciklama));
  card.append(body);
  vg.append(card);
});

// ---------- Projeler ----------
const pg = document.getElementById("project-grid");
projeler.forEach((p) => {
  const card = el("article", "project-card");
  card.append(
    el("div", "project-icon", p.ikon),
    el("div", "project-name", p.ad),
    el("div", "project-desc", p.aciklama)
  );

  const tags = el("div", "project-tags");
  p.etiketler.forEach((t) => tags.append(el("span", "tag", t)));
  card.append(tags);

  if (p.link) {
    const a = el("a", "project-link", "Projeye git →");
    a.href = p.link;
    a.target = "_blank";
    a.rel = "noopener";
    card.append(a);
  }
  pg.append(card);
});

// ---------- Sertifikalar ----------
const cg = document.getElementById("cert-grid");
sertifikalar.forEach((s) => {
  const card = el(s.link ? "a" : "article", "cert-card");
  if (s.link) {
    card.href = s.link;
    card.target = "_blank";
    card.rel = "noopener";
  }
  card.append(
    el("div", "cert-code", s.kod),
    el("div", "cert-name", s.ad),
    el("div", "cert-date", s.tarih),
    el("div", "cert-verify", s.link ? "Doğrula ↗" : "Doğrulama linki ekle")
  );
  cg.append(card);
});

// ---------- Günlük ----------
const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

// "YYYY-AA-GG" biçimindeki tarihi yerel saat kaymasına takılmadan çözer.
function parseTarih(t) {
  const [y, m, d] = t.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const kayitlar = [...gunluk].sort((a, b) => (a.tarih < b.tarih ? 1 : -1));

// Hero'daki sayaç: toplam kayıt + kaç gündür yazılıyor
const stats = document.getElementById("diary-stats");
if (stats && kayitlar.length) {
  const ilk = parseTarih(kayitlar[kayitlar.length - 1].tarih);
  const bugun = new Date();
  const gunSayisi = Math.max(1, Math.floor((bugun - ilk) / 86400000) + 1);
  stats.textContent = `${kayitlar.length} kayıt · ${gunSayisi} gündür yazılıyor`;
}

// Kategori filtresi: "tumu" + data.js'deki kategoriler
const dl = document.getElementById("diary-list");
const filterBar = document.getElementById("category-filter");
let aktifKategori = "tumu";

["tumu", ...kategoriler].forEach((k) => {
  const btn = el("button", "chip", k === "tumu" ? "tümü" : k.toUpperCase());
  btn.dataset.kategori = k;
  if (k === aktifKategori) btn.classList.add("active");
  btn.addEventListener("click", () => {
    aktifKategori = k;
    filterBar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    renderDiary();
  });
  filterBar.append(btn);
});

function renderDiary() {
  dl.replaceChildren();
  let sonAyBaslik = "";

  const secili =
    aktifKategori === "tumu"
      ? kayitlar
      : kayitlar.filter((g) => g.kategori === aktifKategori);

  if (!secili.length) {
    dl.append(el("p", "diary-empty", "Bu kategoride henüz kayıt yok."));
    return;
  }

  secili.forEach((g) => {
    const d = parseTarih(g.tarih);
    const ayBaslik = `${AYLAR[d.getMonth()]} ${d.getFullYear()}`;

    if (ayBaslik !== sonAyBaslik) {
      dl.append(el("h3", "diary-month", ayBaslik));
      sonAyBaslik = ayBaslik;
    }

    const card = el("article", "diary-card");

    const dateBox = el("div", "diary-date");
    dateBox.append(
      el("div", "diary-day", String(d.getDate())),
      el("div", "diary-weekday", GUNLER[d.getDay()])
    );

    const body = el("div", "diary-body");
    const meta = el("div", "diary-meta");
    if (g.ruh) meta.append(el("span", "diary-mood", g.ruh));
    if (g.baslik) meta.append(el("h4", "diary-title", g.baslik));
    if (g.kategori) meta.append(el("span", "tag", g.kategori.toUpperCase()));
    body.append(meta);

    const metin = el("div", "diary-text", g.metin);
    const more = el("div", "post-more", "Devamını oku ↓");
    body.append(metin);

    // Günün fotoğrafları — tıklayınca büyür
    if (g.resimler && g.resimler.length) {
      const photos = el("div", "diary-photos");
      g.resimler.forEach((src) => {
        const img = document.createElement("img");
        img.className = "diary-photo";
        img.src = src;
        img.alt = g.baslik || g.tarih;
        img.loading = "lazy";
        img.addEventListener("click", (e) => {
          e.stopPropagation(); // kartın aç/kapa davranışını tetiklemesin
          openLightbox(src, img.alt);
        });
        photos.append(img);
      });
      body.append(photos);
    }

    body.append(more);

    card.append(dateBox, body);

    // Kısa kayıtlar zaten tam görünür; uzunlar tıklayınca açılır.
    requestAnimationFrame(() => {
      if (metin.scrollHeight <= metin.clientHeight + 4) more.remove();
    });

    card.addEventListener("click", () => {
      card.classList.toggle("open");
      more.textContent = card.classList.contains("open") ? "Kapat ↑" : "Devamını oku ↓";
    });

    dl.append(card);
  });
}

renderDiary();

// ---------- Lightbox (fotoğraf büyütme) ----------
function openLightbox(src, alt) {
  const overlay = el("div", "lightbox");
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  const hint = el("div", "lightbox-hint", "Kapatmak için tıkla ✕");
  overlay.append(img, hint);
  overlay.addEventListener("click", () => overlay.remove());
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", esc);
    }
  });
  document.body.append(overlay);
}

// ---------- Yıl ----------
document.getElementById("year").textContent = new Date().getFullYear();

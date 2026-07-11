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

// ---------- Kod bloğu: metin içinde ```lang ... ``` desteği ----------
// Basit sözdizimi renklendirme (SQL / C# / JS ortak anahtar kelimeler)
const KEYWORDS =
  "SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|ORDER|BY|HAVING|AS|AND|OR|NOT|NULL|IS|IN|LIKE|CASE|WHEN|THEN|ELSE|END|CREATE|ALTER|DROP|TABLE|VIEW|PROCEDURE|FUNCTION|TRIGGER|INDEX|DECLARE|SET|BEGIN|EXEC|EXECUTE|VALUES|TOP|DISTINCT|UNION|ALL|WITH|IF|ELSE|WHILE|RETURN|PRINT|GETDATE|COUNT|SUM|AVG|MIN|MAX|var|let|const|function|return|if|else|for|while|class|new|async|await|import|export|default|try|catch|throw|typeof|public|private|static|void|string|int|bool|decimal|using|namespace|foreach|this|true|false";

const TOKEN_RE = new RegExp(
  "(--[^\\n]*|//[^\\n]*|/\\*[\\s\\S]*?\\*/)" + // yorum
    "|('(?:[^'\\n]|'')*'|\"[^\"\\n]*\")" + // metin
    "|\\b(\\d+(?:\\.\\d+)?)\\b" + // sayı
    `|\\b(${KEYWORDS})\\b`, // anahtar kelime
  "g"
);

function highlightCode(kod, hedef) {
  let son = 0, m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(kod))) {
    if (m.index > son) hedef.append(kod.slice(son, m.index));
    const cls = m[1] ? "tok-comment" : m[2] ? "tok-string" : m[3] ? "tok-num" : "tok-kw";
    hedef.append(el("span", cls, m[0]));
    son = m.index + m[0].length;
  }
  if (son < kod.length) hedef.append(kod.slice(son));
}

// Metni paragraf + kod bloklarına ayırıp DOM olarak üretir
function renderMetin(metin, container) {
  const parcalar = metin.split(/```(\w*)\n?([\s\S]*?)```/g);
  // split sonucu: [metin, dil, kod, metin, dil, kod, ...]
  for (let i = 0; i < parcalar.length; i += 3) {
    const duz = (parcalar[i] || "").trim();
    if (duz) container.append(el("p", "diary-para", duz));

    if (i + 2 < parcalar.length) {
      const dil = (parcalar[i + 1] || "kod").toUpperCase();
      const kod = (parcalar[i + 2] || "").replace(/^\n+|\n+$/g, "");

      const blok = el("div", "code-block");
      const head = el("div", "code-head");
      head.append(el("span", "code-lang", dil));

      const btn = el("button", "code-copy", "Kopyala");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(kod).then(() => {
          btn.textContent = "✓ Kopyalandı";
          setTimeout(() => (btn.textContent = "Kopyala"), 1500);
        });
      });
      head.append(btn);

      const pre = document.createElement("pre");
      const code = document.createElement("code");
      highlightCode(kod, code);
      pre.append(code);
      blok.append(head, pre);
      container.append(blok);
    }
  }
}

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

// Yeni tarih üstte; aynı tarihli kayıtlar data.js'deki sırasını korur
const kayitlar = [...gunluk].sort((a, b) => (a.tarih < b.tarih ? 1 : a.tarih > b.tarih ? -1 : 0));

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

const navList = document.getElementById("diary-nav-list");

function kayitBasligi(g, d) {
  return g.baslik || `${d.getDate()} ${AYLAR[d.getMonth()]} günlüğü`;
}

function renderDiary() {
  dl.replaceChildren();
  navList.replaceChildren();
  let sonAyBaslik = "";

  const secili =
    aktifKategori === "tumu"
      ? kayitlar
      : kayitlar.filter((g) => g.kategori === aktifKategori);

  if (!secili.length) {
    dl.append(el("p", "diary-empty", "Bu kategoride henüz kayıt yok."));
    return;
  }

  secili.forEach((g, idx) => {
    const d = parseTarih(g.tarih);
    const ayBaslik = `${AYLAR[d.getMonth()]} ${d.getFullYear()}`;
    const baslik = kayitBasligi(g, d);
    const kayitId = `kayit-${idx}`;

    // ---- Sol menü: konu listesi ----
    const li = document.createElement("li");
    const navBtn = el("button", "diary-nav-item");
    navBtn.append(
      el("span", "dn-title", `${g.ruh ? g.ruh + " " : ""}${baslik}`),
      el("span", "dn-date", `${d.getDate()} ${AYLAR[d.getMonth()]} · ${g.kategori || ""}`)
    );
    navBtn.addEventListener("click", () => {
      const hedef = document.getElementById(kayitId);
      hedef.scrollIntoView({ behavior: "smooth", block: "start" });
      hedef.classList.add("open");
      navList.querySelectorAll(".diary-nav-item").forEach((x) => x.classList.remove("active"));
      navBtn.classList.add("active");
    });
    li.append(navBtn);
    navList.append(li);

    // ---- Sağ: blog yazısı ----
    if (ayBaslik !== sonAyBaslik) {
      dl.append(el("h3", "diary-month", ayBaslik));
      sonAyBaslik = ayBaslik;
    }

    const card = el("article", "diary-card");
    card.id = kayitId;

    const head = el("header", "diary-head");
    const h = el("h3", "diary-title-big");
    if (g.ruh) h.append(el("span", "diary-mood", g.ruh + " "));
    h.append(document.createTextNode(baslik));

    const dateBox = el("div", "diary-date-right");
    dateBox.append(
      el("div", "dd-date", `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`),
      el("div", "dd-day", GUNLER[d.getDay()])
    );
    head.append(h, dateBox);
    card.append(head);

    if (g.kategori) {
      const meta = el("div", "diary-meta");
      meta.append(el("span", "tag", g.kategori.toUpperCase()));
      card.append(meta);
    }

    const metin = el("div", "diary-text");
    renderMetin(g.metin, metin);
    const more = el("div", "post-more", "Devamını oku ↓");
    card.append(metin);

    // Günün fotoğrafları — tıklayınca büyür
    if (g.resimler && g.resimler.length) {
      const photos = el("div", "diary-photos");
      g.resimler.forEach((src) => {
        const img = document.createElement("img");
        img.className = "diary-photo";
        img.src = src;
        img.alt = baslik;
        img.loading = "lazy";
        img.addEventListener("click", (e) => {
          e.stopPropagation(); // kartın aç/kapa davranışını tetiklemesin
          openLightbox(src, img.alt);
        });
        photos.append(img);
      });
      card.append(photos);
    }

    card.append(more);

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

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

// ---------- Video / canlı yayın gömme ----------
// YouTube'un her link biçimini tanır: Paylaş düğmesi (youtu.be/ID?si=...),
// watch?v=, mobil (m.youtube.com), Shorts, canlı yayın (/live/) ve embed.
// Kick kanal linklerini de oynatıcıya çevirir.
function videoEmbedUrl(url) {
  const YT = "https://www.youtube-nocookie.com/embed/";
  try {
    const u = new URL(/^https?:\/\//.test(url) ? url : "https://" + url);
    const host = u.hostname.replace(/^(www\.|m\.)/, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id) return YT + id;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v"); // watch?v=ID (parametre sırası fark etmez)
      if (v) return YT + v;
      const m = u.pathname.match(/^\/(?:live|shorts|embed|v)\/([\w-]+)/);
      if (m) return YT + m[1];
    }
    if (host === "kick.com") {
      const kanal = u.pathname.split("/")[1];
      if (kanal) return "https://player.kick.com/" + kanal;
    }
  } catch {}
  return null;
}

function videoEkle(container, url, baslik) {
  const embed = videoEmbedUrl(url);
  if (embed) {
    const wrap = el("div", "diary-video");
    const frame = document.createElement("iframe");
    frame.src = embed;
    frame.title = baslik;
    frame.allowFullscreen = true;
    frame.loading = "lazy";
    frame.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    wrap.append(frame);
    wrap.addEventListener("click", (e) => e.stopPropagation());
    container.append(wrap);
  } else {
    // Tanınmayan platform: bağlantı düğmesi göster
    const a = el("a", "diary-video-link", "▶ Yayını / videoyu izle ↗");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", (e) => e.stopPropagation());
    container.append(a);
  }
}

// ---------- Sertifikalar ----------
const cg = document.getElementById("cert-grid");
if (cg) sertifikalar.forEach((s) => {
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

// ---------- Kripto cüzdanlar (Destek & Sponsorluk) ----------
const cryptoGrid = document.getElementById("crypto-grid");
if (cryptoGrid) kripto.forEach((c) => {
  const card = el("article", "crypto-card");
  card.append(
    el("div", "crypto-code", c.kod),
    el("div", "crypto-name", `${c.ad} · ${c.ag}`),
    el("div", "crypto-addr", c.adres)
  );
  const btn = el("button", "code-copy", "Adresi kopyala");
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(c.adres).then(() => {
      btn.textContent = "✓ Kopyalandı";
      setTimeout(() => (btn.textContent = "Adresi kopyala"), 1500);
    });
  });
  card.append(btn);
  cryptoGrid.append(card);
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
      const dil = (parcalar[i + 1] || "kod").toLocaleUpperCase("tr");
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

// Kategori adını büyük harfe çevirir (marka adları Türkçe İ kuralından muaf)
const MARKA_ADLARI = { microsoft: "MICROSOFT", kick: "KICK", twitch: "TWITCH", github: "GITHUB" };
function kategoriEtiket(k) {
  return MARKA_ADLARI[k] || k.toLocaleUpperCase("tr");
}

// Kategori filtresi: "tumu" + data.js'deki kategoriler (kayıt sayaçlarıyla)
const dl = document.getElementById("diary-list");
const filterBar = document.getElementById("category-filter");
let aktifKategori = "tumu";
let aktifKayit = null; // null = liste; sayı = detayda gösterilen kaydın sırası
let aktifAy = null; // "2026-07" gibi; null = tüm aylar

// Sadece içinde kayıt olan kategoriler filtre olarak gösterilir
const doluKategoriler = kategoriler.filter((k) => kayitlar.some((g) => g.kategori === k));

if (filterBar) ["tumu", ...doluKategoriler].forEach((k) => {
  const btn = el("button", "chip", k === "tumu" ? "tümü" : kategoriEtiket(k));
  btn.dataset.kategori = k;
  if (k === aktifKategori) btn.classList.add("active");
  btn.addEventListener("click", () => {
    aktifKategori = k;
    aktifKayit = null; // filtre seçilince listeye dön
    filterBar.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    renderDiary();
  });
  filterBar.append(btn);
});

// Konularda arama: başlık, metin, kategori ve tarihte geçen kelimeyi bulur
const searchInput = document.getElementById("diary-search");
let arama = "";
if (searchInput) searchInput.addEventListener("input", () => {
  arama = searchInput.value.trim().toLocaleLowerCase("tr");
  aktifKayit = null; // arama yapılınca listeye dön
  renderDiary();
});

const navList = document.getElementById("diary-nav-list");
const popularBox = document.getElementById("popular-box");
const popularList = document.getElementById("popular-list");

function kayitBasligi(g, d) {
  return g.baslik || `${d.getDate()} ${AYLAR[d.getMonth()]} günlüğü`;
}

// ---------- Okunma sayacı (küresel: Cloudflare Worker + KV) ----------
// Tüm ziyaretçilerin okumaları Worker'da toplanır; Worker'a ulaşılamazsa
// tarayıcıdaki yerel sayaç yedek olarak kullanılır.
const SAYAC_URL = "https://kodgunlugu-sayac.omer-carnacar.workers.dev";
let globalOkunma = null; // Worker'dan gelen sayaçlar; null = henüz yok

function kayitKimlik(g) {
  return g.tarih + "|" + (g.baslik || "");
}
function okunmaAl() {
  if (globalOkunma) return globalOkunma;
  try { return JSON.parse(localStorage.getItem("okunma") || "{}"); }
  catch { return {}; }
}
function okunmaArtir(g) {
  const k = kayitKimlik(g);

  // Yerel yedek sayaç
  try {
    const o = JSON.parse(localStorage.getItem("okunma") || "{}");
    o[k] = (o[k] || 0) + 1;
    localStorage.setItem("okunma", JSON.stringify(o));
  } catch {}

  // Küresel sayaç
  fetch(`${SAYAC_URL}/hit?id=${encodeURIComponent(k)}`, { method: "POST" })
    .then((r) => r.json())
    .then((v) => {
      if (v && typeof v.okunma === "number") {
        globalOkunma = globalOkunma || {};
        globalOkunma[k] = v.okunma;
        renderPopular();
      }
    })
    .catch(() => {}); // çevrimdışı/engelli ise sessizce yerelde kal

  renderPopular();
}

// Sayfa açılışında küresel sayaçları çek
fetch(`${SAYAC_URL}/counts`)
  .then((r) => r.json())
  .then((v) => {
    if (v && typeof v === "object" && !v.hata) {
      globalOkunma = v;
      renderPopular();
    }
  })
  .catch(() => {});

// En çok okunan ilk 5 kaydı sol üstte listeler
function renderPopular() {
  if (!popularBox) return;
  const o = okunmaAl();
  const sirali = kayitlar
    .map((g) => ({ g, n: o[kayitKimlik(g)] || 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);

  popularList.replaceChildren();
  if (!sirali.length) { popularBox.hidden = true; return; }
  popularBox.hidden = false;

  sirali.forEach(({ g, n }) => {
    const d = parseTarih(g.tarih);
    const baslik = kayitBasligi(g, d);
    const li = document.createElement("li");
    const btn = el("button", "diary-nav-item");
    btn.append(
      el("span", "dn-title", `${g.ruh ? g.ruh + " " : ""}${baslik}`),
      el("span", "dn-date", `${n} okunma · ${kategoriEtiket(g.kategori || "")}`)
    );
    btn.addEventListener("click", () => acKayit(g)); // içeriğe tıkla → ana içerik
    li.append(btn);
    popularList.append(li);
  });
}

function renderDiary() {
  if (!dl) return; // bu sayfada günlük yok
  dl.replaceChildren();
  navList.replaceChildren();
  let sonAyBaslik = "";

  const secili = kayitlar.filter((g) => {
    if (aktifKategori !== "tumu" && g.kategori !== aktifKategori) return false;
    if (aktifAy && !g.tarih.startsWith(aktifAy)) return false;
    if (!arama) return true;
    return [g.baslik, g.metin, g.kategori, g.tarih]
      .join(" ")
      .toLocaleLowerCase("tr")
      .includes(arama);
  });

  renderArchive();

  if (!secili.length) {
    dl.append(el("p", "diary-empty", arama ? `"${searchInput.value.trim()}" ile eşleşen kayıt yok.` : "Bu kategoride henüz kayıt yok."));
    return;
  }

  // ---- Sol menü: kategoriye göre gruplu konu listesi ----
  const gruplar = {};
  secili.forEach((g) => {
    const k = g.kategori || "diğer";
    (gruplar[k] = gruplar[k] || []).push(g);
  });

  [...kategoriler, "diğer"].forEach((k) => {
    const uyeler = gruplar[k];
    if (!uyeler || !uyeler.length) return;

    const li = el("li", "nav-grup open"); // varsayılan: açık — kullanıcı hemen görsün

    const grupBtn = el("button", "nav-grup-baslik");
    grupBtn.append(
      el("span", "nav-grup-ok", "▾"),
      el("span", "nav-grup-ad", kategoriEtiket(k)),
      el("span", "nav-grup-adet", String(uyeler.length))
    );
    grupBtn.addEventListener("click", () => li.classList.toggle("open"));
    li.append(grupBtn);

    const altListe = el("ul", "nav-grup-liste");
    uyeler.forEach((g) => {
      const d = parseTarih(g.tarih);
      const baslik = kayitBasligi(g, d);
      const altLi = document.createElement("li");
      const navBtn = el("button", "diary-nav-item");
      navBtn.append(
        el("span", "dn-title", `${g.ruh ? g.ruh + " " : ""}${baslik}`),
        el("span", "dn-date", `${d.getDate()} ${AYLAR[d.getMonth()]}`)
      );
      navBtn.addEventListener("click", () => {
        acKayit(g); // içeriğe tıkla → ana içerik
        navList.querySelectorAll(".diary-nav-item").forEach((x) => x.classList.remove("active"));
        navBtn.classList.add("active");
      });
      altLi.append(navBtn);
      altListe.append(altLi);
    });
    li.append(altListe);
    navList.append(li);
  });

  // ---- Sağ taraf: detay (ana içerik) ya da liste ----
  if (aktifKayit !== null) {
    const g = kayitlar[aktifKayit];
    const geri = el("button", "back-btn", "← Tüm kayıtlar");
    geri.addEventListener("click", kapatKayit);
    dl.append(geri, kartOlustur(g, true));
    return;
  }

  secili.forEach((g) => {
    const d = parseTarih(g.tarih);
    const ayBaslik = `${AYLAR[d.getMonth()]} ${d.getFullYear()}`;

    if (ayBaslik !== sonAyBaslik) {
      dl.append(el("h3", "diary-month", ayBaslik));
      sonAyBaslik = ayBaslik;
    }

    dl.append(kartOlustur(g, false));
  });
}

// ---------- Ay bazlı arşiv (sol menü) ----------
const archiveList = document.getElementById("archive-list");

function renderArchive() {
  if (!archiveList) return;
  archiveList.replaceChildren();

  // Ayları topla: { "2026-07": adet }
  const aylar = {};
  kayitlar.forEach((g) => {
    const ay = g.tarih.slice(0, 7);
    aylar[ay] = (aylar[ay] || 0) + 1;
  });

  Object.keys(aylar).sort().reverse().forEach((ay) => {
    const [y, m] = ay.split("-").map(Number);
    const li = document.createElement("li");
    const btn = el("button", "diary-nav-item arsiv-item" + (aktifAy === ay ? " active" : ""));
    btn.append(
      el("span", "dn-title", `${AYLAR[m - 1]} ${y}`),
      el("span", "dn-date", `${aylar[ay]} kayıt${aktifAy === ay ? " · filtre açık ✕" : ""}`)
    );
    btn.addEventListener("click", () => {
      aktifAy = aktifAy === ay ? null : ay; // aynı aya tekrar tıkla → filtreyi kaldır
      aktifKayit = null;
      renderDiary();
    });
    li.append(btn);
    archiveList.append(li);
  });
}

// Bir kaydı ana içerik görünümünde açar
function acKayit(g) {
  aktifKayit = kayitlar.indexOf(g);
  okunmaArtir(g);
  renderDiary();
  const bolum = document.getElementById("gunluk");
  if (bolum) bolum.scrollIntoView({ behavior: "smooth", block: "start" });
}

function kapatKayit() {
  aktifKayit = null;
  renderDiary();
}

// Kayıt kartını üretir. detay=true → tam içerik (ana içerik görünümü),
// detay=false → listede kısaltılmış önizleme; tıklayınca detaya gider.
function kartOlustur(g, detay) {
  const d = parseTarih(g.tarih);
  const baslik = kayitBasligi(g, d);

  const card = el("article", "diary-card" + (detay ? " open detail" : ""));
  card.id = `kayit-${kayitlar.indexOf(g)}`;

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
    meta.append(el("span", "tag", kategoriEtiket(g.kategori)));
    card.append(meta);
  }

  // ---- Özel içerik: erişim kodu girilene dek kilitli ----
  const kilitAnahtari = "ozel-" + g.tarih + "-" + (g.baslik || "");
  const kilitli = g.ozelKod && localStorage.getItem(kilitAnahtari) !== g.ozelKod;

  if (kilitli) {
    const kutu = el("div", "diary-lock");
    kutu.append(
      el("p", "lock-msg", "🔒 Bu kayıt destekçilere özeldir. Erişim kodun varsa gir; yoksa Destek bölümünden kripto ile destek olup e-postayla kodunu iste.")
    );
    const satir = el("div", "lock-row");
    const inp = document.createElement("input");
    inp.type = "password";
    inp.placeholder = "Erişim kodu";
    inp.className = "lock-input";
    const ac = el("button", "lock-btn", "Aç");
    const dene = () => {
      if (inp.value.trim() === g.ozelKod) {
        localStorage.setItem(kilitAnahtari, g.ozelKod);
        renderDiary();
      } else {
        inp.value = "";
        inp.placeholder = "Kod yanlış, tekrar dene";
      }
    };
    ac.addEventListener("click", dene);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") dene(); });
    satir.append(inp, ac);
    kutu.append(satir);
    kutu.addEventListener("click", (e) => e.stopPropagation());
    card.append(kutu);
    if (!detay) card.addEventListener("click", () => acKayit(g)); // kilitliyken de detaya gidilebilsin
    return card; // metin, video ve fotoğraflar gizli kalır
  }

  if (detay) {
    // Tam içerik: metin, video, fotoğraflar
    const metin = el("div", "diary-text");
    renderMetin(g.metin, metin);
    card.append(metin);

    if (g.video) videoEkle(card, g.video, baslik);

    if (g.resimler && g.resimler.length) {
      const photos = el("div", "diary-photos");
      g.resimler.forEach((src) => {
        const img = document.createElement("img");
        img.className = "diary-photo";
        img.src = src;
        img.alt = baslik;
        img.loading = "lazy";
        img.addEventListener("click", (e) => {
          e.stopPropagation();
          openLightbox(src, img.alt);
        });
        photos.append(img);
      });
      card.append(photos);
    }
  } else {
    // Liste: temiz özet + içerik göstergeleri
    card.append(el("p", "diary-excerpt", metinOzet(g.metin)));

    const gosterge = [];
    if (/```/.test(g.metin)) gosterge.push("💻 kod");
    if (g.video) gosterge.push("🎬 video");
    if (g.resimler && g.resimler.length) gosterge.push(`📷 ${g.resimler.length} fotoğraf`);
    if (gosterge.length) card.append(el("div", "diary-badges", gosterge.join("  ·  ")));

    card.append(el("div", "post-more", "Devamını oku →"));
    card.addEventListener("click", () => acKayit(g)); // içeriğe tıkla → ana içerik
  }

  return card;
}

// Liste özetı: kod bloklarını çıkarır, tek satıra indirir, 180 karakterde "…" ile keser
function metinOzet(metin) {
  const duz = (metin || "").replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ").trim();
  return duz.length > 180 ? duz.slice(0, 180).trimEnd() + "…" : duz;
}

renderDiary();
renderPopular();

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

/* ============================================================
   Çarnaçar — Yönetim paneli
   data.js içeriğini formlarla düzenler, dosyayı diske yazar.
   ============================================================ */

// data.js'ten gelen listelerin çalışma kopyası
const state = {
  gunluk: JSON.parse(JSON.stringify(gunluk)),
  kategoriler: [...kategoriler],
  sertifikalar: JSON.parse(JSON.stringify(sertifikalar)),
  kripto: JSON.parse(JSON.stringify(kripto)),
};

// Her bölümün form alanları ve liste görünümü
// tip: text | date | textarea | select-kategori | virgul-listesi
const BOLUMLER = {
  gunluk: {
    ad: "📓 Günlük",
    tekil: "günlük kaydı",
    alanlar: [
      { k: "tarih", etiket: "Tarih", tip: "date", zorunlu: true },
      { k: "kategori", etiket: "Kategori", tip: "select-kategori" },
      { k: "ruh", etiket: "Ruh hâli (bir emoji)", tip: "text", ornek: "✨" },
      { k: "baslik", etiket: "Başlık (isteğe bağlı)", tip: "text" },
      { k: "metin", etiket: "Metin — paragraf için boş satır; kod için ```sql ... ``` blokları", tip: "textarea", zorunlu: true },
      { k: "video", etiket: "Video / yayın linki (YouTube veya Kick)", tip: "text", ornek: "https://www.youtube.com/watch?v=XXXX" },
      { k: "resimler", etiket: "Fotoğraflar — img/ klasörüne koy, virgülle ayır", tip: "virgul-listesi", ornek: "img/2026-07-12-kahve.jpg, img/2026-07-12-mac.jpg" },
      { k: "ozelKod", etiket: "Özel içerik erişim kodu (boş = herkese açık)", tip: "text", ornek: "vip2026" },
    ],
    ozet: (x) => `<strong>${esc(x.tarih)}</strong> <span class="dim">· ${esc(x.kategori || "-")} · ${esc(x.baslik || (x.metin || "").slice(0, 50))}</span>`,
  },
  kategoriler: {
    ad: "🏷️ Kategoriler",
    tekil: "kategori",
    alanlar: [{ k: "ad", etiket: "Kategori adı (küçük harf)", tip: "text", zorunlu: true, ornek: "azure" }],
    metinListesi: true, // öğeler nesne değil, düz metin
    ozet: (x) => {
      const adet = state.gunluk.filter((g) => g.kategori === x).length;
      return `<strong>${esc(x.toLocaleUpperCase("tr"))}</strong> <span class="dim">· ${adet} kayıt</span>`;
    },
  },
  sertifikalar: {
    ad: "🎓 Sertifikalar",
    tekil: "sertifika",
    alanlar: [
      { k: "kod", etiket: "Sınav kodu", tip: "text", zorunlu: true, ornek: "AZ-900" },
      { k: "ad", etiket: "Sertifika adı", tip: "text", zorunlu: true, ornek: "Microsoft Azure Fundamentals" },
      { k: "tarih", etiket: "Alındığı tarih", tip: "text", ornek: "Mart 2025" },
      { k: "link", etiket: "Doğrulama linki (Learn profili → Share)", tip: "text" },
    ],
    ozet: (x) => `<strong>${esc(x.kod)}</strong> <span class="dim">· ${esc(x.ad)} · ${esc(x.tarih || "")}</span>`,
  },
  kripto: {
    ad: "₿ Kripto Cüzdanlar",
    tekil: "cüzdan",
    alanlar: [
      { k: "kod", etiket: "Sembol", tip: "text", zorunlu: true, ornek: "BTC" },
      { k: "ad", etiket: "Coin adı", tip: "text", zorunlu: true, ornek: "Bitcoin" },
      { k: "ag", etiket: "Ağ", tip: "text", ornek: "TRC-20" },
      { k: "adres", etiket: "Cüzdan adresi", tip: "text", zorunlu: true },
    ],
    ozet: (x) => `<strong>${esc(x.kod)}</strong> <span class="dim">· ${esc(x.ag || "")} · ${esc((x.adres || "").slice(0, 24))}...</span>`,
  },
};

let aktif = "gunluk";
let duzenlenen = null; // düzenlenen öğenin index'i, yoksa null
let kirli = false;
let dosyaHandle = null;
let imgKlasoru = null; // img/ klasörünün erişim izni (ilk resimde bir kez seçilir)

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// ---------- Kenar çubuğu ----------
const sidebar = document.getElementById("sidebar");
Object.entries(BOLUMLER).forEach(([key, b]) => {
  const btn = document.createElement("button");
  btn.className = "side-btn" + (key === aktif ? " active" : "");
  btn.textContent = b.ad;
  btn.addEventListener("click", () => {
    aktif = key;
    duzenlenen = null;
    sidebar.querySelectorAll(".side-btn").forEach((x) => x.classList.remove("active"));
    btn.classList.add("active");
    renderPanel();
  });
  sidebar.append(btn);
});

// ---------- Form ----------
const form = document.getElementById("form");
const formFields = document.getElementById("form-fields");

function renderForm(deger) {
  const b = BOLUMLER[aktif];
  formFields.replaceChildren();

  b.alanlar.forEach((a) => {
    const wrap = document.createElement("div");
    wrap.className = "form-field" + (a.tip === "textarea" || a.k === "metin" ? " full" : "");

    const label = document.createElement("label");
    label.textContent = a.etiket + (a.zorunlu ? " *" : "");
    wrap.append(label);

    let input;
    if (a.tip === "textarea") {
      input = document.createElement("textarea");
    } else if (a.tip === "select-kategori") {
      input = document.createElement("select");
      state.kategoriler.forEach((k) => {
        const opt = document.createElement("option");
        opt.value = k;
        opt.textContent = k.toLocaleUpperCase("tr");
        input.append(opt);
      });
    } else {
      input = document.createElement("input");
      input.type = a.tip === "date" ? "date" : "text";
    }
    input.name = a.k;
    if (a.ornek) input.placeholder = a.ornek;
    if (a.zorunlu) input.required = true;

    // Düzenleme modunda mevcut değeri doldur
    if (deger !== undefined) {
      const v = b.metinListesi ? deger : deger[a.k];
      input.value = a.tip === "virgul-listesi" ? (v || []).join(", ") : v == null ? "" : v;
    } else if (a.tip === "date") {
      input.value = new Date().toISOString().slice(0, 10); // bugün
    }

    wrap.append(input);

    // Metin alanının altına araç düğmeleri: resim ve kod ekleme
    if (a.k === "metin") {
      const bar = document.createElement("div");
      bar.className = "editor-bar";

      const btnResim = document.createElement("button");
      btnResim.type = "button";
      btnResim.className = "item-btn";
      btnResim.textContent = "📷 Resim ekle";
      btnResim.addEventListener("click", () => resimSecVeEkle(input));

      bar.append(btnResim);

      // Dil kısayolları: tıkla → o dilin kod şablonu imlece eklenir
      const DILLER = [
        { ad: "SQL", fence: "sql", yorum: "-- SQL kodunu buraya yaz" },
        { ad: "C#", fence: "csharp", yorum: "// C# kodunu buraya yaz" },
        { ad: "JS", fence: "js", yorum: "// JavaScript kodunu buraya yaz" },
        { ad: "HTML", fence: "html", yorum: "<!-- HTML kodunu buraya yaz -->" },
        { ad: "PowerShell", fence: "powershell", yorum: "# PowerShell kodunu buraya yaz" },
      ];
      DILLER.forEach((d) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "item-btn kod-tag";
        b.textContent = "💻 " + d.ad;
        b.addEventListener("click", () => {
          metneEkle(input, "\n```" + d.fence + "\n" + d.yorum + "\n```\n");
        });
        bar.append(b);
      });

      const ipucu = document.createElement("span");
      ipucu.className = "editor-hint";
      ipucu.textContent = "İmlecin olduğu yere eklenir";
      bar.append(ipucu);

      wrap.append(bar);
    }

    formFields.append(wrap);
  });

  document.getElementById("form-title").textContent =
    duzenlenen === null ? `Yeni ${b.tekil} ekle` : `${b.tekil} düzenle`;
  document.getElementById("form-sub").textContent =
    duzenlenen === null ? "Doldur ve Ekle'ye bas — listenin başına eklenir." : "Değiştir ve Güncelle'ye bas.";
  document.getElementById("btn-submit").textContent = duzenlenen === null ? "＋ Ekle" : "✓ Güncelle";
  document.getElementById("btn-cancel").style.display = duzenlenen === null ? "none" : "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const b = BOLUMLER[aktif];
  const fd = new FormData(form);

  let yeni;
  if (b.metinListesi) {
    yeni = String(fd.get("ad") || "").trim().toLowerCase();
    if (!yeni) return;
    if (duzenlenen === null && state.kategoriler.includes(yeni)) {
      alert("Bu kategori zaten var.");
      return;
    }
  } else {
    yeni = {};
    b.alanlar.forEach((a) => {
      const v = String(fd.get(a.k) || "").trim();
      yeni[a.k] = a.tip === "virgul-listesi" ? (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []) : v;
    });
  }

  if (duzenlenen === null) {
    state[aktif].unshift(yeni);
  } else {
    state[aktif][duzenlenen] = yeni;
    duzenlenen = null;
  }

  setKirli(true);
  form.reset();
  renderPanel();
});

document.getElementById("btn-cancel").addEventListener("click", () => {
  duzenlenen = null;
  form.reset();
  renderPanel();
});

// ---------- Liste ----------
function renderList() {
  const b = BOLUMLER[aktif];
  const list = document.getElementById("item-list");
  list.replaceChildren();

  document.getElementById("bar-title").textContent = b.ad;
  document.getElementById("list-title").textContent = "Mevcut kayıtlar";
  document.getElementById("list-count").textContent = `${state[aktif].length} ${b.tekil}`;

  state[aktif].forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "item-row" + (i === duzenlenen ? " editing" : "");

    const info = document.createElement("div");
    info.className = "item-info";
    info.innerHTML = b.ozet(item);

    const btnEdit = document.createElement("button");
    btnEdit.className = "item-btn";
    btnEdit.textContent = "Düzenle";
    btnEdit.addEventListener("click", () => {
      duzenlenen = i;
      renderPanel();
      form.scrollIntoView({ behavior: "smooth" });
    });

    const btnDel = document.createElement("button");
    btnDel.className = "item-btn danger";
    btnDel.textContent = "Sil";
    btnDel.addEventListener("click", () => {
      const adWhat = b.metinListesi ? item : item.baslik || item.ad || item.tarih || "";
      if (!confirm(`Silinsin mi?\n\n${adWhat}`)) return;
      state[aktif].splice(i, 1);
      if (duzenlenen === i) duzenlenen = null;
      setKirli(true);
      renderPanel();
    });

    row.append(info, btnEdit, btnDel);
    list.append(row);
  });

  if (!state[aktif].length) {
    const p = document.createElement("p");
    p.className = "panel-sub";
    p.textContent = "Henüz kayıt yok — yukarıdan ekle.";
    list.append(p);
  }
}

function renderPanel() {
  renderForm(duzenlenen === null ? undefined : state[aktif][duzenlenen]);
  renderList();
}

// ---------- Editör araçları: resim ve kod ekleme ----------
// İmlecin olduğu yere metin parçası ekler
function metneEkle(ta, parca) {
  const bas = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
  const son = ta.selectionEnd != null ? ta.selectionEnd : bas;
  ta.value = ta.value.slice(0, bas) + parca + ta.value.slice(son);
  ta.focus();
  ta.selectionStart = ta.selectionEnd = bas + parca.length;
}

// Dosya adını URL'ye uygun hale getirir: "Foto 1.JPG" → "2026-07-16-foto-1.jpg"
function guvenliAd(ad) {
  const tarih = new Date().toISOString().slice(0, 10);
  const temiz = ad
    .toLocaleLowerCase("tr")
    .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİi]/g, "i")
    .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${tarih}-${temiz}`;
}

// Resim(ler) seç → img/ klasörüne kopyala → metne ![](img/...) olarak ekle
async function resimSecVeEkle(textarea) {
  if (!window.showOpenFilePicker || !window.showDirectoryPicker) {
    alert("Bu özellik Chrome/Edge gerektirir.\n\nElle eklemek için: resmi img/ klasörüne kopyala, metne şunu yaz:\n![açıklama](img/dosya-adi.jpg)");
    return;
  }
  try {
    const secilenler = await window.showOpenFilePicker({
      multiple: true,
      types: [{ description: "Resimler", accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] } }],
    });

    // İlk kullanımda sitenin img/ klasörünü seçtir
    if (!imgKlasoru) {
      alert("Şimdi sitenin img klasörünü seç (D:\\GLOBAL\\My_360\\img). Bir kez seçmen yeterli.");
      imgKlasoru = await window.showDirectoryPicker({ mode: "readwrite" });
    }

    for (const fh of secilenler) {
      const dosya = await fh.getFile();
      const ad = guvenliAd(dosya.name);
      const hedef = await imgKlasoru.getFileHandle(ad, { create: true });
      const w = await hedef.createWritable();
      await w.write(dosya);
      await w.close();
      metneEkle(textarea, `\n![](img/${ad})\n`);
    }
    setKirli(true);
  } catch (e) {
    if (e.name !== "AbortError") alert("Resim eklenemedi: " + e.message);
  }
}

// ---------- Kaydetme ----------
function setKirli(v) {
  kirli = v;
  const s = document.getElementById("save-state");
  s.className = "save-state" + (v ? " dirty" : "");
  s.textContent = v ? "⚠ kaydedilmemiş değişiklik var" : "değişiklik yok";
}

function dataJsUret() {
  const j = (v) => JSON.stringify(v, null, 2);
  return `/* ============================================================
   Çarnaçar — İÇERİK DOSYASI
   Bu dosya admin.html panelinden otomatik oluşturuldu.
   Elle de düzenlenebilir; panel bir sonraki kayıtta üzerine yazar.
   ============================================================ */

// ---------- GÜNLÜK KATEGORİLERİ ----------
const kategoriler = ${j(state.kategoriler)};

// ---------- GÜNLÜK ----------
const gunluk = ${j(state.gunluk)};

// ---------- SERTİFİKALAR (Microsoft Learn) ----------
const sertifikalar = ${j(state.sertifikalar)};

// ---------- KRİPTO CÜZDANLAR (Destek & Sponsorluk) ----------
const kripto = ${j(state.kripto)};
`;
}

async function kaydet() {
  const icerik = dataJsUret();

  // Modern tarayıcı: dosyayı doğrudan diske yaz
  if (window.showSaveFilePicker) {
    try {
      if (!dosyaHandle) {
        dosyaHandle = await window.showSaveFilePicker({
          suggestedName: "data.js",
          types: [{ description: "JavaScript", accept: { "text/javascript": [".js"] } }],
        });
      }
      const w = await dosyaHandle.createWritable();
      await w.write(icerik);
      await w.close();
      setKirli(false);
      const s = document.getElementById("save-state");
      s.className = "save-state saved";
      s.textContent = "✓ kaydedildi — şimdi yayinla.bat'ı çalıştır";
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // kullanıcı vazgeçti
      // düşerse indirme yöntemine geç
    }
  }

  // Yedek yöntem: dosyayı indir, assets/data.js üzerine kopyala
  const blob = new Blob([icerik], { type: "text/javascript" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";
  a.click();
  URL.revokeObjectURL(a.href);
  alert("data.js indirildi. İndirilen dosyayı assets/data.js üzerine kopyala.");
  setKirli(false);
}

document.getElementById("btn-save").addEventListener("click", kaydet);

// Kaydedilmemiş değişiklik varsa sayfadan çıkarken uyar
window.addEventListener("beforeunload", (e) => {
  if (kirli) e.preventDefault();
});

renderPanel();
setKirli(false);

# Çarnaçar — günlük

> _"her gün, ister istemez yazıyorum."_

Her güne bir kayıt: günlük, özgeçmiş, videolar, kod ve şiir — hepsi tek sayfada. Saf HTML/CSS/JS, hiçbir kurulum gerektirmez.

## Nasıl çalıştırılır?

`index.html` dosyasına çift tıklaman yeterli. İstersen yerel sunucuyla da açabilirsin:

```
python -m http.server 4173
```

Sonra tarayıcıda `http://localhost:4173` adresine git.

## Yönetim paneli (önerilen yol)

**`admin.html`** dosyasını tarayıcıda aç (ya da sitede alt köşedeki "⚙ Yönetim" linkine tıkla). WordPress benzeri panelden günlük kaydı, kategori, sertifika, video, proje ve CV maddesi ekleyip silebilir, düzenleyebilirsin.

1. Panelde değişikliklerini yap.
2. **"💾 data.js'e Kaydet"** düğmesine bas — ilk seferde `assets/data.js` dosyasını seçmen istenir (Chrome/Edge dosyayı doğrudan diske yazar).
3. **`yayinla.bat`** dosyasına çift tıkla — değişiklikler git'e commit'lenir, push'lanır ve Cloudflare Pages siteyi 1-2 dakikada günceller.

Panel internete de çıksa sorun olmaz: yalnızca senin bilgisayarındaki dosyayı yazabilir, ziyaretçiler hiçbir şeyi değiştiremez.

## Cloudflare Pages'e yayınlama

1. Depoyu GitHub'a gönder (bir kez): GitHub'da boş depo aç, `git remote add origin <url>` ve `git push -u origin main`.
2. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git** → depoyu seç.
3. Build ayarları: framework **None**, build komutu **boş**, output directory **/** — kaydet, dağıtım başlar.
4. Site `https://<proje>.pages.dev` adresinde yayına girer; SSL otomatiktir.
5. Kendi domain'in için: Pages projesinde **Custom domains → Set up a domain**. Domain Cloudflare'deyse DNS kaydı otomatik açılır, SSL yine otomatik.

Sonraki güncellemeler için tek şey: `yayinla.bat`.

## İçerik nasıl eklenir? (elle, panel kullanmadan)

Tüm içerik **`assets/data.js`** dosyasında. Kod bilmene gerek yok, listelere yeni satır ekle:

| Ne eklemek istiyorsun? | Hangi liste? |
|---|---|
| Günlük kaydı (her güne bir tane) | `gunluk` |
| Microsoft Learn sertifikası | `sertifikalar` |
| Günlük kategorisi | `kategoriler` |
| Video (YouTube ID ile) | `videolar` |
| Proje | `projeler` |
| CV maddesi | `cv` |

**Günlük kaydı örneği** — yeni günü listenin _en üstüne_ ekle:

```js
{
  tarih: "2026-07-12",        // YYYY-AA-GG — gün adı otomatik yazılır
  kategori: "sql",            // "microsoft", "sql" veya "hayat"
  ruh: "😊",                  // o günün emojisi (isteğe bağlı)
  baslik: "Güne bir başlık",  // boş "" bırakılabilir
  metin: "Bugün şunlar oldu...\n\nYeni paragraf için iki satır boşluk.",
  resimler: ["img/2026-07-12-kahve.jpg"],  // fotoğraf yoksa [] bırak
},
```

Kategoriler günlüğün üstünde filtre butonu olarak görünür. Yeni kategori için `kategoriler` listesine ekle (örn. `"azure"`).

**Sertifika örneği:**

```js
{
  kod: "AZ-900",
  ad: "Microsoft Azure Fundamentals",
  tarih: "Mart 2025",
  link: "https://learn.microsoft.com/api/credentials/share/...",  // Learn profilindeki Share linki
},
```

**Fotoğraf paylaşmak için:**
1. Fotoğrafı `img/` klasörüne kopyala (adına tarih koyman düzen sağlar: `2026-07-12-kahve.jpg`).
2. Günün kaydındaki `resimler` listesine `"img/dosya-adi.jpg"` olarak ekle.
3. Sayfada küçük görünür, tıklayınca büyür (Esc ya da tıklama ile kapanır).

- **YouTube videosu:** `youtube.com/watch?v=ABC123` adresindeki `ABC123` kısmını `youtubeId` alanına yaz.
- **CV PDF'i:** dosyanı `cv/ozgecmis.pdf` olarak koy, indirme butonu otomatik çalışır.
- **Hakkımda metni:** `index.html` içindeki "Hakkımda" bölümünü düzenle.
- **Sosyal medya bağlantıları:** `index.html` en altındaki footer kısmında.

## Yayınlamak istersen

Site tamamen statik olduğu için GitHub Pages, Netlify veya Cloudflare Pages'e sürükle-bırak ile ücretsiz yayınlanabilir.

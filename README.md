# Çarnaçar — günlük

> _"her gün, ister istemez yazıyorum."_

Her güne bir kayıt: günlük, özgeçmiş, videolar, kod ve şiir — hepsi tek sayfada. Saf HTML/CSS/JS, hiçbir kurulum gerektirmez.

## Nasıl çalıştırılır?

`index.html` dosyasına çift tıklaman yeterli. İstersen yerel sunucuyla da açabilirsin:

```
python -m http.server 4173
```

Sonra tarayıcıda `http://localhost:4173` adresine git.

## İçerik nasıl eklenir?

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

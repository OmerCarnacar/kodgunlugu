/* ============================================================
   KodGünlüğü — Küresel okunma sayacı (Cloudflare Worker + KV)
   Uçlar:
     POST /hit?id=<kayıt-kimliği>  → sayacı 1 artırır, yeni değeri döner
     GET  /counts                  → tüm sayaçları JSON olarak döner
   ============================================================ */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(veri, durum = 200) {
  return new Response(JSON.stringify(veri), {
    status: durum,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(req.url);

    // Sayacı artır
    if (url.pathname === "/hit" && req.method === "POST") {
      const id = url.searchParams.get("id");
      if (!id || id.length > 200) return json({ hata: "gecersiz id" }, 400);
      const n = parseInt((await env.OKUNMA.get(id)) || "0", 10) + 1;
      await env.OKUNMA.put(id, String(n));
      return json({ id, okunma: n });
    }

    // Tüm sayaçları listele
    if (url.pathname === "/counts" && req.method === "GET") {
      const liste = await env.OKUNMA.list({ limit: 1000 });
      const sonuc = {};
      for (const k of liste.keys) {
        sonuc[k.name] = parseInt((await env.OKUNMA.get(k.name)) || "0", 10);
      }
      return json(sonuc);
    }

    return json({ servis: "kodgunlugu-sayac", durum: "calisiyor" });
  },
};

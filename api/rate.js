// Tasa BCV: automática (DolarAPI, fuente oficial BCV). Si falla, usa la que guardó la dueña en el panel.
// La dueña puede forzar una tasa manual desde /admin (tasa_modo = manual).
async function getRate() {
  const SB = process.env.SUPABASE_URL, K = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let st = [];
  try { st = await (await fetch(`${SB}/rest/v1/settings?select=key,value`, { headers: { apikey: K, Authorization: `Bearer ${K}` } })).json(); } catch (e) {}
  const g = k => ((Array.isArray(st) ? st : []).find(s => s.key === k) || {}).value;
  const manual = { rate: parseFloat(g("tasa_bcv")) || 0, date: g("tasa_fecha") || "", source: "manual" };
  if (g("tasa_modo") === "manual" && manual.rate > 0) return manual;
  try {
    const ctrl = new AbortController(), to = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", { signal: ctrl.signal });
    clearTimeout(to);
    if (r.ok) {
      const d = await r.json(), v = Number(d.promedio);
      if (v > 0) {
        const [y, m, dd] = String(d.fechaActualizacion || new Date().toISOString()).slice(0, 10).split("-");
        return { rate: v, date: `${dd}/${m}/${y}`, source: "auto" };
      }
    }
  } catch (e) { console.error("DolarAPI falló:", e.message); }
  return manual;
}

module.exports = async (req, res) => {
  try {
    const r = await getRate();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    return res.json({ ok: r.rate > 0, ...r });
  } catch (e) { return res.status(500).json({ ok: false }); }
};
module.exports.getRate = getRate;

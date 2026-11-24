// Recibe el pedido, lo valida con los precios REALES de la base de datos,
// lo guarda y lo manda de una sola vez al bot de Telegram.
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const UUID = /^[0-9a-f-]{36}$/i;
const PAGOS = ["Pago móvil", "Transferencia", "Binance"];
const usd = n => "$" + Number(n).toFixed(2);
const bsf = n => "Bs " + Number(n).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sb = (path, opt = {}) => fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
  ...opt,
  headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", ...(opt.headers || {}) }
});

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido" });
  try {
    const b = req.body || {}, c = b.cliente || {}, pg = b.pago || {};
    const t = (v, m = 120) => String(v || "").trim().slice(0, m);
    const items = Array.isArray(b.items) ? b.items.slice(0, 60) : [];
    if (!items.length || !t(c.nombre) || !t(c.cedula) || !t(c.telefono) || !PAGOS.includes(pg.metodo) || !/^\d{4}$/.test(String(pg.ref4)))
      return res.status(400).json({ ok: false, error: "Faltan datos del pedido." });
    if (pg.metodo !== "Binance" && (!t(pg.telOrigen) || !t(pg.bancoOrigen)))
      return res.status(400).json({ ok: false, error: "Falta el teléfono o el banco desde donde pagaste." });

    const qty = {};
    for (const i of items) if (UUID.test(i.id)) qty[i.id] = Math.min(99, Math.max(1, parseInt(i.qty) || 1));
    const ids = Object.keys(qty);
    if (!ids.length) return res.status(400).json({ ok: false, error: "Carrito vacío." });

    const pr = await (await sb(`products?id=in.(${ids.join(",")})&active=eq.true&select=id,name,price_usd,in_stock,categories(name,departments(name))`)).json();
    if (!Array.isArray(pr) || pr.length !== ids.length || pr.some(p => !p.in_stock))
      return res.status(409).json({ ok: false, error: "Algún producto ya no está disponible. Revisa tu carrito." });

    const st = await (await sb("settings?select=key,value")).json();
    const rate = parseFloat((st.find(s => s.key === "tasa_bcv") || {}).value) || 0;
    let total = 0;
    const lines = pr.map(p => {
      const q = qty[p.id], cat = p.categories || {};
      total += q * Number(p.price_usd);
      return { id: p.id, nombre: p.name, qty: q, precio: Number(p.price_usd), dep: (cat.departments || {}).name || "", cat: cat.name || "" };
    });
    const totalBs = total * rate;
    const entrega = t(b.entrega), dir = t(b.direccion, 300), ref = t(b.referencia, 200);

    const ins = await sb("orders", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        customer: { nombre: t(c.nombre), cedula: t(c.cedula), telefono: t(c.telefono), entrega, direccion: dir, referencia: ref },
        items: lines,
        payment: { metodo: pg.metodo, ref4: pg.ref4, telOrigen: t(pg.telOrigen), bancoOrigen: t(pg.bancoOrigen) },
        total_usd: total, rate, total_bs: totalBs
      })
    });
    const row = (await ins.json())[0];
    if (!ins.ok || !row) throw new Error("No se guardó el pedido");

    const msg = [
      `🛍 <b>Pedido #${row.number}</b>`,
      ``, `<b>Cliente</b>`, `• ${esc(t(c.nombre))}`, `• Cédula: ${esc(t(c.cedula))}`, `• Tel: ${esc(t(c.telefono))}`,
      ``, `<b>Productos</b>`,
      ...lines.map(l => `• ${l.qty} × ${esc(l.nombre)} [${esc(l.dep)} › ${esc(l.cat)}] — ${usd(l.qty * l.precio)}`),
      ``, `<b>Entrega:</b> ${esc(entrega)}`, dir ? `<b>Dirección:</b> ${esc(dir)}` : "", ref ? `<b>Referencia:</b> ${esc(ref)}` : "",
      ``, `<b>Pago:</b> ${esc(pg.metodo)}`, `• Últimos 4 dígitos: ${esc(pg.ref4)}`,
      pg.metodo !== "Binance" ? `• Desde el número: ${esc(t(pg.telOrigen))}\n• Banco de origen: ${esc(t(pg.bancoOrigen))}` : "",
      ``, `<b>Total:</b> ${usd(total)} / ${bsf(totalBs)} (tasa BCV ${rate})`
    ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");

    try {
      const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: msg, parse_mode: "HTML" })
      });
      if (!r.ok) console.error("Telegram:", await r.text());
    } catch (e) { console.error("Telegram falló:", e); } // el pedido ya quedó guardado
    return res.json({ ok: true, number: row.number });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "No pudimos enviar el pedido. Intenta de nuevo." });
  }
};

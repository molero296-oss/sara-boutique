// Edita SOLO este archivo con tus datos. La anon key es pública (es normal que se vea).
// NUNCA pongas aquí la service_role key ni el token del bot.
window.CONFIG = {
  SUPABASE_URL: "https://eckydbpsjiaoulagrpiz.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja3lkYnBzamlhb3VsYWdycGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NDc3ODMsImV4cCI6MjExMTEyMzc4M30.SD0kwIqDxPPFbJnulaXGC_u5vQDAbf8eGiGM848GoVk",
  // Datos que ve el cliente al pagar. Cada línea es "Etiqueta: valor".
  PAGOS: {
    "Pago móvil": ["Banco: Banesco (0134)", "Teléfono: 0412-1994914", "Cédula/RIF: V-00000000"],
    "Transferencia": ["Banco: Banesco", "Cuenta: 0134-0000-00-0000000000", "Cédula/RIF: V-00000000", "Titular: Sara Boutique"],
    "Binance": ["Binance Pay ID: 000000000", "Correo: pagos@saraboutique.com", "Moneda: USDT"]
  }
};

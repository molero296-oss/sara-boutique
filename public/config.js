// Edita SOLO este archivo con tus datos. La anon key es pública (es normal que se vea).
// NUNCA pongas aquí la service_role key ni el token del bot.
window.CONFIG = {
  SUPABASE_URL: "https://eckydbpsjiaoulagrpiz.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVja3lkYnBzamlhb3VsYWdycGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NDc3ODMsImV4cCI6MjExMTEyMzc4M30.SD0kwIqDxPPFbJnulaXGC_u5vQDAbf8eGiGM848GoVk",
  // Datos que ve el cliente al pagar. Cada línea es "Etiqueta: valor". Si un método queda vacío [], no se muestra en la tienda.
  PAGOS: {
    "Pago móvil": ["Banco: Mercantil (0105)", "Teléfono: 0424-1291088", "Cédula: 26682661"],
    "Transferencia": ["Banco: Mercantil (0105)", "Cuenta: 01050084281084745259", "Cédula: 26682661", "Titular: Nangerly Isturiz"],
    "Binance": []
  }
};

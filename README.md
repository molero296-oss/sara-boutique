# Sara Boutique · Tienda online

Tienda con departamentos y categorías, precios en $ y Bs (tasa BCV), pago móvil / transferencia / Binance con registro de pago,
pedidos que llegan a un bot de Telegram, y un panel (`/admin`) para que la dueña suba productos sin tocar código.

**Cómo está armado:** GitHub (código) → Vercel (publica la página y recibe los pedidos) → Supabase (productos, fotos, pedidos).

```
public/index.html   La tienda
public/admin.html   Panel de la dueña (se abre en tudominio.com/admin)
public/config.js    Tus datos: Supabase y datos de pago   <- el único archivo que editas
api/order.js        Recibe el pedido, lo guarda y lo manda a Telegram
supabase/schema.sql Tablas, permisos, departamentos y categorías
```

## Paso 1 · Supabase (base de datos y fotos)
1. Entra a supabase.com, crea un proyecto nuevo (guarda la clave de la base de datos).
2. En **SQL Editor**, abre `supabase/schema.sql`, **cambia `CORREO_DE_LA_DUENA@gmail.com`** (última línea) por el correo de la dueña, pega todo y dale **Run**.
3. En **Authentication → Users → Add user**: crea el usuario de la dueña con ese mismo correo y una clave (marca "Auto confirm").
4. En **Authentication → Sign In / Providers**: desactiva **"Allow new users to sign up"** (para que nadie más se registre).
5. En **Project Settings → API** copia: **Project URL**, **anon public key** y **service_role key** (esta última es secreta).

## Paso 2 · Bot de Telegram
1. En Telegram habla con **@BotFather** → `/newbot` → guarda el **token**.
2. Abre un chat con tu bot (o agrégalo a un grupo) y escríbele algo. Para saber el **chat id**, visita
   `https://api.telegram.org/botTU_TOKEN/getUpdates` y busca `"chat":{"id":...}`.

## Paso 3 · Tus datos
Edita `public/config.js`: pega la **Project URL** y la **anon key**, y cambia los datos de pago (banco, cédula, cuenta, Binance).

## Paso 4 · GitHub y Vercel
1. Crea un repositorio en GitHub y sube todo el contenido de esta carpeta.
2. En vercel.com → **Add New → Project** → importa el repositorio. Deja "Framework Preset: Other".
3. En **Settings → Environment Variables** agrega estas 4 y haz **Redeploy**:

| Nombre | Valor |
|---|---|
| `SUPABASE_URL` | la Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | la service_role key (secreta) |
| `TELEGRAM_BOT_TOKEN` | el token de BotFather |
| `TELEGRAM_CHAT_ID` | el chat id |

## Paso 5 · Usarla
- Entra a `tudominio.com/admin` con el correo y clave de la dueña.
- Ahí sube productos (foto, nombre, precio, departamento y categoría), cambia precios, marca agotados y actualiza la **tasa BCV** cada día.
- Los pedidos llegan al Telegram con todo junto: cliente, productos, entrega, pago registrado y total en $ y Bs. También quedan guardados en la tabla `orders` de Supabase.

## Seguridad (ya incluida)
- Los precios del pedido se recalculan en el servidor con los de la base de datos; nadie puede cambiarlos desde el navegador.
- Solo el correo de la tabla `admins` puede crear, editar o borrar productos. El público solo puede leer.
- El token del bot y la service_role key viven en Vercel, nunca en la página.

## Pendiente para una próxima versión
Crear departamentos y categorías desde el panel (hoy se cargan con el SQL), tallas/variantes, ver pedidos dentro del panel,
tasa BCV automática y editar datos de pago desde el panel.

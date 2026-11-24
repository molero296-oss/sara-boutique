-- Sara Boutique · Base de datos. Pega TODO esto en Supabase > SQL Editor > Run.
create extension if not exists pgcrypto;

create table departments(id uuid primary key default gen_random_uuid(), name text not null unique, emoji text default '🛍', position int default 0);
create table categories(id uuid primary key default gen_random_uuid(), department_id uuid not null references departments(id) on delete cascade, name text not null unique, position int default 0);
create table products(id uuid primary key default gen_random_uuid(), name text not null, price_usd numeric(10,2) not null check (price_usd >= 0), image_url text, category_id uuid not null references categories(id), in_stock boolean not null default true, active boolean not null default true, created_at timestamptz not null default now());
create table settings(key text primary key, value text not null);
create table orders(id uuid primary key default gen_random_uuid(), number bigint generated always as identity, created_at timestamptz not null default now(), customer jsonb, items jsonb, payment jsonb, total_usd numeric(10,2), rate numeric(12,4), total_bs numeric(14,2), status text not null default 'nuevo');
create table admins(email text primary key);

alter table departments enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table admins enable row level security;

create function is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email')) $$;

create policy "ver departamentos" on departments for select using (true);
create policy "ver categorias" on categories for select using (true);
create policy "ver productos" on products for select using (active or is_admin());
create policy "ver ajustes" on settings for select using (true);
create policy "admin departamentos" on departments for all using (is_admin()) with check (is_admin());
create policy "admin categorias" on categories for all using (is_admin()) with check (is_admin());
create policy "admin productos" on products for all using (is_admin()) with check (is_admin());
create policy "admin ajustes" on settings for all using (is_admin()) with check (is_admin());
create policy "admin pedidos" on orders for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;
create policy "ver fotos" on storage.objects for select using (bucket_id = 'products');
create policy "admin sube fotos" on storage.objects for insert with check (bucket_id = 'products' and is_admin());
create policy "admin edita fotos" on storage.objects for update using (bucket_id = 'products' and is_admin());
create policy "admin borra fotos" on storage.objects for delete using (bucket_id = 'products' and is_admin());

insert into departments (name, emoji, position) values
('Barbería','💈',1),
('Manicure y uñas','💅',2),
('Pestañas y cejas','👁',3),
('Maquillaje','💄',4),
('Perfumes y cremas','🌸',5),
('Carteras y accesorios','👜',6),
('Ropa y moda','👗',7),
('Hogar y varios','🏠',8);

insert into categories (department_id, name, position)
select d.id, c.name, c.pos from departments d join (values
('Barbería','Máquinas',1),
('Barbería','Navajas y hojillas',2),
('Barbería','Capas',3),
('Barbería','Tijeras',4),
('Barbería','Peines y cepillos',5),
('Barbería','Productos para barba',6),
('Manicure y uñas','Esmaltes',1),
('Manicure y uñas','Equipos',2),
('Manicure y uñas','Material para uñas',3),
('Manicure y uñas','Cuidado',4),
('Manicure y uñas','Accesorios',5),
('Pestañas y cejas','Pestañas',1),
('Pestañas y cejas','Pegamentos',2),
('Pestañas y cejas','Kits de diseño',3),
('Maquillaje','Rostro',1),
('Maquillaje','Ojos',2),
('Maquillaje','Labios',3),
('Maquillaje','Brochas y esponjas',4),
('Perfumes y cremas','Perfumes de dama',1),
('Perfumes y cremas','Perfumes de hombre',2),
('Perfumes y cremas','Combos',3),
('Perfumes y cremas','Cremas corporales',4),
('Carteras y accesorios','Carteras de dama',1),
('Carteras y accesorios','Carteras de hombre',2),
('Carteras y accesorios','Billeteras',3),
('Carteras y accesorios','Bisutería y accesorios',4),
('Ropa y moda','Ropa de dama',1),
('Ropa y moda','Ropa de niña',2),
('Ropa y moda','Ropa de niño',3),
('Ropa y moda','Trajes de baño',4),
('Ropa y moda','Sombreros',5),
('Hogar y varios','Repostería',1),
('Hogar y varios','Alfombras',2),
('Hogar y varios','Otros',3)
) as c(dept, name, pos) on c.dept = d.name;

insert into settings (key, value) values ('tasa_bcv', '916.65'), ('tasa_fecha', '18/11/2026');

-- IMPORTANTE: cambia este correo por el de la dueña (el mismo con el que creas su usuario en Authentication).
insert into admins (email) values ('CORREO_DE_LA_DUENA@gmail.com');

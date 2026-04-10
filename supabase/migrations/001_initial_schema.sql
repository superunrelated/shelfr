-- Collections
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text not null,
  cover_image_url text,
  color text not null default '#5b8db8',
  created_at timestamptz not null default now()
);

create unique index collections_user_slug on public.collections(user_id, slug);

alter table public.collections enable row level security;

create policy "Users can manage own collections"
  on public.collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  collection_id uuid references public.collections(id) on delete cascade not null,
  title text not null,
  price numeric not null default 0,
  original_price numeric not null default 0,
  currency text not null default 'NZD',
  shop_name text not null default '',
  shop_domain text not null default '',
  source_url text not null default '',
  image_url text,
  status text not null default 'considering'
    check (status in ('considering', 'shortlisted', 'winner', 'purchased')),
  notes text not null default '',
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  rating smallint not null default 0 check (rating >= 0 and rating <= 5),
  price_checked_at timestamptz,
  created_at timestamptz not null default now(),
  added_by uuid references auth.users(id) on delete set null
);

create index products_collection_status on public.products(collection_id, status);
create index products_collection_created on public.products(collection_id, created_at);

alter table public.products enable row level security;

create policy "Users can manage products in own collections"
  on public.products for all
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

-- Shops
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade not null,
  name text not null,
  domain text not null default '',
  url text,
  created_at timestamptz not null default now()
);

create index shops_collection on public.shops(collection_id);

alter table public.shops enable row level security;

create policy "Users can manage shops in own collections"
  on public.shops for all
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

-- Collection members (sharing)
create table public.collection_members (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'viewer' check (role in ('viewer', 'editor')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(collection_id, user_id)
);

create index collection_members_user on public.collection_members(user_id);

alter table public.collection_members enable row level security;

create policy "Collection owners can manage members"
  on public.collection_members for all
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

create policy "Members can view their memberships"
  on public.collection_members for select
  using (auth.uid() = user_id);

-- Allow shared collection access for products and shops
create policy "Members can view products in shared collections"
  on public.products for select
  using (
    exists (
      select 1 from public.collection_members cm
      where cm.collection_id = products.collection_id and cm.user_id = auth.uid()
    )
  );

create policy "Editors can manage products in shared collections"
  on public.products for all
  using (
    exists (
      select 1 from public.collection_members cm
      where cm.collection_id = products.collection_id
        and cm.user_id = auth.uid()
        and cm.role = 'editor'
    )
  )
  with check (
    exists (
      select 1 from public.collection_members cm
      where cm.collection_id = products.collection_id
        and cm.user_id = auth.uid()
        and cm.role = 'editor'
    )
  );

create policy "Members can view shops in shared collections"
  on public.shops for select
  using (
    exists (
      select 1 from public.collection_members cm
      where cm.collection_id = shops.collection_id and cm.user_id = auth.uid()
    )
  );

create policy "Editors can manage shops in shared collections"
  on public.shops for all
  using (
    exists (
      select 1 from public.collection_members cm
      where cm.collection_id = shops.collection_id
        and cm.user_id = auth.uid()
        and cm.role = 'editor'
    )
  )
  with check (
    exists (
      select 1 from public.collection_members cm
      where cm.collection_id = shops.collection_id
        and cm.user_id = auth.uid()
        and cm.role = 'editor'
    )
  );

-- Members can view shared collections
create policy "Members can view shared collections"
  on public.collections for select
  using (
    exists (
      select 1 from public.collection_members cm
      where cm.collection_id = collections.id and cm.user_id = auth.uid()
    )
  );

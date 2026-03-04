-- 8. Realized Transactions Table
create table public.realized_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  investment_id text not null,
  asset_name text not null,
  type text not null check (type in ('PARTIAL_EXIT', 'FULL_EXIT')),
  sale_date timestamp with time zone not null,
  sale_amount numeric not null,
  sale_price numeric,
  cost_basis numeric not null,
  realized_pl numeric not null,
  realized_pl_percent numeric not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Paper Trades Table
create table public.paper_trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  ticker text not null,
  type text not null check (type in ('BUY', 'SELL')),
  entry_price numeric not null,
  quantity numeric not null,
  open_date timestamp with time zone not null,
  status text not null check (status in ('OPEN', 'CLOSED')),
  close_price numeric,
  close_date timestamp with time zone,
  pnl numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Mistakes (Mirror of Truth) Table
create table public.mistakes (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  date timestamp with time zone not null,
  title text not null,
  cost numeric not null,
  category text not null check (category in ('TRADING', 'LIFE')),
  lesson text not null,
  emotional_state text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.realized_transactions enable row level security;
alter table public.paper_trades enable row level security;
alter table public.mistakes enable row level security;

-- Policies for Realized Transactions
create policy "Users can view their own realized_transactions" on public.realized_transactions for select using (auth.uid() = user_id);
create policy "Users can insert their own realized_transactions" on public.realized_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update their own realized_transactions" on public.realized_transactions for update using (auth.uid() = user_id);
create policy "Users can delete their own realized_transactions" on public.realized_transactions for delete using (auth.uid() = user_id);

-- Policies for Paper Trades
create policy "Users can view their own paper_trades" on public.paper_trades for select using (auth.uid() = user_id);
create policy "Users can insert their own paper_trades" on public.paper_trades for insert with check (auth.uid() = user_id);
create policy "Users can update their own paper_trades" on public.paper_trades for update using (auth.uid() = user_id);
create policy "Users can delete their own paper_trades" on public.paper_trades for delete using (auth.uid() = user_id);

-- Policies for Mistakes
create policy "Users can view their own mistakes" on public.mistakes for select using (auth.uid() = user_id);
create policy "Users can insert their own mistakes" on public.mistakes for insert with check (auth.uid() = user_id);
create policy "Users can update their own mistakes" on public.mistakes for update using (auth.uid() = user_id);
create policy "Users can delete their own mistakes" on public.mistakes for delete using (auth.uid() = user_id);

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Trades Table
create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  ticker text not null,
  entry_price numeric not null,
  exit_price numeric not null,
  stop_loss numeric,
  quantity numeric not null,
  direction text not null check (direction in ('Long', 'Short')),
  date timestamp with time zone not null,
  entry_time text,
  mood_entry text not null,
  mood_exit text not null,
  setup text,
  grade text,
  notes text,
  pnl numeric,
  risk_reward_ratio numeric,
  fees numeric,
  mae numeric,
  mfe numeric,
  compliance_score integer,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Investments Table
create table public.investments (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  ticker text,
  name text not null,
  type text not null,
  platform text not null,
  quantity numeric not null,
  invested_amount numeric not null,
  current_value numeric not null,
  sector text,
  country text,
  tags text[],
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Transactions Table
create table public.transactions (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  date timestamp with time zone not null,
  description text not null,
  amount numeric not null,
  category text not null,
  type text not null check (type in ('credit', 'debit')),
  bank_name text,
  merchant text,
  tags text[],
  balance numeric,
  notes text,
  excluded boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for all tables
alter table public.trades enable row level security;
alter table public.investments enable row level security;
alter table public.transactions enable row level security;

-- Create Policies for Trades
create policy "Users can view their own trades"
  on public.trades for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trades"
  on public.trades for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trades"
  on public.trades for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trades"
  on public.trades for delete
  using (auth.uid() = user_id);

-- Create Policies for Investments
create policy "Users can view their own investments"
  on public.investments for select
  using (auth.uid() = user_id);

create policy "Users can insert their own investments"
  on public.investments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own investments"
  on public.investments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own investments"
  on public.investments for delete
  using (auth.uid() = user_id);

-- Create Policies for Transactions
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

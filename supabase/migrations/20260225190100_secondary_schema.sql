-- 4. Dividends Table
create table public.dividends (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date timestamp with time zone not null,
  ticker text not null,
  amount numeric not null,
  credited boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Goals Table
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null,
  target_date timestamp with time zone not null,
  category text not null,
  priority text not null,
  inflation_rate numeric default 6,
  notes text,
  color text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Strategies Table
create table public.strategies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  rules text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tax Records Table
create table public.tax_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  fy text not null,
  realized_ltcg numeric not null default 0,
  realized_stcg numeric not null default 0,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.dividends enable row level security;
alter table public.goals enable row level security;
alter table public.strategies enable row level security;
alter table public.tax_records enable row level security;

-- Policies for Dividends
create policy "Users can view their own dividends" on public.dividends for select using (auth.uid() = user_id);
create policy "Users can insert their own dividends" on public.dividends for insert with check (auth.uid() = user_id);
create policy "Users can update their own dividends" on public.dividends for update using (auth.uid() = user_id);
create policy "Users can delete their own dividends" on public.dividends for delete using (auth.uid() = user_id);

-- Policies for Goals
create policy "Users can view their own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete their own goals" on public.goals for delete using (auth.uid() = user_id);

-- Policies for Strategies
create policy "Users can view their own strategies" on public.strategies for select using (auth.uid() = user_id);
create policy "Users can insert their own strategies" on public.strategies for insert with check (auth.uid() = user_id);
create policy "Users can update their own strategies" on public.strategies for update using (auth.uid() = user_id);
create policy "Users can delete their own strategies" on public.strategies for delete using (auth.uid() = user_id);

-- Policies for Tax Records
create policy "Users can view their own tax_records" on public.tax_records for select using (auth.uid() = user_id);
create policy "Users can insert their own tax_records" on public.tax_records for insert with check (auth.uid() = user_id);
create policy "Users can update their own tax_records" on public.tax_records for update using (auth.uid() = user_id);
create policy "Users can delete their own tax_records" on public.tax_records for delete using (auth.uid() = user_id);

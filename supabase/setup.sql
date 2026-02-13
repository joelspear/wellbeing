-- MindCheck Wellbeing Platform - Database Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

-- 1. Profiles table (linked to Supabase Auth users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid default gen_random_uuid(),
  full_name text,
  created_at timestamptz default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Teachers table
create table if not exists teachers (
  id bigint generated always as identity primary key,
  email text not null,
  full_name text,
  status text default 'Pending',
  last_checkin text,
  school_id uuid,
  created_at timestamptz default now()
);

-- 3. Check-in responses table
create table if not exists checkin_responses (
  id bigint generated always as identity primary key,
  teacher_id bigint references teachers(id),
  school_id uuid,
  q1_mood int,
  q2_work_life_balance int,
  q3_support int,
  q4_workload int,
  q5_anxiety int,
  q6_hope int,
  q7_sleep int,
  q8_connection int,
  q9_confidence int,
  q10_open_text text,
  scores jsonb,
  created_at timestamptz default now()
);

-- 4. Anonymous reports table
create table if not exists anonymous_reports (
  id bigint generated always as identity primary key,
  school_id uuid,
  report_type text not null,
  report_text text,
  status text default 'new',
  created_at timestamptz default now()
);

-- 5. Responses view (used by admin Responses page)
create or replace view responses as
select
  cr.id::text as id,
  t.full_name as teacher_name,
  t.email as teacher_email,
  cr.created_at::date::text as date,
  round(
    (cr.q1_mood + cr.q2_work_life_balance + cr.q3_support + cr.q4_workload +
     cr.q5_anxiety + cr.q6_hope + cr.q7_sleep + cr.q8_connection + cr.q9_confidence)::numeric / 9, 2
  )::float as overall,
  round((cr.q4_workload + cr.q5_anxiety)::numeric / 2, 2)::float as stress,
  round(cr.q5_anxiety::numeric, 2)::float as anxiety,
  round((cr.q1_mood + cr.q6_hope)::numeric / 2, 2)::float as depression,
  case
    when (cr.q1_mood + cr.q2_work_life_balance + cr.q3_support + cr.q4_workload +
          cr.q5_anxiety + cr.q6_hope + cr.q7_sleep + cr.q8_connection + cr.q9_confidence)::numeric / 9 < 2.5
    then true else false
  end as is_flagged,
  cr.q1_mood as q1,
  cr.q2_work_life_balance as q2,
  cr.q3_support as q3,
  cr.q4_workload as q4,
  cr.q5_anxiety as q5,
  cr.q6_hope as q6,
  cr.q7_sleep as q7,
  cr.q8_connection as q8,
  cr.q9_confidence as q9,
  cr.q10_open_text as q10
from checkin_responses cr
left join teachers t on t.id = cr.teacher_id;

-- 6. Enable Row Level Security
alter table profiles enable row level security;
alter table teachers enable row level security;
alter table checkin_responses enable row level security;
alter table anonymous_reports enable row level security;

-- 7. RLS Policies

-- Profiles: users can read their own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

-- Teachers: authenticated users can read and insert
create policy "Authenticated users can view teachers"
  on teachers for select to authenticated using (true);

create policy "Authenticated users can insert teachers"
  on teachers for insert to authenticated with check (true);

-- Check-in responses: anyone can insert (anonymous check-ins), authenticated can read
create policy "Anyone can insert checkin responses"
  on checkin_responses for insert to anon, authenticated with check (true);

create policy "Authenticated users can view checkin responses"
  on checkin_responses for select to authenticated using (true);

-- Anonymous reports: anyone can insert, authenticated can read and update
create policy "Anyone can insert anonymous reports"
  on anonymous_reports for insert to anon, authenticated with check (true);

create policy "Authenticated users can view reports"
  on anonymous_reports for select to authenticated using (true);

create policy "Authenticated users can update reports"
  on anonymous_reports for update to authenticated using (true);

-- Reset Database (Drop all existing tables/functions/triggers)
-- This ensures a clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  email text,
  password text, -- Added for academic requirement (stores hashed password for display/verification)
  avatar_url text,
  role text check (role in ('student', 'instructor')) default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signup - Robust Version
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, password, role, avatar_url)
  values (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email), -- Use username from metadata, fallback to email
    new.email, 
    new.encrypted_password, -- Store the hash from auth.users
    COALESCE(new.raw_user_meta_data->>'role', 'student'), 
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
exception when others then
  -- Log error but allow user creation to proceed (profile can be fixed later)
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create courses table
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text,
  price numeric default 0,
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  thumbnail text,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for courses
alter table public.courses enable row level security;

-- Create courses policies
create policy "Courses are viewable by everyone."
  on courses for select
  using ( true );

create policy "Instructors can insert courses."
  on courses for insert
  with check ( auth.uid() = instructor_id );

create policy "Instructors can update own courses."
  on courses for update
  using ( auth.uid() = instructor_id );

create policy "Instructors can delete own courses."
  on courses for delete
  using ( auth.uid() = instructor_id );

-- Create lessons table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  type text check (type in ('video', 'text', 'pdf', 'audio')),
  content text, 
  url text,
  duration text,
  "order" integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for lessons
alter table public.lessons enable row level security;

-- Create lessons policies
create policy "Lessons are viewable by everyone."
  on lessons for select
  using ( true );

create policy "Instructors can insert lessons."
  on lessons for insert
  with check ( exists ( select 1 from courses where id = course_id and instructor_id = auth.uid() ) );

create policy "Instructors can update own lessons."
  on lessons for update
  using ( exists ( select 1 from courses where id = course_id and instructor_id = auth.uid() ) );

create policy "Instructors can delete own lessons."
  on lessons for delete
  using ( exists ( select 1 from courses where id = course_id and instructor_id = auth.uid() ) );

-- Create reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for reviews
alter table public.reviews enable row level security;

-- Create reviews policies
create policy "Reviews are viewable by everyone."
  on reviews for select
  using ( true );

create policy "Authenticated users can insert reviews."
  on reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own reviews."
  on reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete own reviews."
  on reviews for delete
  using ( auth.uid() = user_id );

-- Create enrollments table
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  progress jsonb default '{}'::jsonb, -- Store progress (e.g., completed lessons)
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- Enable RLS for enrollments
alter table public.enrollments enable row level security;

-- Create enrollments policies
create policy "Users can view own enrollments."
  on enrollments for select
  using ( auth.uid() = user_id );

create policy "Instructors can view enrollments for their courses."
  on enrollments for select
  using ( exists ( select 1 from courses where id = course_id and instructor_id = auth.uid() ) );

create policy "Users can enroll themselves."
  on enrollments for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own progress."
  on enrollments for update
  using ( auth.uid() = user_id );


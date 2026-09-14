-- GrowthGrind public undergraduate-course catalogue.
-- Source: HESA Discover Uni dataset (CC BY 4.0). Do not import UCAS data here.
create table if not exists public.university_courses (
  id bigint generated always as identity primary key,
  source_course_id text not null unique,
  course_title text not null,
  provider_name text not null,
  campus_name text,
  country text,
  qualification text,
  study_mode text,
  duration text,
  subjects_text text,
  course_url text not null,
  source_updated_at timestamptz,
  imported_at timestamptz not null default now()
);

create index if not exists university_courses_title_idx on public.university_courses (course_title);
create index if not exists university_courses_provider_idx on public.university_courses (provider_name);
create index if not exists university_courses_country_idx on public.university_courses (country);

alter table public.university_courses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'university_courses'
      and policyname = 'Anyone can search published university courses'
  ) then
    create policy "Anyone can search published university courses"
      on public.university_courses for select using (true);
  end if;
end $$;

comment on table public.university_courses is
  'Public GrowthGrind search index built from the HESA Discover Uni dataset. Attribute HESA and link https://www.hesa.ac.uk.';

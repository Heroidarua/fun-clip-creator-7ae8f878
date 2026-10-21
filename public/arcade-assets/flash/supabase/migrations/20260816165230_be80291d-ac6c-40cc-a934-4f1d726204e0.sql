create table if not exists public.video_enhancement_jobs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    original_filename text not null,
    input_size bigint,
    input_width integer,
    input_height integer,
    input_fps decimal,
    output_width integer,
    output_height integer,
    output_fps decimal,
    enhancement_mode text check (enhancement_mode in ('light', 'standard', 'maximum')) default 'standard',
    audio_enhancement jsonb default '{"noise_reduction": true, "voice_boost": true, "normalize": true}'::jsonb,
    status text not null check (status in ('queued', 'processing', 'finalizing', 'completed', 'failed', 'cancelled')) default 'queued',
    progress integer default 0,
    output_size bigint,
    output_url text,
    error_message text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    expires_at timestamp with time zone
);

grant select, insert, update, delete on public.video_enhancement_jobs to authenticated;
grant select on public.video_enhancement_jobs to anon;
grant all on public.video_enhancement_jobs to service_role;

alter table public.video_enhancement_jobs enable row level security;

create policy "Users can view their own jobs"
    on public.video_enhancement_jobs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Anyone can view anonymous jobs by ID"
    on public.video_enhancement_jobs for select
    to anon
    using (user_id is null);

create policy "Users can insert their own jobs"
    on public.video_enhancement_jobs for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Anyone can insert anonymous jobs"
    on public.video_enhancement_jobs for insert
    to anon
    with check (user_id is null);

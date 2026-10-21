INSERT INTO public.downloader_status (platform, status, category, label)
VALUES ('pinterest', 'active', 'downloaders', 'Pinterest')
ON CONFLICT (platform) DO NOTHING;
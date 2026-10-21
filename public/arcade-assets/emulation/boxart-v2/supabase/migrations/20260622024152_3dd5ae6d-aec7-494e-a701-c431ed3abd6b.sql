INSERT INTO public.downloader_status (platform, status, category, label, last_checked)
VALUES ('facebook', 'active', 'downloader', 'Facebook', now())
ON CONFLICT (platform) DO UPDATE SET label = EXCLUDED.label, category = EXCLUDED.category;
INSERT INTO public.downloader_status (platform, status, category, label)
SELECT v.platform, 'active', 'ads', v.label
FROM (VALUES
  ('ads_popunder', 'Adsterra — Popunder'),
  ('ads_socialbar', 'Adsterra — Social Bar'),
  ('ads_smartlink', 'Adsterra — Smartlink')
) AS v(platform, label)
WHERE NOT EXISTS (
  SELECT 1 FROM public.downloader_status d WHERE d.platform = v.platform
);
UPDATE public.downloader_status
SET status = 'inactive', last_checked = now()
WHERE platform = 'kwai';


ALTER TABLE public.downloader_status
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'downloader',
  ADD COLUMN IF NOT EXISTS label text;

UPDATE public.downloader_status SET label = 'YouTube', category='downloader' WHERE platform = 'youtube';
UPDATE public.downloader_status SET label = 'Instagram', category='downloader' WHERE platform = 'instagram';
UPDATE public.downloader_status SET label = 'TikTok', category='downloader' WHERE platform = 'tiktok';
UPDATE public.downloader_status SET label = 'Kwai', category='downloader' WHERE platform = 'kwai';

INSERT INTO public.downloader_status (platform, status, category, label) VALUES
  ('ai-text',            'active', 'ai',      'Gerador de Texto IA'),
  ('translator',         'active', 'ai',      'Tradutor Automático'),
  ('summarizer',         'active', 'ai',      'Resumidor de Texto'),
  ('pixel-avatar',       'active', 'ai',      'Gerador de Avatar Pixel'),
  ('thumbnail',          'active', 'ai',      'Gerador de Thumbnail'),
  ('background-remover', 'active', 'ai',      'Removedor de Fundo'),
  ('qr-code',            'active', 'utility', 'Gerador de QR Code'),
  ('password',           'active', 'utility', 'Gerador de Senha'),
  ('url-shortener',      'active', 'utility', 'Encurtador de URL'),
  ('mp4-to-mp3',         'active', 'utility', 'MP4 para MP3'),
  ('image-to-pdf',       'active', 'utility', 'Imagem para PDF'),
  ('watermark',          'active', 'utility', 'Marca d''água'),
  ('image-compare',      'active', 'utility', 'Comparador de Imagens')
ON CONFLICT (platform) DO UPDATE SET
  category = EXCLUDED.category,
  label    = COALESCE(public.downloader_status.label, EXCLUDED.label);

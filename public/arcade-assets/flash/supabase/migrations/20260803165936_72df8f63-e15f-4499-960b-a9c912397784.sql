
INSERT INTO public.downloader_status (platform, label, category, status, last_checked)
VALUES 
  ('pixel-avatar', 'Avatar Pixelado', 'ai', 'active', NOW()),
  ('ai-text', 'Gerador de Texto IA', 'ai', 'active', NOW()),
  ('ocr', 'OCR Imagem → Texto', 'ai', 'active', NOW()),
  ('tts', 'Texto → Voz', 'ai', 'active', NOW()),
  ('stt', 'Voz → Texto', 'ai', 'active', NOW()),
  ('summarizer', 'Resumidor de Texto', 'ai', 'active', NOW()),
  ('pdf-signer', 'Assinador de PDF', 'utility', 'active', NOW()),
  ('meu-ip', 'Meu IP', 'utility', 'active', NOW()),
  ('velocidade', 'Teste de Velocidade', 'utility', 'active', NOW()),
  ('cores', 'Extrator de Cores', 'utility', 'active', NOW()),
  ('scanner', 'Scanner de Documentos', 'utility', 'active', NOW()),
  ('idioma', 'Detector de Idioma', 'utility', 'active', NOW()),
  ('remover-metadados', 'Removedor de Metadados', 'utility', 'active', NOW())
ON CONFLICT (platform) DO UPDATE 
SET label = EXCLUDED.label, category = EXCLUDED.category;

# Plano: Nova Ferramenta "Melhorar Vídeo" no SOS01

Implementação de uma ferramenta profissional e modular para melhoria de vídeos (upscale, denoise, nitidez e áudio) integrada ao ecossistema SOS01.

## 1. Estrutura de Dados (Banco de Dados)
- Criar tabela `video_enhancement_jobs` no Supabase (via ferramenta de migração).
- Configurar RLS e privilégios para acesso público (anon) e autenticado.

## 2. Arquitetura Backend (TanStack Server Functions)
- **Análise**: `VideoAnalyzer` para extrair metadados (resolução, FPS, codecs).
- **Processamento**: `VideoEnhancementEngine` preparado para FFmpeg e futura integração com IA/GPU.
- **Jobs**: Gerenciamento de fila e status assíncrono.
- **Limpeza**: Sistema automático para deletar arquivos temporários após expiração.

## 3. Interface Frontend (Componentes)
- **Página Dedicada**: `/ferramenta/melhorar-video`.
- **Área de Upload**: Moderna, com suporte a arrastar e soltar e mobile.
- **Preview e Configuração**: Exibição de metadados originais e escolha de níveis (Leve, Padrão, Máximo).
- **Progresso Real**: Feedback detalhado de cada etapa do processamento.
- **Resultado**: Comparação visual (se possível) e download direto em MP4 (H.264/AAC).

## 4. Detalhes Técnicos
- **Limite**: 500 MB por arquivo.
- **Qualidade**: Upscale inteligente até 4K (limitado por infraestrutura).
- **Áudio**: Filtros de redução de ruído, normalização e melhoria de voz.
- **Modularidade**: Código isolado em `src/lib/video-enhancer` e `src/components/tools/video-enhancer`.
- **SEO**: Integração completa com `src/config/seo.ts`.

## 5. Etapas de Implementação
1. Executar migração do banco de dados.
2. Criar lógica de análise e processamento no servidor.
3. Desenvolver componentes de UI seguindo o design system "3D Cartridge".
4. Registrar ferramenta no `tools-registry.tsx` e SEO.
5. Testar fluxo completo (upload -> processamento -> download).

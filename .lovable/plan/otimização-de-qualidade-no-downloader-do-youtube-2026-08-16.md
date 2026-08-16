# Otimização de Qualidade no Downloader do YouTube

Melhorar a qualidade dos downloads do YouTube, que atualmente estão sendo entregues com resolução ou compressão abaixo do ideal.

## O que será feito

- **Otimização do InnerTube**: Aumentar a prioridade e o limite de tamanho para formatos de alta qualidade (1080p e 4K) na extração nativa.
- **Novas Qualidades no Frontend**: Adicionar opções de 1080p (Full HD) e 4K (Ultra HD) na interface para permitir que o usuário escolha resoluções maiores.
- **Ajuste de Limites**: Aumentar o limite de processamento no navegador de 100MB para 300MB, permitindo muxagem (vídeo + áudio) de arquivos maiores sem redirecionar para links diretos externos que podem ter qualidade reduzida.
- **Melhoria na Seleção de Formatos**: Refinar a lógica de escolha de streams para priorizar codecs com melhor preservação de qualidade (como AVC1 High Profile quando disponível).

## Detalhes Técnicos

### Backend (`src/lib/youtube-resolver.server.ts` & `src/config/youtube.ts`)
- Aumentar `MAX_BYTES` de 45MB para 250MB no `pickInnertubeFormats` para permitir que o backend capture streams de 1080p que não são "muxed".
- Adicionar suporte a resoluções 1440p e 2160p (4K) na filtragem.

### API (`src/routes/api.youtube.info.ts`)
- Adicionar novos objetos de formato na resposta da API:
  - `mp4-1080p`: Full HD (1080p)
  - `mp4-4k`: Ultra HD (4K)

### Frontend (`src/pages/YoutubeDownloader.tsx` & `src/lib/youtube-download-flow.ts`)
- Alterar `BROWSER_PROCESS_LIMIT` de 100MB para 300MB.
- Atualizar a interface de seleção de qualidade para mostrar as novas opções.

### Muxagem (`src/lib/youtube-mux.ts`)
- Garantir que o FFmpeg utilize `-c copy` sempre que possível para evitar perda de qualidade por re-encode, ou usar CRF mais baixo se o re-encode for inevitável.

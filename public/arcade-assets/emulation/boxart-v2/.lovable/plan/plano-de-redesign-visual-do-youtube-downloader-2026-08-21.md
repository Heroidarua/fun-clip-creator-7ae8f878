# Plano de Redesign Visual do YouTube Downloader

O objetivo é remover a seção de seleção de resolução e o botão de download redundante, simplificando a interface para que o download seja iniciado diretamente ao selecionar o tipo de mídia (MP4 ou MP3).

## Alterações Propostas

### UI (HeroSection.tsx)
- Remover o título "SELECIONE A RESOLUÇÃO:".
- Remover a grade de seleção de qualidades/resoluções.
- Remover o aviso sobre arquivos acima de 100 MB.
- Remover o botão vermelho "BAIXAR".
- Ajustar os botões "VIDEO MP4" e "AUDIO MP3" para que, ao serem clicados, iniciem o download imediatamente.
- Adicionar estado de carregamento (`loading`) aos botões de tipo de mídia para feedback visual durante o processamento.
- Ajustar o card "VIDEO FOUND!" para que termine logo após os botões de tipo, removendo espaços vazios excessivos.

### Lógica (HeroSection.tsx)
- Modificar a função `handleYoutubeDownload` para aceitar parâmetros opcionais de tipo e qualidade, garantindo que o download possa ser disparado programaticamente sem depender exclusivamente do estado assíncrono.
- Preservar toda a lógica de backend, validações e limites de processamento.

## Detalhes Técnicos
- Utilizar `line_replace` para remover os blocos de código JSX correspondentes.
- Atualizar os handlers `onClick` dos botões de tipo no `HeroSection.tsx`.
- Garantir que a responsividade mobile não seja afetada.

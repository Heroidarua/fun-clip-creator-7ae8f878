# Plano de Refatoração: Instagram Downloader (Padrão YouTube)

Este plano detalha a migração do downloader do Instagram para a arquitetura de alta performance usada no YouTube, focando em estabilidade, segurança e processamento eficiente.

## 1. Infraestrutura Backend (`src/lib/`)

- **`instagram-tool.server.ts`**: Criar utilitários de servidor (Rate Limit, Sign/Verify Ticket, CORS).
- **`instagram-resolver.server.ts`**: Centralizar a lógica de extração (Snapsave, RapidAPI, Direct Scrape) com fallbacks.
- **`instagram-mux.ts`**: (Opcional) Reaproveitar ou adaptar lógica de muxagem se necessário para formatos específicos.

## 2. Endpoints de API (`src/routes/api/instagram/`)

- **`info.ts`**: POST para validar URL e retornar metadados (preview, título, autor, itens do carrossel).
- **`download.ts`**: POST para gerar um ticket assinado para download.
- **`file.ts`**: GET para entregar o arquivo via proxy com chunked streaming e suporte a Range headers.

## 3. Camada de Serviço (`src/services/`)

- **`instagramDownloader.ts`**: Cliente frontend para as novas APIs (fetchInfo, requestDownload).

## 4. Integração no Frontend (`src/components/HeroSection.tsx`)

- Substituir a lógica interna atual pelo novo fluxo de serviço.
- Manter o componente de UI intacto, apenas trocando a "máquina" que o move.
- Garantir que o suporte a Carrossel continue funcionando perfeitamente.

## Considerações de Segurança
- Validação de domínios (apenas `instagram.com` e `instagr.am`).
- Normalização de URLs para evitar bypasses de segurança.
- Rate limiting rigoroso para proteger o backend.

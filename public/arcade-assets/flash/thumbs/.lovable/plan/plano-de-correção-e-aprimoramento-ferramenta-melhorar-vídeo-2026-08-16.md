# Plano de Correção e Aprimoramento: Ferramenta Melhorar Vídeo (IA)

O usuário relatou que a ferramenta "não está pegando" e que o processamento está demorando muito. A análise técnica revelou que a ferramenta depende de processamento assíncrono no backend via FFmpeg/FFprobe, o que é pesado e pode falhar em ambientes de borda se não houver um worker robusto. Além disso, a integração no Hero estava confundindo o usuário ao sugerir que links externos poderiam ser usados, quando na verdade o upload direto é obrigatório.

## Mudanças Necessárias

### Backend (Processamento)
1.  **Reforçar o Gerenciamento de Jobs**: Ajustar `src/lib/video-enhancer/jobs.functions.ts` para garantir que o status do job seja atualizado corretamente no banco de dados.
2.  **Otimizar FFmpeg**: Em `src/lib/video-enhancer/engine.server.ts`, ajustar os parâmetros do FFmpeg para priorizar velocidade sem sacrificar excessivamente a qualidade, usando presets mais rápidos para resoluções altas (1080p+).
3.  **Tratamento de Erros no Muxing**: Garantir que, se o áudio falhar, o vídeo ainda seja processado (fallback para vídeo sem áudio com aviso).

### Frontend (UI/UX)
1.  **Melhorar o Feedback de Progresso**: Em `VideoEnhancer.tsx`, adicionar mensagens mais claras durante o processamento ("Analisando vídeo...", "Removendo ruído...", "Fazendo Upscale...").
2.  **Gerenciamento de Persistência**: Implementar salvamento do `jobId` no `localStorage` para que o usuário possa fechar a aba e voltar depois para ver o resultado sem perder o progresso.
3.  **Aviso de Tempo Realista**: Adicionar um aviso de que o processamento de 4K pode levar de 5 a 15 minutos dependendo da duração.

### Integração no Hero
1.  **Remover Ambiguidade**: Já foi solicitado remover o campo de link, mas garantiremos que o botão de "Acessar Ferramenta" seja a única ação principal, com um aviso claro de que o upload é local.

## Detalhes Técnicos
- Utilização de `supabaseAdmin` para bypass de RLS em atualizações de status internas.
- Persistência de estado via `useEffect` e `localStorage`.
- Ajuste de `preset` no FFmpeg: de `slower` para `fast` em resoluções acima de 1080p para reduzir tempo de espera.

## Arquivos a serem modificados
- `src/lib/video-enhancer/jobs.functions.ts`
- `src/lib/video-enhancer/engine.server.ts`
- `src/components/tools/video-enhancer/VideoEnhancer.tsx`
- `src/components/HeroSection.tsx` (Verificação final)

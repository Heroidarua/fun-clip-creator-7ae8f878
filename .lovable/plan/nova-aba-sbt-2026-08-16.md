# Nova aba "+SBT 📺"

## O que será feito

1. **Nova rota fullscreen** `src/routes/mais-sbt.tsx` + página `src/pages/MaisSbt.tsx`
   - Layout 100vw × 100vh, sem Header/Footer/MobileBottomNav (página totalmente imersiva)
   - Fundo preto, iframe ocupando toda a tela
   - `allow="fullscreen; autoplay; encrypted-media"` + `allowFullScreen`
   - Botão flutuante discreto no canto superior esquerdo: "← Voltar" (retorna ao site) e "⛶ Tela cheia" (usa `requestFullscreen()`)
   - Indicador de carregamento centralizado (spinner retrô na paleta neon do SOS01: azul neon #28B6FF + roxo #B66DFF, fonte VT323 "CARREGANDO...")
   - Detecção de bloqueio por X-Frame-Options/CSP:
     - Timer de 6s após montar; se o `onLoad` do iframe não disparar, considera bloqueado
     - Também escuta `onError`
     - Estado de fallback exibe: ícone Tv (lucide-react), título "O +SBT não permite incorporação direta", subtítulo explicativo, botão grande `btn-3d` "Abrir +SBT" com `target="_blank" rel="noopener noreferrer"` apontando para https://mais.sbt.com.br/
   - CSS: `overflow: hidden` no body enquanto a página estiver montada (cleanup no unmount)

2. **Esconder o MobileBottomNav nesta rota**
   - Em `src/components/MobileBottomNav.tsx` (montado no `__root.tsx`), adicionar verificação do pathname; se for `/mais-sbt`, não renderizar
   - Mesma lógica caso haja qualquer wrapper visual global

3. **Adicionar item ao menu principal**
   - Em `src/components/Header.tsx`, adicionar entrada no array `NAV`:
     - `{ to: "/mais-sbt", label: "+SBT 📺", icon: Tv, desc: "Assista +SBT grátis" }`
   - Usar ícone `Tv` do lucide-react

## Estética (SOS01 retrô)

- Tela de loading: fundo preto, spinner com bordas em neon (azul + roxo), texto "CARREGANDO +SBT..." em VT323
- Tela de fallback (bloqueio): card central com borda neon, ícone Tv grande pulsante, botão CTA usando utilitário `btn-3d` existente, animações `animate-in fade-in` do Tailwind
- Sem barras, sem padding lateral — iframe edge-to-edge

## Detalhes técnicos

- Rota TanStack: `createFileRoute("/mais-sbt")` com `head()` definindo title "+SBT — SOS01" e meta description
- Não usar `Header` nem `Footer` (página fullscreen dedicada)
- `useState` para `loading`, `blocked`
- `useRef<HTMLIFrameElement>` + `useEffect` com `setTimeout(6000)` para detectar bloqueio silencioso
- `requestFullscreen()` opcional via botão (não automático — navegadores exigem gesto do usuário)
- Sem alterações em backend, DB ou env

## Arquivos

- **Novo**: `src/routes/mais-sbt.tsx`
- **Novo**: `src/pages/MaisSbt.tsx`
- **Editado**: `src/components/Header.tsx` (item NAV)
- **Editado**: `src/components/MobileBottomNav.tsx` (hide on /mais-sbt)

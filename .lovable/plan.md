## Redesign global: Vintage Gamer Retrô (anos 80/90)

Substituir 100% o design system atual ("Editorial Cream") por uma identidade **Retro Arcade / Neo Pixel 3D** em todo o site, mantendo intacta toda a lógica de negócio (downloaders, ferramentas IA, jogos, quadrinhos, blog, rotas SSG).

---

### 1. Novo Design System (`src/styles.css`)

Reescrever os tokens `@theme` e as variáveis `:root` mantendo os nomes semânticos do shadcn (para não quebrar componentes), mas com novos valores:

**Paleta (modo claro padrão + dark):**
- `--background`: `#F5F9FF` (Branco Gelo) / dark: `#0A1628`
- `--foreground`: `#0E4A7B` / dark: `#F5F9FF`
- `--primary`: `#28B6FF` (Azul Neon)
- `--primary-foreground`: `#F5F9FF`
- `--secondary`: `#0E4A7B` (Azul Escuro)
- `--accent`: `#B66DFF` (Roxo Neon)
- `--muted`: `#E8EEF5`
- `--warning/highlight`: `#FFD93D` (Amarelo Pixel)
- Bordas: 2-4px sólidas; raio padrão `--radius: 0.5rem` com variantes "cartucho" mais arredondadas.

**Tipografia (carregada via `<link>` em `src/routes/__root.tsx`):**
- Headings: **VT323** (pixel legível) — token `--font-display`
- Body/UI: **Silkscreen** para labels/badges curtos; **Manrope** mantida só para parágrafos longos de blog (legibilidade) — tokens `--font-sans` e `--font-body`.
- Remover Fraunces e Instrument Serif.

**Sombras "cartucho 3D" (utilitárias novas via `@utility`):**
- `.shadow-cartridge`: `0 4px 0 var(--secondary), 0 8px 20px rgba(0,0,0,.2)`
- `.shadow-neon`: `0 0 12px var(--primary), 0 0 24px color-mix(...)`
- `.btn-3d`: estado normal com sombra inferior 4px; `:active` translada 4px para baixo e zera a sombra (efeito "afunda").

**Backgrounds globais:**
- Grid retrô SVG sutil aplicado no `body` (linhas em `--muted` a 8% de opacidade, 32px).
- Componente `<PixelParticles />` opcional no hero (canvas leve, partículas quadradas caindo).

---

### 2. Componentes base a refatorar

| Componente | Mudança |
|---|---|
| `src/components/ui/button.tsx` | Nova variante default `btn-3d` (azul neon, sombra cartucho, press effect). Variants: `default`, `accent` (roxo), `warning` (amarelo), `ghost`, `outline-pixel` (borda dupla pixel). |
| `src/components/ui/card.tsx` | Visual "cartucho": borda 2px, sombra dupla, hover `-translate-y-1` + brilho neon. |
| `src/components/ui/input.tsx` | Borda 2px sólida, foco com glow neon, fundo `--muted`. |
| `src/components/ui/accordion.tsx` | Substituído nos blocos de "Ferramentas Úteis" por grid de cards (ver §4). |
| `src/components/Header.tsx` | Logo SOS/01 em pixel, nav com underline neon, sticky com blur sutil. |
| `src/components/Footer.tsx` | Visual rodapé arcade (linhas scanline opcionais). |
| Novo: `src/components/MobileBottomNav.tsx` | Barra fixa inferior no mobile (Home, Ferramentas, Jogos, Quadrinhos, Perfil) com ícones pixel. |
| Novo: `src/components/BackToTop.tsx` | Botão flutuante "▲" pixel. |
| Novo: `src/components/RetroLoader.tsx` | Loading screen estilo "NOW LOADING…" de console antigo (usado em Suspense/route transitions). |

---

### 3. Páginas — ajustes visuais (lógica preservada)

- **`src/pages/Index.tsx`** (Home): hero com headline pixel grande "BAIXE, LEIA, JOGUE", grid sutil, badges neon. Os 4 cards de downloader viram "cartuchos" (TikTok/Instagram/Kwai/YouTube) com indicador `ATIVO` em LED verde pixel.
- **`src/pages/Ferramentas.tsx`**: remover acordeões → grid responsivo de cards grandes com ícones (pixel-art) + categorias em abas + campo de busca no topo.
- **`src/pages/Jogos.tsx`**: já tem estética retrô; harmonizar tokens (remover cores hard-coded `retro-*` e usar tokens novos). Capas maiores no grid, botão "JOGAR AGORA" 3D.
- **Quadrinhos** (seções em Home/blog correspondentes): "prateleira" com filtros coloridos em chips pixel.
- **Blog** (`src/pages/Blog.tsx` e artigos): manter Manrope no corpo para legibilidade; headings em VT323; cards de artigo como cartuchos.
- **Demais rotas** (Sobre, Contato, DMCA, Termos, Privacidade, Preços, Como Usar): aplicar novos tokens automaticamente via shadcn.

---

### 4. Mobile-first

- `<MobileBottomNav />` montado no `__root.tsx` (visível só `md:hidden`), com safe-area-inset-bottom.
- Espaçamento aumentado: padding mínimo 16px em cards, alvos de toque ≥ 44px.
- Hero reduz para 1 coluna; cartuchos full-width com sombra preservada.

---

### 5. Animações

- Tailwind keyframes já existentes (`fade-in`, `scale-in`) mantidos.
- Novos utilitários: `.animate-neon-pulse` (pulsar do glow), `.animate-press` (botão), `.animate-scanline` (overlay opcional em modais de jogo).
- Hover universal de cartucho: `transition-transform .15s; hover:-translate-y-1; hover:shadow-neon`.
- `RetroLoader` em Suspense boundaries.

---

### 6. Memória do projeto

Atualizar `mem://index.md` e `mem://style/design-system`:
- Substituir regra "Editorial Cream" por **"Vintage Gamer Retrô"** com paleta `#28B6FF / #0E4A7B / #F5F9FF / #B66DFF / #FFD93D` e fontes **VT323 + Silkscreen + Manrope (body longo)**.
- Marcar como constraint: "Não usar Fraunces/Instrument Serif. Não usar paleta creme/âmbar."

---

### Fora de escopo

- Não mexer em rotas, server functions, edge functions, schemas Supabase, lógica de downloaders, sistema de IA.
- Não reintroduzir gamificação/XP (continua proibido por memória).
- Sons opcionais (mencionados no prompt): **não** incluir agora — fica para iteração futura para evitar peso/autoplay.

---

### Detalhes técnicos

- Tailwind v4: tokens via `@theme` em `src/styles.css`; fontes via `<link>` no `__root.tsx` head (nunca `@import` URL).
- shadcn tokens via `@theme inline` mapeando para `:root` HSL/hex → não quebra componentes existentes.
- SSG/prerender intacto; nenhum acesso a `window` em módulo top-level.
- Sem novos pacotes npm necessários (canvas de partículas em vanilla `<canvas>`).

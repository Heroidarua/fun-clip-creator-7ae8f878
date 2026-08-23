# Plano: Exportação do Duelo de Super-heróis

Permitir que o usuário baixe o resultado do duelo de super-heróis (Fun-Clip) como imagem (PNG ou JPG) e compartilhe diretamente pelo dispositivo.

## Mudanças

### Frontend

- **src/components/ComicsSection.tsx**
    - Verificar e garantir que o botão "GERAR FUN-CLIP" esteja visível e funcional no modal de duelo.
    - Implementar a lógica de captura da área de duelo usando `html-to-image`.
    - Adicionar opções de formato (PNG/JPG) e qualidade/escala.
    - Implementar o botão "COMPARTILHAR" usando a Web Share API (`navigator.share`).
    - Garantir que a marca d'água "sos01.com.br" seja aplicada corretamente na exportação.

## Detalhes Técnicos

- Utilizar `html-to-image` para renderizar o componente DOM como uma imagem.
- Utilizar `downloadjs` para disparar o download no navegador.
- A marca d'água será um elemento posicionado sobre o clipe durante a captura.
- O compartilhamento verificará a compatibilidade com `navigator.canShare` antes de tentar enviar o arquivo.

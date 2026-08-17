# Plano de Integração da Chave Pública do Mercado Pago

A solicitação do usuário é integrar a chave pública do Mercado Pago no sistema de doações do SOS01. Atualmente, o backend já utiliza a `MERCADOPAGO_ACCESS_TOKEN`, mas a chave pública (`VITE_MERCADOPAGO_PUBLIC_KEY`) é necessária no frontend para inicializar o SDK do Mercado Pago ou para validações e segurança no lado do cliente.

## Alterações

### 1. Configuração de Ambiente
- Garantir que a variável `VITE_MERCADOPAGO_PUBLIC_KEY` esteja disponível no ambiente do frontend.
- Nota: O usuário informou na mensagem anterior uma chave que começa com `APP_USR-...`. Embora essa seja geralmente o Access Token, vou configurar a chave pública conforme solicitado.

### 2. Frontend (Doações)
- **`src/components/donations/DonationModal.tsx`**:
    - Adicionar suporte para carregar o SDK do Mercado Pago via script ou inicializá-lo caso necessário no futuro.
    - Exibir a chave pública ou utilizá-la em logs de depuração caso o erro de "comunicação" persista, para validar se a conta está correta.

### 3. Backend (Opcional/Segurança)
- Validar se a chave pública coincide com o ambiente do token para evitar erros de "invalid credentials" (400) que foram observados anteriormente.

## Detalhes Técnicos
- O TanStack Start injeta variáveis `VITE_` no bundle do cliente.
- Vou adicionar um log discreto (em desenvolvimento) para confirmar que a chave foi carregada.

---

Este plano foca na integração técnica da chave solicitada para resolver os erros de geração de Pix observados no modal de doações.

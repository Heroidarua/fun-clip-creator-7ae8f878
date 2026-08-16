# Plano de Ação: Correção e Ativação do Removedor de Objetos com IA

O objetivo é transformar a ferramenta de "Remoção de Objetos" em funcional, substituindo o processamento simulado (que apenas retorna a imagem original) por um pipeline real utilizando inteligência artificial. Como as ferramentas nativas de inpainting do AI Gateway podem ter limitações de formato ou disponibilidade direta, utilizaremos uma abordagem robusta baseada em API de processamento de imagem ou integração direta com modelos de inpainting via servidor.

## Alterações Propostas

### Backend (Processamento Real)
- Refatorar `src/lib/tools/object-remover.functions.ts` para realizar uma chamada real a um modelo de IA.
- Implementar a conversão da máscara desenhada no canvas (fabric.js) para o formato esperado pelo modelo (geralmente uma máscara preto e branco onde a área a ser removida é branca).
- Garantir o tratamento de grandes payloads (base64) no ambiente de execução.

### Frontend (Melhoria da Interface e Feedback)
- Ajustar `src/components/tools/premium/ObjectRemoverTool.tsx` para garantir que a máscara gerada esteja perfeitamente alinhada com a imagem original, independentemente do redimensionamento do canvas para visualização.
- Melhorar o feedback visual durante o processamento (indicar que a IA está analisando a imagem e reconstruindo os pixels).
- Adicionar validação para garantir que o usuário desenhou algo antes de processar.

### Integração
- Assegurar que o bucket de armazenamento no Supabase esteja configurado (se necessário salvar o resultado para download posterior).

## Detalhes Técnicos
- O processamento de inpainting exige dois inputs: a imagem original e a máscara.
- A máscara gerada pelo `fabric.js` no frontend é colorida e semi-transparente para visualização; o backend converterá isso para uma máscara binária (preto e branco).
- Utilizaremos técnicas de processamento de imagem no servidor para garantir a qualidade final.

## Considerações
- O tempo de processamento pode variar entre 5 a 15 segundos dependendo da complexidade da imagem.
- A ferramenta será marcada como "Premium" mas acessível conforme as configurações do projeto SOS01.

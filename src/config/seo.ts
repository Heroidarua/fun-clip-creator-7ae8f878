/**
 * Configuração central de SEO do SOS01.
 *
 * Um único lugar para: domínio canônico, metadados padrão, categorias e o
 * catálogo SEO das ferramentas (título, descrição, H1, keywords, conteúdo
 * editorial e FAQ). Novas ferramentas só precisam de uma entrada aqui.
 */

export const SITE_CONFIG = {
  name: "SOS01",
  /** Domínio canônico do projeto. */
  url: "https://sos01.com.br",
  locale: "pt_BR",
  lang: "pt-BR",
  twitter: "@sos01",
  defaultTitle: "SOS01 — Ferramentas online gratuitas",
  defaultDescription:
    "Plataforma gratuita com downloaders de vídeo, ferramentas de imagem, PDF, texto e IA, além de jogos retrô. Tudo direto no navegador, sem cadastro.",
  defaultImage:
    "https://fun-clip-creator.lovable.app/og-image.png",
} as const;

export type ToolCategoryId =
  | "video"
  | "imagem"
  | "pdf"
  | "texto"
  | "ia"
  | "utilidades"
  | "privacidade"
  | "internet";

export type ToolCategory = {
  id: ToolCategoryId;
  label: string;
  title: string;
  description: string;
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "video",
    label: "Vídeo e áudio",
    title: "Ferramentas de Vídeo e Áudio Grátis",
    description:
      "Converta, extraia áudio e prepare vídeos para publicação sem instalar programas.",
  },
  {
    id: "imagem",
    label: "Imagem",
    title: "Ferramentas de Imagem Online Grátis",
    description:
      "Remova fundo, aplique marca d'água, extraia cores e crie miniaturas direto no navegador.",
  },
  {
    id: "pdf",
    label: "PDF e documentos",
    title: "Ferramentas de PDF e Documentos",
    description:
      "Converta imagens em PDF, assine documentos e digitalize papéis usando a câmera do celular.",
  },
  {
    id: "texto",
    label: "Texto",
    title: "Ferramentas de Texto Online",
    description: "Resuma, traduza, transcreva e identifique idiomas de qualquer texto.",
  },
  {
    id: "ia",
    label: "Inteligência artificial",
    title: "Ferramentas com Inteligência Artificial",
    description: "Gere textos, avatares e transcrições com IA sem pagar assinatura.",
  },
  {
    id: "utilidades",
    label: "Utilidades",
    title: "Utilidades Online do Dia a Dia",
    description: "QR Code, senhas, links curtos e outros utilitários rápidos.",
  },
  {
    id: "privacidade",
    label: "Privacidade",
    title: "Ferramentas de Privacidade e Segurança",
    description: "Gere senhas fortes e verifique dados da sua conexão com segurança.",
  },
  {
    id: "internet",
    label: "Internet",
    title: "Ferramentas de Internet e Rede",
    description: "Teste de velocidade, consulta de IP e diagnóstico da sua conexão.",
  },
];

export const getCategory = (id: string) => TOOL_CATEGORIES.find((c) => c.id === id);

export type ToolFaq = { question: string; answer: string };

export type ToolSeo = {
  /** Slug usado em /ferramenta/<slug>. Nunca alterar depois de publicado. */
  slug: string;
  /** Nome curto exibido em listas e links internos. */
  name: string;
  /** <title> exclusivo da página. */
  title: string;
  /** Meta description exclusiva. */
  description: string;
  /** H1 único e coerente com a página. */
  h1: string;
  keywords: string[];
  category: ToolCategoryId;
  /** Parágrafo de abertura: o que é e para que serve. */
  intro: string;
  /** Passo a passo de uso. */
  steps: string[];
  /** Principais recursos. */
  features: string[];
  /** Formatos suportados (quando aplicável). */
  formats?: string[];
  /** Perguntas frequentes reais, exibidas visivelmente na página. */
  faq: ToolFaq[];
  /** Slugs de ferramentas relacionadas (links internos). */
  related: string[];
  /** Artigos do blog relacionados (caminho absoluto). */
  articles?: { label: string; to: string }[];
};

export const TOOLS_SEO: ToolSeo[] = [
  {
    slug: "melhorar-video",
    name: "Melhorar Vídeo",
    title: "Melhorar Vídeo Online Grátis | Upscale e Denoise | SOS01",
    description:
      "Melhore a qualidade dos seus vídeos online e grátis. Upscale para 4K, remoção de ruído, nitidez e melhoria de áudio com IA.",
    h1: "Melhorar qualidade de vídeo online",
    keywords: [
      "melhorar vídeo",
      "upscale vídeo",
      "remover ruído vídeo",
      "melhorar áudio vídeo",
      "vídeo 4k online",
    ],
    category: "video",
    intro:
      "A ferramenta de melhoria de vídeo do SOS01 utiliza algoritmos avançados para aumentar a resolução e a clareza dos seus arquivos MP4. Você pode fazer upscale para HD, Full HD ou 4K, remover granulação (denoise) e melhorar a inteligibilidade das vozes no áudio, tudo de forma modular e gratuita.",
    steps: [
      "Envie seu arquivo de vídeo (MP4 recomendado, até 1GB).",
      "Escolha o nível de melhoria: Leve, Padrão ou Máximo.",
      "Selecione as opções de áudio como redução de ruído e ganho de voz.",
      "Aguarde o processamento e baixe o vídeo aprimorado.",
    ],
    features: [
      "Upscale inteligente para resoluções maiores",
      "Redução de ruído visual e digital (Denoise)",
      "Ajuste de nitidez e correção de cor",
      "Melhoria de áudio com foco em voz",
    ],
    formats: ["MP4", "MOV", "AVI"],
    faq: [
      {
        question: "Qual o limite de tamanho de arquivo?",
        answer: "Você pode enviar vídeos de até 1 GB para processamento.",
      },
      {
        question: "Quanto tempo demora o processamento?",
        answer:
          "Depende da duração do vídeo e do nível de melhoria escolhido. Vídeos curtos levam alguns minutos.",
      },
      {
        question: "Os meus vídeos ficam salvos?",
        answer:
          "Os arquivos são deletados automaticamente após 24 horas da conclusão do processamento.",
      },
    ],
    related: ["conversor-mp4-mp3", "gerador-de-thumbnail", "removedor-de-fundo"],
  },
  {
    slug: "youtube-downloader",
    name: "YouTube Downloader",
    title: "Baixar Vídeos do YouTube Online Grátis em HD | SOS01",
    description:
      "Baixe vídeos do YouTube em HD (720p) e MP3 de forma rápida e segura. Limite de até 1GB, processamento direto e sem anúncios intrusivos.",
    h1: "YouTube Downloader HD Grátis",
    keywords: [
      "baixar video youtube",
      "youtube downloader hd",
      "converter youtube para mp3",
      "baixar video youtube 1gb",
      "sos01 youtube",
    ],
    category: "video",
    intro:
      "O YouTube Downloader do SOS01 permite salvar seus vídeos favoritos diretamente no seu dispositivo. Com suporte a arquivos de até 1GB e qualidade 720p HD, nossa ferramenta processa o download de forma otimizada para garantir a melhor velocidade e segurança.",
    steps: [
      "Cole a URL do vídeo do YouTube no campo de busca.",
      "Escolha entre o formato Vídeo (MP4) ou Áudio (MP3).",
      "Selecione a qualidade desejada.",
      "Clique em Download e aguarde o processamento final.",
    ],
    features: [
      "Suporte a arquivos grandes (até 1GB)",
      "Qualidade HD 720p garantida",
      "Conversão para MP3 de alta qualidade",
      "Processamento via servidor para maior estabilidade",
    ],
    formats: ["MP4", "MP3", "M4A"],
    faq: [
      {
        question: "Qual o limite de tamanho para download?",
        answer: "Você pode baixar vídeos de até 1 GB de tamanho.",
      },
      {
        question: "Qual a resolução máxima suportada?",
        answer: "Atualmente suportamos até 720p HD para garantir estabilidade no processamento.",
      },
      {
        question: "É seguro baixar vídeos pelo SOS01?",
        answer: "Sim, o SOS01 processa os downloads de forma segura e não armazena os arquivos permanentemente.",
      },
    ],
    related: ["melhorar-video", "conversor-mp4-mp3", "gerador-de-thumbnail"],
  },
  {
    slug: "gerador-qrcode",
    name: "Gerador de QR Code",
    title: "Gerador de QR Code Grátis Online | SOS01",
    description:
      "Crie QR Codes gratuitos para links, textos, Wi-Fi e PIX direto no navegador e baixe a imagem em alta resolução, sem cadastro e sem marca d'água.",
    h1: "Gerador de QR Code grátis",
    keywords: ["gerador de qr code", "criar qr code", "qr code grátis", "qr code online"],
    category: "utilidades",
    intro:
      "O gerador de QR Code do SOS01 transforma qualquer link ou texto em um código bidimensional que pode ser lido pela câmera de qualquer celular. O código é desenhado no próprio navegador, então o conteúdo que você digita não precisa ser enviado para um servidor e o QR Code não expira nem depende do SOS01 para continuar funcionando.",
    steps: [
      "Cole o link, o texto ou os dados que o QR Code deve conter.",
      "Ajuste o tamanho e as cores para combinar com o material onde ele será usado.",
      "Confira a pré-visualização e teste a leitura com a câmera do celular.",
      "Clique em baixar para salvar a imagem e usar em cardápios, etiquetas ou posts.",
    ],
    features: [
      "Geração instantânea enquanto você digita",
      "Download em imagem de alta resolução, pronta para impressão",
      "Códigos permanentes: não há redirecionamento nem link intermediário",
      "Funciona em celular, tablet e computador",
    ],
    formats: ["PNG"],
    faq: [
      {
        question: "O QR Code gerado expira?",
        answer:
          "Não. O conteúdo é gravado dentro do próprio código, sem link intermediário, então ele continua funcionando mesmo que você não use mais o SOS01.",
      },
      {
        question: "Posso usar o QR Code comercialmente?",
        answer:
          "Sim. As imagens geradas não têm marca d'água e podem ser usadas em cardápios, embalagens, cartões e campanhas.",
      },
      {
        question: "Quanto texto cabe em um QR Code?",
        answer:
          "Links curtos e textos de até algumas centenas de caracteres funcionam bem. Quanto mais dados, mais denso fica o desenho e mais difícil a leitura à distância.",
      },
    ],
    related: ["encurtador-de-url", "gerador-de-senha", "marca-dagua"],
  },
  {
    slug: "gerador-de-senha",
    name: "Gerador de Senhas",
    title: "Gerador de Senhas Fortes Online Grátis | SOS01",
    description:
      "Gere senhas aleatórias e seguras com letras, números e símbolos. Tudo criado no seu navegador, sem envio para servidores e sem cadastro.",
    h1: "Gerador de senhas fortes",
    keywords: ["gerador de senha", "senha forte", "senha aleatória", "criar senha segura"],
    category: "privacidade",
    intro:
      "Senhas curtas e repetidas são a principal porta de entrada em invasões de contas. Este gerador cria combinações aleatórias usando a API de criptografia do navegador, permitindo escolher comprimento e quais tipos de caractere entram na mistura. Nada é gravado, transmitido ou registrado em histórico.",
    steps: [
      "Escolha o comprimento desejado — 16 caracteres ou mais é o recomendado hoje.",
      "Marque quais conjuntos usar: maiúsculas, minúsculas, números e símbolos.",
      "Gere a senha e copie com um clique.",
      "Guarde a senha em um gerenciador confiável em vez de anotá-la em texto puro.",
    ],
    features: [
      "Aleatoriedade criptográfica do próprio navegador",
      "Controle de comprimento e de tipos de caractere",
      "Cópia rápida para a área de transferência",
      "Nenhuma senha sai do seu dispositivo",
    ],
    faq: [
      {
        question: "As senhas geradas ficam salvas em algum lugar?",
        answer:
          "Não. A geração acontece inteiramente no navegador e nada é enviado ao servidor nem armazenado.",
      },
      {
        question: "Qual o tamanho ideal de senha?",
        answer:
          "Para contas importantes, use pelo menos 16 caracteres misturando maiúsculas, minúsculas, números e símbolos.",
      },
      {
        question: "Posso usar a mesma senha em vários sites?",
        answer:
          "Não é recomendado. Se um site vazar dados, a senha repetida expõe todas as suas outras contas.",
      },
    ],
    related: ["gerador-qrcode", "meu-ip", "velocidade"],
  },
  {
    slug: "conversor-mp4-mp3",
    name: "Conversor MP4 para MP3",
    title: "Converter MP4 para MP3 Online Grátis | SOS01",
    description:
      "Extraia o áudio de vídeos MP4 e baixe em MP3 direto do navegador. Sem instalar programas, sem marca d'água e sem limite de conversões.",
    h1: "Conversor de MP4 para MP3",
    keywords: [
      "converter mp4 para mp3",
      "extrair áudio de vídeo",
      "conversor mp3 online",
      "vídeo para áudio",
    ],
    category: "video",
    intro:
      "Esta ferramenta separa a trilha de áudio de um arquivo de vídeo e entrega um arquivo pronto para ouvir no celular ou usar em edições. É útil para transformar aulas, entrevistas e podcasts gravados em vídeo num arquivo leve, que ocupa uma fração do espaço original.",
    steps: [
      "Selecione o arquivo de vídeo que está no seu dispositivo.",
      "Aguarde a leitura da faixa de áudio — vídeos longos levam mais tempo.",
      "Ouça a prévia para confirmar que é o trecho certo.",
      "Baixe o áudio resultante.",
    ],
    features: [
      "Processamento no navegador, sem upload para servidores de terceiros",
      "Mantém o áudio original, sem recompressão agressiva",
      "Sem limite de quantidade de conversões",
      "Funciona em Android, iPhone e computador",
    ],
    formats: ["MP4", "WEBM", "MOV", "MKV"],
    faq: [
      {
        question: "Existe limite de tamanho do vídeo?",
        answer:
          "O limite prático é a memória do seu aparelho. Em celulares mais simples, vídeos muito longos podem travar a conversão — divida o arquivo se isso acontecer.",
      },
      {
        question: "A qualidade do áudio cai?",
        answer:
          "A faixa de áudio é extraída do vídeo original, então o resultado acompanha a qualidade que já existia no arquivo.",
      },
      {
        question: "Posso converter um vídeo do YouTube?",
        answer:
          "Você precisa primeiro ter o arquivo no dispositivo. Use o downloader do SOS01 para salvar o vídeo e depois converta aqui.",
      },
    ],
    related: ["gerador-de-thumbnail", "stt", "tts"],
    articles: [
      { label: "Como extrair o áudio de vídeos do TikTok", to: "/blog/como-extrair-audio-tiktok" },
    ],
  },
  {
    slug: "removedor-de-fundo",
    name: "Removedor de Fundo",
    title: "Removedor de Fundo de Imagem Grátis | SOS01",
    description:
      "Remova o fundo de fotos automaticamente com IA no próprio navegador e baixe em PNG com transparência. Grátis, sem marca d'água e sem cadastro.",
    h1: "Removedor de fundo de imagem",
    keywords: [
      "removedor de fundo",
      "remover fundo de imagem",
      "tirar fundo de foto",
      "fundo transparente png",
    ],
    category: "imagem",
    intro:
      "O removedor de fundo usa um modelo de segmentação que roda dentro do navegador, com aceleração por WebGPU quando o aparelho suporta. A imagem não é enviada para nenhum servidor: ela é analisada localmente e devolvida em PNG com fundo transparente, pronta para catálogos, adesivos, thumbnails e apresentações.",
    steps: [
      "Envie a foto — retratos e produtos com contorno definido dão o melhor resultado.",
      "Aguarde o processamento; na primeira vez o modelo é baixado uma única vez.",
      "Compare o antes e depois com o controle deslizante.",
      "Baixe o PNG transparente ou aplique uma cor de fundo nova.",
    ],
    features: [
      "Recorte automático por IA, sem seleção manual",
      "Processamento local: a foto não sai do seu dispositivo",
      "Saída em PNG com canal alfa (transparência real)",
      "Opção de trocar o fundo por cor sólida",
    ],
    formats: ["JPG", "PNG", "WEBP"],
    faq: [
      {
        question: "Minhas fotos são enviadas para algum servidor?",
        answer:
          "Não. O modelo de IA roda no navegador, então a imagem permanece no seu dispositivo durante todo o processo.",
      },
      {
        question: "Por que a primeira imagem demora mais?",
        answer:
          "Na primeira execução o navegador baixa o modelo de IA. As imagens seguintes usam o modelo em cache e ficam bem mais rápidas.",
      },
      {
        question: "Funciona no celular?",
        answer:
          "Sim, mas aparelhos com pouca memória podem demorar mais. Se travar, reduza a resolução da foto antes de enviar.",
      },
    ],
    related: ["marca-dagua", "cores", "imagem-para-pdf"],
  },
  {
    slug: "imagem-para-pdf",
    name: "Imagem para PDF",
    title: "Converter Imagem em PDF Online Grátis | SOS01",
    description:
      "Junte várias fotos JPG ou PNG em um único arquivo PDF, na ordem que você escolher, direto do navegador e sem marca d'água.",
    h1: "Conversor de imagem para PDF",
    keywords: ["imagem para pdf", "jpg para pdf", "converter foto em pdf", "juntar imagens em pdf"],
    category: "pdf",
    intro:
      "Enviar documentos como um monte de fotos soltas costuma dar problema em cadastros e processos. Esta ferramenta monta um PDF único com as imagens selecionadas, mantendo a ordem definida por você e ajustando cada foto à página. Toda a montagem acontece no navegador.",
    steps: [
      "Selecione uma ou várias imagens de uma vez.",
      "Reordene para que as páginas fiquem na sequência correta.",
      "Gere o PDF e confira a prévia.",
      "Baixe o arquivo final.",
    ],
    features: [
      "Várias imagens em um único PDF",
      "Ordem das páginas controlada por você",
      "Sem marca d'água e sem limite diário",
      "Montagem local, sem upload das fotos",
    ],
    formats: ["JPG", "PNG", "WEBP"],
    faq: [
      {
        question: "Quantas imagens posso juntar?",
        answer:
          "Não há um limite fixo; o que pesa é a memória do dispositivo. Dezenas de fotos funcionam bem na maioria dos aparelhos.",
      },
      {
        question: "O PDF sai com marca d'água?",
        answer: "Não. O arquivo gerado contém apenas as suas imagens.",
      },
      {
        question: "Dá para digitalizar documentos com a câmera?",
        answer:
          "Sim — use o scanner de documentos do SOS01 para fotografar e corrigir a perspectiva antes de gerar o PDF.",
      },
    ],
    related: ["scanner", "pdf-signer", "removedor-de-fundo"],
  },
  {
    slug: "gerador-de-texto",
    name: "Gerador de Texto com IA",
    title: "Gerador de Texto com IA Grátis | SOS01",
    description:
      "Crie legendas, descrições, roteiros e textos para redes sociais com inteligência artificial. Grátis, em português e sem cadastro.",
    h1: "Gerador de texto com IA",
    keywords: ["gerador de texto ia", "escrever texto com ia", "criar legenda", "texto automático"],
    category: "ia",
    intro:
      "Descreva o que precisa e a IA devolve um rascunho pronto para ajustar: legenda de post, descrição de produto, roteiro curto, e-mail ou resumo de ideia. O objetivo é vencer a página em branco — o texto gerado deve sempre ser revisado antes de publicar.",
    steps: [
      "Explique o tema, o tom desejado e o tamanho aproximado.",
      "Gere o texto e leia com atenção.",
      "Peça variações se o resultado não estiver no tom certo.",
      "Revise dados, nomes e números antes de publicar.",
    ],
    features: [
      "Respostas em português do Brasil",
      "Vários tipos de texto: legendas, descrições, roteiros e e-mails",
      "Sem limite de tentativas e sem cadastro",
      "Funciona igual no celular e no computador",
    ],
    faq: [
      {
        question: "O texto gerado é original?",
        answer:
          "O texto é produzido na hora pelo modelo, mas revise sempre: IA pode repetir clichês e errar fatos.",
      },
      {
        question: "Posso usar em trabalhos profissionais?",
        answer:
          "Sim, tratando o resultado como rascunho. A revisão humana é o que garante precisão e voz própria.",
      },
      {
        question: "Precisa de conta ou chave de API?",
        answer: "Não. A ferramenta é gratuita e não exige cadastro.",
      },
    ],
    related: ["resumidor", "tradutor", "avatar-pixelado"],
  },
  {
    slug: "tradutor",
    name: "Tradutor Automático",
    title: "Tradutor Online Grátis — Traduzir Textos | SOS01",
    description:
      "Traduza textos entre dezenas de idiomas direto no navegador, com detecção automática do idioma de origem e cópia rápida do resultado.",
    h1: "Tradutor automático de textos",
    keywords: ["tradutor online", "traduzir texto", "tradutor grátis", "tradutor português inglês"],
    category: "texto",
    intro:
      "Cole um texto e receba a tradução em segundos. O tradutor identifica sozinho o idioma de origem e aceita desde frases soltas até parágrafos inteiros, mantendo a quebra de linhas — útil para legendas, mensagens e descrições de produto.",
    steps: [
      "Cole ou digite o texto que precisa traduzir.",
      "Escolha o idioma de destino (a origem é detectada automaticamente).",
      "Confira a tradução e copie com um clique.",
      "Revise termos técnicos e nomes próprios, que costumam exigir ajuste.",
    ],
    features: [
      "Detecção automática do idioma de origem",
      "Dezenas de idiomas disponíveis",
      "Preserva quebras de linha do texto original",
      "Grátis e sem limite de uso",
    ],
    faq: [
      {
        question: "Qual o tamanho máximo do texto?",
        answer:
          "Textos longos são divididos em partes automaticamente. Para documentos muito grandes, traduza por seções para ter mais controle.",
      },
      {
        question: "A tradução é boa para uso profissional?",
        answer:
          "É excelente para entender e para rascunhos, mas contratos e materiais publicados merecem revisão de alguém fluente.",
      },
      {
        question: "Preciso instalar algo?",
        answer: "Não. Funciona direto no navegador, inclusive no celular.",
      },
    ],
    related: ["resumidor", "idioma", "gerador-de-texto"],
  },
  {
    slug: "resumidor",
    name: "Resumidor de Texto",
    title: "Resumidor de Texto Online Grátis | SOS01",
    description:
      "Cole um texto longo e receba um resumo com as ideias principais. Ideal para artigos, matérias e materiais de estudo. Grátis e sem cadastro.",
    h1: "Resumidor de textos",
    keywords: ["resumidor de texto", "resumir texto online", "resumo automático", "resumo de artigo"],
    category: "texto",
    intro:
      "O resumidor analisa a estrutura do texto, identifica as frases que carregam mais informação e monta uma versão curta preservando o sentido original. Serve para triagem de leitura: você entende rápido do que se trata e decide se vale ler na íntegra.",
    steps: [
      "Cole o texto completo no campo principal.",
      "Escolha o tamanho aproximado do resumo.",
      "Gere e leia o resultado.",
      "Compare com o original antes de citar trechos.",
    ],
    features: [
      "Resumo em segundos, sem limite de uso",
      "Tamanho do resumo ajustável",
      "Mantém a linguagem original do texto",
      "Funciona bem em artigos, notícias e materiais de estudo",
    ],
    faq: [
      {
        question: "O resumo substitui a leitura completa?",
        answer:
          "Não. Ele ajuda a decidir o que ler e a revisar conteúdo já conhecido, mas detalhes e nuances ficam no texto original.",
      },
      {
        question: "Funciona com textos em outros idiomas?",
        answer:
          "Sim, embora o melhor desempenho seja em português. Para outros idiomas, traduza antes usando o tradutor do SOS01.",
      },
      {
        question: "Meu texto é armazenado?",
        answer: "Não guardamos o conteúdo que você cola na ferramenta.",
      },
    ],
    related: ["tradutor", "gerador-de-texto", "ocr"],
  },
  {
    slug: "marca-dagua",
    name: "Marca d'água em Imagens",
    title: "Adicionar Marca d'Água em Imagens Grátis | SOS01",
    description:
      "Aplique texto ou logo como marca d'água nas suas fotos, com controle de posição, tamanho e transparência. Direto no navegador e sem custo.",
    h1: "Marca d'água em imagens",
    keywords: ["marca d'água", "adicionar marca d'agua em foto", "proteger imagem", "watermark online"],
    category: "imagem",
    intro:
      "Marca d'água é a forma mais simples de sinalizar autoria em fotos publicadas na internet. Aqui você escolhe entre texto ou um logo próprio, posiciona sobre a imagem e ajusta a opacidade até encontrar o equilíbrio entre visibilidade e discrição. A composição é feita no navegador, sem upload.",
    steps: [
      "Envie a imagem que será marcada.",
      "Escolha texto ou faça upload do seu logo.",
      "Ajuste posição, tamanho, cor e transparência.",
      "Baixe a imagem final já com a marca aplicada.",
    ],
    features: [
      "Marca d'água em texto ou imagem/logo",
      "Controle de opacidade, posição e escala",
      "Prévia em tempo real",
      "Nada é enviado para servidores",
    ],
    formats: ["JPG", "PNG", "WEBP"],
    faq: [
      {
        question: "A marca d'água impede o uso indevido da foto?",
        answer:
          "Ela dificulta e sinaliza autoria, mas não é uma proteção absoluta. Marcas sobre áreas centrais são mais difíceis de remover.",
      },
      {
        question: "Posso usar meu próprio logo?",
        answer: "Sim, envie um PNG com fundo transparente para o melhor resultado.",
      },
      {
        question: "A qualidade da imagem cai?",
        answer:
          "A imagem é reexportada, então pode haver mínima recompressão. Prefira PNG quando precisar de fidelidade máxima.",
      },
    ],
    related: ["removedor-de-fundo", "gerador-de-thumbnail", "cores"],
  },
  {
    slug: "gerador-de-thumbnail",
    name: "Gerador de Thumbnails",
    title: "Gerador de Thumbnail para Vídeos Grátis | SOS01",
    description:
      "Crie miniaturas chamativas para YouTube, TikTok e Shorts com texto, cores e proporções prontas. Grátis, direto no navegador.",
    h1: "Gerador de thumbnails para vídeos",
    keywords: ["gerador de thumbnail", "capa para youtube", "miniatura de vídeo", "thumbnail grátis"],
    category: "imagem",
    intro:
      "A miniatura é o que decide se alguém clica no seu vídeo. Esta ferramenta monta capas nas proporções mais usadas (16:9 para YouTube e 9:16 para Shorts, Reels e TikTok), com título em destaque e ajuste de cores, exportando uma imagem pronta para upload.",
    steps: [
      "Escolha a proporção conforme a plataforma de destino.",
      "Envie a imagem de fundo ou selecione uma cor sólida.",
      "Escreva o título e ajuste tamanho, cor e posição.",
      "Exporte a miniatura pronta para publicar.",
    ],
    features: [
      "Proporções prontas para YouTube, Shorts, Reels e TikTok",
      "Título com contraste ajustável para leitura em telas pequenas",
      "Exportação em resolução adequada para upload",
      "Sem marca d'água",
    ],
    formats: ["JPG", "PNG"],
    faq: [
      {
        question: "Qual o tamanho ideal de thumbnail no YouTube?",
        answer:
          "1280×720 pixels (16:9) é o padrão recomendado, com o texto grande o suficiente para ser lido em miniatura no celular.",
      },
      {
        question: "Posso usar em vídeos monetizados?",
        answer: "Sim, desde que as imagens usadas sejam suas ou de uso livre.",
      },
      {
        question: "Funciona no celular?",
        answer: "Sim, a interface se adapta a telas pequenas.",
      },
    ],
    related: ["marca-dagua", "removedor-de-fundo", "conversor-mp4-mp3"],
  },
  {
    slug: "encurtador-de-url",
    name: "Encurtador de URL",
    title: "Encurtador de Links Grátis Online | SOS01",
    description:
      "Transforme links longos em endereços curtos e fáceis de compartilhar no WhatsApp, bio e materiais impressos. Gratuito e sem cadastro.",
    h1: "Encurtador de links",
    keywords: ["encurtador de url", "encurtar link", "link curto", "encurtador grátis"],
    category: "internet",
    intro:
      "Links com dezenas de parâmetros quebram em mensagens e ficam impossíveis de ditar. O encurtador gera um endereço curto que redireciona para o destino original — prático para bio de redes sociais, materiais impressos e mensagens.",
    steps: [
      "Cole o link completo, incluindo https://.",
      "Gere a versão curta.",
      "Copie e teste o link antes de divulgar.",
      "Se for imprimir, combine com um QR Code.",
    ],
    features: [
      "Encurtamento imediato",
      "Cópia rápida para compartilhar",
      "Combina com o gerador de QR Code",
      "Sem cadastro",
    ],
    faq: [
      {
        question: "O link curto expira?",
        answer:
          "Ele depende do serviço de redirecionamento usado. Para materiais impressos de longa duração, prefira um QR Code com o link direto.",
      },
      {
        question: "Posso encurtar qualquer endereço?",
        answer:
          "Apenas links públicos e legítimos. Endereços com conteúdo malicioso podem ser bloqueados automaticamente.",
      },
      {
        question: "Dá para ver quantos cliques o link recebeu?",
        answer: "A ferramenta é focada no encurtamento e não oferece painel de estatísticas.",
      },
    ],
    related: ["gerador-qrcode", "meu-ip", "velocidade"],
  },
  {
    slug: "avatar-pixelado",
    name: "Gerador de Avatar Pixelado",
    title: "Gerador de Avatar Pixelado com IA Grátis | SOS01",
    description:
      "Crie avatares em estilo pixel art com inteligência artificial e use como foto de perfil em jogos e redes sociais. Grátis e sem cadastro.",
    h1: "Gerador de avatar pixelado",
    keywords: ["avatar pixelado", "criar avatar", "pixel art avatar", "foto de perfil retrô"],
    category: "ia",
    intro:
      "Descreva o personagem que você quer — cabelo, roupa, acessórios, clima — e a IA desenha um avatar em pixel art pronto para usar como foto de perfil. O estilo retrô funciona bem em telas pequenas, já que a silhueta continua legível mesmo em miniatura.",
    steps: [
      "Escreva uma descrição curta e objetiva do personagem.",
      "Gere e compare algumas variações.",
      "Escolha a que ficou mais próxima da ideia.",
      "Baixe a imagem e use como avatar.",
    ],
    features: [
      "Geração por IA a partir de texto em português",
      "Estilo pixel art legível em miniaturas",
      "Várias tentativas sem custo",
      "Download direto da imagem",
    ],
    faq: [
      {
        question: "Posso usar o avatar comercialmente?",
        answer:
          "As imagens geradas podem ser usadas como avatar pessoal. Para uso comercial, avalie se o resultado não remete a personagens protegidos.",
      },
      {
        question: "Por que o resultado não bateu com a descrição?",
        answer:
          "Descrições curtas e concretas funcionam melhor. Cite cores, acessórios e expressão, e gere novamente.",
      },
      {
        question: "É realmente grátis?",
        answer: "Sim, sem cadastro e sem limite diário.",
      },
    ],
    related: ["gerador-de-texto", "removedor-de-fundo", "gerador-de-thumbnail"],
  },

  /* ---- Ferramentas premium (mesma arquitetura, slugs já publicados) ---- */
  {
    slug: "ocr",
    name: "OCR: Imagem para Texto",
    title: "OCR Online Grátis — Extrair Texto de Imagem | SOS01",
    description:
      "Extraia o texto de fotos, prints e documentos digitalizados em português ou inglês e copie o resultado. Reconhecimento feito no navegador.",
    h1: "OCR: extrair texto de imagem",
    keywords: ["ocr online", "extrair texto de imagem", "imagem para texto", "ler texto de foto"],
    category: "texto",
    intro:
      "OCR é o reconhecimento óptico de caracteres: o programa analisa a imagem, identifica as formas das letras e devolve texto editável. Serve para copiar trechos de um print, digitalizar uma nota fiscal ou transformar a foto de uma página de livro em texto pesquisável.",
    steps: [
      "Envie a imagem — quanto mais nítida e reta, melhor o resultado.",
      "Selecione o idioma predominante do texto.",
      "Aguarde o reconhecimento.",
      "Revise o texto extraído e copie.",
    ],
    features: [
      "Reconhecimento em português e inglês",
      "Processamento no navegador",
      "Aceita prints, fotos e documentos digitalizados",
      "Texto pronto para copiar e editar",
    ],
    formats: ["PNG", "JPG", "WEBP"],
    faq: [
      {
        question: "Reconhece letra de mão?",
        answer:
          "O reconhecimento é otimizado para texto impresso ou digital. Manuscritos costumam sair com muitos erros.",
      },
      {
        question: "Como melhorar a precisão?",
        answer:
          "Fotografe com boa iluminação, sem sombras, enquadrando o texto reto e ocupando a maior parte do quadro.",
      },
      {
        question: "Serve para PDF?",
        answer:
          "Converta a página em imagem antes, ou use o scanner de documentos para fotografar a folha.",
      },
    ],
    related: ["scanner", "resumidor", "tradutor"],
  },
  {
    slug: "tts",
    name: "Texto para Voz",
    title: "Texto para Voz Online Grátis (TTS) | SOS01",
    description:
      "Transforme textos em áudio narrado com vozes em português, ajustando velocidade e tom. Grátis, direto no navegador.",
    h1: "Conversor de texto para voz",
    keywords: ["texto para voz", "tts online", "narrar texto", "ler texto em voz alta"],
    category: "texto",
    intro:
      "A síntese de voz do navegador lê o texto que você colar, com controle de velocidade e tom. É útil para revisar textos ouvindo, criar narrações simples e para acessibilidade de quem prefere consumir conteúdo em áudio.",
    steps: [
      "Cole o texto a ser narrado.",
      "Escolha a voz disponível no seu sistema.",
      "Ajuste velocidade e tom.",
      "Reproduza e ouça o resultado.",
    ],
    features: [
      "Vozes em português quando instaladas no sistema",
      "Controle de velocidade e tom",
      "Sem limite de uso",
      "Funciona no celular e no computador",
    ],
    faq: [
      {
        question: "Por que não aparece nenhuma voz em português?",
        answer:
          "As vozes vêm do sistema operacional. Instale um pacote de voz em português nas configurações do aparelho para que ele apareça na lista.",
      },
      {
        question: "Dá para baixar o áudio?",
        answer:
          "A leitura é feita em tempo real pelo navegador; para arquivos de áudio prontos, grave a saída com um gravador do próprio sistema.",
      },
      {
        question: "Existe limite de caracteres?",
        answer: "Textos muito longos podem ser divididos em partes para leitura mais estável.",
      },
    ],
    related: ["stt", "resumidor", "tradutor"],
  },
  {
    slug: "stt",
    name: "Voz para Texto",
    title: "Transcrever Áudio para Texto Grátis | SOS01",
    description:
      "Fale pelo microfone e receba a transcrição automática em texto, pronta para copiar. Grátis, sem instalar aplicativos.",
    h1: "Transcrição de voz para texto",
    keywords: ["voz para texto", "transcrever áudio", "ditado por voz", "transcrição automática"],
    category: "texto",
    intro:
      "A ferramenta usa o reconhecimento de fala do navegador para transformar o que você diz em texto na hora. Funciona bem para ditar mensagens, anotar ideias rapidamente e rascunhar textos longos sem digitar.",
    steps: [
      "Permita o acesso ao microfone quando o navegador pedir.",
      "Fale em ritmo natural, em ambiente sem muito ruído.",
      "Acompanhe o texto aparecendo em tempo real.",
      "Pare a gravação, revise a pontuação e copie.",
    ],
    features: [
      "Transcrição em tempo real",
      "Reconhecimento em português",
      "Sem instalar aplicativo",
      "Texto pronto para copiar",
    ],
    faq: [
      {
        question: "Funciona em qualquer navegador?",
        answer:
          "O reconhecimento de fala tem melhor suporte em navegadores baseados em Chromium. Em outros, pode não estar disponível.",
      },
      {
        question: "Por que a pontuação sai errada?",
        answer:
          "O reconhecimento foca nas palavras. Fale os sinais (\"vírgula\", \"ponto\") ou revise o texto ao final.",
      },
      {
        question: "O áudio é armazenado?",
        answer: "Não guardamos o áudio nem a transcrição.",
      },
    ],
    related: ["tts", "resumidor", "conversor-mp4-mp3"],
  },
  {
    slug: "pdf-signer",
    name: "Assinador de PDF",
    title: "Assinar PDF Online Grátis | SOS01",
    description:
      "Assine documentos em PDF desenhando, digitando ou enviando a imagem da sua assinatura, e baixe o arquivo já assinado. Sem cadastro.",
    h1: "Assinador de PDF",
    keywords: ["assinar pdf", "assinatura em pdf", "assinar documento online", "pdf signer grátis"],
    category: "pdf",
    intro:
      "Serve para aquela situação comum: um contrato ou formulário que precisa voltar assinado sem passar por impressora e scanner. Você posiciona a assinatura sobre a página desejada e baixa o PDF final. O documento é manipulado no próprio navegador.",
    steps: [
      "Envie o PDF que precisa ser assinado.",
      "Desenhe a assinatura, digite o nome ou envie uma imagem dela.",
      "Posicione e redimensione sobre a página correta.",
      "Gere e baixe o PDF assinado.",
    ],
    features: [
      "Assinatura desenhada, digitada ou enviada como imagem",
      "Posicionamento livre sobre qualquer página",
      "Documento processado localmente",
      "Download imediato do PDF final",
    ],
    formats: ["PDF"],
    faq: [
      {
        question: "A assinatura tem valor jurídico?",
        answer:
          "Trata-se de uma assinatura visual (imagem sobre o documento), não de assinatura digital com certificado ICP-Brasil. Para atos que exigem certificado, use uma plataforma credenciada.",
      },
      {
        question: "Meu contrato é enviado para algum servidor?",
        answer: "Não. O PDF é aberto e editado dentro do navegador.",
      },
      {
        question: "Posso assinar mais de uma página?",
        answer: "Sim, aplique a assinatura em cada página necessária antes de gerar o arquivo.",
      },
    ],
    related: ["scanner", "imagem-para-pdf", "ocr"],
  },
  {
    slug: "scanner",
    name: "Scanner de Documentos",
    title: "Scanner de Documentos Online Grátis | SOS01",
    description:
      "Use a câmera do celular para digitalizar documentos, corrigir o enquadramento e gerar um PDF legível. Grátis e sem aplicativo.",
    h1: "Scanner de documentos",
    keywords: ["scanner de documentos", "digitalizar documento", "escanear pelo celular", "foto em pdf"],
    category: "pdf",
    intro:
      "Uma foto comum de documento costuma sair torta, escura e pesada. O scanner ajusta contraste e enquadramento para deixar o papel legível como uma digitalização, e monta um PDF pronto para anexar em cadastros e processos.",
    steps: [
      "Fotografe o documento sobre uma superfície plana, com boa luz.",
      "Ajuste o recorte para eliminar o fundo.",
      "Aplique o realce para deixar o texto mais nítido.",
      "Gere o PDF e baixe.",
    ],
    features: [
      "Captura direta pela câmera do celular",
      "Recorte e realce de contraste",
      "Exportação em PDF",
      "Sem instalar aplicativo",
    ],
    formats: ["PDF", "JPG", "PNG"],
    faq: [
      {
        question: "Funciona no computador?",
        answer: "Sim, usando a webcam ou enviando fotos já tiradas.",
      },
      {
        question: "Como melhorar a legibilidade?",
        answer:
          "Use luz difusa (evite flash direto), apoie o papel sobre uma superfície escura e mantenha a câmera paralela à folha.",
      },
      {
        question: "As fotos são enviadas para a internet?",
        answer: "Não, o tratamento acontece no navegador.",
      },
    ],
    related: ["imagem-para-pdf", "pdf-signer", "ocr"],
  },
  {
    slug: "cores",
    name: "Extrator de Cores",
    title: "Extrair Cores de Imagem Online (HEX, RGB) | SOS01",
    description:
      "Envie uma imagem e descubra a paleta predominante com códigos HEX, RGB e HSL prontos para copiar. Grátis e direto no navegador.",
    h1: "Extrator de cores de imagem",
    keywords: ["extrair cores de imagem", "paleta de cores", "pegar cor hex", "color picker online"],
    category: "imagem",
    intro:
      "Ao montar um site, um post ou uma identidade visual, é comum querer as cores exatas de uma referência. O extrator agrupa os pixels da imagem enviada e devolve as cores dominantes com os códigos usados em design e programação.",
    steps: [
      "Envie a imagem de referência.",
      "Veja a paleta gerada com as cores predominantes.",
      "Copie o código HEX, RGB ou HSL da cor desejada.",
      "Aplique na sua arte, CSS ou apresentação.",
    ],
    features: [
      "Paleta automática das cores dominantes",
      "Códigos em HEX, RGB e HSL",
      "Cópia com um clique",
      "Análise local da imagem",
    ],
    formats: ["JPG", "PNG", "WEBP"],
    faq: [
      {
        question: "Quantas cores são extraídas?",
        answer: "A ferramenta destaca as tonalidades predominantes, agrupando variações próximas.",
      },
      {
        question: "Serve para criar identidade visual?",
        answer:
          "Serve como ponto de partida. Cores de marca costumam precisar de ajuste de contraste para acessibilidade.",
      },
      {
        question: "A imagem é enviada para o servidor?",
        answer: "Não, a leitura dos pixels é feita no seu navegador.",
      },
    ],
    related: ["removedor-de-fundo", "marca-dagua", "gerador-de-thumbnail"],
  },
  {
    slug: "idioma",
    name: "Detector de Idioma",
    title: "Detector de Idioma de Texto Online | SOS01",
    description:
      "Cole um texto e descubra em qual idioma ele está escrito, com o código ISO e o nível de confiança da detecção. Grátis.",
    h1: "Detector de idioma",
    keywords: ["detectar idioma", "qual idioma é esse texto", "identificar língua", "código iso idioma"],
    category: "texto",
    intro:
      "Útil quando você recebe um texto sem saber a origem, precisa configurar legendas ou definir o atributo de idioma de uma página. A detecção usa padrões de letras e palavras frequentes para estimar a língua e informar o código ISO correspondente.",
    steps: [
      "Cole o texto no campo (frases completas dão mais precisão).",
      "Veja o idioma detectado e o nível de confiança.",
      "Use o código ISO onde for necessário.",
      "Se quiser, traduza em seguida com o tradutor do SOS01.",
    ],
    features: [
      "Detecção instantânea",
      "Retorna o código ISO do idioma",
      "Indica o grau de confiança",
      "Funciona offline depois de carregada a página",
    ],
    faq: [
      {
        question: "Por que textos curtos erram?",
        answer:
          "Poucas palavras dão pouca evidência estatística. Use ao menos uma ou duas frases completas.",
      },
      {
        question: "Detecta idiomas parecidos, como português e espanhol?",
        answer:
          "Sim, na maioria dos casos, mas frases muito curtas com palavras comuns aos dois podem confundir.",
      },
      {
        question: "O texto é armazenado?",
        answer: "Não.",
      },
    ],
    related: ["tradutor", "resumidor", "ocr"],
  },
  {
    slug: "meu-ip",
    name: "Meu IP",
    title: "Qual é o Meu IP? Consulta Grátis | SOS01",
    description:
      "Descubra seu endereço IP público, provedor, localização aproximada e dados do navegador em uma única página. Consulta gratuita.",
    h1: "Qual é o meu IP",
    keywords: ["meu ip", "qual meu ip", "consultar ip", "ip público"],
    category: "internet",
    intro:
      "O IP público é o endereço que a sua conexão apresenta para os sites. Esta página mostra qual é o seu, junto do provedor, da localização aproximada e das informações que o navegador expõe — útil para conferir se uma VPN está ativa ou para configurar acessos remotos.",
    steps: [
      "Abra a página: a consulta é feita automaticamente.",
      "Confira o IP, o provedor e a região identificada.",
      "Compare com e sem VPN para validar a conexão.",
      "Copie o endereço quando precisar liberá-lo em algum sistema.",
    ],
    features: [
      "IP público exibido na hora",
      "Provedor e localização aproximada",
      "Informações do navegador e do dispositivo",
      "Sem cadastro",
    ],
    faq: [
      {
        question: "A localização exibida é exata?",
        answer:
          "Não. Ela vem da base do provedor e costuma apontar a cidade da operadora, não o seu endereço.",
      },
      {
        question: "Meu IP muda?",
        answer:
          "Na maioria das conexões residenciais sim, o IP é dinâmico e pode mudar ao reiniciar o roteador.",
      },
      {
        question: "Vocês guardam meu IP?",
        answer: "A consulta é apenas exibida na tela, não mantemos um cadastro de consultas.",
      },
    ],
    related: ["velocidade", "encurtador-de-url", "gerador-de-senha"],
  },
  {
    slug: "velocidade",
    name: "Teste de Velocidade",
    title: "Teste de Velocidade da Internet Grátis | SOS01",
    description:
      "Meça download, upload, ping e jitter da sua conexão direto no navegador, sem instalar nada. Teste gratuito e ilimitado.",
    h1: "Teste de velocidade da internet",
    keywords: ["teste de velocidade", "medir internet", "speed test", "velocidade da internet"],
    category: "internet",
    intro:
      "O teste mede quanto sua conexão consegue baixar e enviar por segundo, além da latência (ping) e da variação dela (jitter) — os números que realmente importam para chamadas de vídeo e jogos online. O resultado varia conforme o Wi-Fi, o horário e o aparelho usado.",
    steps: [
      "Feche downloads e streamings antes de medir.",
      "De preferência, conecte por cabo ou fique perto do roteador.",
      "Inicie o teste e aguarde a medição completa.",
      "Repita em horários diferentes para ter uma média confiável.",
    ],
    features: [
      "Mede download, upload, ping e jitter",
      "Roda no navegador, sem aplicativo",
      "Testes ilimitados",
      "Funciona no celular e no computador",
    ],
    faq: [
      {
        question: "Por que o resultado é menor que o contratado?",
        answer:
          "Wi-Fi, distância do roteador, aparelhos conectados e horário de pico reduzem a velocidade real. Teste por cabo para se aproximar do contratado.",
      },
      {
        question: "O que é um bom ping?",
        answer:
          "Abaixo de 30 ms é ótimo para jogos e chamadas; acima de 100 ms começa a atrapalhar a interação em tempo real.",
      },
      {
        question: "O teste consome franquia de dados?",
        answer: "Sim, ele transfere dados reais. No plano móvel, prefira testar no Wi-Fi.",
      },
    ],
    related: ["meu-ip", "encurtador-de-url", "gerador-qrcode"],
  },
];

export const TOOLS_SEO_BY_SLUG: Record<string, ToolSeo> = Object.fromEntries(
  TOOLS_SEO.map((t) => [t.slug, t]),
);

export const getToolSeo = (slug: string): ToolSeo | undefined => TOOLS_SEO_BY_SLUG[slug];

/** Slugs das ferramentas premium (páginas próprias, indexáveis). */
export const PREMIUM_TOOL_SLUGS = [
  "ocr",
  "tts",
  "stt",
  "pdf-signer",
  "scanner",
  "cores",
  "idioma",
  "meu-ip",
  "velocidade",
] as const;

export const isPremiumTool = (slug: string) =>
  (PREMIUM_TOOL_SLUGS as readonly string[]).includes(slug);

export const PREMIUM_TOOLS_SEO = TOOLS_SEO.filter((t) => isPremiumTool(t.slug));

export const toolPath = (slug: string) => `/ferramenta/${slug}`;
export const categoryPath = (id: string) => `/categoria/${id}`;

export const toolsByCategory = (id: ToolCategoryId) =>
  TOOLS_SEO.filter((t) => t.category === id);

/** Links internos: ferramentas relacionadas com fallback dentro da mesma categoria. */
export function relatedToolsFor(slug: string, limit = 4): ToolSeo[] {
  const tool = getToolSeo(slug);
  if (!tool) return TOOLS_SEO.slice(0, limit);
  const picked = tool.related
    .map((s) => TOOLS_SEO_BY_SLUG[s])
    .filter((t): t is ToolSeo => Boolean(t));
  for (const candidate of toolsByCategory(tool.category)) {
    if (picked.length >= limit) break;
    if (candidate.slug !== slug && !picked.some((p) => p.slug === candidate.slug)) {
      picked.push(candidate);
    }
  }
  return picked.slice(0, limit);
}
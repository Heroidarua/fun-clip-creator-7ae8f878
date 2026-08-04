/* from flask import Flask, request, send_file, jsonify
import subprocess
import os
import uuid

app = Flask(__name__)
DOWNLOAD_DIR = "downloads"

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL é obrigatória"}), 400
    
    try:
        video_id = str(uuid.uuid4())[:8]
        filename = f"{video_id}.mp4"
        filepath = os.path.join(DOWNLOAD_DIR, filename)
        
        os.makedirs(DOWNLOAD_DIR, exist_ok=True)
        
        cmd = ["youtube-dl", "-f", "best[ext=mp4]", "-o", filepath, url]
        subprocess.run(cmd, check=True)
        
        return jsonify({"url": f"/api/download/{filename}"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download/<filename>')
def serve_file(filename):
    filepath = os.path.join(DOWNLOAD_DIR, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Arquivo não encontrado"}), 404
    return send_file(filepath, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000) */
import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildSeo, SITE } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    buildSeo({
      path: "/",
      title: "SOS01.com.br — Baixar vídeos sem marca d'água, jogos retrô e ferramentas grátis",
      description:
        "No SOS01.com.br você baixa vídeos do TikTok, YouTube, Instagram, Kwai, Facebook e Pinterest sem marca d'água. Explore jogos retrô, utilitários com IA e muito mais — 100% grátis.",
      keywords: [
        "sos01.com.br",
        "baixar vídeo tiktok sem marca d'água sos01",
        "baixar vídeo instagram sos01",
        "baixar vídeo youtube sos01",
        "sos01 downloader online grátis",
        "jogos retrô sos01",
      ],
      faq: [
        {
          question: "O que é o SOS01?",
          answer:
            "O SOS01.com.br é uma plataforma 100% gratuita de utilidades digitais: downloaders de vídeo, biblioteca de quadrinhos, jogos retrô e utilitários com IA, sem cadastro e sem custos.",
        },
        {
          question: "É realmente grátis?",
          answer:
            "Sim. Todas as ferramentas do sos01.com.br são gratuitas, sem cadastro, sem período de teste e sem cobrança.",
        },
        {
          question: "Preciso instalar algum aplicativo?",
          answer:
            "Não. Tudo no sos01.com.br funciona direto no navegador, em celular, tablet ou computador.",
        },
        {
          question: "O SOS01 armazena os conteúdos baixados?",
          answer:
            "Não. O sos01.com.br atua apenas como interface técnica para acessar conteúdos públicos de terceiros.",
        },
      ],
      schema: [
        {
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE.url}/ferramentas?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "SoftwareApplication",
          name: "SOS01",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          url: SITE.url,
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        },
      ],
    }),
});

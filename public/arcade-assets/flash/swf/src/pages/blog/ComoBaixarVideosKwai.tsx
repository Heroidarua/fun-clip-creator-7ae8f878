import React from "react";
import { Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Download, Smartphone, CheckCircle, Zap } from "lucide-react";

const ComoBaixarVideosKwai = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-10 text-base leading-relaxed">
        <Link
          to="/blog"
          className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Blog
        </Link>

        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            Como Baixar Vídeos do Kwai Sem Marca d'Água
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Publicado em 15 de Janeiro de 2025 • Atualizado recentemente
          </p>

          <p className="text-foreground mb-6">
            O Kwai é uma das plataformas de vídeos curtos que mais cresce no Brasil. 
            Com o sos01, você pode baixar seus vídeos favoritos do Kwai de forma 
            rápida e gratuita, sem marcas d'água e em alta qualidade.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary" />
            O que é o Kwai?
          </h2>
          
          <p className="text-foreground mb-6">
            O Kwai é uma plataforma de vídeos curtos muito popular no Brasil, conhecida por 
            seu conteúdo diversificado que inclui humor, música, dança, tutoriais e muito mais. 
            A plataforma permite que criadores de conteúdo compartilhem vídeos de até 60 segundos 
            e até monetizem suas criações.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Como baixar vídeos do Kwai
          </h2>
          
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <ol className="list-decimal list-inside text-foreground space-y-4">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">1.</span>
                <span>Abra o aplicativo Kwai e encontre o vídeo que deseja baixar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">2.</span>
                <span>Toque em "Compartilhar" e depois em "Copiar link"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">3.</span>
                <span>Acesse o sos01 e clique na aba "Kwai"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">4.</span>
                <span>Cole o link no campo indicado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">5.</span>
                <span>Clique em "BAIXAR" e pronto!</span>
              </li>
            </ol>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Recursos do Download Kwai
          </h2>
          
          <ul className="list-disc list-inside text-foreground mb-6 space-y-2">
            <li>Suporte a links curtos e longos do Kwai</li>
            <li>Expansão automática de URLs encurtadas</li>
            <li>Download sem marca d'água</li>
            <li>Alta qualidade de vídeo preservada</li>
            <li>Processamento rápido em segundos</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            Por que usar o sos01 para Kwai?
          </h2>
          
          <div className="grid gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">✅ Sem Marca d'Água</h4>
              <p className="text-muted-foreground text-sm">
                Baixe vídeos limpos, sem o logo do Kwai sobreposto.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">✅ 100% Gratuito</h4>
              <p className="text-muted-foreground text-sm">
                Sem custos, sem assinaturas, sem pegadinhas.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">✅ Funciona no Celular</h4>
              <p className="text-muted-foreground text-sm">
                Interface otimizada para uso em smartphones e tablets.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">✅ Sem Cadastro</h4>
              <p className="text-muted-foreground text-sm">
                Use imediatamente sem criar conta ou fornecer dados.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              💡 Dica
            </h3>
            <p className="text-foreground text-sm">
              O sos01 também suporta downloads do TikTok, Instagram e YouTube! 
              Use a mesma ferramenta para todas as suas plataformas favoritas.
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Comece a Baixar Agora!
            </h3>
            <p className="text-foreground mb-4">
              Acesse o sos01 e baixe seus vídeos favoritos do Kwai em segundos.
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ir para o sos01
            </Link>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComoBaixarVideosKwai;

import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, Info } from "lucide-react";

export const Route = createFileRoute("/feedback/regras")({
  component: CommunityRules,
});

function CommunityRules() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-display">Regras da Comunidade</h1>
          <p className="text-muted-foreground">O ambiente do SOS01 deve ser seguro e amigável para todos.</p>
        </div>
      </div>

      <div className="space-y-6">
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <span className="text-primary">01.</span> Respeito Mútuo
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Não toleramos qualquer forma de discurso de ódio, assédio, bullying ou discriminação baseada em raça, gênero, orientação sexual, religião ou nacionalidade.
          </p>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <span className="text-primary">02.</span> Conteúdo Proibido
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            É proibido publicar conteúdo pornográfico, violência explícita, apologia a crimes, drogas ou atividades ilegais. Publicações desse tipo serão removidas imediatamente e o usuário banido.
          </p>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <span className="text-primary">03.</span> Spam e Fraudes
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Não utilize a comunidade para divulgar links suspeitos, golpes, pirâmides financeiras ou spam massivo. Divulgação de produtos/serviços deve ser feita de forma moderada e nos canais apropriados.
          </p>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl flex items-center gap-2">
            <span className="text-primary">04.</span> Privacidade
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nunca publique informações privadas de terceiros (Doxing). Respeite a privacidade alheia como gostaria que respeitassem a sua.
          </p>
        </section>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4">
          <Info className="text-primary shrink-0" size={24} />
          <div className="space-y-2">
            <p className="text-sm font-bold text-primary uppercase tracking-widest">Sistema de Moderação</p>
            <p className="text-sm leading-relaxed">
              O descumprimento destas regras pode resultar na remoção do conteúdo, suspensão temporária ou banimento permanente da sua conta.
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <Link to="/comunidade" className="btn-3d px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm">
            EU ENTENDO, VOLTAR AO FEED
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Loader2, ShoppingBag, X, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Product = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  type: string;
  price: { amount: number; currency: string; text: string } | null;
  available: number | null;
  sold: number;
  requirements: { customerEmail?: boolean; quantityFixed?: number; [k: string]: unknown };
  category: string;
};

const CATEGORIES = ["Todos", "IA", "Streaming", "Softwares", "Outros"] as const;

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/canboso");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Não foi possível carregar o catálogo.");
  return data.products ?? [];
}

const DigitalHavenStore = () => {
  const [data, setData] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchProducts()
      .then(setData)
      .catch((e: Error) => setError(e))
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todos");
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (p) => (category === "Todos" || p.category === category) && (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [data, query, category]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Loja parceira</p>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground">Digital Haven Store</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Assinaturas de IA, streaming e softwares com garantia. Cada produto mostra como é feita a ativação.
          </p>
        </header>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto (ex.: Canva, Gemini, Netflix)"
              className="w-full pl-9 pr-3 py-3 rounded-xl border-2 border-border bg-card text-foreground focus:border-primary outline-none"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-bold whitespace-nowrap transition-colors ${
                  category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Carregando catálogo...
          </div>
        )}
        {error && (
          <div className="rounded-xl border-2 border-destructive/40 bg-destructive/10 p-6 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-destructive mb-2" />
            <p className="text-foreground font-bold">{(error as Error).message}</p>
            <button onClick={() => refetch()} className="mt-3 text-sm font-bold text-primary underline">Tentar novamente</button>
          </div>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">Nenhum produto encontrado com esses filtros.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="text-left rounded-2xl border-2 border-border bg-card p-4 hover:border-primary transition-colors flex flex-col"
            >
              <div className="flex items-start gap-3">
                {p.image && <img src={p.image} alt={p.name} loading="lazy" width={48} height={48} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary">{p.category}</span>
                  <h2 className="font-bold text-foreground leading-tight line-clamp-2">{p.name}</h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 line-clamp-3 flex-1">{p.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-foreground">{p.price?.text ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{p.sold} vendidos</span>
              </div>
            </button>
          ))}
        </div>
      </main>
      <Footer />
      {selected && <OrderModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const needsEmail = Boolean(product.requirements.customerEmail);
  const fixedQty = typeof product.requirements.quantityFixed === "number" ? product.requirements.quantityFixed : null;
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(fixedQty ?? 1);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "ok" | "error"; msg?: string }>({ type: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading" });
    try {
      const res = await fetch("/api/canboso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity, customerEmail: needsEmail ? email : undefined, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "A compra não pôde ser concluída.");
      setStatus({ type: "ok", msg: "Pedido realizado com sucesso! A ativação seguirá as instruções do produto." });
    } catch (err) {
      setStatus({ type: "error", msg: (err as Error).message });
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-border bg-card p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl text-foreground">{product.name}</h2>
          <button onClick={onClose} aria-label="Fechar" className="p-1 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-2xl font-bold text-primary mt-2">{product.price?.text}</p>
        <div className="mt-4 rounded-xl bg-muted/50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground mb-2"><ShieldCheck className="w-4 h-4 text-primary" /> Garantia e ativação</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description || "Sem detalhes adicionais."}</p>
        </div>

        {status.type === "ok" ? (
          <p className="mt-5 rounded-xl border-2 border-primary/40 bg-primary/10 p-4 text-foreground font-bold">{status.msg}</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            {needsEmail && (
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail para ativação"
                className="w-full px-3 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary outline-none" />
            )}
            {!fixedQty && (
              <input type="number" min={1} max={50} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} aria-label="Quantidade"
                className="w-full px-3 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary outline-none" />
            )}
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha de administrador" autoComplete="current-password"
              className="w-full px-3 py-3 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary outline-none" />
            <p className="text-xs text-muted-foreground">Compras usam o saldo da loja e só podem ser confirmadas pelo administrador.</p>
            {status.type === "error" && <p className="text-sm font-bold text-destructive">{status.msg}</p>}
            <button type="submit" disabled={status.type === "loading"}
              className="btn-3d w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-60">
              {status.type === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
              Confirmar pedido
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default DigitalHavenStore;

import { useState, useEffect } from "react";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { rpcCall } from "@/integrations/supabase/helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, UserPlus, Gift, Sparkles } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as Record<string, string>;

  const referralCode = searchParams?.ref || null;
  const redirectTo = (searchParams?.redirect as string) || "/dashboard";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' && referralCode) {
          try {
            await rpcCall('process_referral', {
              referrer_code: referralCode,
              new_user_id: session.user.id
            });
          } catch (err) {
            console.error('Error processing referral:', err);
          }
        }
        navigate({ to: redirectTo });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate({ to: redirectTo });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, referralCode, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Login realizado com sucesso!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (err) {
      toast.error("Erro ao processar requisição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Soft ambient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        <div className="bg-card border border-border rounded-2xl shadow-[0_10px_40px_-12px_hsl(217_60%_30%/0.18)] p-8">
          {referralCode && !isLogin && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
              <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm text-emerald-700 font-medium">Você foi indicado!</p>
                <p className="text-xs text-emerald-700/80">Crie sua conta gratuitamente.</p>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Entre para acessar seu painel"
                : "É grátis e leva menos de um minuto"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 h-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/80">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-medium gap-2"
            >
              {loading ? (
                "Processando..."
              ) : isLogin ? (
                <><LogIn className="w-4 h-4" /> Entrar</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Criar conta grátis</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Cadastre-se" : "Entrar"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao continuar, você concorda com os{" "}
          <Link to="/termos" className="underline hover:text-foreground">termos</Link>
          {" "}e a{" "}
          <Link to="/privacidade" className="underline hover:text-foreground">política de privacidade</Link>.
        </p>
      </div>
    </div>
  );
};

export default Auth;

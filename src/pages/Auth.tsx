import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { rpcCall } from "@/integrations/supabase/helpers";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, UserPlus, Gift } from "lucide-react";
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
        navigate({ to: "/" });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate({ to: "/" });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, referralCode]);

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
            emailRedirectTo: `${window.location.origin}/`
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
        toast.success("Conta criada com sucesso!");
      }
    } catch (err) {
      toast.error("Erro ao processar requisição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-pixel text-[10px]"
        >
          <ArrowLeft className="w-4 h-4" />
          VOLTAR
        </button>

        <div className="bg-card border-4 border-primary/50 p-8">
          {referralCode && !isLogin && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <Gift className="w-6 h-6 text-green-400 shrink-0" />
              <div>
                <p className="text-sm text-green-400 font-medium">Você foi indicado!</p>
                <p className="text-xs text-muted-foreground">Crie sua conta para ajudar seu amigo a ganhar conquistas.</p>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="font-pixel text-xl text-primary neon-text mb-2">
              {isLogin ? "🔐 LOGIN" : "📝 CADASTRO"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin 
                ? "Entre para acessar conteúdo exclusivo" 
                : "Crie sua conta para continuar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-pixel text-[10px] text-muted-foreground">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 border-2 border-primary/30 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-pixel text-[10px] text-muted-foreground">SENHA</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 border-2 border-primary/30 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-pixel text-xs border-4 border-primary hover:bg-primary/80 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                "PROCESSANDO..."
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  ENTRAR
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  CRIAR CONTA
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              {isLogin ? (
                <>Não tem conta? <span className="text-primary font-semibold">Cadastre-se</span></>
              ) : (
                <>Já tem conta? <span className="text-primary font-semibold">Entre aqui</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

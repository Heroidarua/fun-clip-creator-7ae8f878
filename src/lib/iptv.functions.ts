import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Credenciais reais (não exportadas para o cliente)
const IPTV_CREDENTIALS = {
  login: "sos01.com.br",
  senha: "19601525488",
  url: "https://wplayer.link/"
};

// Configurações do jogo
const SPIN_LIMIT = 3; // Limite de 3 tentativas por dia
const WIN_CHANCE = 0.1; // 10% de chance de ganhar

export const spinRoulette = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ sessionId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { sessionId } = data;

    // 1. Verificar tentativas existentes
    const { count, error: countError } = await supabaseAdmin
      .from("iptv_spin_results")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    if (countError) throw new Error("Erro ao verificar tentativas");
    
    if (count !== null && count >= SPIN_LIMIT) {
      return { 
        success: false, 
        message: "Limite de tentativas atingido para hoje!",
        outOfSpins: true 
      };
    }

    // 2. Realizar sorteio
    const isWinner = Math.random() < WIN_CHANCE;
    
    const outcomes = [
      { label: "🍀 QUASE!", won: false },
      { label: "😅 NÃO FOI DESSA VEZ", won: false },
      { label: "🎁 TENTE NOVAMENTE", won: false },
      { label: "🔐 BLOQUEADO", won: false },
      { label: "⭐ QUASE!", won: false },
      { label: "⚡ TENTE NOVAMENTE", won: false },
      { label: "🔥 ACESSO!", won: true },
      { label: "🍀 MAIS UMA CHANCE", won: false },
    ];

    // Se ganhou, força parar no ACESSO!
    // Caso contrário, escolhe um que não seja ACESSO!
    let selectedOutcome;
    if (isWinner) {
      selectedOutcome = outcomes.find(o => o.won) || outcomes[0];
    } else {
      const losers = outcomes.filter(o => !o.won);
      selectedOutcome = losers[Math.floor(Math.random() * losers.length)];
    }

    const outcomeIndex = outcomes.indexOf(selectedOutcome);

    // 3. Registrar resultado
    const { error: insertError } = await supabaseAdmin
      .from("iptv_spin_results")
      .insert({
        session_id: sessionId,
        outcome: selectedOutcome.label,
        won: selectedOutcome.won
      });

    if (insertError) throw new Error("Erro ao registrar tentativa");

    // 4. Retornar resultado (e credenciais se ganhou)
    return {
      success: true,
      won: selectedOutcome.won,
      outcomeIndex,
      outcomeLabel: selectedOutcome.label,
      credentials: selectedOutcome.won ? IPTV_CREDENTIALS : null,
      spinsLeft: SPIN_LIMIT - (count || 0) - 1
    };
  });

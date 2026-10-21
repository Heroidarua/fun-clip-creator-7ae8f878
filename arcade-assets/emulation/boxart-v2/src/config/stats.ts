/**
 * Fonte única dos números exibidos no site.
 * Evita divergências entre home, carrossel, rodapé e estatísticas.
 */
import { games } from "@/data/games";

/** Total real de jogos disponíveis no catálogo. */
export const TOTAL_GAMES = games.length;

/** Quantos jogos aparecem na home (o resto fica em "Ver todos os jogos"). */
export const HOME_GAMES_PREVIEW = 12;

/** Avaliação média exibida — um único valor em todo o site. */
export const SITE_RATING = 4.9;

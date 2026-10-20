/**
 * Catálogo Arcade — coleção parceiro WASM Arcade (wasmarcade.com).
 * Gerado em 2026-10-20 a partir do sitemap + JSON-LD (VideoGame) de cada página.
 * Os assets (SWF, capas e builds WASM) continuam hospedados no servidor do parceiro;
 * este arquivo referencia apenas metadados e caminhos dos assets.
 * Os jogos pertencem aos seus respectivos detentores de direitos autorais.
 */
export type ArcadeSystem = "pc" | "neogeo" | "capcom" | "arcade" | "flash";

export interface ArcadeGame {
  id: string;
  title: string;
  system: ArcadeSystem;
  url: string;
  thumb: string;
  swf?: string;
  year?: string;
  desc?: string;
  tags?: string[];
}

export const ARCADE_SOURCE = "https://wasmarcade.com";

export const SYSTEM_ORDER: ArcadeSystem[] = ["pc", "neogeo", "capcom", "arcade", "flash"];

export const SYSTEM_META: Record<ArcadeSystem, { label: string; hint: string }> = {
  pc: { label: "PC (WASM)", hint: "Full 3D rodando no navegador" },
  neogeo: { label: "Neo Geo", hint: "SNK: lutas e run-and-gun" },
  capcom: { label: "Capcom", hint: "Street Fighter, Final Fight, Darkstalkers" },
  arcade: { label: "Clássicos", hint: "Sega, Midway, Taito e cia." },
  flash: { label: "Flash", hint: "Clássicos de browser no Ruffle" },
};

export const ARCADE_GAMES: ArcadeGame[] = [

];

const _counts: Record<ArcadeSystem | "all", number> = {
  all: ARCADE_GAMES.length,
  pc: 0, neogeo: 0, capcom: 0, arcade: 0, flash: 0,
};
for (const g of ARCADE_GAMES) _counts[g.system] += 1;
export const ARCADE_COUNTS = _counts;

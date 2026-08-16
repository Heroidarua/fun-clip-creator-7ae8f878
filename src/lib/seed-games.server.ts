import { games } from "@/data/games";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function categoryOf(title: string): string {
  const t = title.toLowerCase();
  if (/(kombat|fighter|tekken|smash|vs\.|vs |kof|jojo|chaos)/.test(t)) return "Luta";
  if (/(mario|sonic|kong|bomberman|kidd|mickey|donald|dizzy|picapau|monica|pocahontas|luigi|yoshi|rockman)/.test(t)) return "Plataforma";
  if (/(kart|top gear|gp rider|rider)/.test(t)) return "Corrida";
  if (/(1941|asteroids|duck hunt|battle city|popeye)/.test(t)) return "Tiro";
  if (/(metal slug|spider|mask|power rangers|x-men|simpsons|alien|justice|dragonball|flintstones|saga|gta|theft)/.test(t)) return "Ação";
  return "Arcade";
}

export async function seedGames() {
  console.log(`Starting seed for ${games.length} games...`);
  
  // Chunking to avoid large request payload limits
  const CHUNK_SIZE = 100;
  for (let i = 0; i < games.length; i += CHUNK_SIZE) {
    const chunk = games.slice(i, i + CHUNK_SIZE).map(g => ({
      external_id: g.id,
      title: g.title,
      platform: g.platform,
      src: g.src,
      img: g.img,
      category: categoryOf(g.title)
    }));

    const { error } = await supabaseAdmin
      .from('games')
      .upsert(chunk, { onConflict: 'external_id' });

    if (error) {
      console.error(`Error seeding chunk ${i / CHUNK_SIZE}:`, error);
    } else {
      console.log(`Seeded games ${i} to ${Math.min(i + CHUNK_SIZE, games.length)}`);
    }
  }
  
  console.log("Seeding complete.");
}

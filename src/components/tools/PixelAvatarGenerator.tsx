import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Download, RefreshCw, Sparkles, User, Bot, Ghost, Cat, Rocket, Share2, Copy, Trash2, Image, X, Mail, MessageCircle, Palette, Shirt, Scissors, Move, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { useAvatarGallery } from "@/hooks/useAvatarGallery";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const loadingMessages = [
  "🎨 Preparando pixels...",
  "🖌️ Desenhando contornos...",
  "🌈 Aplicando cores...",
  "✨ Adicionando brilho...",
  "🎮 Finalizando avatar...",
];

// Character templates with pre-configured settings
const characterTemplates = [
  // Games
  { id: "mario", name: "Mario", emoji: "🍄", category: "games", style: "human", color: "red", accessory: "cap", expression: "happy", artStyle: "pixel", pose: "jumping", outfit: "casual", hairStyle: "short", customPrompt: "Super Mario Bros character with red cap letter M, blue overalls, brown mustache, Italian plumber" },
  { id: "luigi", name: "Luigi", emoji: "💚", category: "games", style: "human", color: "green", accessory: "cap", expression: "scared", artStyle: "pixel", pose: "waving", outfit: "casual", hairStyle: "short", customPrompt: "Luigi from Super Mario Bros with green cap letter L, blue overalls, tall and thin, brown mustache" },
  { id: "sonic", name: "Sonic", emoji: "💙", category: "games", style: "animal", color: "blue", accessory: "none", expression: "cool", artStyle: "pixel", pose: "action", outfit: "sporty", hairStyle: "spiky", customPrompt: "Sonic the Hedgehog blue spiky hedgehog with red shoes, white gloves, fast running pose" },
  { id: "link", name: "Link", emoji: "⚔️", category: "games", style: "elf", color: "green", accessory: "shield", expression: "cool", artStyle: "pixel", pose: "action", outfit: "medieval", hairStyle: "long", customPrompt: "Link from Zelda with green tunic, pointy ears, blonde hair, Master Sword and Hylian Shield" },
  { id: "pikachu", name: "Pikachu", emoji: "⚡", category: "games", style: "animal", color: "yellow", accessory: "none", expression: "happy", artStyle: "pixel", pose: "waving", outfit: "casual", hairStyle: "short", customPrompt: "Pikachu yellow electric mouse Pokemon with red cheeks, pointy ears, lightning bolt tail" },
  { id: "kirby", name: "Kirby", emoji: "🩷", category: "games", style: "monster", color: "pink", accessory: "none", expression: "happy", artStyle: "pixel", pose: "front", outfit: "casual", hairStyle: "bald", customPrompt: "Kirby pink round puffball character with cute face, red shoes, floating" },
  { id: "pacman", name: "Pac-Man", emoji: "🟡", category: "games", style: "monster", color: "yellow", accessory: "none", expression: "happy", artStyle: "pixel", pose: "action", outfit: "casual", hairStyle: "bald", customPrompt: "Pac-Man classic yellow circular arcade character with open mouth eating dots" },
  { id: "megaman", name: "Mega Man", emoji: "🔵", category: "games", style: "robot", color: "blue", accessory: "none", expression: "cool", artStyle: "pixel", pose: "action", outfit: "armor", hairStyle: "short", customPrompt: "Mega Man blue robot armor with arm cannon, blue helmet, determined expression" },
  { id: "steve", name: "Steve", emoji: "⛏️", category: "games", style: "human", color: "blue", accessory: "none", expression: "happy", artStyle: "pixel", pose: "front", outfit: "casual", hairStyle: "short", customPrompt: "Steve from Minecraft blocky pixelated character with blue shirt, dark hair, holding pickaxe" },
  { id: "creeper", name: "Creeper", emoji: "💥", category: "games", style: "monster", color: "green", accessory: "none", expression: "sad", artStyle: "pixel", pose: "front", outfit: "casual", hairStyle: "bald", customPrompt: "Minecraft Creeper green blocky monster with sad face about to explode" },
  { id: "kratos", name: "Kratos", emoji: "🪓", category: "games", style: "human", color: "white", accessory: "beard", expression: "angry", artStyle: "realistic", pose: "action", outfit: "armor", hairStyle: "bald", customPrompt: "Kratos from God of War with red tattoo, bald head, full beard, Leviathan axe, Spartan warrior" },
  { id: "masterchief", name: "Master Chief", emoji: "🎖️", category: "games", style: "robot", color: "green", accessory: "none", expression: "cool", artStyle: "realistic", pose: "action", outfit: "armor", hairStyle: "bald", customPrompt: "Master Chief from Halo green Spartan armor, golden visor helmet, assault rifle" },
  
  // Anime
  { id: "goku", name: "Goku", emoji: "🐉", category: "anime", style: "human", color: "orange", accessory: "none", expression: "cool", artStyle: "anime", pose: "action", outfit: "sporty", hairStyle: "spiky", customPrompt: "Goku from Dragon Ball Z with spiky black hair, orange gi martial arts uniform, Super Saiyan energy aura" },
  { id: "vegeta", name: "Vegeta", emoji: "👑", category: "anime", style: "human", color: "blue", accessory: "none", expression: "angry", artStyle: "anime", pose: "crossed_arms", outfit: "armor", hairStyle: "spiky", customPrompt: "Vegeta from Dragon Ball Z with spiky black hair, Saiyan armor, proud prince expression, power aura" },
  { id: "naruto", name: "Naruto", emoji: "🍥", category: "anime", style: "ninja", color: "orange", accessory: "bandana", expression: "happy", artStyle: "anime", pose: "action", outfit: "sporty", hairStyle: "spiky", customPrompt: "Naruto Uzumaki with blonde spiky hair, orange ninja outfit, blue headband with leaf symbol, whisker marks on face" },
  { id: "sasuke", name: "Sasuke", emoji: "⚡", category: "anime", style: "ninja", color: "blue", accessory: "none", expression: "cool", artStyle: "anime", pose: "action", outfit: "traditional", hairStyle: "spiky", customPrompt: "Sasuke Uchiha with black spiky hair, Sharingan red eyes, dark outfit, serious expression" },
  { id: "luffy", name: "Luffy", emoji: "🏴‍☠️", category: "anime", style: "pirate", color: "red", accessory: "hat", expression: "laugh", artStyle: "anime", pose: "action", outfit: "casual", hairStyle: "messy", customPrompt: "Monkey D. Luffy from One Piece with straw hat, red vest, scar under eye, rubber stretching powers" },
  { id: "zoro", name: "Zoro", emoji: "⚔️", category: "anime", style: "samurai", color: "green", accessory: "bandana", expression: "cool", artStyle: "anime", pose: "action", outfit: "casual", hairStyle: "short", customPrompt: "Roronoa Zoro from One Piece with green hair, three swords, scar on eye, muscular swordsman" },
  { id: "tanjiro", name: "Tanjiro", emoji: "🔥", category: "anime", style: "samurai", color: "green", accessory: "earrings", expression: "cool", artStyle: "anime", pose: "action", outfit: "traditional", hairStyle: "short", customPrompt: "Tanjiro Kamado from Demon Slayer with checkered green haori, hanafuda earrings, scar on forehead, water breathing" },
  { id: "eren", name: "Eren", emoji: "🔥", category: "anime", style: "human", color: "green", accessory: "none", expression: "angry", artStyle: "anime", pose: "action", outfit: "armor", hairStyle: "long", customPrompt: "Eren Yeager from Attack on Titan with long brown hair, Survey Corps uniform, titan transformation" },
  { id: "levi", name: "Levi", emoji: "🗡️", category: "anime", style: "human", color: "black", accessory: "scarf", expression: "angry", artStyle: "anime", pose: "action", outfit: "armor", hairStyle: "undercut", customPrompt: "Levi Ackerman from Attack on Titan with Survey Corps uniform, ODM gear, serious expression, short black hair" },
  { id: "saitama", name: "Saitama", emoji: "👊", category: "anime", style: "superhero", color: "yellow", accessory: "none", expression: "confused", artStyle: "anime", pose: "front", outfit: "suit", hairStyle: "bald", customPrompt: "Saitama from One Punch Man bald hero with yellow suit, red gloves, cape, expressionless face" },
  { id: "deku", name: "Deku", emoji: "💚", category: "anime", style: "superhero", color: "green", accessory: "none", expression: "happy", artStyle: "anime", pose: "action", outfit: "suit", hairStyle: "messy", customPrompt: "Izuku Midoriya Deku from My Hero Academia with green curly hair, hero costume, One For All power" },
  
  // DC Comics
  { id: "superman", name: "Superman", emoji: "🦸", category: "dc", style: "superhero", color: "blue", accessory: "none", expression: "cool", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "short", customPrompt: "Superman with blue suit, red cape, S symbol on chest, flying pose, strong heroic expression" },
  { id: "batman", name: "Batman", emoji: "🦇", category: "dc", style: "superhero", color: "black", accessory: "mask", expression: "angry", artStyle: "comic", pose: "crossed_arms", outfit: "armor", hairStyle: "short", customPrompt: "Batman dark knight with black cape and cowl, bat symbol on chest, serious expression, Gotham protector" },
  { id: "wonderwoman", name: "Wonder Woman", emoji: "⭐", category: "dc", style: "superhero", color: "red", accessory: "tiara", expression: "cool", artStyle: "comic", pose: "action", outfit: "armor", hairStyle: "long", customPrompt: "Wonder Woman Amazonian warrior with golden tiara, red and blue armor, lasso of truth, shield and sword" },
  { id: "flash", name: "Flash", emoji: "⚡", category: "dc", style: "superhero", color: "red", accessory: "mask", expression: "cool", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "short", customPrompt: "The Flash fastest man alive with red suit, yellow lightning bolt symbol, running at super speed" },
  { id: "aquaman", name: "Aquaman", emoji: "🔱", category: "dc", style: "superhero", color: "gold", accessory: "none", expression: "cool", artStyle: "comic", pose: "action", outfit: "armor", hairStyle: "long", customPrompt: "Aquaman king of Atlantis with golden armor, green pants, trident, long blonde hair, underwater powers" },
  { id: "greenlantern", name: "Green Lantern", emoji: "💚", category: "dc", style: "superhero", color: "green", accessory: "mask", expression: "cool", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "short", customPrompt: "Green Lantern with green power ring, black and green suit, glowing constructs, willpower hero" },
  { id: "cyborg", name: "Cyborg", emoji: "🤖", category: "dc", style: "robot", color: "blue", accessory: "none", expression: "cool", artStyle: "comic", pose: "action", outfit: "armor", hairStyle: "short", customPrompt: "Cyborg half human half machine hero with red eye, silver and blue armor, tech powers" },
  { id: "joker", name: "Joker", emoji: "🃏", category: "dc", style: "human", color: "purple", accessory: "none", expression: "crazy", artStyle: "comic", pose: "front", outfit: "suit", hairStyle: "messy", customPrompt: "The Joker Batman villain with green hair, white face, red lips smile, purple suit, chaotic clown prince" },
  { id: "harleyquinn", name: "Harley Quinn", emoji: "💕", category: "dc", style: "human", color: "pink", accessory: "none", expression: "crazy", artStyle: "comic", pose: "action", outfit: "casual", hairStyle: "pigtails", customPrompt: "Harley Quinn with blonde pigtails dyed red and blue, baseball bat, red and black outfit, mischievous" },
  { id: "supergirl", name: "Supergirl", emoji: "💪", category: "dc", style: "superhero", color: "blue", accessory: "none", expression: "happy", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "long", customPrompt: "Supergirl with blue suit, red cape, S symbol, blonde hair, flying pose, Kryptonian hero" },
  { id: "batgirl", name: "Batgirl", emoji: "🦇", category: "dc", style: "superhero", color: "purple", accessory: "mask", expression: "cool", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "long", customPrompt: "Batgirl with purple and yellow bat suit, cape, red hair, Gotham vigilante" },
  
  // Marvel Comics
  { id: "spiderman", name: "Spider-Man", emoji: "🕷️", category: "marvel", style: "superhero", color: "red", accessory: "mask", expression: "cool", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "short", customPrompt: "Spider-Man in red and blue suit with web pattern, white eyes, shooting web, swinging pose" },
  { id: "ironman", name: "Iron Man", emoji: "🤖", category: "marvel", style: "robot", color: "red", accessory: "none", expression: "cool", artStyle: "comic", pose: "action", outfit: "armor", hairStyle: "short", customPrompt: "Iron Man red and gold armor suit with glowing arc reactor, flying repulsor blasters" },
  { id: "captainamerica", name: "Captain America", emoji: "🛡️", category: "marvel", style: "superhero", color: "blue", accessory: "shield", expression: "cool", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "short", customPrompt: "Captain America with star shield, blue suit with white star, red white and blue patriotic hero" },
  { id: "thor", name: "Thor", emoji: "⚡", category: "marvel", style: "superhero", color: "blue", accessory: "none", expression: "cool", artStyle: "comic", pose: "action", outfit: "armor", hairStyle: "long", customPrompt: "Thor God of Thunder with Mjolnir hammer, red cape, blonde long hair, Asgardian armor, lightning" },
  { id: "hulk", name: "Hulk", emoji: "💪", category: "marvel", style: "monster", color: "green", accessory: "none", expression: "angry", artStyle: "comic", pose: "action", outfit: "casual", hairStyle: "messy", customPrompt: "Incredible Hulk giant green muscular monster with torn purple pants, angry smashing pose" },
  { id: "wolverine", name: "Wolverine", emoji: "🐺", category: "marvel", style: "superhero", color: "yellow", accessory: "none", expression: "angry", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "spiky", customPrompt: "Wolverine X-Men with yellow and blue suit, adamantium claws extended, wild hair, fierce expression" },
  { id: "deadpool", name: "Deadpool", emoji: "💀", category: "marvel", style: "superhero", color: "red", accessory: "mask", expression: "wink", artStyle: "comic", pose: "peace", outfit: "suit", hairStyle: "bald", customPrompt: "Deadpool red and black suit with dual katanas, merc with a mouth, breaking fourth wall pose" },
  { id: "blackpanther", name: "Black Panther", emoji: "🐆", category: "marvel", style: "superhero", color: "black", accessory: "mask", expression: "cool", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "short", customPrompt: "Black Panther Wakanda king with vibranium suit, purple accents, panther claws, African warrior" },
  { id: "doctorstrange", name: "Doctor Strange", emoji: "✨", category: "marvel", style: "wizard", color: "red", accessory: "none", expression: "cool", artStyle: "comic", pose: "action", outfit: "robe", hairStyle: "short", customPrompt: "Doctor Strange Sorcerer Supreme with red cloak of levitation, Eye of Agamotto, magic portals" },
  { id: "scarletwitch", name: "Scarlet Witch", emoji: "🔮", category: "marvel", style: "wizard", color: "red", accessory: "tiara", expression: "cool", artStyle: "comic", pose: "action", outfit: "dress", hairStyle: "long", customPrompt: "Scarlet Witch Wanda Maximoff with red chaos magic, scarlet costume, tiara, reality warping powers" },
  { id: "venom", name: "Venom", emoji: "👅", category: "marvel", style: "monster", color: "black", accessory: "none", expression: "angry", artStyle: "comic", pose: "action", outfit: "suit", hairStyle: "bald", customPrompt: "Venom symbiote with long tongue, white spider symbol, sharp teeth, muscular black alien" },
  { id: "thanos", name: "Thanos", emoji: "🧤", category: "marvel", style: "alien", color: "purple", accessory: "none", expression: "angry", artStyle: "comic", pose: "crossed_arms", outfit: "armor", hairStyle: "bald", customPrompt: "Thanos Mad Titan with purple skin, golden armor, Infinity Gauntlet, powerful cosmic villain" },
  { id: "groot", name: "Groot", emoji: "🌳", category: "marvel", style: "monster", color: "teal", accessory: "flower", expression: "happy", artStyle: "cartoon", pose: "waving", outfit: "casual", hairStyle: "short", customPrompt: "Baby Groot Guardians of the Galaxy small tree creature with cute big eyes, dancing, I am Groot" },
  { id: "rocket", name: "Rocket", emoji: "🦝", category: "marvel", style: "animal", color: "orange", accessory: "none", expression: "angry", artStyle: "cartoon", pose: "action", outfit: "sporty", hairStyle: "short", customPrompt: "Rocket Raccoon from Guardians of the Galaxy with big gun, snarky expression, tactical gear" },
  
  // Simpsons
  { id: "homer", name: "Homer", emoji: "🍩", category: "simpsons", style: "human", color: "yellow", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "bald", customPrompt: "Homer Simpson with yellow skin, bald head with two hairs, white shirt, blue pants, donut loving" },
  { id: "marge", name: "Marge", emoji: "💙", category: "simpsons", style: "human", color: "yellow", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "front", outfit: "dress", hairStyle: "elegant", customPrompt: "Marge Simpson with tall blue beehive hair, yellow skin, green dress, pearl necklace, loving mother" },
  { id: "bart", name: "Bart", emoji: "😈", category: "simpsons", style: "human", color: "yellow", accessory: "none", expression: "wink", artStyle: "cartoon", pose: "peace", outfit: "casual", hairStyle: "spiky", customPrompt: "Bart Simpson with yellow skin, spiky hair, red shirt, blue shorts, skateboard, mischievous troublemaker" },
  { id: "lisa", name: "Lisa", emoji: "🎷", category: "simpsons", style: "human", color: "yellow", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "front", outfit: "dress", hairStyle: "spiky", customPrompt: "Lisa Simpson with yellow skin, spiky hair, red dress, pearl necklace, saxophone, smart intellectual" },
  { id: "maggie", name: "Maggie", emoji: "🍼", category: "simpsons", style: "human", color: "yellow", accessory: "bow", expression: "happy", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "spiky", customPrompt: "Maggie Simpson baby with yellow skin, blue onesie, red bow, pacifier, cute toddler" },
  { id: "krusty", name: "Krusty", emoji: "🤡", category: "simpsons", style: "human", color: "yellow", accessory: "none", expression: "crazy", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "messy", customPrompt: "Krusty the Clown with green hair, red nose, big shoes, clown makeup, TV show host" },
  { id: "mrburns", name: "Mr. Burns", emoji: "💰", category: "simpsons", style: "human", color: "yellow", accessory: "none", expression: "angry", artStyle: "cartoon", pose: "front", outfit: "formal", hairStyle: "bald", customPrompt: "Mr. Burns evil billionaire with hunched posture, bald head, suit, excellent finger gesture" },
  { id: "moe", name: "Moe", emoji: "🍺", category: "simpsons", style: "human", color: "yellow", accessory: "none", expression: "sad", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "short", customPrompt: "Moe Szyslak bartender with ugly face, gray shirt, apron, prank call victim, Moe's Tavern" },
  
  // Movies/TV
  { id: "yoda", name: "Yoda", emoji: "✨", category: "movies", style: "alien", color: "green", accessory: "staff", expression: "thinking", artStyle: "cartoon", pose: "meditation", outfit: "robe", hairStyle: "bald", customPrompt: "Master Yoda Star Wars small green alien Jedi with big ears, wise expression, brown robe, lightsaber" },
  { id: "darth_vader", name: "Darth Vader", emoji: "⚫", category: "movies", style: "robot", color: "black", accessory: "mask", expression: "angry", artStyle: "cartoon", pose: "crossed_arms", outfit: "armor", hairStyle: "bald", customPrompt: "Darth Vader Star Wars black armor and cape, iconic helmet, red lightsaber, Sith Lord" },
  { id: "mandalorian", name: "Mandalorian", emoji: "🪖", category: "movies", style: "human", color: "blue", accessory: "mask", expression: "cool", artStyle: "cartoon", pose: "action", outfit: "armor", hairStyle: "bald", customPrompt: "The Mandalorian Din Djarin with beskar armor, T-visor helmet, blaster, bounty hunter, Baby Yoda" },
  { id: "elsa", name: "Elsa", emoji: "❄️", category: "movies", style: "princess", color: "cyan", accessory: "crown", expression: "cool", artStyle: "cartoon", pose: "front", outfit: "dress", hairStyle: "braids", customPrompt: "Elsa from Frozen ice queen with platinum blonde braid, blue ice dress, snowflake magic, Let It Go pose" },
  { id: "moana", name: "Moana", emoji: "🌊", category: "movies", style: "princess", color: "teal", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "action", outfit: "traditional", hairStyle: "long", customPrompt: "Moana Polynesian princess with long curly black hair, red and tan outfit, ocean voyager, Heart of Te Fiti" },
  { id: "shrek", name: "Shrek", emoji: "🧅", category: "movies", style: "monster", color: "green", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "bald", customPrompt: "Shrek green ogre with brown vest, trumpet ears, swamp dweller, layers like onions" },
  { id: "minion", name: "Minion", emoji: "🍌", category: "movies", style: "monster", color: "yellow", accessory: "glasses", expression: "happy", artStyle: "cartoon", pose: "waving", outfit: "casual", hairStyle: "short", customPrompt: "Minion yellow pill-shaped creature with goggles, blue overalls, banana loving, Despicable Me" },
  { id: "jackSparrow", name: "Jack Sparrow", emoji: "🏴‍☠️", category: "movies", style: "pirate", color: "black", accessory: "bandana", expression: "wink", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "braids", customPrompt: "Captain Jack Sparrow with bandana, dreadlocks, beads, eyeliner, Pirates of the Caribbean, rum" },
  
  // Classic Characters
  { id: "mickey", name: "Mickey Mouse", emoji: "🐭", category: "classic", style: "animal", color: "black", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "waving", outfit: "casual", hairStyle: "bald", customPrompt: "Mickey Mouse Disney character with round black ears, red shorts, white gloves, yellow shoes, cheerful" },
  { id: "donaldduck", name: "Donald Duck", emoji: "🦆", category: "classic", style: "animal", color: "blue", accessory: "hat", expression: "angry", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "bald", customPrompt: "Donald Duck with blue sailor hat, bow tie, white feathers, orange beak, angry quacking" },
  { id: "goofy", name: "Goofy", emoji: "🐕", category: "classic", style: "animal", color: "black", accessory: "hat", expression: "happy", artStyle: "cartoon", pose: "waving", outfit: "casual", hairStyle: "short", customPrompt: "Goofy Disney dog with orange hat, green shirt, big teeth, clumsy lovable, A-hyuck laugh" },
  { id: "bugsbunny", name: "Bugs Bunny", emoji: "🥕", category: "classic", style: "animal", color: "white", accessory: "none", expression: "wink", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "short", customPrompt: "Bugs Bunny gray rabbit with long ears, white gloves, carrot, What's up Doc, Looney Tunes" },
  { id: "daffyduck", name: "Daffy Duck", emoji: "🦆", category: "classic", style: "animal", color: "black", accessory: "none", expression: "angry", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "bald", customPrompt: "Daffy Duck black duck with orange beak, lisp speech, crazy personality, Looney Tunes rival to Bugs" },
  { id: "tweety", name: "Tweety", emoji: "🐤", category: "classic", style: "animal", color: "yellow", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "short", customPrompt: "Tweety Bird small yellow canary with big head, big eyes, I tawt I taw a puddy tat" },
  { id: "popeye", name: "Popeye", emoji: "💪", category: "classic", style: "human", color: "blue", accessory: "none", expression: "cool", artStyle: "cartoon", pose: "action", outfit: "casual", hairStyle: "bald", customPrompt: "Popeye the Sailor Man with big forearms, anchor tattoo, spinach can, pipe, squinting eye, sailor outfit" },
  { id: "tom", name: "Tom", emoji: "🐱", category: "classic", style: "animal", color: "blue", accessory: "none", expression: "angry", artStyle: "cartoon", pose: "action", outfit: "casual", hairStyle: "short", customPrompt: "Tom from Tom and Jerry blue-gray cat with white belly, mischievous expression, chasing pose" },
  { id: "jerry", name: "Jerry", emoji: "🐭", category: "classic", style: "animal", color: "orange", accessory: "none", expression: "wink", artStyle: "cartoon", pose: "action", outfit: "casual", hairStyle: "short", customPrompt: "Jerry from Tom and Jerry small brown mouse with big ears, clever expression, running from Tom" },
  { id: "scoobydoo", name: "Scooby-Doo", emoji: "🐕", category: "classic", style: "animal", color: "orange", accessory: "none", expression: "scared", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "short", customPrompt: "Scooby-Doo Great Dane with brown spots, blue collar, scared expression, Scooby snacks, mystery solving" },
  { id: "shaggy", name: "Shaggy", emoji: "🥪", category: "classic", style: "human", color: "green", accessory: "none", expression: "scared", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "messy", customPrompt: "Shaggy Rogers with messy brown hair, green shirt, scared coward, Scooby-Doo best friend, always hungry" },
  { id: "flintstones", name: "Fred Flintstone", emoji: "🪨", category: "classic", style: "human", color: "orange", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "short", customPrompt: "Fred Flintstone caveman with orange leopard print outfit, black hair, Yabba Dabba Doo, Bedrock" },
  { id: "spongebob", name: "SpongeBob", emoji: "🧽", category: "classic", style: "monster", color: "yellow", accessory: "none", expression: "happy", artStyle: "cartoon", pose: "waving", outfit: "formal", hairStyle: "short", customPrompt: "SpongeBob SquarePants yellow kitchen sponge with brown pants, red tie, Bikini Bottom, optimistic" },
  { id: "patrick", name: "Patrick", emoji: "⭐", category: "classic", style: "monster", color: "pink", accessory: "none", expression: "confused", artStyle: "cartoon", pose: "front", outfit: "casual", hairStyle: "bald", customPrompt: "Patrick Star pink starfish with green shorts, dumb but lovable, SpongeBob best friend, under a rock" },
];

const templateCategories = [
  { id: "games", name: "🎮 Games", description: "Personagens de videogames clássicos" },
  { id: "anime", name: "⚔️ Anime", description: "Personagens de animes populares" },
  { id: "dc", name: "🦇 DC Comics", description: "Heróis e vilões da DC" },
  { id: "marvel", name: "🕷️ Marvel", description: "Heróis e vilões da Marvel" },
  { id: "simpsons", name: "🍩 Simpsons", description: "Personagens dos Simpsons" },
  { id: "movies", name: "🎬 Filmes/TV", description: "Personagens de filmes e séries" },
  { id: "classic", name: "📺 Clássicos", description: "Personagens clássicos de animação" },
];

interface PixelAvatarGeneratorProps {
  onSuccess?: () => void;
}

const PixelAvatarGenerator = ({ onSuccess }: PixelAvatarGeneratorProps) => {
  const [style, setStyle] = useState("human");
  const [color, setColor] = useState("random");
  const [accessories, setAccessories] = useState<string[]>([]);
  const [expression, setExpression] = useState("happy");
  const [background, setBackground] = useState("transparent");
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [size, setSize] = useState("profile");
  const [showGallery, setShowGallery] = useState(false);
  const [selectedGalleryAvatar, setSelectedGalleryAvatar] = useState<string | null>(null);
  const [artStyle, setArtStyle] = useState("pixel");
  const [pose, setPose] = useState("front");
  const [outfit, setOutfit] = useState("casual");
  const [hairStyle, setHairStyle] = useState("short");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const { avatars, saveAvatar, deleteAvatar, clearGallery } = useAvatarGallery();

  const sizes = [
    { value: "icon", label: "Ícone", dimensions: "64x64", width: 64, height: 64, description: "Favicons, apps" },
    { value: "small", label: "Pequeno", dimensions: "128x128", width: 128, height: 128, description: "Thumbnails" },
    { value: "profile", label: "Perfil", dimensions: "256x256", width: 256, height: 256, description: "Redes sociais" },
    { value: "medium", label: "Médio", dimensions: "512x512", width: 512, height: 512, description: "Posts, stories" },
    { value: "large", label: "Grande", dimensions: "1024x1024", width: 1024, height: 1024, description: "Alta qualidade" },
    { value: "banner_twitter", label: "Banner X", dimensions: "1500x500", width: 1500, height: 500, description: "Header Twitter/X" },
    { value: "banner_youtube", label: "Banner YT", dimensions: "2560x1440", width: 2560, height: 1440, description: "Canal YouTube" },
    { value: "story", label: "Story", dimensions: "1080x1920", width: 1080, height: 1920, description: "Stories/Reels" },
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
  }, [isGenerating]);

  const applyTemplate = (templateId: string) => {
    const template = characterTemplates.find(t => t.id === templateId);
    if (template) {
      setStyle(template.style);
      setColor(template.color);
      // Convert single accessory to array
      setAccessories(template.accessory === "none" ? [] : [template.accessory]);
      setExpression(template.expression);
      setArtStyle(template.artStyle);
      setPose(template.pose);
      setOutfit(template.outfit);
      setHairStyle(template.hairStyle);
      setCustomPrompt(template.customPrompt);
      setSelectedTemplate(templateId);
      setShowTemplates(false);
      toast({
        title: `Template "${template.name}" aplicado!`,
        description: "As configurações foram ajustadas. Clique em Gerar Avatar.",
      });
    }
  };

  const clearTemplate = () => {
    setStyle("human");
    setColor("random");
    setAccessories([]);
    setExpression("happy");
    setArtStyle("pixel");
    setPose("front");
    setOutfit("casual");
    setHairStyle("short");
    setCustomPrompt("");
    setSelectedTemplate(null);
    toast({
      title: "Template removido",
      description: "Configurações resetadas para o padrão",
    });
  };

  const toggleAccessory = (accessoryValue: string) => {
    if (accessoryValue === "none") {
      setAccessories([]);
      return;
    }
    
    setAccessories(prev => {
      if (prev.includes(accessoryValue)) {
        return prev.filter(a => a !== accessoryValue);
      } else {
        // Limit to 5 accessories max
        if (prev.length >= 5) {
          toast({
            title: "Limite atingido",
            description: "Você pode selecionar no máximo 5 acessórios",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, accessoryValue];
      }
    });
  };

  const clearAccessories = () => {
    setAccessories([]);
  };

  const backgrounds = [
    { value: "transparent", label: "Transparente", preview: "bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ccc%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ccc%22%2F%3E%3C%2Fsvg%3E')]" },
    { value: "white", label: "Branco", preview: "bg-white" },
    { value: "black", label: "Preto", preview: "bg-gray-900" },
    { value: "blue", label: "Azul", preview: "bg-blue-500" },
    { value: "green", label: "Verde", preview: "bg-green-500" },
    { value: "purple", label: "Roxo", preview: "bg-purple-500" },
    { value: "pink", label: "Rosa", preview: "bg-pink-500" },
    { value: "gradient_sunset", label: "Pôr do Sol", preview: "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" },
    { value: "gradient_ocean", label: "Oceano", preview: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" },
    { value: "gradient_forest", label: "Floresta", preview: "bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500" },
    { value: "gradient_rainbow", label: "Arco-íris", preview: "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" },
    { value: "gradient_neon", label: "Neon", preview: "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" },
  ];

  const expressions = [
    { value: "happy", label: "Feliz", emoji: "😊" },
    { value: "sad", label: "Triste", emoji: "😢" },
    { value: "surprised", label: "Surpreso", emoji: "😲" },
    { value: "angry", label: "Bravo", emoji: "😠" },
    { value: "sleeping", label: "Dormindo", emoji: "😴" },
    { value: "wink", label: "Piscando", emoji: "😉" },
    { value: "cool", label: "Estiloso", emoji: "😎" },
    { value: "love", label: "Apaixonado", emoji: "😍" },
    { value: "laugh", label: "Rindo", emoji: "😂" },
    { value: "thinking", label: "Pensando", emoji: "🤔" },
    { value: "scared", label: "Assustado", emoji: "😨" },
    { value: "confused", label: "Confuso", emoji: "😕" },
    { value: "sick", label: "Doente", emoji: "🤢" },
    { value: "crazy", label: "Maluco", emoji: "🤪" },
    { value: "crying", label: "Chorando", emoji: "😭" },
  ];

  const styles = [
    { value: "human", label: "Humano", icon: User },
    { value: "robot", label: "Robô", icon: Bot },
    { value: "monster", label: "Monstro", icon: Ghost },
    { value: "animal", label: "Animal", icon: Cat },
    { value: "alien", label: "Alien", icon: Rocket },
    { value: "ninja", label: "Ninja", icon: Ghost },
    { value: "viking", label: "Viking", icon: User },
    { value: "astronaut", label: "Astronauta", icon: Rocket },
    { value: "zombie", label: "Zumbi", icon: Ghost },
    { value: "fairy", label: "Fada", icon: Sparkles },
    { value: "pirate", label: "Pirata", icon: User },
    { value: "wizard", label: "Mago", icon: Sparkles },
    { value: "knight", label: "Cavaleiro", icon: User },
    { value: "dragon", label: "Dragão", icon: Cat },
    { value: "demon", label: "Demônio", icon: Ghost },
    { value: "angel", label: "Anjo", icon: Sparkles },
    { value: "elf", label: "Elfo", icon: User },
    { value: "dwarf", label: "Anão", icon: User },
    { value: "vampire", label: "Vampiro", icon: Ghost },
    { value: "werewolf", label: "Lobisomem", icon: Cat },
    { value: "mermaid", label: "Sereia", icon: Sparkles },
    { value: "superhero", label: "Super-herói", icon: Rocket },
    { value: "princess", label: "Princesa", icon: Sparkles },
    { value: "samurai", label: "Samurai", icon: User },
  ];

  const colors = [
    { value: "random", label: "Aleatório", color: "bg-gradient-to-r from-red-500 via-green-500 to-blue-500" },
    { value: "red", label: "Vermelho", color: "bg-red-500" },
    { value: "blue", label: "Azul", color: "bg-blue-500" },
    { value: "green", label: "Verde", color: "bg-green-500" },
    { value: "purple", label: "Roxo", color: "bg-purple-500" },
    { value: "orange", label: "Laranja", color: "bg-orange-500" },
    { value: "pink", label: "Rosa", color: "bg-pink-500" },
    { value: "yellow", label: "Amarelo", color: "bg-yellow-400" },
    { value: "cyan", label: "Ciano", color: "bg-cyan-500" },
    { value: "teal", label: "Verde-água", color: "bg-teal-500" },
    { value: "indigo", label: "Índigo", color: "bg-indigo-500" },
    { value: "lime", label: "Lima", color: "bg-lime-500" },
    { value: "black", label: "Preto", color: "bg-gray-900" },
    { value: "white", label: "Branco", color: "bg-white border border-gray-300" },
    { value: "gold", label: "Dourado", color: "bg-yellow-600" },
  ];

  const accessoryCategories = [
    {
      id: "head",
      name: "🎩 Cabeça",
      items: [
        { value: "hat", label: "Chapéu", emoji: "🎩" },
        { value: "cap", label: "Boné", emoji: "🧢" },
        { value: "beanie", label: "Gorro", emoji: "🎿" },
        { value: "wizard_hat", label: "Chapéu Mago", emoji: "🧙" },
        { value: "pirate_hat", label: "Chapéu Pirata", emoji: "🏴‍☠️" },
        { value: "crown", label: "Coroa", emoji: "👑" },
        { value: "tiara", label: "Tiara", emoji: "👸" },
        { value: "bandana", label: "Bandana", emoji: "🏴" },
        { value: "headphones", label: "Fones", emoji: "🎧" },
        { value: "halo", label: "Auréola", emoji: "😇" },
        { value: "horns", label: "Chifres", emoji: "🐂" },
        { value: "antenna", label: "Antena", emoji: "📡" },
        { value: "cat_ears", label: "Orelhas Gato", emoji: "🐱" },
        { value: "bunny_ears", label: "Orelhas Coelho", emoji: "🐰" },
        { value: "devil_horns", label: "Chifres Demônio", emoji: "😈" },
        { value: "bow", label: "Laço", emoji: "🎀" },
        { value: "flower", label: "Flor", emoji: "🌸" },
        { value: "butterfly", label: "Borboleta", emoji: "🦋" },
        { value: "star", label: "Estrela", emoji: "⭐" },
        { value: "heart", label: "Coração", emoji: "❤️" },
      ]
    },
    {
      id: "face",
      name: "👓 Rosto",
      items: [
        { value: "glasses", label: "Óculos", emoji: "👓" },
        { value: "sunglasses", label: "Óculos de Sol", emoji: "🕶️" },
        { value: "monocle", label: "Monóculo", emoji: "🧐" },
        { value: "mask", label: "Máscara", emoji: "🎭" },
        { value: "eyepatch", label: "Tapa-olho", emoji: "🏴‍☠️" },
        { value: "mustache", label: "Bigode", emoji: "🥸" },
        { value: "beard", label: "Barba", emoji: "🧔" },
      ]
    },
    {
      id: "body",
      name: "👕 Corpo",
      items: [
        { value: "scarf", label: "Cachecol", emoji: "🧣" },
        { value: "earrings", label: "Brincos", emoji: "💎" },
        { value: "angel_wings", label: "Asas Anjo", emoji: "👼" },
      ]
    },
    {
      id: "items",
      name: "⚔️ Itens",
      items: [
        { value: "sword", label: "Espada", emoji: "⚔️" },
        { value: "shield", label: "Escudo", emoji: "🛡️" },
        { value: "wand", label: "Varinha", emoji: "✨" },
        { value: "staff", label: "Cajado", emoji: "🪄" },
      ]
    }
  ];

  // Flatten for lookup
  const allAccessoryOptions = accessoryCategories.flatMap(cat => cat.items);

  const artStyles = [
    { value: "pixel", label: "Pixel Art", emoji: "🎮" },
    { value: "chibi", label: "Chibi/Kawaii", emoji: "🌸" },
    { value: "cartoon", label: "Cartoon", emoji: "📺" },
    { value: "anime", label: "Anime", emoji: "⚔️" },
    { value: "realistic", label: "Semi-realista", emoji: "🎨" },
    { value: "minimalist", label: "Minimalista", emoji: "◽" },
    { value: "comic", label: "Quadrinhos", emoji: "💥" },
    { value: "watercolor", label: "Aquarela", emoji: "💧" },
    { value: "cyberpunk", label: "Cyberpunk", emoji: "🤖" },
    { value: "fantasy", label: "Fantasia", emoji: "🧙" },
    { value: "retro", label: "Retrô 80s", emoji: "📼" },
    { value: "vaporwave", label: "Vaporwave", emoji: "🌴" },
  ];

  const poses = [
    { value: "front", label: "Frontal", emoji: "😀" },
    { value: "side", label: "Perfil", emoji: "👤" },
    { value: "three_quarter", label: "3/4", emoji: "🙂" },
    { value: "action", label: "Ação", emoji: "⚡" },
    { value: "sitting", label: "Sentado", emoji: "🪑" },
    { value: "jumping", label: "Pulando", emoji: "🦘" },
    { value: "waving", label: "Acenando", emoji: "👋" },
    { value: "peace", label: "Paz", emoji: "✌️" },
    { value: "thumbs_up", label: "Joia", emoji: "👍" },
    { value: "crossed_arms", label: "Braços Cruzados", emoji: "💪" },
    { value: "dancing", label: "Dançando", emoji: "💃" },
    { value: "meditation", label: "Meditando", emoji: "🧘" },
  ];

  const outfits = [
    { value: "casual", label: "Casual", emoji: "👕" },
    { value: "formal", label: "Formal", emoji: "👔" },
    { value: "sporty", label: "Esportivo", emoji: "🏃" },
    { value: "armor", label: "Armadura", emoji: "🛡️" },
    { value: "robe", label: "Manto", emoji: "🧙" },
    { value: "hoodie", label: "Moletom", emoji: "🧥" },
    { value: "dress", label: "Vestido", emoji: "👗" },
    { value: "suit", label: "Terno", emoji: "🤵" },
    { value: "cyberpunk", label: "Cyberpunk", emoji: "🤖" },
    { value: "medieval", label: "Medieval", emoji: "⚔️" },
    { value: "futuristic", label: "Futurista", emoji: "🚀" },
    { value: "traditional", label: "Tradicional", emoji: "👘" },
    { value: "punk", label: "Punk", emoji: "🎸" },
    { value: "gothic", label: "Gótico", emoji: "🦇" },
    { value: "steampunk", label: "Steampunk", emoji: "⚙️" },
  ];

  const hairStyles = [
    { value: "short", label: "Curto", emoji: "💇" },
    { value: "long", label: "Longo", emoji: "💇‍♀️" },
    { value: "spiky", label: "Espetado", emoji: "⚡" },
    { value: "bald", label: "Careca", emoji: "👨‍🦲" },
    { value: "mohawk", label: "Moicano", emoji: "🦅" },
    { value: "ponytail", label: "Rabo de Cavalo", emoji: "🎀" },
    { value: "braids", label: "Tranças", emoji: "🎎" },
    { value: "afro", label: "Afro", emoji: "✊" },
    { value: "curly", label: "Cacheado", emoji: "🌀" },
    { value: "wavy", label: "Ondulado", emoji: "🌊" },
    { value: "messy", label: "Bagunçado", emoji: "💨" },
    { value: "elegant", label: "Elegante", emoji: "👑" },
    { value: "anime", label: "Estilo Anime", emoji: "⭐" },
    { value: "pigtails", label: "Maria Chiquinha", emoji: "🎀" },
    { value: "undercut", label: "Undercut", emoji: "✂️" },
  ];

  const generateAvatar = async () => {
    setIsGenerating(true);
    setGeneratedAvatar(null);

    try {
      const selectedSize = sizes.find(s => s.value === size) || sizes[2];
      const resp = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          color,
          accessories,
          expression,
          background,
          width: selectedSize.width,
          height: selectedSize.height,
          artStyle,
          pose,
          outfit,
          hairStyle,
          customPrompt: customPrompt.trim(),
        }),
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        throw new Error(data.error || "Erro ao gerar avatar");
      }

      if (data.imageUrl) {
        setGeneratedAvatar(data.imageUrl);
        saveAvatar(data.imageUrl, style, size);
        onSuccess?.();
        toast({
          title: "Avatar gerado e salvo!",
          description: "Seu avatar foi criado e adicionado à galeria",
        });
      }
    } catch (error) {
      console.error("Error generating avatar:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o avatar",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAvatar = () => {
    if (!generatedAvatar) return;

    const link = document.createElement("a");
    link.href = generatedAvatar;
    link.download = `pixel-avatar-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado!",
      description: "Seu avatar está sendo baixado",
    });
  };

  const copyToClipboard = async () => {
    if (!generatedAvatar) return;

    try {
      // Convert base64 to blob
      const response = await fetch(generatedAvatar);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);

      toast({
        title: "Copiado!",
        description: "Avatar copiado para a área de transferência",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o avatar",
        variant: "destructive",
      });
    }
  };

  const shareAvatar = async () => {
    if (!generatedAvatar) return;

    try {
      // Convert base64 to blob
      const response = await fetch(generatedAvatar);
      const blob = await response.blob();
      const file = new File([blob], 'pixel-avatar.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Meu Avatar Pixelado',
          text: 'Confira o avatar que eu criei no sos01!',
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard
        await copyToClipboard();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Erro ao compartilhar",
          description: "Use o botão de copiar ou baixar",
          variant: "destructive",
        });
      }
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent('Confira o avatar pixelado que eu criei! 🎮✨ Crie o seu em:');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent('Confira o avatar pixelado que eu criei! 🎮✨ Crie o seu em: ' + window.location.href);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent('Confira o avatar pixelado que eu criei! 🎮✨');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const shareToPinterest = () => {
    const url = encodeURIComponent(window.location.href);
    const description = encodeURIComponent('Avatar Pixelado - Crie o seu! 🎮✨');
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&description=${description}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareToReddit = () => {
    const title = encodeURIComponent('Confira o avatar pixelado que eu criei! 🎮✨');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent('Confira meu Avatar Pixelado! 🎮');
    const body = encodeURIComponent('Olha que legal o avatar que eu criei! Você também pode criar o seu em: ' + window.location.href);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const shareToTikTok = async () => {
    // TikTok doesn't have a direct share URL - download avatar and open TikTok
    if (generatedAvatar) {
      downloadAvatar();
      toast({
        title: "Avatar baixado!",
        description: "Agora abra o TikTok e faça upload do avatar salvo",
      });
      setTimeout(() => {
        window.open('https://www.tiktok.com', '_blank');
      }, 1000);
    }
  };

  const shareToDiscord = async () => {
    // Discord doesn't have a direct share URL - copy the image to clipboard
    if (generatedAvatar) {
      try {
        const response = await fetch(generatedAvatar);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        toast({
          title: "Imagem copiada!",
          description: "Cole diretamente no Discord (Ctrl+V)",
        });
      } catch {
        const message = 'Confira o avatar pixelado que eu criei! 🎮✨ ' + window.location.href;
        navigator.clipboard.writeText(message);
        toast({
          title: "Mensagem copiada!",
          description: "Cole no Discord para compartilhar",
        });
      }
    }
  };

  const shareToInstagram = async () => {
    // Instagram doesn't have a direct web share URL - download for user to upload
    if (generatedAvatar) {
      downloadAvatar();
      toast({
        title: "Avatar baixado!",
        description: "Agora abra o Instagram e faça upload do avatar salvo",
      });
      setTimeout(() => {
        window.open('https://www.instagram.com', '_blank');
      }, 1000);
    }
  };

  const shareToThreads = () => {
    const text = encodeURIComponent('Confira o avatar pixelado que eu criei! 🎮✨ Crie o seu em: ' + window.location.href);
    window.open(`https://www.threads.net/intent/post?text=${text}`, '_blank');
  };

  const handleSelectGalleryAvatar = (imageData: string) => {
    setGeneratedAvatar(imageData);
    setSelectedGalleryAvatar(imageData);
    setShowGallery(false);
  };

  const handleDeleteFromGallery = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAvatar(id);
    toast({
      title: "Avatar removido",
      description: "O avatar foi excluído da galeria",
    });
  };

  const handleClearGallery = () => {
    clearGallery();
    toast({
      title: "Galeria limpa",
      description: "Todos os avatares foram excluídos",
    });
  };

  return (
    <div className="space-y-4">
      {/* Gallery and Templates Toggle Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowGallery(!showGallery)}
          variant="outline"
          className="flex-1"
        >
          <Image className="w-4 h-4 mr-2" />
          Galeria ({avatars.length})
        </Button>
        <Button
          onClick={() => setShowTemplates(!showTemplates)}
          variant="outline"
          className={`flex-1 ${selectedTemplate ? 'border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20' : ''}`}
        >
          <Star className="w-4 h-4 mr-2" />
          Templates
        </Button>
        {avatars.length > 0 && showGallery && (
          <Button
            onClick={handleClearGallery}
            variant="outline"
            size="icon"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Selected Template Indicator */}
      {selectedTemplate && (
        <div className="flex items-center justify-between p-2 rounded-sm border-2 border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">{characterTemplates.find(t => t.id === selectedTemplate)?.emoji}</span>
            <span className="text-sm font-medium">Template: {characterTemplates.find(t => t.id === selectedTemplate)?.name}</span>
          </div>
          <Button
            onClick={clearTemplate}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        </div>
      )}

      {/* Templates Panel */}
      {showTemplates && (
        <div className="border-2 border-muted rounded-sm p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="w-3 h-3" />
              Templates de Personagens
            </Label>
            <button
              onClick={() => setShowTemplates(false)}
              className="p-1 hover:bg-muted rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Selecione um personagem para aplicar configurações pré-definidas
          </p>
          <ScrollArea className="h-64">
            <div className="space-y-3 pr-3">
              {templateCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground border-b border-muted pb-1">
                    {category.name}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {characterTemplates
                      .filter(t => t.category === category.id)
                      .map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-sm border-2 transition-all text-xs hover:scale-105 ${
                            selectedTemplate === template.id
                              ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                              : "border-muted hover:border-muted-foreground/50"
                          }`}
                        >
                          <span className="text-xl">{template.emoji}</span>
                          <span className="text-[10px] text-center leading-tight">{template.name}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Gallery Display */}
      {showGallery && (
        <div className="border-2 border-muted rounded-sm p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Avatares Salvos</Label>
            <button
              onClick={() => setShowGallery(false)}
              className="p-1 hover:bg-muted rounded-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {avatars.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum avatar salvo ainda. Gere um para começar!
            </p>
          ) : (
            <ScrollArea className="h-48">
              <div className="grid grid-cols-4 gap-2 pr-3">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => handleSelectGalleryAvatar(avatar.imageData)}
                    className={`relative group cursor-pointer rounded-sm overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedGalleryAvatar === avatar.imageData
                        ? 'border-[hsl(280,100%,60%)] ring-2 ring-[hsl(280,100%,60%)]/50'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                  >
                    <img
                      src={avatar.imageData}
                      alt={`Avatar ${avatar.style}`}
                      className="w-full aspect-square object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <button
                      onClick={(e) => handleDeleteFromGallery(avatar.id, e)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                      {avatar.style}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
      {/* Style Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Estilo</Label>
        <div className="grid grid-cols-5 sm:grid-cols-5 gap-1 flex-wrap">
          {styles.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-sm border-2 transition-all text-xs ${
                  style === s.value
                    ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Cor</Label>
        <div className="flex gap-2 flex-wrap">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-sm ${c.color} border-2 transition-all ${
                color === c.value
                  ? "border-white ring-2 ring-[hsl(280,100%,60%)] scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Expression Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Expressão</Label>
        <div className="flex gap-2 flex-wrap">
          {expressions.map((e) => (
            <button
              key={e.value}
              onClick={() => setExpression(e.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-sm border-2 transition-all text-xs ${
                expression === e.value
                  ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                  : "border-muted hover:border-muted-foreground/50"
              }`}
            >
              <span>{e.emoji}</span>
              <span>{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Tamanho</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sizes.map((s) => (
            <button
              key={s.value}
              onClick={() => setSize(s.value)}
              className={`flex flex-col items-center p-2 rounded-sm border-2 transition-all text-xs ${
                size === s.value
                  ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                  : "border-muted hover:border-muted-foreground/50"
              }`}
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-[10px] opacity-70">{s.dimensions}</span>
              <span className="text-[9px] opacity-50">{s.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Background Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Fundo</Label>
        <div className="flex gap-2 flex-wrap">
          {backgrounds.map((b) => (
            <button
              key={b.value}
              onClick={() => setBackground(b.value)}
              className={`w-8 h-8 rounded-sm ${b.preview} border-2 transition-all ${
                background === b.value
                  ? "border-white ring-2 ring-[hsl(280,100%,60%)] scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              title={b.label}
            />
          ))}
        </div>
      </div>

      {/* Accessory Selection - Multiple */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            Acessórios ({accessories.length}/5)
          </Label>
          {accessories.length > 0 && (
            <Button
              onClick={clearAccessories}
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-[10px]"
            >
              Limpar todos
            </Button>
          )}
        </div>
        {accessories.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 rounded-sm bg-[hsl(280,100%,60%)]/10 border border-[hsl(280,100%,60%)]/30">
            {accessories.map(acc => {
              const option = allAccessoryOptions.find(o => o.value === acc);
              return (
                <span key={acc} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-sm bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]">
                  {option?.emoji} {option?.label}
                  <button 
                    onClick={() => toggleAccessory(acc)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <div className="space-y-3">
          {accessoryCategories.map((category) => (
            <div key={category.id} className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground border-b border-muted pb-1">
                {category.name}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {category.items.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => toggleAccessory(a.value)}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-sm border-2 cursor-pointer transition-all hover:scale-105 ${
                      accessories.includes(a.value)
                        ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <span>{a.emoji}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Customization Section */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-sm border-2 border-muted hover:border-[hsl(280,100%,60%)]/50 transition-all text-sm font-medium">
          <Palette className="w-4 h-4" />
          <span>⚙️ Personalização Avançada</span>
          <span className="ml-auto text-xs text-muted-foreground">(clique para expandir)</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4 p-3 border-2 border-muted/50 rounded-sm bg-muted/10">
          
          {/* Art Style Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Palette className="w-3 h-3" /> Estilo de Arte
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {artStyles.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setArtStyle(a.value)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-sm border-2 transition-all text-xs ${
                    artStyle === a.value
                      ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <span>{a.emoji}</span>
                  <span className="truncate">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pose Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Move className="w-3 h-3" /> Pose
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {poses.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPose(p.value)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-sm border-2 transition-all text-xs ${
                    pose === p.value
                      ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Outfit Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Shirt className="w-3 h-3" /> Roupa
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {outfits.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOutfit(o.value)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-sm border-2 transition-all text-xs ${
                    outfit === o.value
                      ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <span>{o.emoji}</span>
                  <span className="truncate">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hair Style Selection */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              <Scissors className="w-3 h-3" /> Cabelo
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {hairStyles.map((h) => (
                <button
                  key={h.value}
                  onClick={() => setHairStyle(h.value)}
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-sm border-2 transition-all text-xs ${
                    hairStyle === h.value
                      ? "border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/20 text-[hsl(280,100%,60%)]"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                >
                  <span>{h.emoji}</span>
                  <span className="truncate">{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-2">
              ✨ Prompt Personalizado (opcional)
            </Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Adicione descrições extras... Ex: 'com fogo nas mãos', 'em uma floresta mágica', 'estilo cyberpunk'"
              className="min-h-[60px] text-xs resize-none"
              maxLength={200}
            />
            <p className="text-[10px] text-muted-foreground text-right">{customPrompt.length}/200</p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Generate Button */}
      <Button
        onClick={generateAvatar}
        disabled={isGenerating}
        className="w-full"
        style={{ backgroundColor: 'hsl(280, 100%, 60%)', color: 'white' }}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Avatar
          </>
        )}
      </Button>

      {/* Loading Animation */}
      {isGenerating && (
        <div className="relative aspect-square bg-muted/30 rounded-sm border-2 border-[hsl(280,100%,60%)]/30 overflow-hidden flex flex-col items-center justify-center gap-4">
          {/* Animated pixel grid background */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[hsl(280,100%,60%)]"
                  style={{
                    animation: `pulse 1.5s ease-in-out infinite`,
                    animationDelay: `${(i % 8) * 0.1 + Math.floor(i / 8) * 0.1}s`,
                    opacity: Math.random() > 0.7 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Loading spinner */}
          <div className="relative z-10 w-16 h-16 border-4 border-[hsl(280,100%,60%)]/30 border-t-[hsl(280,100%,60%)] rounded-full animate-spin" />
          
          {/* Loading message */}
          <p className="relative z-10 text-sm text-[hsl(280,100%,60%)] font-medium animate-pulse">
            {loadingMessages[loadingMessageIndex]}
          </p>
          
          {/* Progress dots */}
          <div className="relative z-10 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i <= loadingMessageIndex
                    ? 'bg-[hsl(280,100%,60%)]'
                    : 'bg-[hsl(280,100%,60%)]/30'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Generated Avatar Display */}
      {generatedAvatar && !isGenerating && (
        <div className="space-y-3">
          <div className="relative aspect-square bg-muted/50 rounded-sm border-2 border-[hsl(280,100%,60%)]/30 overflow-hidden flex items-center justify-center animate-scale-in">
            <img
              src={generatedAvatar}
              alt="Avatar Pixelado Gerado"
              className="max-w-full max-h-full object-contain image-pixelated"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateAvatar}
              variant="outline"
              className="flex-1"
              disabled={isGenerating}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Novo
            </Button>
            <Button
              onClick={downloadAvatar}
              className="flex-1"
              style={{ backgroundColor: 'hsl(280, 100%, 60%)', color: 'white' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
          
          {/* Share Options */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Compartilhar</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={shareAvatar}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copiar
              </Button>
            </div>
            
            {/* Primary Social Networks */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={shareToTwitter}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-black hover:bg-gray-800 text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no X"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </button>
              <button
                onClick={shareToWhatsApp}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no WhatsApp"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <button
                onClick={shareToFacebook}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no Facebook"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Secondary Social Networks - Instagram & Threads */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={shareToInstagram}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white text-xs rounded-sm transition-opacity"
                title="Baixar e abrir Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </button>
              <button
                onClick={shareToThreads}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-black hover:bg-gray-800 text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no Threads"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.85-.704 2.043-1.138 3.453-1.253.97-.08 1.958-.048 2.953.095-.012-.468-.06-.915-.145-1.32-.229-1.09-.7-1.876-1.394-2.334-.744-.49-1.715-.692-2.886-.6l-.152-2.118c1.622-.128 3.035.169 4.2.882 1.036.634 1.782 1.6 2.218 2.872.31.909.465 1.98.462 3.192-.004.263-.008.527-.017.79 1.074.634 1.937 1.478 2.512 2.465.758 1.3 1.09 2.91.988 4.79-.076 1.396-.506 2.736-1.245 3.88-.783 1.214-1.892 2.177-3.297 2.864-1.496.731-3.239 1.103-5.184 1.106zm1.27-8.737c-.834-.164-1.663-.212-2.477-.143-1 .082-1.828.36-2.394.805-.483.38-.718.848-.68 1.357.04.574.36 1.096.901 1.471.595.413 1.39.598 2.237.52 1.037-.094 1.89-.478 2.468-1.108.47-.513.791-1.243.914-2.178a14.762 14.762 0 00-.969-.724z"/>
                </svg>
                Threads
              </button>
            </div>

            {/* Tertiary Social Networks */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={shareToTelegram}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no Telegram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>
              <button
                onClick={shareToDiscord}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs rounded-sm transition-colors"
                title="Colar imagem no Discord"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
              </button>
              <button
                onClick={shareToPinterest}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-[#E60023] hover:bg-[#cc001f] text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no Pinterest"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                </svg>
              </button>
              <button
                onClick={shareToTikTok}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-black hover:bg-gray-800 text-white text-xs rounded-sm transition-colors"
                title="Baixar e abrir TikTok"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </button>
            </div>

            {/* Quaternary Options */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={shareToLinkedIn}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no LinkedIn"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button
                onClick={shareToReddit}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-[#FF4500] hover:bg-[#e03d00] text-white text-xs rounded-sm transition-colors"
                title="Compartilhar no Reddit"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </button>
              <button
                onClick={shareToEmail}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-sm transition-colors"
                title="Compartilhar por E-mail"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-1 py-2 px-2 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-sm transition-colors"
                title="Copiar imagem"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PixelAvatarGenerator;

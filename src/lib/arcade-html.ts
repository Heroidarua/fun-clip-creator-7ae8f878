import { localCandidates } from "./arcade-local";

const SOURCE = "https://wasmarcade.com";
const MIRROR = "/wasm-mirror";

const INJECT = `
<script>
(function () {
  var S = "https://wasmarcade.com";
  var P = "//wasmarcade.com";
  var M = "/wasm-mirror";
  var LP = ["/flash/swf/", "/flash/thumbs/", "/emulation/og-v2/", "/emulation/boxart-v2/"];
  var AL = {"/emulation/boxart-v2/1941-counter-attack-450.webp":"/arcade-assets/emulation/og-v2/1941.jpg","/emulation/boxart-v2/1944-the-loop-master-450.webp":"/arcade-assets/emulation/og-v2/1944.jpg","/emulation/boxart-v2/19xx-the-war-against-destiny-450.webp":"/arcade-assets/emulation/og-v2/19xx.jpg","/emulation/boxart-v2/2020-super-baseball-450.webp":"/arcade-assets/emulation/og-v2/2020bb.jpg","/emulation/boxart-v2/3-count-bout-450.webp":"/arcade-assets/emulation/og-v2/3countb.jpg","/emulation/boxart-v2/aero-fighters-2-450.webp":"/arcade-assets/emulation/og-v2/sonicwi2.jpg","/emulation/boxart-v2/aero-fighters-3-450.webp":"/arcade-assets/emulation/og-v2/sonicwi3.jpg","/emulation/boxart-v2/after-burner-ii-450.webp":"/arcade-assets/emulation/og-v2/aburner2.jpg","/emulation/boxart-v2/alien-storm-450.webp":"/arcade-assets/emulation/og-v2/astorm.jpg","/emulation/boxart-v2/alien-vs-predator-450.webp":"/arcade-assets/emulation/og-v2/avsp.jpg","/emulation/boxart-v2/alpha-mission-ii-450.webp":"/arcade-assets/emulation/og-v2/alpham2.jpg","/emulation/boxart-v2/altered-beast-450.webp":"/arcade-assets/emulation/og-v2/altbeast.jpg","/emulation/boxart-v2/andro-dunos-450.webp":"/arcade-assets/emulation/og-v2/androdun.jpg","/emulation/boxart-v2/armored-warriors-450.webp":"/arcade-assets/emulation/og-v2/armwar.jpg","/emulation/boxart-v2/art-of-fighting-450.webp":"/arcade-assets/emulation/og-v2/aof.jpg","/emulation/boxart-v2/art-of-fighting-2-450.webp":"/arcade-assets/emulation/og-v2/aof2.jpg","/emulation/boxart-v2/art-of-fighting-3-450.webp":"/arcade-assets/emulation/og-v2/aof3.jpg","/emulation/boxart-v2/bang-bead-450.webp":"/arcade-assets/emulation/og-v2/bangbead.jpg","/emulation/boxart-v2/baseball-stars-2-450.webp":"/arcade-assets/emulation/og-v2/bstars2.jpg","/emulation/boxart-v2/baseball-stars-professional-450.webp":"/arcade-assets/emulation/og-v2/bstars.jpg","/emulation/boxart-v2/batman-450.webp":"/arcade-assets/emulation/boxart-v2/batman-450.webp","/emulation/boxart-v2/battle-circuit-450.webp":"/arcade-assets/emulation/og-v2/batcir.jpg","/emulation/boxart-v2/battletoads-450.webp":"/arcade-assets/emulation/og-v2/btoads.jpg","/emulation/boxart-v2/bishoujo-senshi-sailor-moon-450.webp":"/arcade-assets/emulation/og-v2/sailormn.jpg","/emulation/boxart-v2/blazing-star-450.webp":"/arcade-assets/emulation/og-v2/blazstar.jpg","/emulation/boxart-v2/blue-s-journey-450.webp":"/arcade-assets/emulation/og-v2/bjourney.jpg","/emulation/boxart-v2/breakers-revenge-450.webp":"/arcade-assets/emulation/og-v2/breakrev.jpg","/emulation/boxart-v2/buck-rogers-planet-of-zoom-450.webp":"/arcade-assets/emulation/og-v2/buckrog.jpg","/emulation/boxart-v2/burning-fight-450.webp":"/arcade-assets/emulation/og-v2/burningf.jpg","/emulation/boxart-v2/cadillacs-and-dinosaurs-450.webp":"/arcade-assets/emulation/og-v2/dino.jpg","/emulation/boxart-v2/capcom-sports-club-450.webp":"/arcade-assets/emulation/og-v2/csclub.jpg","/emulation/boxart-v2/captain-america-and-the-avengers-450.webp":"/arcade-assets/emulation/og-v2/captaven.jpg","/emulation/boxart-v2/captain-commando-450.webp":"/arcade-assets/emulation/og-v2/captcomm.jpg","/emulation/boxart-v2/carrier-air-wing-450.webp":"/arcade-assets/emulation/og-v2/cawing.jpg","/emulation/boxart-v2/columns-450.webp":"/arcade-assets/emulation/boxart-v2/columns-450.webp","/emulation/boxart-v2/congo-bongo-450.webp":"/arcade-assets/emulation/og-v2/congo.jpg","/emulation/boxart-v2/contra-450.webp":"/arcade-assets/emulation/boxart-v2/contra-450.webp","/emulation/boxart-v2/crossed-swords-450.webp":"/arcade-assets/emulation/og-v2/crsword.jpg","/emulation/boxart-v2/crossed-swords-2-450.webp":"/arcade-assets/emulation/og-v2/crswd2bl.jpg","/emulation/boxart-v2/cyber-police-eswat-450.webp":"/arcade-assets/emulation/og-v2/eswat.jpg","/emulation/boxart-v2/cyberbots-fullmetal-madness-450.webp":"/arcade-assets/emulation/og-v2/cybots.jpg","/emulation/boxart-v2/darkstalkers-the-night-warriors-450.webp":"/arcade-assets/emulation/og-v2/dstlk.jpg","/emulation/boxart-v2/dimahoo-450.webp":"/arcade-assets/emulation/boxart-v2/dimahoo-450.webp","/emulation/boxart-v2/double-dragon-450.webp":"/arcade-assets/emulation/og-v2/ddragon.jpg","/emulation/boxart-v2/double-dragon-3-the-rosetta-stone-450.webp":"/arcade-assets/emulation/og-v2/ddragon3.jpg","/emulation/boxart-v2/double-dragon-ii-the-revenge-450.webp":"/arcade-assets/emulation/og-v2/ddragon2.jpg","/emulation/boxart-v2/double-dragon-neo-geo-450.webp":"/arcade-assets/emulation/og-v2/doubledr.jpg","/emulation/boxart-v2/dragon-ball-z-450.webp":"/arcade-assets/emulation/og-v2/dbz.jpg","/emulation/boxart-v2/dungeons-and-dragons-shadow-over-mystara-450.webp":"/arcade-assets/emulation/og-v2/ddsom.jpg","/emulation/boxart-v2/dungeons-and-dragons-tower-of-doom-450.webp":"/arcade-assets/emulation/og-v2/ddtod.jpg","/emulation/boxart-v2/dynasty-wars-450.webp":"/arcade-assets/emulation/og-v2/dynwar.jpg","/emulation/boxart-v2/eco-fighters-450.webp":"/arcade-assets/emulation/og-v2/ecofghtr.jpg","/emulation/boxart-v2/eightman-450.webp":"/arcade-assets/emulation/boxart-v2/eightman-450.webp","/emulation/boxart-v2/far-east-of-eden-kabuki-klash-450.webp":"/arcade-assets/emulation/og-v2/kabukikl.jpg","/emulation/boxart-v2/fatal-fury-450.webp":"/arcade-assets/emulation/og-v2/fatfury1.jpg","/emulation/boxart-v2/fatal-fury-3-road-to-the-final-victory-450.webp":"/arcade-assets/emulation/og-v2/fatfury3.jpg","/emulation/boxart-v2/fatal-fury-special-450.webp":"/arcade-assets/emulation/og-v2/fatfursp.jpg","/emulation/boxart-v2/final-fight-450.webp":"/arcade-assets/emulation/og-v2/ffight.jpg","/emulation/boxart-v2/fire-shark-450.webp":"/arcade-assets/emulation/og-v2/fireshrk.jpg","/emulation/boxart-v2/flicky-450.webp":"/arcade-assets/emulation/boxart-v2/flicky-450.webp","/emulation/boxart-v2/forgotten-worlds-450.webp":"/arcade-assets/emulation/og-v2/forgottn.jpg","/emulation/boxart-v2/frogger-450.webp":"/arcade-assets/emulation/boxart-v2/frogger-450.webp","/emulation/boxart-v2/gain-ground-450.webp":"/arcade-assets/emulation/og-v2/gground.jpg","/emulation/boxart-v2/ganryu-450.webp":"/arcade-assets/emulation/boxart-v2/ganryu-450.webp","/emulation/boxart-v2/garou-mark-of-the-wolves-450.webp":"/arcade-assets/emulation/og-v2/garou.jpg","/emulation/boxart-v2/ghost-pilots-450.webp":"/arcade-assets/emulation/og-v2/gpilots.jpg","/emulation/boxart-v2/ghouls-n-ghosts-450.webp":"/arcade-assets/emulation/og-v2/ghouls.jpg","/emulation/boxart-v2/giga-wing-450.webp":"/arcade-assets/emulation/og-v2/gigawing.jpg","/emulation/boxart-v2/goal-goal-goal-450.webp":"/arcade-assets/emulation/og-v2/goalx3.jpg","/emulation/boxart-v2/golden-axe-450.webp":"/arcade-assets/emulation/og-v2/goldnaxe.jpg","/emulation/boxart-v2/growl-450.webp":"/arcade-assets/emulation/boxart-v2/growl-450.webp","/emulation/boxart-v2/hellfire-450.webp":"/arcade-assets/emulation/boxart-v2/hellfire-450.webp","/emulation/boxart-v2/hit-the-ice-450.webp":"/arcade-assets/emulation/og-v2/hitice.jpg","/emulation/boxart-v2/hook-450.webp":"/arcade-assets/emulation/boxart-v2/hook-450.webp","/emulation/boxart-v2/hyper-street-fighter-ii-the-anniversary-edition-450.webp":"/arcade-assets/emulation/og-v2/hsf2.jpg","/emulation/boxart-v2/jojo-s-bizarre-adventure-450.webp":"/arcade-assets/emulation/og-v2/jojoba.jpg","/emulation/boxart-v2/jojo-s-venture-450.webp":"/arcade-assets/emulation/og-v2/jojo.jpg","/emulation/boxart-v2/karnov-s-revenge-450.webp":"/arcade-assets/emulation/og-v2/karnovr.jpg","/emulation/boxart-v2/king-and-balloon-450.webp":"/arcade-assets/emulation/og-v2/kingball.jpg","/emulation/boxart-v2/king-of-the-monsters-450.webp":"/arcade-assets/emulation/og-v2/kotm.jpg","/emulation/boxart-v2/king-of-the-monsters-2-450.webp":"/arcade-assets/emulation/og-v2/kotm2.jpg","/emulation/boxart-v2/klax-450.webp":"/arcade-assets/emulation/boxart-v2/klax-450.webp","/emulation/boxart-v2/knights-of-the-round-450.webp":"/arcade-assets/emulation/og-v2/knights.jpg","/emulation/boxart-v2/last-resort-450.webp":"/arcade-assets/emulation/og-v2/lresort.jpg","/emulation/boxart-v2/league-bowling-neo-geo-450.webp":"/arcade-assets/emulation/og-v2/lbowling.jpg","/emulation/boxart-v2/magic-sword-450.webp":"/arcade-assets/emulation/og-v2/msword.jpg","/emulation/boxart-v2/magical-drop-ii-450.webp":"/arcade-assets/emulation/og-v2/magdrop2.jpg","/emulation/boxart-v2/magical-drop-iii-toretate-zoukangou-450.webp":"/arcade-assets/emulation/og-v2/magdrop3.jpg","/emulation/boxart-v2/magician-lord-450.webp":"/arcade-assets/emulation/og-v2/maglord.jpg","/emulation/boxart-v2/mars-matrix-450.webp":"/arcade-assets/emulation/og-v2/mmatrix.jpg","/emulation/boxart-v2/marvel-super-heroes-450.webp":"/arcade-assets/emulation/og-v2/msh.jpg","/emulation/boxart-v2/marvel-super-heroes-vs-street-fighter-450.webp":"/arcade-assets/emulation/og-v2/mshvsf.jpg","/emulation/boxart-v2/marvel-vs-capcom-clash-of-super-heroes-450.webp":"/arcade-assets/emulation/og-v2/mvsc.jpg","/emulation/boxart-v2/matrimelee-450.webp":"/arcade-assets/emulation/og-v2/matrim.jpg","/emulation/boxart-v2/mega-man-2-the-power-fighters-450.webp":"/arcade-assets/emulation/og-v2/megaman2.jpg","/emulation/boxart-v2/mega-man-the-power-battle-450.webp":"/arcade-assets/emulation/og-v2/megaman.jpg","/emulation/boxart-v2/mega-twins-450.webp":"/arcade-assets/emulation/og-v2/mtwins.jpg","/emulation/boxart-v2/mercs-450.webp":"/arcade-assets/emulation/boxart-v2/mercs-450.webp","/emulation/boxart-v2/metal-slug-450.webp":"/arcade-assets/emulation/og-v2/mslug.jpg","/emulation/boxart-v2/metal-slug-3-450.webp":"/arcade-assets/emulation/og-v2/mslug3.jpg","/emulation/boxart-v2/metal-slug-4-450.webp":"/arcade-assets/emulation/og-v2/mslug4.jpg","/emulation/boxart-v2/metal-slug-5-450.webp":"/arcade-assets/emulation/og-v2/mslug5.jpg","/emulation/boxart-v2/metal-slug-x-450.webp":"/arcade-assets/emulation/og-v2/mslugx.jpg","/emulation/boxart-v2/michael-jackson-s-moonwalker-450.webp":"/arcade-assets/emulation/og-v2/mwalk.jpg","/emulation/boxart-v2/mighty-pang-450.webp":"/arcade-assets/emulation/og-v2/mpang.jpg","/emulation/boxart-v2/mortal-kombat-450.webp":"/arcade-assets/emulation/og-v2/mk.jpg","/emulation/boxart-v2/mortal-kombat-ii-450.webp":"/arcade-assets/emulation/og-v2/mk2.jpg","/emulation/boxart-v2/ms-pac-man-450.webp":"/arcade-assets/emulation/og-v2/mspacman.jpg","/emulation/boxart-v2/muscle-bomber-duo-ultimate-team-battle-450.webp":"/arcade-assets/emulation/og-v2/mbombrd.jpg","/emulation/boxart-v2/mutation-nation-450.webp":"/arcade-assets/emulation/og-v2/mutnat.jpg","/emulation/boxart-v2/nam-1975-450.webp":"/arcade-assets/emulation/og-v2/nam1975.jpg","/emulation/boxart-v2/nba-jam-tournament-edition-450.webp":"/arcade-assets/emulation/og-v2/nbajamte.jpg","/emulation/boxart-v2/nemo-450.webp":"/arcade-assets/emulation/og-v2/nemo.jpg","/emulation/boxart-v2/neo-bomberman-450.webp":"/arcade-assets/emulation/og-v2/neobombe.jpg","/emulation/boxart-v2/neo-drift-out-450.webp":"/arcade-assets/emulation/og-v2/neodrift.jpg","/emulation/boxart-v2/neo-mr-do-450.webp":"/arcade-assets/emulation/og-v2/neomrdo.jpg","/emulation/boxart-v2/neo-turf-masters-450.webp":"/arcade-assets/emulation/og-v2/turfmast.jpg","/emulation/boxart-v2/night-warriors-darkstalkers-revenge-450.webp":"/arcade-assets/emulation/og-v2/nwarr.jpg","/emulation/boxart-v2/nightmare-in-the-dark-450.webp":"/arcade-assets/emulation/og-v2/nitd.jpg","/emulation/boxart-v2/ninja-combat-450.webp":"/arcade-assets/emulation/og-v2/ncombat.jpg","/emulation/boxart-v2/ninja-commando-450.webp":"/arcade-assets/emulation/og-v2/ncommand.jpg","/emulation/boxart-v2/outrun-450.webp":"/arcade-assets/emulation/og-v2/outrun.jpg","/emulation/boxart-v2/over-top-450.webp":"/arcade-assets/emulation/og-v2/overtop.jpg","/emulation/boxart-v2/pac-man-arcade-1980-450.webp":"/arcade-assets/emulation/og-v2/pacman.jpg","/emulation/boxart-v2/pang-3-450.webp":"/arcade-assets/emulation/og-v2/pang3.jpg","/emulation/boxart-v2/panic-bomber-450.webp":"/arcade-assets/emulation/og-v2/panicbom.jpg","/emulation/boxart-v2/pit-fighter-450.webp":"/arcade-assets/emulation/og-v2/pitfight.jpg","/emulation/boxart-v2/pnickies-450.webp":"/arcade-assets/emulation/og-v2/pnickj.jpg","/emulation/boxart-v2/prehistoric-isle-2-450.webp":"/arcade-assets/emulation/og-v2/preisle2.jpg","/emulation/boxart-v2/progear-storm-of-progia-450.webp":"/arcade-assets/emulation/og-v2/progear.jpg","/emulation/boxart-v2/pulstar-450.webp":"/arcade-assets/emulation/og-v2/pulstar.jpg","/emulation/boxart-v2/puyo-puyo-2-450.webp":"/arcade-assets/emulation/og-v2/puyopuy2.jpg","/emulation/boxart-v2/puzz-loop-2-450.webp":"/arcade-assets/emulation/og-v2/pzloop2.jpg","/emulation/boxart-v2/puzzle-bobble-450.webp":"/arcade-assets/emulation/og-v2/pbobblen.jpg","/emulation/boxart-v2/puzzle-bobble-2-bust-a-move-2-450.webp":"/arcade-assets/emulation/og-v2/pbobbl2n.jpg","/emulation/boxart-v2/rage-of-the-dragons-450.webp":"/arcade-assets/emulation/og-v2/rotd.jpg","/emulation/boxart-v2/rainbow-islands-450.webp":"/arcade-assets/emulation/og-v2/rbisland.jpg","/emulation/boxart-v2/rambo-iii-450.webp":"/arcade-assets/emulation/og-v2/rambo3.jpg","/emulation/boxart-v2/real-bout-fatal-fury-450.webp":"/arcade-assets/emulation/og-v2/rbff1.jpg","/emulation/boxart-v2/real-bout-fatal-fury-2-the-newcomers-450.webp":"/arcade-assets/emulation/og-v2/rbff2.jpg","/emulation/boxart-v2/real-bout-fatal-fury-special-450.webp":"/arcade-assets/emulation/og-v2/rbffspec.jpg","/emulation/boxart-v2/red-earth-450.webp":"/arcade-assets/emulation/og-v2/redearth.jpg","/emulation/boxart-v2/ring-of-destruction-slam-masters-2-450.webp":"/arcade-assets/emulation/og-v2/ringdest.jpg","/emulation/boxart-v2/robo-army-450.webp":"/arcade-assets/emulation/og-v2/roboarmy.jpg","/emulation/boxart-v2/rolling-thunder-2-450.webp":"/arcade-assets/emulation/og-v2/rthun2.jpg","/emulation/boxart-v2/samurai-shodown-450.webp":"/arcade-assets/emulation/og-v2/samsho.jpg","/emulation/boxart-v2/samurai-shodown-ii-450.webp":"/arcade-assets/emulation/og-v2/samsho2.jpg","/emulation/boxart-v2/samurai-shodown-iii-450.webp":"/arcade-assets/emulation/og-v2/samsho3.jpg","/emulation/boxart-v2/samurai-shodown-iv-amakusa-s-revenge-450.webp":"/arcade-assets/emulation/og-v2/samsho4.jpg","/emulation/boxart-v2/samurai-shodown-v-special-450.webp":"/arcade-assets/emulation/og-v2/samsh5fe.jpg","/emulation/boxart-v2/saturday-night-slam-masters-450.webp":"/arcade-assets/emulation/og-v2/slammast.jpg","/emulation/boxart-v2/segasonic-the-hedgehog-450.webp":"/arcade-assets/emulation/og-v2/sonic.jpg","/emulation/boxart-v2/sengoku-450.webp":"/arcade-assets/emulation/og-v2/sengoku.jpg","/emulation/boxart-v2/sengoku-2-450.webp":"/arcade-assets/emulation/og-v2/sengoku2.jpg","/emulation/boxart-v2/sengoku-3-450.webp":"/arcade-assets/emulation/og-v2/sengoku3.jpg","/emulation/boxart-v2/shadow-dancer-450.webp":"/arcade-assets/emulation/og-v2/shdancer.jpg","/emulation/boxart-v2/shock-troopers-450.webp":"/arcade-assets/emulation/og-v2/shocktro.jpg","/emulation/boxart-v2/shock-troopers-2nd-squad-450.webp":"/arcade-assets/emulation/og-v2/shocktr2.jpg","/emulation/boxart-v2/snk-vs-capcom-svc-chaos-450.webp":"/arcade-assets/emulation/og-v2/svc.jpg","/emulation/boxart-v2/snow-bros-nick-and-tom-450.webp":"/arcade-assets/emulation/og-v2/snowbros.jpg","/emulation/boxart-v2/soccer-brawl-450.webp":"/arcade-assets/emulation/og-v2/socbrawl.jpg","/emulation/boxart-v2/space-harrier-450.webp":"/arcade-assets/emulation/og-v2/sharrier.jpg","/emulation/boxart-v2/spinmaster-450.webp":"/arcade-assets/emulation/og-v2/spinmast.jpg","/emulation/boxart-v2/star-wars-450.webp":"/arcade-assets/emulation/og-v2/starwars.jpg","/emulation/boxart-v2/street-fighter-alpha-2-450.webp":"/arcade-assets/emulation/og-v2/sfa2.jpg","/emulation/boxart-v2/street-fighter-alpha-3-450.webp":"/arcade-assets/emulation/og-v2/sfa3.jpg","/emulation/boxart-v2/street-fighter-alpha-warriors-dreams-450.webp":"/arcade-assets/emulation/og-v2/sfa.jpg","/emulation/boxart-v2/street-fighter-ii-champion-edition-450.webp":"/arcade-assets/emulation/og-v2/sf2ce.jpg","/emulation/boxart-v2/street-fighter-ii-hyper-fighting-450.webp":"/arcade-assets/emulation/og-v2/sf2hf.jpg","/emulation/boxart-v2/street-fighter-ii-the-world-warrior-450.webp":"/arcade-assets/emulation/og-v2/sf2.jpg","/emulation/boxart-v2/street-fighter-iii-2nd-impact-450.webp":"/arcade-assets/emulation/og-v2/sfiii2.jpg","/emulation/boxart-v2/street-fighter-iii-3rd-strike-450.webp":"/arcade-assets/emulation/og-v2/sfiii3.jpg","/emulation/boxart-v2/street-fighter-iii-new-generation-450.webp":"/arcade-assets/emulation/og-v2/sfiii.jpg","/emulation/boxart-v2/street-fighter-zero-2-alpha-450.webp":"/arcade-assets/emulation/og-v2/sfz2al.jpg","/emulation/boxart-v2/street-hoop-450.webp":"/arcade-assets/emulation/og-v2/strhoop.jpg","/emulation/boxart-v2/strider-450.webp":"/arcade-assets/emulation/og-v2/strider.jpg","/emulation/boxart-v2/super-dodge-ball-450.webp":"/arcade-assets/emulation/og-v2/sdodgeb.jpg","/emulation/boxart-v2/super-gem-fighter-mini-mix-450.webp":"/arcade-assets/emulation/og-v2/sgemf.jpg","/emulation/boxart-v2/super-hang-on-450.webp":"/arcade-assets/emulation/og-v2/shangon.jpg","/emulation/boxart-v2/super-puzzle-fighter-ii-turbo-450.webp":"/arcade-assets/emulation/og-v2/spf2t.jpg","/emulation/boxart-v2/super-street-fighter-ii-the-new-challengers-450.webp":"/arcade-assets/emulation/og-v2/ssf2.jpg","/emulation/boxart-v2/super-street-fighter-ii-turbo-450.webp":"/arcade-assets/emulation/og-v2/ssf2t.jpg","/emulation/boxart-v2/superman-450.webp":"/arcade-assets/emulation/og-v2/superman.jpg","/emulation/boxart-v2/the-irritating-maze-450.webp":"/arcade-assets/emulation/og-v2/irrmaze.jpg","/emulation/boxart-v2/the-king-of-dragons-450.webp":"/arcade-assets/emulation/og-v2/kod.jpg","/emulation/boxart-v2/the-king-of-fighters-2000-450.webp":"/arcade-assets/emulation/og-v2/kof2000.jpg","/emulation/boxart-v2/the-king-of-fighters-2001-450.webp":"/arcade-assets/emulation/og-v2/kof2001.jpg","/emulation/boxart-v2/the-king-of-fighters-2002-450.webp":"/arcade-assets/emulation/og-v2/kof2002.jpg","/emulation/boxart-v2/the-king-of-fighters-2003-450.webp":"/arcade-assets/emulation/og-v2/kof2003.jpg","/emulation/boxart-v2/the-king-of-fighters-94-450.webp":"/arcade-assets/emulation/og-v2/kof94.jpg","/emulation/boxart-v2/the-king-of-fighters-95-450.webp":"/arcade-assets/emulation/og-v2/kof95.jpg","/emulation/boxart-v2/the-king-of-fighters-96-450.webp":"/arcade-assets/emulation/og-v2/kof96.jpg","/emulation/boxart-v2/the-king-of-fighters-97-450.webp":"/arcade-assets/emulation/og-v2/kof97.jpg","/emulation/boxart-v2/the-king-of-fighters-98-450.webp":"/arcade-assets/emulation/og-v2/kof98.jpg","/emulation/boxart-v2/the-king-of-fighters-99-450.webp":"/arcade-assets/emulation/og-v2/kof99.jpg","/emulation/boxart-v2/the-last-blade-450.webp":"/arcade-assets/emulation/og-v2/lastblad.jpg","/emulation/boxart-v2/the-last-blade-2-450.webp":"/arcade-assets/emulation/og-v2/lastbld2.jpg","/emulation/boxart-v2/the-new-zealand-story-450.webp":"/arcade-assets/emulation/og-v2/tnzs.jpg","/emulation/boxart-v2/the-punisher-450.webp":"/arcade-assets/emulation/og-v2/punisher.jpg","/emulation/boxart-v2/the-super-spy-450.webp":"/arcade-assets/emulation/og-v2/superspy.jpg","/emulation/boxart-v2/the-ultimate-11-snk-football-championship-450.webp":"/arcade-assets/emulation/og-v2/ssideki4.jpg","/emulation/boxart-v2/thrash-rally-450.webp":"/arcade-assets/emulation/og-v2/trally.jpg","/emulation/boxart-v2/three-wonders-450.webp":"/arcade-assets/emulation/og-v2/3wonders.jpg","/emulation/boxart-v2/toki-450.webp":"/arcade-assets/emulation/og-v2/toki.jpg","/emulation/boxart-v2/top-hunter-roddy-and-cathy-450.webp":"/arcade-assets/emulation/og-v2/tophuntr.jpg","/emulation/boxart-v2/truxton-450.webp":"/arcade-assets/emulation/og-v2/truxton.jpg","/emulation/boxart-v2/twin-cobra-450.webp":"/arcade-assets/emulation/og-v2/twincobr.jpg","/emulation/boxart-v2/twin-hawk-450.webp":"/arcade-assets/emulation/og-v2/twinhawk.jpg","/emulation/boxart-v2/twinkle-star-sprites-450.webp":"/arcade-assets/emulation/og-v2/twinspri.jpg","/emulation/boxart-v2/two-crude-dudes-450.webp":"/arcade-assets/emulation/og-v2/twocrude.jpg","/emulation/boxart-v2/u-n-squadron-450.webp":"/arcade-assets/emulation/og-v2/unsquad.jpg","/emulation/boxart-v2/ultimate-mortal-kombat-3-450.webp":"/arcade-assets/emulation/og-v2/umk3.jpg","/emulation/boxart-v2/vampire-hunter-2-darkstalkers-revenge-450.webp":"/arcade-assets/emulation/og-v2/vhunt2.jpg","/emulation/boxart-v2/vampire-savior-2-450.webp":"/arcade-assets/emulation/og-v2/vsav2.jpg","/emulation/boxart-v2/vampire-savior-the-lord-of-vampire-450.webp":"/arcade-assets/emulation/og-v2/vsav.jpg","/emulation/boxart-v2/varth-operation-thunderstorm-450.webp":"/arcade-assets/emulation/og-v2/varth.jpg","/emulation/boxart-v2/viewpoint-450.webp":"/arcade-assets/emulation/og-v2/viewpoin.jpg","/emulation/boxart-v2/volfied-450.webp":"/arcade-assets/emulation/og-v2/volfied.jpg","/emulation/boxart-v2/waku-waku-7-450.webp":"/arcade-assets/emulation/og-v2/wakuwak7.jpg","/emulation/boxart-v2/warriors-of-fate-450.webp":"/arcade-assets/emulation/og-v2/wof.jpg","/emulation/boxart-v2/willow-450.webp":"/arcade-assets/emulation/og-v2/willow.jpg","/emulation/boxart-v2/windjammers-450.webp":"/arcade-assets/emulation/og-v2/wjammers.jpg","/emulation/boxart-v2/x-men-children-of-the-atom-450.webp":"/arcade-assets/emulation/og-v2/xmcota.jpg","/emulation/boxart-v2/x-men-vs-street-fighter-450.webp":"/arcade-assets/emulation/og-v2/xmvsf.jpg","/emulation/boxart-v2/zed-blade-450.webp":"/arcade-assets/emulation/og-v2/zedblade.jpg","/emulation/boxart-v2/zero-wing-450.webp":"/arcade-assets/emulation/og-v2/zerowing.jpg","/emulation/boxart-v2/zupapa-450.webp":"/arcade-assets/emulation/og-v2/zupapa.jpg"};
  function lp(n) {
    n = n.replace(/^\/wasm-mirror/, "");
    var i;
    for (i = 0; i < LP.length; i++) if (n.indexOf(LP[i]) === 0) return "/arcade-assets" + n;
    return AL[n] || null;
  }
  function rw(u) {
    if (typeof u !== "string" || !u.length) return u;
    if (u.charAt(0) === "#") return u;
    try {
      var url = new URL(u, location.href);
      if (url.protocol !== "https:" && url.protocol !== "http:") return u;
      if (url.origin !== S && url.origin !== location.origin) return u;
      if (url.pathname.indexOf(M + "/") === 0) return url.pathname + url.search + url.hash;
      var l = lp(url.pathname);
      if (l) return l + url.search + url.hash;
      return M + url.pathname + url.search + url.hash;
    } catch (e) { return u; }
  }
  var _fetch = window.fetch ? window.fetch.bind(window) : null;
  if (_fetch) {
    window.fetch = function (input, init) {
      try {
        if (typeof input === "string") input = rw(input);
        else if (input && typeof input === "object" && typeof input.url === "string") {
          var nu = rw(input.url);
          if (nu !== input.url) { try { input = new Request(nu, input); } catch (e) {} }
        }
      } catch (e) {}
      return _fetch(input, init);
    };
  }
  try {
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, u) {
      try { arguments[1] = rw(u); } catch (e) {}
      return _open.apply(this, arguments);
    };
    var _sa = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (n, v) {
      try { if ((n === "src" || n === "href") && typeof v === "string") v = rw(v); } catch (e) {}
      return _sa.call(this, n, v);
    };
    var types = ["HTMLScriptElement","HTMLLinkElement","HTMLImageElement","HTMLSourceElement","HTMLAudioElement","HTMLVideoElement"];
    for (var i = 0; i < types.length; i++) {
      var proto = window[types[i]];
      if (!proto) continue;
      var props = types[i] === "HTMLLinkElement" ? ["href"] : ["src"];
      for (var j = 0; j < props.length; j++) {
        (function (name) {
          var d = Object.getOwnPropertyDescriptor(proto, name);
          if (!d || !d.set || !d.configurable) return;
          Object.defineProperty(proto, name, {
            configurable: true, enumerable: true,
            get: function () { return d.get.call(this); },
            set: function (v) { try { d.set.call(this, rw(v)); } catch (e) {} }
          });
        })(props[j]);
      }
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register = function () {
        return Promise.reject(new Error("service worker desativado no espelho"));
      };
    }
  } catch (e) {}
})();
</script>
`;

function esc(p: string): string {
  const url = new URL(p, SOURCE);
  const la = localCandidates(url.pathname)[0];
  if (la) return la + url.search + url.hash;
  return MIRROR + url.pathname + url.search + url.hash;
}

export function rewriteArcadeHtml(html: string, path: string, nonce: string): string {
  let out = html.replace(
    /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    "",
  );

  // origens absolutas entre aspas: "https://wasmarcade.com/x" ou "//wasmarcade.com/x"
  out = out.replace(/"(?:https?:)?\/\/wasmarcade\.com[^"]*"/g, (m: string) => {
    const inner = m.slice(1, -1);
    const rest = inner.replace(/^(?:https?:)?\/\/wasmarcade\.com/i, "");
    return '"' + esc(rest.startsWith("/") ? rest : "/" + rest) + '"';
  });

  // atributos raiz-absolutos: src="/assets/index.js", href="/emulation/...", content="/og/x.jpg"
  // (o guard evita re-embalar valores já reescritos pela regra de origem)
  out = out.replace(
    /((?:src|href|content|poster)\s*=\s*)"(\/[^"]*)"/gi,
    (_m: string, a: string, v: string) =>
      (v.startsWith(MIRROR) || v.startsWith("/arcade-assets/")) ? _m : a + '"' + esc(v) + '"',
  );

  // srcset/imageSrcSet: cada URL da lista é reescrita individualmente
  out = out.replace(/(srcset|imagesrcset)\s*=\s*"([^"]*)"/gi, (_m: string, a: string, v: string) => {
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    const remapped = parts.map((s) => {
      const bits = s.split(/\s+/);
      const url = bits[0];
      if (!url || url.startsWith(MIRROR) || url.startsWith("/arcade-assets/") || url.startsWith("data:")) return s;
      return esc(url.startsWith("/") ? url : "/" + url) + (bits.length > 1 ? " " + bits.slice(1).join(" ") : "");
    });
    return a + '="' + remapped.join(", ") + '"';
  });

  // atributos relativos do bundle Vite: src="assets/chunk.js"
  out = out.replace(
    /((?:src|href)\s*=\s*)"((?:assets|fonts|img|media)\/[A-Za-z0-9._\-/]+)"/gi,
    (_m: string, a: string, v: string) => a + '"' + esc("/" + v) + '"',
  );

  // injeta o patch logo após a abertura de <head>
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, (_m: string, attrs: string) => `<head${attrs}>\n${INJECT}`);
  } else {
    out = INJECT + out;
  }

  out = out.replace(/<script\b[^>]*static\.cloudflareinsights\.com[^>]*>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<(script|style)\b([^>]*)>/gi, (_match, tag: string, attrs: string) =>
    `<${tag}${attrs.replace(/\snonce\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")} nonce="${nonce}">`,
  );
  const locationScript = `<script nonce="${nonce}">history.replaceState(null,"",${JSON.stringify(path).replaceAll("<", "\\u003c")});</script>`;
  return out.replace(/<head[^>]*>/i, (head) => head + locationScript);
}


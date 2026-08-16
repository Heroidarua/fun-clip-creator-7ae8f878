// Gerado a partir do catálogo retrogames.cc — 2.757 jogos
export type Game = {
  id: number;
  title: string;
  platform: string;
  src: string;
  img?: string;
};

// Use explicit type annotation to avoid TS2590 "too complex" error
export const games: Array<Game> = [
  { id: 1, title: "'96 Flag Rally", platform: "arcade-games", src: "https://www.retrogames.cc/embed/33038-96-flag-rally.html", img: "https://i.987967.xyz/screenshot/19/2018/01/03/33038_3c742ce38aba393bc3360dc9e835b40b4a950d5f.png" },
  { id: 2, title: "1000 Miglia: Great 1000 Miles Rally (94/05/10)", platform: "arcade-games", src: "https://www.retrogames.cc/embed/33039-1000-miglia-great-1000-miles-rally-94-05-10.html", img: "https://i.987967.xyz/screenshot/19/2018/01/05/33039_dd182b28071479a07cb16e545fd9456d896d3e01.png" },
  { id: 3, title: "1000 Miglia: Great 1000 Miles Rally (94/06/13)", platform: "arcade-games", src: "https://www.retrogames.cc/embed/gtmra-1000-miglia:-great-1000-miles-rally-940613.html", img: "https://i.987967.xyz/previews/gtmra.png" },

];

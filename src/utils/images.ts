// Curated, verified Unsplash photos (free-to-use under the Unsplash License)
// used to give each screen a premium, photo-real feel alongside our own
// illustrations. Sized via the `w`/`q` query params Unsplash's CDN supports.
function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;
}

export const IMAGES = {
  loginHero: unsplash("1646908499080-e412060bcfe2", 1600), // dramatic espresso + scattered beans
  pantryHero: unsplash("1743427539024-217d19eb0850", 1600), // coffee in glass cup nestled in roasted beans
  coffeeCard: unsplash("1708529398420-8725ab8d7924", 800), // 3D-rendered paper coffee cups
  teaCard: unsplash("1637167085833-f6aac03a9aa5", 800), // 3D-rendered ceramic teapot & cup
  beanHeart: unsplash("1733833199065-1689a1f25de9", 400), // coffee beans arranged as a heart
};

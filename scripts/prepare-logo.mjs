/**
 * Génère les déclinaisons du logo officiel à partir de l'image source (fond blanc).
 *
 * Usage : node scripts/prepare-logo.mjs <logo-source>
 * Exemple : node scripts/prepare-logo.mjs ../img/logo-ktgw-officiel.jpg
 *
 * Fichiers produits :
 *  - public/images/logo-ktgw.png         logo complet, fond transparent, marges retirées
 *  - public/images/logo-ktgw-symbol.png  symbole seul (soleil + vagues), fond transparent
 *  - public/images/og-default.png        image de partage réseaux sociaux 1200 × 630
 *  - src/app/icon.png                    favicon 512 × 512 (convention Next.js)
 *  - src/app/apple-icon.png              icône écran d'accueil iOS 180 × 180
 */
import sharp from "sharp";

const src = process.argv[2];
if (!src) {
  console.error("Usage : node scripts/prepare-logo.mjs <logo-source>");
  process.exit(1);
}

const PAPER = { r: 255, g: 253, b: 248, alpha: 1 }; // --paper
const NOISE = 14; // écart au blanc ignoré (artefacts JPEG)
const SOLID = 120; // écart au blanc à partir duquel le pixel est opaque

/**
 * Remplace le fond blanc par de la transparence.
 * Les pixels de bord (anti-crénelage) reçoivent une opacité partielle et leur
 * couleur est « dé-mélangée » du blanc, pour éviter un liseré clair sur fond sombre.
 */
async function whiteToAlpha(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);

  for (let p = 0; p < info.width * info.height; p++) {
    const [r, g, b] = [data[p * 3], data[p * 3 + 1], data[p * 3 + 2]];
    const dev = Math.max(255 - r, 255 - g, 255 - b);
    const a = Math.min(1, Math.max(0, (dev - NOISE) / (SOLID - NOISE)));
    const unmix = (c) => (a > 0 ? Math.round(Math.min(255, Math.max(0, (c - 255 * (1 - a)) / a))) : 0);
    out.set([unmix(r), unmix(g), unmix(b), Math.round(a * 255)], p * 4);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

/** Boîte englobante des pixels non blancs, éventuellement limitée à une bande verticale. */
async function bbox(input, { fromY = 0, toY = Infinity } = {}) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let [minX, minY, maxX, maxY] = [info.width, info.height, 0, 0];
  for (let y = fromY; y < Math.min(info.height, toY); y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 3;
      if (Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]) > 40) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Première ligne vide sous le symbole = séparation symbole / texte. */
async function symbolBottom(input, startY) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = startY; y < info.height; y++) {
    let empty = true;
    for (let x = 0; x < info.width && empty; x++) {
      const i = (y * info.width + x) * 3;
      if (Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]) > 40) empty = false;
    }
    if (empty) return y;
  }
  return info.height;
}

const pad = (box, n, max) => ({
  left: Math.max(0, box.left - n),
  top: Math.max(0, box.top - n),
  width: Math.min(max.w - Math.max(0, box.left - n), box.width + 2 * n),
  height: Math.min(max.h - Math.max(0, box.top - n), box.height + 2 * n),
});

const meta = await sharp(src).metadata();
const size = { w: meta.width, h: meta.height };

// 1. Logo complet transparent
const full = pad(await bbox(src), 4, size);
const fullPng = await (await whiteToAlpha(await sharp(src).extract(full).toBuffer())).png().toBuffer();
await sharp(fullPng).toFile("public/images/logo-ktgw.png");
console.log(`logo-ktgw.png          ${full.width}×${full.height}`);

// 2. Symbole seul (soleil + vagues)
const top = (await bbox(src)).top;
const symbol = pad(await bbox(src, { toY: await symbolBottom(src, top) }), 4, size);
const symbolPng = await (await whiteToAlpha(await sharp(src).extract(symbol).toBuffer())).png().toBuffer();
await sharp(symbolPng).toFile("public/images/logo-ktgw-symbol.png");
console.log(`logo-ktgw-symbol.png   ${symbol.width}×${symbol.height}`);

// 3. Favicon et icône iOS : symbole centré dans un carré
const square = (px, padding, background) =>
  sharp(symbolPng)
    .resize(px - 2 * padding, px - 2 * padding, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background })
    .flatten(background.alpha === 1 ? { background } : false)
    .png();
await square(512, 24, { r: 0, g: 0, b: 0, alpha: 0 }).toFile("src/app/icon.png");
await square(180, 20, { r: 255, g: 255, b: 255, alpha: 1 }).toFile("src/app/apple-icon.png");
console.log("icon.png 512×512 · apple-icon.png 180×180");

// 4. Image Open Graph : logo complet centré sur fond crème
const ogLogo = await sharp(fullPng).resize({ height: 440 }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: PAPER } })
  .composite([{ input: ogLogo, gravity: "center" }])
  .png()
  .toFile("public/images/og-default.png");
console.log("og-default.png         1200×630");

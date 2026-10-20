/**
 * Convertit les photos sources en WebP optimisé dans /public/images.
 *
 * Usage : node scripts/optimize-images.mjs <dossier-source>
 * Exemple : node scripts/optimize-images.mjs ../img
 *
 * La table MAPPING associe chaque fichier source au nom attendu par le site.
 * Les photos sont redimensionnées à 2000 px de large au maximum (jamais agrandies).
 */
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAPPING = {
  "img-20230414-wa0029.webp": "inauguration-ruban.webp",
  "img-20230414-wa0030-850x560.jpg": "photo-groupe-ouvriers.webp",
  "img-20230414-wa0043.webp": "discours-ouvriers.webp",
  "img-20230414-wa0047.jpg": "invites-ceremonie.webp",
  "img-20230414-wa0045.jpg": "pretre-discours.webp",
  "img-20230414-wa0042.jpg": "plantation-ambassade.webp",
  "img-20230414-wa0039.jpg": "plantation-hibiscus.webp",
  "img-20230414-wa0028.jpg": "plantation-partenaires.webp",
  "img-20230414-wa0038.jpg": "plantation-femme-ouvriers.webp",
  "img-20230414-wa00331.jpg": "benediction-plantation.webp",
};

const LOGO = { from: "cropped-KTGW-LOGO-Vektor.png", to: "logo-ktgw.png" };

const srcDir = process.argv[2];
if (!srcDir) {
  console.error("Usage : node scripts/optimize-images.mjs <dossier-source>");
  process.exit(1);
}
const outDir = path.resolve("public/images");
await mkdir(outDir, { recursive: true });

for (const [from, to] of Object.entries(MAPPING)) {
  const info = await sharp(path.join(srcDir, from))
    .rotate() // applique l'orientation EXIF
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, to));
  console.log(`${to.padEnd(32)} ${info.width}×${info.height}  ${Math.round(info.size / 1024)} Ko`);
}

// Le logo reste en PNG (transparence, netteté du texte)
await copyFile(path.join(srcDir, LOGO.from), path.join(outDir, LOGO.to));
console.log(`${LOGO.to.padEnd(32)} copié`);

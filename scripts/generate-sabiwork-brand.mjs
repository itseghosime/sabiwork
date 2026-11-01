import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// ============================================================================
// Master SabiWork Ribbon-S SVG Specification
// ============================================================================
export const sabiworkIconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Top Ribbon Arc: Electric Cyan -> Sky Blue -> Cerulean Deep -->
    <linearGradient id="swTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="42%" stop-color="#38A8E8"/>
      <stop offset="100%" stop-color="#006BB3"/>
    </linearGradient>

    <!-- Bottom Ribbon Arc: Vibrant Cobalt -> Edo Guild Navy Deep -->
    <linearGradient id="swBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1478B5"/>
      <stop offset="55%" stop-color="#0E3A66"/>
      <stop offset="100%" stop-color="#0A1E36"/>
    </linearGradient>

    <!-- 3D Overlap Fold Shading -->
    <linearGradient id="swFoldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#051324" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#051324" stop-opacity="0"/>
    </linearGradient>

    <!-- Gloss Highlight Arch -->
    <linearGradient id="swGloss" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>

    <!-- High-Precision Ambient Drop Shadow -->
    <filter id="swShadow" x="-15%" y="-15%" width="130%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0A1E36" flood-opacity="0.22"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#38A8E8" flood-opacity="0.25"/>
    </filter>
  </defs>

  <g filter="url(#swShadow)">
    <!-- 1. BOTTOM RIBBON (Navy to Cobalt) -->
    <path d="M 238 230
             C 290 250, 385 290, 385 365
             C 385 435, 325 465, 256 465
             C 175 465, 127 420, 127 365
             C 127 335, 150 312, 180 312
             C 208 312, 226 333, 230 355
             C 236 385, 245 405, 256 405
             C 285 405, 315 385, 315 352
             C 315 305, 250 270, 198 240
             L 238 230 Z" 
          fill="url(#swBottomGrad)"/>

    <!-- 2. TOP RIBBON (Electric Cyan to Sky Blue) -->
    <path d="M 274 282
             C 222 262, 127 222, 127 147
             C 127 77, 187 47, 256 47
             C 337 47, 385 92, 385 147
             C 385 177, 362 200, 332 200
             C 304 200, 286 179, 282 157
             C 276 127, 267 107, 256 107
             C 227 107, 197 127, 197 160
             C 197 207, 262 242, 314 272
             L 274 282 Z"
          fill="url(#swTopGrad)"/>

    <!-- 3. DIAGONAL INTERLOCK CONNECTOR -->
    <path d="M 198 240
             C 250 270, 315 305, 315 352
             L 314 272
             C 262 242, 197 207, 197 160
             Z"
          fill="url(#swTopGrad)"/>

    <!-- 4. 3D FOLD OVERLAY SHADOW -->
    <path d="M 238 230
             L 274 282
             C 255 272, 230 256, 210 240
             Z"
          fill="url(#swFoldShadow)"/>

    <!-- 5. GLOSS HIGHLIGHT ON UPPER ARCH -->
    <path d="M 185 125
             C 205 90, 235 75, 270 75
             C 310 75, 345 92, 360 120
             C 345 102, 315 88, 275 88
             C 240 88, 205 102, 190 120
             Z"
          fill="url(#swGloss)"/>

    <!-- 6. CRAFTSMAN GUILD STAR (Central Verified Spark) -->
    <g transform="translate(256, 256)">
      <path d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" 
            fill="#FFFFFF" 
            opacity="0.96"/>
      <circle cx="0" cy="0" r="3.5" fill="#00D2FF"/>
    </g>
  </g>
</svg>`;

// ============================================================================
// Full Horizontal Lockup Logo (Icon + Typography + Tagline)
// ============================================================================
export const sabiworkFullLogoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 160" width="680" height="160">
  <defs>
    <linearGradient id="fullTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="42%" stop-color="#38A8E8"/>
      <stop offset="100%" stop-color="#006BB3"/>
    </linearGradient>
    <linearGradient id="fullBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1478B5"/>
      <stop offset="55%" stop-color="#0E3A66"/>
      <stop offset="100%" stop-color="#0A1E36"/>
    </linearGradient>
    <linearGradient id="fullFoldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#051324" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#051324" stop-opacity="0"/>
    </linearGradient>
    <filter id="fullShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0A1E36" flood-opacity="0.18"/>
    </filter>
  </defs>

  <!-- Left Icon Mark (Scaled & Positioned) -->
  <g transform="translate(16, 16) scale(0.25)" filter="url(#fullShadow)">
    <path d="M 238 230 C 290 250, 385 290, 385 365 C 385 435, 325 465, 256 465 C 175 465, 127 420, 127 365 C 127 335, 150 312, 180 312 C 208 312, 226 333, 230 355 C 236 385, 245 405, 256 405 C 285 405, 315 385, 315 352 C 315 305, 250 270, 198 240 L 238 230 Z" fill="url(#fullBottomGrad)"/>
    <path d="M 274 282 C 222 262, 127 222, 127 147 C 127 77, 187 47, 256 47 C 337 47, 385 92, 385 147 C 385 177, 362 200, 332 200 C 304 200, 286 179, 282 157 C 276 127, 267 107, 256 107 C 227 107, 197 127, 197 160 C 197 207, 262 242, 314 272 L 274 282 Z" fill="url(#fullTopGrad)"/>
    <path d="M 198 240 C 250 270, 315 305, 315 352 L 314 272 C 262 242, 197 207, 197 160 Z" fill="url(#fullTopGrad)"/>
    <path d="M 238 230 L 274 282 C 255 272, 230 256, 210 240 Z" fill="url(#fullFoldShadow)"/>
    <g transform="translate(256, 256)">
      <path d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill="#FFFFFF" opacity="0.96"/>
      <circle cx="0" cy="0" r="3.5" fill="#00D2FF"/>
    </g>
  </g>

  <!-- Typographic Brand Logotype -->
  <text x="164" y="94" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', Inter, sans-serif" font-size="64" font-weight="800" letter-spacing="-0.03em" fill="#0E294B">Sabi<tspan fill="#38A8E8">Work</tspan></text>
  <text x="168" y="128" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', Inter, sans-serif" font-size="20" font-weight="500" letter-spacing="0.01em" fill="#5B6B7F">Skilled hands. Trusted work.</text>
</svg>`;

async function buildBrandAssets() {
  const imagesDir = path.resolve(process.cwd(), "public/images");
  const appDir = path.resolve(process.cwd(), "src/app");

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 1. Write SVG Icon
  const iconSvgPath = path.join(imagesDir, "sabiwork-icon.svg");
  fs.writeFileSync(iconSvgPath, sabiworkIconSvg, "utf8");
  console.log(`[Asset] Wrote ${iconSvgPath}`);

  // 2. Write SVG App Icon for Next.js App Router
  const appIconPath = path.join(appDir, "icon.svg");
  fs.writeFileSync(appIconPath, sabiworkIconSvg, "utf8");
  console.log(`[Asset] Wrote ${appIconPath}`);

  // 3. Write Full SVG Logo Lockup
  const fullLogoPath = path.join(imagesDir, "sabiwork-logo.svg");
  fs.writeFileSync(fullLogoPath, sabiworkFullLogoSvg, "utf8");
  console.log(`[Asset] Wrote ${fullLogoPath}`);

  // 4. Render Master PNG Icon (Replacing old sabiwork-icon.png at 1024x1024)
  const masterPngPath = path.join(imagesDir, "sabiwork-icon.png");
  await sharp(Buffer.from(sabiworkIconSvg))
    .resize(1024, 1024, { fit: "contain" })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(masterPngPath);
  console.log(`[Asset] Generated high-res master PNG: ${masterPngPath}`);

  // 5. Update public/images/ASSETS.md
  const assetsMdPath = path.join(imagesDir, "ASSETS.md");
  const assetsMd = `# SabiWork Brand Assets

- \`sabiwork-icon.svg\`: Modern scalable vector Ribbon-S mark featuring dual-tone cerulean/sky-blue (#38A8E8 / #00D2FF) and deep navy (#0E294B) ribbons with an embedded central guild diamond star.
- \`sabiwork-icon.png\`: High-resolution 1024x1024 master raster export of the Ribbon-S mark with transparent alpha channel, perfectly centered with balanced margins.
- \`sabiwork-logo.svg\`: Full horizontal brand lockup featuring the Ribbon-S mark paired with decoupled editable typography "SabiWork" and tagline "Skilled hands. Trusted work."
- \`artisan-demo-sheet.png\`: Generated on 29 October 2026 for this prototype, showing five illustrative Nigerian artisans. These are fictional people, not actual providers or endorsements. Missing photos use initials.

All brand assets are local, vector-scaled, and licensed for SabiWork.
`;
  fs.writeFileSync(assetsMdPath, assetsMd, "utf8");
  console.log(`[Asset] Updated ${assetsMdPath}`);
}

buildBrandAssets().catch((err) => {
  console.error("Brand build failed:", err);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ARTIFACT_DIR = "/Users/mac/.gemini/antigravity/brain/c8e7c13b-95d9-499f-8541-43972e185436";

// ============================================================================
// CONCEPT 1: THE GUILD HEX SHIELD "S" (INTERLOCKING ARCHITECTURAL SHIELD)
// ============================================================================
export const logoOption1Svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Cyan to Sky Gradient for Upper Segment -->
    <linearGradient id="opt1CyanSky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF"/>
      <stop offset="50%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>

    <!-- Deep Navy to Cobalt Gradient for Lower Foundation -->
    <linearGradient id="opt1NavyCobalt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E40AF"/>
      <stop offset="60%" stop-color="#0E294B"/>
      <stop offset="100%" stop-color="#08172E"/>
    </linearGradient>

    <!-- Mid Connector Gradient -->
    <linearGradient id="opt1MidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>

    <!-- Subtle Ambient Drop Shadow -->
    <filter id="opt1DropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#08172E" flood-opacity="0.25"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0284C7" flood-opacity="0.2"/>
    </filter>
  </defs>

  <g filter="url(#opt1DropShadow)">
    <!-- OUTER SHIELD ACCENT / BACKGROUND BADGE (Hexagonal Guild Contour) -->
    <rect x="36" y="36" width="440" height="440" rx="96" fill="#FFFFFF" fill-opacity="0.04" stroke="rgba(2, 132, 199, 0.15)" stroke-width="2"/>

    <!-- SEGMENT A: LOWER FOUNDATION HOOK (Navy / Cobalt) -->
    <!-- Geometric interlocking architectural block forming bottom loop of S -->
    <path d="M 120 330
             L 120 400
             C 120 424, 140 444, 164 444
             L 348 444
             C 372 444, 392 424, 392 400
             L 392 276
             C 392 252, 372 232, 348 232
             L 240 232
             L 240 300
             L 316 300
             C 324 300, 330 306, 330 314
             L 330 366
             C 330 374, 324 380, 316 380
             L 196 380
             C 188 380, 182 374, 182 366
             L 182 330
             Z"
          fill="url(#opt1NavyCobalt)"/>

    <!-- SEGMENT B: UPPER SKY HOOK (Electric Cyan / Sky Blue) -->
    <!-- Interlocking top block of S -->
    <path d="M 392 182
             L 392 112
             C 392 88, 372 68, 348 68
             L 164 68
             C 140 68, 120 88, 120 112
             L 120 236
             C 120 260, 140 280, 164 280
             L 272 280
             L 272 212
             L 196 212
             C 188 212, 182 206, 182 198
             L 182 146
             C 182 138, 188 132, 196 132
             L 316 132
             C 324 132, 330 138, 330 146
             L 330 182
             Z"
          fill="url(#opt1CyanSky)"/>

    <!-- SEGMENT C: CENTRAL INTERLOCKING BRIDGE (45-degree Joint) -->
    <path d="M 240 232
             L 272 212
             L 272 280
             L 240 300
             Z"
          fill="url(#opt1MidGrad)"/>

    <!-- GUILD SPARK (Precision Star in Negative Space) -->
    <g transform="translate(356, 156)">
      <polygon points="0,-16 4.5,-4.5 16,0 4.5,4.5 0,16 -4.5,4.5 -16,0 -4.5,-4.5" fill="#00E5FF"/>
      <circle cx="0" cy="0" r="2.5" fill="#FFFFFF"/>
    </g>

    <g transform="translate(156, 356)">
      <polygon points="0,-12 3.5,-3.5 12,0 3.5,3.5 0,12 -3.5,3.5 -12,0 -3.5,-3.5" fill="#38A8E8" opacity="0.85"/>
    </g>
  </g>
</svg>`;


// ============================================================================
// CONCEPT 2: THE MODERN INFINITY CRAFT LOOP (ARCHITECTURAL MÖBIUS "S")
// ============================================================================
export const logoOption2Svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="opt2GradientSky" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>

    <linearGradient id="opt2GradientNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="60%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <linearGradient id="opt2Glow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
    </linearGradient>

    <filter id="opt2Shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0284C7" flood-opacity="0.25"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.3"/>
    </filter>
  </defs>

  <g filter="url(#opt2Shadow)">
    <!-- Base Glow -->
    <circle cx="256" cy="256" r="180" fill="url(#opt2Glow)" opacity="0.15"/>

    <!-- Continuous Bold Infinity Stream: Lower Loop (Navy) -->
    <path d="M 256 256
             C 320 220, 400 250, 400 330
             C 400 410, 310 440, 240 440
             C 150 440, 112 370, 112 330
             C 112 295, 140 270, 175 270
             C 205 270, 225 292, 225 320
             C 225 345, 245 365, 275 365
             C 305 365, 325 345, 325 325
             C 325 295, 290 275, 256 256
             Z"
          fill="url(#opt2GradientNavy)"/>

    <!-- Continuous Bold Infinity Stream: Upper Loop (Electric Sky) -->
    <path d="M 256 256
             C 192 292, 112 262, 112 182
             C 112 102, 202 72, 272 72
             C 362 72, 400 142, 400 182
             C 400 217, 372 242, 337 242
             C 307 242, 287 220, 287 192
             C 287 167, 267 147, 237 147
             C 207 147, 187 167, 187 187
             C 187 217, 222 237, 256 256
             Z"
          fill="url(#opt2GradientSky)"/>

    <!-- Central Overlap Fold / Joint Highlight -->
    <path d="M 222 237 L 287 192 L 256 256 Z" fill="#00E5FF" opacity="0.7"/>
    <path d="M 290 275 L 225 320 L 256 256 Z" fill="#0369A1" opacity="0.6"/>

    <!-- Guild Spark Center -->
    <circle cx="256" cy="256" r="6" fill="#FFFFFF"/>
    <circle cx="256" cy="256" r="10" stroke="#00E5FF" stroke-width="2" fill="none" opacity="0.8"/>
  </g>
</svg>`;


// ============================================================================
// CONCEPT 3: THE GEOMETRIC GUILD CUBIC / PRISM "S" (MODERN MINIMALIST)
// ============================================================================
export const logoOption3Svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="opt3Top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <linearGradient id="opt3Mid" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>

    <linearGradient id="opt3Bot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A"/>
      <stop offset="100%" stop-color="#0B132B"/>
    </linearGradient>

    <filter id="opt3Shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#0B132B" flood-opacity="0.25"/>
    </filter>
  </defs>

  <g filter="url(#opt3Shadow)">
    <!-- Squircle Foundation Container -->
    <rect x="40" y="40" width="432" height="432" rx="112" fill="#0B132B"/>

    <!-- Subtle Inner Border -->
    <rect x="41" y="41" width="430" height="430" rx="111" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="2"/>

    <!-- TOP BAR OF S -->
    <rect x="136" y="120" width="240" height="64" rx="20" fill="url(#opt3Top)"/>
    <!-- TOP VERTICAL HOOK -->
    <rect x="136" y="120" width="68" height="136" rx="20" fill="url(#opt3Top)"/>

    <!-- MIDDLE DIAGONAL BRIDGE -->
    <path d="M 136 216
             L 376 296
             C 376 296, 360 360, 316 360
             L 196 360
             Z"
          fill="url(#opt3Mid)" opacity="0.35"/>

    <!-- MIDDLE CROSS BAR -->
    <rect x="136" y="224" width="240" height="64" rx="20" fill="url(#opt3Mid)"/>

    <!-- BOTTOM VERTICAL HOOK -->
    <rect x="308" y="256" width="68" height="136" rx="20" fill="url(#opt3Bot)"/>
    <!-- BOTTOM BAR OF S -->
    <rect x="136" y="328" width="240" height="64" rx="20" fill="url(#opt3Bot)"/>

    <!-- THE "SABI" SPARK / STAR OF MASTERY -->
    <g transform="translate(320, 152)">
      <polygon points="0,-14 4,-4 14,0 4,4 0,14 -4,4 -14,0 -4,-4" fill="#FFFFFF"/>
      <circle cx="0" cy="0" r="2.5" fill="#38BDF8"/>
    </g>
  </g>
</svg>`;

// ============================================================================
// HORIZONTAL LOCKUP GENERATOR
// ============================================================================
export function generateHorizontalLockupSvg(iconSvg) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" width="720" height="180">
  <defs>
    <style>
      .brand-title {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 54px;
        font-weight: 800;
        letter-spacing: -1.5px;
      }
      .brand-sabi { fill: #0E294B; }
      .brand-work { fill: #0284C7; }
      .brand-tag {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 17px;
        font-weight: 600;
        fill: #64748B;
        letter-spacing: 0.2px;
      }
      .brand-dot { fill: #0284C7; }
    </style>
  </defs>

  <!-- Embed icon on the left (140x140 at x=20, y=20) -->
  <g transform="translate(20, 20) scale(0.2734375)">
    ${iconSvg.replace(/<\?xml.*?\?>/, "").replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "")}
  </g>

  <!-- Decoupled Typographic Branding on the right -->
  <g transform="translate(180, 88)">
    <text class="brand-title">
      <tspan class="brand-sabi">Sabi</tspan><tspan class="brand-work">Work</tspan>
    </text>
    <text x="4" y="36" class="brand-tag">
      Skilled hands<tspan class="brand-dot"> • </tspan>Trusted work.
    </text>
  </g>
</svg>`;
}

// Generate all files
async function main() {
  console.log("Generating logo design options...");

  // 1. Write SVGs to artifacts
  const opt1Path = path.join(ARTIFACT_DIR, "logo-option-1-hex-shield.svg");
  const opt2Path = path.join(ARTIFACT_DIR, "logo-option-2-infinity-loop.svg");
  const opt3Path = path.join(ARTIFACT_DIR, "logo-option-3-cubic-prism.svg");

  fs.writeFileSync(opt1Path, logoOption1Svg, "utf8");
  fs.writeFileSync(opt2Path, logoOption2Svg, "utf8");
  fs.writeFileSync(opt3Path, logoOption3Svg, "utf8");

  // 2. Render PNGs using Sharp for visual inspection
  await sharp(Buffer.from(logoOption1Svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ARTIFACT_DIR, "logo-option-1-hex-shield.png"));
  console.log("Rendered logo-option-1-hex-shield.png");

  await sharp(Buffer.from(logoOption2Svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ARTIFACT_DIR, "logo-option-2-infinity-loop.png"));
  console.log("Rendered logo-option-2-infinity-loop.png");

  await sharp(Buffer.from(logoOption3Svg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(ARTIFACT_DIR, "logo-option-3-cubic-prism.png"));
  console.log("Rendered logo-option-3-cubic-prism.png");

  // 3. Render horizontal lockup
  const lockupSvg = generateHorizontalLockupSvg(logoOption1Svg);
  fs.writeFileSync(path.join(ARTIFACT_DIR, "logo-option-1-lockup.svg"), lockupSvg, "utf8");
  await sharp(Buffer.from(lockupSvg))
    .resize(1440, 360)
    .png()
    .toFile(path.join(ARTIFACT_DIR, "logo-option-1-lockup.png"));
  console.log("Rendered logo-option-1-lockup.png");

  // 4. Update the active application brand files with Option 1 (Interlocking Hex Shield S)
  const appSvgPath = "/Users/mac/Documents/2026/sabiwork/public/images/sabiwork-icon.svg";
  const appFaviconPath = "/Users/mac/Documents/2026/sabiwork/src/app/icon.svg";
  const appLogoSvgPath = "/Users/mac/Documents/2026/sabiwork/public/images/sabiwork-logo.svg";
  const appPngPath = "/Users/mac/Documents/2026/sabiwork/public/images/sabiwork-icon.png";

  fs.writeFileSync(appSvgPath, logoOption1Svg, "utf8");
  fs.writeFileSync(appFaviconPath, logoOption1Svg, "utf8");
  fs.writeFileSync(appLogoSvgPath, lockupSvg, "utf8");

  await sharp(Buffer.from(logoOption1Svg))
    .resize(1024, 1024)
    .png()
    .toFile(appPngPath);

  console.log("Successfully updated public/images/sabiwork-icon.png and SVGs with Option 1!");
}

main().catch(console.error);

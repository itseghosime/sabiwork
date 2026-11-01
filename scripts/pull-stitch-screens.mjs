import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.STITCH_API_KEY || "";
if (!API_KEY) {
  console.error("STITCH_API_KEY environment variable is required.");
  process.exit(1);
}
const PROJECT_ID = "6038732663245800013";
const SCREENS_CACHE = "/Users/mac/.gemini/antigravity/brain/c8e7c13b-95d9-499f-8541-43972e185436/.system_generated/steps/2416/output.txt";
const OUTPUT_DIR = path.resolve(process.cwd(), "stitch-screens");

function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/\s*\/\s*/g, "-")
    .replace(/[^a-z0-9-_.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "X-Goog-Api-Key": API_KEY },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let screens = [];
  if (fs.existsSync(SCREENS_CACHE)) {
    const raw = fs.readFileSync(SCREENS_CACHE, "utf8");
    screens = JSON.parse(raw).screens || [];
  } else {
    console.log("Fetching screen list from Stitch API...");
    const listRes = await fetchWithRetry(`https://stitch.googleapis.com/v1/projects/${PROJECT_ID}/screens`);
    screens = listRes.screens || [];
  }

  console.log(`Found ${screens.length} screens in Stitch project ${PROJECT_ID}.`);

  const manifest = [];
  const concurrency = 6;
  const queue = [...screens];
  let completed = 0;
  let failed = 0;

  async function worker(workerId) {
    while (queue.length > 0) {
      const screen = queue.shift();
      if (!screen) break;

      const screenId = screen.name.split("/").pop();
      const title = screen.title || "Untitled";
      const deviceType = screen.deviceType || "UNKNOWN";
      const cleanSlug = sanitizeFilename(title);
      const isHtml = screen.htmlCode && screen.htmlCode.downloadUrl;

      if (!isHtml) {
        console.log(`[Worker ${workerId}] Skipping non-html item: ${title}`);
        continue;
      }

      const filename = `${cleanSlug}.html`;
      const filePath = path.join(OUTPUT_DIR, filename);

      try {
        const payload = await fetchWithRetry(screen.htmlCode.downloadUrl);
        const html = payload.dataString || "";
        fs.writeFileSync(filePath, html, "utf8");
        completed++;

        manifest.push({
          screenId,
          title,
          deviceType,
          filename,
          width: screen.width,
          height: screen.height,
          downloadUrl: screen.htmlCode.downloadUrl,
          sizeBytes: Buffer.byteLength(html, "utf8"),
        });

        if (completed % 10 === 0 || queue.length === 0) {
          console.log(`Progress: ${completed}/${screens.length} downloaded (${failed} failed)...`);
        }
      } catch (err) {
        failed++;
        console.error(`[Worker ${workerId}] Failed to download ${title} (${screenId}):`, err.message);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // Sort manifest naturally by title
  manifest.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));

  // Write manifest.json
  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  // Write summary README.md
  let readme = `# SabiWork Stitch Screens Archive\n\n`;
  readme += `Exported from Google Stitch project **\`${PROJECT_ID}\`** on ${new Date().toISOString()}.\n`;
  readme += `Total screens downloaded: **${manifest.length}**.\n\n`;
  readme += `## Directory Index\n\n`;
  readme += `| Screen ID & Title | Device | Dimensions | File |\n`;
  readme += `| :--- | :--- | :--- | :--- |\n`;

  for (const item of manifest) {
    readme += `| **${item.title}** | \`${item.deviceType}\` | ${item.width}x${item.height} | [\`${item.filename}\`](./${item.filename}) |\n`;
  }

  const readmePath = path.join(OUTPUT_DIR, "README.md");
  fs.writeFileSync(readmePath, readme, "utf8");

  console.log(`\nSuccessfully downloaded ${completed} screens to ${OUTPUT_DIR}!`);
  console.log(`Manifest written to ${manifestPath}`);
  console.log(`README documentation written to ${readmePath}`);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});

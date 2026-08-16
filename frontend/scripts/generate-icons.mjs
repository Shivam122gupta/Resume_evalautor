import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, "public", "logo-icon.svg");
const outDir = path.join(root, "public", "icons");

const svgRaw = fs.readFileSync(svgPath);

const icons = [
  { name: "icon-192.png",          size: 192, pad: 0 },
  { name: "icon-512.png",          size: 512, pad: 0 },
  { name: "icon-maskable-512.png", size: 512, pad: 51 },
  { name: "apple-touch-icon.png",  size: 180, pad: 0 },
];

async function generate() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const icon of icons) {
    const innerSize = icon.size - icon.pad * 2;
    const svgResized = await sharp(svgRaw)
      .resize(innerSize, innerSize, { fit: "contain", background: { r: 249, g: 246, b: 240, alpha: 0 } })
      .png()
      .toBuffer();
    await sharp({
      create: { width: icon.size, height: icon.size, channels: 4, background: { r: 249, g: 246, b: 240, alpha: 255 } },
    })
      .composite([{ input: svgResized, top: icon.pad, left: icon.pad }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(outDir, icon.name));
    console.log("OK " + icon.name + " (" + icon.size + "x" + icon.size + ")");
  }
  console.log("Done - all 4 icons generated from logo-icon.svg");
}

generate().catch((err) => { console.error("FAILED:", err.message); process.exit(1); });

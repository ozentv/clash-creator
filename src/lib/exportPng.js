import { toCanvas } from 'html-to-image';

// Export d'un bloc de la page en image : format normal ou story verticale (1080 × 1920).

const BACKGROUND = '#050507';
const SURFACE = '#0b0b10';
const ACCENT = '#f5c531';
const STORY = { width: 1080, height: 1920, captureWidth: 480 };

// Sont exclus : les éléments marqués data-no-export et les images d'un autre site
// (elles ne peuvent pas être lues pour être dessinées).
function keep(node) {
  if (node.dataset && 'noExport' in node.dataset) return false;
  if (node.tagName === 'IMG') {
    const src = node.currentSrc || node.src || '';
    return src.startsWith(window.location.origin) || src.startsWith('data:') || src.startsWith('blob:');
  }
  return true;
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function capture(node, width) {
  const root = document.documentElement;
  const previous = node.style.cssText;
  root.classList.add('exporting'); // fige les animations pendant la capture
  try {
    if (width) {
      root.classList.add('exporting-story');
      node.style.width = `${width}px`;
      node.style.maxWidth = 'none';
    }
    await document.fonts.ready;
    await nextFrame();
    await nextFrame();
    return await toCanvas(node, { pixelRatio: 2, backgroundColor: SURFACE, filter: keep });
  } finally {
    node.style.cssText = previous;
    root.classList.remove('exporting', 'exporting-story');
  }
}

function roundedImage(ctx, image, x, y, width, height, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.stroke();
}

function paintBackground(ctx, width, height) {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(width, height) * 0.7);
  glow.addColorStop(0, 'rgba(245, 197, 49, 0.2)');
  glow.addColorStop(1, 'rgba(245, 197, 49, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

function paintTexts(ctx, { title, subtitle, x, y, maxWidth, scale = 1 }) {
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${52 * scale}px "Space Grotesk Variable", sans-serif`;
  ctx.fillText(title, x, y, maxWidth);
  if (subtitle) {
    ctx.fillStyle = '#a1a1aa';
    ctx.font = `400 ${26 * scale}px "Inter Variable", sans-serif`;
    ctx.fillText(subtitle, x, y + 66 * scale, maxWidth);
  }
}

function paintBrand(ctx, x, y) {
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 30px "Space Grotesk Variable", sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('Clash', x, y);
  ctx.fillStyle = ACCENT;
  ctx.fillText('Creator', x + ctx.measureText('Clash').width, y);
}

function compose(image, { title, subtitle, story }) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (story) {
    canvas.width = STORY.width;
    canvas.height = STORY.height;
    paintBackground(ctx, canvas.width, canvas.height);
    const margin = 60;
    const top = title ? 300 : 140;
    const bottom = canvas.height - 150;
    if (title) paintTexts(ctx, { title, subtitle, x: margin, y: 140, maxWidth: canvas.width - 2 * margin, scale: 1.25 });
    const scale = Math.min((canvas.width - 2 * margin) / image.width, (bottom - top) / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    roundedImage(ctx, image, (canvas.width - width) / 2, top + (bottom - top - height) / 2, width, height, 28);
    paintBrand(ctx, margin, canvas.height - 70);
    return canvas;
  }

  const pad = 56;
  const header = title ? 150 : 0;
  canvas.width = image.width + 2 * pad;
  canvas.height = image.height + 2 * pad + header + 60;
  paintBackground(ctx, canvas.width, canvas.height);
  if (title) paintTexts(ctx, { title, subtitle, x: pad, y: pad, maxWidth: image.width });
  roundedImage(ctx, image, pad, pad + header, image.width, image.height, 28);
  paintBrand(ctx, pad, canvas.height - 44);
  return canvas;
}

export async function exportImage(node, { filename, title, subtitle, story = false }) {
  const image = await capture(node, story ? STORY.captureWidth : null);
  const canvas = compose(image, { title, subtitle, story });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${filename}${story ? '-story' : ''}.png`;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

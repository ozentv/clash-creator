import { toPng } from 'html-to-image';

export async function exportNodeAsPng(node, filename) {
  await document.fonts.ready;
  const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#101017', cacheBust: true });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

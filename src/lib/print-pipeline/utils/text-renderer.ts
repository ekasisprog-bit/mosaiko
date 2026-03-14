import sharp from 'sharp';
import type { TextRenderOptions } from '../types';

/**
 * Escapes special XML characters for safe SVG rendering.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Calculates the SVG text-anchor attribute from alignment option.
 */
function getTextAnchor(align: TextRenderOptions['align']): string {
  switch (align) {
    case 'left':
      return 'start';
    case 'right':
      return 'end';
    case 'center':
    default:
      return 'middle';
  }
}

/**
 * Calculates the X position for text based on alignment and padding.
 */
function getTextX(
  width: number,
  align: TextRenderOptions['align'],
  padding: number,
): number {
  switch (align) {
    case 'left':
      return padding;
    case 'right':
      return width - padding;
    case 'center':
    default:
      return width / 2;
  }
}

/**
 * Renders text to a PNG buffer via SVG -> Sharp conversion.
 * No Canvas/browser dependency -- fully server-side.
 */
export async function renderTextToBuffer(
  options: TextRenderOptions,
): Promise<Buffer> {
  const {
    text,
    width,
    height,
    fontSize,
    fontFamily = 'sans-serif',
    color = '#FFFFFF',
    backgroundColor,
    align = 'center',
    verticalAlign = 'middle',
    padding = 20,
  } = options;

  const textAnchor = getTextAnchor(align);
  const textX = getTextX(width, align, padding);
  const escapedText = escapeXml(text);

  // Handle multiline text by splitting on newlines
  const lines = escapedText.split('\n');
  const lineHeight = fontSize * 1.3;

  // Adjust starting Y for multiline text centered vertically
  const totalTextHeight = lines.length * lineHeight;
  let startY: number;
  if (verticalAlign === 'middle') {
    startY = (height - totalTextHeight) / 2 + fontSize;
  } else if (verticalAlign === 'top') {
    startY = padding + fontSize;
  } else {
    startY = height - padding - totalTextHeight + fontSize;
  }

  const textElements = lines
    .map(
      (line, i) =>
        `<text x="${textX}" y="${startY + i * lineHeight}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" text-anchor="${textAnchor}" dominant-baseline="auto">${line}</text>`,
    )
    .join('\n    ');

  const bgRect = backgroundColor
    ? `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`
    : '';

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    ${bgRect}
    ${textElements}
  </svg>`;

  return sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toBuffer();
}

/**
 * Renders multiple text blocks onto a single tile.
 * Each block is rendered separately then composited.
 */
export async function renderMultiTextToBuffer(
  blocks: Array<{
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color?: string;
    fontFamily?: string;
    anchor?: 'start' | 'middle' | 'end';
  }>,
  width: number,
  height: number,
  backgroundColor: string,
): Promise<Buffer> {
  const textElements = blocks
    .map(
      (block) =>
        `<text x="${block.x}" y="${block.y}" font-family="${block.fontFamily ?? 'sans-serif'}" font-size="${block.fontSize}" fill="${block.color ?? '#FFFFFF'}" text-anchor="${block.anchor ?? 'middle'}" dominant-baseline="auto">${escapeXml(block.text)}</text>`,
    )
    .join('\n    ');

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${backgroundColor}" />
    ${textElements}
  </svg>`;

  return sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toBuffer();
}

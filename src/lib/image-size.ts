/**
 * Reads intrinsic pixel dimensions from an image buffer.
 *
 * Written by hand rather than pulled from a dependency: the panel only ever
 * receives the handful of formats below, and each one states its size in the
 * first few dozen bytes. The alternative — decoding the whole image — costs far
 * more than reading a header.
 *
 * Returns null for anything unrecognised, which the caller turns into a
 * rejection rather than guessing.
 */
export type Dimensions = { width: number; height: number };

export function readImageSize(buffer: Buffer): Dimensions | null {
  return (
    pngSize(buffer) ??
    gifSize(buffer) ??
    webpSize(buffer) ??
    jpegSize(buffer) ??
    svgSize(buffer)
  );
}

function pngSize(b: Buffer): Dimensions | null {
  // \x89PNG\r\n\x1a\n, then an IHDR chunk whose first two fields are the size.
  if (b.length < 24) return null;
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function gifSize(b: Buffer): Dimensions | null {
  if (b.length < 10) return null;
  if (b.toString("ascii", 0, 3) !== "GIF") return null;
  // Little-endian, unlike every other format here.
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
}

function webpSize(b: Buffer): Dimensions | null {
  if (b.length < 30) return null;
  if (b.toString("ascii", 0, 4) !== "RIFF") return null;
  if (b.toString("ascii", 8, 12) !== "WEBP") return null;

  const format = b.toString("ascii", 12, 16);

  // Lossy: dimensions sit after the 3-byte sync code, 14 bits each.
  if (format === "VP8 ") {
    return {
      width: b.readUInt16LE(26) & 0x3fff,
      height: b.readUInt16LE(28) & 0x3fff,
    };
  }

  // Lossless: 14 bits each, packed across a 32-bit little-endian field.
  if (format === "VP8L") {
    const bits = b.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  // Extended: 24-bit values, stored as one less than the true dimension.
  if (format === "VP8X") {
    const width = b.readUIntLE(24, 3) + 1;
    const height = b.readUIntLE(27, 3) + 1;
    return { width, height };
  }

  return null;
}

function jpegSize(b: Buffer): Dimensions | null {
  if (b.length < 4) return null;
  if (b.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 9 < b.length) {
    if (b[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = b[offset + 1];

    /*
      SOF0–SOF15 carry the frame size. SOF4 (0xc4), SOF8 (0xc8) and SOF12
      (0xcc) are excluded: those codes mean Huffman table, JPEG extensions,
      and arithmetic coding table respectively, not a start-of-frame.
    */
    const isSOF =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isSOF) {
      return {
        height: b.readUInt16BE(offset + 5),
        width: b.readUInt16BE(offset + 7),
      };
    }

    // Skip this segment: two bytes of marker, then its declared length.
    const length = b.readUInt16BE(offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }

  return null;
}

function svgSize(b: Buffer): Dimensions | null {
  // Only the opening tag is examined; an SVG can be arbitrarily long.
  const head = b.toString("utf8", 0, Math.min(b.length, 2048));
  if (!head.includes("<svg")) return null;

  const width = Number(/\bwidth="([\d.]+)/.exec(head)?.[1]);
  const height = Number(/\bheight="([\d.]+)/.exec(head)?.[1]);
  if (Number.isFinite(width) && Number.isFinite(height)) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  // No explicit size, so fall back to the viewBox's own coordinate system.
  const viewBox = /viewBox="([\d.\s-]+)"/.exec(head)?.[1];
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      return { width: Math.round(parts[2]), height: Math.round(parts[3]) };
    }
  }

  return null;
}

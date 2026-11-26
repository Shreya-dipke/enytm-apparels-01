/**
 * Real Garment Color Engine for ENYTM Customization Studio
 * 
 * Provides authentic garment fabric color rendering with:
 * - True textile dye response (realistic highlights, midtone saturation, and deep fold shadows)
 * - Studio background (#090909) and floor pedestal preservation
 * - Static colorway asset routing with instant cache
 * - Client-side dynamic canvas fallback
 */

const STATIC_COLORWAYS = {
  offwhite: true,
  black: true,
  charcoal: true,
  olive: true,
  forest: true,
  navy: true,
  coffee: true,
  terracotta: true,
  burgundy: true,
  beige: true,
  sage: true,
  grey: true,
  lavender: true,
  powderblue: true,
};

/**
 * Returns the exact real photographic asset path for a garment side and colorway.
 * @param {'front' | 'back' | 'left' | 'right'} side 
 * @param {string} colorId
 * @returns {string} URL to the real garment photo
 */
export function getStageTeeImage(side = 'front', colorId = 'offwhite') {
  const cleanSide = ['front', 'back', 'left', 'right'].includes(side) ? side : 'front';
  const cleanColor = (colorId || 'offwhite').toLowerCase();

  if (cleanColor === 'offwhite' || !STATIC_COLORWAYS[cleanColor]) {
    return `/customize/tee-${cleanSide}.jpg?v=6`;
  }

  return `/customize/tee-${cleanSide}-${cleanColor}.jpg?v=6`;
}

// In-memory cache for dynamic colorization
const canvasColorCache = new Map();

/**
 * Parses hex into [r, g, b]
 */
function hexToRgb(hex) {
  if (!hex) return [128, 128, 128];
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return [128, 128, 128];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Look-up table generator for authentic textile color transitions
 */
function createColorLUT(colorId, customHex) {
  const lutR = new Uint8Array(256);
  const lutG = new Uint8Array(256);
  const lutB = new Uint8Array(256);
  const lutW = new Float32Array(256);

  for (let L = 0; L < 256; L++) {
    if (L <= 28) {
      lutW[L] = 0;
      continue;
    }

    const rawW = Math.min(1, Math.max(0, (L - 28) / (52 - 28)));
    lutW[L] = rawW * rawW * (3 - 2 * rawW);

    const t = Math.min(1, Math.max(0, (L - 40) / (240 - 40)));
    const factor = Math.pow(t, 1.15);
    const sheen = 45 * Math.pow(t, 3.0);
    let nr = 0, ng = 0, nb = 0;

    if (colorId === 'black') {
      const base = 15 + 16 * Math.pow(t, 1.2);
      const sh = 32 * Math.pow(t, 3.2);
      nr = base + sh;
      ng = base + sh;
      nb = base + 2 + sh * 1.05;
    } else if (colorId === 'charcoal') {
      nr = 20 + 35 * factor + sheen * 0.95;
      ng = 20 + 35 * factor + sheen * 0.95;
      nb = 22 + 37 * factor + sheen * 1.0;
    } else if (colorId === 'olive') {
      nr = 15 + 32 * factor + sheen * 0.8;
      ng = 22 + 48 * factor + sheen * 1.1;
      nb = 16 + 34 * factor + sheen * 0.85;
    } else if (colorId === 'forest') {
      nr = 12 + 22 * factor + sheen * 0.75;
      ng = 22 + 45 * factor + sheen * 1.1;
      nb = 15 + 26 * factor + sheen * 0.8;
    } else if (colorId === 'navy') {
      nr = 12 + 20 * factor + sheen * 0.7;
      ng = 16 + 28 * factor + sheen * 0.85;
      nb = 24 + 48 * factor + sheen * 1.15;
    } else if (colorId === 'coffee') {
      nr = 20 + 46 * factor + sheen * 1.1;
      ng = 14 + 32 * factor + sheen * 0.75;
      nb = 11 + 24 * factor + sheen * 0.6;
    } else if (colorId === 'terracotta') {
      nr = 35 + 95 * factor + sheen * 1.1;
      ng = 18 + 42 * factor + sheen * 0.8;
      nb = 14 + 30 * factor + sheen * 0.7;
    } else if (colorId === 'burgundy') {
      nr = 24 + 52 * factor + sheen * 1.05;
      ng = 12 + 16 * factor + sheen * 0.6;
      nb = 15 + 24 * factor + sheen * 0.7;
    } else if (colorId === 'beige') {
      const bFactor = Math.pow(t, 0.95);
      const bSheen = 40 * Math.pow(t, 2.5);
      nr = 60 + 130 * bFactor + bSheen;
      ng = 52 + 120 * bFactor + bSheen * 0.95;
      nb = 44 + 105 * bFactor + bSheen * 0.9;
    } else if (colorId === 'sage') {
      nr = 35 + 85 * factor + sheen * 0.95;
      ng = 42 + 98 * factor + sheen * 1.05;
      nb = 35 + 85 * factor + sheen * 0.95;
    } else if (colorId === 'grey') {
      const gFactor = Math.pow(t, 1.05);
      const gSheen = 50 * Math.pow(t, 2.8);
      nr = 28 + 90 * gFactor + gSheen;
      ng = 30 + 94 * gFactor + gSheen * 1.02;
      nb = 33 + 98 * gFactor + gSheen * 1.05;
    } else if (colorId === 'lavender') {
      nr = 35 + 85 * factor + sheen * 1.0;
      ng = 32 + 78 * factor + sheen * 0.95;
      nb = 44 + 102 * factor + sheen * 1.1;
    } else if (colorId === 'powderblue') {
      nr = 30 + 72 * factor + sheen * 0.9;
      ng = 38 + 92 * factor + sheen * 1.0;
      nb = 48 + 115 * factor + sheen * 1.15;
    } else if (customHex) {
      const [cr, cg, cb] = hexToRgb(customHex);
      nr = cr * 0.25 + cr * 0.85 * factor + sheen * 0.9;
      ng = cg * 0.25 + cg * 0.85 * factor + sheen * 0.9;
      nb = cb * 0.25 + cb * 0.85 * factor + sheen * 0.9;
    }

    lutR[L] = Math.min(255, Math.max(0, Math.round(nr)));
    lutG[L] = Math.min(255, Math.max(0, Math.round(ng)));
    lutB[L] = Math.min(255, Math.max(0, Math.round(nb)));
  }

  return { lutR, lutG, lutB, lutW };
}

/**
 * Dynamically dyes an image via offscreen canvas with caching.
 */
export async function getDynamicGarmentImage(imageSrc, colorId, customHex) {
  if (!colorId || colorId === 'offwhite') return imageSrc;

  const cacheKey = `${imageSrc}__${colorId}__${customHex || ''}`;
  if (canvasColorCache.has(cacheKey)) {
    return canvasColorCache.get(cacheKey);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 819;
        canvas.height = img.naturalHeight || 1024;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const len = data.length;

        const { lutR, lutG, lutB, lutW } = createColorLUT(colorId, customHex);

        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const L = (r * 77 + g * 150 + b * 29) >> 8;
          const w = lutW[L];
          if (w > 0) {
            if (w >= 1) {
              data[i] = lutR[L];
              data[i + 1] = lutG[L];
              data[i + 2] = lutB[L];
            } else {
              data[i] = (r * (1 - w) + lutR[L] * w) | 0;
              data[i + 1] = (g * (1 - w) + lutG[L] * w) | 0;
              data[i + 2] = (b * (1 - w) + lutB[L] * w) | 0;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
        canvasColorCache.set(cacheKey, dataUrl);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas dynamic tint fallback failed, using original', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

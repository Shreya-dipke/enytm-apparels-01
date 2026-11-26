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
  olive: true,
  coffee: true,
  beige: true,
  grey: true,
};

/**
 * Returns the exact real photographic asset path for a garment side and colorway.
 * @param {'front' | 'back' | 'left' | 'right'} side 
 * @param {string} colorId ('offwhite' | 'black' | 'olive' | 'coffee' | 'beige' | 'grey')
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
 * Look-up table generator for color transitions
 */
function createColorLUT(colorId) {
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
    let nr = 0, ng = 0, nb = 0;

    if (colorId === 'black') {
      const base = 15 + 16 * Math.pow(t, 1.2);
      const sheen = 32 * Math.pow(t, 3.2);
      nr = base + sheen;
      ng = base + sheen;
      nb = base + 2 + sheen * 1.05;
    } else if (colorId === 'olive') {
      const factor = Math.pow(t, 1.15);
      const sheen = 45 * Math.pow(t, 3.0);
      nr = 15 + 32 * factor + sheen * 0.8;
      ng = 22 + 48 * factor + sheen * 1.1;
      nb = 16 + 34 * factor + sheen * 0.85;
    } else if (colorId === 'coffee') {
      const factor = Math.pow(t, 1.15);
      const sheen = 50 * Math.pow(t, 3.0);
      nr = 20 + 46 * factor + sheen * 1.1;
      ng = 14 + 32 * factor + sheen * 0.75;
      nb = 11 + 24 * factor + sheen * 0.6;
    } else if (colorId === 'beige') {
      const factor = Math.pow(t, 0.95);
      const sheen = 40 * Math.pow(t, 2.5);
      nr = 60 + 130 * factor + sheen;
      ng = 52 + 120 * factor + sheen * 0.95;
      nb = 44 + 105 * factor + sheen * 0.9;
    } else if (colorId === 'grey') {
      const factor = Math.pow(t, 1.05);
      const sheen = 50 * Math.pow(t, 2.8);
      nr = 28 + 90 * factor + sheen;
      ng = 30 + 94 * factor + sheen * 1.02;
      nb = 33 + 98 * factor + sheen * 1.05;
    }

    lutR[L] = Math.min(255, Math.max(0, Math.round(nr)));
    lutG[L] = Math.min(255, Math.max(0, Math.round(ng)));
    lutB[L] = Math.min(255, Math.max(0, Math.round(nb)));
  }

  return { lutR, lutG, lutB, lutW };
}

/**
 * Dynamically dyes an image via offscreen canvas if needed.
 */
export async function getDynamicGarmentImage(imageSrc, colorId) {
  if (!colorId || colorId === 'offwhite') return imageSrc;

  const cacheKey = `${imageSrc}__${colorId}`;
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

        const { lutR, lutG, lutB, lutW } = createColorLUT(colorId);

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

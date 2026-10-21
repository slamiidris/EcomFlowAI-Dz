/**
 * The prompt of the photo studio when the seller gives their product photo: the image model stages that exact product
 * (same shape, colours, logo and printed text) in the chosen style, so the picture shows what the buyer will receive.
 * It writes no words, prices or logos of its own.
 */
export type PhotoStyle = 'lifestyle' | 'minimalist' | 'high-tech' | 'creative';

const SCENES: Record<PhotoStyle, string> = {
  lifestyle: 'in use in a real everyday setting that suits it (a home, a street or a workplace in Algeria), natural light; a person may use it, but the product stays the clear subject',
  minimalist: 'alone on a clean light background with a soft shadow, soft even studio light, nothing else in the frame',
  'high-tech': 'in a high-end studio: dark elegant background, controlled reflections, rich textures, dramatic light',
  creative: 'in a bold, colourful composition with vivid complementary colours and graphic shapes that catch the eye',
};

// quotes and line breaks would break the prompt's sentences; a long text would drown the instructions
const clean = (text: string) => text.replace(/["«»“”\n\r]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120).trim();

/**
 * Without the seller's photo, for a service other than Gemini: a product imagined from its name (the page tells the
 * seller it may not look like theirs). Gemini keeps its own prompt (generateProductImage).
 */
export function imaginedProductPrompt({ name, style, aspectRatio }: { name: string; style: PhotoStyle; aspectRatio: string }): string {
  return [
    `A professional e-commerce photo of ${clean(name) || 'a product'}.`,
    `Scene: the product ${SCENES[style]}.`,
    `Composition made for a ${aspectRatio} picture, with the product sharp, well lit and fully visible.`,
    'No added text, letters, prices, logos, watermark or frame.',
  ].join('\n');
}

export function productPhotoPrompt({ name, style, aspectRatio }: { name: string; style: PhotoStyle; aspectRatio: string }): string {
  const product = clean(name);
  return [
    `A professional e-commerce photo of the exact product shown in the reference photo${product ? ` (${product})` : ''}.`,
    'Keep the product exactly as it is: same shape, colours, materials, proportions, logo and printed text. Do not redesign it, replace it or add other products.',
    `Scene: the product ${SCENES[style]}.`,
    `Composition made for a ${aspectRatio} picture, with the product sharp, well lit and fully visible.`,
    'No added text, letters, prices, logos, watermark or frame.',
  ].join('\n');
}

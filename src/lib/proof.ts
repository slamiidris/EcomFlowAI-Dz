import { useEffect, useRef, useState } from 'react';

export const isImageProof = (dataUrl?: string | null) => !!dataUrl?.startsWith('data:image');
export const isPdfProof = (dataUrl?: string | null) => !!dataUrl?.startsWith('data:application/pdf');

/** Decodes a base64 data URL into a Blob (used to build a renderable object URL). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const mime = dataUrl.slice(5, comma).split(';')[0] || 'application/octet-stream';
  const bin = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Converts a payment-proof data URL (image or PDF) into a `blob:` object URL.
 *
 * Why: browsers block `data:` URLs for PDFs inside <iframe> (and as top-level
 * navigation), so a stored `data:application/pdf;base64,…` proof shows up
 * blank. A `blob:` URL renders reliably in both Chrome and Firefox — for
 * images via <img> and for PDFs via the built-in PDF viewer in an <iframe>.
 */
export function useBlobUrl(dataUrl: string | null | undefined): string | null {
  const urlRef = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!dataUrl) {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
      setUrl(null);
      return;
    }
    let blobUrl: string;
    try {
      blobUrl = URL.createObjectURL(dataUrlToBlob(dataUrl));
    } catch {
      setUrl(dataUrl); // fall back to the raw data URL (still fine for <img>)
      return;
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = blobUrl;
    setUrl(blobUrl);
  }, [dataUrl]);

  // Revoke the latest object URL on unmount.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    };
  }, []);

  return url;
}

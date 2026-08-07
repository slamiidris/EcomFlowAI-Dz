export type HistoryType = 'script' | 'image' | 'landing_page';

export interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  timestamp: number;
  previewText?: string;
  payload: any;
  metadata?: {
    productName?: string;
    style?: string;
    aspectRatio?: string;
    videoType?: string;
    videoDuration?: string;
    brand?: string;
    category?: string;
    [key: string]: any;
  };
}

const LOCAL_STORAGE_KEY = 'dzads_generation_history';

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse generation history', e);
    return [];
  }
}

export function addToHistory(
  type: HistoryType,
  title: string,
  payload: any,
  previewText?: string,
  metadata?: any
): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const history = getHistory();
  
  const newItem: HistoryItem = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    title: title || 'Sans Titre',
    timestamp: Date.now(),
    previewText,
    payload,
    metadata,
  };

  // Keep only the 10 latest entries
  const updated = [newItem, ...history].slice(0, 10);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  
  // Notify any listeners
  window.dispatchEvent(new CustomEvent('dzads_history_updated', { detail: updated }));
  return updated;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('dzads_history_updated', { detail: updated }));
  return updated;
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('dzads_history_updated', { detail: [] }));
}

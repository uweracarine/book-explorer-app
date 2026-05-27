
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('[storage] Could not save to localStorage:', err);
  }
}

export function getFromStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}
